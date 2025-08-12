import type { CubeState, Cubie, FaceKey, Color } from './cube-core';
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

// ===== Helpers for stage-aware highlights =====

function isEdge(c: Cubie): boolean { return Object.keys(c.faceColors).length === 2; }
function isCorner(c: Cubie): boolean { return Object.keys(c.faceColors).length === 3; }
function hasColor(c: Cubie, color: Color): boolean { return Object.values(c.faceColors).includes(color); }

const FACE_FROM_COLOR: Record<Color, FaceKey> = {
  W: 'U', Y: 'D', O: 'L', R: 'R', G: 'F', B: 'B'
};

function getWhiteEdges(state: CubeState): Cubie[] {
  return state.cubies.filter(c => isEdge(c) && hasColor(c, 'W'));
}

function findEdgeByColors(state: CubeState, a: Color, b: Color): Cubie | undefined {
  return state.cubies.find(c => isEdge(c) && hasColor(c, a) && hasColor(c, b));
}

function findCornerByColors(state: CubeState, a: Color, b: Color, c: Color): Cubie | undefined {
  return state.cubies.find(x => isCorner(x) && hasColor(x, a) && hasColor(x, b) && hasColor(x, c));
}

function getCrossTargetEdge(state: CubeState, side: 'F'|'R'|'B'|'L'): Cubie | undefined {
  const sideColor = SOLVED_COLORS[side];
  return findEdgeByColors(state, 'W', sideColor);
}

function isWhiteCrossEdgeSolved(state: CubeState, edge: Cubie): boolean {
  if (!isEdge(edge) || !hasColor(edge,'W')) return false;
  // White must be on D face
  if (edge.faceColors.D !== 'W') return false;
  // Other sticker must match its side center
  const sideKeys: FaceKey[] = ['F','R','B','L'];
  for (const k of sideKeys) {
    if (edge.faceColors[k] && edge.faceColors[k] === SOLVED_COLORS[k]) return true;
  }
  return false;
}

function getF2LSlotColors(slot: 'FR'|'FL'|'BR'|'BL'): [Color, Color] {
  switch (slot) {
    case 'FR': return ['G','R'];
    case 'FL': return ['G','O'];
    case 'BR': return ['B','R'];
    case 'BL': return ['B','O'];
  }
}

function whichF2LSlot(edge: Cubie, corner: Cubie): 'FR'|'FL'|'BR'|'BL'|undefined {
  const cornerColors = Object.values(corner.faceColors).filter(c => c !== 'W') as Color[];
  const edgeColors = Object.values(edge.faceColors) as Color[];
  const colors = new Set<Color>([...cornerColors, ...edgeColors].filter(c => c !== 'W'));
  const has = (c: Color) => colors.has(c);
  if (has('G') && has('R')) return 'FR';
  if (has('G') && has('O')) return 'FL';
  if (has('B') && has('R')) return 'BR';
  if (has('B') && has('O')) return 'BL';
  return undefined;
}

function isCubieSolved(c: Cubie): boolean {
  for (const k of Object.keys(c.faceColors) as FaceKey[]) {
    if (c.faceColors[k] !== SOLVED_COLORS[k]) return false;
  }
  return true;
}

function isF2LPairSolved(state: CubeState, slot: 'FR'|'FL'|'BR'|'BL'): boolean {
  const [c1,c2] = getF2LSlotColors(slot);
  const edge = findEdgeByColors(state, c1, c2);
  const corner = findCornerByColors(state, 'W', c1, c2);
  if (!edge || !corner) return false;
  return isCubieSolved(edge) && isCubieSolved(corner);
}

function uLayerCubies(state: CubeState): Cubie[] {
  return state.cubies.filter(c => c.pos.y === 1);
}

function stickerOrientationOnU(state: CubeState, cubie: Cubie): 'oriented'|'misoriented'|undefined {
  if (cubie.pos.y !== 1) return undefined;
  if (!('U' in cubie.faceColors)) return undefined;
  return cubie.faceColors.U === SOLVED_COLORS.U ? 'oriented' : 'misoriented';
}

function manhattan(a: {x:number;y:number;z:number}, b: {x:number;y:number;z:number}) { return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(a.z-b.z); }

function crossTargetPosForEdge(edge: Cubie): { x: number; y: number; z: number } | undefined {
  // choose side face by non-white color of this edge
  const colors = Object.values(edge.faceColors) as Color[];
  const sideColor = colors.find(c => c !== 'W');
  if (!sideColor) return undefined;
  const side = FACE_FROM_COLOR[sideColor];
  switch (side) {
    case 'F': return { x: 0, y: -1, z: 1 };
    case 'B': return { x: 0, y: -1, z: -1 };
    case 'R': return { x: 1, y: -1, z: 0 };
    case 'L': return { x: -1, y: -1, z: 0 };
  }
  return undefined;
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
    let highlight: string[] = [];
    let label = '';
    if (stage.stage === 'Cross') {
      const whiteEdgesBefore = getWhiteEdges(before);
      const unsolvedBefore = whiteEdgesBefore.filter(e=>!isWhiteCrossEdgeSolved(before, e));
      const whiteEdgesAfter = getWhiteEdges(after);
      const newlySolved = whiteEdgesAfter.filter(e => {
        const prev = before.cubies.find(c=>c.id===e.id)!;
        return !isWhiteCrossEdgeSolved(before, prev) && isWhiteCrossEdgeSolved(after, e);
      });
      if (newlySolved.length > 0) {
        const e = newlySolved.sort((a,b)=>a.id.localeCompare(b.id))[0];
        highlight = [e.id];
        const sideColor = (Object.values(e.faceColors).find(c=>c!=='W') as Color) || 'G';
        label = `Cross: place ${sideColor} edge`;
      } else {
        // choose unsolved edge that moved closer to its target
        const changed = changedCubies(before, after);
        const candidates = unsolvedBefore.filter(e=>changed.includes(e.id));
        let best: { id: string; d: number } | null = null;
        for (const e of candidates) {
          const t = crossTargetPosForEdge(e);
          if (!t) continue;
          const prev = before.cubies.find(c=>c.id===e.id)!;
          const nxt = after.cubies.find(c=>c.id===e.id)!;
          const dPrev = manhattan(prev.pos, t);
          const dNext = manhattan(nxt.pos, t);
          if (dNext < dPrev) {
            const val = { id: e.id, d: dNext };
            if (!best || dNext < best.d || (dNext===best.d && e.id.localeCompare(best.id)<0)) best = val as any;
          }
        }
        if (best) highlight = [best.id];
        label = 'Cross: setup';
      }
    } else if (stage.stage === 'F2L') {
      const order: ('FR'|'FL'|'BR'|'BL')[] = ['FR','FL','BR','BL'];
      const became: ('FR'|'FL'|'BR'|'BL')[] = order.filter(s=>!isF2LPairSolved(before,s) && isF2LPairSolved(after,s));
      const active = became[0] ?? order.find(s=>!isF2LPairSolved(after,s)) ?? 'FR';
      const [c1,c2] = getF2LSlotColors(active);
      const edge = findEdgeByColors(before, c1, c2);
      const corner = findCornerByColors(before, 'W', c1, c2);
      if (edge && corner) highlight = [corner.id, edge.id];
      else {
        const changed = new Set(changedCubies(before, after));
        highlight = after.cubies.filter(c=>changed.has(c.id) && (c.pos.y!==1)).map(c=>c.id).slice(0,2);
      }
      label = `F2L: ${active} pair${became.length>0?' (insert)':' (setup)'}`;
    } else if (stage.stage === 'OLL') {
      const uPrev = uLayerCubies(before);
      const uNext = uLayerCubies(after);
      const highlightSet = new Set<string>();
      for (const c of uPrev) {
        const next = uNext.find(x=>x.id===c.id);
        const a = stickerOrientationOnU(before, c);
        const b = next ? stickerOrientationOnU(after, next) : undefined;
        if (a !== b && (a || b)) highlightSet.add(c.id);
      }
      highlight = Array.from(highlightSet);
      if (highlight.length===0) {
        const changed = new Set(changedCubies(before, after));
        highlight = uNext.filter(c=>changed.has(c.id)).map(c=>c.id);
      }
      label = 'OLL step';
    } else {
      // PLL
      const uPrev = uLayerCubies(before);
      const uNext = uLayerCubies(after);
      const moved: string[] = [];
      for (const c of uPrev) {
        const n = uNext.find(x=>x.id===c.id);
        if (!n) continue;
        if (n.pos.x!==c.pos.x || n.pos.z!==c.pos.z) moved.push(c.id);
      }
      highlight = moved;
      label = 'PLL step';
    }
    pushStep(label, [m], highlight);
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


