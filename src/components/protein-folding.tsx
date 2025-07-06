'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced pLDDT scoring that's more realistic to AlphaFold
const generateRealisticPLDDTScores = (morphFactor: number) => {
  const scores = [];
  
  for (let i = 0; i < 50; i++) {
    const t = i / 49;
    
    // Base confidence increases as protein folds
    let baseScore = 30 + morphFactor * 60;
    
    // Add structural confidence based on position
    // Helices and sheets get higher confidence
    const structuralConfidence = Math.sin(t * 4 * Math.PI) * 0.3 + 
                                Math.cos(t * 3 * Math.PI) * 0.2;
    
    // Loop regions (unstructured) have lower confidence
    const loopPenalty = Math.sin(t * 8 * Math.PI) * 0.4;
    
    // Terminal regions often have lower confidence
    const terminalPenalty = (t < 0.1 || t > 0.9) ? 0.3 : 0;
    
    let finalScore = baseScore + structuralConfidence * 20 - loopPenalty * 15 - terminalPenalty * 20;
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    scores.push(finalScore);
  }
  
  return scores;
};

// AlphaFold color scheme based on pLDDT (exact AlphaFold colors)
const getAlphaFoldColor = (plddt: number) => {
  if (plddt >= 90) return '#0053D6'; // Very high (blue)
  if (plddt >= 70) return '#65CBF3'; // Confident (light blue)
  if (plddt >= 50) return '#FFDB13'; // Low (yellow)
  return '#FF7D45'; // Very low (orange)
};

// Animation controller component (inside Canvas)
const AnimationController = ({ 
  isPlaying, 
  onMorphFactorChange, 
  onAnimationComplete 
}: { 
  isPlaying: boolean;
  onMorphFactorChange: (factor: number) => void;
  onAnimationComplete: () => void;
}) => {
  const currentMorphFactor = useRef(0);
  
  useFrame(() => {
    if (isPlaying) {
      const next = currentMorphFactor.current + 0.01;
      if (next >= 1) {
        onMorphFactorChange(1);
        onAnimationComplete();
      } else {
        currentMorphFactor.current = next;
        onMorphFactorChange(next);
      }
    }
  });
  
  return null; // This component doesn't render anything
};

// Protein backbone component with enhanced AlphaFold features
const ProteinBackbone = ({ morphFactor }: { morphFactor: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Generate protein structure with realistic pLDDT scores
  const { positions, colors, plddtScores } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const plddtScores = generateRealisticPLDDTScores(morphFactor);
    
    // Create a more complex protein structure with realistic secondary structure
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const morphT = t * morphFactor;
      
      // Unfolded state: straight line
      const unfoldedX = (t - 0.5) * 10;
      const unfoldedY = 0;
      const unfoldedZ = 0;
      
      // Folded state: realistic protein structure with alpha-helices and beta-sheets
      // Alpha-helix regions (residues 10-25 and 35-45)
      let foldedX, foldedY, foldedZ;
      
      if (t >= 0.2 && t <= 0.5) {
        // Alpha-helix 1
        const helixT = (t - 0.2) / 0.3;
        foldedX = Math.sin(helixT * 4 * Math.PI) * 2;
        foldedY = Math.cos(helixT * 4 * Math.PI) * 2;
        foldedZ = helixT * 3;
      } else if (t >= 0.7 && t <= 0.9) {
        // Alpha-helix 2
        const helixT = (t - 0.7) / 0.2;
        foldedX = Math.sin(helixT * 4 * Math.PI) * 1.5 + 1;
        foldedY = Math.cos(helixT * 4 * Math.PI) * 1.5 - 1;
        foldedZ = helixT * 2 - 2;
      } else {
        // Loop regions
        foldedX = Math.sin(t * 6 * Math.PI) * 1;
        foldedY = Math.cos(t * 5 * Math.PI) * 1;
        foldedZ = Math.sin(t * 3 * Math.PI) * 0.5;
      }
      
      // Interpolate between unfolded and folded
      const x = unfoldedX * (1 - morphT) + foldedX * morphT;
      const y = unfoldedY * (1 - morphT) + foldedY * morphT;
      const z = unfoldedZ * (1 - morphT) + foldedZ * morphT;
      
      positions.push(x, y, z);
      
      // Color based on pLDDT score
      const plddt = plddtScores[i];
      const color = new THREE.Color(getAlphaFoldColor(plddt));
      colors.push(color.r, color.g, color.b);
    }
    
    return { positions, colors, plddtScores };
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

// Side chains component with enhanced AlphaFold features
const SideChains = ({ morphFactor }: { morphFactor: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const sideChains = useMemo(() => {
    const chains = [];
    const plddtScores = generateRealisticPLDDTScores(morphFactor);
    
    for (let i = 0; i < 50; i += 2) { // Every other residue
      const t = i / 49;
      const morphT = t * morphFactor;
      
      // Base position (same as backbone)
      let baseX, baseY, baseZ;
      
      if (t >= 0.2 && t <= 0.5) {
        // Alpha-helix 1
        const helixT = (t - 0.2) / 0.3;
        baseX = (t - 0.5) * 10 * (1 - morphT) + Math.sin(helixT * 4 * Math.PI) * 2 * morphT;
        baseY = 0 * (1 - morphT) + Math.cos(helixT * 4 * Math.PI) * 2 * morphT;
        baseZ = 0 * (1 - morphT) + helixT * 3 * morphT;
      } else if (t >= 0.7 && t <= 0.9) {
        // Alpha-helix 2
        const helixT = (t - 0.7) / 0.2;
        baseX = (t - 0.5) * 10 * (1 - morphT) + (Math.sin(helixT * 4 * Math.PI) * 1.5 + 1) * morphT;
        baseY = 0 * (1 - morphT) + (Math.cos(helixT * 4 * Math.PI) * 1.5 - 1) * morphT;
        baseZ = 0 * (1 - morphT) + (helixT * 2 - 2) * morphT;
      } else {
        // Loop regions
        baseX = (t - 0.5) * 10 * (1 - morphT) + Math.sin(t * 6 * Math.PI) * 1 * morphT;
        baseY = 0 * (1 - morphT) + Math.cos(t * 5 * Math.PI) * 1 * morphT;
        baseZ = 0 * (1 - morphT) + Math.sin(t * 3 * Math.PI) * 0.5 * morphT;
      }
      
      // Side chain offset (more realistic)
      const offsetX = Math.sin(i * 0.5) * 0.5;
      const offsetY = Math.cos(i * 0.3) * 0.5;
      const offsetZ = Math.sin(i * 0.7) * 0.5;
      
      const x = baseX + offsetX * morphT;
      const y = baseY + offsetY * morphT;
      const z = baseZ + offsetZ * morphT;
      
      const plddt = plddtScores[i];
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

// Enhanced PAE Plot Component with more realistic AlphaFold-like data
const PAEPlot = ({ morphFactor }: { morphFactor: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useMemo(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate more realistic PAE data that changes with folding
    const size = 50;
    const paeData = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => {
        // Base error decreases as protein folds
        const baseError = 15 - morphFactor * 10;
        
        // Structural domains have lower error (better prediction)
        const domain1 = (i >= 10 && i <= 25) && (j >= 10 && j <= 25);
        const domain2 = (i >= 35 && i <= 45) && (j >= 35 && j <= 45);
        
        let error = baseError;
        if (domain1 || domain2) {
          error *= 0.3; // Much lower error in structured regions
        }
        
        // Add some noise
        const noise = (Math.random() - 0.5) * 3;
        error = Math.max(0, Math.min(20, error + noise));
        
        return error;
      })
    );
    
    // Draw PAE heatmap with AlphaFold-like coloring
    const cellSize = canvas.width / size;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const pae = paeData[i][j];
        
        // AlphaFold PAE color scheme: green (low error) to red (high error)
        const normalizedError = pae / 20;
        const r = Math.round(255 * normalizedError);
        const g = Math.round(255 * (1 - normalizedError));
        const b = 0;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
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
    
  }, [morphFactor]);
  
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
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span className="text-green-400">Low Error</span>
        <span className="text-red-400">High Error</span>
      </div>
    </div>
  );
};

// Main Protein Folding Component
const ProteinFolding = () => {
  const [morphFactor, setMorphFactor] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setMorphFactor(0);
    setIsPlaying(false);
  };
  
  const handleMorphFactorChange = (newFactor: number) => {
    setMorphFactor(newFactor);
  };
  
  const handleAnimationComplete = () => {
    setIsPlaying(false);
  };
  
  // Calculate current pLDDT statistics
  const currentPLDDTScores = generateRealisticPLDDTScores(morphFactor);
  const averagePLDDT = Math.round(currentPLDDTScores.reduce((a, b) => a + b, 0) / currentPLDDTScores.length);
  const highConfidenceCount = currentPLDDTScores.filter(score => score >= 70).length;
  
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          AlphaFold-Inspired Protein Folding
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Interactive 3D visualization of protein folding with pLDDT confidence scoring and PAE analysis, inspired by Google DeepMind&apos;s AlphaFold.
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
      
      {/* Enhanced Legend */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          AlphaFold pLDDT Confidence Legend
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          The color of each amino acid indicates AlphaFold&apos;s confidence in its predicted position. 
          Dark blue shows very high confidence, while orange indicates low confidence often found in flexible regions.
        </p>
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
              
              <AnimationController 
                isPlaying={isPlaying}
                onMorphFactorChange={handleMorphFactorChange}
                onAnimationComplete={handleAnimationComplete}
              />
              
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>
          </div>
        </div>
        
        <div className="space-y-4">
          <PAEPlot morphFactor={morphFactor} />
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AlphaFold Structure Analysis
            </h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>Length: 50 residues</div>
              <div>Folding Progress: {Math.round(morphFactor * 100)}%</div>
              <div>Average pLDDT: {averagePLDDT}</div>
              <div>High Confidence: {highConfidenceCount}/50 residues</div>
              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>pLDDT Score:</strong> Predicted Local Distance Difference Test
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>PAE Plot:</strong> Shows confidence in relative residue positions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProteinFolding; 