"use client";

import { useState, useEffect } from "react";
import BlurFade from "./magicui/blur-fade";

// List of countries you've visited
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
];

interface WorldMapProps {
  delay?: number;
}

export const WorldMap = ({ delay }: WorldMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [clickedCountry, setClickedCountry] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCountryName = (countryCode: string) => {
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
    };
    return countryNames[countryCode] || countryCode;
  };

  const handleCountryClick = (countryCode: string) => {
    if (visitedCountries.includes(countryCode)) {
      setClickedCountry(clickedCountry === countryCode ? null : countryCode);
    }
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
            <div className="flex flex-col items-center space-y-6">
              {/* Simple World Map Visualization */}
              <div className="relative w-full max-w-2xl">
                <svg
                  viewBox="0 0 1000 500"
                  className="w-full h-auto"
                  style={{ maxHeight: "400px" }}
                >
                  {/* Background */}
                  <rect width="1000" height="500" fill="#f8fafc" />
                  
                  {/* Simplified continents */}
                  {/* North America */}
                  <path
                    d="M150 150 Q200 100 250 120 Q300 140 320 180 Q300 220 250 240 Q200 260 150 250 Q120 230 130 200 Q140 170 150 150"
                    fill={visitedCountries.includes("USA") ? "#40c463" : "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                    onMouseEnter={() => setHoveredCountry("USA")}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => handleCountryClick("USA")}
                  />
                  
                  {/* South America */}
                  <path
                    d="M250 250 Q270 280 280 320 Q285 360 280 400 Q275 430 270 450 Q265 470 260 480"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  
                  {/* Europe */}
                  <path
                    d="M450 120 Q470 110 490 115 Q510 120 520 130 Q515 140 510 150 Q505 160 500 170"
                    fill={visitedCountries.includes("FRA") || visitedCountries.includes("ESP") || visitedCountries.includes("CHE") || visitedCountries.includes("ITA") ? "#40c463" : "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                    onMouseEnter={() => setHoveredCountry("Europe")}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => handleCountryClick("Europe")}
                  />
                  
                  {/* Africa */}
                  <path
                    d="M470 180 Q480 200 485 250 Q490 300 485 350 Q480 400 475 450"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  
                  {/* Asia */}
                  <path
                    d="M520 100 Q600 90 700 110 Q750 130 780 150 Q800 170 820 190 Q830 210 840 230"
                    fill={visitedCountries.includes("CHN") || visitedCountries.includes("TWN") || visitedCountries.includes("JPN") || visitedCountries.includes("KOR") || visitedCountries.includes("MYS") || visitedCountries.includes("THA") ? "#40c463" : "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                    onMouseEnter={() => setHoveredCountry("Asia")}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => handleCountryClick("Asia")}
                  />
                  
                  {/* Australia */}
                  <path
                    d="M750 350 Q780 340 800 345 Q820 350 830 360 Q825 370 820 380 Q815 390 810 400"
                    fill="#e5e7eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  
                  {/* Middle East */}
                  <path
                    d="M520 200 Q540 190 560 195 Q580 200 590 210 Q585 220 580 230 Q575 240 570 250"
                    fill={visitedCountries.includes("QAT") ? "#40c463" : "#e5e7eb"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                    onMouseEnter={() => setHoveredCountry("QAT")}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => handleCountryClick("QAT")}
                  />
                </svg>
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
              </div>
              
              {/* Click tooltip */}
              {clickedCountry && (
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-700">
                    {clickedCountry === "Europe" 
                      ? "Europe: France, Spain, Switzerland, Italy"
                      : clickedCountry === "Asia"
                      ? "Asia: China, Taiwan, Japan, South Korea, Malaysia, Thailand"
                      : getCountryName(clickedCountry)
                    }
                  </p>
                </div>
              )}
              
              {/* Hover tooltip */}
              {hoveredCountry && !clickedCountry && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {visitedCountries.includes(hoveredCountry) || 
                     (hoveredCountry === "Europe" && (visitedCountries.includes("FRA") || visitedCountries.includes("ESP") || visitedCountries.includes("CHE") || visitedCountries.includes("ITA"))) ||
                     (hoveredCountry === "Asia" && (visitedCountries.includes("CHN") || visitedCountries.includes("TWN") || visitedCountries.includes("JPN") || visitedCountries.includes("KOR") || visitedCountries.includes("MYS") || visitedCountries.includes("THA")))
                     ? "✅ Visited - Click to see details" : "⏳ Not yet visited"}
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