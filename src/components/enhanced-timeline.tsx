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

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay + (index * 0.1),
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const content = (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative pl-6 pb-8 last:pb-0"
    >
      {/* Minimal timeline line */}
      {!isLast && (
        <div className="absolute left-0 top-8 bottom-0 w-px bg-border/40" />
      )}
      
      {/* Small timeline dot */}
      <div className="absolute left-[-3px] top-6 w-1.5 h-1.5 rounded-full bg-primary/60" />

      {/* Clean, flat card */}
      <div className="group cursor-pointer" onClick={handleClick}>
        <div className="border border-border/50 rounded-lg p-6 bg-card/50 hover:bg-card/80 hover:border-border transition-all duration-300">
          {/* Header with integrated logo */}
          <div className="flex items-start gap-4 mb-3">
            {/* Logo integrated inside card */}
            <Avatar className="size-8 border border-border/30 flex-shrink-0 mt-1">
              <AvatarImage
                src={logoUrl}
                alt={altText}
                className="object-contain"
              />
              <AvatarFallback className="text-xs bg-muted/50">{altText[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 text-base leading-tight">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed whitespace-pre-line">
                      {subtitle}
                    </p>
                  )}
                  {badges && badges.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {badges.map((badge, index) => (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-muted/60 border-0"
                          key={index}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-md whitespace-nowrap">
                    {period}
                  </span>
                  {(description || bullets) && (
                    <ChevronRightIcon
                      className={cn(
                        "size-4 text-muted-foreground transition-all duration-200 mt-0.5 opacity-60 group-hover:opacity-100",
                        isExpanded ? "rotate-90" : "rotate-0"
                      )}
                    />
                  )}
                </div>
              </div>
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
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-border/30 ml-12">
                {bullets ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="size-1 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
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