import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon, ImageIcon } from "lucide-react";

export const DATA = {
  name: "Kent Justin Henly",
  initials: "KJH",
  url: "https://kentjhenly.github.io",
  location: "Hong Kong",
  locationLink: "https://www.google.com/maps/place/hongkong",
  description:
    "A rising junior currently studying Computer Science (specializing in Artificial Intelligence) and Business in The Chinese University of Hong Kong. I aspire to be the go-to guy connecting people with tech. On the side, I also have a heavy interest in public speaking and empowering people to speak.",
  summary:
    "At first glance I might seem like your average local Hong Konger, but I was actually born and raised in the hustle and bustle of Jakarta, Indonesia. You might not expect that place to be in any way similar to Hong Kong, but I grew up embracing the hearty commotion of the big city. I moved to Hong Kong when I turned 17 to pursue my studies, and it has been the highlight of my life. It taught me many life lessons on independence, time management, and cold hard work.\n\nBefore university, I was the kid who never needed to study maths. I didn't revise and would still get straight As. Maths was one of the only classes I would actually look forward to. It actually got to the point where I would ask my teacher for extra worksheets to do, and of course she ran out of them. I realized that Computer Science somewhere I can apply my interest in maths, and as someone who used to see computers as magic, I was eager to learn more about computers.\n\nAfter graduating high school, I moved thousands of miles away to pursue my studies, where I knew absolutely no one. I intentionally chose a city like Hong Kong where I had no friends or family, because when no one knows you, you are who you pretend to be, and I faked it till I made it. I somehow was able to reinvent myself, and I found my extroversion and my passion for public speaking, something that a few months prior I thought was impossible.\n\nThough after entering university, my extroversion shone through, and I felt like there was a whole other world that half of my peers was exploring, while most people in STEM majors like me ignored it. I realized that there weren't that many people in STEM who would love to communicate and work with others either in their career or day to day. Speaking to professionals only solidified my opinion, as they also struggled to find people who had both the technical and communication skills.\n\nI also realized after an internship that I loved to see how companies worked in the big picture, and how command flows through an organization of thousands and somehow, each person contributes to a system that they may not understand, but it still delivers service smoothly. This is the reason why I started my minor in Business.\n\nAnd so, here I am, merging my interests for the magic of computers, the warmth of connections and people, and the complexity and efficiency of businesses. I hope that I can encourage people that are just like me back then to conquer their fears of speaking out and being heard.\n\nSo that's basically my life story (haha). On a lighter note, when I'm not dialed in my work, you can find me writing articles or taking pictures with my digital camera. I'm all around, trying new things at new places. The only thing you can call me is all over the place. So that's that. Thanks for reading!",
  avatarUrl: "/me.jpg",

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/showcase", icon: ImageIcon, label: "Gallery" },
  ],
  contact: {
    email: "kentjustinhenly@gmail.com",
    tel: "+852 9485 3889",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/kentjhenly",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/kent-justin-henly-a286322a9",
        icon: Icons.linkedin,
        navbar: true,
      },

      email: {
        name: "Send Email",
        url: "mailto:kentjhenly@proton.me",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  technicalExperience: [
    {
      company: "Grab",
      href: "https://grab.com",
      badges: [],
      location: "Jakarta, Indonesia",
      title: "Demand Analyst Intern",
      logoUrl: "/Grab.png",
      start: "July 2025",
      end: "Present",
      bullets: [
        "Delivered an exec-worthy deck tied to business KPIs based on findings and action items",
        "Optimized merchant marketing campaign efficacy by analyzing 40k sign-ups by diff-in-diff",
        "Processed mobility metrics across 5 different verticals to diagnose weekly demand trends"
      ],
    },
    {
      company: "Merdeka Copper Gold",
      badges: [],
      href: "#",
      location: "Jakarta, Indonesia",
      title: "Web Development Intern",
      logoUrl: "/Merdeka Copper Gold.jpg",
      start: "July 2024",
      end: "August 2024",
      bullets: [
        "Created an online approval form workflow that sends updates and notices into inboxes",
        "Reduced approval time by automating SQL-based data entry with database of 500 employees",
        "Built login systems within a Laravel framework through PHP utilizing CRUD operations"
      ],
    },
  ],
  organizationalExperience: [
    {
      company: "The Chinese University of Hong Kong",
      href: "https://www.cuhk.edu.hk",
      badges: [],
      location: "Hong Kong",
      title: "Campus Recruitment Ambassador",
      logoUrl: "/CUHK.png",
      start: "September 2025",
      end: "Present",
      bullets: [
        "More coming soon!"
      ],
    },
    {
      company: "Toastmasters International District 89",
      href: "#",
      badges: [],
      location: "Hong Kong",
      title: "Program Quality Officer",
      logoUrl: "/Toastmasters.jpg",
      start: "June 2025",
      end: "Present",
      bullets: [
        "Collaborated with Program Quality Committee responsible for 64 clubs in GBA region",
        "Led 4 outreach campaigns to promote District 89 programs and workshops",
        "Worked on strategies to increase club membership and engagement in District 89 clubs"
      ],
    },
    {
      company: "Chung Chi College Toastmasters Club",
      badges: [],
      href: "#",
      location: "Hong Kong",
      title: "Vice President of Public Relations",
      logoUrl: "/Chung Chi.png",
      start: "September 2024",
      end: "May 2025",
      bullets: [
        "Won 2nd place runner up award for Table Topics Area Competition",
        "Hosted a storytelling and public speaking workshop to uplift foreign domestic workers",
        "Contacted 200 potential guests to fill 30 total guest roles for club visitation",
        "Collaborated with Executive Committee to increase number of memberships by 20%"
      ],
    },
  ],
  education: [
    {
      school: "The Chinese University of Hong Kong",
      href: "https://www.cuhk.edu.hk",
      degree: "Bachelor of Science in Computer Science (specializing in AI), Minor in Business",
      logoUrl: "/CUHK.png",
      start: "2023",
      end: "2027",
    },
  ],
  projects: [
    {
      title: "MEQ-Bench",
      href: "https://github.com/kentjhenly/MEQ-Bench",
      dates: "2024 - Present",
      active: true,
      description:
        "The first benchmark designed to evaluate an LLM's ability to generate audience-adaptive medical explanations for diverse stakeholders, including physicians, nurses, and patients.",
      technologies: [
        "Python",
        "LLM",
        "Medical AI",
        "Benchmarking",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/kentjhenly/MEQ-Bench",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Gemma Benchmark Suite",
      href: "https://github.com/kentjhenly/gemma-benchmark",
      dates: "2024 - Present",
      active: true,
      description:
        "An evaluation suite for Google's Gemma models across academic LLM benchmarks, with quantization support and efficiency profiling.",
      technologies: [
        "Python",
        "LLM",
        "Benchmarking",
        "Quantization",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/kentjhenly/gemma-benchmark",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "DeepChem Drug Formulation Tutorial",
      href: "https://github.com/kentjhenly/deepchem-drug-formulation",
      dates: "2024 - Present",
      active: true,
      description:
        "A tutorial using DeepChem for predicting key pharmaceutical properties and visualizing molecular behaviors for drug discovery.",
      technologies: [
        "Python",
        "DeepChem",
        "Drug Discovery",
        "Molecular Biology",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/kentjhenly/deepchem-drug-formulation",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Truth or Dare (Cantonese)",
      href: "https://github.com/kentjhenly/Truth-or-Dare-Canto",
      dates: "2024 - Present",
      active: true,
      description:
        "A Truth or Dare question generator web app built in Cantonese, using React for webapp and React Native for Apps.",
      technologies: [
        "React",
        "React Native",
        "JavaScript",
        "Cantonese",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/kentjhenly/Truth-or-Dare-Canto",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  entertainment: {
    movies: [
      {
        title: "Arrival",
        creator: "Denis Villeneuve",
        year: "2016",
        number: 1,
      },
      {
        title: "Everything Everywhere All at Once",
        creator: "Daniels",
        year: "2022",
        number: 2,
      },
      {
        title: "Sore: Wife from the Future",
        creator: "Yandy Laurens",
        year: "2024",
        number: 3,
      },
      {
        title: "Falling in Love Like in Movies",
        creator: "Yandy Laurens",
        year: "2024",
        number: 4,
      },
      {
        title: "How to Make Millions Before Grandma Dies",
        creator: "Pat Boonnitipat",
        year: "2024",
        number: 5,
      },
      {
        title: "Parasite",
        creator: "Bong Joon-ho",
        year: "2019",
        number: 6,
      },
      {
        title: "Chungking Express",
        creator: "Wong Kar-wai",
        year: "1994",
        number: 7,
      },
      {
        title: "Perfect Days",
        creator: "Wim Wenders",
        year: "2023",
        number: 8,
      },
      {
        title: "Conclave",
        creator: "Edward Berger",
        year: "2024",
        number: 9,
      },
      {
        title: "Look Back",
        creator: "Kiyotaka Oshiyama",
        year: "2024",
        number: 10,
      },
    ],
    shows: [
      {
        title: "Severance",
        creator: "Dan Erickson",
        year: "2022",
        number: 1,
      },
      {
        title: "The Rehearsal",
        creator: "Nathan Fielder",
        year: "2022",
        number: 2,
      },
      {
        title: "The Good Place",
        creator: "Michael Schur",
        year: "2016-2020",
        number: 3,
      },
      {
        title: "Succession",
        creator: "Jesse Armstrong",
        year: "2018-2023",
        number: 4,
      },
      {
        title: "Avatar: The Last Airbender",
        creator: "Michael Dante DiMartino & Bryan Konietzko",
        year: "2005-2008",
        number: 5,
      },
      {
        title: "Delicious in Dungeon",
        creator: "Ryōko Kui",
        year: "2024",
        number: 6,
      },
      {
        title: "Signal",
        creator: "Kim Eun-hee",
        year: "2016",
        number: 7,
      },
      {
        title: "Nichijou",
        creator: "Keiichi Arawi",
        year: "2011-2012",
        number: 8,
      },
      {
        title: "Smiling Friends",
        creator: "Michael Cusack & Zach Hadel",
        year: "2020",
        number: 9,
      },
      {
        title: "The Amazing World of Gumball",
        creator: "Ben Bocquelet",
        year: "2011-2019",
        number: 10,
      },
    ],
    music: [
      {
        title: "To Pimp a Butterfly",
        creator: "Kendrick Lamar",
        year: "2015",
        number: 1,
      },
      {
        title: "OK Computer",
        creator: "Radiohead",
        year: "1997",
        number: 2,
      },
      {
        title: "Blonde",
        creator: "Frank Ocean",
        year: "2016",
        number: 3,
      },
      {
        title: "Random Access Memories",
        creator: "Daft Punk",
        year: "2013",
        number: 4,
      },
      {
        title: "Currents",
        creator: "Tame Impala",
        year: "2015",
        number: 5,
      },
      {
        title: "My Beautiful Dark Twisted Fantasy",
        creator: "Kanye West",
        year: "2010",
        number: 6,
      },
      {
        title: "Channel Orange",
        creator: "Frank Ocean",
        year: "2012",
        number: 7,
      },
      {
        title: "Discovery",
        creator: "Daft Punk",
        year: "2001",
        number: 8,
      },
      {
        title: "In Rainbows",
        creator: "Radiohead",
        year: "2007",
        number: 9,
      },
      {
        title: "good kid, m.A.A.d city",
        creator: "Kendrick Lamar",
        year: "2012",
        number: 10,
      },
    ],
  },
} as const;
