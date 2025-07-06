"use client";

import { useState, useEffect, useMemo } from "react";
import BlurFade from "./magicui/blur-fade";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

// List of countries you've visited (ISO 3166-1 alpha-3 codes)
const visitedCountries = [
  "USA", // United States
  "CHN", // China
  "TWN", // Taiwan
  "JPN", // Japan
  "KOR", // South Korea
  "MYS", // Malaysia
  "THA", // Thailand
  "FRA", // France
  "ESP", // Spain
  "CHE", // Switzerland
  "ITA", // Italy
  "QAT", // Qatar
  "GBR", // United Kingdom
  "FIN", // Finland
];

// Map of country codes to full names for the word list
const countryNames: { [key: string]: string } = {
  "USA": "United States",
  "CHN": "China",
  "TWN": "Taiwan",
  "JPN": "Japan",
  "KOR": "South Korea",
  "MYS": "Malaysia",
  "THA": "Thailand",
  "FRA": "France",
  "ESP": "Spain",
  "CHE": "Switzerland",
  "ITA": "Italy",
  "QAT": "Qatar",
  "GBR": "United Kingdom",
  "FIN": "Finland",
};

interface WorldMapProps {
  delay?: number;
}

export const WorldMap = ({ delay }: WorldMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Fetch the world-countries.json file from the public directory
    fetch("/world-countries.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
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

  if (!isClient || !geoData) {
    return (
      <BlurFade delay={delay}>
        <div className="space-y-12 w-full py-12">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                World Map.
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Countries I&apos;ve had the privilege to explore.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
              <div className="h-96 flex items-center justify-center">
                Loading World Map...
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
              World Map.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Countries I&apos;ve had the privilege to explore.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-full max-w-2xl">
                <ComposableMap
                  projectionConfig={{ scale: 180 }}
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
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onMouseEnter={() => setHoveredCountry(getCountryName(geo))}
                              onMouseLeave={() => setHoveredCountry(null)}
                              style={{
                                default: {
                                  fill: isVisited ? "#40c463" : "#e5e7eb",
                                  stroke: "#ffffff",
                                  strokeWidth: 0.75,
                                  outline: "none",
                                  transition: "fill 0.2s",
                                  cursor: "pointer",
                                },
                                hover: {
                                  fill: "#3b82f6",
                                  stroke: "#ffffff",
                                  strokeWidth: 1,
                                  outline: "none",
                                  cursor: "pointer",
                                },
                                pressed: {
                                  fill: isVisited ? "#40c463" : "#e5e7eb",
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
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Not Yet Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Hover</span>
                </div>
              </div>
              
              {/* Visited Countries Word List */}
              <div className="w-full max-w-2xl">
                <h3 className="text-lg font-semibold text-center mb-4">Countries Visited</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {visitedCountries.map((countryCode) => (
                    <span
                      key={countryCode}
                      className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200"
                    >
                      {countryNames[countryCode]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 