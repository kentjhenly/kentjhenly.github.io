"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Quote } from "lucide-react";
import Link from "next/link";

interface EthicsQuoteProps {
  delay?: number;
}

export const EthicsQuote = ({ delay = 0 }: EthicsQuoteProps) => {
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
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: delay + 0.3 },
    },
  };

  const highlightVariants = {
    hidden: { width: 0 },
    visible: {
      width: "100%",
      transition: { duration: 1.2, delay: delay + 0.6, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl" />
      
      {/* Main content */}
      <div className="relative p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Quote icon with animation */}
          <motion.div
            variants={quoteVariants}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <Quote className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <motion.div
                className="absolute -inset-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Main quote text */}
          <motion.blockquote
            variants={itemVariants}
            className="text-center space-y-4"
          >
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
              <span className="relative">
                &ldquo;On 13 June 2025, Hailey Cheng Hei Lam, a student at City University of Hong Kong and participant in the Google Summer of Code, posted concerns on Threads. She questioned whether such a complex AI system could have been built solely by a secondary school student...
                <motion.span
                  variants={highlightVariants}
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500"
                />
              </span>
            </p>
            
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              Her comments triggered a wider discussion online about originality in student research, the role of external help, and how sensitive data is handled in youth-led tech projects.&rdquo;
            </motion.p>
          </motion.blockquote>

          {/* Attribution */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-muted-foreground/50" />
              <Link
                href="https://en.wikipedia.org/wiki/MediSafe_controversy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium group"
              >
                Featured in{" "}
                <span className="underline decoration-dotted underline-offset-4 group-hover:decoration-solid">
                  Wikipedia: MediSafe controversy
                </span>
              </Link>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-muted-foreground/50" />
            </div>
          </motion.div>

          {/* Ethics badge */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex justify-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-black/20 border border-muted rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                AI Ethics & Research Integrity
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}; 