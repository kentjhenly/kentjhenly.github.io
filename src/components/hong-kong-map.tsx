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
      x: 50,
      y: 20,
      type: "nature"
    },
    "Tiu Chung Chau": {
      name: "Tiu Chung Chau (吊鐘洲)",
      description: "Kayaking spot",
      x: 80,
      y: 60,
      type: "nature"
    },
    "Tai Tong": {
      name: "Tai Tong Sweet Gum Woods (大棠紅葉楓香林)",
      description: "Hiking with beautiful autumn leaves",
      x: 30,
      y: 40,
      type: "nature"
    },
    "Thousand Island Lake": {
      name: "Thousand Island Lake (千島湖)",
      description: "Hiking destination",
      x: 35,
      y: 45,
      type: "nature"
    },
    "Braemar Hill": {
      name: "Braemar Hill (寶馬山)",
      description: "Night hiking with city views",
      x: 65,
      y: 65,
      type: "nature"
    },
    "West Kowloon": {
      name: "West Kowloon (西九龍)",
      description: "Picnicking by the harbor",
      x: 45,
      y: 70,
      type: "urban"
    },
    "Admiralty": {
      name: "Admiralty (金鐘)",
      description: "Start of city walk",
      x: 60,
      y: 75,
      type: "urban"
    },
    "Causeway Bay": {
      name: "Causeway Bay (銅鑼灣)",
      description: "End of city walk",
      x: 70,
      y: 75,
      type: "urban"
    },
    "SoHo": {
      name: "SoHo",
      description: "Bar Leone - Asia's Best Bar 2024",
      x: 58,
      y: 78,
      type: "urban"
    },
    "Sai Kung": {
      name: "Sai Kung (西貢)",
      description: "Squid fishing",
      x: 85,
      y: 50,
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
                  
                  {/* Hong Kong Island - More detailed shape */}
                  <path
                    d="M55 75 Q60 70 65 72 Q70 75 68 80 Q65 85 60 83 Q55 80 55 75"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Kowloon Peninsula - More detailed shape */}
                  <path
                    d="M35 75 Q40 70 50 72 Q55 75 52 80 Q48 85 40 82 Q35 78 35 75"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* New Territories - Larger, more detailed */}
                  <path
                    d="M15 25 Q25 15 40 25 Q50 35 45 50 Q35 65 20 55 Q10 40 15 25"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Lantau Island - More detailed shape */}
                  <path
                    d="M65 35 Q75 30 85 35 Q90 40 88 50 Q80 60 70 55 Q65 45 65 35"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Sai Kung Peninsula - More detailed */}
                  <path
                    d="M75 40 Q85 35 95 40 Q100 45 98 55 Q90 65 80 60 Q75 50 75 40"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* Victoria Harbour */}
                  <path
                    d="M50 70 Q55 72 60 70"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.5"
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