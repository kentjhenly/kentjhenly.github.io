"use client";

import BlurFade from "./magicui/blur-fade";

interface HongKongSpotsProps {
  delay?: number;
}

export const HongKongSpots = ({ delay }: HongKongSpotsProps) => {
  const spots = [
    "Camping on Tai Mo Shan (大帽山) on December 31st to wait for the sunrise",
    "Kayaking at Tiu Chung Chau (吊鐘洲)",
    "Hiking at Tai Tong Sweet Gum Woods (大棠紅葉楓香林) & Thousand Island Lake (千島湖)",
    "Picnicking at West Kowloon (西九龍)",
    "City walk on Hong Kong Island (from Admiralty 金鐘 to Causeway Bay 銅鑼灣)",
    "Browsing local bookstores",
    "Squid fishing in Sai Kung (西貢)",
  ];

  return (
    <BlurFade delay={delay}>
      <div className="space-y-12 w-full py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Best parts of Hong Kong.
            </h2>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-card border rounded-lg p-6 w-full max-w-4xl">
            <div className="grid gap-4">
              {spots.map((spot, index) => (
                <div
                  key={index}
                  className="text-lg font-medium text-center py-2 hover:text-primary transition-colors"
                >
                  {spot}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BlurFade>
  );
}; 