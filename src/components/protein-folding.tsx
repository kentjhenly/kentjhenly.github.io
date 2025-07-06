"use client";

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

// Helper function to create folded protein structure
function createFoldedStructure(): THREE.CatmullRomCurve3 {
  const points = [];
  
  // Alpha helix (spiral)
  for (let i = 0; i <= 8; i++) {
    const angle = i * Math.PI / 4;
    const radius = 1.5;
    const x = Math.cos(angle) * radius;
    const y = i * 0.3 - 1.2;
    const z = Math.sin(angle) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  
  // Beta sheet (zigzag)
  for (let i = 0; i <= 6; i++) {
    const x = 2.5 + (i % 2) * 0.5;
    const y = -1.2 + i * 0.4;
    const z = (i % 2) * 0.8 - 0.4;
    points.push(new THREE.Vector3(x, y, z));
  }
  
  // Loop back to connect
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    const x = 2.5 + (1 - t) * 2.5;
    const y = 1.2 - t * 2.4;
    const z = 0.4 - t * 0.8;
    points.push(new THREE.Vector3(x, y, z));
  }
  
  return new THREE.CatmullRomCurve3(points);
}

// Protein backbone component
function ProteinBackbone({ morph }: { morph: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const unfoldedCurve = useMemo(() => createUnfoldedCurve(), []);
  const foldedCurve = useMemo(() => createFoldedStructure(), []);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Create interpolated curve
    const interpolatedCurve = new THREE.CatmullRomCurve3();
    const unfoldedPoints = unfoldedCurve.points;
    const foldedPoints = foldedCurve.points;
    
    // Interpolate between unfolded and folded states
    const maxPoints = Math.max(unfoldedPoints.length, foldedPoints.length);
    const interpolatedPoints = [];
    
    for (let i = 0; i < maxPoints; i++) {
      const unfoldedPoint = unfoldedPoints[Math.min(i, unfoldedPoints.length - 1)];
      const foldedPoint = foldedPoints[Math.min(i, foldedPoints.length - 1)];
      
      const interpolatedPoint = new THREE.Vector3();
      interpolatedPoint.lerpVectors(unfoldedPoint, foldedPoint, morph);
      interpolatedPoints.push(interpolatedPoint);
    }
    
    interpolatedCurve.points = interpolatedPoints;
    
    // Create tube geometry along the curve
    const tubeGeometry = new THREE.TubeGeometry(interpolatedCurve, 64, 0.15, 8, false);
    
    // Update mesh geometry
    if (meshRef.current.geometry) {
      meshRef.current.geometry.dispose();
    }
    meshRef.current.geometry = tubeGeometry;
  });
  
  return (
    <mesh ref={meshRef} castShadow>
      <tubeGeometry args={[unfoldedCurve, 64, 0.15, 8, false]} />
      <meshStandardMaterial 
        color={morph < 0.5 ? "#4ade80" : "#3b82f6"}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// Amino acid side chains
function SideChains({ morph }: { morph: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const unfoldedCurve = useMemo(() => createUnfoldedCurve(), []);
  const foldedCurve = useMemo(() => createFoldedStructure(), []);
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    // Clear existing children
    while (groupRef.current.children.length > 0) {
      const child = groupRef.current.children[0];
      groupRef.current.remove(child);
    }
    
    // Create side chains along the interpolated curve
    const unfoldedPoints = unfoldedCurve.points;
    const foldedPoints = foldedCurve.points;
    const maxPoints = Math.max(unfoldedPoints.length, foldedPoints.length);
    
    for (let i = 0; i < maxPoints; i += 2) { // Every other point to avoid overcrowding
      const unfoldedPoint = unfoldedPoints[Math.min(i, unfoldedPoints.length - 1)];
      const foldedPoint = foldedPoints[Math.min(i, foldedPoints.length - 1)];
      
      const interpolatedPoint = new THREE.Vector3();
      interpolatedPoint.lerpVectors(unfoldedPoint, foldedPoint, morph);
      
      // Create side chain sphere
      const sideChain = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({
          color: morph < 0.5 ? "#22c55e" : "#1d4ed8",
          roughness: 0.2,
          metalness: 0.3
        })
      );
      
      // Position side chain perpendicular to backbone
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
      
      groupRef.current.add(sideChain);
    }
  });
  
  return <group ref={groupRef} />;
}

// Main component
export default function ProteinFolding() {
  const [morph, setMorph] = useState(0);
  
  const lerpColor = (color1: string, color2: string, factor: number) => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return c1.lerp(c2, factor);
  };
  
  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
      {/* Morph control at the top */}
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
          <div style={{ marginBottom: 8 }}>Protein Folding: {morph.toFixed(2)}</div>
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
      
      {/* 3D model below the control */}
      <div style={{ height: 400 }}>
        <Canvas 
          camera={{ position: [0, 0, 12], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          {/* Enhanced lighting setup */}
          <ambientLight intensity={0.4} />
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
          <pointLight position={[-5, 5, 5]} intensity={0.3} />
          <pointLight position={[0, -5, 0]} intensity={0.2} />
          
          {/* Ground plane for shadows */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
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
          />
        </Canvas>
      </div>
      
      {/* Description */}
      <div style={{ 
        marginTop: 20, 
        padding: 16, 
        background: "rgba(255,255,255,0.05)", 
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#374151", fontSize: 18 }}>The Concept: Protein Folding Visualization</h3>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          Proteins start as a linear chain of amino acids (the primary structure) and must fold into a specific, complex 3D shape (the tertiary structure) to become functional. This process is fundamental to all of biology.
        </p>
        <p style={{ margin: "0 0 8px 0", color: "#6b7280", fontSize: 14, lineHeight: 1.5 }}>
          The green spheres represent amino acid side chains, while the backbone shows the polypeptide chain. As you move the slider, watch how the protein transitions from an unfolded state to a compact, functional structure with alpha-helices and beta-sheets.
        </p>
      </div>
    </div>
  );
} 