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

// Apple-style Button Component
const AppleButton = ({ 
  onClick, 
  disabled = false, 
  variant = 'primary',
  children,
  className = ''
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
}) => {
  const baseClasses = "px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 ease-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm";
  
  const variantClasses = {
    primary: "bg-black text-white hover:bg-gray-800 focus:ring-gray-500 disabled:bg-gray-300 disabled:text-gray-500",
    secondary: "bg-white text-black border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
};

// Main React Component - Now with Apple-style UI
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
  const [statusMessage, setStatusMessage] = useState('Ready to scramble or solve');
  
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
            setStatusMessage(`Solving ${currentStageInfo.stage}...`);
          }
        }
        
        // Check if solving is complete
        if (moveQueue.length === 1) {
          setIsSolving(false);
          setSolvingStage(SolvingStage.SOLVED);
          setStatusMessage('Cube solved! 🎉');
        }
      }, 300);
    }
  }, [solver, moveQueue, isAnimating]);

  const startSolving = async () => {
    // Use library's isSolved method
    const currentSolver = new CubeSolver(cubeState, COLORS, { debug: debugMode, enableLogging: debugMode });
    if (currentSolver.isSolved()) {
      setStatusMessage("Cube is already solved!");
      return;
    }
    
    setIsSolving(true);
    setSolvingStage(SolvingStage.CROSS);
    setStatusMessage("Generating CFOP solution...");
    
    try {
      // Create solver instance
      const newSolver = new CubeSolver(cubeState, COLORS, { debug: debugMode, enableLogging: debugMode });
      setSolver(newSolver);
      
      // Generate CFOP solution using library
      const solutionResult = newSolver.generateCFOPSolution();
      const solution = solutionResult.moves;
      
      if (solution && solution.length > 0) {
        setMoveQueue(solution as (BasicMove | CubeRotation)[]);
        setStatusMessage(`Starting solution with ${solution.length} moves`);
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
        setStatusMessage("Failed to generate solution");
      }
    } catch (error) {
      console.error("Error during CFOP solving:", error);
      setIsSolving(false);
      setSolvingStage(SolvingStage.SOLVED);
      setStatusMessage("Error occurred during solving");
    }
  };

  const scrambleCube = () => {
    setStatusMessage("Scrambling cube...");
    
    try {
      const { state: scrambledState, moves: scrambleMoves } = createScrambledState();
      setCubeState(scrambledState);
      setSolver(null);
      setMoveQueue([]);
      setIsSolving(false);
      setSolvingStage(SolvingStage.SOLVED);
      setStatusMessage(`Scrambled with ${scrambleMoves.length} moves - ready to solve!`);
      console.log(`Scrambled with: ${scrambleMoves.join(' ')} (${scrambleMoves.length} moves)`);
    } catch (error) {
      console.error("Error during scrambling:", error);
      setStatusMessage("Error occurred during scrambling");
    }
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
    setStatusMessage("Cube reset to solved state");
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
        <div className="debug-panel bg-gray-900 text-white p-6 mb-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-100">Debug Information</h3>
          <div className="space-y-2 text-sm font-mono">
            <p>State: <span className="text-green-400">{isSolving ? `Solving (${solvingStage})` : 'Idle'}</span></p>
            <p>Moves in queue: <span className="text-blue-400">{moveQueue.length}</span></p>
            <p>Current move: <span className="text-yellow-400">{currentMove || 'None'}</span></p>
            <p>Is solved: <span className={isCurrentlySolved() ? 'text-green-400' : 'text-red-400'}>{isCurrentlySolved() ? 'Yes' : 'No'}</span></p>
          </div>
        </div>
      )}

      {/* Apple-style Controls */}
      <div className="controls mb-6 flex gap-3 flex-wrap justify-center">
        <AppleButton 
          onClick={scrambleCube}
          disabled={isSolving}
          variant="secondary"
        >
          Scramble Cube
        </AppleButton>
        
        <AppleButton 
          onClick={startSolving}
          disabled={isSolving || isCurrentlySolved()}
          variant="primary"
        >
          CFOP Solve
        </AppleButton>
        
        <AppleButton 
          onClick={resetCube}
          disabled={isSolving}
          variant="secondary"
        >
          Reset to Solved
        </AppleButton>
        
        <AppleButton 
          onClick={() => setDebugMode(!debugMode)}
          variant="secondary"
          className="text-xs"
        >
          {debugMode ? 'Hide Debug' : 'Show Debug'}
        </AppleButton>
      </div>

      {/* Apple-style Status Display */}
      <div className="status mb-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isSolving ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="font-medium text-gray-900">
              {statusMessage}
            </span>
          </div>
          {moveQueue.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {moveQueue.length} moves remaining
            </span>
          )}
        </div>
        {currentMove && (
          <div className="mt-3 text-sm">
            <span className="text-gray-600">Executing: </span>
            <span className="font-mono bg-black text-white px-2 py-1 rounded text-xs">{currentMove}</span>
          </div>
        )}
      </div>

      {/* 3D Cube Visualization with White Background */}
      <div 
        className="canvas-container w-full h-96 border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: 'white' }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.6} />
          <pointLight position={[0, 10, 0]} intensity={0.4} />
          
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
      
      {/* Apple-style Footer */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Drag to rotate • Click buttons to interact
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">
              Rubik&apos;s Cube Solver
            </h2>
            <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto">
              Interactive 3D visualization of the CFOP method in Rubik&apos;s cube solving, featuring Cross, F2L, OLL, and PLL stages with beautiful Apple-inspired design.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-4xl shadow-lg">
            {isClient ? <RubiksCubeScene /> : (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading 3D Cube...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </BlurFade>
  );
};

export default RubiksCube; 