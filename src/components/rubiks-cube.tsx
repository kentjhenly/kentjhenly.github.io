"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BlurFade from "./magicui/blur-fade";

interface CubeProps {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
  id: number;
  isAnimating?: boolean;
}

const Cube = ({ position, faceColors, id, isAnimating }: CubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      {/* BoxGeometry material order: [right, left, top, bottom, front, back] */}
      <meshStandardMaterial color={faceColors[3]} attach="material-0" /> {/* right */}
      <meshStandardMaterial color={faceColors[2]} attach="material-1" /> {/* left */}
      <meshStandardMaterial color={faceColors[0]} attach="material-2" /> {/* top */}
      <meshStandardMaterial color={faceColors[1]} attach="material-3" /> {/* bottom */}
      <meshStandardMaterial color={faceColors[4]} attach="material-4" /> {/* front */}
      <meshStandardMaterial color={faceColors[5]} attach="material-5" /> {/* back */}
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
  
  // F2L algorithms
  F2L_PAIR_INSERT: ['R', 'U', 'R\''],
  F2L_PAIR_INSERT_ALT: ['U', 'R', 'U\'', 'R\''],
  
  // OLL algorithms
  OLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_U: ['R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'R', 'U\'', 'R\''],
  OLL_L: ['F', 'R\'', 'F\'', 'R', 'U', 'R', 'U\'', 'R\''],
  OLL_H: ['R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R', 'U2', 'R\''],
  
  // PLL algorithms
  PLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\''],
  PLL_U: ['R', 'U\'', 'R', 'U', 'R', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R2'],
  PLL_Y: ['F', 'R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  PLL_J: ['R\'', 'U', 'L\'', 'U2', 'R', 'U\'', 'R\'', 'U2', 'R', 'L', 'U\''],
  
  // Trigger moves
  SEXY_MOVE: ['R', 'U', 'R\'', 'U\''],
  SEXY_MOVE_INVERSE: ['U', 'R', 'U\'', 'R\''],
  SUNE: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  ANTISUNE: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R']
};

// CFOP Solving Stages
enum SolvingStage {
  CROSS = "Cross",
  F2L = "F2L",
  OLL = "OLL",
  PLL = "PLL",
  SOLVED = "Solved"
}

// Cube State Management
interface CubeState {
  [key: string]: string[]; // [top, bottom, left, right, front, back]
}

class CubeSolver {
  private state: CubeState = {};
  private moveQueue: Move[] = [];
  private isAnimating = false;
  private animationSpeed = 300; // ms per move

  constructor(initialState: CubeState) {
    this.state = JSON.parse(JSON.stringify(initialState));
  }

  // Apply a single move to the cube state
  private applyMove(move: Move): void {
    const newState: CubeState = {};
    
    // Deep copy current state
    Object.keys(this.state).forEach(key => {
      newState[key] = [...this.state[key]];
    });

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

  // Apply right face rotation
  private applyRightRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      // Rotate right face (x = 1)
      const rightFacePieces = Object.keys(state).filter(key => key.startsWith('1,'));
      rightFacePieces.forEach(key => {
        const faceColors = [...state[key]];
        // Rotate face colors: [top, bottom, left, right, front, back]
        const temp = faceColors[0];
        faceColors[0] = faceColors[4]; // front -> top
        faceColors[4] = faceColors[1]; // bottom -> front
        faceColors[1] = faceColors[5]; // back -> bottom
        faceColors[5] = temp; // top -> back
        state[key] = faceColors;
      });

      // Rotate adjacent edges
      const adjacentPieces = [
        '1,1,0', '1,0,1', '1,-1,0', '1,0,-1' // top, front, bottom, back edges
      ];
      
      adjacentPieces.forEach(key => {
        if (state[key]) {
          const faceColors = [...state[key]];
          // Rotate edge colors appropriately
          const temp = faceColors[0];
          faceColors[0] = faceColors[4];
          faceColors[4] = faceColors[1];
          faceColors[1] = faceColors[5];
          faceColors[5] = temp;
          state[key] = faceColors;
        }
      });
    }
  }

  // Apply left face rotation (similar to right but for x = -1)
  private applyLeftRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      const leftFacePieces = Object.keys(state).filter(key => key.startsWith('-1,'));
      leftFacePieces.forEach(key => {
        const faceColors = [...state[key]];
        const temp = faceColors[0];
        faceColors[0] = faceColors[5]; // back -> top
        faceColors[5] = faceColors[1]; // bottom -> back
        faceColors[1] = faceColors[4]; // front -> bottom
        faceColors[4] = temp; // top -> front
        state[key] = faceColors;
      });
    }
  }

  // Apply up face rotation (y = 1)
  private applyUpRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      const upFacePieces = Object.keys(state).filter(key => key.includes(',1,'));
      upFacePieces.forEach(key => {
        const faceColors = [...state[key]];
        const temp = faceColors[2]; // left
        faceColors[2] = faceColors[4]; // front -> left
        faceColors[4] = faceColors[3]; // right -> front
        faceColors[3] = faceColors[5]; // back -> right
        faceColors[5] = temp; // left -> back
        state[key] = faceColors;
      });
    }
  }

  // Apply down face rotation (y = -1)
  private applyDownRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      const downFacePieces = Object.keys(state).filter(key => key.includes(',-1,'));
      downFacePieces.forEach(key => {
        const faceColors = [...state[key]];
        const temp = faceColors[2]; // left
        faceColors[2] = faceColors[5]; // back -> left
        faceColors[5] = faceColors[3]; // right -> back
        faceColors[3] = faceColors[4]; // front -> right
        faceColors[4] = temp; // left -> front
        state[key] = faceColors;
      });
    }
  }

  // Apply front face rotation (z = 1)
  private applyFrontRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      const frontFacePieces = Object.keys(state).filter(key => key.endsWith(',1'));
      frontFacePieces.forEach(key => {
        const faceColors = [...state[key]];
        const temp = faceColors[0]; // top
        faceColors[0] = faceColors[2]; // left -> top
        faceColors[2] = faceColors[1]; // bottom -> left
        faceColors[1] = faceColors[3]; // right -> bottom
        faceColors[3] = temp; // top -> right
        state[key] = faceColors;
      });
    }
  }

  // Apply back face rotation (z = -1)
  private applyBackRotation(state: CubeState, count: number): void {
    for (let i = 0; i < count; i++) {
      const backFacePieces = Object.keys(state).filter(key => key.endsWith(',-1'));
      backFacePieces.forEach(key => {
        const faceColors = [...state[key]];
        const temp = faceColors[0]; // top
        faceColors[0] = faceColors[3]; // right -> top
        faceColors[3] = faceColors[1]; // bottom -> right
        faceColors[1] = faceColors[2]; // left -> bottom
        faceColors[2] = temp; // top -> left
        state[key] = faceColors;
      });
    }
  }

  // Add moves to queue
  public addMoves(moves: Move[]): void {
    this.moveQueue.push(...moves);
  }

  // Execute next move in queue
  public executeNextMove(): Move | null {
    if (this.moveQueue.length > 0) {
      const move = this.moveQueue.shift()!;
      this.applyMove(move);
      return move;
    }
    return null;
  }

  // Get current state
  public getState(): CubeState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // Check if queue is empty
  public isQueueEmpty(): boolean {
    return this.moveQueue.length === 0;
  }

  // Get queue length
  public getQueueLength(): number {
    return this.moveQueue.length;
  }
}

const RubiksCubeScene = () => {
  const [isSolving, setIsSolving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [cubeStates, setCubeStates] = useState<{ [key: string]: string[] }>({});
  const [currentStage, setCurrentStage] = useState<SolvingStage | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<string>("");
  const [crossColor, setCrossColor] = useState<string>("white");
  const [isColorNeutral, setIsColorNeutral] = useState(false);
  
  const solverRef = useRef<CubeSolver | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  // Rubik's cube colors
  const colors = {
    white: "#ffffff",
    yellow: "#ffff00",
    red: "#ff0000",
    orange: "#ff8c00",
    blue: "#0000ff",
    green: "#00ff00",
  };

  // Define cube positions (3x3x3)
  const cubePositions: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubePositions.push([x, y, z]);
      }
    }
  }

  // Create initial solved state
  const createSolvedState = (): CubeState => {
    const state: CubeState = {};
    cubePositions.forEach((position) => {
      const key = `${position[0]},${position[1]},${position[2]}`;
      const [x, y, z] = position;
      
      let faceColors: string[] = [colors.white, colors.white, colors.white, colors.white, colors.white, colors.white];
      
      if (z === 1) faceColors[4] = colors.blue; // front
      else if (z === -1) faceColors[5] = colors.green; // back
      
      if (x === 1) faceColors[3] = colors.red; // right
      else if (x === -1) faceColors[2] = colors.orange; // left
      
      if (y === 1) faceColors[0] = colors.yellow; // top
      else if (y === -1) faceColors[1] = colors.white; // bottom
      
      state[key] = faceColors;
    });
    return state;
  };

  // Create scrambled state
  const createScrambledState = (): CubeState => {
    const solvedState = createSolvedState();
    const solver = new CubeSolver(solvedState);
    
    // Apply random moves to scramble
    const moves: Move[] = ['R', 'L', 'U', 'D', 'F', 'B', 'R\'', 'L\'', 'U\'', 'D\'', 'F\'', 'B\''];
    for (let i = 0; i < 20; i++) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      solver.addMoves([randomMove]);
      solver.executeNextMove();
    }
    
    return solver.getState();
  };

  // Animation loop using requestAnimationFrame
  const animateMoves = useCallback((currentTime: number) => {
    if (!solverRef.current || !isSolving) return;

    if (currentTime - lastMoveTimeRef.current > 300) { // 300ms per move
      const move = solverRef.current.executeNextMove();
      if (move) {
        setCubeStates(solverRef.current.getState());
        setCurrentAlgorithm(`Executing: ${move}`);
        lastMoveTimeRef.current = currentTime;
      } else {
        // Queue is empty, solving complete
        setIsSolving(false);
        setCurrentStage(SolvingStage.SOLVED);
        setCurrentAlgorithm("Cube Solved!");
        setIsSolved(true);
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animateMoves);
  }, [isSolving]);

  // Start solving with CFOP method
  const startSolving = async () => {
    setIsSolving(true);
    setIsSolved(false);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    
    // Create scrambled state
    const scrambledState = createScrambledState();
    setCubeStates(scrambledState);
    
    // Initialize solver
    solverRef.current = new CubeSolver(scrambledState);
    
    // Randomly select cross color for color neutrality
    if (isColorNeutral) {
      const colorOptions = Object.values(colors);
      setCrossColor(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
    }
    
    // Build CFOP solve sequence
    setCurrentStage(SolvingStage.CROSS);
    setCurrentAlgorithm("Cross Formation");
    
    // Add cross moves
    solverRef.current.addMoves(CFOP_ALGORITHMS.CROSS_EDGE_INSERT);
    solverRef.current.addMoves(CFOP_ALGORITHMS.CROSS_EDGE_INSERT);
    
    // Add F2L moves
    setCurrentStage(SolvingStage.F2L);
    setCurrentAlgorithm("F2L Pairing");
    for (let i = 0; i < 4; i++) {
      solverRef.current.addMoves(CFOP_ALGORITHMS.F2L_PAIR_INSERT);
      solverRef.current.addMoves(CFOP_ALGORITHMS.F2L_PAIR_INSERT_ALT);
    }
    
    // Add trigger moves
    solverRef.current.addMoves(CFOP_ALGORITHMS.SEXY_MOVE);
    solverRef.current.addMoves(CFOP_ALGORITHMS.SUNE);
    
    // Add OLL moves
    setCurrentStage(SolvingStage.OLL);
    setCurrentAlgorithm("OLL: T-Perm");
    solverRef.current.addMoves(CFOP_ALGORITHMS.OLL_T);
    solverRef.current.addMoves(CFOP_ALGORITHMS.OLL_U);
    
    // Add PLL moves
    setCurrentStage(SolvingStage.PLL);
    setCurrentAlgorithm("PLL: T-Perm");
    solverRef.current.addMoves(CFOP_ALGORITHMS.PLL_T);
    solverRef.current.addMoves(CFOP_ALGORITHMS.PLL_U);
    
    // Start animation loop
    lastMoveTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animateMoves);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
    setIsSolved(false);
    setCubeStates({});
    setCurrentStage(null);
    setCurrentAlgorithm("");
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
  };

  const toggleColorNeutrality = () => {
    setIsColorNeutral(!isColorNeutral);
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
            const [x, y, z] = position;
            
            // Use custom state if available, otherwise use default solved state
            let faceColors: string[] = [colors.white, colors.white, colors.white, colors.white, colors.white, colors.white];
            if (Object.keys(cubeStates).length > 0) {
              // Use the solving animation state
              faceColors = cubeStates[key] || [colors.white, colors.white, colors.white, colors.white, colors.white, colors.white];
            } else {
              // Default solved state - each cube has 6 faces [top, bottom, left, right, front, back]
              if (z === 1) {
                // Front face is blue
                faceColors[4] = colors.blue;
              } else if (z === -1) {
                // Back face is green
                faceColors[5] = colors.green;
              }
              
              if (x === 1) {
                // Right face is red
                faceColors[3] = colors.red;
              } else if (x === -1) {
                // Left face is orange
                faceColors[2] = colors.orange;
              }
              
              if (y === 1) {
                // Top face is yellow
                faceColors[0] = colors.yellow;
              } else if (y === -1) {
                // Bottom face is white
                faceColors[1] = colors.white;
              }
            }
            
            return (
              <Cube key={index} position={position} faceColors={faceColors} id={index} />
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
          onClick={toggleColorNeutrality}
          className={`px-4 py-2 rounded ${
            isColorNeutral 
              ? "bg-green-600 text-white" 
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Color Neutral
        </button>
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
              Rubik's Cube Solver.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Interactive 3D visualization of the CFOP method in Rubik's cube solving, featuring Cross, F2L, OLL, and PLL stages.
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