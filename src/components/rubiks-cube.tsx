"use client";

import { useState, useEffect } from "react";
import BlurFade from "./magicui/blur-fade";

interface RubiksCubeProps {
  delay?: number;
}

export const RubiksCube = ({ delay }: RubiksCubeProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (hasError) {
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
              <div className="h-96 flex items-center justify-center text-center">
                <div>
                  <p className="text-red-500 mb-4">Failed to load 3D cube</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BlurFade>
    );
  }

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
            {isClient ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <p className="mb-4">3D Cube Loading...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p>Loading 3D Cube...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 