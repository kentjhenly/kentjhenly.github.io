"use client";

import { useState, useEffect } from "react";
import BlurFade from "./magicui/blur-fade";

interface HongKongMapProps {
  delay?: number;
}

export const HongKongMap = ({ delay = 0 }: HongKongMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const locations = {
    "Tai Mo Shan": {
      name: "Tai Mo Shan (大帽山)",
      description: "Camping on December 31st to wait for the sunrise",
      x: 20,
      y: 18,
      type: "nature"
    },
    "Tiu Chung Chau": {
      name: "Tiu Chung Chau (吊鐘洲)",
      description: "Kayaking spot (northeast, near Sai Kung; not Cheung Chau)",
      x: 97,
      y: 28,
      type: "nature"
    },
    "Tai Tong": {
      name: "Tai Tong Sweet Gum Woods (大棠紅葉楓香林)",
      description: "Hiking with beautiful autumn leaves",
      x: 18,
      y: 35,
      type: "nature"
    },
    "Thousand Island Lake": {
      name: "Thousand Island Lake (千島湖)",
      description: "Hiking destination (near Tai Lam Chung Reservoir)",
      x: 22,
      y: 48,
      type: "nature"
    },
    "Braemar Hill": {
      name: "Braemar Hill (寶馬山)",
      description: "Night hiking with city views (above Causeway Bay, near North Point)",
      x: 80,
      y: 86,
      type: "nature"
    },
    "West Kowloon": {
      name: "West Kowloon (西九龍)",
      description: "Picnicking by the harbor",
      x: 55,
      y: 70,
      type: "urban"
    },
    "Admiralty": {
      name: "Admiralty (金鐘)",
      description: "Start of city walk",
      x: 68,
      y: 90,
      type: "urban"
    },
    "Causeway Bay": {
      name: "Causeway Bay (銅鑼灣)",
      description: "End of city walk",
      x: 83,
      y: 92,
      type: "urban"
    },
    "SoHo": {
      name: "SoHo",
      description: "Bar Leone - Asia's Best Bar 2024",
      x: 62,
      y: 92,
      type: "urban"
    },
    "Sai Kung": {
      name: "Sai Kung (西貢)",
      description: "Squid fishing",
      x: 95,
      y: 38,
      type: "nature"
    }
  };

  const getLocationName = (locationKey: string) => locations[locationKey as keyof typeof locations]?.name || locationKey;
  const getLocationDescription = (locationKey: string) => locations[locationKey as keyof typeof locations]?.description || "";

  if (!isClient) {
    return (
      <BlurFade delay={delay}>
        <div className="flex justify-center">
          <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
            <div className="h-96 flex items-center justify-center">
              Loading Hong Kong Map...
            </div>
          </div>
        </div>
      </BlurFade>
    );
  }

  return (
    <BlurFade delay={delay}>
      <div className="flex justify-center">
        <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-full max-w-2xl">
              <svg viewBox="0 0 100 100" className="w-full h-auto" style={{ maxHeight: "400px" }}>
                <rect width="100" height="100" fill="#f8fafc" />
                {/* New Territories */}
                <path d="M5 10 Q20 2 50 5 Q80 10 90 30 Q95 50 80 60 Q60 70 40 60 Q20 50 10 30 Q5 20 5 10" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                {/* Kowloon */}
                <path d="M40 62 Q50 60 60 62 Q65 65 62 70 Q55 75 48 72 Q42 68 40 62" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                {/* HK Island */}
                <path d="M50 80 Q60 75 80 78 Q90 85 85 95 Q75 98 60 95 Q50 90 50 80" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                {/* Lantau */}
                <path d="M10 70 Q20 65 35 70 Q40 75 35 85 Q25 90 15 85 Q10 80 10 70" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                {/* Sai Kung */}
                <path d="M80 30 Q90 25 98 35 Q99 45 90 55 Q85 50 80 40 Q80 35 80 30" fill="#e5e7eb" stroke="#ffffff" strokeWidth="1" />
                {/* Water features */}
                <path d="M55 72 Q65 74 75 72" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" />
                <path d="M30 25 Q40 28 50 25" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="2,2" />
                <path d="M90 35 Q95 38 99 35" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="2,2" />
                {/* Markers */}
                {Object.entries(locations).map(([key, location]) => (
                  <g key={key}>
                    <circle
                      cx={location.x}
                      cy={location.y}
                      r="3"
                      fill={location.type === "nature" ? "#40c463" : "#3b82f6"}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="cursor-pointer transition-all duration-200 hover:r-4"
                      onMouseEnter={() => setHoveredLocation(key)}
                      onMouseLeave={() => setHoveredLocation(null)}
                    />
                    <text
                      x={location.x + 6}
                      y={location.y - 4}
                      fontSize="2.5"
                      fill="#374151"
                      className="pointer-events-none"
                      style={{ textShadow: '0 1px 2px #fff' }}
                    >
                      {key}
                    </text>
                  </g>
                ))}
                {/* Region Labels */}
                <text x="10" y="15" fontSize="3" fill="#6b7280" className="pointer-events-none">New Territories</text>
                <text x="45" y="65" fontSize="3" fill="#6b7280" className="pointer-events-none">Kowloon</text>
                <text x="92" y="25" fontSize="3" fill="#6b7280" className="pointer-events-none">Sai Kung</text>
                <text x="70" y="98" fontSize="3" fill="#6b7280" className="pointer-events-none">HK Island</text>
                {/* Legend for dashed blue lines */}
                <rect x="5" y="95" width="18" height="4" fill="#fff" stroke="#e5e7eb" strokeWidth="0.5" />
                <line x1="7" y1="97" x2="17" y2="97" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" />
                <text x="19" y="98.5" fontSize="2.5" fill="#3b82f6">Harbour/Water</text>
              </svg>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Nature</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Urban</span>
              </div>
            </div>
            {hoveredLocation && (
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700">
                  {getLocationName(hoveredLocation)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getLocationDescription(hoveredLocation)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 