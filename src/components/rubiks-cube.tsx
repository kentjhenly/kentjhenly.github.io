"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import BlurFade from "./magicui/blur-fade";

interface CubeProps {
  position: [number, number, number];
  color: string;
}

const Cube = ({ position, color }: CubeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

interface RubiksCubeProps {
  delay?: number;
}

const RubiksCubeScene = ({ delay = 0 }: RubiksCubeProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

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

  // Simple solving algorithm steps (R U R' U')
  const solvingSteps = useMemo(() => [
    { rotation: "R", axis: "y", angle: Math.PI / 2 },
    { rotation: "U", axis: "x", angle: -Math.PI / 2 },
    { rotation: "R'", axis: "y", angle: -Math.PI / 2 },
    { rotation: "U'", axis: "x", angle: Math.PI / 2 },
  ], []);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation when not solving
      if (!isSolving) {
        groupRef.current.rotation.y += 0.005;
        groupRef.current.rotation.x += 0.002;
      }
    }
  });

  const startSolving = () => {
    setIsSolving(true);
    setCurrentStep(0);
  };

  const resetCube = () => {
    setIsSolving(false);
    setCurrentStep(0);
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
  };

  // Animate solving steps
  useEffect(() => {
    if (isSolving && currentStep < solvingSteps.length) {
      const timer = setTimeout(() => {
        if (groupRef.current) {
          const step = solvingSteps[currentStep];
          const duration = 1000; // 1 second per move
          
          // Animate the rotation
          const startRotation = groupRef.current.rotation[step.axis as keyof THREE.Euler] as number;
          const targetRotation = startRotation + step.angle;
          
          const animate = (progress: number) => {
            if (groupRef.current) {
              const currentRotation = startRotation + (targetRotation - startRotation) * progress;
              (groupRef.current.rotation as any)[step.axis] = currentRotation;
            }
          };

          // Simple animation
          let startTime = Date.now();
          const animateStep = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            animate(progress);
            
            if (progress < 1) {
              requestAnimationFrame(animateStep);
            } else {
              setCurrentStep(currentStep + 1);
            }
          };
          
          animateStep();
        }
      }, 500);

      return () => clearTimeout(timer);
    } else if (isSolving && currentStep >= solvingSteps.length) {
      // Solving complete
      setTimeout(() => {
        setIsSolving(false);
      }, 1000);
    }
  }, [isSolving, currentStep, solvingSteps]);

  return (
    <div className="w-full h-96 relative">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <group ref={groupRef}>
          {/* Generate all 27 cubes */}
          {cubePositions.map((position, index) => {
            // Determine color based on position
            let color = colors.white;
            const [x, y, z] = position;
            
            if (z === 1) color = colors.blue;
            else if (z === -1) color = colors.green;
            else if (x === 1) color = colors.red;
            else if (x === -1) color = colors.orange;
            else if (y === 1) color = colors.yellow;
            else if (y === -1) color = colors.white;
            
            return (
              <Cube key={index} position={position} color={color} />
            );
          })}
        </group>
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        
        {/* Status text */}
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {isSolving ? `Solving... Step ${currentStep + 1}/${solvingSteps.length}` : "Rubik's Cube"}
        </Text>
      </Canvas>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={startSolving}
          disabled={isSolving}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Solve
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
              3D Rubik&apos;s Cube Solver.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Interactive 3D visualization of a Rubik&apos;s cube solving algorithm.
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