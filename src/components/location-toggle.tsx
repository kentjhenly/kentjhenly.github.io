"use client";

import { motion } from "framer-motion";
import { Building2, Car } from "lucide-react";

interface LocationToggleProps {
  currentTab: "hong-kong" | "jakarta";
  onTabChange: (tab: "hong-kong" | "jakarta") => void;
  delay?: number;
}

const tabs = [
  { id: "hong-kong" as const, label: "Hong Kong", icon: Building2 },
  { id: "jakarta" as const, label: "Jakarta", icon: Car },
];

export const LocationToggle = ({ currentTab, onTabChange, delay = 0 }: LocationToggleProps) => {
  const currentIndex = tabs.findIndex(tab => tab.id === currentTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex justify-center mb-8"
    >
      <div className="relative bg-muted/50 p-1 rounded-full flex">
        {/* Animated background */}
        <motion.div
          className="absolute top-1 bottom-1 bg-background rounded-full shadow-sm border"
          initial={false}
          animate={{
            left: `${currentIndex * (100 / tabs.length) + (currentIndex === 0 ? 2 : 0)}%`,
            width: `${100 / tabs.length}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        />
        
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative z-10 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
