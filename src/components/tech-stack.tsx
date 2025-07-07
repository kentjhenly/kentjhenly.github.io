"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

interface TechStackProps {
  delay?: number;
}

interface TechItem {
  name: string;
  logo?: string;
  textOnly?: boolean;
  color?: string;
}

const techStack: TechItem[] = [
  { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "MATLAB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matlab/matlab-original.svg" },
  { name: "R", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg" },
  { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "Tailwind CSS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" },
  { name: "shadcn/ui", textOnly: true, color: "text-foreground" },
  { name: "Three.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg" },
  { name: "Framer Motion", textOnly: true, color: "text-pink-600 dark:text-pink-400" },
  { name: "TensorFlow", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg" },
  { name: "PyTorch", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg" },
  { name: "Scikit-learn", textOnly: true, color: "text-orange-600 dark:text-orange-400" },
  { name: "Transformers", textOnly: true, color: "text-yellow-600 dark:text-yellow-400" },
  { name: "Pandas", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg" },
  { name: "NumPy", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg" },
  { name: "Flask", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg" },
  { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "GitHub", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
  { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "LaTeX", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/latex/latex-original.svg" },
];

const TechItem = ({ tech }: { tech: TechItem }) => {
  if (tech.textOnly) {
    return (
      <div className="flex items-center justify-center min-w-[120px] h-16 px-4 mx-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-muted rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
        <span className={`text-sm font-semibold whitespace-nowrap ${tech.color || 'text-foreground'}`}>
          {tech.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-w-[120px] h-16 px-4 mx-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-muted rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
      <div className="relative w-8 h-8 mb-1">
        <Image
          src={tech.logo!}
          alt={`${tech.name} logo`}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center whitespace-nowrap">
        {tech.name}
      </span>
    </div>
  );
};

export const TechStack = ({ delay = 0 }: TechStackProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  // Duplicate the tech stack for seamless infinite scroll
  const duplicatedTechStack = [...techStack, ...techStack];

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-content-md"
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Tech Stack
          </h2>
          <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Technologies and tools I work with to build innovative solutions.
          </p>
        </div>
      </div>

      {/* Scrolling marquee container */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient overlays for smooth edge fade */}
        <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />
        
        {/* Scrolling content */}
        <motion.div
          className="flex"
          animate={{
            x: [0, -50 + "%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedTechStack.map((tech, index) => (
            <TechItem key={`${tech.name}-${index}`} tech={tech} />
          ))}
        </motion.div>
      </div>

      {/* Optional: Pause on hover */}
      <style jsx>{`
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </motion.div>
  );
}; 