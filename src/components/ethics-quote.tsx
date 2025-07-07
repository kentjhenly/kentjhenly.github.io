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
        ease: [0.25, 0.1, 0.25, 1],
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
      {/* Clean blockquote with soft accent */}
      <blockquote className="relative pl-6 py-6 border-l-4 border-primary/60 bg-gradient-to-r from-muted/30 to-transparent rounded-r-lg">
        <p className="text-base md:text-lg leading-relaxed text-foreground/90 mb-4">
          In June 2025, I raised public concerns about the authorship and data ethics of a youth-led AI healthcare project. This sparked a discussion in Hong Kong on research integrity and was later{" "}
          <Link
            href="https://en.wikipedia.org/wiki/MediSafe_controversy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:text-primary/80 underline decoration-primary/40 underline-offset-2 hover:decoration-primary/60 transition-all duration-200"
          >
            featured on Wikipedia
          </Link>
          .
        </p>
      </blockquote>
    </motion.div>
  );
}; 