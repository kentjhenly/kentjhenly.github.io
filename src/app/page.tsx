"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
const TechStack = dynamic(() => import("@/components/tech-stack").then(mod => mod.TechStack), { ssr: false });
const TimelineItem = dynamic(() => import("@/components/resume-card").then(mod => mod.TimelineItem), { ssr: false });
const ContactOrbiting = dynamic(() => import("@/components/contact-orbiting").then(mod => mod.ContactOrbiting), { ssr: false });

const HongKongMap = dynamic(() => import("@/components/hong-kong-map").then(mod => mod.HongKongMap), { ssr: false });
const JakartaMap = dynamic(() => import("@/components/jakarta-map").then(mod => mod.JakartaMap), { ssr: false });
const WorldMap = dynamic(() => import("@/components/world-map").then(mod => mod.WorldMap), { ssr: false });
const BlurFade = dynamic(() => import("@/components/magicui/blur-fade").then(mod => mod.default), { ssr: false });
const BlurFadeText = dynamic(() => import("@/components/magicui/blur-fade-text").then(mod => mod.default), { ssr: false });
const ResumeCard = dynamic(() => import("@/components/resume-card").then(mod => mod.ResumeCard), { ssr: false });
const BookCard = dynamic(() => import("@/components/book-card").then(mod => mod.BookCard), { ssr: false });
const TableOfContents = dynamic(() => import("@/components/table-of-contents").then(mod => mod.TableOfContents), { ssr: false });
const EntertainmentToggle = dynamic(() => import("@/components/entertainment-toggle").then(mod => mod.EntertainmentToggle), { ssr: false });
const LocationToggle = dynamic(() => import("@/components/location-toggle").then(mod => mod.LocationToggle), { ssr: false });
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const [entertainmentTab, setEntertainmentTab] = useState<"movies" | "shows" | "music">("movies");
  const [locationTab, setLocationTab] = useState<"hong-kong" | "jakarta">("hong-kong");

  return (
    <main className="flex flex-col min-h-[100dvh] py-16">
      <TableOfContents />
      
      <section id="hero" className="mb-section-lg">
        <div className="w-full space-y-content-lg">
          <div className="gap-2 flex justify-between items-center">
            <div className="flex-col flex flex-1 space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(" ")[0]}.`}
              />
              <BlurFadeText
                delay={BLUR_FADE_DELAY * 1.5}
                className="text-sm text-muted-foreground md:text-base"
                yOffset={8}
                text={`In Chinese, I'm 李忠賢, so call me Li Zhongxian (Mandarin), Lee Chung Yin (Cantonese), or Lie Tong Hian (Teochew) and I'll turn my head (probably).`}
              />
              <BlurFadeText
                className="max-w-[600px] text-muted-foreground md:text-xl"
                delay={BLUR_FADE_DELAY * 2}
                text={DATA.description}
              />
            </div>
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <Avatar className="size-28 border">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade>
          </div>
        </div>
      </section>

      <section id="about" className="mb-section-lg">
        <div className="space-y-content-md">
        <BlurFade delay={BLUR_FADE_DELAY * 10}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
          <div className="space-y-content-sm">
        <BlurFade delay={BLUR_FADE_DELAY * 11}>
          <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            At first glance I might seem like your average local Hong Konger, but I was actually born and raised in the hustle and bustle of Jakarta, Indonesia. You might not expect that place to be in any way similar to Hong Kong, but I grew up embracing the hearty commotion of the big city. I moved to Hong Kong when I turned 17 to pursue my studies, and it has been the highlight of my life. It taught me many life lessons on independence, time management, and cold hard work.
          </p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 12}>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            Before university, I was the kid who never needed to study maths. I didn&apos;t revise and would still get straight As. Maths was one of the only classes I would actually look forward to. It actually got to the point where I would ask my teacher for extra worksheets to do, and of course she ran out of them. I realized that Computer Science somewhere I can apply my interest in maths, and as someone who used to see computers as magic, I was eager to learn more about computers.
          </p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 13}>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            After graduating high school, I moved thousands of miles away to pursue my studies, where I knew absolutely no one. I intentionally chose a city like Hong Kong where I had no friends or family, because when no one knows you, you are who you pretend to be, and I faked it till I made it. I somehow was able to reinvent myself, and I found my extroversion and my passion for public speaking, something that a few months prior I thought was impossible.
          </p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 14}>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            Though after entering university, my extroversion shone through, and I felt like there was a whole other world that half of my peers was exploring, while most people in STEM majors like me ignored it. I realized that there weren&apos;t that many people in STEM who would love to communicate and work with others either in their career or day to day. Speaking to professionals only solidified my opinion, as they also struggled to find people who had both the technical and communication skills.
          </p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 15}>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            I also realized after an internship that I loved to see how companies worked in the big picture, and how command flows through an organization of thousands and somehow, each person contributes to a system that they may not understand, but it still delivers service smoothly. This is the reason why I started my minor in Business.
          </p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 16}>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            And so, here I am, merging my interests for the magic of computers, the warmth of connections and people, and the complexity and efficiency of businesses. I hope that I can encourage people that are just like me back then to conquer their fears of speaking out and being heard.
          </p>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 17}>
              <p className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            So that&apos;s basically my life story (haha). On a lighter note, when I&apos;m not dialed in my work, you can find me writing articles or taking pictures with my digital camera. I&apos;m all around, trying new things at new places. The only thing you can call me is all over the place. So that&apos;s that. Thanks for reading!
          </p>
        </BlurFade>
          </div>
        </div>
      </section>


      <section id="work" className="mb-section-lg">
        <div className="space-y-12">
          <BlurFade delay={BLUR_FADE_DELAY * 17}>
            <h2 className="text-xl font-bold">Technical Experience</h2>
          </BlurFade>
          <div className="space-y-0">
          {DATA.technicalExperience.map((work, id) => (
              <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 18 + id * 0.05}>
                <TimelineItem
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title}
                href={work.href}
                badges={work.badges}
                period={`${work.start} - ${work.end ?? "Present"}`}
                bullets={work.bullets}
                  isLast={id === DATA.technicalExperience.length - 1}
              />
            </BlurFade>
          ))}
          </div>
        </div>
      </section>

      <section id="organizational" className="mb-section-lg">
        <div className="space-y-12">
          <BlurFade delay={BLUR_FADE_DELAY * 19}>
            <h2 className="text-xl font-bold">Organizational Experience</h2>
          </BlurFade>
          <div className="space-y-0">
          {DATA.organizationalExperience.map((work, id) => (
              <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 20 + id * 0.05}>
                <TimelineItem
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title}
                href={work.href}
                badges={work.badges}
                period={`${work.start} - ${work.end ?? "Present"}`}
                bullets={work.bullets}
                  isLast={id === DATA.organizationalExperience.length - 1}
              />
            </BlurFade>
          ))}
          </div>
        </div>
      </section>

      <section id="education" className="mb-section-lg">
        <div className="space-y-12">
          <BlurFade delay={BLUR_FADE_DELAY * 21}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          <div className="space-y-0">
          {DATA.education.map((education, id) => (
              <BlurFade key={education.school} delay={BLUR_FADE_DELAY * 22 + id * 0.05}>
                <TimelineItem
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                  href={education.href}
                period={`${education.start} - ${education.end}`}
                  isLast={id === DATA.education.length - 1}
              />
            </BlurFade>
          ))}
        </div>
        </div>
      </section>

      <section id="tech-stack" className="mb-section-lg">
        <TechStack delay={BLUR_FADE_DELAY * 23} />
      </section>



      <section id="media-favorites" className="mb-section-lg">
        <div className="space-y-content-lg">
          <BlurFade delay={BLUR_FADE_DELAY * 24}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Media Favorites.
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed whitespace-nowrap">
                  A curated collection of movies, shows, and music that have moved and inspired me.
                </p>
              </div>
            </div>
          </BlurFade>
          
          <EntertainmentToggle 
            currentTab={entertainmentTab} 
            onTabChange={setEntertainmentTab}
            delay={BLUR_FADE_DELAY * 25}
          />
          
          <BlurFade delay={BLUR_FADE_DELAY * 26}>
            <div className="space-y-content-lg">
              <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
                {DATA.entertainment[entertainmentTab].map((item, itemId) => {
                  // Generate IMDb URL for movies and shows
                  const getImdbUrl = (title: string, type: "movies" | "shows" | "music") => {
                    if (type === "music") return undefined;
                    
                    // IMDb ID mapping for direct links
                    const imdbIds: { [key: string]: string } = {
                      // Movies
                      "Arrival": "tt2543164",
                      "Everything Everywhere All at Once": "tt6710474",
                      "Sore: Wife from the Future": "tt34548722",
                      "Falling in Love Like in Movies": "tt26903085",
                      "How to Make Millions Before Grandma Dies": "tt31392609",
                      "Parasite": "tt6751668",
                      "Chungking Express": "tt0109424",
                      "Perfect Days": "tt27503384",
                      "Conclave": "tt20215234",
                      "Look Back": "tt31711040",
                      
                      // Shows
                      "Severance": "tt11280740",
                      "The Rehearsal": "tt10802170",
                      "The Good Place": "tt4955642",
                      "Succession": "tt7660850",
                      "Avatar: The Last Airbender": "tt0417299",
                      "Delicious in Dungeon": "tt21621494",
                      "Signal": "tt5332206",
                      "Nichijou": "tt2098308",
                      "Smiling Friends": "tt12074628",
                      "The Amazing World of Gumball": "tt1942683"
                    };
                    
                    const imdbId = imdbIds[title];
                    if (imdbId) {
                      return `https://www.imdb.com/title/${imdbId}/`;
                    }
                    
                    return undefined;
                  };

                  return (
                    <BlurFade
                      key={item.title + item.creator}
                      delay={BLUR_FADE_DELAY * 27 + itemId * 0.05}
                    >
                      <BookCard
                        title={item.title}
                        author={`${item.creator} (${item.year})`}
                        number={item.number}
                        href={getImdbUrl(item.title, entertainmentTab)}
                      />
                    </BlurFade>
                  );
                })}
              </ul>
            </div>
          </BlurFade>
        </div>
      </section>

      <section id="locations" className="mb-section-lg">
        <div className="space-y-content-lg">
          <BlurFade delay={BLUR_FADE_DELAY * 28}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  {locationTab === "hong-kong" ? "Best spots in Hong Kong." : "Best spots in Jakarta."}
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed whitespace-nowrap">
                  {locationTab === "hong-kong" 
                    ? "A collection of my favorite spots and activities in the city I call home."
                    : "A collection of my favorite spots in the city where I was born and raised."
                  }
                </p>
              </div>
            </div>
          </BlurFade>
          
          <LocationToggle 
            currentTab={locationTab} 
            onTabChange={setLocationTab}
            delay={BLUR_FADE_DELAY * 29}
          />
          
          {locationTab === "hong-kong" ? (
            <HongKongMap delay={BLUR_FADE_DELAY * 30} />
          ) : (
            <JakartaMap delay={BLUR_FADE_DELAY * 30} />
          )}
        </div>
      </section>

      <section id="world" className="mb-section-lg">
        <div className="space-y-content-lg">
          <BlurFade delay={BLUR_FADE_DELAY * 31}>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                World Map.
              </h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Countries I&apos;ve visited and want to visit.
              </p>
            </div>
          </div>
        </BlurFade>
          <WorldMap delay={BLUR_FADE_DELAY * 32} />
        </div>
      </section>

      <section id="contact" className="mb-section-lg">
        <ContactOrbiting delay={BLUR_FADE_DELAY * 33} />
      </section>
    </main>
  );
}
