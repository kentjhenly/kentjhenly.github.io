"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

interface HeartEquationProps {
  delay?: number;
}

export const HeartEquation = ({ delay = 0 }: HeartEquationProps) => {
  const ref = useRef(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView || !canvasRef.current) return;

    let p5Instance: any = null;

    const loadP5 = async () => {
      const p5 = (await import('p5')).default;
      
      const sketch = (p: any) => {
        let t = 0;
        let points: { x: number; y: number }[] = [];
        let isDrawing = false;
        let drawIndex = 0;

        p.setup = () => {
          const canvas = p.createCanvas(400, 300);
          canvas.parent(canvasRef.current);
          p.stroke(255, 100, 150);
          p.strokeWeight(2);
          p.noFill();
          
          // Calculate all heart points
          for (let angle = 0; angle <= 2 * Math.PI; angle += 0.05) {
            const x = 16 * Math.pow(Math.sin(angle), 3);
            const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
            points.push({ x, y });
          }
        };

        p.draw = () => {
          p.background(20, 20, 30);
          p.translate(p.width / 2, p.height / 2 + 20);
          p.scale(8, -8); // Scale and flip Y axis

          // Draw completed heart trail with fade effect
          if (points.length > 0) {
            p.beginShape();
            p.noFill();
            for (let i = 0; i < Math.min(drawIndex, points.length); i++) {
              const alpha = Math.max(0, 255 - (drawIndex - i) * 2);
              p.stroke(255, 100, 150, alpha);
              if (i === 0) {
                p.vertex(points[i].x, points[i].y);
              } else {
                p.vertex(points[i].x, points[i].y);
              }
            }
            p.endShape();

            // Draw current point with glow
            if (drawIndex < points.length) {
              const currentPoint = points[drawIndex];
              
              // Glow effect
              for (let r = 20; r > 0; r--) {
                p.stroke(255, 100, 150, 10);
                p.strokeWeight(r * 0.1);
                p.point(currentPoint.x, currentPoint.y);
              }
              
              // Main point
              p.stroke(255, 200, 220);
              p.strokeWeight(0.5);
              p.point(currentPoint.x, currentPoint.y);
              
              drawIndex += 2;
            } else {
              // Reset animation after completion
              setTimeout(() => {
                drawIndex = 0;
              }, 2000);
            }
          }
        };
      };

      p5Instance = new p5(sketch);
    };

    loadP5();

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [isInView]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
      },
    },
  };

  const equationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay + 0.3,
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-content-md"
    >
      <h2 className="text-xl font-bold">Mathematical Heart</h2>
      
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Heart Animation */}
        <motion.div
          variants={equationVariants}
          className="flex justify-center"
        >
          <div className="relative">
            <div 
              ref={canvasRef}
              className="rounded-xl border border-border/50 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg overflow-hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-pink-500/5 pointer-events-none rounded-xl" />
          </div>
        </motion.div>

        {/* Equations */}
        <motion.div
          variants={equationVariants}
          className="space-y-6"
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              A heart shape drawn using parametric equations, where mathematics meets art.
            </p>
          </div>
          
          <div className="bg-muted/20 border border-border/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-sm text-foreground">Parametric Equations:</h3>
            
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="text-pink-500 font-medium">x =</span>
                <span className="text-foreground">16sin³(t)</span>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-pink-500 font-medium">y =</span>
                <div className="text-foreground">
                  <div>13cos(t) - 5cos(2t)</div>
                  <div className="ml-4">- 2cos(3t) - cos(4t)</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>where</span>
                <span className="text-pink-500">t ∈ [0, 2π]</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/10 p-3 rounded border border-border/30">
            <p>
              This heart curve is created by combining trigonometric functions with different frequencies,
              creating the characteristic heart shape through mathematical harmony.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}; 