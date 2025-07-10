'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import BlurFade from '@/components/magicui/blur-fade';
import { 
  CubeSolver, 
  CubeState, 
  CubePiece, 
  SolvingStage, 
  ColorScheme, 
  BasicMove,
  Move,
  CubeRotation,
  isBasicMove,
  createSolvedState,
  DEFAULT_COLORS as COLORS
} from '@/lib/cube-solver';

// Type definitions for Three.js integration
type ThreeElement = THREE.Mesh;

interface CubeProps {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
  id: number;
  isHighlighted?: boolean;
}

const Cube = ({ position, faceColors, id, isHighlighted }: CubeProps) => {
  const meshRef = useRef<ThreeElement>(null);
  
  // Convert coordinates to unique string for React key
  const cubeKey = `${position[0]}_${position[1]}_${position[2]}`;
  
  return (
    <mesh key={cubeKey} ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {faceColors.map((color, index) => (
        <meshStandardMaterial 
          key={index} 
          attach={`material-${index}`} 
          color={color}
          transparent={isHighlighted}
          opacity={isHighlighted ? 0.7 : 1.0}
        />
      ))}
    </mesh>
  );
};

const RotatingCubeGroup = ({ isSolving, children, groupRef }: { 
  isSolving: boolean; 
  children: React.ReactNode;
  groupRef: React.RefObject<THREE.Group>;
}) => {
  useFrame((state, delta) => {
    if (groupRef.current && !isSolving) {
      groupRef.current.rotation.x += delta * 0.3;
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};

const SimplifiedCube = ({ position, faceColors, id, isHighlighted }: CubeProps) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {faceColors.map((color, index) => (
        <meshStandardMaterial key={index} attach={`material-${index}`} color={color} />
      ))}
    </mesh>
  );
};

// Main React Component - Now properly using library
const RubiksCubeScene = () => {
  // Cube state management using library functions
  const [cubeState, setCubeState] = useState<CubeState>(() => createSolvedState(COLORS));
  const [solver, setSolver] = useState<CubeSolver | null>(null);
  const [moveQueue, setMoveQueue] = useState<(BasicMove | CubeRotation)[]>([]);
  const [currentMove, setCurrentMove] = useState<BasicMove | CubeRotation | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solvingStage, setSolvingStage] = useState<SolvingStage>(SolvingStage.SOLVED);
  const [isAnimating, setIsAnimating] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Scramble function using library solver
  const createScrambledState = (): { state: CubeState; moves: BasicMove[] } => {
    const solvedState = createSolvedState(COLORS);
    const scramblingSolver = new CubeSolver(solvedState, COLORS, { debug: false, enableLogging: false });
    
    // Generate scramble sequence
    const possibleMoves: BasicMove[] = ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'];
    const moves: BasicMove[] = [];
    const numMoves = 25 + Math.floor(Math.random() * 10); // 25-35 moves
    
    // Simple scramble generation (avoiding consecutive identical moves)
    let lastMove: BasicMove | null = null;
    for (let i = 0; i < numMoves; i++) {
      let randomMove: BasicMove;
      do {
        randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      } while (lastMove && randomMove === lastMove);
      
      moves.push(randomMove);
      lastMove = randomMove;
    }
    
    // Apply scramble moves
    scramblingSolver.addMoves(moves);
    while (!scramblingSolver.isQueueEmpty()) {
      scramblingSolver.executeNextMove();
    }
    
    return { state: scramblingSolver.getState(), moves };
  };

  // Animation and move execution
  useEffect(() => {
    if (solver && !isAnimating && moveQueue.length > 0) {
      const nextMove = moveQueue[0];
      setCurrentMove(nextMove);
      setIsAnimating(true);
      
      // Execute move using library solver
      solver.addMoves([nextMove]);
      solver.executeNextMove();
      setCubeState(solver.getState());
      
      // Animation timing
      setTimeout(() => {
        setMoveQueue(prev => prev.slice(1));
        setCurrentMove(null);
        setIsAnimating(false);
        
        // Update solving stage based on solver's stages info
        if (solver.stages && solver.stages.length > 0) {
          const totalMoves = solver.stages[solver.stages.length - 1].endIndex + 1;
          const completedMoves = totalMoves - moveQueue.length + 1;
          
          const currentStageInfo = solver.stages.find(stage => 
            completedMoves >= stage.startIndex && completedMoves <= stage.endIndex
          );
          if (currentStageInfo) {
            setSolvingStage(currentStageInfo.stage);
          }
        }
        
        // Check if solving is complete
        if (moveQueue.length === 1) {
          setIsSolving(false);
          setSolvingStage(SolvingStage.SOLVED);
        }
      }, 300);
    }
  }, [solver, moveQueue, isAnimating]);

  const startSolving = async () => {
    // Use library's isSolved method
    const currentSolver = new CubeSolver(cubeState, COLORS, { debug: debugMode, enableLogging: debugMode });
    if (currentSolver.isSolved()) {
      alert("Cube is already solved!");
      return;
    }
    
    setIsSolving(true);
    setSolvingStage(SolvingStage.CROSS);
    
    try {
      // Create solver instance
      const newSolver = new CubeSolver(cubeState, COLORS, { debug: debugMode, enableLogging: debugMode });
      setSolver(newSolver);
      
      // Generate CFOP solution using library
      const solutionResult = newSolver.generateCFOPSolution();
      const solution = solutionResult.moves;
      
      if (solution && solution.length > 0) {
        setMoveQueue(solution as (BasicMove | CubeRotation)[]);
        console.log(`CFOP Solution: ${solution.join(' ')} (${solution.length} moves)`);
        
        // Display stage information
        if (solutionResult.stages) {
          console.log("Solving stages:");
          solutionResult.stages.forEach(stage => {
            const stageMoves = solution.slice(stage.startIndex, stage.endIndex + 1);
            console.log(`${stage.stage}: ${stageMoves.join(' ')} (${stageMoves.length} moves)`);
          });
        }
      } else {
        console.error("Failed to generate solution");
        setIsSolving(false);
        setSolvingStage(SolvingStage.SOLVED);
      }
    } catch (error) {
      console.error("Error during CFOP solving:", error);
      setIsSolving(false);
      setSolvingStage(SolvingStage.SOLVED);
    }
  };

  const scrambleCube = () => {
    const { state: scrambledState, moves: scrambleMoves } = createScrambledState();
    setCubeState(scrambledState);
    setSolver(null);
    setMoveQueue([]);
    setIsSolving(false);
    setSolvingStage(SolvingStage.SOLVED);
    console.log(`Scrambled with: ${scrambleMoves.join(' ')} (${scrambleMoves.length} moves)`);
  };

  // Mouse interaction handlers
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !groupRef.current) return;
    
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    
    groupRef.current.rotation.y += deltaMove.x * 0.01;
    groupRef.current.rotation.x += deltaMove.y * 0.01;
    
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetCube = () => {
    setCubeState(createSolvedState(COLORS));
    setSolver(null);
    setMoveQueue([]);
    setIsSolving(false);
    setSolvingStage(SolvingStage.SOLVED);
  };

  if (!isClient) return <div>Loading...</div>;

  // Check if current state is solved using library
  const isCurrentlySolved = () => {
    const tempSolver = new CubeSolver(cubeState, COLORS);
    return tempSolver.isSolved();
  };

  return (
    <div className="cube-container">
      {/* Debug Panel */}
      {debugMode && (
        <div className="debug-panel bg-gray-800 text-white p-4 mb-4 rounded">
          <h3 className="text-lg font-bold mb-2">Debug Info</h3>
          <p>State: {isSolving ? `Solving (${solvingStage})` : 'Idle'}</p>
          <p>Moves in queue: {moveQueue.length}</p>
          <p>Current move: {currentMove || 'None'}</p>
          <p>Is solved: {isCurrentlySolved() ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* Controls */}
      <div className="controls mb-4 flex gap-4 flex-wrap">
        <button 
          onClick={scrambleCube}
          disabled={isSolving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Scramble Cube
        </button>
        
        <button 
          onClick={startSolving}
          disabled={isSolving || isCurrentlySolved()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          CFOP Solve
        </button>
        
        <button 
          onClick={resetCube}
          disabled={isSolving}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Reset to Solved
        </button>
        
        <button 
          onClick={() => setDebugMode(!debugMode)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {debugMode ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>

      {/* Status Display */}
      <div className="status mb-4 p-3 bg-gray-100 rounded">
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            Status: {isSolving ? `Solving - ${solvingStage}` : 'Ready'}
          </span>
          {moveQueue.length > 0 && (
            <span className="text-sm text-gray-600">
              Moves remaining: {moveQueue.length}
            </span>
          )}
        </div>
        {currentMove && (
          <div className="mt-2 text-sm">
            Executing: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{currentMove}</span>
          </div>
        )}
      </div>

      {/* 3D Cube Visualization */}
      <div 
        className="canvas-container w-full h-96 border rounded"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <RotatingCubeGroup isSolving={isSolving} groupRef={groupRef}>
            {cubeState.pieces.map((piece, index) => (
              <SimplifiedCube
                key={`${piece.position[0]}_${piece.position[1]}_${piece.position[2]}`}
                position={piece.position}
                faceColors={piece.faceColors}
                id={index}
                isHighlighted={false}
              />
            ))}
          </RotatingCubeGroup>
        </Canvas>
      </div>
    </div>
  );
};

// Main Component for Export
const RubiksCube = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <BlurFade delay={0.25} inView>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="text-center space-y-2">
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