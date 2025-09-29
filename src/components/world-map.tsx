"use client";

import { useState, useEffect, useMemo } from "react";
import BlurFade from "./magicui/blur-fade";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import geoData from "../../public/world-countries.json";

// List of countries you've visited (ISO 3166-1 alpha-3 codes)
const visitedCountries = [
  "AUS", // Australia
  "BEL", // Belgium
  "CHN", // China
  "CHE", // Switzerland
  "DEU", // Germany
  "FRA", // France
  "HKG", // Hong Kong
  "IDN", // Indonesia
  "ITA", // Italy
  "JPN", // Japan
  "KOR", // South Korea
  "MYS", // Malaysia
  "NLD", // Netherlands
  "SGP", // Singapore
  "THA", // Thailand
  "TWN", // Taiwan
  "VAT", // Vatican City
];

// Map of country codes to full names and categories for the word list
const countryData: { [key: string]: { name: string; category: string } } = {
  "AUS": { name: "Australia", category: "Oceania" },
  "BEL": { name: "Belgium", category: "Europe" },
  "CHN": { name: "China", category: "Asia" },
  "CHE": { name: "Switzerland", category: "Europe" },
  "DEU": { name: "Germany", category: "Europe" },
  "FRA": { name: "France", category: "Europe" },
  "HKG": { name: "Hong Kong", category: "Asia" },
  "IDN": { name: "Indonesia", category: "Asia" },
  "ITA": { name: "Italy", category: "Europe" },
  "JPN": { name: "Japan", category: "Asia" },
  "KOR": { name: "South Korea", category: "Asia" },
  "MYS": { name: "Malaysia", category: "Asia" },
  "NLD": { name: "Netherlands", category: "Europe" },
  "SGP": { name: "Singapore", category: "Asia" },
  "THA": { name: "Thailand", category: "Asia" },
  "TWN": { name: "Taiwan", category: "Asia" },
  "VAT": { name: "Vatican City", category: "Europe" },
};

interface WorldMapProps {
  delay?: number;
}

export const WorldMap = ({ delay }: WorldMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.5 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper to get country name from feature
  const getCountryName = (feature: any) => {
    return feature.properties.name;
  };

  // Helper to get country code from feature
  const getCountryCode = (feature: any) => {
    return feature.id;
  };

  // Memoize visited set for fast lookup
  const visitedSet = useMemo(() => new Set(visitedCountries), []);

  if (!isClient) {
    return (
      <BlurFade delay={delay}>
        <div className="flex justify-center">
          <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
            <div className="h-96 flex items-center justify-center">
              Loading World Map...
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
                  rotate: [-10, 0, 0],
                  scale: 150,
                }}
                width={800}
                height={400}
                style={{ width: "100%", height: "auto", maxHeight: 400 }}
              >
                <ZoomableGroup
                  zoom={position.zoom}
                  center={position.coordinates as [number, number]}
                  onMoveEnd={({ coordinates, zoom }) => setPosition({ coordinates, zoom })}
                >
                  <Geographies geography={geoData}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const code = getCountryCode(geo);
                        const isVisited = visitedSet.has(code);
                        const isHome = code === "HKG" || code === "IDN";
                        const fillColor = isHome ? "#ef4444" : (isVisited ? "#5AC8FA" : "#e5e7eb");
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => setHoveredCountry(getCountryName(geo))}
                            onMouseLeave={() => setHoveredCountry(null)}
                            style={{
                              default: {
                                fill: fillColor,
                                stroke: "#ffffff",
                                strokeWidth: 0.75,
                                outline: "none",
                                transition: "fill 0.2s",
                                cursor: "pointer",
                              },
                              hover: {
                                fill: isHome ? "#dc2626" : "#3b82f6",
                                stroke: "#ffffff",
                                strokeWidth: 1,
                                outline: "none",
                                cursor: "pointer",
                              },
                              pressed: {
                                fill: fillColor,
                                stroke: "#ffffff",
                                strokeWidth: 1,
                                outline: "none",
                                cursor: "pointer",
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              {/* Tooltip for hovered country */}
              {hoveredCountry && (
                <div className="absolute left-1/2 top-2 transform -translate-x-1/2 bg-white bg-opacity-90 text-blue-700 px-4 py-2 rounded-lg shadow text-center pointer-events-none z-10">
                  <span className="font-semibold text-base">{hoveredCountry}</span>
                </div>
              )}
            </div>
             {/* Legend */}
             <div className="flex items-center space-x-6 text-sm">
               <div className="flex items-center space-x-2">
                 <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                 <span>Home</span>
               </div>
               <div className="flex items-center space-x-2">
                 <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5AC8FA' }}></div>
                 <span>Visited</span>
               </div>
               <div className="flex items-center space-x-2">
                 <div className="w-4 h-4 bg-gray-300 rounded"></div>
                 <span>Not Yet Visited</span>
               </div>
             </div>
            
            {/* Visited Countries Word List */}
            <div className="w-full max-w-2xl">
              <h3 className="text-lg font-semibold text-center mb-4">Countries Visited</h3>
              <div className="text-center space-y-3">
                {(() => {
                  // Group countries by category
                  const categories: { [key: string]: string[] } = {};
                  visitedCountries.forEach(countryCode => {
                    const category = countryData[countryCode]?.category || "Other";
                    if (!categories[category]) {
                      categories[category] = [];
                    }
                    categories[category].push(countryData[countryCode]?.name || countryCode);
                  });
                  
                  return Object.entries(categories).map(([category, countries]) => (
                    <div key={category} className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">{category}</div>
                      <div className="text-sm text-foreground">
                        {countries.join(", ")}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 