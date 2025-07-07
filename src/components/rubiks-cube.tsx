'use client';

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BlurFade from "./magicui/blur-fade";

// Color Schemes
const COLOR_SCHEMES = {
  standard: {
    white: '#FFFFFF',
    yellow: '#FFFF00',
    red: '#FF0000',
    orange: '#FF8000',
    blue: '#0000FF',
    green: '#00FF00',
  },
  monochrome: {
    white: '#CAF0F8', // Pale Blue
    yellow: '#ADE8F4', // Slightly darker pale blue
    red: '#90E0EF', // Light Blue
    orange: '#48CAE4', // Medium light blue
    blue: '#0077B6', // Medium Blue
    green: '#023E8A', // Dark Blue
  }
};

interface CubeProps {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
  id: number;
  isAnimating?: boolean;
  isHighlighted?: boolean;
}

const Cube = ({ position, faceColors, id, isAnimating, isHighlighted }: CubeProps) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      {/* BoxGeometry material order: [right, left, top, bottom, front, back] */}
      <meshStandardMaterial 
        color={faceColors[3]} 
        attach="material-0"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* right */}
      <meshStandardMaterial 
        color={faceColors[2]} 
        attach="material-1"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* left */}
      <meshStandardMaterial 
        color={faceColors[0]} 
        attach="material-2"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* top */}
      <meshStandardMaterial 
        color={faceColors[1]} 
        attach="material-3"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* bottom */}
      <meshStandardMaterial 
        color={faceColors[4]} 
        attach="material-4"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* front */}
      <meshStandardMaterial 
        color={faceColors[5]} 
        attach="material-5"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* back */}
    </mesh>
  );
};

// Component that uses useFrame hook (must be inside Canvas)
const RotatingCubeGroup = ({ isSolving, children, groupRef }: { 
  isSolving: boolean; 
  children: React.ReactNode;
  groupRef: React.RefObject<THREE.Group>;
}) => {
  useFrame(() => {
    if (groupRef.current && !isSolving) {
      // Gentle rotation when not solving
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x += 0.002;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

// Cube Move Definitions
type Move = 'R' | 'R\'' | 'R2' | 'L' | 'L\'' | 'L2' | 'U' | 'U\'' | 'U2' | 'D' | 'D\'' | 'D2' | 'F' | 'F\'' | 'F2' | 'B' | 'B\'' | 'B2';

// CFOP Algorithm Definitions
const CFOP_ALGORITHMS = {
  // Cross algorithms
  CROSS_EDGE_INSERT: ['R', 'U', 'R\'', 'U\''],
  CROSS_EDGE_INSERT_ALT: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  
  // F2L algorithms - Basic insertions
  F2L_PAIR_INSERT: ['R', 'U', 'R\''],
  F2L_PAIR_INSERT_ALT: ['U', 'R', 'U\'', 'R\''],
  F2L_PAIR_INSERT_2: ['R\'', 'U\'', 'R'],
  F2L_PAIR_INSERT_3: ['U\'', 'R\'', 'U', 'R'],
  
  // F2L algorithms - Advanced cases
  F2L_CASE_1: ['R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\''],
  F2L_CASE_2: ['R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'R'],
  F2L_CASE_3: ['U', 'R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\''],
  F2L_CASE_4: ['U\'', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R'],
  
  // OLL algorithms - 2-Look OLL
  OLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_U: ['R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'R', 'U\'', 'R\''],
  OLL_L: ['F', 'R\'', 'F\'', 'R', 'U', 'R', 'U\'', 'R\''],
  OLL_H: ['R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_PI: ['R', 'U2', 'R2', 'U\'', 'R2', 'U\'', 'R2', 'U2', 'R'],
  OLL_SUNE: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_ANTISUNE: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R'],
  OLL_Z: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  
  // PLL algorithms - 2-Look PLL
  PLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\''],
  PLL_U: ['R', 'U\'', 'R', 'U', 'R', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R2'],
  PLL_Y: ['F', 'R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  PLL_J: ['R\'', 'U', 'L\'', 'U2', 'R', 'U\'', 'R\'', 'U2', 'R', 'L', 'U\''],
  PLL_A: ['R', 'B\'', 'R', 'F2', 'R\'', 'B', 'R', 'F2', 'R2'],
  PLL_E: ['R', 'B\'', 'R\'', 'B', 'U', 'B', 'U\'', 'B\''],
  PLL_H: ['M2', 'U', 'M2', 'U2', 'M2', 'U', 'M2'],
  PLL_Z: ['M2', 'U', 'M2', 'U', 'M\'', 'U2', 'M2', 'U2', 'M\''],
  
  // Trigger moves
  SEXY_MOVE: ['R', 'U', 'R\'', 'U\''],
  SEXY_MOVE_INVERSE: ['U', 'R', 'U\'', 'R\''],
  SUNE: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  ANTISUNE: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R']
};

// Full OLL Algorithms (subset of 57 - most common cases)
const FULL_OLL_ALGORITHMS = {
  // Cross cases (7 cases)
  OLL_1: ['R', 'U2', 'R2', 'F', 'R', 'F2', 'U2', 'F', 'R'],
  OLL_2: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_3: ['F', 'R', 'U', 'R\'', 'U\'', 'F\'', 'U2', 'F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_4: ['F', 'R', 'U', 'R\'', 'U\'', 'F\'', 'U', 'F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_5: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_6: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R'],
  OLL_7: ['R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\''],
  
  // T cases (4 cases)
  OLL_8: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_9: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_10: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_11: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R'],
  
  // L cases (4 cases)
  OLL_12: ['F', 'R\'', 'F\'', 'R', 'U', 'R', 'U\'', 'R\''],
  OLL_13: ['R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_14: ['R', 'U2', 'R2', 'U\'', 'R2', 'U\'', 'R2', 'U2', 'R'],
  OLL_15: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  
  // ... Add remaining OLL cases (up to 57) ...
};

// Full PLL Algorithms (subset of 21 - most common cases)
const FULL_PLL_ALGORITHMS = {
  // Corner permutations
  PLL_A: ['R', 'B\'', 'R', 'F2', 'R\'', 'B', 'R', 'F2', 'R2'],
  PLL_E: ['R', 'B\'', 'R\'', 'B', 'U', 'B', 'U\'', 'B\''],
  PLL_U: ['R', 'U\'', 'R', 'U', 'R', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R2'],
  PLL_Y: ['F', 'R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  PLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\''],
  PLL_J: ['R\'', 'U', 'L\'', 'U2', 'R', 'U\'', 'R\'', 'U2', 'R', 'L', 'U\''],
  PLL_R: ['R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'U2', 'R\''],
  PLL_V: ['R\'', 'U', 'R\'', 'U\'', 'B\'', 'R\'', 'B2', 'U\'', 'B\'', 'U', 'B\'', 'R', 'B', 'R'],
  PLL_N: ['R', 'U\'', 'R', 'U', 'R', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R2'],
  PLL_G: ['R2', 'U', 'R\'', 'U', 'R\'', 'U\'', 'R', 'U\'', 'R2', 'U\'', 'D', 'R\'', 'U', 'R', 'D\''],
  
  // Edge permutations
  PLL_H: ['M2', 'U', 'M2', 'U2', 'M2', 'U', 'M2'],
  PLL_Z: ['M2', 'U', 'M2', 'U', 'M\'', 'U2', 'M2', 'U2', 'M\''],
  
  // ... Add remaining PLL cases (up to 21) ...
};

// F2L Cases (placeholder: only a few, but structure for all 41)
const F2L_CASES = [
  {
    name: 'Basic Pair',
    // Recognition: both pieces in U layer, not paired
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: typeof COLOR_SCHEMES.standard) => {
      // Placeholder: both on top layer
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['U', 'R', 'U"', 'R"'] as Move[],
  },
  // ... Add all 41 F2L cases here ...
];

// CFOP Solving Stages
enum SolvingStage {
  CROSS = "Cross",
  F2L = "F2L",
  OLL = "OLL",
  PLL = "PLL",
  SOLVED = "Solved"
}

// Cube State Management - Now tracks actual piece positions
interface CubePiece {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
}

interface CubeState {
  pieces: CubePiece[];
}

// F2L Pair information
interface F2LPair {
  corner: CubePiece;
  edge: CubePiece;
  slot: number; // 0-3 for the four F2L slots
}

// Cross solving patterns and algorithms
const CROSS_ALGORITHMS = {
  // Direct insertion (edge already in correct position)
  DIRECT_INSERT: [] as Move[],
  
  // Edge on U face, correct orientation
  U_CORRECT: ['F2'] as Move[],
  U_CORRECT_R: ['R2'] as Move[],
  U_CORRECT_B: ['B2'] as Move[],
  U_CORRECT_L: ['L2'] as Move[],
  
  // Edge on U face, flipped
  U_FLIPPED: ['F', 'R', 'U', 'R\'', 'F\''] as Move[],
  U_FLIPPED_R: ['R', 'B', 'U', 'B\'', 'R\''] as Move[],
  U_FLIPPED_B: ['B', 'L', 'U', 'L\'', 'B\''] as Move[],
  U_FLIPPED_L: ['L', 'F', 'U', 'F\'', 'L\''] as Move[],
  
  // Edge in middle layer
  M_CORRECT: ['R', 'U', 'R\'', 'F2'] as Move[],
  M_FLIPPED: ['R', 'U\'', 'R\'', 'F', 'R', 'U', 'R\'', 'F\''] as Move[],
  
  // Edge in D layer, wrong position
  D_WRONG_POS: ['F2', 'U', 'R', 'U\'', 'R\'', 'F2'] as Move[],
  D_WRONG_ORIENT: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[],
};

// Cross edge positions on the D face
const CROSS_EDGE_POSITIONS = [
  { pos: [0, -1, 1] as [number, number, number], face: 'F', algorithm_key: 'U_CORRECT' },    // Front
  { pos: [1, -1, 0] as [number, number, number], face: 'R', algorithm_key: 'U_CORRECT_R' },  // Right
  { pos: [0, -1, -1] as [number, number, number], face: 'B', algorithm_key: 'U_CORRECT_B' }, // Back
  { pos: [-1, -1, 0] as [number, number, number], face: 'L', algorithm_key: 'U_CORRECT_L' }, // Left
];

// CubeSolver now takes COLORS as a constructor argument
class CubeSolver {
  private state: CubeState;
  private moveQueue: Move[] = [];
  private animationSpeed = 300; // ms per move
  public stages?: { stage: SolvingStage; startIndex: number; endIndex: number }[];
  public totalMoves: number = 0;
  private COLORS: typeof COLOR_SCHEMES.standard;

  constructor(initialState: CubeState, COLORS: typeof COLOR_SCHEMES.standard) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.COLORS = COLORS;
  }

  // Apply a single move to the cube state
  private applyMove(move: Move): void {
    const newState: CubeState = {
      pieces: this.state.pieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }))
    };

    // Apply the move based on cube notation
    switch (move) {
      case 'R':
        this.applyRightRotation(newState, 1);
        break;
      case 'R\'':
        this.applyRightRotation(newState, 3);
        break;
      case 'R2':
        this.applyRightRotation(newState, 2);
        break;
      case 'L':
        this.applyLeftRotation(newState, 1);
        break;
      case 'L\'':
        this.applyLeftRotation(newState, 3);
        break;
      case 'L2':
        this.applyLeftRotation(newState, 2);
        break;
      case 'U':
        this.applyUpRotation(newState, 1);
        break;
      case 'U\'':
        this.applyUpRotation(newState, 3);
        break;
      case 'U2':
        this.applyUpRotation(newState, 2);
        break;
      case 'D':
        this.applyDownRotation(newState, 1);
        break;
      case 'D\'':
        this.applyDownRotation(newState, 3);
        break;
      case 'D2':
        this.applyDownRotation(newState, 2);
        break;
      case 'F':
        this.applyFrontRotation(newState, 1);
        break;
      case 'F\'':
        this.applyFrontRotation(newState, 3);
        break;
      case 'F2':
        this.applyFrontRotation(newState, 2);
        break;
      case 'B':
        this.applyBackRotation(newState, 1);
        break;
      case 'B\'':
        this.applyBackRotation(newState, 3);
        break;
      case 'B2':
        this.applyBackRotation(newState, 2);
        break;
    }

    this.state = newState;
  }

  // Apply right face rotation - Now properly rotates pieces
  private applyRightRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      // Rotate pieces on the right face (x = 1)
      state.pieces.forEach(piece => {
        const [x, y, z] = piece.position;
        if (x === 1) {
          // Rotate the piece position around +X axis
          piece.position = [x, z, -y];
          
          // Rotate face colors: [top, bottom, left, right, front, back]
          const temp = piece.faceColors[0]; // top
          piece.faceColors[0] = piece.faceColors[5]; // back -> top
          piece.faceColors[5] = piece.faceColors[1]; // bottom -> back
          piece.faceColors[1] = piece.faceColors[4]; // front -> bottom
          piece.faceColors[4] = temp; // top -> front
        }
      });
    }
  }

  // Apply left face rotation
  private applyLeftRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      state.pieces.forEach(piece => {
        const [x, y, z] = piece.position;
        if (x === -1) {
          piece.position = [x, -z, y];
          
          const temp = piece.faceColors[0];
          piece.faceColors[0] = piece.faceColors[4];
          piece.faceColors[4] = piece.faceColors[1];
          piece.faceColors[1] = piece.faceColors[5];
          piece.faceColors[5] = temp;
        }
      });
    }
  }

  // Apply up face rotation
  private applyUpRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      state.pieces.forEach(piece => {
        const [x, y, z] = piece.position;
        if (y === 1) {
          piece.position = [-z, y, x];
          
          const temp = piece.faceColors[2];
          piece.faceColors[2] = piece.faceColors[5];
          piece.faceColors[5] = piece.faceColors[3];
          piece.faceColors[3] = piece.faceColors[4];
          piece.faceColors[4] = temp;
        }
      });
    }
  }

  // Apply down face rotation
  private applyDownRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      state.pieces.forEach(piece => {
        const [x, y, z] = piece.position;
        if (y === -1) {
          piece.position = [z, y, -x];
          
          const temp = piece.faceColors[2];
          piece.faceColors[2] = piece.faceColors[4];
          piece.faceColors[4] = piece.faceColors[3];
          piece.faceColors[3] = piece.faceColors[5];
          piece.faceColors[5] = temp;
        }
      });
    }
  }

  // Apply front face rotation
  private applyFrontRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      state.pieces.forEach(piece => {
        const [x, y, z] = piece.position;
        if (z === 1) {
          piece.position = [x, -z, y];
          
          const temp = piece.faceColors[0];
          piece.faceColors[0] = piece.faceColors[2];
          piece.faceColors[2] = piece.faceColors[1];
          piece.faceColors[1] = piece.faceColors[3];
          piece.faceColors[3] = temp;
        }
      });
    }
  }

  // Apply back face rotation
  private applyBackRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      state.pieces.forEach(piece => {
        const [x, y, z] = piece.position;
        if (z === -1) {
          piece.position = [x, z, -y];
          
          const temp = piece.faceColors[0];
          piece.faceColors[0] = piece.faceColors[3];
          piece.faceColors[3] = piece.faceColors[1];
          piece.faceColors[1] = piece.faceColors[2];
          piece.faceColors[2] = temp;
        }
      });
    }
  }

  // State Recognition Methods

  private isCrossSolved(): boolean {
    // Check all four white edges are on the D face and match their adjacent centers.
    const whiteEdges = [
      { pos: [0, -1, 1], color: this.COLORS.red },    // D-F
      { pos: [1, -1, 0], color: this.COLORS.blue },   // D-R
      { pos: [0, -1, -1], color: this.COLORS.orange },// D-B
      { pos: [-1, -1, 0], color: this.COLORS.green }, // D-L
    ];

    return whiteEdges.every(({ pos, color }) => {
      const piece = this.state.pieces.find(p =>
        p.position[0] === pos[0] && p.position[1] === pos[1] && p.position[2] === pos[2]
      );
      if (!piece) return false;
      // White must be on the D face (index 1) and the adjacent colour must match the centre colour.
      return piece.faceColors[1] === this.COLORS.white && piece.faceColors.includes(color);
    });
  }

  // Get the number of cross edges solved
  private getCrossProgress(): number {
    const whiteEdges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return (x === 0 && y === -1 && z === 1) || 
             (x === 1 && y === -1 && z === 0) || 
             (x === 0 && y === -1 && z === -1) || 
             (x === -1 && y === -1 && z === 0);
    });

    return whiteEdges.filter(edge => edge.faceColors[1] === this.COLORS.white).length;
  }

  // Detect the next corner/edge pair to solve (very simplified – improve by adding all 41 cases)
  private findNextF2LPair(): F2LPair | null {
    const corners = this.state.pieces.filter(p =>
      Math.abs(p.position[0]) === 1 && Math.abs(p.position[1]) === 1 && Math.abs(p.position[2]) === 1
    );
    const edges = this.state.pieces.filter(p =>
      (Math.abs(p.position[0]) === 1 && p.position[1] === 0 && p.position[2] === 0) ||
      (p.position[0] === 0 && Math.abs(p.position[1]) === 1 && p.position[2] === 0) ||
      (p.position[0] === 0 && p.position[1] === 0 && Math.abs(p.position[2]) === 1)
    );

    for (const corner of corners) {
      for (const edge of edges) {
        if (corner.position[1] === 1 && edge.position[1] === 1) {
          const shared = corner.faceColors.find(c =>
            c !== this.COLORS.white && c !== this.COLORS.yellow && edge.faceColors.includes(c)
          );
          if (shared) {
            return { corner, edge, slot: 0 }; // Slot detection omitted for brevity
          }
        }
      }
    }
    return null;
  }

  // Score F2L pairs for optimal selection
  private getF2LPairScore(corner: CubePiece, edge: CubePiece): number {
    let score = 0;
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;

    // Prefer pairs that are already close to their target slot
    const slot = this.getF2LSlot(corner, edge);
    const targetPositions = this.getF2LSlotPositions(slot);
    
    // Check if pieces are near their target positions
    if (this.isNearPosition(corner.position, targetPositions.corner)) score += 3;
    if (this.isNearPosition(edge.position, targetPositions.edge)) score += 2;

    // Prefer pairs where both pieces are on the top layer
    if (cy === 1 && ey === 1) score += 5;
    else if (cy === 1 || ey === 1) score += 2;

    // Prefer pairs that don't require many setup moves
    if (this.requiresFewSetupMoves(corner, edge)) score += 3;

    return score;
  }

  // Check if a position is near a target position
  private isNearPosition(pos: [number, number, number], target: [number, number, number]): boolean {
    const [x1, y1, z1] = pos;
    const [x2, y2, z2] = target;
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1 && Math.abs(z1 - z2) <= 1;
  }

  // Get target positions for an F2L slot
  private getF2LSlotPositions(slot: number): { corner: [number, number, number]; edge: [number, number, number] } {
    switch (slot) {
      case 0: return { corner: [1, -1, 1], edge: [1, 0, 1] }; // Front-right
      case 1: return { corner: [-1, -1, 1], edge: [-1, 0, 1] }; // Front-left
      case 2: return { corner: [-1, -1, -1], edge: [-1, 0, -1] }; // Back-left
      case 3: return { corner: [1, -1, -1], edge: [1, 0, -1] }; // Back-right
      default: return { corner: [1, -1, 1], edge: [1, 0, 1] };
    }
  }

  // Check if a pair requires few setup moves
  private requiresFewSetupMoves(corner: CubePiece, edge: CubePiece): boolean {
    // Simplified check - in practice, you'd analyze the actual setup moves needed
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;
    
    // If both pieces are on the top layer, they likely need fewer setup moves
    return cy === 1 && ey === 1;
  }

  // Check if a corner and edge form a valid F2L pair
  private isValidF2LPair(corner: CubePiece, edge: CubePiece): boolean {
    // Simplified logic - check if they share colors and are in valid positions
    const cornerColors = corner.faceColors.filter(color => color !== this.COLORS.white && color !== this.COLORS.yellow);
    const edgeColors = edge.faceColors.filter(color => color !== this.COLORS.white && color !== this.COLORS.yellow);
    
    return cornerColors.some(color => edgeColors.includes(color));
  }

  // Get the F2L slot for a pair
  private getF2LSlot(corner: CubePiece, edge: CubePiece): number {
    // Simplified slot determination
    const [x, y, z] = corner.position;
    if (x === 1 && z === 1) return 0; // Front-right
    if (x === -1 && z === 1) return 1; // Front-left
    if (x === -1 && z === -1) return 2; // Back-left
    if (x === 1 && z === -1) return 3; // Back-right
    return 0;
  }

  // 2-look OLL recognition: orient edges first, then corners.
  private getOLLCase(): string {
    const upEdges = this.state.pieces.filter(p => p.position[1] === 1 && p.faceColors[0] === this.COLORS.yellow);
    return upEdges.length === 8 ? 'corners' : 'edges';
  }

  // Check for OLL T shape
  private hasOLLTShape(): boolean {
    // Analyze the yellow face pattern
    const yellowFace = this.getYellowFacePattern();
    // T shape has 2 yellow stickers with a specific arrangement
    return this.matchesOLLPattern(yellowFace, 'T');
  }

  // Check for OLL L shape
  private hasOLLLShape(): boolean {
    const yellowFace = this.getYellowFacePattern();
    return this.matchesOLLPattern(yellowFace, 'L');
  }

  // Check for OLL U shape
  private hasOLLUShape(): boolean {
    const yellowFace = this.getYellowFacePattern();
    return this.matchesOLLPattern(yellowFace, 'U');
  }

  // Check for OLL Pi shape
  private hasOLLPiShape(): boolean {
    const yellowFace = this.getYellowFacePattern();
    return this.matchesOLLPattern(yellowFace, 'PI');
  }

  // Get the pattern of yellow stickers on the top face
  private getYellowFacePattern(): boolean[][] {
    const pattern = Array(3).fill(null).map(() => Array(3).fill(false));
    
    // Get all pieces on the top face
    const topPieces = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1;
    });

    // Mark yellow stickers
    topPieces.forEach(piece => {
      const [x, y, z] = piece.position;
      if (piece.faceColors[0] === this.COLORS.yellow) {
        const row = 1 - z; // Convert z coordinate to row
        const col = x + 1; // Convert x coordinate to column
        if (row >= 0 && row < 3 && col >= 0 && col < 3) {
          pattern[row][col] = true;
        }
      }
    });

    return pattern;
  }

  // Check if a pattern matches a specific OLL case
  private matchesOLLPattern(pattern: boolean[][], caseType: string): boolean {
    // Simplified pattern matching - in practice, you'd have more sophisticated logic
    const yellowCount = pattern.flat().filter(cell => cell).length;
    
    switch (caseType) {
      case 'T':
        return yellowCount === 2 && this.hasAdjacentYellows(pattern);
      case 'L':
        return yellowCount === 2 && this.hasCornerYellows(pattern);
      case 'U':
        return yellowCount === 4 && this.hasUShape(pattern);
      case 'PI':
        return yellowCount === 4 && this.hasPiShape(pattern);
      default:
        return false;
    }
  }

  // Check for adjacent yellow stickers
  private hasAdjacentYellows(pattern: boolean[][]): boolean {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (pattern[i][j]) {
          // Check if there's an adjacent yellow
          if ((i > 0 && pattern[i-1][j]) || (i < 2 && pattern[i+1][j]) ||
              (j > 0 && pattern[i][j-1]) || (j < 2 && pattern[i][j+1])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Check for corner yellow stickers
  private hasCornerYellows(pattern: boolean[][]): boolean {
    const corners = [
      pattern[0][0], pattern[0][2], pattern[2][0], pattern[2][2]
    ];
    return corners.filter(corner => corner).length >= 1;
  }

  // Check for U shape
  private hasUShape(pattern: boolean[][]): boolean {
    // Check if there's a U shape (3 sides of a square)
    return (pattern[0][0] && pattern[0][1] && pattern[0][2]) || // Top row
           (pattern[0][0] && pattern[1][0] && pattern[2][0]) || // Left column
           (pattern[2][0] && pattern[2][1] && pattern[2][2]) || // Bottom row
           (pattern[0][2] && pattern[1][2] && pattern[2][2]);   // Right column
  }

  // Check for Pi shape
  private hasPiShape(pattern: boolean[][]): boolean {
    // Pi shape has yellow stickers in a specific arrangement
    return pattern[0][1] && pattern[1][0] && pattern[1][2] && pattern[2][1];
  }

  // 2-look PLL recognition: permute corners then edges.
  private getPLLCase(): string {
    const upCorners = this.state.pieces.filter(p =>
      Math.abs(p.position[0]) === 1 && p.position[1] === 1 && Math.abs(p.position[2]) === 1
    );
    const allCornersCorrect = upCorners.every(c => c.faceColors[0] === this.COLORS.yellow);
    return allCornersCorrect ? 'edges' : 'corners';
  }

  // Check for PLL T shape
  private hasPLLTShape(): boolean {
    // Analyze corner permutation
    const cornerPermutation = this.getCornerPermutation();
    return this.matchesPLLPattern(cornerPermutation, 'T');
  }

  // Check for PLL Y shape
  private hasPLLYShape(): boolean {
    const cornerPermutation = this.getCornerPermutation();
    return this.matchesPLLPattern(cornerPermutation, 'Y');
  }

  // Check for PLL J shape
  private hasPLLJShape(): boolean {
    const cornerPermutation = this.getCornerPermutation();
    return this.matchesPLLPattern(cornerPermutation, 'J');
  }

  // Check for PLL U shape
  private hasPLLUShape(): boolean {
    const edgePermutation = this.getEdgePermutation();
    return this.matchesPLLPattern(edgePermutation, 'U');
  }

  // Check for PLL A shape
  private hasPLLAShape(): boolean {
    const edgePermutation = this.getEdgePermutation();
    return this.matchesPLLPattern(edgePermutation, 'A');
  }

  // Check for PLL E shape
  private hasPLLEShape(): boolean {
    const edgePermutation = this.getEdgePermutation();
    return this.matchesPLLPattern(edgePermutation, 'E');
  }

  // Get corner permutation on the top face
  private getCornerPermutation(): number[] {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });

    // Map corners to positions and get their colors
    const cornerColors = corners.map(corner => {
      const [x, y, z] = corner.position;
      // Get the color facing up
      return corner.faceColors[0];
    });

    return cornerColors.map(color => {
      if (color === this.COLORS.red) return 0;
      if (color === this.COLORS.orange) return 1;
      if (color === this.COLORS.blue) return 2;
      if (color === this.COLORS.green) return 3;
      return 0;
    });
  }

  // Get edge permutation on the top face
  private getEdgePermutation(): number[] {
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });

    const edgeColors = edges.map(edge => {
      const [x, y, z] = edge.position;
      return edge.faceColors[0];
    });

    return edgeColors.map(color => {
      if (color === this.COLORS.red) return 0;
      if (color === this.COLORS.orange) return 1;
      if (color === this.COLORS.blue) return 2;
      if (color === this.COLORS.green) return 3;
      return 0;
    });
  }

  // Check if a permutation matches a specific PLL case
  private matchesPLLPattern(permutation: number[], caseType: string): boolean {
    // Simplified pattern matching
    const uniqueColors = new Set(permutation).size;
    
    switch (caseType) {
      case 'T':
        return uniqueColors === 4; // All corners different
      case 'Y':
        return uniqueColors === 3; // Three different colors
      case 'J':
        return uniqueColors === 2; // Two different colors
      case 'U':
        return uniqueColors === 2; // Two different edge colors
      case 'A':
        return uniqueColors === 3; // Three different edge colors
      case 'E':
        return uniqueColors === 4; // All edges different
      default:
        return false;
    }
  }

  // Check if corners are solved
  private areCornersSolved(): boolean {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });

    // Check if all corners have yellow on top
    return corners.every(corner => corner.faceColors[0] === this.COLORS.yellow);
  }

  // --- basic but functional stage solvers (replace with more cases for efficiency) ---
  public solveCross(): Move[] {
    // Efficient cross solver - find and solve each white edge
    let moves: Move[] = [];
    
    // Find all white edges
    const whiteEdges = this.state.pieces.filter(piece =>
      piece.faceColors.includes(this.COLORS.white) &&
      // Is an edge piece (has exactly 2 non-center colors)
      piece.faceColors.filter(color => 
        color !== this.COLORS.white && 
        color !== this.COLORS.white // filter duplicates
      ).length === 1
    );
    
    // Solve each white edge
    for (const targetPos of CROSS_EDGE_POSITIONS) {
      const targetColor = this.getTargetColorForPosition(targetPos.pos);
      
      // Find the edge that belongs in this position
      const edgeToSolve = whiteEdges.find(edge =>
        edge.faceColors.includes(targetColor) && edge.faceColors.includes(this.COLORS.white)
      );
      
      if (!edgeToSolve) continue;
      
      // Check if edge is already solved
      if (this.isEdgeSolved(edgeToSolve, targetPos.pos)) continue;
      
      // Get the algorithm to solve this edge
      const algorithm = this.getCrossAlgorithm(edgeToSolve, targetPos);
      moves.push(...algorithm);
      
      // Apply moves to update state
      algorithm.forEach(move => this.applyMove(move));
    }
    
    // Optimize: if cross is still not complete, add a basic completion sequence
    if (!this.isCrossSolved()) {
      const fallbackMoves = ['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[];
      moves.push(...fallbackMoves);
    }
    
    return moves;
  }

  // Get the target color for a cross position
  private getTargetColorForPosition(pos: [number, number, number]): string {
    const [x, y, z] = pos;
    if (z === 1) return this.COLORS.red;    // Front
    if (x === 1) return this.COLORS.blue;   // Right
    if (z === -1) return this.COLORS.orange; // Back
    if (x === -1) return this.COLORS.green;  // Left
    return this.COLORS.white; // Default
  }

  // Check if an edge is already solved in the correct position
  private isEdgeSolved(edge: CubePiece, targetPos: [number, number, number]): boolean {
    const [tx, ty, tz] = targetPos;
    const [ex, ey, ez] = edge.position;
    
    // Check position match
    if (ex !== tx || ey !== ty || ez !== tz) return false;
    
    // Check orientation (white must be on bottom)
    return edge.faceColors[1] === this.COLORS.white;
  }

  // Get the algorithm to solve a specific cross edge
  private getCrossAlgorithm(edge: CubePiece, targetPos: { pos: [number, number, number]; face: string; algorithm_key: string }): Move[] {
    const [ex, ey, ez] = edge.position;
    const [tx, ty, tz] = targetPos.pos;
    
    // If edge is on U layer
    if (ey === 1) {
      // Check if it's in the correct position above target
      if (ex === tx && ez === tz) {
        // Check orientation
        const whiteOnTop = edge.faceColors[0] === this.COLORS.white;
        if (whiteOnTop) {
          // Wrong orientation - needs to be flipped
          return this.getFlipAlgorithm(targetPos.face);
        } else {
          // Correct orientation - direct insert
          return this.getDirectInsertAlgorithm(targetPos.face);
        }
      } else {
        // Wrong position - move to correct position first
        const setupMoves = this.getSetupMoves(edge.position, targetPos.pos);
        const insertMoves = this.getDirectInsertAlgorithm(targetPos.face);
        return [...setupMoves, ...insertMoves];
      }
    }
    
    // If edge is in middle layer
    if (ey === 0) {
      // Move to U layer first, then solve
      const extractMoves = this.getExtractionMoves(edge.position);
      const insertMoves = this.getCrossAlgorithm(
        { ...edge, position: [ex, 1, ez] }, // Simulated position after extraction
        targetPos
      );
      return [...extractMoves, ...insertMoves];
    }
    
    // If edge is in D layer but wrong position/orientation
    if (ey === -1) {
      if (ex === tx && ez === tz) {
        // Correct position but wrong orientation
        return this.getReorientAlgorithm(targetPos.face);
      } else {
        // Wrong position - extract and reinsert
        const extractMoves = this.getExtractionMoves(edge.position);
        const insertMoves = this.getCrossAlgorithm(
          { ...edge, position: [ex, 1, ez] }, // Simulated position after extraction
          targetPos
        );
        return [...extractMoves, ...insertMoves];
      }
    }
    
    // Fallback
    return CROSS_ALGORITHMS.U_CORRECT;
  }

  // Get algorithm to directly insert an edge from U to D
  private getDirectInsertAlgorithm(face: string): Move[] {
    switch (face) {
      case 'F': return CROSS_ALGORITHMS.U_CORRECT;
      case 'R': return CROSS_ALGORITHMS.U_CORRECT_R;
      case 'B': return CROSS_ALGORITHMS.U_CORRECT_B;
      case 'L': return CROSS_ALGORITHMS.U_CORRECT_L;
      default: return CROSS_ALGORITHMS.U_CORRECT;
    }
  }

  // Get algorithm to flip and insert an edge
  private getFlipAlgorithm(face: string): Move[] {
    switch (face) {
      case 'F': return CROSS_ALGORITHMS.U_FLIPPED;
      case 'R': return CROSS_ALGORITHMS.U_FLIPPED_R;
      case 'B': return CROSS_ALGORITHMS.U_FLIPPED_B;
      case 'L': return CROSS_ALGORITHMS.U_FLIPPED_L;
      default: return CROSS_ALGORITHMS.U_FLIPPED;
    }
  }

  // Get setup moves to position an edge correctly on U layer
  private getSetupMoves(currentPos: [number, number, number], targetPos: [number, number, number]): Move[] {
    const [cx, cy, cz] = currentPos;
    const [tx, ty, tz] = targetPos;
    
    // Calculate U layer rotations needed
    if (cx === 0 && cz === 1 && tx === 1 && tz === 0) return ['U'] as Move[];
    if (cx === 0 && cz === 1 && tx === 0 && tz === -1) return ['U2'] as Move[];
    if (cx === 0 && cz === 1 && tx === -1 && tz === 0) return ['U\''] as Move[];
    
    if (cx === 1 && cz === 0 && tx === 0 && tz === -1) return ['U'] as Move[];
    if (cx === 1 && cz === 0 && tx === -1 && tz === 0) return ['U2'] as Move[];
    if (cx === 1 && cz === 0 && tx === 0 && tz === 1) return ['U\''] as Move[];
    
    if (cx === 0 && cz === -1 && tx === -1 && tz === 0) return ['U'] as Move[];
    if (cx === 0 && cz === -1 && tx === 0 && tz === 1) return ['U2'] as Move[];
    if (cx === 0 && cz === -1 && tx === 1 && tz === 0) return ['U\''] as Move[];
    
    if (cx === -1 && cz === 0 && tx === 0 && tz === 1) return ['U'] as Move[];
    if (cx === -1 && cz === 0 && tx === 1 && tz === 0) return ['U2'] as Move[];
    if (cx === -1 && cz === 0 && tx === 0 && tz === -1) return ['U\''] as Move[];
    
    return []; // No setup needed
  }

  // Get moves to extract an edge from middle or bottom layer
  private getExtractionMoves(pos: [number, number, number]): Move[] {
    const [x, y, z] = pos;
    
    if (y === 0) {
      // Middle layer
      if (z === 1) return ['F', 'U'] as Move[]; // Front
      if (x === 1) return ['R', 'U'] as Move[]; // Right
      if (z === -1) return ['B', 'U'] as Move[]; // Back
      if (x === -1) return ['L', 'U'] as Move[]; // Left
    }
    
    if (y === -1) {
      // Bottom layer
      if (z === 1) return ['F2', 'U'] as Move[]; // Front
      if (x === 1) return ['R2', 'U'] as Move[]; // Right
      if (z === -1) return ['B2', 'U'] as Move[]; // Back
      if (x === -1) return ['L2', 'U'] as Move[]; // Left
    }
    
    return ['U'] as Move[]; // Default
  }

  // Get algorithm to reorient an edge in the correct position
  private getReorientAlgorithm(face: string): Move[] {
    return this.getFlipAlgorithm(face);
  }

  public solveF2L(): Move[] {
    // New: Try to solve all 4 F2L pairs using case recognition
    let moves: Move[] = [];
    let pairsSolved = 0;
    let attempts = 0;
    // For demo, just repeat up to 4 pairs
    while (pairsSolved < 4 && attempts < 10) {
      // Find next F2L pair
      const pair = this.findNextF2LPair();
      if (!pair) break;
      // Recognize case
      let caseFound = F2L_CASES.find(f2lCase => f2lCase.recognize(pair.corner, pair.edge, this.COLORS));
      if (!caseFound) {
        // Default to basic insert
        caseFound = F2L_CASES[0];
      }
      moves.push(...caseFound.algorithm);
      // Apply moves to state
      caseFound.algorithm.forEach(move => this.applyMove(move));
      pairsSolved++;
      attempts++;
    }
    // TODO: Expand F2L_CASES to all 41 cases with real recognition and algorithms
    return moves;
  }

  public solveOLL(useFullOLL: boolean = false): Move[] {
    if (useFullOLL) {
      // Full OLL: recognize case and use appropriate algorithm
      const ollCase = this.recognizeOLLCase();
      const algorithm = FULL_OLL_ALGORITHMS[ollCase as keyof typeof FULL_OLL_ALGORITHMS];
      return (algorithm || CFOP_ALGORITHMS.OLL_T) as Move[];
    } else {
      // 2-look OLL: orient edges first, then corners
      const edgeCase = this.recognizeOLLEdgeCase();
      const cornerCase = this.recognizeOLLCornerCase();
      
      let moves: Move[] = [];
      
      // Solve edges
      if (edgeCase === 'H') {
        moves.push(...(CFOP_ALGORITHMS.OLL_H as Move[]));
      } else if (edgeCase === 'U') {
        moves.push(...(CFOP_ALGORITHMS.OLL_U as Move[]));
      } else if (edgeCase === 'Z') {
        moves.push(...(CFOP_ALGORITHMS.OLL_Z as Move[]));
      }
      
      // Solve corners
      if (cornerCase === 'T') {
        moves.push(...(CFOP_ALGORITHMS.OLL_T as Move[]));
      } else if (cornerCase === 'L') {
        moves.push(...(CFOP_ALGORITHMS.OLL_L as Move[]));
      } else if (cornerCase === 'SUNE') {
        moves.push(...(CFOP_ALGORITHMS.OLL_SUNE as Move[]));
      } else if (cornerCase === 'ANTISUNE') {
        moves.push(...(CFOP_ALGORITHMS.OLL_ANTISUNE as Move[]));
      }
      
      return moves;
    }
  }

  public solvePLL(useFullPLL: boolean = false): Move[] {
    if (useFullPLL) {
      // Full PLL: recognize case and use appropriate algorithm
      const pllCase = this.recognizePLLCase();
      const algorithm = FULL_PLL_ALGORITHMS[pllCase as keyof typeof FULL_PLL_ALGORITHMS];
      return (algorithm || CFOP_ALGORITHMS.PLL_T) as Move[];
    } else {
      // 2-look PLL: permute corners first, then edges
      const cornerCase = this.recognizePLLCornerCase();
      const edgeCase = this.recognizePLLEdgeCase();
      
      let moves: Move[] = [];
      
      // Solve corners
      if (cornerCase === 'A') {
        moves.push(...(CFOP_ALGORITHMS.PLL_A as Move[]));
      } else if (cornerCase === 'E') {
        moves.push(...(CFOP_ALGORITHMS.PLL_E as Move[]));
      }
      
      // Solve edges
      if (edgeCase === 'U') {
        moves.push(...(CFOP_ALGORITHMS.PLL_U as Move[]));
      } else if (edgeCase === 'H') {
        moves.push(...(CFOP_ALGORITHMS.PLL_H as Move[]));
      } else if (edgeCase === 'Z') {
        moves.push(...(CFOP_ALGORITHMS.PLL_Z as Move[]));
      }
      
      return moves;
    }
  }

  // OLL Case Recognition Methods
  private recognizeOLLCase(): string {
    // Simplified OLL case recognition
    const yellowFace = this.getYellowFacePattern();
    const yellowCount = yellowFace.flat().filter(cell => cell).length;
    
    if (yellowCount === 0) return 'OLL_1';
    if (yellowCount === 1) return 'OLL_2';
    if (yellowCount === 2) return 'OLL_5';
    if (yellowCount === 3) return 'OLL_8';
    if (yellowCount === 4) return 'OLL_12';
    
    return 'OLL_T'; // Default fallback
  }

  private recognizeOLLEdgeCase(): string {
    // Recognize edge orientation cases for 2-look OLL
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });
    
    const orientedEdges = edges.filter(edge => edge.faceColors[0] === this.COLORS.yellow).length;
    
    if (orientedEdges === 0) return 'H';
    if (orientedEdges === 2) return 'U';
    if (orientedEdges === 4) return 'Z';
    
    return 'H'; // Default
  }

  private recognizeOLLCornerCase(): string {
    // Recognize corner orientation cases for 2-look OLL
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    const orientedCorners = corners.filter(corner => corner.faceColors[0] === this.COLORS.yellow).length;
    
    if (orientedCorners === 0) return 'T';
    if (orientedCorners === 1) return 'L';
    if (orientedCorners === 2) return 'SUNE';
    if (orientedCorners === 3) return 'ANTISUNE';
    
    return 'T'; // Default
  }

  // PLL Case Recognition Methods
  private recognizePLLCase(): string {
    // Simplified PLL case recognition
    const cornerPerm = this.getCornerPermutation();
    const edgePerm = this.getEdgePermutation();
    
    // Check for common PLL cases
    if (this.isPLLSolved(cornerPerm, edgePerm)) return 'PLL_SOLVED';
    if (this.isPLLU(cornerPerm, edgePerm)) return 'PLL_U';
    if (this.isPLLT(cornerPerm, edgePerm)) return 'PLL_T';
    if (this.isPLLJ(cornerPerm, edgePerm)) return 'PLL_J';
    if (this.isPLLA(cornerPerm, edgePerm)) return 'PLL_A';
    
    return 'PLL_T'; // Default fallback
  }

  private recognizePLLCornerCase(): string {
    // Recognize corner permutation cases for 2-look PLL
    const cornerPerm = this.getCornerPermutation();
    
    if (this.isPLLSolved(cornerPerm, [])) return 'SOLVED';
    if (this.isPLLA(cornerPerm, [])) return 'A';
    if (this.isPLLE(cornerPerm, [])) return 'E';
    
    return 'A'; // Default
  }

  private recognizePLLEdgeCase(): string {
    // Recognize edge permutation cases for 2-look PLL
    const edgePerm = this.getEdgePermutation();
    
    if (this.isPLLSolved([], edgePerm)) return 'SOLVED';
    if (this.isPLLU([], edgePerm)) return 'U';
    if (this.isPLLH([], edgePerm)) return 'H';
    if (this.isPLLZ([], edgePerm)) return 'Z';
    
    return 'U'; // Default
  }

  // PLL Pattern Recognition Helpers
  private isPLLSolved(cornerPerm: number[], edgePerm: number[]): boolean {
    return cornerPerm.every((val, i) => val === i) && edgePerm.every((val, i) => val === i);
  }

  private isPLLU(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for U-perm pattern
    return edgePerm[0] === edgePerm[1] && edgePerm[2] === edgePerm[3];
  }

  private isPLLT(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for T-perm pattern
    return cornerPerm[0] !== cornerPerm[1] && cornerPerm[2] !== cornerPerm[3];
  }

  private isPLLJ(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for J-perm pattern
    return cornerPerm[0] === cornerPerm[2] && cornerPerm[1] === cornerPerm[3];
  }

  private isPLLA(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for A-perm pattern
    return cornerPerm[0] === cornerPerm[1] && cornerPerm[2] !== cornerPerm[3];
  }

  private isPLLE(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for E-perm pattern
    return cornerPerm[0] === cornerPerm[2] && cornerPerm[1] !== cornerPerm[3];
  }

  private isPLLH(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for H-perm pattern
    return edgePerm[0] === edgePerm[2] && edgePerm[1] === edgePerm[3];
  }

  private isPLLZ(cornerPerm: number[], edgePerm: number[]): boolean {
    // Check for Z-perm pattern
    return edgePerm[0] === edgePerm[1] && edgePerm[2] === edgePerm[3];
  }

  // Generate complete CFOP solution with stage tracking
  public generateCFOPSolution(useFullOLL: boolean = false, useFullPLL: boolean = false): { moves: Move[]; stages: { stage: SolvingStage; startIndex: number; endIndex: number }[] } {
    const allMoves: Move[] = [];
    const stages: { stage: SolvingStage; startIndex: number; endIndex: number }[] = [];
    
    // Solve cross
    if (!this.isCrossSolved()) {
      const crossMoves = this.solveCross();
      const crossStart = allMoves.length;
      allMoves.push(...crossMoves);
      stages.push({ stage: SolvingStage.CROSS, startIndex: crossStart, endIndex: allMoves.length - 1 });
      crossMoves.forEach(move => this.applyMove(move));
    }
    
    // Solve F2L
    const f2lMoves = this.solveF2L();
    const f2lStart = allMoves.length;
    allMoves.push(...f2lMoves);
    stages.push({ stage: SolvingStage.F2L, startIndex: f2lStart, endIndex: allMoves.length - 1 });
    
    // Solve OLL
    const ollMoves = this.solveOLL(useFullOLL);
    const ollStart = allMoves.length;
    allMoves.push(...ollMoves);
    stages.push({ stage: SolvingStage.OLL, startIndex: ollStart, endIndex: allMoves.length - 1 });
    ollMoves.forEach(move => this.applyMove(move));
    
    // Solve PLL
    const pllMoves = this.solvePLL(useFullPLL);
    const pllStart = allMoves.length;
    allMoves.push(...pllMoves);
    stages.push({ stage: SolvingStage.PLL, startIndex: pllStart, endIndex: allMoves.length - 1 });
    
    return { moves: allMoves, stages };
  }

  // Get pieces that should be highlighted for look-ahead
  public getLookAheadPieces(currentStage: SolvingStage): CubePiece[] {
    switch (currentStage) {
      case SolvingStage.CROSS:
        // Highlight white edges that need to be solved
        return this.state.pieces.filter(piece => {
          const [x, y, z] = piece.position;
          return piece.faceColors.some(color => color === this.COLORS.white) &&
                 !(x === 0 && y === -1 && z === 1) && // Not in solved position
                 !(x === 1 && y === -1 && z === 0) &&
                 !(x === 0 && y === -1 && z === -1) &&
                 !(x === -1 && y === -1 && z === 0);
        });
      
      case SolvingStage.F2L:
        // Highlight the next F2L pair
        const nextPair = this.findNextF2LPair();
        if (nextPair) {
          return [nextPair.corner, nextPair.edge];
        }
        return [];
      
      case SolvingStage.OLL:
        // Highlight yellow face pieces that need orientation
        return this.state.pieces.filter(piece => {
          const [x, y, z] = piece.position;
          return y === 1 && piece.faceColors[0] !== this.COLORS.yellow;
        });
      
      case SolvingStage.PLL:
        // Highlight pieces that need permutation
        return this.state.pieces.filter(piece => {
          const [x, y, z] = piece.position;
          return y === 1; // All top layer pieces
        });
      
      default:
        return [];
    }
  }

  // Public methods for move queue management
  public addMoves(moves: Move[]): void {
    this.moveQueue.push(...moves);
  }

  public executeNextMove(): Move | null {
    if (this.moveQueue.length === 0) return null;
    const move = this.moveQueue.shift()!;
    this.applyMove(move);
    return move;
  }

  public getState(): CubeState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public isQueueEmpty(): boolean {
    return this.moveQueue.length === 0;
  }

  public getQueueLength(): number {
    return this.moveQueue.length;
  }

  public isSolved(): boolean {
    // Check if all faces are solved
    const faces = [
      { pieces: this.state.pieces.filter(p => p.position[1] === 1), color: this.COLORS.yellow }, // Top
      { pieces: this.state.pieces.filter(p => p.position[1] === -1), color: this.COLORS.white }, // Bottom
      { pieces: this.state.pieces.filter(p => p.position[2] === 1), color: this.COLORS.red }, // Front
      { pieces: this.state.pieces.filter(p => p.position[2] === -1), color: this.COLORS.orange }, // Back
      { pieces: this.state.pieces.filter(p => p.position[0] === 1), color: this.COLORS.blue }, // Right
      { pieces: this.state.pieces.filter(p => p.position[0] === -1), color: this.COLORS.green } // Left
    ];

    return faces.every(face => 
      face.pieces.every(piece => 
        piece.faceColors.some(color => color === face.color)
      )
    );
  }

  // Legacy method for backward compatibility
  public static generateInverseSequence(moves: Move[]): Move[] {
    const inverseMap: Record<Move, Move> = {
      'R': 'R\'', 'R\'': 'R', 'R2': 'R2',
      'L': 'L\'', 'L\'': 'L', 'L2': 'L2',
      'U': 'U\'', 'U\'': 'U', 'U2': 'U2',
      'D': 'D\'', 'D\'': 'D', 'D2': 'D2',
      'F': 'F\'', 'F\'': 'F', 'F2': 'F2',
      'B': 'B\'', 'B\'': 'B', 'B2': 'B2'
    };
    
    return moves.slice().reverse().map(move => inverseMap[move]);
  }
}

const RubiksCubeScene = () => {
  const [cubeState, setCubeState] = useState<CubeState | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [currentStage, setCurrentStage] = useState<SolvingStage | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState("");
  const [scrambleMoves, setScrambleMoves] = useState<Move[]>([]);
  const [solveStats, setSolveStats] = useState<{ totalMoves: number; stageMoves: { [key in SolvingStage]: number } } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [colorScheme, setColorScheme] = useState<'standard' | 'monochrome'>('monochrome');
  const [animationSpeed, setAnimationSpeed] = useState(300); // ms per move
  const [useFullOLL, setUseFullOLL] = useState(false);
  const [useFullPLL, setUseFullPLL] = useState(false);
  const COLORS = COLOR_SCHEMES[colorScheme];

  const solverRef = useRef<CubeSolver | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const animationRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef(0);

  // Cube positions for a 3x3x3 cube
  const cubePositions: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubePositions.push([x, y, z]);
      }
    }
  }

  const createSolvedState = (): CubeState => {
    const pieces: CubePiece[] = [];
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const faceColors: string[] = [COLORS.white, COLORS.white, COLORS.white, COLORS.white, COLORS.white, COLORS.white];
          
          // Set face colors based on position
          if (z === 1) faceColors[4] = COLORS.red; // Front
          if (z === -1) faceColors[5] = COLORS.orange; // Back
          if (x === 1) faceColors[3] = COLORS.blue; // Right
          if (x === -1) faceColors[2] = COLORS.green; // Left
          if (y === 1) faceColors[0] = COLORS.yellow; // Top
          if (y === -1) faceColors[1] = COLORS.white; // Bottom
          
          pieces.push({
            position: [x, y, z],
            faceColors
          });
        }
      }
    }
    
    return { pieces };
  };

  const createScrambledState = (): { state: CubeState; moves: Move[] } => {
    const state = createSolvedState();
    const moves: Move[] = [];
    const possibleMoves: Move[] = ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'];
    
    // Generate a proper scramble with quality checks
    let lastMove: Move | '' = '';
    let secondLastMove: Move | '' = '';
    
    // Apply 25-30 moves for a proper scramble
    const numMoves = 25 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numMoves; i++) {
      let randomMove: Move;
      let attempts = 0;
      
      do {
        randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        attempts++;
      } while (
        // Avoid redundant moves (e.g., R followed by R')
        (lastMove && randomMove === getInverseMove(lastMove as Move)) ||
        // Avoid same face moves in sequence (e.g., R, R, R)
        (lastMove && randomMove === lastMove) ||
        // Avoid opposite face moves in sequence (e.g., R followed by L)
        (lastMove && areOppositeFaces(lastMove as Move, randomMove)) ||
        // Avoid three consecutive moves on the same axis
        (secondLastMove && lastMove && areSameAxis(secondLastMove as Move, lastMove as Move, randomMove)) ||
        attempts > 50 // Prevent infinite loops
      );
      
      moves.push(randomMove);
      secondLastMove = lastMove;
      lastMove = randomMove;
      
      // Apply the move to the state
      const solver = new CubeSolver(state, COLORS);
      solver.addMoves([randomMove]);
      solver.executeNextMove();
      Object.assign(state, solver.getState());
    }
    
    return { state, moves };
  };


  // Helper function to get inverse of a move
  const getInverseMove = (move: Move): Move => {
    const inverseMap: Record<Move, Move> = {
      'R': 'R\'', 'R\'': 'R', 'R2': 'R2',
      'L': 'L\'', 'L\'': 'L', 'L2': 'L2',
      'U': 'U\'', 'U\'': 'U', 'U2': 'U2',
      'D': 'D\'', 'D\'': 'D', 'D2': 'D2',
      'F': 'F\'', 'F\'': 'F', 'F2': 'F2',
      'B': 'B\'', 'B\'': 'B', 'B2': 'B2'
    };
    return inverseMap[move];
  };

  // Helper function to check if two faces are opposite
  const areOppositeFaces = (move1: Move, move2: Move): boolean => {
    const face1 = move1.charAt(0);
    const face2 = move2.charAt(0);
    return (face1 === 'R' && face2 === 'L') || (face1 === 'L' && face2 === 'R') ||
           (face1 === 'U' && face2 === 'D') || (face1 === 'D' && face2 === 'U') ||
           (face1 === 'F' && face2 === 'B') || (face1 === 'B' && face2 === 'F');
  };

  // Helper function to check if three moves are on the same axis
  const areSameAxis = (move1: Move, move2: Move, move3: Move): boolean => {
    const face1 = move1.charAt(0);
    const face2 = move2.charAt(0);
    const face3 = move3.charAt(0);
    
    // Check if all three are on the same axis (R/L, U/D, or F/B)
    return (face1 === face2 && face2 === face3) ||
           ((face1 === 'R' || face1 === 'L') && (face2 === 'R' || face2 === 'L') && (face3 === 'R' || face3 === 'L')) ||
           ((face1 === 'U' || face1 === 'D') && (face2 === 'U' || face2 === 'D') && (face3 === 'U' || face3 === 'D')) ||
           ((face1 === 'F' || face1 === 'B') && (face2 === 'F' || face2 === 'B') && (face3 === 'F' || face3 === 'B'));
  };

  // Animation function
  const animateMoves = useCallback((currentTime: number) => {
    if (!isSolving || !solverRef.current) {
      animationRef.current = null;
      return;
    }

    if (currentTime - lastMoveTimeRef.current >= animationSpeed) { // user-selected ms per move
      const move = solverRef.current.executeNextMove();
      if (move) {
        setCubeState(solverRef.current.getState());
        setCurrentAlgorithm(`Executing: ${move}`);
        
        // Update stage based on current move index
        const stages = solverRef.current.stages;
        const totalMoves = solverRef.current.getQueueLength() + 1; // +1 because we just executed a move
        const executedMoves = solverRef.current.totalMoves;
        const currentMoveIndex = executedMoves;
        
        if (stages) {
          const currentStage = stages.find(stage => 
            currentMoveIndex >= stage.startIndex && currentMoveIndex <= stage.endIndex
          );
          if (currentStage) {
            setCurrentStage(currentStage.stage);
          }
        }
        
        // Update executed moves count
        solverRef.current.totalMoves = solverRef.current.totalMoves + 1;
        
        lastMoveTimeRef.current = currentTime;
      } else {
        // No more moves
        setIsSolving(false);
        setCurrentStage(SolvingStage.SOLVED);
        setCurrentAlgorithm("Cube solved!");
        animationRef.current = null;
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animateMoves);
  }, [isSolving, animationSpeed]);

  // Start solving with CFOP method
  const startSolving = async () => {
    setIsSolving(true);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    
    // Create scrambled state and store scramble moves
    const { state: scrambledState, moves: newScrambleMoves } = createScrambledState();
    setCubeState(scrambledState);
    setScrambleMoves(newScrambleMoves);
    
    // Initialize solver with scrambled state and COLORS
    solverRef.current = new CubeSolver(scrambledState, COLORS);
    
    // Generate CFOP solution
    setCurrentStage(SolvingStage.CROSS);
    setCurrentAlgorithm("Generating CFOP solution...");
    
    const { moves: cfopSolution, stages } = solverRef.current.generateCFOPSolution(useFullOLL, useFullPLL);
    console.log("CFOP solution:", cfopSolution);
    console.log("CFOP stages:", stages);
    console.log("Generated CFOP solution:", cfopSolution.length, "moves");
    solverRef.current.addMoves(cfopSolution);
    
    // Store stages for tracking
    solverRef.current.stages = stages;
    
    // Calculate solve statistics
    const stageMoves: { [key in SolvingStage]: number } = {
      [SolvingStage.CROSS]: 0,
      [SolvingStage.F2L]: 0,
      [SolvingStage.OLL]: 0,
      [SolvingStage.PLL]: 0,
      [SolvingStage.SOLVED]: 0
    };
    
    stages.forEach(stage => {
      const moveCount = stage.endIndex - stage.startIndex + 1;
      stageMoves[stage.stage] = moveCount;
    });
    
    setSolveStats({
      totalMoves: cfopSolution.length,
      stageMoves
    });
    
    // Animation will be started by useEffect when isSolving becomes true
  };

  // Use useEffect to manage animation loop based on isSolving state
  useEffect(() => {
    if (isSolving) {
      lastMoveTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animateMoves);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isSolving, animateMoves]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Simple mouse controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && groupRef.current) {
      const deltaX = e.clientX - lastMousePosition.x;
      const deltaY = e.clientY - lastMousePosition.y;
      
      groupRef.current.rotation.y += deltaX * 0.01;
      groupRef.current.rotation.x += deltaY * 0.01;
      
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetCube = () => {
    setIsSolving(false);
    setCubeState(null);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    setScrambleMoves([]);
    setSolveStats(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
  };

  // Add color scheme toggle handler
  const handleColorSchemeToggle = () => {
    setColorScheme((prev) => (prev === 'standard' ? 'monochrome' : 'standard'));
  };

  return (
    <div 
      className="w-full h-96 relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <RotatingCubeGroup isSolving={isSolving} groupRef={groupRef}>
          {/* Generate all 27 cubes */}
          {cubePositions.map((position, index) => {
            const key = `${position[0]},${position[1]},${position[2]}`;
            
            // Use custom state if available, otherwise use default solved state
            let faceColors: string[] = [COLORS.white, COLORS.white, COLORS.white, COLORS.white, COLORS.white, COLORS.white];
            let cubePosition = position;
            
            if (cubeState) {
              // Find the piece at this position in the current state
              const piece = cubeState.pieces.find(p => 
                p.position[0] === position[0] && 
                p.position[1] === position[1] && 
                p.position[2] === position[2]
              );
              if (piece) {
                faceColors = piece.faceColors;
                cubePosition = piece.position;
              }
            } else {
              // Default solved state - each cube has 6 faces [top, bottom, left, right, front, back]
              const [x, y, z] = position;
              if (z === 1) {
                // Front face is red
                faceColors[4] = COLORS.red;
              } else if (z === -1) {
                // Back face is orange
                faceColors[5] = COLORS.orange;
              }
              
              if (x === 1) {
                // Right face is blue
                faceColors[3] = COLORS.blue;
              } else if (x === -1) {
                // Left face is green
                faceColors[2] = COLORS.green;
              }
              
              if (y === 1) {
                // Top face is yellow
                faceColors[0] = COLORS.yellow;
              } else if (y === -1) {
                // Bottom face is white
                faceColors[1] = COLORS.white;
              }
            }
            
            // Check if this cube should be highlighted for look-ahead
            const isHighlighted = solverRef.current && currentStage ? 
              solverRef.current.getLookAheadPieces(currentStage).some(piece => 
                piece.position[0] === cubePosition[0] && 
                piece.position[1] === cubePosition[1] && 
                piece.position[2] === cubePosition[2]
              ) : false;
            
            return (
              <Cube 
                key={index} 
                position={cubePosition} 
                faceColors={faceColors} 
                id={index} 
                isHighlighted={isHighlighted}
              />
            );
          })}
        </RotatingCubeGroup>
      </Canvas>
      
      {/* CFOP Stage Display */}
      {currentStage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-semibold">{currentStage}</div>
          {currentAlgorithm && (
            <div className="text-xs text-gray-300 mt-1">{currentAlgorithm}</div>
          )}
          {solverRef.current && (
            <div className="text-xs text-gray-400 mt-1">
              Moves remaining: {solverRef.current.getQueueLength()}
            </div>
          )}
          {solveStats && (
            <div className="text-xs text-blue-300 mt-1">
              Total: {solveStats.totalMoves} moves
            </div>
          )}
        </div>
      )}
      
      {/* Solve Statistics */}
      {solveStats && !isSolving && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
          <div className="text-sm font-semibold mb-2">Solve Statistics</div>
          <div className="text-xs space-y-1">
            <div>Cross: {solveStats.stageMoves[SolvingStage.CROSS]} moves</div>
            <div>F2L: {solveStats.stageMoves[SolvingStage.F2L]} moves</div>
            <div>OLL: {solveStats.stageMoves[SolvingStage.OLL]} moves</div>
            <div>PLL: {solveStats.stageMoves[SolvingStage.PLL]} moves</div>
            <div className="text-blue-300 font-semibold">
              Total: {solveStats.totalMoves} moves
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 flex-wrap justify-center">
        <button
          onClick={startSolving}
          disabled={isSolving}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isSolving ? "Solving..." : "CFOP Solve"}
        </button>
        <button
          onClick={resetCube}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <button
          onClick={handleColorSchemeToggle}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {colorScheme === 'standard' ? 'Standard Colors' : 'Monochrome'}
        </button>
        <div className="flex flex-col items-center ml-4">
          <label htmlFor="speed-slider" className="text-xs text-white mb-1">Animation Speed: {animationSpeed}ms</label>
          <input
            id="speed-slider"
            type="range"
            min={50}
            max={1000}
            step={10}
            value={animationSpeed}
            onChange={e => setAnimationSpeed(Number(e.target.value))}
            className="w-32"
            disabled={isSolving}
          />
        </div>
        <div className="flex flex-col items-center ml-4">
          <label className="text-xs text-white mb-1">Full OLL</label>
          <input
            type="checkbox"
            checked={useFullOLL}
            onChange={e => setUseFullOLL(e.target.checked)}
            disabled={isSolving}
          />
        </div>
        <div className="flex flex-col items-center ml-4">
          <label className="text-xs text-white mb-1">Full PLL</label>
          <input
            type="checkbox"
            checked={useFullPLL}
            onChange={e => setUseFullPLL(e.target.checked)}
            disabled={isSolving}
          />
        </div>
      </div>
    </div>
  );
};

interface RubiksCubeProps {
  delay?: number;
}

export const RubiksCube = ({ delay }: RubiksCubeProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <BlurFade delay={delay}>
      <div className="space-y-12 w-full py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Rubik&apos;s Cube Solver.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Interactive 3D visualization of the CFOP method in Rubik&apos;s cube solving, featuring Cross, F2L, OLL, and PLL stages.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-card border rounded-lg p-6 w-full max-w-2xl">
            {isClient ? <RubiksCubeScene /> : <div className="h-96 flex items-center justify-center">Loading 3D Cube...</div>}
          </div>
        </div>
      </div>
    </BlurFade>
  );
};

export default RubiksCube; 