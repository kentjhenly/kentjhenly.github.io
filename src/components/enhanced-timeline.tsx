"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

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
      <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
      
      {/* Timeline items */}
      <div className="space-y-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="relative flex items-start"
          >
            {/* Timeline dot with larger integrated logo */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                <Image
                  src={item.logoUrl}
                  alt={item.altText}
                  width={40}
                  height={40}
                  className="rounded-sm object-cover"
                />
              </div>
            </div>

            {/* Content section */}
            <div className="ml-8 flex-1 min-w-0">
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

                  {/* Timeline-style date */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {item.period}
                    </span>
                  </div>

                  {/* Badges */}
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
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

                  {/* Show/Hide bullets button */}
                  {item.bullets && item.bullets.length > 0 && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="flex items-center gap-2 mt-3 text-sm text-primary hover:text-primary/80 transition-colors group"
                    >
                      <span>
                        {expandedItems.has(index) ? 'Hide details' : 'Show details'}
                      </span>
                      {expandedItems.has(index) ? (
                        <ChevronUp className="size-4 group-hover:translate-y-[-1px] transition-transform" />
                      ) : (
                        <ChevronDown className="size-4 group-hover:translate-y-[1px] transition-transform" />
                      )}
                    </button>
                  )}

                  {/* Collapsible bullets */}
                  {item.bullets && item.bullets.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: expandedItems.has(index) ? "auto" : 0,
                        opacity: expandedItems.has(index) ? 1 : 0,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {item.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/60 mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 