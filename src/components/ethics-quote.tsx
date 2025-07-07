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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="max-w-3xl mx-auto"
    >
      {/* Clean blockquote with left border */}
      <blockquote className="relative pl-6 border-l-2 border-muted-foreground/30">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
          In June 2025, I raised public concerns about the authorship and data ethics of a youth-led AI healthcare project. This sparked a discussion in Hong Kong on research integrity and was later featured on Wikipedia.
        </p>
        
        {/* Clean Wikipedia link */}
        <Link
          href="https://en.wikipedia.org/wiki/MediSafe_controversy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-foreground/80 hover:text-foreground transition-colors duration-200 underline decoration-dotted underline-offset-4 hover:decoration-solid"
        >
          Read on Wikipedia →
        </Link>
      </blockquote>
    </motion.div>
  );
}; 