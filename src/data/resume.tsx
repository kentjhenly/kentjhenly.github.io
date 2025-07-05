import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Hailey Cheng",
  initials: "HC",
  url: "https://heilcheng.github.io",
  location: "Hong Kong",
  locationLink: "https://www.google.com/maps/place/hongkong",
  description:
    "Researcher in mathematical biology and AI for biomedicine. Also a software engineer focused on AI/ML, building useful tools and fun apps with React Native. On the side, I share my journey as an influencer with 10k+ followers on Threads and 25k+ on LinkedIn.",
  summary:
    "I'm a curious human who builds things at the crossroads of math, code, and biology. When I'm not deep in code or wrestling with equations, you'll find me stargazing, kayaking, or on a mission to discover the next best bowl of ramen or plate of handmade pasta (I've probably tried every spot in Hong Kong). As for boba? My forever choice is \"No.1\" at Comebuytea.",
  avatarUrl: "/me.jpeg",

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "heilcheng2-c@my.cityu.edu.hk",
    tel: "+852-XXX-XXX-XXX",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/heilcheng",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://linkedin.com/in/hailey-cheng",
        icon: Icons.linkedin,
        navbar: true,
      },

      email: {
        name: "Send Email",
        url: "mailto:heilcheng2-c@my.cityu.edu.hk",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  technicalExperience: [
    {
      company: "Google DeepMind",
      href: "https://deepmind.com",
      badges: [],
      location: "Remote",
      title: "Google Summer of Code Participant",
      logoUrl: "/deepmind.jpg",
      start: "May 2025",
      end: "Present",
      bullets: [
        "Engineered a scalable model evaluation platform using Python, PyTorch, and Docker, which improved benchmarking efficiency by 15% and supported parallel execution across 5+ academic test suites (e.g., MMLU, HumanEval)",
        "Designed and deployed a fully automated CI/CD pipeline with GitHub Actions to enforce 95% unit test coverage, guaranteeing reproducible, production-ready builds for a system"
      ],
    },
    {
      company: "Coglix.ai",
      badges: [],
      href: "https://coglix.ai",
      location: "Hong Kong",
      title: "Co-Founder & Machine Learning Engineer",
      logoUrl: "/Coglix.png",
      start: "November 2024",
      end: "Present",
      bullets: [
        "Engineered an end-to-end speech analysis platform using Python, PyTorch, and NLP libraries (Transformers, Librosa) to extract 15+ acoustic and prosodic features for generating personalized therapeutic metrics",
        "Trained a custom deep learning model to over 90% accuracy for phoneme-level error detection and deployed the system as a low-latency REST API (Flask, Docker), achieving a sub-300ms response time for real-time feedback"
      ],
    },
    {
      company: "City University of Hong Kong",
      href: "https://www.cityu.edu.hk",
      badges: [],
      location: "Hong Kong",
      title: "Undergraduate Researcher",
      logoUrl: "/cityuhk.jpg",
      start: "September 2024",
      end: "Present",
      bullets: [
        "Thesis: Hybrid ODE-Neural Network for Personalized Treatment Prediction",
        "Engineered a multi-task deep learning model in Python and PyTorch as a computationally efficient surrogate for a complex 15-state ODE system, reducing prediction latency from hours to milliseconds",
        "Designed the neural network (98% AUC, 91.7% accuracy) and developed an end-to-end MLOps pipeline for data generation (N=1,000), training, and validation, achieving an R² of 0.78 on regression tasks"
      ],
    },
  ],
  education: [
    {
      school: "City University of Hong Kong",
      href: "https://www.cityu.edu.hk",
      degree: "Bachelor of Science in Computing Mathematics (GREAT Stream), Minor in Computer Science",
      logoUrl: "/cityuhk.jpg",
      start: "2023",
      end: "2027",
    },
    {
      school: "University of California, Berkeley",
      href: "https://berkeley.edu",
      degree: "Exchange Student, Mathematics",
      logoUrl: "/Berkeley.png",
      start: "2024",
      end: "2024",
    },
    {
      school: "Pearson Edexcel International A-Levels",
      href: "https://qualifications.pearson.com",
      degree: "3A* in Mathematics, Biology, Economics\nReceived offers from HKU, CUHK, KCL and Manchester",
      logoUrl: "/pearson.jpeg",
      start: "2022",
      end: "2023",
    },
  ],
  projects: [
    {
      title: "MEQ-Bench",
      href: "https://github.com/heilcheng/MEQ-Bench",
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
          href: "https://github.com/heilcheng/MEQ-Bench",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Gemma Benchmark Suite",
      href: "https://github.com/heilcheng/gemma-benchmark",
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
          href: "https://github.com/heilcheng/gemma-benchmark",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "DeepChem Drug Formulation Tutorial",
      href: "https://github.com/heilcheng/deepchem-drug-formulation",
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
          href: "https://github.com/heilcheng/deepchem-drug-formulation",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Truth or Dare (Cantonese)",
      href: "https://github.com/heilcheng/Truth-or-Dare-Canto",
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
          href: "https://github.com/heilcheng/Truth-or-Dare-Canto",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  hackathons: [
    {
      title: "Hong Kong Techathon+ 2025",
      dates: "2025",
      location: "Hong Kong",
      description:
        "Achieved Merit in Hong Kong Techathon+ 2025, demonstrating excellence in innovative technology solutions.",
      image: "",
      win: "Merit",
      links: [],
    },
    {
      title: "GenAI Hackathon for SDGs",
      dates: "2024",
      location: "Hong Kong",
      description:
        "Finalist in GenAI Hackathon for SDGs, organized by HKU, CityUHK, HKBU and HKUST, focusing on sustainable development goals through AI innovation.",
      image: "",
      win: "Finalist",
      links: [],
    },
    {
      title: "Hong Kong Techathon+ 2024",
      dates: "2024",
      location: "Hong Kong",
      description:
        "Finalist in Hong Kong Techathon+ 2024, showcasing technical skills and innovative thinking in a competitive environment.",
      image: "",
      win: "Finalist",
      links: [],
    },
  ],
} as const;
