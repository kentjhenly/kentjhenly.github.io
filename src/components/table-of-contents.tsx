"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Fish } from "lucide-react";

interface SeaCreature {
  id: number;
  type: "fish" | "shrimp";
  x: number;
  y: number;
  direction: number;
  speed: number;
  size: number;
  color: string;
  opacity: number;
}

// Define the sections of your page
const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "rubiks-cube", label: "Rubik's Cube" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "books", label: "Books" },
  { id: "hong-kong", label: "Hong Kong" },
  { id: "world", label: "World" },
  { id: "contact", label: "Contact" },
];

export function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAquariumActive, setIsAquariumActive] = useState(false);
  const [creatures, setCreatures] = useState<SeaCreature[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up the Intersection Observer to watch for sections entering the viewport
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" } // Trigger when section is in the middle of the screen
    );

    // Observe each section
    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) {
        observer.current?.observe(el);
      }
    });

    // Clean up the observer on component unmount
    return () => {
      SECTIONS.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) {
          observer.current?.unobserve(el);
        }
      });
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  // Aquarium functionality
  useEffect(() => {
    if (!isAquariumActive) {
      setCreatures([]);
      return;
    }

    const fishColors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"
    ];
    const shrimpColors = [
      "#FF8C69", "#FFB6C1", "#F0E68C", "#98FB98"
    ];

    // Create initial creatures
    const initialCreatures: SeaCreature[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: Math.random() > 0.6 ? "shrimp" : "fish",
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      direction: Math.random() * 360,
      speed: 0.5 + Math.random() * 1.5,
      size: 12 + Math.random() * 20,
      color: Math.random() > 0.6 ? 
        fishColors[Math.floor(Math.random() * fishColors.length)] :
        shrimpColors[Math.floor(Math.random() * shrimpColors.length)],
      opacity: 0.6 + Math.random() * 0.4,
    }));

    setCreatures(initialCreatures);

    // Animation loop
    const animate = () => {
      if (!isAquariumActive) return;

      setCreatures(prev => prev.map(creature => {
        const radians = (creature.direction * Math.PI) / 180;
        let newX = creature.x + Math.cos(radians) * creature.speed;
        let newY = creature.y + Math.sin(radians) * creature.speed;
        let newDirection = creature.direction;

        // Bounce off walls
        if (newX <= 0 || newX >= window.innerWidth) {
          newDirection = 180 - newDirection;
          newX = Math.max(0, Math.min(window.innerWidth, newX));
        }
        if (newY <= 0 || newY >= window.innerHeight) {
          newDirection = -newDirection;
          newY = Math.max(0, Math.min(window.innerHeight, newY));
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          newDirection += (Math.random() - 0.5) * 60;
        }

        return {
          ...creature,
          x: newX,
          y: newY,
          direction: newDirection,
        };
      }));

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isAquariumActive]);

  const renderCreature = (creature: SeaCreature) => {
    const style = {
      position: "fixed" as const,
      left: `${creature.x}px`,
      top: `${creature.y}px`,
      transform: `translate(-50%, -50%) rotate(${creature.direction}deg)`,
      opacity: creature.opacity,
      zIndex: 1000,
      pointerEvents: "none" as const,
    };

    if (creature.type === "fish") {
      return (
        <div key={creature.id} style={style}>
          <svg
            width={creature.size}
            height={creature.size * 0.6}
            viewBox="0 0 40 24"
            fill={creature.color}
          >
            <ellipse cx="20" cy="12" rx="15" ry="8" />
            <path d="M5 12 L0 8 L0 16 Z" />
            <circle cx="25" cy="10" r="2" fill="white" />
            <circle cx="25" cy="10" r="1" fill="black" />
            <path d="M15 8 L12 5 L9 8 Z" fill={creature.color} opacity="0.8" />
          </svg>
        </div>
      );
    } else {
      return (
        <div key={creature.id} style={style}>
          <svg
            width={creature.size * 0.8}
            height={creature.size}
            viewBox="0 0 20 25"
            fill={creature.color}
          >
            <ellipse cx="10" cy="8" rx="6" ry="4" />
            <ellipse cx="10" cy="12" rx="6" ry="4" />
            <ellipse cx="10" cy="16" rx="6" ry="4" />
            <ellipse cx="10" cy="20" rx="6" ry="4" />
            <path d="M4 20 L0 22 L0 18 Z" />
            <line x1="10" y1="6" x2="8" y2="3" stroke={creature.color} strokeWidth="1" />
            <line x1="10" y1="6" x2="12" y2="3" stroke={creature.color} strokeWidth="1" />
            <circle cx="8" cy="6" r="1" fill="white" />
            <circle cx="12" cy="6" r="1" fill="white" />
          </svg>
        </div>
      );
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="hidden md:block fixed top-1/2 right-4 transform -translate-y-1/2 z-50"
      >
        <ul className="flex flex-col items-center space-y-2">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(section.id);
                }}
                className="group flex items-center gap-2"
              >
                <span className="text-right text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:text-gray-300 text-gray-700">
                  {section.label}
                </span>
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 transition-all duration-300",
                    activeSection === section.id
                      ? "bg-blue-400 scale-125"
                      : "group-hover:bg-blue-300"
                  )}
                />
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-4 right-16 z-50">
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-14 right-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border dark:border-gray-700"
            >
              <ul className="flex flex-col space-y-3">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollTo(section.id);
                      }}
                      className={cn(
                        "text-sm",
                        activeSection === section.id
                          ? "text-blue-400 font-bold"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight />
          </motion.div>
        </motion.button>
      </div>

      {/* Show Aquarium Button (light blue, circular, fish icon only) */}
      <div className="fixed top-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAquariumActive(!isAquariumActive)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors",
            isAquariumActive 
              ? "bg-blue-500 text-white" 
              : "bg-blue-400 text-white hover:bg-blue-500"
          )}
        >
          <Fish className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Floating Creatures */}
      {isAquariumActive && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {creatures.map(renderCreature)}
        </div>
      )}
    </>
  );
} 