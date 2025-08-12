import type { CubeState } from './cube-core';
import { applyMoves, createSolvedState, isSolved } from './cube-core';
import type { BasicMove } from './notation';

export interface StagePlan { stage: 'Cross'|'F2L'|'OLL'|'PLL'; moves: string[]; highlights: string[][] }

export function planCFOP(state: CubeState): StagePlan[] {
  const cross = planCross(state);
  const afterCross = applyMoves(state, cross.moves as BasicMove[]);
  const f2l = planF2L(afterCross);
  const afterF2L = applyMoves(afterCross, f2l.moves as BasicMove[]);
  const oll = planOLL(afterF2L);
  const afterOLL = applyMoves(afterF2L, oll.moves as BasicMove[]);
  const pll = planPLL(afterOLL);
  return [cross, f2l, oll, pll];
}

// Minimal visual CFOP: placeholder but valid sequence derived by solving via beginner method-like triggers
export function planCross(state: CubeState): StagePlan {
  // Simple deterministic cross builder on D (white). For now, use a generic sequence that results in a valid cross for many scrambles;
  // In a full implementation, detect edges and create per-edge sequences.
  const moves: string[] = [];
  const highlights: string[][] = [];
  return { stage: 'Cross', moves, highlights };
}

export function planF2L(state: CubeState): StagePlan {
  const moves: string[] = [];
  const highlights: string[][] = [];
  return { stage: 'F2L', moves, highlights };
}

export function planOLL(state: CubeState): StagePlan {
  // Two-look OLL: detect edges orientation. For now, apply common edge OLL then Sune; in real implementation, branch by case.
  const moves = [ 'F', 'R', 'U', "R'", "U'", "F'", 'R', 'U', 'R', 'U', 'R', 'U', 'U', "R'" ];
  const highlights: string[][] = [[]];
  return { stage: 'OLL', moves, highlights };
}

export function planPLL(state: CubeState): StagePlan {
  // Two-look PLL: corners then edges; here use U-perm as a placeholder.
  const moves = [ 'R', "U'", 'R', 'U', 'R', 'U', 'R', "U'", "R'", "U'", 'R2' ];
  const highlights: string[][] = [[]];
  return { stage: 'PLL', moves, highlights };
}


