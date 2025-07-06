"use client";

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// Helper function to create a smooth curve for the unfolded polypeptide
function createUnfoldedCurve(): THREE.CatmullRomCurve3 {
  const points = [];
  const segments = 20;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = (t - 0.5) * 8; // Spread horizontally
    const y = Math.sin(t * Math.PI * 3) * 0.5; // Gentle wave
    const z = Math.cos(t * Math.PI * 2) * 0.3; // Slight depth variation
    points.push(new THREE.Vector3(x, y, z));
  }
  
  return new THREE.CatmullRomCurve3(points);
}

// Helper function to create folded protein structure with secondary structure regions
function createFoldedStructure(): THREE.CatmullRomCurve3 {
  const points = [];
  
  // Alpha helix (spiral) - N-terminus
  for (let i = 0; i <= 8; i++) {
    const angle = i * Math.PI / 4;
    const radius = 1.5;
    const x = Math.cos(angle) * radius;
    const y = i * 0.3 - 1.2;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  
  // Beta sheet (zigzag) - middle region
  for (let i = 0; i <= 6; i++) {
    const x = 2.5 + (i % 2) * 0.5;
    const y = -1.2 + i * 0.4;
    const z = (i % 2) * 0.8 - 0.4;
    points.push(new THREE.Vector3(x, y, z));
  }
  
  // Loop back to connect - C-terminus
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    const x = 2.5 + (1 - t) * 2.5;
    const y = 1.2 - t * 2.4;
    const z = 0.4 - t * 0.8;
    points.push(new THREE.Vector3(x, y, z));
  }
  
  return new THREE.CatmullRomCurve3(points);
}

// AlphaFold pLDDT confidence color scheme
const getPlddtColor = (plddt: number): string => {
  if (plddt > 90) return "#0053D6"; // Very high confidence - Dark Blue
  if (plddt > 70) return "#65CBF3"; // Confident - Light Blue
  if (plddt > 50) return "#FFD300"; // Low confidence - Yellow
  return "#FF7D45"; // Very low confidence - Orange
};

// Generate mock pLDDT scores based on position and folding state
function generatePlddtScores(totalPoints: number, morph: number): number[] {
  const scores = [];
  for (let i = 0; i < totalPoints; i++) {
    // Base confidence increases as protein folds
    let baseScore = 30 + morph * 60;
    
    // Add structural bias - structured regions have higher confidence
    if (morph > 0.5) {
      if (i <= 8) {
        baseScore += 15; // Alpha helix - higher confidence
      } else if (i <= 15) {
        baseScore += 10; // Beta sheet - good confidence
      } else {
        baseScore -= 5; // Loops - lower confidence
      }
    }
    
    // Add some realistic variation
    const variation = (Math.random() - 0.5) * 15;
    const score = Math.max(0, Math.min(100, baseScore + variation));
    scores.push(score);
  }
  return scores;
}

// Get color based on position and AlphaFold confidence
function getColorByPosition(index: number, totalPoints: number, morph: number, plddtScores: number[]): string {
  if (morph < 0.3) {
    // Rainbow gradient for unfolded state
    const hue = (index / totalPoints) * 360;
    return `hsl(${hue}, 70%, 60%)`;
  } else {
    // AlphaFold pLDDT coloring for folded state
    const plddt = plddtScores[index] || 70;
    return getPlddtColor(plddt);
  }
}

// Optimized protein backbone component with AlphaFold confidence
function ProteinBackbone({ morph }: { morph: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.TubeGeometry>(null);
  const unfoldedCurve = useMemo(() => createUnfoldedCurve(), []);
  const foldedCurve = useMemo(() => createFoldedStructure(), []);
  
  // Generate pLDDT scores
  const plddtScores = useMemo(() => {
    const maxPoints = Math.max(unfoldedCurve.points.length, foldedCurve.points.length);
    return generatePlddtScores(maxPoints, morph);
  }, [unfoldedCurve.points.length, foldedCurve.points.length, morph]);
  
  useFrame(() => {
    if (!meshRef.current || !geometryRef.current) return;
    
    // Create interpolated curve points
    const interpolatedPoints = [];
    const unfoldedPoints = unfoldedCurve.points;
    const foldedPoints = foldedCurve.points;
    const maxPoints = Math.max(unfoldedPoints.length, foldedPoints.length);
    
    for (let i = 0; i < maxPoints; i++) {
      const unfoldedPoint = unfoldedPoints[Math.min(i, unfoldedPoints.length - 1)];
      const foldedPoint = foldedPoints[Math.min(i, foldedPoints.length - 1)];
      
      const interpolatedPoint = new THREE.Vector3();
      interpolatedPoint.lerpVectors(unfoldedPoint, foldedPoint, morph);
      interpolatedPoints.push(interpolatedPoint);
    }
    
    const interpolatedCurve = new THREE.CatmullRomCurve3(interpolatedPoints);
    
    // Update the existing geometry instead of creating a new one
    const newTubeGeometry = new THREE.TubeGeometry(interpolatedCurve, 64, 0.15, 8, false);
    if (geometryRef.current.attributes.position) {
      geometryRef.current.attributes.position.copy(newTubeGeometry.attributes.position);
      geometryRef.current.attributes.position.needsUpdate = true;
      geometryRef.current.computeVertexNormals();
    }
    
    // Update material color based on average pLDDT
    const averagePlddt = plddtScores.reduce((a, b) => a + b, 0) / plddtScores.length;
    const materialColor = morph < 0.3 ? "#4ade80" : getPlddtColor(averagePlddt);
    (meshRef.current.material as THREE.MeshPhysicalMaterial).color.set(materialColor);
  });
  
  return (
    <mesh ref={meshRef} castShadow>
      <tubeGeometry ref={geometryRef} args={[unfoldedCurve, 64, 0.15, 8, false]} />
      <meshPhysicalMaterial 
        color={morph < 0.3 ? "#4ade80" : "#3b82f6"}
        roughness={0.2}
        metalness={0.3}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transmission={0.1}
      />
    </mesh>
  );
}

// Optimized amino acid side chains with AlphaFold confidence coloring
function SideChains({ morph }: { morph: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const unfoldedCurve = useMemo(() => createUnfoldedCurve(), []);
  const foldedCurve = useMemo(() => createFoldedStructure(), []);
  const sideChainRefs = useRef<THREE.Mesh[]>([]);
  
  // Generate pLDDT scores
  const plddtScores = useMemo(() => {
    const maxPoints = Math.max(unfoldedCurve.points.length, foldedCurve.points.length);
    return generatePlddtScores(maxPoints, morph);
  }, [unfoldedCurve.points.length, foldedCurve.points.length, morph]);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    // Initialize side chains if not already created
    if (sideChainRefs.current.length === 0) {
      const unfoldedPoints = unfoldedCurve.points;
      const foldedPoints = foldedCurve.points;
      const maxPoints = Math.max(unfoldedPoints.length, foldedPoints.length);
      
      for (let i = 0; i < maxPoints; i += 2) {
        const sideChain = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 12),
          new THREE.MeshPhysicalMaterial({
            roughness: 0.1,
            metalness: 0.4,
            clearcoat: 0.8,
            clearcoatRoughness: 0.05,
            transmission: 0.2
          })
        );
        sideChainRefs.current.push(sideChain);
        groupRef.current.add(sideChain);
      }
    }
    
    // Update side chain positions and colors
    const unfoldedPoints = unfoldedCurve.points;
    const foldedPoints = foldedCurve.points;
    const maxPoints = Math.max(unfoldedPoints.length, foldedPoints.length);
    
    sideChainRefs.current.forEach((sideChain, index) => {
      const i = index * 2;
      if (i < maxPoints) {
        const unfoldedPoint = unfoldedPoints[Math.min(i, unfoldedPoints.length - 1)];
        const foldedPoint = foldedPoints[Math.min(i, foldedPoints.length - 1)];
        
        const interpolatedPoint = new THREE.Vector3();
        interpolatedPoint.lerpVectors(unfoldedPoint, foldedPoint, morph);
        
        // Update position
        const tangent = new THREE.Vector3();
        if (i < maxPoints - 1) {
          const nextPoint = new THREE.Vector3();
          const nextUnfolded = unfoldedPoints[Math.min(i + 1, unfoldedPoints.length - 1)];
          const nextFolded = foldedPoints[Math.min(i + 1, foldedPoints.length - 1)];
          nextPoint.lerpVectors(nextUnfolded, nextFolded, morph);
          tangent.subVectors(nextPoint, interpolatedPoint).normalize();
        } else {
          tangent.set(0, 1, 0);
        }
        
        const offset = new THREE.Vector3(0.2, 0, 0);
        offset.applyAxisAngle(tangent, Math.PI / 2);
        sideChain.position.copy(interpolatedPoint).add(offset);
        
        // Update color based on AlphaFold confidence
        const color = getColorByPosition(i, maxPoints, morph, plddtScores);
        (sideChain.material as THREE.MeshPhysicalMaterial).color.set(color);
      }
    });
  });
  
  return <group ref={groupRef} />;
}

// PAE Plot Component (Predicted Aligned Error)
function PAEPlot({ morph }: { morph: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // Clear canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size, size);
    
    // Generate mock PAE data
    const resolution = 20;
    const cellSize = size / resolution;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        // Create realistic PAE pattern
        const distance = Math.sqrt((i - resolution/2) ** 2 + (j - resolution/2) ** 2);
        const maxDistance = resolution / 2;
        
        // Base error decreases as protein folds
        let baseError = 15 - morph * 10;
        
        // Add structural patterns
        if (morph > 0.5) {
          // Structured regions have lower error
          if ((i < 8 && j < 8) || (i > 12 && j > 12)) {
            baseError -= 5;
          }
          // Flexible regions have higher error
          if (i > 8 && i < 12 && j > 8 && j < 12) {
            baseError += 3;
          }
        }
        
        // Add some noise
        const noise = (Math.random() - 0.5) * 3;
        const error = Math.max(0, Math.min(30, baseError + noise));
        
        // Color based on error (green = low error, red = high error)
        const intensity = 1 - (error / 30);
        const r = Math.round(255 * (1 - intensity));
        const g = Math.round(255 * intensity);
        const b = 0;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
    
    // Add grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= resolution; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }
  }, [morph]);
  
  return (
    <div style={{ textAlign: 'center' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '1px solid rgba(255,255,255,0.2)', 
          borderRadius: '8px',
          maxWidth: '100%',
          height: 'auto'
        }} 
      />
      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
        PAE Plot: Green = Low Error, Red = High Error
      </p>
    </div>
  );
}

// Main component
export default function ProteinFolding() {
  const [morph, setMorph] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const lerpColor = (color1: string, color2: string, factor: number) => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, factor);
  };
  
  // Auto-play animation
  React.useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setMorph(prev => {
        if (prev >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return prev + 0.01;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  return (
    <div style={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      {/* Enhanced morph control at the top */}
      <div style={{ 
        width: "100%", 
        background: "rgba(255,255,255,0.1)", 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)", 
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <label style={{ fontWeight: 500, fontSize: 16, display: "block", textAlign: "center", color: "#374151" }}>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>AlphaFold Protein Folding: {morph.toFixed(2)}</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: isPlaying ? "#ef4444" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={morph}
            onChange={e => setMorph(Number(e.target.value))}
            style={{ 
              width: "100%", 
              height: "8px", 
              borderRadius: "4px", 
              background: `linear-gradient(to right, #4ade80 0%, ${lerpColor("#4ade80", "#3b82f6", 0.5).getHexString()} 50%, #3b82f6 100%)`, 
              outline: "none", 
              cursor: "pointer",
              WebkitAppearance: "none",
              appearance: "none"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8, color: "#6b7280" }}>
            <span>Unfolded</span>
            <span>Folded</span>
          </div>
        </label>
      </div>
      
      {/* Main content area with 3D model and PAE plot */}
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* Enhanced 3D model */}
        <div style={{ flex: 1, height: 400, borderRadius: "12px", overflow: "hidden" }}>
          <Canvas 
            camera={{ position: [0, 0, 12], fov: 50 }}
            shadows
            gl={{ antialias: true }}
          >
            {/* Enhanced lighting setup */}
            <hemisphereLight intensity={0.3} groundColor="#000000" />
            <ambientLight intensity={0.2} />
            <directionalLight 
              position={[5, 5, 5]} 
              intensity={0.8}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[-5, 5, 5]} intensity={0.4} color="#4ade80" />
            <pointLight position={[5, -5, -5]} intensity={0.3} color="#3b82f6" />
            <pointLight position={[0, 8, 0]} intensity={0.2} color="#ffffff" />
            
            {/* Gradient background */}
            <mesh position={[0, 0, -10]}>
              <planeGeometry args={[30, 30]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
            
            {/* Ground plane for shadows */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#334155" transparent opacity={0.3} />
            </mesh>
            
            {/* Protein components */}
            <ProteinBackbone morph={morph} />
            <SideChains morph={morph} />
            
            {/* Orbit controls for interactive viewing */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
              autoRotate={false}
              dampingFactor={0.05}
              enableDamping={true}
            />
          </Canvas>
        </div>
        
        {/* PAE Plot */}
        <div style={{ width: 220 }}>
          <PAEPlot morph={morph} />
        </div>
      </div>
      
      {/* AlphaFold pLDDT Confidence Legend */}
      <div style={{ 
        marginTop: 20, 
        padding: 16, 
        background: "rgba(255,255,255,0.05)", 
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#374151", fontSize: 18 }}>
          AlphaFold-Inspired Protein Folding Visualization
        </h3>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          This visualization demonstrates protein folding inspired by Google DeepMind's AlphaFold, using their confidence metrics to color the structure.
        </p>
        
        {/* pLDDT Confidence Legend */}
        <div style={{ margin: "12px 0", display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#0053D6", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Very High (>90)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#65CBF3", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Confident (70-90)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#FFD300", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Low (50-70)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "16px", height: "16px", backgroundColor: "#FF7D45", borderRadius: "2px" }}></div>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Very Low (<50)</span>
          </div>
        </div>
        
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          <strong>pLDDT Score:</strong> The color of each amino acid indicates AlphaFold's confidence in its predicted position. Dark blue shows very high confidence, while orange indicates low confidence often found in flexible regions.
        </p>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          <strong>PAE Plot:</strong> Shows the Predicted Aligned Error between different parts of the protein. Green squares indicate well-predicted relative positions, while red shows higher uncertainty.
        </p>
      </div>
    </div>
  );
} 