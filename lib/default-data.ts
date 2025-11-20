// Define types for our website data
export interface PersonalInfo {
  name: string
  title: string
  bio: string
  location: string
  email: string
  phone: string
  photo: string
  qrCode: string
  linkedin?: string
  linkedinPostUrl?: string
}

export interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  description: string[]
  type: "professional" | "research"
}

export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  repoUrl?: string
  demoUrl?: string
  learnings?: string
}

export interface Skill {
  id: string
  name: string
  category: "programming" | "other"
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface WebsiteData {
  personalInfo: PersonalInfo
  experiences: Experience[]
  projects: Project[]
  skills: Skill[]
  languages: Language[]
}

// Default data
export const defaultData: WebsiteData = {
  personalInfo: {
    name: "Zhongquan Cheng",
    title: "M.S. in Computer Science at Washington University in St. Louis",
    bio: "I am a Master's student in Computer Science at Washington University in St. Louis, focusing on software engineering and data systems. With a background in backend development, data science, and mobile applications, I am passionate about building scalable, efficient systems and applying AI/ML to solve real-world problems.",
    location: "St. Louis, MO",
    email: "chengzhongquan0630@gmail.com",
    phone: "", // Not provided in resume snippet, leaving blank or removing
    photo: "/IMG_0782 2.JPG",
    qrCode: "",
    linkedin: "https://www.linkedin.com/in/zhongquan-cheng/",
    linkedinPostUrl: "", // Paste the embed URL for the exact LinkedIn post you want to feature
  },
  experiences: [
    {
      id: "exp1",
      title: "Backend Intern",
      company: "Undergraduation.com",
      startDate: "2025-09",
      endDate: "",
      current: true,
      description: [
        "Optimized database query performance by 45% through index optimization and query refactoring, reducing average response time from 2.3s to 1.2s",
        "Implemented RESTful API endpoints using Node.js and Express, enabling seamless integration between frontend and database",
        "Refactored legacy server code for improved scalability, applying OOP principles and microservices architecture",
        "Enhanced backend monitoring and logging systems, implementing automated alerts for system performance",
      ],
      type: "professional",
    },
    {
      id: "exp2",
      title: "Data Science Intern",
      company: "Asia Pulp & Paper Company",
      startDate: "2023-05",
      endDate: "2023-06",
      current: false,
      description: [
        "Demonstrated rapid learning by mastering company data infrastructure within first week",
        "Applied OOP principles to implement scalable ML models (XGBoost, Random Forest) achieving 92% accuracy in sales forecasting",
        "Enhanced data warehouse functionality through engineering best practices, improving extraction efficiency by 40%",
        "Collaborated across international teams to deliver projects within tight deadlines",
      ],
      type: "professional",
    },
    {
      id: "res1",
      title: "Graduate Researcher",
      company: "AI for Health Institute (Master's Project)",
      startDate: "2025",
      endDate: "",
      current: true,
      description: [
        "Working on computer vision applications for healthcare, specifically segmentation masks for overhead video patient analysis",
        "Designed and implemented a vision model pipeline (SAM) for robust mask generation",
        "Optimized pipeline for accuracy, stability, and real-time inference",
      ],
      type: "research",
    },
    {
      id: "res2",
      title: "Research Assistant",
      company: "Syracuse University (Depression Detection)",
      startDate: "2024-02",
      endDate: "",
      current: true,
      description: [
        "Developed Android application using Java/Kotlin for IMU sensor data collection and real-time processing",
        "Applied CNN/LSTM techniques for sensor-emotion correlation analysis, achieving 87% classification accuracy",
        "Collaborated with multidisciplinary team ensuring HIPAA compliance",
      ],
      type: "research",
    },
  ],
  projects: [
    {
      id: "proj1",
      title: "Engineering Course Scheduler",
      description:
        "Full-Stack Web Application built with React and Node.js. Implemented optimization algorithms for conflict-free schedule generation with prerequisite validation. Integrated university course catalog API and deployed on AWS.",
      tags: ["React", "Node.js", "AWS", "Algorithms"],
    },
    {
      id: "proj2",
      title: "ATS Application Tracker System",
      description:
        "Full-Stack Application with AI Integration using React, Node.js, and PostgreSQL with Gmail API integration. Won 2nd place at Syracuse Tech Challenge 2024 for AI-powered mental health screening tool components.",
      tags: ["React", "Node.js", "PostgreSQL", "Gmail API"],
    },
    {
      id: "proj3",
      title: "Depression Detection App",
      description:
        "Android application for IMU sensor data collection and real-time processing. Used for research in detecting depression through mobile sensor data.",
      tags: ["Android", "Java", "Kotlin", "Machine Learning"],
    },
  ],
  skills: [
    { id: "skill1", name: "Python", category: "programming" },
    { id: "skill2", name: "Java", category: "programming" },
    { id: "skill3", name: "JavaScript/Node.js", category: "programming" },
    { id: "skill4", name: "React", category: "programming" },
    { id: "skill5", name: "SQL/PostgreSQL", category: "programming" },
    { id: "skill6", name: "C/C++", category: "programming" },
    { id: "skill7", name: "Machine Learning", category: "other" },
    { id: "skill8", name: "AWS", category: "other" },
    { id: "skill9", name: "Git", category: "other" },
    { id: "skill10", name: "Docker", category: "other" },
  ],
  languages: [
    { id: "lang1", name: "English", level: "Fluent" },
    { id: "lang2", name: "Chinese (Mandarin)", level: "Native Speaker" },
  ],
}
