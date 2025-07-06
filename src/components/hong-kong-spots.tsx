"use client";

import BlurFade from "./magicui/blur-fade";

interface HongKongSpotsProps {
  delay?: number;
}

export const HongKongSpots = ({ delay = 0 }: HongKongSpotsProps) => {
  const spotCategories = [
    {
      theme: "Nature",
      spots: [
        "Camping on Tai Mo Shan (大帽山) on December 31st to wait for the sunrise",
        "Kayaking at Tiu Chung Chau (吊鐘洲)",
        "Hiking at Tai Tong Sweet Gum Woods (大棠紅葉楓香林) & Thousand Island Lake (千島湖)",
        "Squid fishing in Sai Kung (西貢)",
        "Night hike to Braemar Hill",
      ],
    },
    {
      theme: "Urban",
      spots: [
        "Picnicking at West Kowloon (西九龍)",
        "City walk on Hong Kong Island (from Admiralty 金鐘 to Causeway Bay 銅鑼灣)",
        "Browsing local bookstores",
        "Drinking in SoHo (Bar Leone is Asia's Best Bar 2024)",
      ],
    },
  ];

  return (
    <BlurFade delay={delay}>
      <div className="space-y-12 w-full py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Best parts of Hong Kong.
            </h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              A collection of my favorite spots and activities in the city I call home.
            </p>
          </div>
        </div>
        
        <BlurFade delay={delay + 0.1}>
          <div className="space-y-8">
            {spotCategories.map((category, categoryId) => (
              <div key={category.theme} className="space-y-4">
                <BlurFade delay={delay + 0.2 + categoryId * 0.1}>
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    {category.theme}
                  </h3>
                </BlurFade>
                <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
                  {category.spots.map((spot, spotId) => (
                    <BlurFade
                      key={spot}
                      delay={delay + 0.3 + categoryId * 0.1 + spotId * 0.05}
                    >
                      <li className="py-2 pl-4">
                        <div className="text-base font-medium">
                          {spot}
                        </div>
                      </li>
                    </BlurFade>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </BlurFade>
  );
}; 