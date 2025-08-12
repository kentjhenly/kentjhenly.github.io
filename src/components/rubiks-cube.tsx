'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import BlurFade from '@/components/magicui/blur-fade';
import { applyMove, createSolvedState, CubeState, FaceKey, isSolved, randomScramble } from '@/lib/cube-core';
import { planCFOP, type CFOPPlan } from '@/lib/cfop-solver';
import type { BasicMove } from '@/lib/notation';

const FACE_ORDER: FaceKey[] = ['U','D','L','R','F','B'];

function colorToHex(c: string): string {
  switch (c) {
    case 'W': return '#ffffff';
    case 'Y': return '#ffff00';
    case 'O': return '#ff8800';
    case 'R': return '#ff3333';
    case 'G': return '#00cc55';
    case 'B': return '#0066ff';
    default: return '#222222';
  }
}

function CubieMesh({
  id,
  position,
  faces,
  highlighted,
  refCallback,
}: {
  id: string;
  position: [number, number, number];
  faces: Partial<Record<FaceKey, string>>;
  highlighted: boolean;
  refCallback: (id: string, obj: THREE.Object3D | null) => void;
}) {
  const materials = useMemo(() => {
    return FACE_ORDER.map((k) => new THREE.MeshStandardMaterial({
      color: colorToHex(faces[k] ?? ''),
      emissive: highlighted ? new THREE.Color('#ffff88') : new THREE.Color('#000000'),
      transparent: highlighted,
      opacity: highlighted ? 0.9 : 1,
    }));
  }, [faces, highlighted]);

  const setRef = useCallback((node: THREE.Object3D | null) => {
    refCallback(id, node);
  }, [id, refCallback]);

  return (
    <mesh ref={setRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      {materials.map((m, i) => (
        <primitive key={i} attach={`material-${i}`} object={m} />
      ))}
    </mesh>
  );
}

const RotatingCubeGroup = ({ isSolving, children, groupRef }: { 
  isSolving: boolean; 
  children: React.ReactNode;
  groupRef: React.RefObject<THREE.Group>;
}) => {
  useFrame((_, delta) => {
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

// Runs per-frame inside the Canvas context to animate current face rotation and commit moves
const MovePlayer = ({
  paused,
  anim,
  faceGroupRef,
  rootRef,
  queue,
  setQueue,
  setCube,
  setCurrentMove,
  solutionLenRef,
  doneCountRef,
  thresholdsRef,
  setStage,
  setIsSolving,
  setStatusMessage,
}: {
  paused: boolean;
  anim: React.MutableRefObject<null | { face: FaceKey; axis: 'x'|'y'|'z'; dir: 1|-1; turns: 1|2; start: number; duration: number; affected: string[] }>;
  faceGroupRef: React.RefObject<THREE.Group>;
  rootRef: React.RefObject<THREE.Group>;
  queue: BasicMove[];
  setQueue: React.Dispatch<React.SetStateAction<BasicMove[]>>;
  setCube: React.Dispatch<React.SetStateAction<CubeState>>;
  setCurrentMove: React.Dispatch<React.SetStateAction<string | null>>;
  solutionLenRef: React.MutableRefObject<number>;
  doneCountRef: React.MutableRefObject<number>;
  thresholdsRef: React.MutableRefObject<{ q1:number; q2:number; q3:number }>;
  setStage: (s: 'Cross'|'F2L'|'OLL'|'PLL'|'Solved') => void;
  setIsSolving: (b: boolean) => void;
  setStatusMessage: (s: string) => void;
}) => {
  useFrame(() => {
    const a = anim.current;
    if (!a || paused) return;
    const now = performance.now();
    const t = Math.min(1, (now - a.start) / a.duration);
    const eased = t<0.5 ? 2*t*t : -1 + (4-2*t)*t;
    const angle = eased * (Math.PI/2) * a.turns * a.dir;
    if (faceGroupRef.current) {
      (faceGroupRef.current.rotation as any)[a.axis] = angle;
    }
    if (t >= 1) {
      if (faceGroupRef.current && rootRef.current) {
        const grp = faceGroupRef.current;
        const toMove: THREE.Object3D[] = [];
        grp.children.forEach(ch => toMove.push(ch));
        toMove.forEach(ch => (rootRef.current as any).attach(ch));
        grp.rotation.set(0,0,0);
      }
      const mv = queue[0];
      setCube(prev => applyMove(prev, mv));
      setQueue(q => q.slice(1));
      if (solutionLenRef.current > 0) {
        doneCountRef.current += 1;
        const d = doneCountRef.current;
        const { q1, q2, q3 } = thresholdsRef.current;
        const label = d < q1 ? 'Cross' : d < q2 ? 'F2L' : d < q3 ? 'OLL' : (d < solutionLenRef.current ? 'PLL' : 'Solved');
        setStage(label as any);
        if (d >= solutionLenRef.current) {
          setIsSolving(false);
          setStatusMessage('Solved');
          setStage('Solved');
          solutionLenRef.current = 0;
        }
      }
      anim.current = null;
      setCurrentMove(null);
    }
  });
  return null;
};

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
  } as const;

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

// Main React Component using pure core + face-group animation
const RubiksCubeScene = () => {
  const [cube, setCube] = useState<CubeState>(() => createSolvedState());
  const [queue, setQueue] = useState<BasicMove[]>([]);
  const [currentMove, setCurrentMove] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [speed, setSpeed] = useState(320);
  const [stage, setStage] = useState<'Cross'|'F2L'|'OLL'|'PLL'|'Solved'>('Solved');
  const [showHighlights, setShowHighlights] = useState(true);
  const [lastScramble, setLastScramble] = useState<BasicMove[] | null>(null);

  const groupRef = useRef<THREE.Group>(null);
  const faceGroupRef = useRef<THREE.Group>(null);
  const rootRef = useRef<THREE.Group>(null);
  const idToObj = useRef<Map<string, THREE.Object3D>>(new Map());

  const anim = useRef<null | { face: FaceKey; axis: 'x'|'y'|'z'; dir: 1|-1; turns: 1|2; start: number; duration: number; affected: string[] }>(null);
  const solutionLenRef = useRef(0);
  const doneCountRef = useRef(0);
  const thresholdsRef = useRef<{ q1:number; q2:number; q3:number }>({ q1:0, q2:0, q3:0 });

  const axisOfFace = (f: FaceKey) => (f==='U'||f==='D') ? 'y' : (f==='L'||f==='R') ? 'x' : 'z';
  const layerOfFace = (f: FaceKey) => (f==='U'||f==='R'||f==='F') ? 1 : -1;
  const dirOfFace = (f: FaceKey, isPrime: boolean) => {
    const base: 1|-1 = (f==='R'||f==='U'||f==='F') ? 1 : -1;
    return (isPrime ? -base : base) as 1|-1;
  };

  const startNext = useCallback(() => {
    if (anim.current || queue.length === 0) return;
    const mv = queue[0];
    const face = mv[0] as FaceKey;
    const isPrime = mv.endsWith("'");
    const isDouble = mv.endsWith('2');
    const axis = axisOfFace(face);
    const dir = dirOfFace(face, isPrime);
    const layer = layerOfFace(face);
    const affected = cube.cubies.filter(c => (axis==='x' ? c.pos.x===layer : axis==='y' ? c.pos.y===layer : c.pos.z===layer)).map(c => c.id);
    anim.current = { face, axis, dir, turns: isDouble ? 2 : 1, start: performance.now(), duration: (isDouble? 2:1) * speed, affected };
    setCurrentMove(mv);
    const grp = faceGroupRef.current!;
    grp.rotation.set(0,0,0);
    affected.forEach(id => {
      const obj = idToObj.current.get(id);
      if (obj && grp) (grp as any).attach(obj);
    });
  }, [queue, cube, speed]);

  // per-frame logic moved into MovePlayer inside Canvas

  useEffect(() => {
    if (!anim.current && queue.length > 0 && !paused) startNext();
  }, [queue, paused, startNext]);

  // Mouse interaction handlers for viewing
  const [isDragging, setIsDragging] = useState(false);
  const [previousMousePosition, setPreviousMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setPreviousMousePosition({ x: e.clientX, y: e.clientY }); };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !groupRef.current) return;
    const dx = e.clientX - previousMousePosition.x;
    const dy = e.clientY - previousMousePosition.y;
    groupRef.current.rotation.y += dx * 0.01;
    groupRef.current.rotation.x += dy * 0.01;
    setPreviousMousePosition({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setIsDragging(false);

  const onScramble = () => {
    if (isSolving) return;
    setStatusMessage('Scrambling...');
    const { moves } = randomScramble(25, Math.floor(Math.random()*1e9));
    setLastScramble(moves);
    setQueue(moves);
  };

  const onSolve = () => {
    if (isSolving || isSolved(cube)) return;
    setIsSolving(true);
    setStatusMessage('Planning...');
    const plan: CFOPPlan = planCFOP(cube);
    solutionLenRef.current = plan.moves.length;
    doneCountRef.current = 0;
    const crossLen = plan.stages.find(s=>s.stage==='Cross')?.steps.length ?? 0;
    const f2lLen = plan.stages.find(s=>s.stage==='F2L')?.steps.length ?? 0;
    const ollLen = plan.stages.find(s=>s.stage==='OLL')?.steps.length ?? 0;
    thresholdsRef.current = { q1: crossLen, q2: crossLen + f2lLen, q3: crossLen + f2lLen + ollLen };
    setStage('Cross');
    setQueue(plan.moves as BasicMove[]);
    setStatusMessage('Solving...');
  };

  const onReset = () => {
    if (isSolving) return;
    setQueue([]);
    anim.current = null;
    setCube(createSolvedState());
    setStatusMessage('Reset');
    setStage('Solved');
  };

  const isCurrentlySolved = () => isSolved(cube);

  return (
    <div className="cube-container">
      <div className="controls mb-6 flex gap-3 flex-wrap justify-center">
        <AppleButton onClick={onScramble} disabled={isSolving} variant="secondary">Scramble</AppleButton>
        <AppleButton onClick={onSolve} disabled={isSolving || isCurrentlySolved()} variant="primary">CFOP Solve</AppleButton>
        <AppleButton onClick={onReset} disabled={isSolving} variant="secondary">Reset</AppleButton>
        <AppleButton onClick={() => setPaused(p=>!p)} variant="secondary">{paused ? 'Resume' : 'Pause'}</AppleButton>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Speed</span>
          <input type="range" min={150} max={600} step={10} value={speed} onChange={e=>{ const v = parseInt(e.target.value); anim.current = anim.current ? { ...anim.current, duration: (anim.current.turns as number) * v } as any : anim.current; setSpeed(v); }} />
        </div>
        <label className="text-xs text-gray-600 flex items-center gap-2">
          <input type="checkbox" checked={showHighlights} onChange={e=>setShowHighlights(e.target.checked)} /> Show highlights
        </label>
      </div>

      <div className="status mb-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isSolving ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="font-medium text-gray-900">{statusMessage} • Stage: {stage} {currentMove ? `• ${currentMove}` : ''}</span>
          </div>
          {queue.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{queue.length} moves remaining</span>
          )}
        </div>
      </div>

      <div 
        className="canvas-container w-full h-96 border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }} style={{ background: 'white' }}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <pointLight position={[-10, -10, -10]} intensity={0.6} />
          <pointLight position={[0, 10, 0]} intensity={0.4} />
          <RotatingCubeGroup isSolving={isSolving} groupRef={groupRef}>
            <group ref={rootRef}>
              {cube.cubies.map(c => (
                <CubieMesh
                  key={c.id}
                  id={c.id}
                  position={[c.pos.x, c.pos.y, c.pos.z]}
                  faces={c.faceColors}
                  highlighted={showHighlights && (stage==='OLL' ? c.pos.y===1 : stage==='PLL' ? c.pos.y===1 : false)}
                  refCallback={(id,obj)=>{ if (obj) idToObj.current.set(id, obj); else idToObj.current.delete(id); }}
                />
              ))}
            </group>
            <group ref={faceGroupRef} />
            <MovePlayer
              paused={paused}
              anim={anim}
              faceGroupRef={faceGroupRef}
              rootRef={rootRef}
              queue={queue}
              setQueue={setQueue}
              setCube={setCube}
              setCurrentMove={setCurrentMove}
              solutionLenRef={solutionLenRef}
              doneCountRef={doneCountRef}
              thresholdsRef={thresholdsRef}
              setStage={setStage}
              setIsSolving={setIsSolving}
              setStatusMessage={setStatusMessage}
            />
          </RotatingCubeGroup>
        </Canvas>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">Drag to rotate • Click buttons to interact</div>
    </div>
  );
};

const RubiksCube = () => {
  return (
    <BlurFade delay={0.25} inView>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900">Rubik&apos;s Cube Solver</h2>
            <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-3xl mx-auto">Interactive 3D visualization with Scramble/Solve/Reset, smooth face animations, and stage labels.</p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full max-w-4xl shadow-lg">
            <RubiksCubeScene />
          </div>
        </div>
      </div>
    </BlurFade>
  );
};

export default RubiksCube;


