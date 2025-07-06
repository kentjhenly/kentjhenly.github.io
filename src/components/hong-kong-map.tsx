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
      x: 25,
      y: 15,
      type: "nature"
    },
    "Tiu Chung Chau": {
      name: "Tiu Chung Chau (吊鐘洲)",
      description: "Kayaking spot",
      x: 75,
      y: 70,
      type: "nature"
    },
    "Tai Tong": {
      name: "Tai Tong Sweet Gum Woods (大棠紅葉楓香林)",
      description: "Hiking with beautiful autumn leaves",
      x: 20,
      y: 35,
      type: "nature"
    },
    "Thousand Island Lake": {
      name: "Thousand Island Lake (千島湖)",
      description: "Hiking destination",
      x: 30,
      y: 40,
      type: "nature"
    },
    "Braemar Hill": {
      name: "Braemar Hill (寶馬山)",
      description: "Night hiking with city views",
      x: 42,
      y: 72,
      type: "nature"
    },
    "West Kowloon": {
      name: "West Kowloon (西九龍)",
      description: "Picnicking by the harbor",
      x: 40,
      y: 72,
      type: "urban"
    },
    "Admiralty": {
      name: "Admiralty (金鐘)",
      description: "Start of city walk",
      x: 52,
      y: 76,
      type: "urban"
    },
    "Causeway Bay": {
      name: "Causeway Bay (銅鑼灣)",
      description: "End of city walk",
      x: 58,
      y: 76,
      type: "urban"
    },
    "SoHo": {
      name: "SoHo",
      description: "Bar Leone - Asia's Best Bar 2024",
      x: 55,
      y: 78,
      type: "urban"
    },
    "Sai Kung": {
      name: "Sai Kung (西貢)",
      description: "Squid fishing",
      x: 80,
      y: 35,
      type: "nature"
    }
  };

  const getLocationName = (locationKey: string) => {
    return locations[locationKey as keyof typeof locations]?.name || locationKey;
  };

  const getLocationDescription = (locationKey: string) => {
    return locations[locationKey as keyof typeof locations]?.description || "";
  };

  const getLocationType = (locationKey: string) => {
    return locations[locationKey as keyof typeof locations]?.type || "nature";
  };

  if (!isClient) {
    return (
      <BlurFade delay={delay}>
        <div className="space-y-12 w-full py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Hong Kong Map.
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Interactive map of my favorite spots in Hong Kong.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
              <div className="h-96 flex items-center justify-center">
                Loading Hong Kong Map...
              </div>
            </div>
          </div>
        </div>
      </BlurFade>
    );
  }

  return (
    <BlurFade delay={delay}>
      <div className="space-y-12 w-full py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Hong Kong Map.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Interactive map of my favorite spots in Hong Kong.
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
            <div className="flex flex-col items-center space-y-6">
              {/* Hong Kong Map Visualization */}
              <div className="relative w-full max-w-2xl">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-auto"
                  style={{ maxHeight: "400px" }}
                >
                  {/* Background */}
                  <rect width="100" height="100" fill="#f8fafc" />
                  
                  {/* New Territories - Main landmass (largest area) */}
                  <path
                    d="M5 15 Q15 5 35 8 Q50 15 48 35 Q45 55 30 60 Q15 55 8 40 Q5 25 5 15"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Kowloon Peninsula - Between NT and HK Island */}
                  <path
                    d="M35 70 Q42 65 50 67 Q55 70 53 75 Q50 78 45 77 Q40 75 35 70"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Hong Kong Island - South of Kowloon */}
                  <path
                    d="M50 75 Q55 72 60 73 Q63 75 62 78 Q60 81 55 80 Q50 78 50 75"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Lantau Island - West of HK Island */}
                  <path
                    d="M65 60 Q75 55 85 60 Q88 65 86 75 Q80 85 70 80 Q65 70 65 60"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Sai Kung Peninsula - East of NT */}
                  <path
                    d="M70 25 Q80 20 90 25 Q93 30 91 40 Q85 50 75 45 Q70 35 70 25"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Victoria Harbour - Between Kowloon and HK Island */}
                  <path
                    d="M48 72 Q52 74 56 72"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  />
                  
                  {/* Tolo Harbour - In NT */}
                  <path
                    d="M25 35 Q30 37 35 35"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />
                  
                  {/* Mirs Bay - East of Sai Kung */}
                  <path
                    d="M85 30 Q90 32 95 30"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />
                  
                  {/* Location Markers */}
                  {Object.entries(locations).map(([key, location]) => (
                    <g key={key}>
                      {/* Marker */}
                      <circle
                        cx={location.x}
                        cy={location.y}
                        r="2"
                        fill={location.type === "nature" ? "#40c463" : "#3b82f6"}
                        stroke="#ffffff"
                        strokeWidth="1"
                        className="cursor-pointer transition-all duration-200 hover:r-3"
                        onMouseEnter={() => setHoveredLocation(key)}
                        onMouseLeave={() => setHoveredLocation(null)}
                      />
                      {/* Label */}
                      <text
                        x={location.x + 3}
                        y={location.y - 3}
                        fontSize="2"
                        fill="#374151"
                        className="pointer-events-none"
                      >
                        {key}
                      </text>
                    </g>
                  ))}
                  
                  {/* Region Labels */}
                  <text x="25" y="20" fontSize="3" fill="#6b7280" className="pointer-events-none">New Territories</text>
                  <text x="42" y="82" fontSize="3" fill="#6b7280" className="pointer-events-none">Kowloon</text>
                  <text x="55" y="82" fontSize="3" fill="#6b7280" className="pointer-events-none">HK Island</text>
                  <text x="75" y="70" fontSize="3" fill="#6b7280" className="pointer-events-none">Lantau</text>
                  <text x="80" y="35" fontSize="3" fill="#6b7280" className="pointer-events-none">Sai Kung</text>
                </svg>
              </div>
              
              {/* Legend */}
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
              
              {/* Hover tooltip */}
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
      </div>
    </BlurFade>
  );
}; 