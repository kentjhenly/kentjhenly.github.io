"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface JakartaMapProps {
  delay?: number;
}

// Jakarta spots data
const jakartaSpots = [
  {
    id: 1,
    name: "Sunter",
    position: [-6.1256, 106.8581] as [number, number],
    description: "Residential area in North Jakarta",
    category: "Residential"
  },
  {
    id: 2,
    name: "Mangga Dua",
    position: [-6.1352, 106.8133] as [number, number],
    description: "Electronics and wholesale market district",
    category: "Shopping"
  },
  {
    id: 3,
    name: "Bundaran HI",
    position: [-6.1944, 106.8229] as [number, number],
    description: "Central Jakarta's iconic roundabout and business district",
    category: "Business"
  },
  {
    id: 4,
    name: "Sudirman",
    position: [-6.2088, 106.8456] as [number, number],
    description: "Major business and financial district",
    category: "Business"
  },
  {
    id: 5,
    name: "Blok M",
    position: [-6.2431, 106.7994] as [number, number],
    description: "Shopping and entertainment area in South Jakarta",
    category: "Entertainment"
  }
];

const customIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const JakartaMap = ({ delay = 0 }: JakartaMapProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="space-y-content-md"
    >
      <div className="flex justify-center">
        <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-full h-96 max-w-4xl rounded-lg overflow-hidden border">
        <MapContainer
          center={[-6.1944, 106.8229]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {jakartaSpots.map((spot) => (
            <Marker key={spot.id} position={spot.position} icon={customIcon}>
              <Popup>
                <span className="font-semibold">{spot.name}</span>
                <br />
                {spot.description}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
