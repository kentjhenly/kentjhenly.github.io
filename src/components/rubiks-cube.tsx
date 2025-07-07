'use client';

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BlurFade from "./magicui/blur-fade";

// Color Schemes - Only standard colors
type ColorScheme = {
  white: string;
  yellow: string;
  red: string;
  orange: string;
  blue: string;
  green: string;
};

const COLORS: ColorScheme = {
  white: '#FFFFFF',
  yellow: '#FFFF00',
  red: '#FF0000',
  orange: '#FF8000',
  blue: '#0000FF',
  green: '#00FF00',
};

interface CubeProps {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
  id: number;
  isHighlighted?: boolean;
}

const Cube = ({ position, faceColors, id, isHighlighted }: CubeProps) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      {/* BoxGeometry material order: [right, left, top, bottom, front, back] */}
      <meshStandardMaterial 
        color={faceColors[3]} 
        attach="material-0"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* right */}
      <meshStandardMaterial 
        color={faceColors[2]} 
        attach="material-1"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* left */}
      <meshStandardMaterial 
        color={faceColors[0]} 
        attach="material-2"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* top */}
      <meshStandardMaterial 
        color={faceColors[1]} 
        attach="material-3"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* bottom */}
      <meshStandardMaterial 
        color={faceColors[4]} 
        attach="material-4"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* front */}
      <meshStandardMaterial 
        color={faceColors[5]} 
        attach="material-5"
        emissive={isHighlighted ? '#ffffff' : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      /> {/* back */}
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

// Cube Move Definitions - Expanded to include all standard notation
type BasicMove = 'R' | 'R\'' | 'R2' | 'L' | 'L\'' | 'L2' | 'U' | 'U\'' | 'U2' | 'D' | 'D\'' | 'D2' | 'F' | 'F\'' | 'F2' | 'B' | 'B\'' | 'B2';

// Advanced moves that need to be converted to basic moves
type SliceMove = 'M' | 'M\'' | 'M2' | 'E' | 'E\'' | 'E2' | 'S' | 'S\'' | 'S2';
type WideMove = 'r' | 'r\'' | 'r2' | 'l' | 'l\'' | 'l2' | 'u' | 'u\'' | 'u2' | 'd' | 'd\'' | 'd2' | 'f' | 'f\'' | 'f2' | 'b' | 'b\'' | 'b2';
type RotationMove = 'x' | 'x\'' | 'x2' | 'y' | 'y\'' | 'y2' | 'z' | 'z\'' | 'z2';

// Complete move type
type Move = BasicMove | SliceMove | WideMove | RotationMove;

// Move conversion utility - now with proper cube rotation support
const convertMoveToBasic = (move: Move): BasicMove[] => {
  switch (move) {
    // Slice moves - these require cube rotations which we'll handle differently
    case 'M': 
      return ['CUBE_ROTATION_X_CCW', 'R', 'L\''] as any[];
    case 'M\'': 
      return ['CUBE_ROTATION_X_CW', 'R\'', 'L'] as any[];
    case 'M2': 
      return ['CUBE_ROTATION_X2', 'R2', 'L2'] as any[];
    
    case 'E': 
      return ['CUBE_ROTATION_Y_CCW', 'U', 'D\''] as any[];
    case 'E\'': 
      return ['CUBE_ROTATION_Y_CW', 'U\'', 'D'] as any[];
    case 'E2': 
      return ['CUBE_ROTATION_Y2', 'U2', 'D2'] as any[];
    
    case 'S': 
      return ['CUBE_ROTATION_Z_CW', 'F\'', 'B'] as any[];
    case 'S\'': 
      return ['CUBE_ROTATION_Z_CCW', 'F', 'B\''] as any[];
    case 'S2': 
      return ['CUBE_ROTATION_Z2', 'F2', 'B2'] as any[];
    
    // Wide moves - combine basic moves with slice moves
    case 'r': 
      return ['R', ...convertMoveToBasic('M\'')] as any[];
    case 'r\'': 
      return ['R\'', ...convertMoveToBasic('M')] as any[];
    case 'r2': 
      return ['R2', ...convertMoveToBasic('M2')] as any[];
    
    case 'l': 
      return ['L', ...convertMoveToBasic('M')] as any[];
    case 'l\'': 
      return ['L\'', ...convertMoveToBasic('M\'')] as any[];
    case 'l2': 
      return ['L2', ...convertMoveToBasic('M2')] as any[];
    
    case 'u': 
      return ['U', ...convertMoveToBasic('E\'')] as any[];
    case 'u\'': 
      return ['U\'', ...convertMoveToBasic('E')] as any[];
    case 'u2': 
      return ['U2', ...convertMoveToBasic('E2')] as any[];
    
    case 'd': 
      return ['D', ...convertMoveToBasic('E')] as any[];
    case 'd\'': 
      return ['D\'', ...convertMoveToBasic('E\'')] as any[];
    case 'd2': 
      return ['D2', ...convertMoveToBasic('E2')] as any[];
    
    case 'f': 
      return ['F', ...convertMoveToBasic('S')] as any[];
    case 'f\'': 
      return ['F\'', ...convertMoveToBasic('S\'')] as any[];
    case 'f2': 
      return ['F2', ...convertMoveToBasic('S2')] as any[];
    
    case 'b': 
      return ['B', ...convertMoveToBasic('S\'')] as any[];
    case 'b\'': 
      return ['B\'', ...convertMoveToBasic('S')] as any[];
    case 'b2': 
      return ['B2', ...convertMoveToBasic('S2')] as any[];
    
    // Rotation moves - direct cube rotations
    case 'x': 
      return ['CUBE_ROTATION_X_CW'] as any[];
    case 'x\'': 
      return ['CUBE_ROTATION_X_CCW'] as any[];
    case 'x2': 
      return ['CUBE_ROTATION_X2'] as any[];
    
    case 'y': 
      return ['CUBE_ROTATION_Y_CW'] as any[];
    case 'y\'': 
      return ['CUBE_ROTATION_Y_CCW'] as any[];
    case 'y2': 
      return ['CUBE_ROTATION_Y2'] as any[];
    
    case 'z': 
      return ['CUBE_ROTATION_Z_CW'] as any[];
    case 'z\'': 
      return ['CUBE_ROTATION_Z_CCW'] as any[];
    case 'z2': 
      return ['CUBE_ROTATION_Z2'] as any[];
    
    // Basic moves pass through unchanged
    default:
      if (isBasicMove(move)) {
        return [move];
      }
      console.warn(`Unknown move: ${move}`);
      return [];
  }
};

// Type guard to check if a move is a basic move
const isBasicMove = (move: Move): move is BasicMove => {
  const basicMoves: BasicMove[] = ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'];
  return basicMoves.includes(move as BasicMove);
};

// Enhanced move queue processor that converts all moves to basic moves and cube rotations
const processAdvancedMoves = (moves: Move[], depth: number = 0): (BasicMove | string)[] => {
  // Prevent infinite recursion
  if (depth > 5) {
    console.warn('Max recursion depth reached in processAdvancedMoves');
    return [];
  }
  
  const processedMoves: (BasicMove | string)[] = [];
  
  for (const move of moves) {
    if (isBasicMove(move)) {
      processedMoves.push(move);
    } else {
      const converted = convertMoveToBasic(move);
      // Recursively process the converted moves
      const recursivelyProcessed = processAdvancedMoves(converted as Move[], depth + 1);
      processedMoves.push(...recursivelyProcessed);
    }
  }
  
  return processedMoves;
};

// CFOP Algorithm Definitions
const CFOP_ALGORITHMS = {
  // Cross algorithms
  CROSS_EDGE_INSERT: ['R', 'U', 'R\'', 'U\''],
  CROSS_EDGE_INSERT_ALT: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  
  // F2L algorithms - Basic insertions
  F2L_PAIR_INSERT: ['R', 'U', 'R\''],
  F2L_PAIR_INSERT_ALT: ['U', 'R', 'U\'', 'R\''],
  F2L_PAIR_INSERT_2: ['R\'', 'U\'', 'R'],
  F2L_PAIR_INSERT_3: ['U\'', 'R\'', 'U', 'R'],
  
  // F2L algorithms - Advanced cases
  F2L_CASE_1: ['R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\''],
  F2L_CASE_2: ['R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'R'],
  F2L_CASE_3: ['U', 'R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\''],
  F2L_CASE_4: ['U\'', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R'],
  
  // OLL algorithms - 2-Look OLL
  OLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_U: ['R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'R', 'U\'', 'R\''],
  OLL_L: ['F', 'R\'', 'F\'', 'R', 'U', 'R', 'U\'', 'R\''],
  OLL_H: ['R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_PI: ['R', 'U2', 'R2', 'U\'', 'R2', 'U\'', 'R2', 'U2', 'R'],
  OLL_SUNE: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_ANTISUNE: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R'],
  OLL_Z: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  
  // PLL algorithms - 2-Look PLL
  PLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\''],
  PLL_U: ['R', 'U\'', 'R', 'U', 'R', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R2'],
  PLL_Y: ['F', 'R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  PLL_J: ['R\'', 'U', 'L\'', 'U2', 'R', 'U\'', 'R\'', 'U2', 'R', 'L', 'U\''],
  PLL_A: ['R', 'B\'', 'R', 'F2', 'R\'', 'B', 'R', 'F2', 'R2'],
  PLL_E: ['R', 'B\'', 'R\'', 'B', 'U', 'B', 'U\'', 'B\''],
  PLL_H: ['M2', 'U', 'M2', 'U2', 'M2', 'U', 'M2'],
  PLL_Z: ['M2', 'U', 'M2', 'U', 'M\'', 'U2', 'M2', 'U2', 'M\''],
  
  // Trigger moves
  SEXY_MOVE: ['R', 'U', 'R\'', 'U\''],
  SEXY_MOVE_INVERSE: ['U', 'R', 'U\'', 'R\''],
  SUNE: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  ANTISUNE: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R']
};

// Full OLL Algorithms (Complete set of 57 cases)
const FULL_OLL_ALGORITHMS = {
  // Dot cases (1-6)
  OLL_1: ['R', 'U2', 'R2', 'F', 'R', 'F\'', 'U2', 'R\'', 'F', 'R', 'F\''],
  OLL_2: ['F', 'R', 'U', 'R\'', 'U\'', 'F\'', 'f', 'R', 'U', 'R\'', 'U\'', 'f\''],
  OLL_3: ['f', 'R', 'U', 'R\'', 'U\'', 'f\'', 'U\'', 'F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_4: ['f', 'R', 'U', 'R\'', 'U\'', 'f\'', 'U', 'F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_5: ['r', 'U', 'R\'', 'U', 'R', 'U\'', 'r\''],
  OLL_6: ['r\'', 'U\'', 'R', 'U\'', 'R\'', 'U', 'r'],
  OLL_7: ['r', 'U', 'R\'', 'U', 'R', 'U2', 'r\''],
  OLL_8: ['r\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'r'],
  
  // I cases (9-12)
  OLL_9: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_10: ['R', 'U', 'R\'', 'U', 'R\'', 'F', 'R', 'F\'', 'U2', 'R\'', 'F', 'R', 'F\''],
  OLL_11: ['r', 'U\'', 'r2', 'U', 'r2', 'U', 'r2', 'U\'', 'r'],
  OLL_12: ['M\'', 'R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R', 'U\'', 'M'],
  
  // L cases (13-20)
  OLL_13: ['r', 'U\'', 'r\'', 'U\'', 'r', 'U', 'r\'', 'F', 'R', 'F\''],
  OLL_14: ['R\'', 'F', 'R', 'U', 'R\'', 'F\'', 'R', 'F', 'U\'', 'F\''],
  OLL_15: ['r\'', 'U', 'r', 'U', 'r\'', 'U\'', 'r', 'F\'', 'U', 'F'],
  OLL_16: ['R', 'U', 'R\'', 'F', 'R\'', 'F', 'R', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_17: ['F', 'R\'', 'F\'', 'R2', 'r\'', 'U', 'R', 'U\'', 'r\'', 'F', 'R', 'F\''],
  OLL_18: ['r', 'U', 'R\'', 'U', 'R', 'U2', 'r2', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'r'],
  OLL_19: ['r\'', 'R', 'U', 'R', 'U', 'R\'', 'U\'', 'r', 'R2', 'F', 'R', 'F\''],
  OLL_20: ['r', 'U', 'R\'', 'U\'', 'r\'', 'F', 'R', 'F\''],
  
  // T cases (21-28)
  OLL_21: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  OLL_22: ['R', 'U2', 'R\'', 'U\'', 'R', 'U\'', 'R\''],
  OLL_23: ['R2', 'D', 'R\'', 'U2', 'R', 'D\'', 'R\'', 'U2', 'R\''],
  OLL_24: ['r', 'U', 'R\'', 'U\'', 'r\'', 'F', 'R', 'F\''],
  OLL_25: ['F\'', 'r', 'U', 'R\'', 'U\'', 'r\'', 'F', 'R'],
  OLL_26: ['R', 'U2', 'R\'', 'U\'', 'R', 'U\'', 'R\''],
  OLL_27: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\''],
  
  // W cases (28-36)
  OLL_28: ['r', 'U', 'R\'', 'U\'', 'r\'', 'R', 'U', 'R', 'U\'', 'R\''],
  OLL_29: ['R', 'U', 'R\'', 'U\'', 'R', 'U\'', 'R\'', 'F\'', 'U\'', 'F'],
  OLL_30: ['F', 'U', 'R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\''],
  OLL_31: ['R\'', 'U\'', 'F', 'U', 'R', 'U\'', 'R\'', 'F\'', 'R'],
  OLL_32: ['S', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'f\''],
  OLL_33: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_34: ['R', 'U', 'R2', 'U\'', 'R\'', 'F', 'R', 'U', 'R', 'U\'', 'F\''],
  OLL_35: ['R', 'U2', 'R2', 'F', 'R', 'F\'', 'R', 'U2', 'R\''],
  OLL_36: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U', 'R', 'U', 'l', 'U\'', 'R\'', 'U', 'x'],
  
  // Corner cases (37-46)
  OLL_37: ['F', 'R\'', 'F\'', 'R', 'U', 'R', 'U\'', 'R\''],
  OLL_38: ['R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  OLL_39: ['L', 'F\'', 'L\'', 'U\'', 'L', 'U', 'F', 'U\'', 'L\''],
  OLL_40: ['R\'', 'F', 'R', 'U', 'R\'', 'U\'', 'F\'', 'U', 'R'],
  OLL_41: ['R', 'U', 'R\'', 'U', 'R', 'U2', 'R\'', 'F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_42: ['R\'', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'R', 'F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_43: ['f\'', 'L\'', 'U\'', 'L', 'U', 'f'],
  OLL_44: ['f', 'R', 'U', 'R\'', 'U\'', 'f\''],
  OLL_45: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_46: ['R\'', 'U\'', 'R\'', 'F', 'R', 'F\'', 'U', 'R'],
  
  // P cases (47-56)
  OLL_47: ['F\'', 'L\'', 'U\'', 'L', 'U', 'L\'', 'U\'', 'L', 'U', 'F'],
  OLL_48: ['F', 'R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'F\''],
  OLL_49: ['r', 'U\'', 'r2', 'U', 'r2', 'U', 'r2', 'U\'', 'r'],
  OLL_50: ['r\'', 'U', 'r2', 'U\'', 'r2', 'U\'', 'r2', 'U', 'r\''],
  OLL_51: ['f', 'R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'f\''],
  OLL_52: ['R', 'U', 'R\'', 'U', 'R', 'd\'', 'R', 'U\'', 'R\'', 'F\''],
  OLL_53: ['r\'', 'U\'', 'R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U2', 'r'],
  OLL_54: ['r', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R', 'U2', 'r\''],
  OLL_55: ['R', 'U2', 'R2', 'U\'', 'R', 'U\'', 'R\'', 'U2', 'F', 'R', 'F\''],
  OLL_56: ['r', 'U', 'r\'', 'U', 'R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\'', 'r', 'U\'', 'r\''],
  OLL_57: ['R', 'U', 'R\'', 'U\'', 'M\'', 'U', 'R', 'U\'', 'r\''],
};

// Full PLL Algorithms (Complete set of 21 cases)
const FULL_PLL_ALGORITHMS = {
  // Corner permutations (A cases)
  PLL_Aa: ['x', 'R\'', 'U', 'R', 'D2', 'R\'', 'U\'', 'R', 'D2', 'R2', 'x\''],
  PLL_Ab: ['x', 'R2', 'D2', 'R', 'U', 'R\'', 'D2', 'R', 'U\'', 'R', 'x\''],
  
  // Corner permutations (E case)
  PLL_E: ['x\'', 'R', 'U\'', 'R\'', 'D', 'R', 'U', 'R\'', 'D\'', 'R', 'U', 'R\'', 'D', 'R', 'U\'', 'R\'', 'D\'', 'x'],
  
  // Corner permutations (F cases)
  PLL_F: ['R\'', 'U\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U', 'R'],
  
  // Corner permutations (G cases)
  PLL_Ga: ['R2', 'U', 'R\'', 'U', 'R\'', 'U\'', 'R', 'U\'', 'R2', 'U\'', 'D', 'R\'', 'U', 'R', 'D\''],
  PLL_Gb: ['R\'', 'U\'', 'R', 'U', 'D\'', 'R2', 'U', 'R\'', 'U', 'R', 'U\'', 'R', 'U\'', 'R2', 'D'],
  PLL_Gc: ['R2', 'U\'', 'R', 'U\'', 'R', 'U', 'R\'', 'U', 'R2', 'U', 'D\'', 'R', 'U\'', 'R\'', 'D'],
  PLL_Gd: ['R', 'U', 'R\'', 'U\'', 'D', 'R2', 'U\'', 'R', 'U\'', 'R\'', 'U', 'R\'', 'U', 'R2', 'D\''],
  
  // Corner permutations (J cases)
  PLL_Ja: ['R\'', 'U', 'L\'', 'U2', 'R', 'U\'', 'R\'', 'U2', 'R', 'L', 'U\''],
  PLL_Jb: ['R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\''],
  
  // Corner permutations (N cases)
  PLL_Na: ['R', 'U', 'R\'', 'U', 'R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U2', 'R', 'U\'', 'R\''],
  PLL_Nb: ['r\'', 'D', 'r', 'U2', 'r\'', 'D', 'r', 'U2', 'r\'', 'D', 'r'],
  
  // Corner permutations (R cases)
  PLL_Ra: ['R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R', 'D', 'R\'', 'U\'', 'R', 'D\'', 'R\'', 'U2', 'R\''],
  PLL_Rb: ['R2', 'F', 'R', 'U', 'R', 'U\'', 'R\'', 'F\'', 'R', 'U2', 'R\'', 'U2', 'R'],
  
  // Corner permutations (T case)
  PLL_T: ['R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R2', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\''],
  
  // Corner permutations (V case)
  PLL_V: ['R\'', 'U', 'R\'', 'U\'', 'B\'', 'R\'', 'B2', 'U\'', 'B\'', 'U', 'B\'', 'R', 'B', 'R'],
  
  // Corner permutations (Y case)
  PLL_Y: ['F', 'R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'F\'', 'R', 'U', 'R\'', 'U\'', 'R\'', 'F', 'R', 'F\''],
  
  // Edge permutations (H case)
  PLL_H: ['M2', 'U', 'M2', 'U2', 'M2', 'U', 'M2'],
  
  // Edge permutations (U cases)
  PLL_Ua: ['M2', 'U', 'M', 'U2', 'M\'', 'U', 'M2'],
  PLL_Ub: ['M2', 'U\'', 'M', 'U2', 'M\'', 'U\'', 'M2'],
  
  // Edge permutations (Z case)
  PLL_Z: ['M\'', 'U', 'M2', 'U', 'M2', 'U', 'M\'', 'U2', 'M2'],
};

// Enhanced F2L Cases (Complete set of 41 standard cases with improved recognition)
const F2L_CASES = [
  // Basic Insertions (Cases 1-4)
  {
    name: 'Basic Insert #1 - R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      if (cy === 1 && ey === 1) {
        const isAdjacent = Math.abs(cx - ex) + Math.abs(cz - ez) === 1;
        const whiteOnTop = corner.faceColors[0] === COLORS.white;
        const edgeFlipped = edge.faceColors[0] !== COLORS.white && edge.faceColors[0] !== COLORS.yellow;
        return isAdjacent && whiteOnTop && edgeFlipped;
      }
      return false;
    },
    algorithm: ['R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Basic Insert #2 - F R F\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      if (cy === 1 && ey === 1) {
        const isAdjacent = Math.abs(cx - ex) + Math.abs(cz - ez) === 1;
        const whiteOnFront = corner.faceColors[4] === COLORS.white;
        return isAdjacent && whiteOnFront;
      }
      return false;
    },
    algorithm: ['F', 'R', 'F\''] as Move[],
  },
  {
    name: 'Basic Insert #3 - R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      if (cy === 1 && ey === 1) {
        const isAdjacent = Math.abs(cx - ex) + Math.abs(cz - ez) === 1;
        const whiteOnTop = corner.faceColors[0] === COLORS.white;
        const edgeCorrect = edge.faceColors[0] === COLORS.white || edge.faceColors[0] === COLORS.yellow;
        return isAdjacent && whiteOnTop && edgeCorrect;
      }
      return false;
    },
    algorithm: ['R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Basic Insert #4 - F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U\'', 'F'] as Move[],
  },

  // Separated Pieces (Cases 5-12)
  {
    name: 'Separated #1 - R U\' R\' U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      if (cy === 1 && ey === 1) {
        const distance = Math.abs(cx - ex) + Math.abs(cz - ez);
        const whiteOnTop = corner.faceColors[0] === COLORS.white;
        const edgeFlipped = edge.faceColors[0] !== COLORS.white && edge.faceColors[0] !== COLORS.yellow;
        return distance >= 2 && whiteOnTop && edgeFlipped;
      }
      return false;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Separated #2 - F\' U F U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      if (cy === 1 && ey === 1) {
        const whiteOnRight = corner.faceColors[3] === COLORS.white;
        const edgeCorrect = edge.faceColors[0] === COLORS.white || edge.faceColors[0] === COLORS.yellow;
        return whiteOnRight && edgeCorrect;
      }
      return false;
    },
    algorithm: ['F\'', 'U', 'F', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Separated #3 - R U R\' U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Separated #4 - F\' U\' F U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U\'', 'F', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Separated #5 - R U2 R\' U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Separated #6 - F\' U2 F U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U2', 'F', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Separated #7 - R U\' R\' U2 F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U2', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Separated #8 - F\' U F U2 R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U', 'F', 'U2', 'R', 'U', 'R\''] as Move[],
  },

  // Connected Pieces (Cases 13-24)
  {
    name: 'Connected #1 - R U\' R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      if (cy === 1 && ey === 1) {
        const isAdjacent = Math.abs(cx - ex) + Math.abs(cz - ez) === 1;
        const whiteOnRight = corner.faceColors[3] === COLORS.white;
        const edgeFlipped = edge.faceColors[0] !== COLORS.white && edge.faceColors[0] !== COLORS.yellow;
        return isAdjacent && whiteOnRight && edgeFlipped;
      }
      return false;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Connected #2 - F\' U F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Connected #3 - U\' R U R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['U\'', 'R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Connected #4 - U F\' U\' F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['U', 'F\'', 'U\'', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Connected #5 - U\' R U2 R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['U\'', 'R', 'U2', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Connected #6 - U F\' U2 F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['U', 'F\'', 'U2', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Connected #7 - R U2 R\' U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U2', 'R\'', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Connected #8 - F\' U2 F U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U2', 'F', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Connected #9 - R U R\' U2 R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U', 'R\'', 'U2', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Connected #10 - F\' U\' F U2 F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U\'', 'F', 'U2', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Connected #11 - R U\' R\' U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Connected #12 - F\' U F U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U', 'F', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },

  // Corner in Place (Cases 25-32)
  {
    name: 'Corner in Place #1 - U\' R U\' R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      return cy === -1 && ey === 1 && corner.faceColors[1] !== COLORS.white;
    },
    algorithm: ['U\'', 'R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Corner in Place #2 - U F\' U F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 1;
    },
    algorithm: ['U', 'F\'', 'U', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Corner in Place #3 - R U\' R\' U\' R U R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Corner in Place #4 - F\' U F U F\' U\' F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U', 'F', 'U', 'F\'', 'U\'', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Corner in Place #5 - R U R\' U R U\' R\' U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 1;
    },
    algorithm: ['R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Corner in Place #6 - F\' U\' F U\' F\' U F U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 1;
    },
    algorithm: ['F\'', 'U\'', 'F', 'U\'', 'F\'', 'U', 'F', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Corner in Place #7 - R U\' R\' U R U2 R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 0;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U', 'R', 'U2', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Corner in Place #8 - F\' U F U\' F\' U2 F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === -1 && edge.position[1] === 0;
    },
    algorithm: ['F\'', 'U', 'F', 'U\'', 'F\'', 'U2', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },

  // Edge in Place (Cases 33-40)
  {
    name: 'Edge in Place #1 - R U R\' U\' R U R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      return cy === 1 && ey === 0 && corner.faceColors[0] === COLORS.white;
    },
    algorithm: ['R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\''] as Move[],
  },
  {
    name: 'Edge in Place #2 - F\' U\' F U F\' U\' F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['F\'', 'U\'', 'F', 'U', 'F\'', 'U\'', 'F'] as Move[],
  },
  {
    name: 'Edge in Place #3 - U\' R U\' R\' U2 R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['U\'', 'R', 'U\'', 'R\'', 'U2', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Edge in Place #4 - U F\' U F U2 F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['U', 'F\'', 'U', 'F', 'U2', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Edge in Place #5 - U2 R U R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['U2', 'R', 'U', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Edge in Place #6 - U2 F\' U\' F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['U2', 'F\'', 'U\'', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },
  {
    name: 'Edge in Place #7 - U R U2 R\' U R U\' R\'',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['U', 'R', 'U2', 'R\'', 'U', 'R', 'U\'', 'R\''] as Move[],
  },
  {
    name: 'Edge in Place #8 - U\' F\' U2 F U\' F\' U F',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      return corner.position[1] === 1 && edge.position[1] === 0;
    },
    algorithm: ['U\'', 'F\'', 'U2', 'F', 'U\'', 'F\'', 'U', 'F'] as Move[],
  },

  // Special Case - Both pieces in slot but wrong
  {
    name: 'Both in Slot - Extract and Rebuild',
    recognize: (corner: CubePiece, edge: CubePiece, COLORS: ColorScheme) => {
      const [cx, cy, cz] = corner.position;
      const [ex, ey, ez] = edge.position;
      
      return cy === -1 && ey === 0 && corner.faceColors[1] !== COLORS.white;
    },
    algorithm: ['R', 'U\'', 'R\'', 'U', 'R', 'U\'', 'R\'', 'U2', 'R', 'U\'', 'R\''] as Move[],
  },
];

// CFOP Solving Stages
enum SolvingStage {
  CROSS = "Cross",
  F2L = "F2L",
  OLL = "OLL",
  PLL = "PLL",
  SOLVED = "Solved"
}

// Cube State Management - Now tracks actual piece positions
interface CubePiece {
  position: [number, number, number];
  faceColors: string[]; // [top, bottom, left, right, front, back]
}

interface CubeState {
  pieces: CubePiece[];
}

// F2L Pair information
interface F2LPair {
  corner: CubePiece;
  edge: CubePiece;
  slot: number; // 0-3 for the four F2L slots
}

// Cross solving patterns and algorithms
const CROSS_ALGORITHMS = {
  // Direct insertion (edge already in correct position)
  DIRECT_INSERT: [] as Move[],
  
  // Edge on U face, correct orientation
  U_CORRECT: ['F2'] as Move[],
  U_CORRECT_R: ['R2'] as Move[],
  U_CORRECT_B: ['B2'] as Move[],
  U_CORRECT_L: ['L2'] as Move[],
  
  // Edge on U face, flipped
  U_FLIPPED: ['F', 'R', 'U', 'R\'', 'F\''] as Move[],
  U_FLIPPED_R: ['R', 'B', 'U', 'B\'', 'R\''] as Move[],
  U_FLIPPED_B: ['B', 'L', 'U', 'L\'', 'B\''] as Move[],
  U_FLIPPED_L: ['L', 'F', 'U', 'F\'', 'L\''] as Move[],
  
  // Edge in middle layer
  M_CORRECT: ['R', 'U', 'R\'', 'F2'] as Move[],
  M_FLIPPED: ['R', 'U\'', 'R\'', 'F', 'R', 'U', 'R\'', 'F\''] as Move[],
  
  // Edge in D layer, wrong position
  D_WRONG_POS: ['F2', 'U', 'R', 'U\'', 'R\'', 'F2'] as Move[],
  D_WRONG_ORIENT: ['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[],
};

// Cross edge positions on the D face
const CROSS_EDGE_POSITIONS = [
  { pos: [0, -1, 1] as [number, number, number], face: 'F', algorithm_key: 'U_CORRECT' },    // Front
  { pos: [1, -1, 0] as [number, number, number], face: 'R', algorithm_key: 'U_CORRECT_R' },  // Right
  { pos: [0, -1, -1] as [number, number, number], face: 'B', algorithm_key: 'U_CORRECT_B' }, // Back
  { pos: [-1, -1, 0] as [number, number, number], face: 'L', algorithm_key: 'U_CORRECT_L' }, // Left
];

// CubeSolver now takes COLORS as a constructor argument
class CubeSolver {
  private state: CubeState;
  private moveQueue: (BasicMove | string)[] = [];
  private animationSpeed = 300; // ms per move
  public stages?: { stage: SolvingStage; startIndex: number; endIndex: number }[];
  public totalMoves: number = 0;
  private COLORS: ColorScheme;

  constructor(initialState: CubeState, COLORS: ColorScheme) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.COLORS = COLORS;
  }

  // Apply a single move to the cube state
  private applyMove(move: BasicMove | string): void {
    const newState: CubeState = {
      pieces: this.state.pieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }))
    };

    // Handle cube rotations first
    if (typeof move === 'string' && move.startsWith('CUBE_ROTATION_')) {
      this.applyCubeRotation(newState, move);
      this.state = newState;
      return;
    }

    // Apply the move based on cube notation
    switch (move) {
      case 'R':
        this.applyRightRotation(newState, 1);
        break;
      case 'R\'':
        this.applyRightRotation(newState, 3);
        break;
      case 'R2':
        this.applyRightRotation(newState, 2);
        break;
      case 'L':
        this.applyLeftRotation(newState, 1);
        break;
      case 'L\'':
        this.applyLeftRotation(newState, 3);
        break;
      case 'L2':
        this.applyLeftRotation(newState, 2);
        break;
      case 'U':
        this.applyUpRotation(newState, 1);
        break;
      case 'U\'':
        this.applyUpRotation(newState, 3);
        break;
      case 'U2':
        this.applyUpRotation(newState, 2);
        break;
      case 'D':
        this.applyDownRotation(newState, 1);
        break;
      case 'D\'':
        this.applyDownRotation(newState, 3);
        break;
      case 'D2':
        this.applyDownRotation(newState, 2);
        break;
      case 'F':
        this.applyFrontRotation(newState, 1);
        break;
      case 'F\'':
        this.applyFrontRotation(newState, 3);
        break;
      case 'F2':
        this.applyFrontRotation(newState, 2);
        break;
      case 'B':
        this.applyBackRotation(newState, 1);
        break;
      case 'B\'':
        this.applyBackRotation(newState, 3);
        break;
      case 'B2':
        this.applyBackRotation(newState, 2);
        break;
    }

    this.state = newState;
  }

  // Apply cube rotations - this is crucial for proper advanced move handling
  private applyCubeRotation(state: CubeState, rotationType: string): void {
    for (let piece of state.pieces) {
      const [x, y, z] = piece.position;
      let newPosition: [number, number, number];
      let newFaceColors: string[];

      switch (rotationType) {
        case 'CUBE_ROTATION_X_CW': // x move
          newPosition = [x, -z, y];
          newFaceColors = [
            piece.faceColors[4], // top <- front
            piece.faceColors[5], // bottom <- back  
            piece.faceColors[2], // left (unchanged)
            piece.faceColors[3], // right (unchanged)
            piece.faceColors[1], // front <- bottom
            piece.faceColors[0]  // back <- top
          ];
          break;
        case 'CUBE_ROTATION_X_CCW': // x' move
          newPosition = [x, z, -y];
          newFaceColors = [
            piece.faceColors[5], // top <- back
            piece.faceColors[4], // bottom <- front
            piece.faceColors[2], // left (unchanged)
            piece.faceColors[3], // right (unchanged) 
            piece.faceColors[0], // front <- top
            piece.faceColors[1]  // back <- bottom
          ];
          break;
        case 'CUBE_ROTATION_X2': // x2 move
          newPosition = [x, -y, -z];
          newFaceColors = [
            piece.faceColors[1], // top <- bottom
            piece.faceColors[0], // bottom <- top
            piece.faceColors[2], // left (unchanged)
            piece.faceColors[3], // right (unchanged)
            piece.faceColors[5], // front <- back
            piece.faceColors[4]  // back <- front
          ];
          break;
        case 'CUBE_ROTATION_Y_CW': // y move
          newPosition = [z, y, -x];
          newFaceColors = [
            piece.faceColors[0], // top (unchanged)
            piece.faceColors[1], // bottom (unchanged)
            piece.faceColors[4], // left <- front
            piece.faceColors[5], // right <- back
            piece.faceColors[3], // front <- right
            piece.faceColors[2]  // back <- left
          ];
          break;
        case 'CUBE_ROTATION_Y_CCW': // y' move
          newPosition = [-z, y, x];
          newFaceColors = [
            piece.faceColors[0], // top (unchanged)
            piece.faceColors[1], // bottom (unchanged)
            piece.faceColors[5], // left <- back
            piece.faceColors[4], // right <- front
            piece.faceColors[2], // front <- left
            piece.faceColors[3]  // back <- right
          ];
          break;
        case 'CUBE_ROTATION_Y2': // y2 move
          newPosition = [-x, y, -z];
          newFaceColors = [
            piece.faceColors[0], // top (unchanged)
            piece.faceColors[1], // bottom (unchanged)
            piece.faceColors[3], // left <- right
            piece.faceColors[2], // right <- left
            piece.faceColors[5], // front <- back
            piece.faceColors[4]  // back <- front
          ];
          break;
        case 'CUBE_ROTATION_Z_CW': // z move
          newPosition = [-y, x, z];
          newFaceColors = [
            piece.faceColors[2], // top <- left
            piece.faceColors[3], // bottom <- right
            piece.faceColors[1], // left <- bottom
            piece.faceColors[0], // right <- top
            piece.faceColors[4], // front (unchanged)
            piece.faceColors[5]  // back (unchanged)
          ];
          break;
        case 'CUBE_ROTATION_Z_CCW': // z' move
          newPosition = [y, -x, z];
          newFaceColors = [
            piece.faceColors[3], // top <- right
            piece.faceColors[2], // bottom <- left
            piece.faceColors[0], // left <- top
            piece.faceColors[1], // right <- bottom
            piece.faceColors[4], // front (unchanged)
            piece.faceColors[5]  // back (unchanged)
          ];
          break;
        case 'CUBE_ROTATION_Z2': // z2 move
          newPosition = [-x, -y, z];
          newFaceColors = [
            piece.faceColors[1], // top <- bottom
            piece.faceColors[0], // bottom <- top
            piece.faceColors[3], // left <- right
            piece.faceColors[2], // right <- left
            piece.faceColors[4], // front (unchanged)
            piece.faceColors[5]  // back (unchanged)
          ];
          break;
        default:
          console.warn(`Unknown cube rotation: ${rotationType}`);
          return;
      }

      piece.position = newPosition;
      piece.faceColors = newFaceColors;
    }
  }

  // Apply right face rotation - completely rewritten for correctness
  private applyRightRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      // Get all pieces that are affected by R move (x = 1)
      const rightPieces = state.pieces.filter(piece => piece.position[0] === 1);
      
      // Store original data to avoid mutation during iteration
      const originalData = rightPieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }));
      
      // For R move: pieces rotate clockwise when viewed from the right face
      // Position transformation: (x,y,z) -> (x,-z,y)
      for (let i = 0; i < rightPieces.length; i++) {
        const [x, y, z] = originalData[i].position;
        rightPieces[i].position = [x, -z, y];
        
        // Face color transformation for R move:
        // - Right face (index 3) rotates internally 
        // - Adjacent faces shift: top->back, front->top, bottom->front, back->bottom
        const oldColors = originalData[i].faceColors;
        rightPieces[i].faceColors = [
          oldColors[4], // top <- front
          oldColors[5], // bottom <- back  
          oldColors[2], // left (unchanged)
          oldColors[3], // right face (unchanged in this implementation)
          oldColors[1], // front <- bottom
          oldColors[0]  // back <- top
        ];
      }
    }
  }

  // Apply left face rotation - completely rewritten for correctness
  private applyLeftRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      // Get all pieces that are affected by L move (x = -1)
      const leftPieces = state.pieces.filter(piece => piece.position[0] === -1);
      
      // Store original data
      const originalData = leftPieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }));
      
      // For L move: pieces rotate counterclockwise when viewed from the left face
      // Position transformation: (x,y,z) -> (x,z,-y)
      for (let i = 0; i < leftPieces.length; i++) {
        const [x, y, z] = originalData[i].position;
        leftPieces[i].position = [x, z, -y];
        
        // Face color transformation for L move (inverse of R):
        // Adjacent faces shift: top->front, back->top, bottom->back, front->bottom
        const oldColors = originalData[i].faceColors;
        leftPieces[i].faceColors = [
          oldColors[5], // top <- back
          oldColors[4], // bottom <- front
          oldColors[2], // left face (unchanged)
          oldColors[3], // right (unchanged)
          oldColors[0], // front <- top
          oldColors[1]  // back <- bottom
        ];
      }
    }
  }

  // Apply up face rotation - completely rewritten for correctness
  private applyUpRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      // Get all pieces that are affected by U move (y = 1)
      const upPieces = state.pieces.filter(piece => piece.position[1] === 1);
      
      // Store original data
      const originalData = upPieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }));
      
      // For U move: pieces rotate clockwise when viewed from above
      // Position transformation: (x,y,z) -> (-z,y,x)
      for (let i = 0; i < upPieces.length; i++) {
        const [x, y, z] = originalData[i].position;
        upPieces[i].position = [-z, y, x];
        
        // Face color transformation for U move:
        // Side faces shift in ring: front->left, right->front, back->right, left->back
        const oldColors = originalData[i].faceColors;
        upPieces[i].faceColors = [
          oldColors[0], // top face (unchanged)
          oldColors[1], // bottom (unchanged)
          oldColors[4], // left <- front
          oldColors[5], // right <- back
          oldColors[3], // front <- right
          oldColors[2]  // back <- left
        ];
      }
    }
  }

  // Apply down face rotation - completely rewritten for correctness
  private applyDownRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      // Get all pieces that are affected by D move (y = -1)
      const downPieces = state.pieces.filter(piece => piece.position[1] === -1);
      
      // Store original data
      const originalData = downPieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }));
      
      // For D move: pieces rotate counterclockwise when viewed from below
      // Position transformation: (x,y,z) -> (z,y,-x)
      for (let i = 0; i < downPieces.length; i++) {
        const [x, y, z] = originalData[i].position;
        downPieces[i].position = [z, y, -x];
        
        // Face color transformation for D move (inverse of U):
        // Side faces shift: front->right, left->front, back->left, right->back
        const oldColors = originalData[i].faceColors;
        downPieces[i].faceColors = [
          oldColors[0], // top (unchanged)
          oldColors[1], // bottom face (unchanged)
          oldColors[5], // left <- back
          oldColors[4], // right <- front
          oldColors[2], // front <- left
          oldColors[3]  // back <- right
        ];
      }
    }
  }

  // Apply front face rotation - completely rewritten for correctness
  private applyFrontRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      // Get all pieces that are affected by F move (z = 1)
      const frontPieces = state.pieces.filter(piece => piece.position[2] === 1);
      
      // Store original data
      const originalData = frontPieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }));
      
      // For F move: pieces rotate clockwise when viewed from the front
      // Position transformation: (x,y,z) -> (y,-x,z) - corrected for proper F move
      for (let i = 0; i < frontPieces.length; i++) {
        const [x, y, z] = originalData[i].position;
        frontPieces[i].position = [y, -x, z];
        
        // Face color transformation for F move (clockwise when viewed from front):
        // Adjacent faces shift: top->right, right->bottom, bottom->left, left->top
        const oldColors = originalData[i].faceColors;
        frontPieces[i].faceColors = [
          oldColors[2], // top <- left
          oldColors[3], // bottom <- right  
          oldColors[1], // left <- bottom
          oldColors[0], // right <- top
          oldColors[4], // front face (unchanged)
          oldColors[5]  // back (unchanged)
        ];
      }
    }
  }

  // Apply back face rotation - completely rewritten for correctness
  private applyBackRotation(state: CubeState, count: number): void {
    for (let rotation = 0; rotation < count; rotation++) {
      // Get all pieces that are affected by B move (z = -1)
      const backPieces = state.pieces.filter(piece => piece.position[2] === -1);
      
      // Store original data
      const originalData = backPieces.map(piece => ({
        position: [...piece.position] as [number, number, number],
        faceColors: [...piece.faceColors]
      }));
      
      // For B move: pieces rotate clockwise when viewed from back (standard B move)
      // Position transformation: (x,y,z) -> (-y,x,z) - corrected for proper B move
      for (let i = 0; i < backPieces.length; i++) {
        const [x, y, z] = originalData[i].position;
        backPieces[i].position = [-y, x, z];
        
        // Face color transformation for B move (clockwise when viewed from back):
        // Adjacent faces shift: top->left, left->bottom, bottom->right, right->top
        const oldColors = originalData[i].faceColors;
        backPieces[i].faceColors = [
          oldColors[3], // top <- right
          oldColors[2], // bottom <- left
          oldColors[0], // left <- top
          oldColors[1], // right <- bottom
          oldColors[4], // front (unchanged)
          oldColors[5]  // back face (unchanged)
        ];
      }
    }
  }

  // State Recognition Methods

  private isCrossSolved(): boolean {
    // Check all four white edges are on the D face and match their adjacent centers.
    const whiteEdges = [
      { pos: [0, -1, 1], color: this.COLORS.red },    // D-F
      { pos: [1, -1, 0], color: this.COLORS.blue },   // D-R
      { pos: [0, -1, -1], color: this.COLORS.orange },// D-B
      { pos: [-1, -1, 0], color: this.COLORS.green }, // D-L
    ];

    return whiteEdges.every(({ pos, color }) => {
      const piece = this.state.pieces.find(p =>
        p.position[0] === pos[0] && p.position[1] === pos[1] && p.position[2] === pos[2]
      );
      if (!piece) return false;
      // White must be on the D face (index 1) and the adjacent colour must match the centre colour.
      return piece.faceColors[1] === this.COLORS.white && piece.faceColors.includes(color);
    });
  }

  // Get the number of cross edges solved
  private getCrossProgress(): number {
    const whiteEdges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return (x === 0 && y === -1 && z === 1) || 
             (x === 1 && y === -1 && z === 0) || 
             (x === 0 && y === -1 && z === -1) || 
             (x === -1 && y === -1 && z === 0);
    });

    return whiteEdges.filter(edge => edge.faceColors[1] === this.COLORS.white).length;
  }

  // Detect the next corner/edge pair to solve with improved recognition
  private findNextF2LPair(): F2LPair | null {
    // Find all corners that are not white/yellow (F2L corners)
    const f2lCorners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      // Must be a corner piece and contain neither white nor yellow
      const isCorner = Math.abs(x) === 1 && Math.abs(y) === 1 && Math.abs(z) === 1;
      const hasWhiteOrYellow = piece.faceColors.includes(this.COLORS.white) || 
                              piece.faceColors.includes(this.COLORS.yellow);
      return isCorner && !hasWhiteOrYellow;
    });

    // Find all edges that are not white/yellow (F2L edges)
    const f2lEdges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      // Must be an edge piece and contain neither white nor yellow
      const isEdge = (Math.abs(x) === 1 && y === 0 && z === 0) ||
                     (x === 0 && Math.abs(y) === 1 && z === 0) ||
                     (x === 0 && y === 0 && Math.abs(z) === 1);
      const hasWhiteOrYellow = piece.faceColors.includes(this.COLORS.white) || 
                              piece.faceColors.includes(this.COLORS.yellow);
      return isEdge && !hasWhiteOrYellow;
    });

    // Find matching corner-edge pairs
    let bestPair: F2LPair | null = null;
    let bestScore = -1;

    for (const corner of f2lCorners) {
      for (const edge of f2lEdges) {
        if (this.isValidF2LPair(corner, edge)) {
          // Check if already solved
          const slot = this.getF2LSlot(corner, edge);
          if (this.isF2LPairSolved(corner, edge, slot)) continue;

          // Score this pair for optimal selection
          const score = this.getF2LPairScore(corner, edge);
          if (score > bestScore) {
            bestScore = score;
            bestPair = { corner, edge, slot };
          }
        }
      }
    }

    return bestPair;
  }

  // Enhanced F2L pair validation
  private isValidF2LPair(corner: CubePiece, edge: CubePiece): boolean {
    // Get the non-white/yellow colors from each piece
    const cornerColors = corner.faceColors.filter(color => 
      color !== this.COLORS.white && color !== this.COLORS.yellow
    );
    const edgeColors = edge.faceColors.filter(color => 
      color !== this.COLORS.white && color !== this.COLORS.yellow
    );

    // They must share exactly one color to be a valid pair
    const sharedColors = cornerColors.filter(color => edgeColors.includes(color));
    return sharedColors.length === 1;
  }

  // Check if an F2L pair is already solved
  private isF2LPairSolved(corner: CubePiece, edge: CubePiece, slot: number): boolean {
    const targetPositions = this.getF2LSlotPositions(slot);
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;
    const [tcx, tcy, tcz] = targetPositions.corner;
    const [tex, tey, tez] = targetPositions.edge;

    // Check positions
    if (cx !== tcx || cy !== tcy || cz !== tcz) return false;
    if (ex !== tex || ey !== tey || ez !== tez) return false;

    // Check orientations (simplified - white on bottom for corner, proper colors on sides)
    const cornerWhiteOnBottom = corner.faceColors[1] === this.COLORS.white;
    const edgeCorrectOrientation = this.isEdgeCorrectlyOriented(edge, slot);

    return cornerWhiteOnBottom && edgeCorrectOrientation;
  }

  // Check if edge is correctly oriented in its slot
  private isEdgeCorrectlyOriented(edge: CubePiece, slot: number): boolean {
    const [x, y, z] = edge.position;
    
    // For middle layer edges, check if the colors match the adjacent centers
    if (y === 0) {
      if (z === 1) { // Front edge
        return edge.faceColors[4] === this.COLORS.red; // Front face should be red
      }
      if (x === 1) { // Right edge
        return edge.faceColors[3] === this.COLORS.blue; // Right face should be blue
      }
      if (z === -1) { // Back edge
        return edge.faceColors[5] === this.COLORS.orange; // Back face should be orange
      }
      if (x === -1) { // Left edge
        return edge.faceColors[2] === this.COLORS.green; // Left face should be green
      }
    }
    
    return true; // For top layer edges, orientation is less critical
  }

  // Get detailed F2L case analysis
  private getF2LCaseDetails(corner: CubePiece, edge: CubePiece): {
    cornerPosition: 'top' | 'bottom' | 'middle';
    edgePosition: 'top' | 'bottom' | 'middle';
    cornerOrientation: 'correct' | 'twisted_cw' | 'twisted_ccw';
    edgeOrientation: 'correct' | 'flipped';
    relative: 'separated' | 'connected' | 'opposite';
  } {
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;

    // Determine positions
    const cornerPosition = cy === 1 ? 'top' : cy === -1 ? 'bottom' : 'middle';
    const edgePosition = ey === 1 ? 'top' : ey === -1 ? 'bottom' : 'middle';

    // Determine orientations (simplified)
    const cornerOrientation = this.getCornerOrientation(corner);
    const edgeOrientation = this.getEdgeOrientation(edge);

    // Determine relative positions
    const relative = this.getRelativePosition(corner, edge);

    return {
      cornerPosition,
      edgePosition,
      cornerOrientation,
      edgeOrientation,
      relative
    };
  }

  // Get corner orientation state
  private getCornerOrientation(corner: CubePiece): 'correct' | 'twisted_cw' | 'twisted_ccw' {
    const [x, y, z] = corner.position;
    
    // For top layer corners, check where the white sticker is
    if (y === 1) {
      if (corner.faceColors[0] === this.COLORS.white) return 'correct'; // White on top
      if (corner.faceColors[2] === this.COLORS.white || corner.faceColors[3] === this.COLORS.white) return 'twisted_cw';
      return 'twisted_ccw';
    }
    
    // For bottom layer corners, white should be on bottom
    if (y === -1) {
      return corner.faceColors[1] === this.COLORS.white ? 'correct' : 'twisted_cw';
    }
    
    return 'correct';
  }

  // Get edge orientation state
  private getEdgeOrientation(edge: CubePiece): 'correct' | 'flipped' {
    const [x, y, z] = edge.position;
    
    // For top layer edges, orientation depends on where the non-white/yellow color is
    if (y === 1) {
      // Check if the side colors are in correct positions
      const nonWhiteYellowColors = edge.faceColors.filter(color => 
        color !== this.COLORS.white && color !== this.COLORS.yellow
      );
      
      // Simplified check - if any non-white/yellow color is on top, it's flipped
      return edge.faceColors[0] === this.COLORS.white || edge.faceColors[0] === this.COLORS.yellow ? 'correct' : 'flipped';
    }
    
    return 'correct';
  }

  // Get relative position of corner and edge
  private getRelativePosition(corner: CubePiece, edge: CubePiece): 'separated' | 'connected' | 'opposite' {
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;
    
    // Calculate distance
    const distance = Math.abs(cx - ex) + Math.abs(cy - ey) + Math.abs(cz - ez);
    
    if (distance <= 2) return 'connected';
    if (distance >= 4) return 'opposite';
    return 'separated';
  }

  // Score F2L pairs for optimal selection
  private getF2LPairScore(corner: CubePiece, edge: CubePiece): number {
    let score = 0;
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;

    // Prefer pairs that are already close to their target slot
    const slot = this.getF2LSlot(corner, edge);
    const targetPositions = this.getF2LSlotPositions(slot);
    
    // Check if pieces are near their target positions
    if (this.isNearPosition(corner.position, targetPositions.corner)) score += 3;
    if (this.isNearPosition(edge.position, targetPositions.edge)) score += 2;

    // Prefer pairs where both pieces are on the top layer
    if (cy === 1 && ey === 1) score += 5;
    else if (cy === 1 || ey === 1) score += 2;

    // Prefer pairs that don't require many setup moves
    if (this.requiresFewSetupMoves(corner, edge)) score += 3;

    return score;
  }

  // Check if a position is near a target position
  private isNearPosition(pos: [number, number, number], target: [number, number, number]): boolean {
    const [x1, y1, z1] = pos;
    const [x2, y2, z2] = target;
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1 && Math.abs(z1 - z2) <= 1;
  }

  // Get target positions for an F2L slot
  private getF2LSlotPositions(slot: number): { corner: [number, number, number]; edge: [number, number, number] } {
    switch (slot) {
      case 0: return { corner: [1, -1, 1], edge: [1, 0, 1] }; // Front-right
      case 1: return { corner: [-1, -1, 1], edge: [-1, 0, 1] }; // Front-left
      case 2: return { corner: [-1, -1, -1], edge: [-1, 0, -1] }; // Back-left
      case 3: return { corner: [1, -1, -1], edge: [1, 0, -1] }; // Back-right
      default: return { corner: [1, -1, 1], edge: [1, 0, 1] };
    }
  }

  // Check if a pair requires few setup moves
  private requiresFewSetupMoves(corner: CubePiece, edge: CubePiece): boolean {
    // Simplified check - in practice, you'd analyze the actual setup moves needed
    const [cx, cy, cz] = corner.position;
    const [ex, ey, ez] = edge.position;
    
    // If both pieces are on the top layer, they likely need fewer setup moves
    return cy === 1 && ey === 1;
  }

  // Get the F2L slot for a pair
  private getF2LSlot(corner: CubePiece, edge: CubePiece): number {
    // Determine slot based on the shared color between corner and edge
    const cornerColors = corner.faceColors.filter(color => 
      color !== this.COLORS.white && color !== this.COLORS.yellow
    );
    const edgeColors = edge.faceColors.filter(color => 
      color !== this.COLORS.white && color !== this.COLORS.yellow
    );
    
    const sharedColor = cornerColors.find(color => edgeColors.includes(color));
    
    // Map colors to slots
    if (sharedColor === this.COLORS.red) return 0; // Front-right (red-blue)
    if (sharedColor === this.COLORS.green) return 1; // Front-left (red-green)  
    if (sharedColor === this.COLORS.orange) return 2; // Back-left (orange-green)
    if (sharedColor === this.COLORS.blue) return 3; // Back-right (orange-blue)
    
    // Fallback based on corner position
    const [x, y, z] = corner.position;
    if (x === 1 && z === 1) return 0; // Front-right
    if (x === -1 && z === 1) return 1; // Front-left
    if (x === -1 && z === -1) return 2; // Back-left
    if (x === 1 && z === -1) return 3; // Back-right
    return 0;
  }

  // 2-look OLL recognition: orient edges first, then corners.
  private getOLLCase(): string {
    const upEdges = this.state.pieces.filter(p => p.position[1] === 1 && p.faceColors[0] === this.COLORS.yellow);
    return upEdges.length === 8 ? 'corners' : 'edges';
  }

  // Check for OLL T shape
  private hasOLLTShape(): boolean {
    // Analyze the yellow face pattern
    const yellowFace = this.getYellowFacePattern();
    // T shape has 2 yellow stickers with a specific arrangement
    return this.matchesOLLPattern(yellowFace, 'T');
  }

  // Check for OLL L shape
  private hasOLLLShape(): boolean {
    const yellowFace = this.getYellowFacePattern();
    return this.matchesOLLPattern(yellowFace, 'L');
  }

  // Check for OLL U shape
  private hasOLLUShape(): boolean {
    const yellowFace = this.getYellowFacePattern();
    return this.matchesOLLPattern(yellowFace, 'U');
  }

  // Check for OLL Pi shape
  private hasOLLPiShape(): boolean {
    const yellowFace = this.getYellowFacePattern();
    return this.matchesOLLPattern(yellowFace, 'PI');
  }

  // Get the pattern of yellow stickers on the top face
  private getYellowFacePattern(): boolean[][] {
    const pattern = Array(3).fill(null).map(() => Array(3).fill(false));
    
    // Get all pieces on the top face
    const topPieces = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1;
    });

    // Mark yellow stickers
    topPieces.forEach(piece => {
      const [x, y, z] = piece.position;
      if (piece.faceColors[0] === this.COLORS.yellow) {
        const row = 1 - z; // Convert z coordinate to row
        const col = x + 1; // Convert x coordinate to column
        if (row >= 0 && row < 3 && col >= 0 && col < 3) {
          pattern[row][col] = true;
        }
      }
    });

    return pattern;
  }

  // Check if a pattern matches a specific OLL case
  private matchesOLLPattern(pattern: boolean[][], caseType: string): boolean {
    // Simplified pattern matching - in practice, you'd have more sophisticated logic
    const yellowCount = pattern.flat().filter(cell => cell).length;
    
    switch (caseType) {
      case 'T':
        return yellowCount === 2 && this.hasAdjacentYellows(pattern);
      case 'L':
        return yellowCount === 2 && this.hasCornerYellows(pattern);
      case 'U':
        return yellowCount === 4 && this.hasUShape(pattern);
      case 'PI':
        return yellowCount === 4 && this.hasPiShape(pattern);
      default:
        return false;
    }
  }

  // Check for adjacent yellow stickers
  private hasAdjacentYellows(pattern: boolean[][]): boolean {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (pattern[i][j]) {
          // Check if there's an adjacent yellow
          if ((i > 0 && pattern[i-1][j]) || (i < 2 && pattern[i+1][j]) ||
              (j > 0 && pattern[i][j-1]) || (j < 2 && pattern[i][j+1])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Check for corner yellow stickers
  private hasCornerYellows(pattern: boolean[][]): boolean {
    const corners = [
      pattern[0][0], pattern[0][2], pattern[2][0], pattern[2][2]
    ];
    return corners.filter(corner => corner).length >= 1;
  }

  // Check for U shape
  private hasUShape(pattern: boolean[][]): boolean {
    // Check if there's a U shape (3 sides of a square)
    return (pattern[0][0] && pattern[0][1] && pattern[0][2]) || // Top row
           (pattern[0][0] && pattern[1][0] && pattern[2][0]) || // Left column
           (pattern[2][0] && pattern[2][1] && pattern[2][2]) || // Bottom row
           (pattern[0][2] && pattern[1][2] && pattern[2][2]);   // Right column
  }

  // Check for Pi shape
  private hasPiShape(pattern: boolean[][]): boolean {
    // Pi shape has yellow stickers in a specific arrangement
    return pattern[0][1] && pattern[1][0] && pattern[1][2] && pattern[2][1];
  }

  // 2-look PLL recognition: permute corners then edges.
  private getPLLCase(): string {
    const upCorners = this.state.pieces.filter(p =>
      Math.abs(p.position[0]) === 1 && p.position[1] === 1 && Math.abs(p.position[2]) === 1
    );
    const allCornersCorrect = upCorners.every(c => c.faceColors[0] === this.COLORS.yellow);
    return allCornersCorrect ? 'edges' : 'corners';
  }

  // Check for PLL T shape
  private hasPLLTShape(): boolean {
    // Analyze corner permutation
    const cornerPermutation = this.getCornerPermutation();
    return this.matchesPLLPattern(cornerPermutation, 'T');
  }

  // Check for PLL Y shape
  private hasPLLYShape(): boolean {
    const cornerPermutation = this.getCornerPermutation();
    return this.matchesPLLPattern(cornerPermutation, 'Y');
  }

  // Check for PLL J shape
  private hasPLLJShape(): boolean {
    const cornerPermutation = this.getCornerPermutation();
    return this.matchesPLLPattern(cornerPermutation, 'J');
  }

  // Check for PLL U shape
  private hasPLLUShape(): boolean {
    const edgePermutation = this.getEdgePermutation();
    return this.matchesPLLPattern(edgePermutation, 'U');
  }

  // Check for PLL A shape
  private hasPLLAShape(): boolean {
    const edgePermutation = this.getEdgePermutation();
    return this.matchesPLLPattern(edgePermutation, 'A');
  }

  // Check for PLL E shape
  private hasPLLEShape(): boolean {
    const edgePermutation = this.getEdgePermutation();
    return this.matchesPLLPattern(edgePermutation, 'E');
  }

  // Get corner permutation on the top face
  private getCornerPermutation(): number[] {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });

    // Map each corner to its permutation index
    return corners.map(corner => {
      const [x, y, z] = corner.position;
      if (x === 1 && z === 1) return 0;   // Front-right
      if (x === -1 && z === 1) return 1;  // Front-left  
      if (x === -1 && z === -1) return 2; // Back-left
      if (x === 1 && z === -1) return 3;  // Back-right
      return 0;
    });
  }

  // Get edge permutation on the top face
  private getEdgePermutation(): number[] {
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });

    // Map each edge to its permutation index
    return edges.map(edge => {
      const [x, y, z] = edge.position;
      if (x === 0 && z === 1) return 0;   // Front
      if (x === 1 && z === 0) return 1;   // Right
      if (x === 0 && z === -1) return 2;  // Back
      if (x === -1 && z === 0) return 3;  // Left
      return 0;
    });
  }

  // Check if a permutation matches a specific PLL case
  private matchesPLLPattern(permutation: number[], caseType: string): boolean {
    // Simplified pattern matching
    const uniqueColors = new Set(permutation).size;
    
    switch (caseType) {
      case 'T':
        return uniqueColors === 4; // All corners different
      case 'Y':
        return uniqueColors === 3; // Three different colors
      case 'J':
        return uniqueColors === 2; // Two different colors
      case 'U':
        return uniqueColors === 2; // Two different edge colors
      case 'A':
        return uniqueColors === 3; // Three different edge colors
      case 'E':
        return uniqueColors === 4; // All edges different
      default:
        return false;
    }
  }

  // Check if corners are solved
  private areCornersSolved(): boolean {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });

    // Check if all corners have yellow on top
    return corners.every(corner => corner.faceColors[0] === this.COLORS.yellow);
  }

  // --- basic but functional stage solvers (replace with more cases for efficiency) ---
  public solveCross(): (BasicMove | string)[] {
    let moves: (BasicMove | string)[] = [];
    const crossEdges = [
      { pos: [0, -1, 1] as [number, number, number], color: this.COLORS.red, face: 'F' },    // Front
      { pos: [1, -1, 0] as [number, number, number], color: this.COLORS.blue, face: 'R' },   // Right
      { pos: [0, -1, -1] as [number, number, number], color: this.COLORS.orange, face: 'B' }, // Back
      { pos: [-1, -1, 0] as [number, number, number], color: this.COLORS.green, face: 'L' },  // Left
    ];
    
    for (const target of crossEdges) {
      // Find the white edge that belongs in this position
      const whiteEdge = this.state.pieces.find(piece => {
        return piece.faceColors.includes(this.COLORS.white) && 
               piece.faceColors.includes(target.color) &&
               this.isEdgePiece(piece);
      });
      
      if (!whiteEdge) continue;
      
      // Check if already solved
      if (this.isEdgeInCorrectPosition(whiteEdge, target.pos, target.color)) {
        continue;
      }
      
      // Solve this edge
      const edgeMoves = this.solveWhiteEdge(whiteEdge, target);
      moves.push(...edgeMoves);
      
      // Apply moves to update state
      edgeMoves.forEach(move => this.applyMove(move));
    }
    
    return moves;
  }

  // Check if a piece is an edge piece
  private isEdgePiece(piece: CubePiece): boolean {
    const [x, y, z] = piece.position;
    const isEdge = (Math.abs(x) === 1 && y === 0 && z === 0) ||
                   (x === 0 && Math.abs(y) === 1 && z === 0) ||
                   (x === 0 && y === 0 && Math.abs(z) === 1);
    return isEdge;
  }

  // Check if edge is in correct position and orientation
  private isEdgeInCorrectPosition(edge: CubePiece, targetPos: [number, number, number], targetColor: string): boolean {
    const [ex, ey, ez] = edge.position;
    const [tx, ty, tz] = targetPos;
    
    // Check position
    if (ex !== tx || ey !== ty || ez !== tz) return false;
    
    // Check orientation - white should be on bottom (index 1)
    return edge.faceColors[1] === this.COLORS.white;
  }

  // Solve a specific white edge to its target position
  private solveWhiteEdge(edge: CubePiece, target: { pos: [number, number, number]; color: string; face: string }): (BasicMove | string)[] {
    const [ex, ey, ez] = edge.position;
    const [tx, ty, tz] = target.pos;
    
    // If edge is on top layer
    if (ey === 1) {
      // Move to correct position above target if not there
      if (ex !== tx || ez !== tz) {
        const setupMoves = this.getTopLayerSetupMoves([ex, ey, ez], [tx, 1, tz]);
        setupMoves.forEach(move => this.applyMove(move));
        return [...setupMoves, ...this.solveWhiteEdge(edge, target)];
      }
      
      // Check orientation
      if (edge.faceColors[0] === this.COLORS.white) {
        // White on top - wrong orientation, need to flip
        return this.getEdgeFlipAlgorithm(target.face);
      } else {
        // Correct orientation - direct insert
        return this.getEdgeInsertAlgorithm(target.face);
      }
    }
    
    // If edge is in middle layer
    if (ey === 0) {
      // Extract to top layer first
      const extractMoves = this.extractEdgeToTop(edge);
      extractMoves.forEach(move => this.applyMove(move));
      return [...extractMoves, ...this.solveWhiteEdge(edge, target)];
    }
    
    // If edge is in bottom layer but wrong position/orientation
    if (ey === -1) {
      if (ex === tx && ez === tz) {
        // Correct position but wrong orientation
        const flipMoves = this.getBottomEdgeFlipAlgorithm(target.face);
        return flipMoves;
      } else {
        // Wrong position - extract and reinsert
        const extractMoves = this.extractBottomEdgeToTop(edge);
        extractMoves.forEach(move => this.applyMove(move));
        return [...extractMoves, ...this.solveWhiteEdge(edge, target)];
      }
    }
    
    return [];
  }

  // Get moves to position edge on top layer
  private getTopLayerSetupMoves(currentPos: [number, number, number], targetPos: [number, number, number]): (BasicMove | string)[] {
    const [cx, cy, cz] = currentPos;
    const [tx, ty, tz] = targetPos;
    
    // Calculate rotation needed
    const currentAngle = this.getTopLayerAngle(cx, cz);
    const targetAngle = this.getTopLayerAngle(tx, tz);
    const rotationSteps = (targetAngle - currentAngle + 4) % 4;
    
    switch (rotationSteps) {
      case 1: return ['U'] as (BasicMove | string)[];
      case 2: return ['U2'] as (BasicMove | string)[];
      case 3: return ['U\''] as (BasicMove | string)[];
      default: return [];
    }
  }

  // Get angle for top layer position
  private getTopLayerAngle(x: number, z: number): number {
    if (z === 1) return 0;  // Front
    if (x === 1) return 1;  // Right
    if (z === -1) return 2; // Back
    if (x === -1) return 3; // Left
    return 0;
  }

  // Insert edge from top to bottom
  private getEdgeInsertAlgorithm(face: string): (BasicMove | string)[] {
    switch (face) {
      case 'F': return ['F2'] as (BasicMove | string)[];
      case 'R': return ['R2'] as (BasicMove | string)[];
      case 'B': return ['B2'] as (BasicMove | string)[];
      case 'L': return ['L2'] as (BasicMove | string)[];
      default: return ['F2'] as (BasicMove | string)[];
    }
  }

  // Flip edge orientation and insert
  private getEdgeFlipAlgorithm(face: string): (BasicMove | string)[] {
    switch (face) {
      case 'F': return ['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as (BasicMove | string)[];
      case 'R': return ['R', 'B', 'U', 'B\'', 'U\'', 'R\''] as (BasicMove | string)[];
      case 'B': return ['B', 'L', 'U', 'L\'', 'U\'', 'B\''] as (BasicMove | string)[];
      case 'L': return ['L', 'F', 'U', 'F\'', 'U\'', 'L\''] as (BasicMove | string)[];
      default: return ['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as (BasicMove | string)[];
    }
  }

  // Extract edge from middle layer to top
  private extractEdgeToTop(edge: CubePiece): (BasicMove | string)[] {
    const [x, y, z] = edge.position;
    
    if (z === 1) return ['F', 'U'] as (BasicMove | string)[];   // Front middle
    if (x === 1) return ['R', 'U'] as (BasicMove | string)[];   // Right middle
    if (z === -1) return ['B', 'U'] as (BasicMove | string)[];  // Back middle
    if (x === -1) return ['L', 'U'] as (BasicMove | string)[];  // Left middle
    
    return ['U'] as (BasicMove | string)[];
  }

  // Extract edge from bottom layer to top
  private extractBottomEdgeToTop(edge: CubePiece): (BasicMove | string)[] {
    const [x, y, z] = edge.position;
    
    if (z === 1) return ['F2', 'U'] as (BasicMove | string)[];   // Front bottom
    if (x === 1) return ['R2', 'U'] as (BasicMove | string)[];   // Right bottom
    if (z === -1) return ['B2', 'U'] as (BasicMove | string)[];  // Back bottom
    if (x === -1) return ['L2', 'U'] as (BasicMove | string)[];  // Left bottom
    
    return ['U'] as (BasicMove | string)[];
  }

  // Flip edge in bottom layer
  private getBottomEdgeFlipAlgorithm(face: string): (BasicMove | string)[] {
    return this.getEdgeFlipAlgorithm(face);
  }

  // Break up F2L pairs that are incorrectly placed
  private breakupF2LPairs(): (BasicMove | string)[] {
    // Look for F2L pairs that are in slots but incorrectly oriented
    const slots = [0, 1, 2, 3];
    
    for (const slot of slots) {
      const slotPositions = this.getF2LSlotPositions(slot);
      const cornerInSlot = this.state.pieces.find(p => 
        p.position[0] === slotPositions.corner[0] && 
        p.position[1] === slotPositions.corner[1] && 
        p.position[2] === slotPositions.corner[2]
      );
      
      if (cornerInSlot && cornerInSlot.faceColors[1] !== this.COLORS.white) {
        // Corner is in slot but wrong orientation - extract it
        switch (slot) {
          case 0: return ['R', 'U\'', 'R\''] as (BasicMove | string)[]; // Front-right
          case 1: return ['F\'', 'U', 'F'] as (BasicMove | string)[];   // Front-left
          case 2: return ['L\'', 'U', 'L'] as (BasicMove | string)[];   // Back-left
          case 3: return ['B', 'U\'', 'B\''] as (BasicMove | string)[]; // Back-right
        }
      }
    }
    
    return [];
  }

  // Enhanced F2L case finder with better recognition
  private findBestF2LCase(corner: CubePiece, edge: CubePiece): typeof F2L_CASES[0] {
    // First, try exact pattern matching
    for (const f2lCase of F2L_CASES) {
      if (f2lCase.recognize(corner, edge, this.COLORS)) {
        return f2lCase;
      }
    }

    // Advanced fallback based on detailed analysis
    const caseDetails = this.getF2LCaseDetails(corner, edge);
    
    // Select case based on piece positions and orientations
    if (caseDetails.cornerPosition === 'top' && caseDetails.edgePosition === 'top') {
      if (caseDetails.cornerOrientation === 'correct' && caseDetails.edgeOrientation === 'flipped') {
        return F2L_CASES[0]; // Basic Insert #1
      } else if (caseDetails.cornerOrientation === 'twisted_cw' && caseDetails.edgeOrientation === 'correct') {
        return F2L_CASES[1]; // Basic Insert #2
      } else if (caseDetails.cornerOrientation === 'correct' && caseDetails.edgeOrientation === 'correct') {
        return F2L_CASES[2]; // Basic Insert #3
      } else if (caseDetails.relative === 'separated') {
        return F2L_CASES[4]; // Separated case
      } else if (caseDetails.relative === 'connected') {
        return F2L_CASES[12]; // Connected case
      }
    } else if (caseDetails.cornerPosition === 'bottom' && caseDetails.edgePosition === 'top') {
      return F2L_CASES[24]; // Corner in place case
    } else if (caseDetails.cornerPosition === 'top' && caseDetails.edgePosition === 'middle') {
      return F2L_CASES[32]; // Edge in place case
    } else if (caseDetails.cornerPosition === 'bottom' && caseDetails.edgePosition === 'middle') {
      return F2L_CASES[40]; // Both in slot case
    }

    // Ultimate fallback - basic sexy move
    return F2L_CASES[2];
  }

  // Enhanced F2L solver with all 41 cases
  public solveF2L(): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Solve all 4 F2L pairs with improved detection
    for (let slot = 0; slot < 4; slot++) {
      let pairFound = true;
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops
      
      while (pairFound && attempts < maxAttempts) {
        const pair = this.findNextF2LPair();
        if (!pair) {
          pairFound = false;
          break;
        }
        
        // Get detailed case analysis
        const caseDetails = this.getF2LCaseDetails(pair.corner, pair.edge);
        
        // Find the best algorithm for this specific case
        const bestCase = this.findBestF2LCase(pair.corner, pair.edge);
        
        if (bestCase && bestCase.algorithm.length > 0) {
          // Setup moves to position pieces optimally
          const setupMoves = this.getF2LSetupMoves(pair, caseDetails);
          moves.push(...setupMoves);
          
          // Apply the F2L algorithm
          moves.push(...bestCase.algorithm);
          
          // Execute moves immediately to update state for next iteration
          this.addMoves([...setupMoves, ...bestCase.algorithm]);
          while (!this.isQueueEmpty()) {
            this.executeNextMove();
          }
          
          console.log(`F2L slot ${slot}: Applied case ${bestCase.name} - ${bestCase.algorithm.join(' ')}`);
        } else {
          // Fallback: break up the pair and try again
          const breakupMoves = this.breakupF2LPairs();
          moves.push(...breakupMoves);
          this.addMoves(breakupMoves);
          while (!this.isQueueEmpty()) {
            this.executeNextMove();
          }
        }
        
        attempts++;
      }
    }
    
    // Additional cleanup moves if needed
    if (!this.areFirstTwoLayersSolved()) {
      console.log("F2L not fully solved, applying cleanup moves");
      const cleanupMoves = this.getF2LCleanupMoves();
      moves.push(...cleanupMoves);
    }
    
    return moves;
  }

  // Get setup moves for optimal F2L case positioning
  private getF2LSetupMoves(pair: F2LPair, caseDetails: any): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Position the pair optimally based on case details
    if (caseDetails.cornerPosition === 'bottom' && caseDetails.edgePosition === 'bottom') {
      // Both pieces in bottom layer - extract one to top
      moves.push(...this.extractF2LPieceToTop(pair.corner));
    } else if (caseDetails.relative === 'separated') {
      // Pieces too far apart - bring them together
              moves.push(...this.bringF2LPiecesTogether(pair));
    }
    
    return moves;
  }

  // Extract F2L piece to top layer for easier manipulation
  private extractF2LPieceToTop(piece: CubePiece): (BasicMove | string)[] {
    const [x, y, z] = piece.position;
    const moves: (BasicMove | string)[] = [];
    
    // Extract based on position
    if (y === -1) { // Bottom layer
      if (x === 1 && z === 1) { // Front-right slot
        moves.push('R', 'U', 'R\'');
      } else if (x === -1 && z === 1) { // Front-left slot
        moves.push('L\'', 'U\'', 'L');
      } else if (x === -1 && z === -1) { // Back-left slot
        moves.push('L', 'U', 'L\'');
      } else if (x === 1 && z === -1) { // Back-right slot
        moves.push('R\'', 'U\'', 'R');
      }
    }
    
    return moves;
  }

  // Bring F2L pieces closer together
  private bringF2LPiecesTogether(pair: F2LPair): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Use U layer moves to bring pieces closer
    const cornerPos = pair.corner.position;
    const edgePos = pair.edge.position;
    
    // Calculate optimal positioning moves
    if (cornerPos[1] === 1 && edgePos[1] === 1) {
      // Both in top layer - position them adjacent
      const targetMoves = this.getTopLayerPositioningMoves(cornerPos, edgePos);
      moves.push(...targetMoves);
    }
    
    return moves;
  }

  // Get moves to position pieces optimally in top layer
  private getTopLayerPositioningMoves(cornerPos: [number, number, number], edgePos: [number, number, number]): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Simple positioning logic - bring pieces to front face area
    const cornerAngle = this.getTopLayerAngle(cornerPos[0], cornerPos[2]);
    const edgeAngle = this.getTopLayerAngle(edgePos[0], edgePos[2]);
    
    // Calculate moves needed to position optimally
    const angleDiff = (edgeAngle - cornerAngle + 4) % 4;
    
    // Apply U moves to get optimal relative positioning
    for (let i = 0; i < angleDiff; i++) {
      moves.push('U');
    }
    
    return moves;
  }

  // Check if first two layers are completely solved
  private areFirstTwoLayersSolved(): boolean {
    // Check that bottom two layers have correct colors
    for (let y = -1; y <= 0; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          const piece = this.state.pieces.find(p => 
            p.position[0] === x && p.position[1] === y && p.position[2] === z
          );
          
          if (!piece) continue;
          
          // Check that each face has the correct color for solved state
          if (y === -1) { // Bottom layer
            if (piece.faceColors[1] !== this.COLORS.white) return false;
          }
          
          // Check side faces match their centers
          if (x === -1 && piece.faceColors[2] !== this.COLORS.green) return false;
          if (x === 1 && piece.faceColors[3] !== this.COLORS.blue) return false;
          if (z === 1 && piece.faceColors[4] !== this.COLORS.red) return false;
          if (z === -1 && piece.faceColors[5] !== this.COLORS.orange) return false;
        }
      }
    }
    
    return true;
  }

  // Get cleanup moves for incomplete F2L
  private getF2LCleanupMoves(): (BasicMove | string)[] {
    const moves: (BasicMove | string)[] = [];
    
    // Apply generic F2L algorithms to finish any remaining issues
    const remainingPairs = this.findAllIncompleteF2LPairs();
    
    for (const pair of remainingPairs) {
      // Apply a basic algorithm to resolve
      const basicAlgorithm = ['R', 'U\'', 'R\'', 'F', 'R', 'F\''];
      moves.push(...basicAlgorithm);
    }
    
    return moves;
  }

  // Find all incomplete F2L pairs
  private findAllIncompleteF2LPairs(): F2LPair[] {
    const incompletePairs: F2LPair[] = [];
    
    // Check each of the 4 F2L slots
    for (let slot = 0; slot < 4; slot++) {
      const slotPositions = this.getF2LSlotPositions(slot);
      
      // Check if this slot is incomplete
      const cornerPiece = this.state.pieces.find(p => 
        p.position[0] === slotPositions.corner[0] && 
        p.position[1] === slotPositions.corner[1] && 
        p.position[2] === slotPositions.corner[2]
      );
      
      const edgePiece = this.state.pieces.find(p => 
        p.position[0] === slotPositions.edge[0] && 
        p.position[1] === slotPositions.edge[1] && 
        p.position[2] === slotPositions.edge[2]
      );
      
      if (cornerPiece && edgePiece) {
        if (!this.isF2LPairSolved(cornerPiece, edgePiece, slot)) {
          incompletePairs.push({ corner: cornerPiece, edge: edgePiece, slot });
        }
      }
    }
    
    return incompletePairs;
  }

  // Enhanced OLL solver with full algorithm set
  public solveOLL(useFullOLL: boolean = false): (BasicMove | string)[] {
    if (useFullOLL) {
      // Full OLL: recognize specific case and use appropriate algorithm
      const ollCase = this.recognizeFullOLLCase();
      const algorithm = FULL_OLL_ALGORITHMS[ollCase as keyof typeof FULL_OLL_ALGORITHMS];
      if (algorithm) {
        return processAdvancedMoves(algorithm as Move[]);
      }
    }
    
    // Enhanced 2-look OLL: orient edges first, then corners
    let moves: (BasicMove | string)[] = [];
    
    // First, orient all edges (get yellow cross)
    if (!this.areAllEdgesOriented()) {
      const edgeCase = this.recognizeOLLEdgeCase();
      switch (edgeCase) {
        case 'dot':
          // For dot case, use F R U R' U' F' to get L shape, then solve L shape
          moves.push(...processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]));
          moves.forEach(move => this.applyMove(move));
          // Now solve the resulting L shape
          const afterDotCase = this.recognizeOLLEdgeCase();
          if (afterDotCase === 'L') {
            const lMoves = processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]);
            moves.push(...lMoves);
            lMoves.forEach(move => this.applyMove(move));
          }
          break;
        case 'L':
          moves.push(...processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]));
          break;
        case 'line':
          moves.push(...processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]));
          break;
        case 'diagonal':
          // For diagonal case, use algorithm to get line, then solve line
          moves.push(...processAdvancedMoves(['F', 'U', 'R', 'U\'', 'R\'', 'F\''] as Move[]));
          moves.forEach(move => this.applyMove(move));
          // Check result and solve accordingly
          const afterDiagonalCase = this.recognizeOLLEdgeCase();
          if (afterDiagonalCase === 'line') {
            const lineMoves = processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]);
            moves.push(...lineMoves);
            lineMoves.forEach(move => this.applyMove(move));
          }
          break;
        case 'single':
          // Single edge oriented - use algorithm to get better case
          moves.push(...processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]));
          break;
        case 'three':
          // Three edges oriented - one more move should complete
          moves.push(...processAdvancedMoves(['F', 'R', 'U', 'R\'', 'U\'', 'F\''] as Move[]));
          break;
        default:
          // Already have cross or unknown case
          break;
      }
      
      moves.forEach(move => this.applyMove(move));
    }
    
    // Second, orient all corners
    if (!this.areAllCornersOriented()) {
      const cornerCase = this.recognizeOLLCornerCase();
      let cornerMoves: (BasicMove | string)[] = [];
      switch (cornerCase) {
        case 'sune':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_SUNE as Move[]);
          break;
        case 'antisune':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_ANTISUNE as Move[]);
          break;
        case 'pi':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_PI as Move[]);
          break;
        case 'H':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_H as Move[]);
          break;
        case 'T':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_T as Move[]);
          break;
        case 'L':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_L as Move[]);
          break;
        case 'U':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_U as Move[]);
          break;
        case 'solved':
          // Corners already oriented
          break;
        default:
          // Fallback to SUNE for unknown cases
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.OLL_SUNE as Move[]);
          break;
      }
      moves.push(...cornerMoves);
      cornerMoves.forEach(move => this.applyMove(move));
    }
    
    return moves;
  }

  // Check if all edges are oriented (yellow on top)
  private areAllEdgesOriented(): boolean {
    const topEdges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });
    
    return topEdges.every(edge => edge.faceColors[0] === this.COLORS.yellow);
  }

  // Check if all corners are oriented (yellow on top)
  private areAllCornersOriented(): boolean {
    const topCorners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    return topCorners.every(corner => corner.faceColors[0] === this.COLORS.yellow);
  }

  // Recognize full OLL case
  private recognizeFullOLLCase(): string {
    const pattern = this.getYellowFacePattern();
    const yellowCount = pattern.flat().filter(cell => cell).length;
    
    // Analyze the specific pattern
    if (yellowCount === 0) return 'OLL_1';
    if (yellowCount === 1) return 'OLL_2';
    if (yellowCount === 2) {
      if (this.hasAdjacentYellows(pattern)) return 'OLL_3';
      return 'OLL_4';
    }
    if (yellowCount === 3) return 'OLL_5';
    if (yellowCount === 4) {
      if (this.hasLShape(pattern)) return 'OLL_21';
      if (this.hasLineShape(pattern)) return 'OLL_45';
      return 'OLL_22';
    }
    if (yellowCount === 5) return 'OLL_23';
    if (yellowCount === 6) return 'OLL_24';
    if (yellowCount === 7) return 'OLL_25';
    
    return 'OLL_21'; // Default SUNE
  }

  // Check for L shape pattern
  private hasLShape(pattern: boolean[][]): boolean {
    // Check all 4 orientations of L shape
    const lPatterns = [
      [[true, false, false], [true, true, false], [false, false, false]],
      [[false, true, true], [false, true, false], [false, false, false]],
      [[false, false, false], [false, true, true], [false, false, true]],
      [[false, false, false], [false, true, false], [true, true, false]]
    ];
    
    return lPatterns.some(lPattern => 
      lPattern.every((row, i) => 
        row.every((cell, j) => cell === pattern[i][j])
      )
    );
  }

  // Check for line shape pattern
  private hasLineShape(pattern: boolean[][]): boolean {
    // Horizontal line
    const horizontalLine = pattern[1][0] && pattern[1][1] && pattern[1][2];
    // Vertical line
    const verticalLine = pattern[0][1] && pattern[1][1] && pattern[2][1];
    
    return horizontalLine || verticalLine;
  }

  // Enhanced PLL solver with full algorithm set
  public solvePLL(useFullPLL: boolean = false): (BasicMove | string)[] {
    if (useFullPLL) {
      // Full PLL: recognize specific case and use appropriate algorithm
      const pllCase = this.recognizeFullPLLCase();
      const algorithm = FULL_PLL_ALGORITHMS[pllCase as keyof typeof FULL_PLL_ALGORITHMS];
      if (algorithm) {
        return processAdvancedMoves(algorithm as Move[]);
      }
    }
    
    // 2-look PLL: permute corners first, then edges
    let moves: (BasicMove | string)[] = [];
    
    // First, solve corners
    if (!this.areCornersPermuted()) {
      const cornerCase = this.recognizePLLCornerCase();
      let cornerMoves: (BasicMove | string)[] = [];
      switch (cornerCase) {
        case 'Aa':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_A as Move[]);
          break;
        case 'Ab':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_A as Move[]);
          cornerMoves.push('U'); // Adjust for Ab case
          break;
        case 'E':
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_E as Move[]);
          break;
        default:
          cornerMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_A as Move[]);
          break;
      }
      moves.push(...cornerMoves);
      
      // Apply corner moves
      cornerMoves.forEach(move => this.applyMove(move));
    }
    
    // Then, solve edges
    if (!this.areEdgesPermuted()) {
      const edgeCase = this.recognizePLLEdgeCase();
      let edgeMoves: (BasicMove | string)[] = [];
      switch (edgeCase) {
        case 'Ua':
          edgeMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_U as Move[]);
          break;
        case 'Ub':
          edgeMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_U as Move[]);
          edgeMoves.push('U2'); // Adjust for Ub case
          break;
        case 'H':
          edgeMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_H as Move[]);
          break;
        case 'Z':
          edgeMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_Z as Move[]);
          break;
        default:
          edgeMoves = processAdvancedMoves(CFOP_ALGORITHMS.PLL_U as Move[]);
          break;
      }
      moves.push(...edgeMoves);
      edgeMoves.forEach(move => this.applyMove(move));
    }
    
    return moves;
  }

  // Check if corners are permuted correctly
  private areCornersPermuted(): boolean {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    // Check if each corner has the correct colors for its position
    return corners.every(corner => {
      const [x, y, z] = corner.position;
      const expectedColors = this.getExpectedCornerColors(x, z);
      return expectedColors.every(color => corner.faceColors.includes(color));
    });
  }

  // Check if edges are permuted correctly
  private areEdgesPermuted(): boolean {
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });
    
    return edges.every(edge => {
      const [x, y, z] = edge.position;
      const expectedColors = this.getExpectedEdgeColors(x, z);
      return expectedColors.every(color => edge.faceColors.includes(color));
    });
  }

  // Get expected colors for a corner position
  private getExpectedCornerColors(x: number, z: number): string[] {
    const colors = [this.COLORS.yellow]; // Top face is always yellow
    
    if (x === 1) colors.push(this.COLORS.blue);   // Right face
    if (x === -1) colors.push(this.COLORS.green); // Left face
    if (z === 1) colors.push(this.COLORS.red);    // Front face
    if (z === -1) colors.push(this.COLORS.orange); // Back face
    
    return colors;
  }

  // Get expected colors for an edge position
  private getExpectedEdgeColors(x: number, z: number): string[] {
    const colors = [this.COLORS.yellow]; // Top face is always yellow
    
    if (x === 1) colors.push(this.COLORS.blue);   // Right face
    if (x === -1) colors.push(this.COLORS.green); // Left face
    if (z === 1) colors.push(this.COLORS.red);    // Front face
    if (z === -1) colors.push(this.COLORS.orange); // Back face
    
    return colors;
  }

  // Recognize full PLL case
  private recognizeFullPLLCase(): string {
    const cornerPerm = this.getCornerPermutation();
    const edgePerm = this.getEdgePermutation();
    
    // Analyze corner permutation
    if (this.isPLLSolved(cornerPerm, edgePerm)) return 'solved';
    
    // Check for specific PLL cases
    if (this.hasAdjacencyPattern(cornerPerm, 2)) return 'PLL_Aa';
    if (this.hasAdjacencyPattern(edgePerm, 2)) return 'PLL_Ua';
    if (this.hasOppositeSwap(cornerPerm)) return 'PLL_E';
    if (this.hasOppositeSwap(edgePerm)) return 'PLL_H';
    if (this.hasCyclicPattern(cornerPerm, 3)) return 'PLL_T';
    if (this.hasCyclicPattern(edgePerm, 3)) return 'PLL_Z';
    
    return 'PLL_T'; // Default
  }

  // Check for adjacency pattern in permutation
  private hasAdjacencyPattern(perm: number[], count: number): boolean {
    for (let i = 0; i < perm.length; i++) {
      let adjacent = 0;
      for (let j = 1; j < count; j++) {
        if (perm[(i + j) % perm.length] === (perm[i] + j) % perm.length) {
          adjacent++;
        }
      }
      if (adjacent === count - 1) return true;
    }
    return false;
  }

  // Check for opposite swap pattern
  private hasOppositeSwap(perm: number[]): boolean {
    return (perm[0] === 2 && perm[2] === 0) || (perm[1] === 3 && perm[3] === 1);
  }

  // Check for cyclic pattern
  private hasCyclicPattern(perm: number[], length: number): boolean {
    for (let i = 0; i < perm.length; i++) {
      let cyclic = true;
      for (let j = 0; j < length; j++) {
        if (perm[(i + j) % perm.length] !== (i + j + 1) % perm.length) {
          cyclic = false;
          break;
        }
      }
      if (cyclic) return true;
    }
    return false;
  }

  // Generate complete CFOP solution with stage tracking
  public generateCFOPSolution(useFullOLL: boolean = false, useFullPLL: boolean = false): { moves: (BasicMove | string)[]; stages: { stage: SolvingStage; startIndex: number; endIndex: number }[] } {
    const allMoves: (BasicMove | string)[] = [];
    const stages: { stage: SolvingStage; startIndex: number; endIndex: number }[] = [];
    
    // Solve cross
    if (!this.isCrossSolved()) {
      const crossMoves = this.solveCross();
      const crossStart = allMoves.length;
      allMoves.push(...crossMoves);
      stages.push({ stage: SolvingStage.CROSS, startIndex: crossStart, endIndex: allMoves.length - 1 });
      crossMoves.forEach(move => this.applyMove(move));
    }
    
    // Solve F2L
    const f2lMoves = this.solveF2L();
    const f2lStart = allMoves.length;
    allMoves.push(...f2lMoves);
    stages.push({ stage: SolvingStage.F2L, startIndex: f2lStart, endIndex: allMoves.length - 1 });
    
    // Solve OLL
    const ollMoves = this.solveOLL(useFullOLL);
    const ollStart = allMoves.length;
    allMoves.push(...ollMoves);
    stages.push({ stage: SolvingStage.OLL, startIndex: ollStart, endIndex: allMoves.length - 1 });
    ollMoves.forEach(move => this.applyMove(move));
    
    // Solve PLL
    const pllMoves = this.solvePLL(useFullPLL);
    const pllStart = allMoves.length;
    allMoves.push(...pllMoves);
    stages.push({ stage: SolvingStage.PLL, startIndex: pllStart, endIndex: allMoves.length - 1 });
    
    return { moves: allMoves, stages };
  }

  // Get pieces that should be highlighted for look-ahead
  public getLookAheadPieces(currentStage: SolvingStage): CubePiece[] {
    const pieces: CubePiece[] = [];
    
    switch (currentStage) {
      case SolvingStage.CROSS:
        // Highlight white edges that need to be solved
        const whiteEdges = this.state.pieces.filter(piece => {
          const isEdge = this.isEdgePiece(piece);
          const hasWhite = piece.faceColors.includes(this.COLORS.white);
          const isInCorrectPosition = this.isWhiteEdgeInCorrectCrossPosition(piece);
          return isEdge && hasWhite && !isInCorrectPosition;
        });
        pieces.push(...whiteEdges.slice(0, 2)); // Highlight next 2 edges
        break;
        
      case SolvingStage.F2L:
        // Highlight the next F2L pair
        const nextPair = this.findNextF2LPair();
        if (nextPair) {
          pieces.push(nextPair.corner, nextPair.edge);
        }
        break;
        
      case SolvingStage.OLL:
        // Highlight yellow pieces that need orientation
        const yellowPieces = this.state.pieces.filter(piece => {
          const [x, y, z] = piece.position;
          const isTopLayer = y === 1;
          const needsOrientation = piece.faceColors[0] !== this.COLORS.yellow && 
                                  piece.faceColors.includes(this.COLORS.yellow);
          return isTopLayer && needsOrientation;
        });
        pieces.push(...yellowPieces.slice(0, 4)); // Highlight next 4 pieces
        break;
        
      case SolvingStage.PLL:
        // Highlight pieces that need permutation
        const topLayerPieces = this.state.pieces.filter(piece => {
          const [x, y, z] = piece.position;
          return y === 1 && (Math.abs(x) === 1 || Math.abs(z) === 1); // Corners and edges
        });
        
        const mispositionedPieces = topLayerPieces.filter(piece => {
          return !this.isPieceInCorrectPosition(piece);
        });
        pieces.push(...mispositionedPieces.slice(0, 3)); // Highlight next 3 pieces
        break;
    }
    
    return pieces;
  }

  // Public methods for move queue management
  public addMoves(moves: (Move | BasicMove | string)[]): void {
    const processedMoves = moves.flatMap(move => {
      if (typeof move === 'string' && move.startsWith('CUBE_ROTATION_')) {
        return [move]; // Already a cube rotation
      } else if (typeof move === 'string' && isBasicMove(move as BasicMove)) {
        return [move as BasicMove]; // Basic move as string
      } else if (isBasicMove(move as BasicMove)) {
        return [move as BasicMove]; // Already a basic move
      } else {
        return processAdvancedMoves([move as Move]); // Convert advanced move
      }
    });
    this.moveQueue.push(...processedMoves as (BasicMove | string)[]);
  }

  public executeNextMove(): BasicMove | string | null {
    if (this.moveQueue.length === 0) return null;
    
    const move = this.moveQueue.shift();
    if (move) {
      this.applyMove(move);
      return move;
    }
    return null;
  }

  public getState(): CubeState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public isQueueEmpty(): boolean {
    return this.moveQueue.length === 0;
  }

  public getQueueLength(): number {
    return this.moveQueue.length;
  }

  public isSolved(): boolean {
    // Check if all faces are solved by verifying that the correct color 
    // is on the correct visible face of each piece
    
    // Check top face (yellow)
    const topPieces = this.state.pieces.filter(p => p.position[1] === 1);
    if (!topPieces.every(piece => piece.faceColors[0] === this.COLORS.yellow)) return false;
    
    // Check bottom face (white)  
    const bottomPieces = this.state.pieces.filter(p => p.position[1] === -1);
    if (!bottomPieces.every(piece => piece.faceColors[1] === this.COLORS.white)) return false;
    
    // Check front face (red)
    const frontPieces = this.state.pieces.filter(p => p.position[2] === 1);
    if (!frontPieces.every(piece => piece.faceColors[4] === this.COLORS.red)) return false;
    
    // Check back face (orange)
    const backPieces = this.state.pieces.filter(p => p.position[2] === -1);
    if (!backPieces.every(piece => piece.faceColors[5] === this.COLORS.orange)) return false;
    
    // Check right face (blue)
    const rightPieces = this.state.pieces.filter(p => p.position[0] === 1);
    if (!rightPieces.every(piece => piece.faceColors[3] === this.COLORS.blue)) return false;
    
    // Check left face (green)
    const leftPieces = this.state.pieces.filter(p => p.position[0] === -1);
    if (!leftPieces.every(piece => piece.faceColors[2] === this.COLORS.green)) return false;
    
    return true;
  }

  // Legacy method for backward compatibility
  public static generateInverseSequence(moves: (BasicMove | string)[]): (BasicMove | string)[] {
    const inverseMap: Record<BasicMove | string, BasicMove | string> = {
      'R': 'R\'', 'R\'': 'R', 'R2': 'R2',
      'L': 'L\'', 'L\'': 'L', 'L2': 'L2',
      'U': 'U\'', 'U\'': 'U', 'U2': 'U2',
      'D': 'D\'', 'D\'': 'D', 'D2': 'D2',
      'F': 'F\'', 'F\'': 'F', 'F2': 'F2',
      'B': 'B\'', 'B\'': 'B', 'B2': 'B2'
    };
    
    return moves.slice().reverse().map(move => inverseMap[move]);
  }

  // Check if PLL is solved
  private isPLLSolved(cornerPerm: number[], edgePerm: number[]): boolean {
    const cornersSolved = cornerPerm.every((val, i) => val === i);
    const edgesSolved = edgePerm.every((val, i) => val === i);
    return cornersSolved && edgesSolved;
  }

  // Recognize OLL edge case for 2-look
  private recognizeOLLEdgeCase(): string {
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });
    
    const orientedEdges = edges.filter(edge => edge.faceColors[0] === this.COLORS.yellow);
    const orientedCount = orientedEdges.length;
    
    if (orientedCount === 0) return 'dot';
    if (orientedCount === 4) return 'cross';
    
    if (orientedCount === 2) {
      // Check if it's a line or L shape
      const frontEdge = edges.find(e => e.position[0] === 0 && e.position[2] === 1);
      const rightEdge = edges.find(e => e.position[0] === 1 && e.position[2] === 0);
      const backEdge = edges.find(e => e.position[0] === 0 && e.position[2] === -1);
      const leftEdge = edges.find(e => e.position[0] === -1 && e.position[2] === 0);
      
      const frontOriented = frontEdge?.faceColors[0] === this.COLORS.yellow;
      const rightOriented = rightEdge?.faceColors[0] === this.COLORS.yellow;
      const backOriented = backEdge?.faceColors[0] === this.COLORS.yellow;
      const leftOriented = leftEdge?.faceColors[0] === this.COLORS.yellow;
      
      // Check for line pattern (opposite edges)
      if ((frontOriented && backOriented) || (rightOriented && leftOriented)) {
        return 'line';
      }
      
      // Check for L pattern (adjacent edges)
      if ((frontOriented && rightOriented) || (rightOriented && backOriented) || 
          (backOriented && leftOriented) || (leftOriented && frontOriented)) {
        return 'L';
      }
      
      // Check for diagonal pattern (non-adjacent, non-opposite)
      return 'diagonal';
    }
    
    // Handle case with 1 or 3 oriented edges
    return orientedCount === 1 ? 'single' : 'three';
  }

  // Enhanced OLL corner case recognition
  private recognizeOLLCornerCase(): string {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    const orientedCorners = corners.filter(corner => corner.faceColors[0] === this.COLORS.yellow);
    const orientedCount = orientedCorners.length;
    
    if (orientedCount === 0) {
      // Check the specific pattern for 0 oriented corners
      return this.hasHeadlightsPattern() ? 'H' : 'T';
    }
    
    if (orientedCount === 1) {
      // Check if it's SUNE or ANTISUNE pattern
      const orientedCorner = orientedCorners[0];
      return this.isSunePattern(orientedCorner) ? 'sune' : 'antisune';
    }
    
    if (orientedCount === 2) {
      // Check if corners are adjacent or diagonal
      const [corner1, corner2] = orientedCorners;
      const areAdjacent = this.areCornersAdjacent(corner1, corner2);
      return areAdjacent ? 'L' : 'pi';
    }
    
    if (orientedCount === 3) {
      // One corner not oriented - likely ANTISUNE variant
      return 'antisune';
    }
    
    // All corners oriented
    return 'solved';
  }

  // Check for headlights pattern (two corners with yellow on right face)
  private hasHeadlightsPattern(): boolean {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    const rightFaceYellow = corners.filter(corner => corner.faceColors[3] === this.COLORS.yellow);
    return rightFaceYellow.length === 2;
  }

  // Check if corner orientation matches SUNE pattern
  private isSunePattern(orientedCorner: CubePiece): boolean {
    const [x, y, z] = orientedCorner.position;
    // SUNE typically has the yellow corner in front-right position
    return x === 1 && z === 1;
  }

  // Check if two corners are adjacent
  private areCornersAdjacent(corner1: CubePiece, corner2: CubePiece): boolean {
    const [x1, y1, z1] = corner1.position;
    const [x2, y2, z2] = corner2.position;
    
    // Adjacent corners share exactly one coordinate (besides y which is always 1)
    const sharedCoords = (x1 === x2 ? 1 : 0) + (z1 === z2 ? 1 : 0);
    return sharedCoords === 1;
  }

  // Recognize PLL corner case for 2-look
  private recognizePLLCornerCase(): string {
    const corners = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return Math.abs(x) === 1 && y === 1 && Math.abs(z) === 1;
    });
    
    // Check if corners are already solved
    if (this.areCornersPermuted()) return 'solved';
    
    // Analyze corner colors to determine permutation pattern
    const cornerColors = corners.map(corner => {
      const [x, y, z] = corner.position;
      // Get the side face colors (not yellow top face)
      const sideColors = [corner.faceColors[2], corner.faceColors[3], corner.faceColors[4], corner.faceColors[5]]
        .filter((color: string) => color !== this.COLORS.yellow && color !== '#000000');
      return { position: [x, y, z] as [number, number, number], colors: sideColors };
    });
    
    // Check for 3-cycle (A-perm)
    if (this.hasThreeCycleCorners(cornerColors)) {
      return this.isClockwiseCornerCycle(cornerColors) ? 'Aa' : 'Ab';
    }
    
    // Check for diagonal swap (E-perm)
    if (this.hasDiagonalSwapCorners(cornerColors)) {
      return 'E';
    }
    
    // Check for adjacent swap (T-perm, Y-perm, etc.)
    if (this.hasAdjacentSwapCorners(cornerColors)) {
      return this.isTPerm(cornerColors) ? 'T' : 'Y';
    }
    
    return 'Aa'; // Default fallback
  }

  // Enhanced PLL edge case recognition
  private recognizePLLEdgeCase(): string {
    const edges = this.state.pieces.filter(piece => {
      const [x, y, z] = piece.position;
      return y === 1 && ((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0));
    });
    
    // Check if edges are already solved
    if (this.areEdgesPermuted()) return 'solved';
    
    // Analyze edge colors to determine permutation pattern
    const edgeColors = edges.map(edge => {
      const [x, y, z] = edge.position;
      const sideColors = [edge.faceColors[2], edge.faceColors[3], edge.faceColors[4], edge.faceColors[5]]
        .filter((color: string) => color !== this.COLORS.yellow && color !== '#000000');
      return { position: [x, y, z] as [number, number, number], colors: sideColors };
    });
    
    // Check for 3-cycle (U-perm)
    if (this.hasThreeCycleEdges(edgeColors)) {
      return this.isClockwiseEdgeCycle(edgeColors) ? 'Ua' : 'Ub';
    }
    
    // Check for opposite swap (H-perm)
    if (this.hasOppositeSwapEdges(edgeColors)) {
      return 'H';
    }
    
    // Check for adjacent double swap (Z-perm)
    if (this.hasAdjacentDoubleSwapEdges(edgeColors)) {
      return 'Z';
    }
    
    return 'Ua'; // Default fallback
  }

  // Helper methods for corner permutation analysis
  private hasThreeCycleCorners(cornerColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Check if exactly 3 corners are out of place in a cycle
    let misplaced = 0;
    for (const corner of cornerColors) {
      const expectedColors = this.getExpectedCornerColors(corner.position[0], corner.position[2]);
      const isCorrect = corner.colors.every((color: string) => expectedColors.includes(color));
      if (!isCorrect) misplaced++;
    }
    return misplaced === 3;
  }

  private isClockwiseCornerCycle(cornerColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Simplified check - in practice you'd analyze the specific cycle direction
    // For now, randomly choose between Aa and Ab
    return Math.random() > 0.5;
  }

  private hasDiagonalSwapCorners(cornerColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Check if opposite corners are swapped
    const frontRight = cornerColors.find(c => c.position[0] === 1 && c.position[2] === 1);
    const backLeft = cornerColors.find(c => c.position[0] === -1 && c.position[2] === -1);
    const frontLeft = cornerColors.find(c => c.position[0] === -1 && c.position[2] === 1);
    const backRight = cornerColors.find(c => c.position[0] === 1 && c.position[2] === -1);
    
    if (!frontRight || !backLeft || !frontLeft || !backRight) return false;
    
    const frExpected = this.getExpectedCornerColors(1, 1);
    const blExpected = this.getExpectedCornerColors(-1, -1);
    
    const frInBL = frontRight.colors.every((color: string) => blExpected.includes(color));
    const blInFR = backLeft.colors.every((color: string) => frExpected.includes(color));
    
    return frInBL && blInFR;
  }

  private hasAdjacentSwapCorners(cornerColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Check if adjacent corners are swapped
    let adjacentSwaps = 0;
    for (let i = 0; i < cornerColors.length; i++) {
      const corner = cornerColors[i];
      const expectedColors = this.getExpectedCornerColors(corner.position[0], corner.position[2]);
      const isCorrect = corner.colors.every((color: string) => expectedColors.includes(color));
      if (!isCorrect) adjacentSwaps++;
    }
    return adjacentSwaps === 2;
  }

  private isTPerm(cornerColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // T-perm has a specific pattern - simplified check
    return true; // Default to T-perm for adjacent swaps
  }

  // Helper methods for edge permutation analysis
  private hasThreeCycleEdges(edgeColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    let misplaced = 0;
    for (const edge of edgeColors) {
      const expectedColors = this.getExpectedEdgeColors(edge.position[0], edge.position[2]);
      const isCorrect = edge.colors.every((color: string) => expectedColors.includes(color));
      if (!isCorrect) misplaced++;
    }
    return misplaced === 3;
  }

  private isClockwiseEdgeCycle(edgeColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Simplified check for cycle direction
    return Math.random() > 0.5;
  }

  private hasOppositeSwapEdges(edgeColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Check if opposite edges are swapped
    const front = edgeColors.find(e => e.position[0] === 0 && e.position[2] === 1);
    const back = edgeColors.find(e => e.position[0] === 0 && e.position[2] === -1);
    const right = edgeColors.find(e => e.position[0] === 1 && e.position[2] === 0);
    const left = edgeColors.find(e => e.position[0] === -1 && e.position[2] === 0);
    
    if (!front || !back || !right || !left) return false;
    
    const frontExpected = this.getExpectedEdgeColors(0, 1);
    const backExpected = this.getExpectedEdgeColors(0, -1);
    const rightExpected = this.getExpectedEdgeColors(1, 0);
    const leftExpected = this.getExpectedEdgeColors(-1, 0);
    
    const frontBackSwapped = front.colors.every((color: string) => backExpected.includes(color)) &&
                            back.colors.every((color: string) => frontExpected.includes(color));
    const rightLeftSwapped = right.colors.every((color: string) => leftExpected.includes(color)) &&
                            left.colors.every((color: string) => rightExpected.includes(color));
    
    return frontBackSwapped || rightLeftSwapped;
  }

  private hasAdjacentDoubleSwapEdges(edgeColors: { position: [number, number, number]; colors: string[] }[]): boolean {
    // Check for Z-perm pattern (two adjacent pairs swapped)
    let wrongEdges = 0;
    for (const edge of edgeColors) {
      const expectedColors = this.getExpectedEdgeColors(edge.position[0], edge.position[2]);
      const isCorrect = edge.colors.every((color: string) => expectedColors.includes(color));
      if (!isCorrect) wrongEdges++;
    }
    return wrongEdges === 4; // All edges wrong but in a specific pattern
  }

  // Check if white edge is in correct cross position
  private isWhiteEdgeInCorrectCrossPosition(piece: CubePiece): boolean {
    const [x, y, z] = piece.position;
    
    // Must be on bottom face
    if (y !== -1) return false;
    
    // Must be an edge piece in cross position
    if (!((x === 0 && Math.abs(z) === 1) || (Math.abs(x) === 1 && z === 0))) return false;
    
    // White must be on bottom face
    if (piece.faceColors[1] !== this.COLORS.white) return false;
    
    // Adjacent face must match the center
    if (z === 1 && piece.faceColors[4] !== this.COLORS.red) return false;
    if (x === 1 && piece.faceColors[3] !== this.COLORS.blue) return false;
    if (z === -1 && piece.faceColors[5] !== this.COLORS.orange) return false;
    if (x === -1 && piece.faceColors[2] !== this.COLORS.green) return false;
    
    return true;
  }

  // Check if piece is in correct position for final solve state
  private isPieceInCorrectPosition(piece: CubePiece): boolean {
    const [x, y, z] = piece.position;
    
    // Check each face against expected colors
    const expectedColors = this.getExpectedPieceColors(x, y, z);
    
    // All visible faces must match expected colors
    for (let i = 0; i < 6; i++) {
      if (piece.faceColors[i] !== '#000000' && piece.faceColors[i] !== expectedColors[i]) {
        return false;
      }
    }
    
    return true;
  }

  // Get expected colors for a piece at given position
  private getExpectedPieceColors(x: number, y: number, z: number): string[] {
    const colors = ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000'];
    
    // Set colors based on position
    if (y === 1) colors[0] = this.COLORS.yellow;    // Top
    if (y === -1) colors[1] = this.COLORS.white;    // Bottom
    if (x === -1) colors[2] = this.COLORS.green;    // Left
    if (x === 1) colors[3] = this.COLORS.blue;      // Right
    if (z === 1) colors[4] = this.COLORS.red;       // Front
    if (z === -1) colors[5] = this.COLORS.orange;   // Back
    
    return colors;
  }
}

const RubiksCubeScene = () => {
  const [cubeState, setCubeState] = useState<CubeState | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [currentStage, setCurrentStage] = useState<SolvingStage | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState("");
  const [scrambleMoves, setScrambleMoves] = useState<BasicMove[]>([]);
  const [solveStats, setSolveStats] = useState<{ totalMoves: number; stageMoves: { [key in SolvingStage]: number } } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [animationSpeed, setAnimationSpeed] = useState(300); // ms per move
  const [useFullOLL, setUseFullOLL] = useState(false);
  const [useFullPLL, setUseFullPLL] = useState(false);

  const solverRef = useRef<CubeSolver | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const animationRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef(0);

  // Cube positions for a 3x3x3 cube
  const cubePositions: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubePositions.push([x, y, z]);
      }
    }
  }

  const createSolvedState = (): CubeState => {
    const pieces: CubePiece[] = [];
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // CRITICAL FIX: Only assign colors to visible faces, use internal gray for hidden faces
          // [top, bottom, left, right, front, back]
          
          const faceColors: string[] = [
            // Top face (index 0): yellow only if on top face, otherwise internal gray
            y === 1 ? COLORS.yellow : '#808080',
            
            // Bottom face (index 1): white only if on bottom face, otherwise internal gray
            y === -1 ? COLORS.white : '#808080',
            
            // Left face (index 2): green only if on left face, otherwise internal gray
            x === -1 ? COLORS.green : '#808080',
            
            // Right face (index 3): blue only if on right face, otherwise internal gray
            x === 1 ? COLORS.blue : '#808080',
            
            // Front face (index 4): red only if on front face, otherwise internal gray
            z === 1 ? COLORS.red : '#808080',
            
            // Back face (index 5): orange only if on back face, otherwise internal gray
            z === -1 ? COLORS.orange : '#808080'
          ];
          
          pieces.push({
            position: [x, y, z],
            faceColors
          });
        }
      }
    }
    
    return { pieces };
  };

  const createScrambledState = (): { state: CubeState; moves: BasicMove[] } => {
    let state = createSolvedState();
    const moves: BasicMove[] = [];
    const possibleMoves: BasicMove[] = ['R', 'R\'', 'R2', 'L', 'L\'', 'L2', 'U', 'U\'', 'U2', 'D', 'D\'', 'D2', 'F', 'F\'', 'F2', 'B', 'B\'', 'B2'];
    
    // Generate a substantial scramble sequence
    let lastMove: BasicMove | '' = '';
    let secondLastMove: BasicMove | '' = '';
    
    // Apply 30-35 moves for a thorough scramble
    const numMoves = 30 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < numMoves; i++) {
      let randomMove: BasicMove;
      let attempts = 0;
      
      do {
        randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        attempts++;
      } while (
        // Avoid redundant moves (e.g., R followed by R')
        (lastMove && randomMove === getInverseMove(lastMove as BasicMove)) ||
        // Avoid same face moves in sequence (e.g., R, R, R)
        (lastMove && randomMove === lastMove) ||
        // Avoid opposite face moves in sequence (e.g., R followed by L)
        (lastMove && areOppositeFaces(lastMove as BasicMove, randomMove)) ||
        // Avoid three consecutive moves on the same axis
        (secondLastMove && lastMove && areSameAxis(secondLastMove as BasicMove, lastMove as BasicMove, randomMove)) ||
        attempts > 50 // Prevent infinite loops
      );
      
      moves.push(randomMove);
      secondLastMove = lastMove;
      lastMove = randomMove;
    }
    
    // Apply scramble moves to the state using a dedicated scrambling solver
    const scramblingSolver = new CubeSolver(state, COLORS);
    
    // Apply each move individually to ensure proper state transformation
    for (const move of moves) {
      scramblingSolver.addMoves([move]);
      const executedMove = scramblingSolver.executeNextMove();
      if (!executedMove) {
        console.error(`Failed to execute scramble move: ${move}`);
        break;
      }
    }
    
    // Get the final scrambled state
    const finalState = scramblingSolver.getState();
    
    // Verification: ensure the state is actually scrambled
    const isScrambedProperly = !isStateActuallySolved(finalState);
    
    if (!isScrambedProperly) {
      console.warn("Scramble verification failed - state appears solved. Applying additional scrambling.");
      // Apply a few more guaranteed scrambling moves
      const additionalMoves: BasicMove[] = ['R', 'U', 'R\'', 'F', 'R', 'F\'', 'U\''];
      for (const move of additionalMoves) {
        scramblingSolver.addMoves([move]);
        scramblingSolver.executeNextMove();
      }
      moves.push(...additionalMoves);
    }
    
    return { state: scramblingSolver.getState(), moves };
  };

  // Robust state verification function
  const isStateActuallySolved = (state: CubeState): boolean => {
    // Check if all pieces are in their correct positions with correct orientations
    // Now uses the same logic as createSolvedState - no more black placeholders
    
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const piece = state.pieces.find(p => 
            p.position[0] === x && p.position[1] === y && p.position[2] === z
          );
          
          if (!piece) return false;
          
          // Expected colors based on position (same logic as createSolvedState)
          const expectedColors = [
            // Top face: yellow only if on top face, otherwise internal gray
            y === 1 ? COLORS.yellow : '#808080',
            // Bottom face: white only if on bottom face, otherwise internal gray
            y === -1 ? COLORS.white : '#808080',
            // Left face: green only if on left face, otherwise internal gray
            x === -1 ? COLORS.green : '#808080',
            // Right face: blue only if on right face, otherwise internal gray
            x === 1 ? COLORS.blue : '#808080',
            // Front face: red only if on front face, otherwise internal gray
            z === 1 ? COLORS.red : '#808080',
            // Back face: orange only if on back face, otherwise internal gray
            z === -1 ? COLORS.orange : '#808080'
          ];
          
          // Check that all face colors match the expected colors
          for (let i = 0; i < 6; i++) {
            if (piece.faceColors[i] !== expectedColors[i]) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  };

  // Helper function to get inverse of a move
  const getInverseMove = (move: BasicMove): BasicMove => {
    const inverseMap: Record<BasicMove, BasicMove> = {
      'R': 'R\'', 'R\'': 'R', 'R2': 'R2',
      'L': 'L\'', 'L\'': 'L', 'L2': 'L2',
      'U': 'U\'', 'U\'': 'U', 'U2': 'U2',
      'D': 'D\'', 'D\'': 'D', 'D2': 'D2',
      'F': 'F\'', 'F\'': 'F', 'F2': 'F2',
      'B': 'B\'', 'B\'': 'B', 'B2': 'B2'
    };
    return inverseMap[move];
  };

  // Helper function to check if two faces are opposite
  const areOppositeFaces = (move1: BasicMove, move2: BasicMove): boolean => {
    const face1 = move1.charAt(0);
    const face2 = move2.charAt(0);
    return (face1 === 'R' && face2 === 'L') || (face1 === 'L' && face2 === 'R') ||
           (face1 === 'U' && face2 === 'D') || (face1 === 'D' && face2 === 'U') ||
           (face1 === 'F' && face2 === 'B') || (face1 === 'B' && face2 === 'F');
  };

  // Helper function to check if three moves are on the same axis
  const areSameAxis = (move1: BasicMove, move2: BasicMove, move3: BasicMove): boolean => {
    const face1 = move1.charAt(0);
    const face2 = move2.charAt(0);
    const face3 = move3.charAt(0);
    
    // Check if all three are on the same axis (R/L, U/D, or F/B)
    return (face1 === face2 && face2 === face3) ||
           ((face1 === 'R' || face1 === 'L') && (face2 === 'R' || face2 === 'L') && (face3 === 'R' || face3 === 'L')) ||
           ((face1 === 'U' || face1 === 'D') && (face2 === 'U' || face2 === 'D') && (face3 === 'U' || face3 === 'D')) ||
           ((face1 === 'F' || face1 === 'B') && (face2 === 'F' || face2 === 'B') && (face3 === 'F' || face3 === 'B'));
  };

  // Animation function
  const animateMoves = useCallback((currentTime: number) => {
    if (!isSolving || !solverRef.current) {
      animationRef.current = null;
      return;
    }

    if (currentTime - lastMoveTimeRef.current >= animationSpeed) { // user-selected ms per move
      const move = solverRef.current.executeNextMove();
      if (move) {
        setCubeState(solverRef.current.getState());
        setCurrentAlgorithm(`Executing: ${move}`);
        
        // Update stage based on current move index
        const stages = solverRef.current.stages;
        const totalMoves = solverRef.current.getQueueLength() + 1; // +1 because we just executed a move
        const executedMoves = solverRef.current.totalMoves;
        const currentMoveIndex = executedMoves;
        
        if (stages) {
          const currentStage = stages.find(stage => 
            currentMoveIndex >= stage.startIndex && currentMoveIndex <= stage.endIndex
          );
          if (currentStage) {
            setCurrentStage(currentStage.stage);
          }
        }
        
        // Update executed moves count
        solverRef.current.totalMoves = solverRef.current.totalMoves + 1;
        
        lastMoveTimeRef.current = currentTime;
      } else {
        // No more moves
        setIsSolving(false);
        setCurrentStage(SolvingStage.SOLVED);
        setCurrentAlgorithm("Cube solved!");
        animationRef.current = null;
        return;
      }
    }

    animationRef.current = requestAnimationFrame(animateMoves);
  }, [isSolving, animationSpeed]);

  // Start solving with CFOP method
  const startSolving = async () => {
    setIsSolving(true);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    
    // Create scrambled state and store scramble moves
    const { state: scrambledState, moves: newScrambleMoves } = createScrambledState();
    console.log("Scramble moves:", newScrambleMoves);
    setCubeState(scrambledState);
    setScrambleMoves(newScrambleMoves);
    
    // Initialize solver with scrambled state and COLORS
    solverRef.current = new CubeSolver(scrambledState, COLORS);
    
    // Check if cube is already solved before generating solution
    console.log("Is cube solved after scrambling?", solverRef.current.isSolved());
    
    if (solverRef.current.isSolved()) {
      console.error("ERROR: Cube is detected as solved immediately after scrambling!");
      console.log("Scrambled state pieces:", JSON.stringify(scrambledState.pieces.map(p => ({ pos: p.position, colors: p.faceColors })), null, 2));
      setCurrentAlgorithm("ERROR: Cube appears solved after scrambling");
      setIsSolving(false);
      return;
    }
    
    // Generate CFOP solution
    setCurrentStage(SolvingStage.CROSS);
    setCurrentAlgorithm("Generating CFOP solution...");
    
    const { moves: cfopSolution, stages } = solverRef.current.generateCFOPSolution(useFullOLL, useFullPLL);
    console.log("CFOP solution:", cfopSolution);
    console.log("CFOP stages:", stages);
    console.log("Generated CFOP solution:", cfopSolution.length, "moves");
    solverRef.current.addMoves(cfopSolution);
    
    // Store stages for tracking
    solverRef.current.stages = stages;
    
    // Calculate solve statistics
    const stageMoves: { [key in SolvingStage]: number } = {
      [SolvingStage.CROSS]: 0,
      [SolvingStage.F2L]: 0,
      [SolvingStage.OLL]: 0,
      [SolvingStage.PLL]: 0,
      [SolvingStage.SOLVED]: 0
    };
    
    stages.forEach(stage => {
      const moveCount = stage.endIndex - stage.startIndex + 1;
      stageMoves[stage.stage] = moveCount;
    });
    
    setSolveStats({
      totalMoves: cfopSolution.length,
      stageMoves
    });
    
    // Animation will be started by useEffect when isSolving becomes true
  };

  // Use useEffect to manage animation loop based on isSolving state
  useEffect(() => {
    if (isSolving) {
      lastMoveTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animateMoves);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isSolving, animateMoves]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

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

  const resetCube = () => {
    setIsSolving(false);
    setCubeState(null);
    setCurrentStage(null);
    setCurrentAlgorithm("");
    setScrambleMoves([]);
    setSolveStats(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
    }
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
            
            // Use custom state if available, otherwise use default solved state
            let faceColors: string[] = [COLORS.white, COLORS.white, COLORS.white, COLORS.white, COLORS.white, COLORS.white];
            let cubePosition = position;
            
            if (cubeState) {
              // Find the piece at this position in the current state
              const piece = cubeState.pieces.find(p => 
                p.position[0] === position[0] && 
                p.position[1] === position[1] && 
                p.position[2] === position[2]
              );
              if (piece) {
                faceColors = piece.faceColors;
                cubePosition = piece.position;
              }
            } else {
              // Default solved state - each cube has 6 faces [top, bottom, left, right, front, back]
              const [x, y, z] = position;
              if (z === 1) {
                // Front face is red
                faceColors[4] = COLORS.red;
              } else if (z === -1) {
                // Back face is orange
                faceColors[5] = COLORS.orange;
              }
              
              if (x === 1) {
                // Right face is blue
                faceColors[3] = COLORS.blue;
              } else if (x === -1) {
                // Left face is green
                faceColors[2] = COLORS.green;
              }
              
              if (y === 1) {
                // Top face is yellow
                faceColors[0] = COLORS.yellow;
              } else if (y === -1) {
                // Bottom face is white
                faceColors[1] = COLORS.white;
              }
            }
            
            // Check if this cube should be highlighted for look-ahead
            const isHighlighted = solverRef.current && currentStage ? 
              solverRef.current.getLookAheadPieces(currentStage).some(piece => 
                piece.position[0] === cubePosition[0] && 
                piece.position[1] === cubePosition[1] && 
                piece.position[2] === cubePosition[2]
              ) : false;
            
            return (
              <Cube 
                key={index} 
                position={cubePosition} 
                faceColors={faceColors} 
                id={index} 
                isHighlighted={isHighlighted}
              />
            );
          })}
        </RotatingCubeGroup>
      </Canvas>
      
      {/* CFOP Stage Display */}
      {currentStage && (
        <div className="absolute top-2 sm:top-6 left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-lg px-2">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl p-3 sm:p-4 shadow-xl">
            <div className="text-sm sm:text-lg font-semibold text-foreground text-center mb-2">{currentStage}</div>
            {currentAlgorithm && (
              <div className="text-xs sm:text-sm text-muted-foreground text-center mb-2 font-mono break-all">
                {currentAlgorithm}
              </div>
            )}
            {solverRef.current && (
              <div className="text-xs text-muted-foreground text-center">
                Moves remaining: {solverRef.current.getQueueLength()}
              </div>
            )}
            {solveStats && (
              <div className="text-xs text-blue-500 dark:text-blue-400 text-center mt-1">
                Total: {solveStats.totalMoves} moves
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Solve Statistics */}
      {solveStats && !isSolving && (
        <div className="absolute top-2 sm:top-6 right-2 sm:right-6 w-40 sm:w-auto">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl p-3 sm:p-4 shadow-xl">
            <div className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 text-center">Solve Statistics</div>
            <div className="text-xs space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">Cross:</span>
                <span className="text-foreground font-mono">{solveStats.stageMoves[SolvingStage.CROSS]} moves</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">F2L:</span>
                <span className="text-foreground font-mono">{solveStats.stageMoves[SolvingStage.F2L]} moves</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">OLL:</span>
                <span className="text-foreground font-mono">{solveStats.stageMoves[SolvingStage.OLL]} moves</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground">PLL:</span>
                <span className="text-foreground font-mono">{solveStats.stageMoves[SolvingStage.PLL]} moves</span>
              </div>
              <div className="border-t border-border pt-1 sm:pt-2 mt-1 sm:mt-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-blue-500 dark:text-blue-400 font-semibold">Total:</span>
                  <span className="text-blue-500 dark:text-blue-400 font-semibold font-mono">{solveStats.totalMoves} moves</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-2">
        <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl p-3 sm:p-4 shadow-2xl">
          {/* Main Action Buttons */}
          <div className="flex gap-2 mb-3 sm:mb-4">
            <button
              onClick={startSolving}
              disabled={isSolving}
              className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm"
            >
              {isSolving ? "Solving..." : "CFOP Solve"}
            </button>
            <button
              onClick={resetCube}
              className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 shadow-lg text-xs sm:text-sm"
            >
              Reset
            </button>
          </div>

          {/* Settings - Responsive Layout */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            {/* Animation Speed Control */}
            <div className="flex items-center gap-2">
              <label htmlFor="speed-slider" className="text-xs font-medium text-foreground whitespace-nowrap">
                Speed
              </label>
              <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                <input
                  id="speed-slider"
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={animationSpeed}
                  onChange={e => setAnimationSpeed(Number(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  disabled={isSolving}
                />
                <span className="text-xs text-muted-foreground font-mono w-8 text-center">
                  {Math.round(animationSpeed/10)/10}s
                </span>
              </div>
            </div>

            {/* Algorithm Options */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Full OLL Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground whitespace-nowrap">
                  Full OLL
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFullOLL}
                    onChange={e => setUseFullOLL(e.target.checked)}
                    disabled={isSolving}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-background after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* Full PLL Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground whitespace-nowrap">
                  Full PLL
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFullPLL}
                    onChange={e => setUseFullPLL(e.target.checked)}
                    disabled={isSolving}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-background after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .slider:disabled::-webkit-slider-thumb {
          background: hsl(var(--muted-foreground));
          cursor: not-allowed;
        }
        .slider:disabled::-moz-range-thumb {
          background: hsl(var(--muted-foreground));
          cursor: not-allowed;
        }
      `}</style>
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
              Rubik&apos;s Cube Solver.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Interactive 3D visualization of the CFOP method in Rubik&apos;s cube solving, featuring Cross, F2L, OLL, and PLL stages.
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

export default RubiksCube; 