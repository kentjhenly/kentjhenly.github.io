import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Hailey Cheng",
  initials: "HC",
  url: "https://heilcheng.github.io",
  location: "Hong Kong",
  locationLink: "https://www.google.com/maps/place/hongkong",
  description:
    "Software Engineer with a focus on AI/ML, with experience building, deploying, and optimizing end-to-end AI systems.",
  summary:
    "Software Engineer with a focus on AI/ML, with experience building, deploying, and optimizing end-to-end AI systems. Proven ability to deliver high-performance solutions demonstrated through projects at Google DeepMind and in a fast-paced startup environment. Proficient in Python, PyTorch, Docker, and MLOps.",
  avatarUrl: "/me.jpeg",
  skills: [
    "Python",
    "PyTorch",
    "Docker",
    "MLOps",
    "TensorFlow",
    "Flask",
    "Next.js",
    "JavaScript",
    "MySQL",
    "Git",
    "Linux",
  ],
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
      X: {
        name: "X",
        url: "https://x.com/haileycheng",
        icon: Icons.x,
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

  work: [
    {
      company: "Google DeepMind",
      href: "https://deepmind.com",
      badges: ["Remote"],
      location: "Remote",
      title: "Google Summer of Code Participant",
      logoUrl: "/deepmind.jpg",
      start: "May 2025",
      end: "Present",
      description:
        "Engineered a scalable model evaluation platform using Python, PyTorch, and Docker, which improved benchmarking efficiency by 15% and supported parallel execution across 5+ academic test suites (e.g., MMLU, HumanEval). Designed and deployed a fully automated CI/CD pipeline with GitHub Actions to enforce 95% unit test coverage, guaranteeing reproducible, production-ready builds for a system.",
    },
    {
      company: "Coglix.ai",
      badges: ["Co-Founder"],
      href: "https://coglix.ai",
      location: "Hong Kong",
      title: "Co-Founder & Machine Learning Engineer",
      logoUrl: "",
      start: "November 2024",
      end: "Present",
      description:
        "AI-driven speech practice analysis platform for stroke patients. Engineered an end-to-end speech analysis platform using Python, PyTorch, and NLP libraries (Transformers, Librosa) to extract 15+ acoustic and prosodic features for generating personalized therapeutic metrics. Trained a custom deep learning model to over 90% accuracy for phoneme-level error detection and deployed the system as a low-latency REST API (Flask, Docker), achieving a sub-300ms response time for real-time feedback.",
    },
    {
      company: "City University of Hong Kong",
      href: "https://www.cityu.edu.hk",
      badges: ["Research"],
      location: "Hong Kong",
      title: "Undergraduate Researcher",
      logoUrl: "",
      start: "September 2024",
      end: "Present",
      description:
        "Thesis: Hybrid ODE-Neural Network for Personalized Treatment Prediction. Engineered a multi-task deep learning model in Python and PyTorch as a computationally efficient surrogate for a complex 15-state ODE system, reducing prediction latency from hours to milliseconds. Designed the neural network (98% AUC, 91.7% accuracy) and developed an end-to-end MLOps pipeline for data generation (N=1,000), training, and validation, achieving an R² of 0.78 on regression tasks.",
    },
  ],
  education: [
    {
      school: "City University of Hong Kong",
      href: "https://www.cityu.edu.hk",
      degree: "Bachelor of Science in Computing Mathematics (GREAT Stream), Minor in Computer Science",
      logoUrl: "",
      start: "2023",
      end: "2027",
    },
    {
      school: "University of California, Berkeley",
      href: "https://berkeley.edu",
      degree: "Exchange Student, Mathematics",
      logoUrl: "",
      start: "2024",
      end: "2024",
    },
  ],
  projects: [
    {
      title: "High-Performance Benchmarking & Evaluation Suite",
      href: "https://github.com/your-repo",
      dates: "May 2025 - Present",
      active: true,
      description:
        "Engineered a scalable model evaluation platform using Python, PyTorch, and Docker, which improved benchmarking efficiency by 15% and supported parallel execution across 5+ academic test suites (e.g., MMLU, HumanEval). Designed and deployed a fully automated CI/CD pipeline with GitHub Actions to enforce 95% unit test coverage.",
      technologies: [
        "Python",
        "PyTorch",
        "Docker",
        "GitHub Actions",
        "CI/CD",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/your-repo",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "MEQ-Bench - Resource-Efficient Medical AI Evaluation",
      href: "https://github.com/your-meq-repo",
      dates: "2024 - Present",
      active: true,
      description:
        "Developed MEQ-Bench, the first benchmark to evaluate audience-adaptive explanation quality in medical LLMs, by engineering a novel, resource-efficient framework in Python. Built a robust, automated scoring engine using an LLM-as-a-judge paradigm and NLP libraries (scispaCy), validating its reliability through high inter-rater reliability (Krippendorff's Alpha) between models.",
      technologies: [
        "Python",
        "NLP",
        "scispaCy",
        "LLM-as-a-judge",
        "Medical AI",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/your-meq-repo",
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
