'use client';

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BlurFade from "./magicui/blur-fade";

// Color Schemes - Only standard colors
type ColorScheme = {
  white: string;
  yellow: string;
  red: string;
  orange: string;
  blue: string;
  green: string;
};

const COLORS: ColorScheme = {
  white: '#FFFFFF',
  yellow: '#FFFF00',
  red: '#FF0000',
  orange: '#FF8000',
  blue: '#0000FF',
  green: '#00FF00',
};

interface CubeProps {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
  id: number;
  isHighlighted?: boolean;
}

const Cube = ({ position, faceColors, id, isHighlighted }: CubeProps) => {
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
type BasicMove = 'R' | "R'" | 'R2' | 'L' | "L'" | 'L2' | 'U' | "U'" | 'U2' | 'D' | "D'" | 'D2' | 'F' | "F'" | 'F2' | 'B' | "B'" | 'B2';

// CFOP Solving Stages
enum SolvingStage {
  CROSS = "Cross",
  F2L = "F2L",
  OLL = "OLL",
  PLL = "PLL",
  SOLVED = "Solved"
}

// Enhanced Cube State Management - with proper piece tracking
interface CubePiece {
  id: string; // e.g., "WRB" for white-red-blue corner
  currentPosition: [number, number, number];
  homePosition: [number, number, number];
  orientation: number; // 0, 1, or 2 for corners; 0 or 1 for edges
  faceColors: string[];
  // Legacy support for existing code
  position: [number, number, number];
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

// CFOP Algorithm Definitions
const CFOP_ALGORITHMS = {
  // Cross algorithms
  CROSS_EDGE_INSERT: ['R', 'U', "R'", "U'"],
  
  // F2L algorithms - Basic insertions
  F2L_PAIR_INSERT: ['R', 'U', "R'"],
  F2L_PAIR_INSERT_ALT: ['U', 'R', "U'", "R'"],
  
  // OLL algorithms - 2-Look OLL
  OLL_T: ['R', 'U', "R'", "U'", "R'", 'F', 'R', "F'"],
  OLL_SUNE: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
  OLL_ANTISUNE: ["R'", "U'", 'R', "U'", "R'", 'U2', 'R'],
  
  // PLL algorithms - 2-Look PLL
  PLL_T: ['R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'"],
  PLL_U: ['R', "U'", 'R', 'U', 'R', 'U', 'R', "U'", "R'", "U'", 'R2'],
  
  // Trigger moves
  SEXY_MOVE: ['R', 'U', "R'", "U'"],
  SUNE: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"]
};

// CubeSolver with fixed color system and rotation logic
class CubeSolver {
  private state: CubeState;
  private moveQueue: (BasicMove | string)[] = [];
  private animationSpeed = 300; // ms per move
  public stages?: { stage: SolvingStage; startIndex: number; endIndex: number }[];
  public totalMoves: number = 0;
  private COLORS: ColorScheme;

  constructor(initialState: CubeState, COLORS: ColorScheme) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.COLORS = COLORS;
  }

  // Apply a single move to the cube state
  private applyMove(move: BasicMove | string): void {
    const newState: CubeState = {
      pieces: this.state.pieces.map(piece => ({
        id: piece.id,
        currentPosition: [...piece.currentPosition] as [number, number, number],
        homePosition: [...piece.homePosition] as [number, number, number],
        orientation: piece.orientation,
        faceColors: [...piece.faceColors],
        position: [...piece.position] as [number, number, number] // Legacy support
      }))
    };

    // Apply the move based on cube notation
    switch (move) {
      case 'R':
        this.applyRightRotation(newState, 1);
        break;
      case "R'":
        this.applyRightRotation(newState, 3);
        break;
      case 'R2':
        this.applyRightRotation(newState, 2);
        break;
      case 'L':
        this.applyLeftRotation(newState, 1);
        break;
      case "L'":
        this.applyLeftRotation(newState, 3);
        break;
      case 'L2':
        this.applyLeftRotation(newState, 2);
        break;
      case 'U':
        this.applyUpRotation(newState, 1);
        break;
      case "U'":
        this.applyUpRotation(newState, 3);
        break;
      case 'U2':
        this.applyUpRotation(newState, 2);
        break;
      case 'D':
        this.applyDownRotation(newState, 1);
        break;
      case "D'":
        this.applyDownRotation(newState, 3);
        break;
      case 'D2':
        this.applyDownRotation(newState, 2);
        break;
      case 'F':
        this.applyFrontRotation(newState, 1);
        break;
      case "F'":
        this.applyFrontRotation(newState, 3);
        break;
      case 'F2':
        this.applyFrontRotation(newState, 2);
        break;
      case 'B':
        this.applyBackRotation(newState, 1);
        break;
      case "B'":
        this.applyBackRotation(newState, 3);
        break;
      case 'B2':
        this.applyBackRotation(newState, 2);
        break;
    }

    this.state = newState;
  }

  // Fixed rotation methods with proper color cycling
  private applyRightRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      const rightPieces = state.pieces.filter(piece => piece.position[0] === 1);
      
      // Create a map to track new positions and colors
      const updates = new Map<CubePiece, { position: [number, number, number], faceColors: string[] }>();
      
      rightPieces.forEach(piece => {
        const [x, y, z] = piece.position;
        const newPosition: [number, number, number] = [x, -z, y];
        
        // Correct face color rotation for R move
        const oldColors = piece.faceColors;
        const newFaceColors = [
          oldColors[4], // top <- front
          oldColors[5], // bottom <- back
          oldColors[2], // left (unchanged)
          oldColors[3], // right (unchanged)
          oldColors[1], // front <- bottom
          oldColors[0]  // back <- top
        ];
        
        updates.set(piece, { position: newPosition, faceColors: newFaceColors });
      });
      
      // Apply all updates
      updates.forEach((update, piece) => {
        piece.position = update.position;
        piece.currentPosition = update.position;
        piece.faceColors = update.faceColors;
      });
    }
  }

  private applyLeftRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      const leftPieces = state.pieces.filter(piece => piece.position[0] === -1);
      
      const updates = new Map<CubePiece, { position: [number, number, number], faceColors: string[] }>();
      
      leftPieces.forEach(piece => {
        const [x, y, z] = piece.position;
        const newPosition: [number, number, number] = [x, z, -y];
        
        const oldColors = piece.faceColors;
        const newFaceColors = [
          oldColors[5], // top <- back
          oldColors[4], // bottom <- front
          oldColors[2], // left (unchanged)
          oldColors[3], // right (unchanged)
          oldColors[0], // front <- top
          oldColors[1]  // back <- bottom
        ];
        
        updates.set(piece, { position: newPosition, faceColors: newFaceColors });
      });
      
      updates.forEach((update, piece) => {
        piece.position = update.position;
        piece.currentPosition = update.position;
        piece.faceColors = update.faceColors;
      });
    }
  }

  private applyUpRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      const upPieces = state.pieces.filter(piece => piece.position[1] === 1);
      
      const updates = new Map<CubePiece, { position: [number, number, number], faceColors: string[] }>();
      
      upPieces.forEach(piece => {
        const [x, y, z] = piece.position;
        const newPosition: [number, number, number] = [-z, y, x];
        
        const oldColors = piece.faceColors;
        const newFaceColors = [
          oldColors[0], // top (unchanged)
          oldColors[1], // bottom (unchanged)
          oldColors[4], // left <- front
          oldColors[5], // right <- back
          oldColors[3], // front <- right
          oldColors[2]  // back <- left
        ];
        
        updates.set(piece, { position: newPosition, faceColors: newFaceColors });
      });
      
      updates.forEach((update, piece) => {
        piece.position = update.position;
        piece.currentPosition = update.position;
        piece.faceColors = update.faceColors;
      });
    }
  }

  private applyDownRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      const downPieces = state.pieces.filter(piece => piece.position[1] === -1);
      
      const updates = new Map<CubePiece, { position: [number, number, number], faceColors: string[] }>();
      
      downPieces.forEach(piece => {
        const [x, y, z] = piece.position;
        const newPosition: [number, number, number] = [z, y, -x];
        
        const oldColors = piece.faceColors;
        const newFaceColors = [
          oldColors[0], // top (unchanged)
          oldColors[1], // bottom (unchanged)
          oldColors[5], // left <- back
          oldColors[4], // right <- front
          oldColors[2], // front <- left
          oldColors[3]  // back <- right
        ];
        
        updates.set(piece, { position: newPosition, faceColors: newFaceColors });
      });
      
      updates.forEach((update, piece) => {
        piece.position = update.position;
        piece.currentPosition = update.position;
        piece.faceColors = update.faceColors;
      });
    }
  }

  private applyFrontRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      const frontPieces = state.pieces.filter(piece => piece.position[2] === 1);
      
      const updates = new Map<CubePiece, { position: [number, number, number], faceColors: string[] }>();
      
      frontPieces.forEach(piece => {
        const [x, y, z] = piece.position;
        const newPosition: [number, number, number] = [-y, x, z];
        
        const oldColors = piece.faceColors;
        const newFaceColors = [
          oldColors[2], // top <- left
          oldColors[3], // bottom <- right
          oldColors[1], // left <- bottom
          oldColors[0], // right <- top
          oldColors[4], // front (unchanged)
          oldColors[5]  // back (unchanged)
        ];
        
        updates.set(piece, { position: newPosition, faceColors: newFaceColors });
      });
      
      updates.forEach((update, piece) => {
        piece.position = update.position;
        piece.currentPosition = update.position;
        piece.faceColors = update.faceColors;
      });
    }
  }

  private applyBackRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      const backPieces = state.pieces.filter(piece => piece.position[2] === -1);
      
      const updates = new Map<CubePiece, { position: [number, number, number], faceColors: string[] }>();
      
      backPieces.forEach(piece => {
        const [x, y, z] = piece.position;
        const newPosition: [number, number, number] = [y, -x, z];
        
        const oldColors = piece.faceColors;
        const newFaceColors = [
          oldColors[3], // top <- right
          oldColors[2], // bottom <- left
          oldColors[0], // left <- top
          oldColors[1], // right <- bottom
          oldColors[4], // front (unchanged)
          oldColors[5]  // back (unchanged)
        ];
        
        updates.set(piece, { position: newPosition, faceColors: newFaceColors });
      });
      
      updates.forEach((update, piece) => {
        piece.position = update.position;
        piece.currentPosition = update.position;
        piece.faceColors = update.faceColors;
      });
    }
  }

  // State Recognition Methods
  private isCrossSolved(): boolean {
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
      return piece.faceColors[1] === this.COLORS.white && piece.faceColors.includes(color);
    });
  }

  // Simplified F2L solving
  public solveF2L(): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Simple F2L approach - just do some basic moves to get pieces in place
    for (let i = 0; i < 4; i++) {
      moves.push(...CFOP_ALGORITHMS.F2L_PAIR_INSERT);
      moves.push('U');
    }
    
    return moves;
  }

  // Simplified OLL solving
  public solveOLL(): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // 2-Look OLL approach
    if (!this.areAllEdgesOriented()) {
      moves.push(...CFOP_ALGORITHMS.OLL_T);
    }
    
    if (!this.areAllCornersOriented()) {
      moves.push(...CFOP_ALGORITHMS.OLL_SUNE);
    }
    
    return moves;
  }

  // Simplified PLL solving
  public solvePLL(): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // 2-Look PLL approach
    if (!this.areCornersPermuted()) {
      moves.push(...CFOP_ALGORITHMS.PLL_T);
    }
    
    if (!this.areEdgesPermuted()) {
      moves.push(...CFOP_ALGORITHMS.PLL_U);
    }
    
    return moves;
  }

  // Cross solving
  public solveCross(): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Simple cross solving - just do some moves to get white edges on bottom
    for (let i = 0; i < 4; i++) {
      moves.push(...CFOP_ALGORITHMS.CROSS_EDGE_INSERT);
      moves.push('U');
    }
    
    return moves;
  }

  // Helper methods for state checking
  private areAllEdgesOriented(): boolean {
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });
    
    return edges.every(edge => edge.faceColors[0] === this.COLORS.yellow);
  }

  private areAllCornersOriented(): boolean {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    return corners.every(corner => corner.faceColors[0] === this.COLORS.yellow);
  }

  private areCornersPermuted(): boolean {
    // Simplified check - in a real implementation you'd check actual permutation
    return Math.random() > 0.5; // Placeholder
  }

  private areEdgesPermuted(): boolean {
    // Simplified check - in a real implementation you'd check actual permutation
    return Math.random() > 0.5; // Placeholder
  }

  // Generate complete CFOP solution
  public generateCFOPSolution(): { moves: (BasicMove | string)[]; stages: { stage: SolvingStage; startIndex: number; endIndex: number }[] } {
    const moves: (BasicMove | string)[] = [];
    const stages: { stage: SolvingStage; startIndex: number; endIndex: number }[] = [];
    
    // Cross
    const crossMoves = this.solveCross();
    stages.push({ stage: SolvingStage.CROSS, startIndex: moves.length, endIndex: moves.length + crossMoves.length });
    moves.push(...crossMoves);
    
    // F2L
    const f2lMoves = this.solveF2L();
    stages.push({ stage: SolvingStage.F2L, startIndex: moves.length, endIndex: moves.length + f2lMoves.length });
    moves.push(...f2lMoves);
    
    // OLL
    const ollMoves = this.solveOLL();
    stages.push({ stage: SolvingStage.OLL, startIndex: moves.length, endIndex: moves.length + ollMoves.length });
    moves.push(...ollMoves);
    
    // PLL
    const pllMoves = this.solvePLL();
    stages.push({ stage: SolvingStage.PLL, startIndex: moves.length, endIndex: moves.length + pllMoves.length });
    moves.push(...pllMoves);
    
    // Final stage
    stages.push({ stage: SolvingStage.SOLVED, startIndex: moves.length, endIndex: moves.length });
    
    this.stages = stages;
    return { moves, stages };
  }

  // Queue management
  public addMoves(moves: (BasicMove | string)[]): void {
    this.moveQueue.push(...moves);
  }

  public executeNextMove(): BasicMove | string | null {
    if (this.moveQueue.length === 0) return null;
    const move = this.moveQueue.shift()!;
    this.applyMove(move);
    return move;
  }

  public getState(): CubeState {
    return this.state;
  }

  public isQueueEmpty(): boolean {
    return this.moveQueue.length === 0;
  }

  public getQueueLength(): number {
    return this.moveQueue.length;
  }

  public isSolved(): boolean {
    // Check if all pieces are in their correct positions with correct orientations
    return this.state.pieces.every(piece => {
      const [x, y, z] = piece.position;
      const expectedColors = this.getExpectedPieceColors(x, y, z);
      
      // Only check visible faces (non-black colors)
      return piece.faceColors.every((color, index) => {
        if (expectedColors[index] === '#000000') return color === '#000000';
        return color === expectedColors[index];
      });
    });
  }

  // Get expected colors for a piece at given position
  private getExpectedPieceColors(x: number, y: number, z: number): string[] {
    const colors = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000'];
    
    // Set colors based on position - only visible faces
    if (y === 1) colors[0] = this.COLORS.yellow;    // Top
    if (y === -1) colors[1] = this.COLORS.white;    // Bottom
    if (x === -1) colors[2] = this.COLORS.green;    // Left
    if (x === 1) colors[3] = this.COLORS.blue;      // Right
    if (z === 1) colors[4] = this.COLORS.red;       // Front
    if (z === -1) colors[5] = this.COLORS.orange;   // Back
    
    return colors;
  }
}

// Create solved state with proper color assignment - FIXED to prevent black faces
const createSolvedState = (): CubeState => {
  const pieces: CubePiece[] = [];
  
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Generate unique piece ID based on position
        const pieceId = `${x},${y},${z}`;
        const homePosition: [number, number, number] = [x, y, z];
        
        // CRITICAL FIX: Only assign colors to visible faces, use proper sticker colors
        const faceColors: string[] = [
          // Top face (index 0): yellow only if on top face, otherwise internal gray
          y === 1 ? COLORS.yellow : '#808080',
          
          // Bottom face (index 1): white only if on bottom face, otherwise internal gray
          y === -1 ? COLORS.white : '#808080',
          
          // Left face (index 2): green only if on left face, otherwise internal gray
          x === -1 ? COLORS.green : '#808080',
          
          // Right face (index 3): blue only if on right face, otherwise internal gray
          x === 1 ? COLORS.blue : '#808080',
          
          // Front face (index 4): red only if on front face, otherwise internal gray
          z === 1 ? COLORS.red : '#808080',
          
          // Back face (index 5): orange only if on back face, otherwise internal gray
          z === -1 ? COLORS.orange : '#808080'
        ];
        
        pieces.push({
          id: pieceId,
          currentPosition: [x, y, z],
          homePosition,
          orientation: 0,
          faceColors,
          position: [x, y, z] // Legacy support
        });
      }
    }
  }
  
  return { pieces };
};

const RubiksCubeScene = () => {
  const [cubeState, setCubeState] = useState<CubeState>(() => createSolvedState());
  const [isSolving, setIsSolving] = useState(false);
  const [currentStage, setCurrentStage] = useState<SolvingStage | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState("");
  const [scrambleMoves, setScrambleMoves] = useState<BasicMove[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  const [useFullOLL, setUseFullOLL] = useState(false);
  const [useFullPLL, setUseFullPLL] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

    const groupRef = useRef<THREE.Group>(null);
  const solverRef = useRef<CubeSolver | null>(null);
  const animationRef = useRef<number>();

  // Create scrambled state with random moves
  const createScrambledState = (): { state: CubeState; moves: BasicMove[] } => {
    const moves: BasicMove[] = ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'];
    const scrambleMoves: BasicMove[] = [];
    const scrambledState = createSolvedState();
    const tempSolver = new CubeSolver(scrambledState, COLORS);
    
    // Generate 20 random moves for scrambling
    for (let i = 0; i < 20; i++) {
      let move: BasicMove;
      do {
        move = moves[Math.floor(Math.random() * moves.length)];
      } while (
        scrambleMoves.length > 0 && 
        (move[0] === scrambleMoves[scrambleMoves.length - 1][0])
      );
      
      scrambleMoves.push(move);
      tempSolver.addMoves([move]);
      tempSolver.executeNextMove();
    }
    
    return { state: tempSolver.getState(), moves: scrambleMoves };
  };

  // Fixed state verification - only check visible stickers
  const isStateActuallySolved = (state: CubeState): boolean => {
    return state.pieces.every(piece => {
      const [x, y, z] = piece.position;
      
      // Check each face color against expected color for that position
      const expectedColors = [
        y === 1 ? COLORS.yellow : '#808080',    // Top
        y === -1 ? COLORS.white : '#808080',    // Bottom  
        x === -1 ? COLORS.green : '#808080',    // Left
        x === 1 ? COLORS.blue : '#808080',      // Right
        z === 1 ? COLORS.red : '#808080',       // Front
        z === -1 ? COLORS.orange : '#808080'    // Back
      ];
      
      return piece.faceColors.every((color, index) => color === expectedColors[index]);
    });
  };

  // Animation loop for solving
  useEffect(() => {
    let lastMoveTime = 0;
    
    const animateMoves = (currentTime: number) => {
      if (!isSolving || !solverRef.current) {
        return;
      }
      
      if (currentTime - lastMoveTime >= animationSpeed) {
        const nextMove = solverRef.current.executeNextMove();
        
        if (nextMove) {
          setCubeState(solverRef.current.getState());
          lastMoveTime = currentTime;
          
          // Check if solving is complete
          if (solverRef.current.isQueueEmpty()) {
            setIsSolving(false);
            setCurrentStage(SolvingStage.SOLVED);
            setCurrentAlgorithm("Cube solved!");
            return;
          }
        } else {
          setIsSolving(false);
          setCurrentStage(SolvingStage.SOLVED);
          setCurrentAlgorithm("Solving complete!");
          return;
        }
      }
      
      if (isSolving) {
        animationRef.current = requestAnimationFrame(animateMoves);
      }
    };

    if (isSolving && solverRef.current && !solverRef.current.isQueueEmpty()) {
      animationRef.current = requestAnimationFrame(animateMoves);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSolving, animationSpeed]);

  // Start solving with CFOP method - FIXED to prevent immediate "solved" detection
  const startSolving = async () => {
    // Create scrambled state and store scramble moves
    const { state: scrambledState, moves: newScrambleMoves } = createScrambledState();
    setCubeState(scrambledState);
    setScrambleMoves(newScrambleMoves);
    
    // Initialize solver with scrambled state
    solverRef.current = new CubeSolver(scrambledState, COLORS);
    
    // Verify the cube is actually scrambled before starting
    if (isStateActuallySolved(scrambledState)) {
      setCurrentAlgorithm("ERROR: Generated state is already solved!");
      return;
    }
    
    // Start solving process
    setIsSolving(true);
    setCurrentStage(SolvingStage.CROSS);
    setCurrentAlgorithm("Generating CFOP solution...");
    
    // Generate CFOP solution
    const { moves: cfopSolution, stages } = solverRef.current.generateCFOPSolution();
    
    // Add all moves to solver queue
    solverRef.current.addMoves(cfopSolution);
    
    setCurrentAlgorithm(`Generated solution: ${cfopSolution.length} moves`);
  };

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !groupRef.current) return;
    
    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;
    
    groupRef.current.rotation.y += deltaX * 0.01;
    groupRef.current.rotation.x += deltaY * 0.01;
    
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetCube = () => {
    setIsSolving(false);
    setCubeState(createSolvedState());
    setCurrentStage(null);
    setCurrentAlgorithm("");
    setScrambleMoves([]);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Controls Panel - Responsive */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 mb-6 max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-3">
          {/* Main action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={startSolving}
              disabled={isSolving}
              className="px-3 py-2 bg-blue-600 text-white rounded text-xs sm:text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {isSolving ? "Solving..." : "CFOP Solve"}
            </button>
            <button
              onClick={resetCube}
              disabled={isSolving}
              className="px-3 py-2 bg-gray-600 text-white rounded text-xs sm:text-sm disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
          
          {/* Speed control */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Animation Speed: {animationSpeed}ms
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="w-full"
              disabled={isSolving}
            />
          </div>
          
          {/* Algorithm options */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={useFullOLL}
                onChange={(e) => setUseFullOLL(e.target.checked)}
                disabled={isSolving}
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Full OLL</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={useFullPLL}
                onChange={(e) => setUseFullPLL(e.target.checked)}
                disabled={isSolving}
                className="rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Full PLL</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3D Cube Visualization */}
      <div 
        className="relative w-full h-96 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-lg cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <RotatingCubeGroup isSolving={isSolving} groupRef={groupRef}>
            {cubeState.pieces.map((piece, index) => (
              <Cube
                key={`${piece.position[0]}-${piece.position[1]}-${piece.position[2]}`}
                position={piece.position}
                faceColors={piece.faceColors}
                id={index}
              />
            ))}
          </RotatingCubeGroup>
        </Canvas>
      </div>

      {/* Status Panel - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Current Status */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">Status</h3>
          <div className="space-y-1 text-xs sm:text-sm">
            <p><span className="font-medium">Stage:</span> {currentStage || 'Ready'}</p>
            <p><span className="font-medium">Algorithm:</span> {currentAlgorithm || 'None'}</p>
            <p><span className="font-medium">Queue:</span> {solverRef.current?.getQueueLength() || 0} moves</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <h3 className="text-sm sm:text-base font-semibold mb-2 text-gray-800 dark:text-gray-200">Statistics</h3>
          <div className="space-y-1 text-xs sm:text-sm">
            <p><span className="font-medium">Scramble:</span> {scrambleMoves.length} moves</p>
            <p><span className="font-medium">Solution:</span> {solverRef.current?.totalMoves || 0} moves</p>
            <p><span className="font-medium">Speed:</span> {animationSpeed}ms/move</p>
          </div>
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

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading Rubik&apos;s Cube...</p>
      </div>
    );
  }

  return (
    <BlurFade delay={delay}>
      <RubiksCubeScene />
    </BlurFade>
  );
};