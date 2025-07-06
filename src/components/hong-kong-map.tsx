"use client";

import { useState, useEffect, useMemo } from "react";
import BlurFade from "./magicui/blur-fade";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

interface HongKongMapProps {
  delay?: number;
}

// Real lat/lon for each location
const locations = {
  "Tai Mo Shan": {
    name: "Tai Mo Shan (大帽山)",
    description: "Camping on December 31st to wait for the sunrise",
    coordinates: [114.1175, 22.4197], // Tai Mo Shan peak
    type: "nature"
  },
  "Tiu Chung Chau": {
    name: "Tiu Chung Chau (吊鐘洲)",
    description: "Kayaking spot (northeast, near Sai Kung; not Cheung Chau)",
    coordinates: [114.3906, 22.4706], // Tiu Chung Chau
    type: "nature"
  },
  "Tai Tong": {
    name: "Tai Tong Sweet Gum Woods (大棠紅葉楓香林)",
    description: "Hiking with beautiful autumn leaves",
    coordinates: [114.0262, 22.4442], // Tai Tong
    type: "nature"
  },
  "Thousand Island Lake": {
    name: "Thousand Island Lake (千島湖)",
    description: "Hiking destination (near Tai Lam Chung Reservoir)",
    coordinates: [114.0572, 22.3497], // Tai Lam Chung Reservoir
    type: "nature"
  },
  "Braemar Hill": {
    name: "Braemar Hill (寶馬山)",
    description: "Night hiking with city views (above Causeway Bay, near North Point)",
    coordinates: [114.2006, 22.2822], // Braemar Hill
    type: "nature"
  },
  "West Kowloon": {
    name: "West Kowloon (西九龍)",
    description: "Picnicking by the harbor",
    coordinates: [114.1588, 22.3045], // West Kowloon Cultural District
    type: "urban"
  },
  "Admiralty": {
    name: "Admiralty (金鐘)",
    description: "Start of city walk",
    coordinates: [114.1655, 22.2797], // Admiralty
    type: "urban"
  },
  "Causeway Bay": {
    name: "Causeway Bay (銅鑼灣)",
    description: "End of city walk",
    coordinates: [114.1860, 22.2806], // Causeway Bay
    type: "urban"
  },
  "SoHo": {
    name: "SoHo",
    description: "Bar Leone - Asia's Best Bar 2024",
    coordinates: [114.1511, 22.2819], // SoHo, Central
    type: "urban"
  },
  "Sai Kung": {
    name: "Sai Kung (西貢)",
    description: "Squid fishing",
    coordinates: [114.2710, 22.3833], // Sai Kung Town
    type: "nature"
  }
};

export const HongKongMap = ({ delay = 0 }: HongKongMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetch("/hk-districts-topo.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setGeoData(data))
      .catch((error) => {
        console.error("Error loading Hong Kong map data:", error);
      });
  }, []);

  const getLocationName = (locationKey: string) => locations[locationKey as keyof typeof locations]?.name || locationKey;
  const getLocationDescription = (locationKey: string) => locations[locationKey as keyof typeof locations]?.description || "";

  if (!isClient || !geoData) {
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
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  center: [114.2, 22.3],
                  scale: 15000,
                }}
                width={800}
                height={500}
                style={{ width: "100%", height: "auto", maxHeight: 500 }}
              >
                <Geographies geography={geoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: "#e5e7eb",
                            stroke: "#ffffff",
                            strokeWidth: 0.75,
                            outline: "none",
                          },
                          hover: {
                            fill: "#3b82f6",
                            stroke: "#ffffff",
                            strokeWidth: 1,
                            outline: "none",
                          },
                          pressed: {
                            fill: "#e5e7eb",
                            stroke: "#ffffff",
                            strokeWidth: 1,
                            outline: "none",
                          },
                        }}
                      />
                    ))
                  }
                </Geographies>
                {/* Markers for locations */}
                {Object.entries(locations).map(([key, location]) => (
                  <Marker
                    key={key}
                    coordinates={location.coordinates as [number, number]}
                    onMouseEnter={() => setHoveredLocation(key)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <circle
                      r={10}
                      fill={location.type === "nature" ? "#40c463" : "#3b82f6"}
                      stroke="#fff"
                      strokeWidth={3}
                      style={{ cursor: "pointer", transition: "r 0.2s" }}
                    />
                  </Marker>
                ))}
              </ComposableMap>
              {/* Tooltip for hovered location */}
              {hoveredLocation && (
                <div className="absolute left-1/2 top-2 transform -translate-x-1/2 bg-white bg-opacity-90 text-blue-700 px-4 py-2 rounded-lg shadow text-center pointer-events-none z-10">
                  <span className="font-semibold text-base">{getLocationName(hoveredLocation)}</span>
                  <div className="text-xs text-gray-500 mt-1">{getLocationDescription(hoveredLocation)}</div>
                </div>
              )}
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
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 