"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import BlurFade from "./magicui/blur-fade";

interface HongKongMapProps {
  delay?: number;
}

// Location data for Hong Kong spots
const locations = {
  "CUHK": {
    name: "The Chinese University of Hong Kong (香港中文大學)",
    description: "My university campus",
    coordinates: [22.4197, 114.2075],
    type: "education"
  },
  "Kowloon Walled City Park": {
    name: "Kowloon Walled City Park (九龍寨城公園)",
    description: "Historic park with traditional Chinese architecture",
    coordinates: [22.3319, 114.1914],
    type: "culture"
  },
  "Cheung Sha Wan": {
    name: "Cheung Sha Wan (長沙灣)",
    description: "Local neighborhood with authentic Hong Kong vibes",
    coordinates: [22.3381, 114.1556],
    type: "urban"
  },
  "Sham Shui Po": {
    name: "Sham Shui Po (深水埗)",
    description: "Electronics market and local street food",
    coordinates: [22.3308, 114.1583],
    type: "urban"
  },
  "Mong Kok": {
    name: "Mong Kok (旺角)",
    description: "Bustling shopping and entertainment district",
    coordinates: [22.3197, 114.1697],
    type: "urban"
  },
  "Tsim Sha Tsui": {
    name: "Tsim Sha Tsui (尖沙咀)",
    description: "Harbor views and cultural attractions",
    coordinates: [22.2972, 114.1719],
    type: "urban"
  },
  "Kennedy Town": {
    name: "Kennedy Town (堅尼地城)",
    description: "Western district with waterfront dining",
    coordinates: [22.2819, 114.1250],
    type: "urban"
  },
  "Causeway Bay": {
    name: "Causeway Bay (銅鑼灣)",
    description: "Major shopping and entertainment hub",
    coordinates: [22.2806, 114.1860],
    type: "urban"
  }
};

// Custom icon definition - single blue icon for all locations
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const HongKongMap = ({ delay = 0 }: HongKongMapProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fix for Leaflet marker icons in Next.js
  useEffect(() => {
    if (isClient) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, [isClient]);

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
            <div className="relative w-full h-96 max-w-4xl rounded-lg overflow-hidden border">
              <MapContainer 
                center={[22.35, 114.15]} // Center of Hong Kong
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {Object.entries(locations).map(([key, location]) => (
                  <Marker
                    key={key}
                    position={location.coordinates as [number, number]}
                    icon={blueIcon}
                  >
                    <Popup>
                      <span className="font-semibold">{location.name}</span>
                      <br />
                      {location.description}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
};

// Make sure to export the component as default if it's the only export
export default HongKongMap; 