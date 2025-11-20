"use client"

import React, { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  ArrowUpRight,
  Terminal,
  Code,
  Database,
  Server,
  Cpu,
  Braces,
  FileCode,
  Globe,
  Send,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Menu
} from "lucide-react"
import Link from "next/link"
import { defaultData } from "@/lib/default-data"

// Skill icons mapping
const skillIcons: Record<string, React.ReactNode> = {
  Python: <FileCode className="h-8 w-8" />,
  Java: <Code className="h-8 w-8" />,
  R: <Database className="h-8 w-8" />,
  "C#": <Braces className="h-8 w-8" />,
  "HTML/CSS": <Code className="h-8 w-8" />,
  JavaScript: <Code className="h-8 w-8" />,
  SQL: <Database className="h-8 w-8" />,
  Unity: <Globe className="h-8 w-8" />,
  "Data Analysis": <Server className="h-8 w-8" />,
  "Machine Learning": <Cpu className="h-8 w-8" />,
  "Statistical Analysis": <Cpu className="h-8 w-8" />,
  Git: <Terminal className="h-8 w-8" />,
}

export default function Home() {
  const data = defaultData
  const [activeSection, setActiveSection] = useState("hero")
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    experience: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    skills: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  }

  const heroHighlights = [
    { id: "research", label: "AI Research", value: "AI for Health Institute", desc: "Graduate Researcher" },
  ]

  const heroStats = [
    { id: "stack", title: "Full Stack", metric: "React · Node · SQL", icon: Code },
    { id: "vision", title: "Vision Research", metric: "Sensors · ML", icon: Cpu },
  ]

  const linkedinProfileUrl = data.personalInfo.linkedin || "https://www.linkedin.com/in/zhongquan-cheng/"

  // Mouse follow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Intersection observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: 0.1 },
    )

    Object.values(sectionRefs).forEach((ref) => ref.current && observer.observe(ref.current))

    return () => observer.disconnect()
  }, [])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormSubmitting(true)

    setTimeout(() => {
      setIsFormSubmitting(false)
      setFormSuccess(true)
      setFormData({ name: "", email: "", message: "" })
      setTimeout(() => setFormSuccess(false), 5000)
    }, 1500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30 relative">
      
      {/* Cursor Glow Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(14, 165, 233, 0.1), transparent 80%)`,
        }}
      />
      <div className="fixed inset-0 bg-animated-mesh -z-10" />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-end pointer-events-none">
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 glass-panel rounded-full px-2 py-2 pointer-events-auto">
          {["About", "Experience", "Projects", "Skills", "Contact"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                activeSection === item.toLowerCase() 
                  ? "bg-white/10 text-white shadow-lg scale-105 backdrop-blur-md" 
                  : "hover:bg-white/5 hover:text-primary text-muted-foreground"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden pointer-events-auto">
           <Button 
            size="icon" 
            variant="outline" 
            className="rounded-full bg-background/50 backdrop-blur-md border-white/10"
            onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
           >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div id="mobile-menu" className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl hidden md:hidden flex-col items-center justify-center space-y-8 animate-in fade-in duration-200">
         {["About", "Experience", "Projects", "Skills", "Contact"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-2xl font-bold hover:text-primary transition-colors"
              onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
            >
              {item}
            </Link>
          ))}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-6 right-6 rounded-full"
            onClick={() => document.getElementById('mobile-menu')?.classList.add('hidden')}
          >
            <span className="text-2xl">×</span>
          </Button>
      </div>

      {/* Hero Section */}
      <section id="hero" ref={sectionRefs.hero} className="relative min-h-screen z-10 overflow-hidden pt-32 pb-20">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />

        <div className="container flex flex-col justify-center gap-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center w-full relative">
          {/* Intro copy */}
          <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
            <div className="hero-pill inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              OPEN FOR COLLABORATION · ST. LOUIS, MO
            </div>

            <div className="space-y-4">
              <h1 className="hero-title">
                <span>ZHONGQUAN</span>
                <span>CHENG</span>
              </h1>
              <p className="hero-subtitle max-w-2xl mx-auto lg:mx-0">
                Master's student pushing the boundaries of full-stack engineering, machine learning, and human-centered product design.
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                From backend optimization at Undergraduation.com to emotion-aware sensor research at Syracuse, I blend rigorous engineering with a creative eye for interaction.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.id} className="hero-highlight-card">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary/80">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  {item.desc && <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="#projects" className="btn-liquid-primary h-14 px-8 text-lg group w-full sm:w-auto">
                View Projects
                <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link href="#contact" className="btn-liquid h-14 px-8 text-lg w-full sm:w-auto">
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Photo + stat cards */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <div className="hero-photo-container">
              <div className="hero-photo-glow" />
              <div className="hero-photo-frame">
                {data.personalInfo.photo ? (
                  <img src={data.personalInfo.photo} alt={data.personalInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-muted-foreground">
                    Add your photo
                  </div>
                )}
              </div>

              {heroStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.id}
                    className={`hero-floating-card ${index === 0 ? "hero-floating-card--top" : "hero-floating-card--bottom"}`}
                  >
                    <div className="hero-floating-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="font-semibold text-white">{stat.metric}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

        <div className="hero-scroll-indicator">
          <div className="hero-scroll-dot" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={sectionRefs.about} className="container py-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="relative p-8 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-sm shadow-[0_0_50px_-10px_rgba(14,165,233,0.1)]">
               <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary">
                      <Terminal className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold">Bio</h3>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {data.personalInfo.bio}
                  </p>
                  <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <MapPin className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{data.personalInfo.location}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <Mail className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold break-all text-sm">{data.personalInfo.email}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h2 className="text-headline">
              <span className="text-primary">About</span> Me
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Backend Developer and Data Science enthusiast with a knack for optimizing systems and building intelligent applications.
            </p>
            <div className="flex gap-4">
               <a href="#" className="group flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors">
                  <Github className="w-6 h-6" /> Github <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
               </a>
               <a href={linkedinProfileUrl} target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-lg font-bold hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" /> LinkedIn <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
               </a>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" ref={sectionRefs.experience} className="container py-32 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-headline">Experience</h2>
            <p className="text-muted-foreground max-w-md">
              My professional journey and research contributions in the field of Computer Science.
            </p>
          </div>
        </div>

        <Tabs defaultValue="professional" className="w-full">
          <div className="mb-12">
            <TabsList className="bg-card/50 border border-white/10 p-1 rounded-full backdrop-blur-md w-full md:w-auto grid grid-cols-2 md:flex">
              <TabsTrigger value="professional" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Professional</TabsTrigger>
              <TabsTrigger value="research" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Research</TabsTrigger>
            </TabsList>
          </div>

            {/* Render content for both tabs - visibility controlled by TabsContent default behavior */}
             {["professional", "research"].map((type) => (
              <TabsContent key={type} value={type} className="space-y-8 mt-0">
                 <div className="relative border-l-2 border-white/10 ml-4 md:ml-12 space-y-12 pl-8 md:pl-12 py-4">
                    {data.experiences
                      .filter(exp => exp.type === type)
                      .map((exp, index) => (
                        <div key={exp.id} className="relative group">
                           <div className="absolute -left-[41px] md:-left-[59px] top-0 p-2 bg-background border-2 border-white/10 rounded-full group-hover:border-primary group-hover:scale-110 transition-all duration-300 z-10">
                              <Zap className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                           </div>
                           <div className="space-y-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <h3 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors">{exp.title}</h3>
                                <span className="text-sm font-mono text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5 w-fit whitespace-nowrap">
                                  {exp.startDate} — {exp.endDate || "Present"}
                                </span>
                              </div>
                              <div className="text-xl text-accent font-medium">{exp.company}</div>
                              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                                {exp.description.map((item, i) => (
                                  <li key={i} className="leading-relaxed pl-2 marker:text-primary/50">
                                    <span className="-ml-2">{item}</span>
                                  </li>
                                ))}
                              </ul>
                           </div>
                        </div>
                      ))}
                 </div>
              </TabsContent>
             ))}
        </Tabs>
      </section>

      {/* Projects Section */}
      <section id="projects" ref={sectionRefs.projects} className="container py-32 relative z-10">
         <div className="mb-20 space-y-4 text-center md:text-left">
            <h2 className="text-display text-center">SELECTED <span className="text-gradient-bold">WORKS</span></h2>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.projects.map((project, index) => (
              <div 
                key={project.id}
                className="group relative rounded-3xl bg-card border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Decorative Background for Project Card */}
                <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10 group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"></div>
                
                <div className="relative z-20 p-8 h-full flex flex-col justify-end min-h-[400px]">
                   <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-between">
                         <div className="p-2 bg-primary/20 rounded-lg backdrop-blur-md text-white">
                            <Layers className="w-6 h-6" />
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            {project.repoUrl && (
                              <a href={project.repoUrl} className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                              </a>
                            )}
                            {project.demoUrl && (
                              <a href={project.demoUrl} className="p-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition-colors">
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                         </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white">{project.title}</h3>
                      <p className="text-gray-300 line-clamp-3 group-hover:line-clamp-none transition-all">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 pt-4">
                        {project.tags.map(tag => (
                          <span key={tag} className="project-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            ))}
         </div>
      </section>

      {/* Skills Section */}
      <section id="skills" ref={sectionRefs.skills} className="py-32 bg-card/30 border-y border-white/5 relative z-10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
             <div className="space-y-8">
                <h2 className="text-headline">Technical <span className="text-primary">Arsenal</span></h2>
                <p className="text-lg text-muted-foreground">
                  A comprehensive list of technologies and tools I've worked with throughout my academic and professional career.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {data.skills.slice(0, 6).map(skill => (
                    <div key={skill.id} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-background border border-white/5 hover:border-primary/50 hover:shadow-[0_0_20px_-5px_rgba(14,165,233,0.3)] transition-all duration-300 group">
                       <div className="text-muted-foreground group-hover:text-primary transition-colors mb-3 transform group-hover:scale-110 duration-300">
                         {skillIcons[skill.name] || <Code className="h-8 w-8" />}
                       </div>
                       <span className="font-medium text-sm text-center">{skill.name}</span>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 grid gap-6">
                   <div className="p-8 rounded-3xl bg-background/50 backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-colors">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        Key Competencies
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {data.skills.map(skill => (
                          <Badge key={skill.id} variant="secondary" className="px-3 py-1.5 text-sm bg-white/5 hover:bg-primary hover:text-white transition-colors cursor-default">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                   </div>
                   
                   <div className="p-8 rounded-3xl bg-background/50 backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-colors">
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-accent" />
                        Languages
                      </h3>
                      <div className="space-y-4">
                        {data.languages.map(lang => (
                          <div key={lang.id} className="flex justify-between items-center">
                            <span className="font-medium">{lang.name}</span>
                            <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full">{lang.level}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={sectionRefs.contact} className="container py-32 relative z-10">
        <div className="max-w-4xl mx-auto">
           <div className="text-center space-y-6 mb-16">
              <h2 className="text-display">Let's <span className="text-primary">Talk</span></h2>
              <p className="text-xl text-muted-foreground">Have a project in mind? Looking for a developer? Let's create something amazing together.</p>
           </div>

           <div className="grid md:grid-cols-5 gap-8">
              <Card className="md:col-span-2 bg-primary text-primary-foreground border-none overflow-hidden relative shadow-2xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                 <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                    <div className="space-y-8">
                       <div>
                          <h3 className="text-xl font-bold mb-2">Contact Info</h3>
                          <p className="opacity-90">Fill up the form and I will get back to you within 24 hours.</p>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <Phone className="w-5 h-5" />
                             <span>{data.personalInfo.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <Mail className="w-5 h-5" />
                             <span className="break-all text-sm">{data.personalInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <MapPin className="w-5 h-5" />
                             <span>{data.personalInfo.location}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-4 pt-8">
                       <a href="#" className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-primary transition-colors">
                          <Github className="w-5 h-5" />
                       </a>
                       <a href={linkedinProfileUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/20 rounded-full hover:bg-white hover:text-primary transition-colors">
                          <Linkedin className="w-5 h-5" />
                       </a>
                    </div>
                 </CardContent>
              </Card>

              <Card className="md:col-span-3 bg-card border-white/10 shadow-2xl">
                 <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                       <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label htmlFor="name" className="text-sm font-medium">Name</label>
                             <input 
                                id="name" 
                                name="name"
                                value={formData.name} 
                                onChange={handleInputChange} 
                                className="w-full bg-background/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="John Doe"
                                required
                             />
                          </div>
                          <div className="space-y-2">
                             <label htmlFor="email" className="text-sm font-medium">Email</label>
                             <input 
                                id="email" 
                                name="email" 
                                type="email"
                                value={formData.email} 
                                onChange={handleInputChange} 
                                className="w-full bg-background/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="john@example.com"
                                required
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-medium">Message</label>
                          <textarea 
                             id="message" 
                             name="message"
                             value={formData.message} 
                             onChange={handleInputChange} 
                             className="w-full bg-background/50 border border-white/10 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                             placeholder="Tell me about your project..."
                             required
                          />
                       </div>
                       <button type="submit" className="w-full btn-liquid-primary h-14 text-lg" disabled={isFormSubmitting}>
                          {isFormSubmitting ? (
                            <span className="flex items-center gap-2">
                               <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                               Sending...
                            </span>
                          ) : (
                             <span className="flex items-center gap-2">Send Message <Send className="w-4 h-4" /></span>
                          )}
                       </button>
                       {formSuccess && (
                          <div className="p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 text-center">
                             Message sent successfully!
                          </div>
                       )}
                    </form>
                 </CardContent>
              </Card>
           </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/10 text-center text-muted-foreground text-sm relative z-10">
         <div className="container">
            <p>© {new Date().getFullYear()} {data.personalInfo.name}. Built with Next.js & Tailwind.</p>
         </div>
      </footer>
    </main>
  )
}
