"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface TimelineItem {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  bullets?: readonly string[];
}

interface EnhancedTimelineProps {
  items: TimelineItem[];
  delay?: number;
}

export const EnhancedTimeline = ({ items, delay = 0 }: EnhancedTimelineProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: delay,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
      className="relative"
    >
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      
      {/* Timeline items */}
      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="relative flex items-start"
          >
            {/* Timeline dot with integrated logo */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                <Image
                  src={item.logoUrl}
                  alt={item.altText}
                  width={24}
                  height={24}
                  className="rounded-sm object-cover"
                />
              </div>
            </div>

            {/* Content section */}
            <div className="ml-6 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                {/* Left content */}
                <div className="flex-1 min-w-0">
                  {/* Title and subtitle */}
                  <div className="space-y-1">
                    {item.href ? (
                      <Link
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors whitespace-pre-line">
                          {item.title}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="font-semibold text-lg leading-tight whitespace-pre-line">
                        {item.title}
                      </h3>
                    )}
                    <p className="text-muted-foreground font-medium">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Badges */}
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.badges.map((badge, badgeIndex) => (
                        <Badge
                          key={badgeIndex}
                          variant="secondary"
                          className="text-xs px-2 py-0.5"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Bullets */}
                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {item.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/60 mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Right content - Date badge */}
                <div className="flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className="text-xs text-muted-foreground border-muted-foreground/30 bg-muted/30 font-normal px-3 py-1"
                  >
                    {item.period}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 