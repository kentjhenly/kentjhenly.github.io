'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Monochromatic blue color scheme
const COLORS = {
  white: '#CAF0F8', // Pale Blue
  yellow: '#ADE8F4', // Slightly darker pale blue
  red: '#90E0EF', // Light Blue
  orange: '#48CAE4', // Medium light blue
  blue: '#0077B6', // Medium Blue
  green: '#023E8A', // Dark Blue
};

// Rubik's cube face component
const CubeFace = ({ 
  position, 
  rotation, 
  color, 
  size = 1 
}: { 
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  size?: number;
}) => {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[size, size, 0.1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Individual cube piece component
const CubePiece = ({ 
  position, 
  colors 
}: { 
  position: [number, number, number];
  colors: { [face: string]: string };
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create geometry for a cube piece with colored faces
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    
    // Create materials for each face
    const materials = [
      new THREE.MeshStandardMaterial({ color: colors.right || '#333' }), // +X
      new THREE.MeshStandardMaterial({ color: colors.left || '#333' }),  // -X
      new THREE.MeshStandardMaterial({ color: colors.top || '#333' }),   // +Y
      new THREE.MeshStandardMaterial({ color: colors.bottom || '#333' }), // -Y
      new THREE.MeshStandardMaterial({ color: colors.front || '#333' }), // +Z
      new THREE.MeshStandardMaterial({ color: colors.back || '#333' }),  // -Z
    ];
    
    return { geometry: geo, materials };
  }, [colors]);
  
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <primitive object={geometry.geometry} />
      {geometry.materials.map((material, index) => (
        <primitive key={index} object={material} attach={`material-${index}`} />
      ))}
    </mesh>
  );
};

// Rubik's cube component
const RubiksCube = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  const [isRotating, setIsRotating] = useState(true);
  
  // Auto-rotation
  useFrame(() => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.5;
    }
  });
  
  // Generate cube pieces with the blue color scheme
  const cubePieces = useMemo(() => {
    const pieces = [];
    const size = 3; // 3x3x3 cube
    const spacing = 1.1; // Slight gap between pieces
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the center piece (0,0,0) as it's not visible
          if (x === 0 && y === 0 && z === 0) continue;
          
          const colors: { [face: string]: string } = {};
          
          // Assign colors based on position
          if (x === 1) colors.right = COLORS.blue; // Right face
          if (x === -1) colors.left = COLORS.green; // Left face
          if (y === 1) colors.top = COLORS.white; // Top face
          if (y === -1) colors.bottom = COLORS.yellow; // Bottom face
          if (z === 1) colors.front = COLORS.red; // Front face
          if (z === -1) colors.back = COLORS.orange; // Back face
          
          pieces.push({
            position: [x * spacing, y * spacing, z * spacing] as [number, number, number],
            colors
          });
        }
      }
    }
    
    return pieces;
  }, []);
  
  const handlePlayPause = () => {
    setIsRotating(!isRotating);
  };
  
  const handleReset = () => {
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
    setIsRotating(true);
  };
  
  const handleSpeedChange = (speed: number) => {
    setRotationSpeed(speed);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Rubik&apos;s Cube
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
          Interactive 3D Rubik&apos;s cube with a monochromatic blue color scheme. 
          Each face represents a different shade of blue.
        </p>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            {isRotating ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            Reset
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Slow</span>
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={rotationSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-40 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fast</span>
        </div>
      </div>
      
      {/* Color Legend */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Color Scheme
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#CAF0F8] rounded-lg border border-gray-200"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Top</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#ADE8F4] rounded-lg border border-gray-200"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Bottom</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#90E0EF] rounded-lg border border-gray-200"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Front</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#48CAE4] rounded-lg border border-gray-200"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Back</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#0077B6] rounded-lg border border-gray-200"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Right</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-[#023E8A] rounded-lg border border-gray-200"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Left</span>
          </div>
        </div>
      </div>
      
      {/* 3D Visualization */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
        <div className="h-96">
          <Canvas
            camera={{ position: [8, 8, 8], fov: 50 }}
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' }}
            shadows
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 10, 10]} 
              intensity={0.8}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            {/* Rubik's Cube */}
            <group ref={groupRef}>
              {cubePieces.map((piece, index) => (
                <CubePiece 
                  key={index}
                  position={piece.position}
                  colors={piece.colors}
                />
              ))}
            </group>
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
              autoRotate={false}
            />
          </Canvas>
        </div>
      </div>
      
      {/* Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Cube Information
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">26</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pieces</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">6</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Faces</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-green-600">9</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Squares per Face</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">43</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Quintillion States</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubiksCube; 