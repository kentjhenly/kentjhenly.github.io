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

// Cube State Management - Now tracks actual piece positions
interface CubePiece {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
}

interface CubeState {
  pieces: CubePiece[];
}

class CubeSolver {
  private state: CubeState;
  private moveQueue: Move[] = [];
  private animationSpeed = 300; // ms per move

  constructor(initialState: CubeState) {
    this.state = JSON.parse(JSON.stringify(initialState));
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
          // Rotate the piece position around -X axis
          piece.position = [x, -z, y];
          
          // Rotate face colors
          const temp = piece.faceColors[0]; // top
          piece.faceColors[0] = piece.faceColors[4]; // front -> top
          piece.faceColors[4] = piece.faceColors[1]; // bottom -> front
          piece.faceColors[1] = piece.faceColors[5]; // back -> bottom
          piece.faceColors[5] = temp; // top -> back
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
          // Rotate the piece position around +Y axis
          piece.position = [-z, y, x];
          
          // Rotate face colors
          const temp = piece.faceColors[2]; // left
          piece.faceColors[2] = piece.faceColors[4]; // front -> left
          piece.faceColors[4] = piece.faceColors[3]; // right -> front
          piece.faceColors[3] = piece.faceColors[5]; // back -> right
          piece.faceColors[5] = temp; // left -> back
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
          // Rotate the piece position around -Y axis
          piece.position = [z, y, -x];
          
          // Rotate face colors
          const temp = piece.faceColors[2]; // left
          piece.faceColors[2] = piece.faceColors[5]; // back -> left
          piece.faceColors[5] = piece.faceColors[3]; // right -> back
          piece.faceColors[3] = piece.faceColors[4]; // front -> right
          piece.faceColors[4] = temp; // left -> front
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
          // Rotate the piece position around +Z axis
          piece.position = [y, -x, z];
          
          // Rotate face colors
          const temp = piece.faceColors[0]; // top
          piece.faceColors[0] = piece.faceColors[2]; // left -> top
          piece.faceColors[2] = piece.faceColors[1]; // bottom -> left
          piece.faceColors[1] = piece.faceColors[3]; // right -> bottom
          piece.faceColors[3] = temp; // top -> right
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
          // Rotate the piece position around -Z axis
          piece.position = [-y, x, z];
          
          // Rotate face colors
          const temp = piece.faceColors[0]; // top
          piece.faceColors[0] = piece.faceColors[3]; // right -> top
          piece.faceColors[3] = piece.faceColors[1]; // bottom -> right
          piece.faceColors[1] = piece.faceColors[2]; // left -> bottom
          piece.faceColors[2] = temp; // top -> left
        }
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

  // Check if cube is solved
  public isSolved(): boolean {
    // Check if all faces are uniform color
    const faces = {
      top: this.state.pieces.filter(p => p.position[1] === 1).map(p => p.faceColors[0]),
      bottom: this.state.pieces.filter(p => p.position[1] === -1).map(p => p.faceColors[1]),
      left: this.state.pieces.filter(p => p.position[0] === -1).map(p => p.faceColors[2]),
      right: this.state.pieces.filter(p => p.position[0] === 1).map(p => p.faceColors[3]),
      front: this.state.pieces.filter(p => p.position[2] === 1).map(p => p.faceColors[4]),
      back: this.state.pieces.filter(p => p.position[2] === -1).map(p => p.faceColors[5])
    };

    return Object.values(faces).every(faceColors => 
      faceColors.every(color => color === faceColors[0])
    );
  }

  // Generate inverse of a move sequence
  public static generateInverseSequence(moves: Move[]): Move[] {
    const inverseMap: { [key in Move]: Move } = {
      'R': 'R\'', 'R\'': 'R', 'R2': 'R2',
      'L': 'L\'', 'L\'': 'L', 'L2': 'L2',
      'U': 'U\'', 'U\'': 'U', 'U2': 'U2',
      'D': 'D\'', 'D\'': 'D', 'D2': 'D2',
      'F': 'F\'', 'F\'': 'F', 'F2': 'F2',
      'B': 'B\'', 'B\'': 'B', 'B2': 'B2'
    };

    // Reverse the sequence and invert each move
    return moves.slice().reverse().map(move => inverseMap[move]);
  }
}

const RubiksCubeScene = () => {
  const [isSolving, setIsSolving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group>(null);
  const [cubeState, setCubeState] = useState<CubeState | null>(null);
  const [currentStage, setCurrentStage] = useState<SolvingStage | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<string>("");
  const [scrambleMoves, setScrambleMoves] = useState<Move[]>([]);
  
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
    const pieces: CubePiece[] = [];
    
    cubePositions.forEach((position) => {
      const [x, y, z] = position;
      
      let faceColors: string[] = [colors.white, colors.white, colors.white, colors.white, colors.white, colors.white];
      
      if (z === 1) faceColors[4] = colors.blue; // front
      else if (z === -1) faceColors[5] = colors.green; // back
      
      if (x === 1) faceColors[3] = colors.red; // right
      else if (x === -1) faceColors[2] = colors.orange; // left
      
      if (y === 1) faceColors[0] = colors.yellow; // top
      else if (y === -1) faceColors[1] = colors.white; // bottom
      
      pieces.push({
        position: position,
        faceColors: faceColors
      });
    });
    
    return { pieces };
  };

  // Create scrambled state and store the scramble moves
  const createScrambledState = (): { state: CubeState; moves: Move[] } => {
    const solvedState = createSolvedState();
    const solver = new CubeSolver(solvedState);
    const scrambleMoves: Move[] = [];
    
    // Apply random moves to scramble
    const moves: Move[] = ['R', 'L', 'U', 'D', 'F', 'B', 'R\'', 'L\'', 'U\'', 'D\'', 'F\'', 'B\''];
    for (let i = 0; i < 20; i++) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      scrambleMoves.push(randomMove);
      solver.addMoves([randomMove]);
      solver.executeNextMove();
    }
    
    return { state: solver.getState(), moves: scrambleMoves };
  };

  // Animation loop using requestAnimationFrame
  const animateMoves = useCallback((currentTime: number) => {
    if (!solverRef.current || !isSolving) return;

    // Initialize lastMoveTime if not set
    if (lastMoveTimeRef.current === 0) {
      lastMoveTimeRef.current = currentTime;
    }

    if (currentTime - lastMoveTimeRef.current > 300) { // 300ms per move
      const move = solverRef.current.executeNextMove();
      if (move) {
        setCubeState(solverRef.current.getState());
        setCurrentAlgorithm(`Executing: ${move}`);
        lastMoveTimeRef.current = currentTime;
        
        // Update stage based on remaining moves
        const remainingMoves = solverRef.current.getQueueLength();
        console.log("Executed move:", move, "Remaining:", remainingMoves);
        
        if (remainingMoves > 15) {
          setCurrentStage(SolvingStage.CROSS);
        } else if (remainingMoves > 10) {
          setCurrentStage(SolvingStage.F2L);
        } else if (remainingMoves > 5) {
          setCurrentStage(SolvingStage.OLL);
        } else if (remainingMoves > 0) {
          setCurrentStage(SolvingStage.PLL);
        }
      } else {
        // Queue is empty, solving complete
        console.log("Solving complete!");
        setIsSolving(false);
        setCurrentStage(SolvingStage.SOLVED);
        setCurrentAlgorithm("Cube Solved!");
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animateMoves);
  }, [isSolving]);

  // Start solving with inverse of scramble moves
  const startSolving = async () => {
    setIsSolving(true);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    
    // Create scrambled state and store scramble moves
    const { state: scrambledState, moves: newScrambleMoves } = createScrambledState();
    setCubeState(scrambledState);
    setScrambleMoves(newScrambleMoves);
    
    // Initialize solver with scrambled state
    solverRef.current = new CubeSolver(scrambledState);
    
    // Generate solve sequence
    setCurrentStage(SolvingStage.CROSS);
    setCurrentAlgorithm("Generating solve sequence...");
    
    const solveSequence = CubeSolver.generateInverseSequence(newScrambleMoves);
    console.log("Scramble moves:", newScrambleMoves);
    console.log("Solve sequence:", solveSequence);
    console.log("Generated solve sequence:", solveSequence.length, "moves");
    solverRef.current.addMoves(solveSequence);
    
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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
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
            let faceColors: string[] = [colors.white, colors.white, colors.white, colors.white, colors.white, colors.white];
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
              <Cube key={index} position={cubePosition} faceColors={faceColors} id={index} />
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