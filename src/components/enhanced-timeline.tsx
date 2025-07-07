"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TimelineItemProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
  bullets?: readonly string[];
  isLast?: boolean;
  index: number;
  delay?: number;
}

interface TimelineProps {
  items: Array<{
    logoUrl: string;
    altText: string;
    title: string;
    subtitle?: string;
    href?: string;
    badges?: readonly string[];
    period: string;
    description?: string;
    bullets?: readonly string[];
  }>;
  delay?: number;
}

const TimelineItem = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  bullets,
  isLast = false,
  index,
  delay = 0,
}: TimelineItemProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (description || bullets) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  // Smooth slide-in animation from alternating sides
  const slideDirection = index % 2 === 0 ? -50 : 50;
  
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: slideDirection,
      y: 20 
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        delay: delay + (index * 0.15),
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const dotVariants = {
    hidden: { 
      scale: 0,
      opacity: 0 
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: delay + (index * 0.15) + 0.2,
        ease: "easeOut",
      },
    },
  };

  const content = (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative pl-16 pb-12 last:pb-0"
    >
      {/* Timeline line - soft gradient */}
      {!isLast && (
        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/10" />
      )}
      
      {/* Timeline dot with colored accent */}
      <motion.div
        variants={dotVariants}
        className="absolute left-4 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-background to-muted/50 border-2 border-primary/40 shadow-lg flex items-center justify-center backdrop-blur-sm"
      >
        {/* Inner accent dot */}
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-sm" />
      </motion.div>

      {/* Logo in soft background circle */}
      <div className="absolute left-[-4px] top-12 w-16 h-16 rounded-full bg-gradient-to-br from-background/80 to-muted/30 border border-border/50 shadow-md backdrop-blur-sm flex items-center justify-center">
        <Avatar className="size-12 border border-border/30">
          <AvatarImage
            src={logoUrl}
            alt={altText}
            className="object-contain"
          />
          <AvatarFallback className="text-xs bg-muted/50">{altText[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Content card with glass effect */}
      <div className="group cursor-pointer" onClick={handleClick}>
        <div className="relative bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-md border border-border/40 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-border/60 transition-all duration-500 hover:-translate-y-1">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Header */}
          <div className="relative flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight text-lg">
                {title}
                {badges && badges.length > 0 && (
                  <span className="inline-flex gap-1 ml-3 flex-wrap">
                    {badges.map((badge, index) => (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-muted/60 border border-border/30"
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
              </h3>
              {subtitle && (
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed whitespace-pre-line">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-muted-foreground bg-muted/40 border border-border/30 px-4 py-2 rounded-full whitespace-nowrap backdrop-blur-sm">
                {period}
              </span>
              {(description || bullets) && (
                <ChevronRightIcon
                  className={cn(
                    "size-4 text-muted-foreground transition-all duration-300 mt-1 opacity-60 group-hover:opacity-100",
                    isExpanded ? "rotate-90" : "rotate-0"
                  )}
                />
              )}
            </div>
          </div>

          {/* Expandable content */}
          {(description || bullets) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? "auto" : 0,
              }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/30">
                {bullets ? (
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="size-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href && href !== "#") {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    );
  }

  return content;
};

export const EnhancedTimeline = ({ items, delay = 0 }: TimelineProps) => {
  return (
    <div className="relative max-w-4xl mx-auto">
      {items.map((item, index) => (
        <TimelineItem
          key={`${item.title}-${index}`}
          {...item}
          index={index}
          delay={delay}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}; 