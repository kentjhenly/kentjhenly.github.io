"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

// Utility to interpolate between two arrays
function lerpArray(a: number[], b: number[], t: number) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

function generateTorusVertices(radialSegments = 64, tubularSegments = 32, R = 2, r = 0.7) {
  const positions: number[][] = [];
  for (let i = 0; i < radialSegments; i++) {
    const u = (i / radialSegments) * Math.PI * 2;
    for (let j = 0; j < tubularSegments; j++) {
      const v = (j / tubularSegments) * Math.PI * 2;
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      positions.push([x, y, z]);
    }
  }
  return positions;
}

function generateMugVertices(radialSegments = 64, tubularSegments = 32, R = 2, r = 0.7) {
  // Mug: deform torus into a cylinder with a handle
  const positions: number[][] = [];
  for (let i = 0; i < radialSegments; i++) {
    const u = (i / radialSegments) * Math.PI * 2;
    for (let j = 0; j < tubularSegments; j++) {
      const v = (j / tubularSegments) * Math.PI * 2;
      // Main body: cylinder
      let x = (R - r) * Math.cos(u);
      let y = (R - r) * Math.sin(u);
      let z = r * Math.sin(v);
      // Stretch the body vertically for the mug
      if (v < Math.PI) {
        z = -r + (2 * r * v) / Math.PI;
      }
      // Handle: keep a torus-like arc for a portion
      if (u > Math.PI * 1.2 && u < Math.PI * 1.8 && v > Math.PI * 0.7 && v < Math.PI * 1.3) {
        // Place handle on the side
        const handleAngle = (u - Math.PI * 1.2) / (Math.PI * 0.6);
        const handleX = (R + r * Math.cos(v)) * Math.cos(Math.PI * 1.5);
        const handleY = (R + r * Math.cos(v)) * Math.sin(Math.PI * 1.5);
        const handleZ = r * Math.sin(v);
        x = lerpArray([x], [handleX], handleAngle)[0];
        y = lerpArray([y], [handleY], handleAngle)[0];
        z = lerpArray([z], [handleZ], handleAngle)[0];
      }
      positions.push([x, y, z]);
    }
  }
  return positions;
}

function generateIndices(radialSegments = 64, tubularSegments = 32) {
  const indices: number[] = [];
  for (let i = 0; i < radialSegments; i++) {
    for (let j = 0; j < tubularSegments; j++) {
      const a = i * tubularSegments + j;
      const b = ((i + 1) % radialSegments) * tubularSegments + j;
      const c = ((i + 1) % radialSegments) * tubularSegments + (j + 1) % tubularSegments;
      const d = i * tubularSegments + (j + 1) % tubularSegments;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  return indices;
}

export default function TorusMugMorph() {
  const [morph, setMorph] = useState(0);
  const meshRef = useRef<THREE.Mesh>(null);
  const radialSegments = 64;
  const tubularSegments = 32;
  const torusVerts = useMemo(() => generateTorusVertices(radialSegments, tubularSegments), []);
  const mugVerts = useMemo(() => generateMugVertices(radialSegments, tubularSegments), []);
  const indices = useMemo(() => generateIndices(radialSegments, tubularSegments), []);

  // Interpolate vertices
  const morphedVerts = useMemo(() => {
    return torusVerts.map((v, i) => lerpArray(v, mugVerts[i], morph));
  }, [torusVerts, mugVerts, morph]);

  // Flatten for BufferGeometry
  const flatVerts = useMemo(() => morphedVerts.flat(), [morphedVerts]);

  // Move useFrame into a child component
  function MorphingMesh({ meshRef, flatVerts, indices }: { meshRef: React.RefObject<THREE.Mesh>, flatVerts: number[], indices: number[] }) {
    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
      }
    });
    return (
      <mesh ref={meshRef} castShadow receiveShadow>
        <bufferGeometry attach="geometry">
          <bufferAttribute attach="attributes-position" args={[new Float32Array(flatVerts), 3]} />
          {/* Optionally, recalculate normals or remove the normals attribute for smooth shading */}
          <bufferAttribute attach="index" args={[new Uint16Array(indices), 1]} />
        </bufferGeometry>
        <meshStandardMaterial color="#fbbf24" metalness={0.2} roughness={0.4} flatShading={false} />
      </mesh>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 600, height: 500, margin: "0 auto" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        <MorphingMesh meshRef={meshRef} flatVerts={flatVerts} indices={indices} />
        <Html center>
          <div style={{ position: "absolute", top: 20, left: 0, right: 0, width: 300, margin: "0 auto", background: "rgba(255,255,255,0.8)", borderRadius: 8, padding: 8, boxShadow: "0 2px 8px #0001" }}>
            <label style={{ fontWeight: 500, fontSize: 16 }}>
              Morph: {morph.toFixed(2)}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={morph}
                onChange={e => setMorph(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>Torus</span>
                <span>Mug</span>
              </div>
            </label>
          </div>
        </Html>
      </Canvas>
    </div>
  );
} 