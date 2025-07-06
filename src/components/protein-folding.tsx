'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Mock pLDDT scores for demonstration (0-100 scale)
const mockPLDDTScores = Array.from({ length: 50 }, () => Math.random() * 100);

// AlphaFold color scheme based on pLDDT
const getAlphaFoldColor = (plddt: number) => {
  if (plddt >= 90) return '#0053D6'; // Very high (blue)
  if (plddt >= 70) return '#65CBF3'; // Confident (light blue)
  if (plddt >= 50) return '#FFDB13'; // Low (yellow)
  return '#FF7D45'; // Very low (orange)
};

// Protein backbone component
const ProteinBackbone = ({ morphFactor }: { morphFactor: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate protein structure
  const { positions, colors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    
    // Create a more complex protein structure
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const morphT = t * morphFactor;
      
      // Unfolded state: straight line
      const unfoldedX = (t - 0.5) * 10;
      const unfoldedY = 0;
      const unfoldedZ = 0;
      
      // Folded state: complex 3D structure with alpha-helices and beta-sheets
      const foldedX = Math.sin(t * 4 * Math.PI) * 2;
      const foldedY = Math.cos(t * 3 * Math.PI) * 2;
      const foldedZ = Math.sin(t * 2 * Math.PI) * 1.5;
      
      // Interpolate between unfolded and folded
      const x = unfoldedX * (1 - morphT) + foldedX * morphT;
      const y = unfoldedY * (1 - morphT) + foldedY * morphT;
      const z = unfoldedZ * (1 - morphT) + foldedZ * morphT;
      
      positions.push(x, y, z);
      
      // Color based on pLDDT score
      const plddt = mockPLDDTScores[i];
      const color = new THREE.Color(getAlphaFoldColor(plddt));
      colors.push(color.r, color.g, color.b);
    }
    
    return { positions, colors };
  }, [morphFactor]);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshPhysicalMaterial
        vertexColors
        transparent
        opacity={0.8}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};

// Side chains component
const SideChains = ({ morphFactor }: { morphFactor: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const sideChains = useMemo(() => {
    const chains = [];
    
    for (let i = 0; i < 50; i += 2) { // Every other residue
      const t = i / 49;
      const morphT = t * morphFactor;
      
      // Base position (same as backbone)
      const baseX = (t - 0.5) * 10 * (1 - morphT) + Math.sin(t * 4 * Math.PI) * 2 * morphT;
      const baseY = 0 * (1 - morphT) + Math.cos(t * 3 * Math.PI) * 2 * morphT;
      const baseZ = 0 * (1 - morphT) + Math.sin(t * 2 * Math.PI) * 1.5 * morphT;
      
      // Side chain offset
      const offsetX = Math.sin(i * 0.5) * 0.5;
      const offsetY = Math.cos(i * 0.3) * 0.5;
      const offsetZ = Math.sin(i * 0.7) * 0.5;
      
      const x = baseX + offsetX * morphT;
      const y = baseY + offsetY * morphT;
      const z = baseZ + offsetZ * morphT;
      
      const plddt = mockPLDDTScores[i];
      const color = getAlphaFoldColor(plddt);
      
      chains.push({ x, y, z, color, plddt });
    }
    
    return chains;
  }, [morphFactor]);
  
  return (
    <group ref={groupRef}>
      {sideChains.map((chain, index) => (
        <mesh key={index} position={[chain.x, chain.y, chain.z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshPhysicalMaterial
            color={chain.color}
            transparent
            opacity={0.7}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// PAE Plot Component
const PAEPlot = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useMemo(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate mock PAE data (50x50 matrix)
    const size = 50;
    const paeData = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.random() * 20)
    );
    
    // Draw PAE heatmap
    const cellSize = canvas.width / size;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const pae = paeData[i][j];
        const intensity = Math.min(255, (pae / 20) * 255);
        
        ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
    
    // Add labels
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Residue i', canvas.width / 2, canvas.height - 10);
    ctx.save();
    ctx.translate(10, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Residue j', 0, 0);
    ctx.restore();
    
  }, []);
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-white text-sm font-semibold mb-2">Predicted Aligned Error (PAE)</h3>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="border border-gray-600 rounded"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>0 Å</span>
        <span>20 Å</span>
      </div>
    </div>
  );
};

// Main Protein Folding Component
const ProteinFolding = () => {
  const [morphFactor, setMorphFactor] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setMorphFactor(0);
    setIsPlaying(false);
  };
  
  // Animation loop
  useFrame(() => {
    if (isPlaying) {
      setMorphFactor((prev) => {
        const next = prev + 0.01;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }
  });
  
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AlphaFold-Inspired Protein Folding
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Interactive 3D visualization of protein folding with pLDDT confidence scoring and PAE analysis.
        </p>
      </div>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">Unfolded</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={morphFactor}
            onChange={(e) => setMorphFactor(parseFloat(e.target.value))}
            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">Folded</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          pLDDT Confidence Legend
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#0053D6] rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Very High (90-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#65CBF3] rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Confident (70-90)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FFDB13] rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Low (50-70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FF7D45] rounded"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Very Low (0-50)</span>
          </div>
        </div>
      </div>
      
      {/* 3D Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg h-96">
            <Canvas
              camera={{ position: [0, 0, 8], fov: 60 }}
              style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <hemisphereLight intensity={0.3} />
              
              <ProteinBackbone morphFactor={morphFactor} />
              <SideChains morphFactor={morphFactor} />
              
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>
        </div>
        
        <div className="space-y-4">
          <PAEPlot />
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Structure Info
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>Length: 50 residues</div>
              <div>Folding Progress: {Math.round(morphFactor * 100)}%</div>
              <div>Average pLDDT: {Math.round(mockPLDDTScores.reduce((a, b) => a + b, 0) / mockPLDDTScores.length)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProteinFolding; 