"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Fish } from "lucide-react";

// Define the sections of your page
const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "rubiks-cube", label: "Rubik's Cube" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "books", label: "Books" },
];

export function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
                      ? "bg-blue-500 scale-125"
                      : "group-hover:bg-blue-400"
                  )}
                />
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-4 right-4 z-50">
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
                          ? "text-blue-500 font-bold"
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

      {/* Show Aquarium Button (always visible, circular, fish icon only) */}
      <div className="fixed top-4 left-4 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // TODO: Add aquarium functionality
            console.log("Show aquarium clicked");
          }}
          className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Fish className="w-5 h-5" />
        </motion.button>
      </div>
    </>
  );
} 