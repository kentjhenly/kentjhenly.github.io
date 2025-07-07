"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

interface EthicsQuoteProps {
  delay?: number;
}

export const EthicsQuote = ({ delay = 0 }: EthicsQuoteProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const borderVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 0.6,
        delay: delay + 0.2,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        delay: delay + 0.4,
        ease: "easeOut",
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay + 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="max-w-4xl mx-auto"
    >
      {/* Elegant blockquote with glass effect */}
      <div className="relative">
        {/* Subtle background with glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/15 dark:to-pink-950/20 rounded-2xl backdrop-blur-sm border border-border/50" />
        
        {/* Animated gradient border */}
        <motion.div
          variants={borderVariants}
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full origin-top"
        />
        
        {/* Content */}
        <blockquote className="relative pl-8 pr-6 py-8 md:pl-12 md:pr-8 md:py-10">
          <motion.p
            variants={textVariants}
            className="text-lg md:text-xl lg:text-2xl leading-relaxed font-medium italic text-foreground/90 mb-6"
          >
            In June 2025, I raised public concerns about the authorship and data ethics of a youth-led AI healthcare project. This sparked a discussion in Hong Kong on research integrity and was later featured on Wikipedia.
          </motion.p>
          
          {/* Animated Wikipedia link */}
          <motion.div
            variants={linkVariants}
            className="flex justify-end"
          >
            <Link
              href="https://en.wikipedia.org/wiki/MediSafe_controversy"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <span className="relative">
                Read on Wikipedia
                {/* Animated underline */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-500 ease-out" />
                {/* Subtle arrow */}
                <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          </motion.div>
        </blockquote>
      </div>
    </motion.div>
  );
}; 