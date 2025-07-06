"use client";

import { useRef, useState, useEffect } from "react";
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

// CFOP Algorithm Definitions
const CFOP_ALGORITHMS = {
  // Common OLL cases
  OLL_T: "R U R' U' R' F R F'",
  OLL_U: "R U2 R' U' R U R' U' R U' R'",
  OLL_L: "F R' F' R U R U' R'",
  OLL_H: "R U R' U R U' R' U R U2 R'",
  
  // Common PLL cases
  PLL_T: "R U R' U' R' F R2 U' R' U' R U R' F'",
  PLL_U: "R U' R U R U R U' R' U' R2",
  PLL_Y: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  PLL_J: "R' U L' U2 R U' R' U2 R L U'",
  
  // Trigger moves
  SEXY_MOVE: "R U R' U'",
  SEXY_MOVE_INVERSE: "U R U' R'",
  SUNE: "R U R' U R U2 R'",
  ANTISUNE: "R' U' R U' R' U2 R"
};

// CFOP Solving Stages
enum SolvingStage {
  CROSS = "Cross",
  F2L = "F2L",
  OLL = "OLL",
  PLL = "PLL",
  SOLVED = "Solved"
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

  // Create a realistic scrambled state
  const createScrambledState = () => {
    const scrambled: { [key: string]: string[] } = {};
    
    cubePositions.forEach((position) => {
      const key = `${position[0]},${position[1]},${position[2]}`;
      const [x, y, z] = position;
      
      // Start with solved state
      let faceColors: string[] = [colors.white, colors.white, colors.white, colors.white, colors.white, colors.white];
      
      if (z === 1) faceColors[4] = colors.blue; // front
      else if (z === -1) faceColors[5] = colors.green; // back
      
      if (x === 1) faceColors[3] = colors.red; // right
      else if (x === -1) faceColors[2] = colors.orange; // left
      
      if (y === 1) faceColors[0] = colors.yellow; // top
      else if (y === -1) faceColors[1] = colors.white; // bottom
      
      scrambled[key] = faceColors;
    });
    
    // Apply random moves to scramble
    const positions = Object.keys(scrambled);
    for (let i = 0; i < 15; i++) {
      const pos1 = positions[Math.floor(Math.random() * positions.length)];
      const pos2 = positions[Math.floor(Math.random() * positions.length)];
      if (pos1 !== pos2) {
        const temp = scrambled[pos1];
        scrambled[pos1] = scrambled[pos2];
        scrambled[pos2] = temp;
      }
    }
    
    return scrambled;
  };

  // CFOP Cross Stage
  const solveCross = (currentState: { [key: string]: string[] }) => {
    setCurrentStage(SolvingStage.CROSS);
    setCurrentAlgorithm("Cross Formation");
    
    // Highlight cross pieces
    const crossPieces = [
      "0,-1,0", // center bottom
      "0,-1,1", // front edge
      "0,-1,-1", // back edge
      "1,-1,0", // right edge
      "-1,-1,0" // left edge
    ];
    
    crossPieces.forEach((key) => {
      if (currentState[key]) {
        const faceColors = [...currentState[key]];
        faceColors[1] = crossColor; // bottom face
        currentState[key] = faceColors;
      }
    });
    
    setCubeStates({ ...currentState });
  };

  // CFOP F2L Stage
  const solveF2L = (currentState: { [key: string]: string[] }) => {
    setCurrentStage(SolvingStage.F2L);
    setCurrentAlgorithm("F2L Pairing");
    
    // Solve F2L pairs
    const f2lPairs = [
      { corner: "1,-1,1", edge: "1,0,1" }, // front-right
      { corner: "-1,-1,1", edge: "-1,0,1" }, // front-left
      { corner: "1,-1,-1", edge: "1,0,-1" }, // back-right
      { corner: "-1,-1,-1", edge: "-1,0,-1" } // back-left
    ];
    
    f2lPairs.forEach((pair, index) => {
      setTimeout(() => {
        setCurrentAlgorithm(`F2L Pair ${index + 1}`);
        
        // Solve corner
        if (currentState[pair.corner]) {
          const faceColors = [...currentState[pair.corner]];
          faceColors[1] = crossColor; // bottom
          if (pair.corner.includes("1")) faceColors[3] = colors.red; // right
          else faceColors[2] = colors.orange; // left
          if (pair.corner.includes(",1")) faceColors[4] = colors.blue; // front
          else faceColors[5] = colors.green; // back
          currentState[pair.corner] = faceColors;
        }
        
        // Solve edge
        if (currentState[pair.edge]) {
          const faceColors = [...currentState[pair.edge]];
          if (pair.edge.includes("1")) faceColors[3] = colors.red; // right
          else faceColors[2] = colors.orange; // left
          if (pair.edge.includes(",1")) faceColors[4] = colors.blue; // front
          else faceColors[5] = colors.green; // back
          currentState[pair.edge] = faceColors;
        }
        
        setCubeStates({ ...currentState });
      }, index * 800);
    });
  };

  // CFOP OLL Stage
  const solveOLL = (currentState: { [key: string]: string[] }) => {
    setCurrentStage(SolvingStage.OLL);
    
    const ollAlgorithms = [
      { name: "T-Perm", algorithm: CFOP_ALGORITHMS.OLL_T },
      { name: "U-Perm", algorithm: CFOP_ALGORITHMS.OLL_U },
      { name: "L-Perm", algorithm: CFOP_ALGORITHMS.OLL_L },
      { name: "H-Perm", algorithm: CFOP_ALGORITHMS.OLL_H }
    ];
    
    ollAlgorithms.forEach((oll, index) => {
      setTimeout(() => {
        setCurrentAlgorithm(`${oll.name}: ${oll.algorithm}`);
        
        // Solve top layer orientation
        cubePositions.forEach((position) => {
          const key = `${position[0]},${position[1]},${position[2]}`;
          const [x, y, z] = position;
          
          if (y === 1) { // top layer
            const faceColors = [...currentState[key]];
            faceColors[0] = colors.yellow; // top face
            currentState[key] = faceColors;
          }
        });
        
        setCubeStates({ ...currentState });
      }, index * 600);
    });
  };

  // CFOP PLL Stage
  const solvePLL = (currentState: { [key: string]: string[] }) => {
    setCurrentStage(SolvingStage.PLL);
    
    const pllAlgorithms = [
      { name: "T-Perm", algorithm: CFOP_ALGORITHMS.PLL_T },
      { name: "U-Perm", algorithm: CFOP_ALGORITHMS.PLL_U },
      { name: "Y-Perm", algorithm: CFOP_ALGORITHMS.PLL_Y },
      { name: "J-Perm", algorithm: CFOP_ALGORITHMS.PLL_J }
    ];
    
    pllAlgorithms.forEach((pll, index) => {
      setTimeout(() => {
        setCurrentAlgorithm(`${pll.name}: ${pll.algorithm}`);
        
        // Solve top layer permutation
        cubePositions.forEach((position) => {
          const key = `${position[0]},${position[1]},${position[2]}`;
          const [x, y, z] = position;
          
          if (y === 1) { // top layer
            const faceColors = [...currentState[key]];
            faceColors[0] = colors.yellow; // top
            if (x === 1) faceColors[3] = colors.red; // right
            else if (x === -1) faceColors[2] = colors.orange; // left
            if (z === 1) faceColors[4] = colors.blue; // front
            else if (z === -1) faceColors[5] = colors.green; // back
            currentState[key] = faceColors;
          }
        });
        
        setCubeStates({ ...currentState });
      }, index * 500);
    });
  };

  // Execute trigger moves with faster animation
  const executeTriggerMove = (moveName: string, algorithm: string) => {
    setCurrentAlgorithm(`Trigger: ${moveName} - ${algorithm}`);
    // Trigger moves execute faster to emphasize efficiency
    return new Promise(resolve => setTimeout(resolve, 200));
  };

  const startSolving = async () => {
    setIsSolving(true);
    setIsSolved(false);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    
    // Randomly select cross color for color neutrality
    if (isColorNeutral) {
      const colorOptions = Object.values(colors);
      setCrossColor(colorOptions[Math.floor(Math.random() * colorOptions.length)]);
    }
    
    const scrambled = createScrambledState();
    setCubeStates(scrambled);
    
    let currentState = { ...scrambled };
    
    // CFOP Solving Sequence
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Cross Stage
    solveCross(currentState);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // F2L Stage
    solveF2L(currentState);
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Execute some trigger moves
    await executeTriggerMove("Sexy Move", CFOP_ALGORITHMS.SEXY_MOVE);
    await executeTriggerMove("Sune", CFOP_ALGORITHMS.SUNE);
    
    // OLL Stage
    solveOLL(currentState);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // PLL Stage
    solvePLL(currentState);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Final solved state
    setCurrentStage(SolvingStage.SOLVED);
    setCurrentAlgorithm("Cube Solved!");
    setIsSolved(true);
    setIsSolving(false);
  };

  const resetCube = () => {
    setIsSolving(false);
    setIsSolved(false);
    setCubeStates({});
    setCurrentStage(null);
    setCurrentAlgorithm("");
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