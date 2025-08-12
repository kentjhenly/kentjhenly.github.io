import type { CubeState, Cubie, FaceKey } from './cube-core';
import { applyMove, applyMoves, isCrossSolved, isFirstTwoLayersSolved, isOLLSolved, SOLVED_COLORS } from './cube-core';
import { parseMoves, simplifyMoves, type BasicMove } from './notation';

export type Stage = 'Cross'|'F2L'|'OLL'|'PLL';

export interface StageStep {
  alg: string[];
  label?: string;
  highlightCubies?: string[];
}

export interface StagePlan { stage: Stage; steps: StageStep[] }

export interface CFOPPlan { stages: StagePlan[]; moves: string[] }

// Third-party minimal solver adapter (using vendored cubejs lib files)
// We import the CommonJS bundles via require using a type-ignored dynamic import signature

function toFacelets(state: CubeState): string {
  // Map our state into Singmaster facelets in URFDLB order (each face 9 chars)
  // Colors letters must match U=U, R=R, F=F, D=D, L=L, B=B expected by solver.
  // We'll convert our colors W,Y,O,R,G,B to face letters by sampling centers.
  // Build a 3x3 grid per face by finding stickers on that face coordinates.
  const faces: FaceKey[] = ['U','R','F','D','L','B'];
  const faceStr: Record<FaceKey,string> = {U:'',R:'',F:'',D:'',L:'',B:''};
  const faceOrderCoords: Record<FaceKey, { x: number; y: number; z: number }[]> = {
    U: [...Array(9)].map((_,i)=>({ x: (i%3)-1, y: 1, z: Math.floor(i/3)-1 })),
    R: [...Array(9)].map((_,i)=>({ x: 1, y: 1- Math.floor(i/3), z: (i%3)-1 })),
    F: [...Array(9)].map((_,i)=>({ x: (i%3)-1, y: 1- Math.floor(i/3), z: 1 })),
    D: [...Array(9)].map((_,i)=>({ x: (i%3)-1, y: -1, z: 1- Math.floor(i/3) })),
    L: [...Array(9)].map((_,i)=>({ x: -1, y: 1- Math.floor(i/3), z: 1- (i%3) })),
    B: [...Array(9)].map((_,i)=>({ x: -((i%3)-1), y: 1- Math.floor(i/3), z: -1 })),
  } as any;
  const colorToLetter: Record<string,string> = { W:'U', Y:'D', R:'R', O:'L', G:'F', B:'B' };
  for (const f of faces) {
    const coords = faceOrderCoords[f];
    for (const c of coords) {
      const cubie = state.cubies.find(q => q.pos.x===c.x && q.pos.y===c.y && q.pos.z===c.z);
      if (!cubie) { faceStr[f] += f; continue; }
      const col = cubie.faceColors[f as FaceKey];
      const letter = col ? colorToLetter[col] ?? f : f;
      faceStr[f] += letter;
    }
  }
  return faces.map(f=>faceStr[f]).join('');
}

function fromSolutionString(sol: string): string[] {
  return parseMoves(sol);
}

function changedCubies(before: CubeState, after: CubeState): string[] {
  const out: string[] = [];
  const map = new Map(before.cubies.map(c => [c.id, c] as const));
  for (const ac of after.cubies) {
    const bc = map.get(ac.id)!;
    if (bc.pos.x !== ac.pos.x || bc.pos.y !== ac.pos.y || bc.pos.z !== ac.pos.z) out.push(ac.id);
  }
  return out;
}

export function planCFOP(initial: CubeState): CFOPPlan {
  const facelets = toFacelets(initial);
  // Prefer vendored cubejs: we import solve logic from local files
  // @ts-ignore
  const solveJs = require('./thirdparty/cubejs-solve.js');
  // @ts-ignore
  const cubeJs = require('./thirdparty/cubejs-cube.js');
  // cubejs exports commonjs; use its solve function via global if needed
  const solver: any = (solveJs && (solveJs as any).solve) ? solveJs : (globalThis as any).cubejs || solveJs;
  const solutionStr: string = (solver.solve ? solver.solve : solver)(facelets);
  const allMoves = fromSolutionString(solutionStr);

  // Simulate and segment
  const stages: StagePlan[] = [];
  const makeStage = (stage: Stage): StagePlan => ({ stage, steps: [] });
  let stage: StagePlan = makeStage('Cross');
  let accState: CubeState = { cubies: initial.cubies.map(c=>({ id:c.id, pos:{...c.pos}, faceColors: { ...c.faceColors }})) };

  const pushStep = (label: string, alg: string[], highlight: string[]) => {
    stage.steps.push({ label, alg, highlightCubies: highlight });
  };

  for (const m of allMoves) {
    const before = accState;
    const after = applyMove(accState, m as BasicMove);
    accState = after;
    const delta = changedCubies(before, after);
    // decide label by current stage
    let label = '';
    if (stage.stage === 'Cross') label = 'Cross: insert edge';
    else if (stage.stage === 'F2L') label = 'F2L: pair/insert';
    else if (stage.stage === 'OLL') label = 'OLL: orient';
    else label = 'PLL: permute';
    pushStep(label, [m], delta);
    // check stage boundaries after applying move
    if (stage.stage === 'Cross' && isCrossSolved(accState)) {
      stages.push(stage);
      stage = makeStage('F2L');
    } else if (stage.stage === 'F2L' && isFirstTwoLayersSolved(accState)) {
      stages.push(stage);
      stage = makeStage('OLL');
    } else if (stage.stage === 'OLL' && isOLLSolved(accState)) {
      stages.push(stage);
      stage = makeStage('PLL');
    }
  }
  // push final stage if not empty
  if (stage.steps.length > 0) stages.push(stage);

  // simplify per stage
  const simplified = stages.map(sp => ({
    stage: sp.stage,
    steps: sp.steps.map(st => ({ ...st, alg: simplifyMoves(st.alg) }))
  }));
  const flatMoves = simplified.flatMap(sp => sp.steps.flatMap(s => s.alg));
  return { stages: simplified, moves: flatMoves };
}

// The following stage-specific planners are not used when third-party solver is active,
// but kept exported to preserve API compatibility for future homegrown CFOP.
export function planCross(state: CubeState): StagePlan { return { stage: 'Cross', steps: [] }; }
export function planF2L(state: CubeState): StagePlan { return { stage: 'F2L', steps: [] }; }
export function planOLL(state: CubeState): StagePlan { return { stage: 'OLL', steps: [] }; }
export function planPLL(state: CubeState): StagePlan { return { stage: 'PLL', steps: [] }; }


