"use client";

import { useRef, useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import BlurFade from "./magicui/blur-fade";

// List of countries you've visited
const visitedCountries = [
  "USA", // United States
  "CHN", // China
  "HKG", // Hong Kong (Special Administrative Region)
  "TWN", // Taiwan
  "JPN", // Japan
  "KOR", // South Korea
  "MYS", // Malaysia
  "THA", // Thailand
  "FRA", // France
  "ESP", // Spain
  "CHE", // Switzerland
  "ITA", // Italy
  "VAT", // Vatican City
  "QAT", // Qatar
];

interface WorldMapProps {
  delay?: number;
}

export const WorldMap = ({ delay }: WorldMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  const getCountryStyle = (geo: any) => {
    const isVisited = visitedCountries.includes(geo.properties.ISO_A3);
    const isHovered = hoveredCountry === geo.properties.ISO_A3;
    
    return {
      default: {
        fill: isVisited ? "#3b82f6" : "#e5e7eb",
        stroke: "#ffffff",
        strokeWidth: 0.5,
        outline: "none",
        transition: "all 0.3s ease",
      },
      hover: {
        fill: isVisited ? "#1d4ed8" : "#d1d5db",
        stroke: "#ffffff",
        strokeWidth: 1,
        outline: "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
      },
      pressed: {
        fill: isVisited ? "#1e40af" : "#9ca3af",
        stroke: "#ffffff",
        strokeWidth: 1,
        outline: "none",
      },
    };
  };

  const getCountryName = (geo: any) => {
    const countryNames: { [key: string]: string } = {
      "USA": "United States",
      "CHN": "China",
      "HKG": "Hong Kong",
      "TWN": "Taiwan",
      "JPN": "Japan",
      "KOR": "South Korea",
      "MYS": "Malaysia",
      "THA": "Thailand",
      "FRA": "France",
      "ESP": "Spain",
      "CHE": "Switzerland",
      "ITA": "Italy",
      "VAT": "Vatican City",
      "QAT": "Qatar",
    };
    return countryNames[geo.properties.ISO_A3] || geo.properties.NAME;
  };

  if (!isClient) {
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
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{
                scale: 147,
              }}
              style={{
                width: "100%",
                height: "500px",
              }}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                onMoveEnd={handleMoveEnd}
                maxZoom={4}
                minZoom={1}
              >
                <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@3/countries-110m.json">
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const isVisited = visitedCountries.includes(geo.properties.ISO_A3);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={getCountryStyle(geo)}
                          onMouseEnter={() => {
                            setHoveredCountry(geo.properties.ISO_A3);
                          }}
                          onMouseLeave={() => {
                            setHoveredCountry(null);
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
            
            {/* Legend */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span>Not Yet Visited</span>
                </div>
              </div>
            </div>
            
            {/* Hover tooltip */}
            {hoveredCountry && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {visitedCountries.includes(hoveredCountry) ? "✅ Visited" : "⏳ Not yet visited"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 