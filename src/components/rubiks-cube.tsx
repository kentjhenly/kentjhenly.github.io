"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import BlurFade from "./magicui/blur-fade";

// Dynamically import Three.js components to avoid SSR issues
const RubiksCubeScene = dynamic(() => import("./rubiks-cube-scene"), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center">Loading 3D Cube...</div>
});

interface RubiksCubeProps {
  delay?: number;
}

export const RubiksCube = ({ delay }: RubiksCubeProps) => {
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
            <RubiksCubeScene />
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 