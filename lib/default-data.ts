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
    title: "Computer Science Student at Syracuse University",
    bio: "I'm a Computer Science student passionate about data science, application development, and research. With experience in various programming languages and technologies, I've worked on projects ranging from VR game development to machine learning applications. Currently pursuing opportunities in software engineering and data science.",
    location: "St. Louis, Missouri",
    email: "z.cheng@wustl.edu",
    phone: "315-317-5618",
    photo: "/IMG_0782 2.JPG",
    qrCode: "",
  },
  experiences: [
    {
      id: "exp1",
      title: "Data Science Intern",
      company: "Asia Pulp & Paper Co.",
      startDate: "2023-05",
      endDate: "2023-06",
      current: false,
      description: [
        "Analyzed weekly sales using data collected from Qingfeng data warehouse",
        "Suggested improvements for data warehouse functionality to enhance data extraction efficiency and accuracy",
        "Used machine learning model to forecast next week's sales",
      ],
      type: "professional",
    },
    {
      id: "exp2",
      title: "Research Assistant",
      company: "Ubiquitous and Intelligent Sensing Lab",
      startDate: "2024-02",
      endDate: "",
      current: true,
      description: [
        "Developed an app that specifically reads data; record sensor fluctuations while enabling audio recording to collect experimental data",
        "Analyze the data to determine if there is a correlation between the sensor and emotion",
        "Plan to develop a model to predict these fluctuations",
      ],
      type: "research",
    },
    {
      id: "exp3",
      title: "Game Developer & Team Leader",
      company: "Library VR Education Game Design",
      startDate: "2022-09",
      endDate: "",
      current: true,
      description: [
        "Prepared and revised initial game sketches using Unity",
        "Set weekly goals for our 3-member team",
        "Responsible for the structure and the interior design of the Library VR Education Game",
        "Used C# to complete backend design with features such as graphical effects, gesture recognition, and pull gates in game scenes",
      ],
      type: "research",
    },
  ],
  projects: [
    {
      id: "proj1",
      title: "Android App Development",
      description:
        "Developed a health and fitness tracking application that encourages people to go outside and stay active at a sustainable pace that is fun and engaging.",
      tags: ["Android", "Java", "Fitness"],
    },
    {
      id: "proj2",
      title: "Syracuse Hackathon",
      description:
        "Developed a website that can recognize emotions through facial image analysis. Worked with another team member to complete the website design and programming.",
      tags: ["Web Development", "AI", "Facial Recognition"],
    },
    {
      id: "proj3",
      title: "WeChat Chatbot",
      description:
        "Used CNN network to develop a WeChat chatbot at Tsinghua University Computer Science Winter Camp. Understood how tensorflow works in Python.",
      tags: ["Python", "TensorFlow", "CNN"],
    },
    {
      id: "proj4",
      title: "Machine Learning Project",
      description:
        "Implemented various machine learning algorithms including linear regression, logistic regression, and neural networks for data analysis and prediction tasks.",
      tags: ["Python", "Machine Learning", "Data Analysis"],
    },
  ],
  skills: [
    { id: "skill1", name: "Python", category: "programming" },
    { id: "skill2", name: "Java", category: "programming" },
    { id: "skill3", name: "R", category: "programming" },
    { id: "skill4", name: "C#", category: "programming" },
    { id: "skill5", name: "HTML/CSS", category: "programming" },
    { id: "skill6", name: "JavaScript", category: "programming" },
    { id: "skill7", name: "SQL", category: "programming" },
    { id: "skill8", name: "Unity", category: "other" },
    { id: "skill9", name: "Data Analysis", category: "other" },
    { id: "skill10", name: "Machine Learning", category: "other" },
    { id: "skill11", name: "Statistical Analysis", category: "other" },
    { id: "skill12", name: "Git", category: "other" },
  ],
  languages: [
    { id: "lang1", name: "English", level: "Fluent" },
    { id: "lang2", name: "Chinese (Mandarin)", level: "Native Speaker" },
  ],
}
