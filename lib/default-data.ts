export interface PersonalInfo {
  name: string
  title: string
  bio: string
  location: string
  email: string
  phone: string
  photo: string
  linkedin?: string
  github?: string
}

export interface Experience {
  id: string
  title: string
  company: string
  location?: string
  startDate: string
  endDate: string
  current: boolean
  description: string[]
  type: "professional" | "research"
}

export interface Project {
  id: string
  title: string
  subtitle?: string
  year?: string
  description: string
  tags: string[]
  repoUrl?: string
  demoUrl?: string
  diagram?: "scheduler" | "ats" | "imu" | "vr"
}

export interface Skill {
  id: string
  name: string
  category: "languages" | "ml" | "mobile" | "tools"
}

export interface Education {
  id: string
  school: string
  degree: string
  location: string
  startDate: string
  endDate: string
  notes?: string
}

export interface Award {
  id: string
  title: string
  organization: string
  year: string
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface WebsiteData {
  personalInfo: PersonalInfo
  education: Education[]
  experiences: Experience[]
  projects: Project[]
  skills: Skill[]
  awards: Award[]
  languages: Language[]
}

export const defaultData: WebsiteData = {
  personalInfo: {
    name: "Zhongquan Cheng",
    title: "Analyst · Technology Transformation",
    // Prefer lib/role.deloitteBio() for date-aware copy on the site.
    bio: "Analyst 1 at Deloitte (Technology Transformation) in Shanghai — previously building backends and applied ML at WashU and Undergraduation.com. My work sits between reliable engineering and research: server optimization, sensor pipelines, and computer-vision segmentation for health.",
    location: "Shanghai",
    email: "chengzhongquan0630@gmail.com",
    phone: "+1 (315) 317-5618",
    photo: "/assets/peteros/avatar.webp",
    linkedin: "https://www.linkedin.com/in/zhongquan-cheng/",
    github: "https://github.com/petercheng123321",
  },
  education: [
    {
      id: "edu1",
      school: "Washington University in St. Louis",
      degree: "M.S. in Computer Science",
      location: "St. Louis, MO",
      startDate: "2025-08",
      endDate: "2027-05",
      notes: "Expected · Focus: Software Engineering, Data Systems, Applied ML",
    },
    {
      id: "edu2",
      school: "Syracuse University",
      degree: "B.S. in Computer Science",
      location: "Syracuse, NY",
      startDate: "2021-09",
      endDate: "2025-05",
    },
  ],
  experiences: [
    {
      id: "exp0",
      title: "Analyst 1 · Technology Transformation",
      company: "Deloitte",
      location: "Shanghai, China",
      startDate: "2026-08-14",
      endDate: "",
      current: true,
      description: [
        // First bullet is rewritten at display time via deloitteExperienceLead().
        "Full-time Analyst 1 on the Technology Transformation practice in Shanghai.",
        "Focus: helping clients modernize systems, deliver technology-enabled change, and ship reliable digital outcomes.",
        "Bringing backend engineering, applied ML, and research experience into consulting delivery.",
      ],
      type: "professional",
    },
    {
      id: "exp1",
      title: "Backend Engineering Intern",
      company: "Undergraduation.com",
      location: "Remote",
      startDate: "2025-09",
      endDate: "2026",
      current: false,
      description: [
        "Cut average API response time from 2.3s to 1.2s (45%) by refactoring queries and adding composite indexes on hot paths.",
        "Built RESTful endpoints in Node.js / Express for the student-profile and application-tracking flows.",
        "Modernized legacy server modules toward a cleaner OOP / service-oriented layout, reducing coupling between domains.",
        "Instrumented backend logging and set up automated alerts for latency and error-rate regressions.",
      ],
      type: "professional",
    },
    {
      id: "exp2",
      title: "Data Science Intern",
      company: "Asia Pulp & Paper",
      location: "Shanghai, China",
      startDate: "2023-05",
      endDate: "2023-06",
      current: false,
      description: [
        "Ramped on the Qingfeng data warehouse in the first week and shipped weekly sales trend analyses to business stakeholders.",
        "Built sales forecasting models (XGBoost, Random Forest) reaching 92% accuracy on held-out weeks.",
        "Proposed warehouse-side ETL changes that improved downstream extraction efficiency by ~40%.",
      ],
      type: "professional",
    },
    {
      id: "res1",
      title: "Graduate Researcher",
      company: "AI for Health Institute · WashU",
      location: "St. Louis, MO",
      startDate: "2025-08",
      endDate: "",
      current: true,
      description: [
        "Building a segmentation pipeline on overhead patient video for downstream behavioral analysis.",
        "Adapted SAM-based vision models for robust mask generation under occlusion and low-light conditions.",
        "Tuning the pipeline for real-time inference while preserving mask stability across frames.",
      ],
      type: "research",
    },
    {
      id: "res2",
      title: "Research Assistant",
      company: "Syracuse University · Salekin Lab",
      location: "Syracuse, NY",
      startDate: "2024-02",
      endDate: "2025-05",
      current: false,
      description: [
        "Shipped an Android app (Kotlin/Java) collecting IMU and audio data from consented participants for a depression-detection study.",
        "Trained CNN / LSTM models on sensor streams, reaching 87% classification accuracy on the labeled cohort.",
        "Partnered with the clinical team to ensure HIPAA-aligned data handling and storage.",
      ],
      type: "research",
    },
    {
      id: "res3",
      title: "VR Game Developer, Team Lead",
      company: "Syracuse University Library VR Project",
      location: "Syracuse, NY",
      startDate: "2022-09",
      endDate: "2024-05",
      current: false,
      description: [
        "Led a 3-person team building a Unity / C# VR experience to teach students how to navigate library resources.",
        "Implemented gesture recognition, shader-based visual effects, and the interactive scene graph.",
        "Delivered a working prototype used in a pilot with undergraduate library tours.",
      ],
      type: "research",
    },
  ],
  projects: [
    {
      id: "proj1",
      title: "Engineering Course Scheduler",
      subtitle: "Full-stack · React, Node, AWS",
      year: "2024",
      description:
        "A scheduling tool that reads the university course catalog, validates prerequisites, and generates conflict-free timetables. Written in React + Node, deployed on AWS.",
      tags: ["React", "Node.js", "AWS", "Algorithms"],
      diagram: "scheduler",
    },
    {
      id: "proj2",
      title: "ATS — Application Tracker",
      subtitle: "AI-assisted application screening",
      year: "2024",
      description:
        "Full-stack tracker with Gmail API ingestion and AI-powered triage. Won 2nd place at Syracuse Tech Challenge 2024 for an AI mental-health screening component built on top.",
      tags: ["React", "Node.js", "PostgreSQL", "Gmail API"],
      diagram: "ats",
    },
    {
      id: "proj3",
      title: "IMU Depression-Signal Collector",
      subtitle: "Android · sensor + audio pipeline",
      year: "2024",
      description:
        "Android app collecting IMU and audio streams on a schedule, with on-device buffering and secure upload. Used as the data-collection layer for the Salekin Lab depression-detection research.",
      tags: ["Android", "Kotlin", "Java", "Signal Processing"],
      diagram: "imu",
    },
    {
      id: "proj4",
      title: "Library VR",
      subtitle: "Unity · C# · gesture recognition",
      year: "2023",
      description:
        "A VR onboarding experience that walks students through library stacks and digital resources. Built in Unity with custom gesture recognition and interactive scene scripting.",
      tags: ["Unity", "C#", "VR"],
      diagram: "vr",
    },
  ],
  skills: [
    { id: "s1", name: "Python", category: "languages" },
    { id: "s2", name: "Java", category: "languages" },
    { id: "s3", name: "JavaScript / TypeScript", category: "languages" },
    { id: "s4", name: "C / C++", category: "languages" },
    { id: "s5", name: "C#", category: "languages" },
    { id: "s6", name: "R", category: "languages" },
    { id: "s7", name: "SQL", category: "languages" },

    { id: "s8", name: "PyTorch", category: "ml" },
    { id: "s9", name: "scikit-learn", category: "ml" },
    { id: "s10", name: "pandas / NumPy", category: "ml" },
    { id: "s11", name: "XGBoost", category: "ml" },
    { id: "s12", name: "SARIMAX", category: "ml" },
    { id: "s13", name: "SAM / Segmentation", category: "ml" },
    { id: "s14", name: "MFCC / FFT", category: "ml" },

    { id: "s15", name: "Android (Kotlin / Java)", category: "mobile" },
    { id: "s16", name: "Unity", category: "mobile" },

    { id: "s17", name: "Node.js / Express", category: "tools" },
    { id: "s18", name: "React / Next.js", category: "tools" },
    { id: "s19", name: "PostgreSQL", category: "tools" },
    { id: "s20", name: "AWS", category: "tools" },
    { id: "s21", name: "Docker", category: "tools" },
    { id: "s22", name: "Git", category: "tools" },
  ],
  awards: [
    {
      id: "a1",
      title: "2nd Place · Syracuse Tech Challenge",
      organization: "AI for Mental Health track",
      year: "2024",
    },
    {
      id: "a2",
      title: "Senior Workshop Lead",
      organization: "CuseHacks — Syracuse's annual hackathon",
      year: "2023–2025",
    },
  ],
  languages: [
    { id: "l1", name: "English", level: "Fluent" },
    { id: "l2", name: "Mandarin Chinese", level: "Native" },
  ],
}
