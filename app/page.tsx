"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { type WebsiteData, defaultData } from "@/lib/default-data"

// Format date from YYYY-MM to Month Year
const formatDate = (dateString: string) => {
  if (!dateString) return "Present"

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

// Skill icons mapping
const skillIcons: Record<string, React.ReactNode> = {
  Python: <FileCode className="h-5 w-5" />,
  Java: <Code className="h-5 w-5" />,
  R: <Database className="h-5 w-5" />,
  "C#": <Braces className="h-5 w-5" />,
  "HTML/CSS": <Code className="h-5 w-5" />,
  JavaScript: <Code className="h-5 w-5" />,
  SQL: <Database className="h-5 w-5" />,
  Unity: <Globe className="h-5 w-5" />,
  "Data Analysis": <Server className="h-5 w-5" />,
  "Machine Learning": <Cpu className="h-5 w-5" />,
  "Statistical Analysis": <Cpu className="h-5 w-5" />,
  Git: <Terminal className="h-5 w-5" />,
}

export default function Home() {
  const data = defaultData
  const [activeSection, setActiveSection] = useState("")
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })

  const sectionRefs = {
    about: useRef<HTMLElement>(null),
    experience: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    skills: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  }


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
      { rootMargin: "-100px 0px -100px 0px", threshold: 0.1 },
    )

    Object.values(sectionRefs).forEach((ref) => ref.current && observer.observe(ref.current))

    return () => observer.disconnect()
  }, [])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsFormSubmitting(false)
      setFormSuccess(true)
      setFormData({ name: "", email: "", message: "" })

      // Reset success message after 5 seconds
      setTimeout(() => setFormSuccess(false), 5000)
    }, 1500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <main className="min-h-screen bg-background noise-bg grid-bg">

      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-border/30 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="font-mono font-bold text-xl text-gradient flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <span>{data.personalInfo.name}</span>
          </div>
          <nav className="hidden md:flex gap-6">
            {Object.keys(sectionRefs).map((section) => (
              <Link
                key={section}
                href={`#${section}`}
                className={`text-muted-foreground hover:text-foreground transition-colors font-mono ${
                  activeSection === section ? "text-accent" : ""
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden md:inline-flex button-3d shadow-glow border-primary/20"
            >
              <Link href="#contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32 space-y-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 fade-in-up">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gradient-enhanced leading-tight">
                Hi, I'm <span className="text-foreground">{data.personalInfo.name}</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                {data.personalInfo.title}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {data.personalInfo.bio}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="button-enhanced shadow-glow border-primary/20 text-lg px-8 py-6">
                <Link href="#contact" className="group">
                  Get In Touch
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="button-enhanced shadow-glow border-primary/20 text-lg px-8 py-6">
                <Link href="#projects" className="group">
                  View Projects
                  <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{data.personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{data.personalInfo.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center fade-in-up stagger-2">
            <div className="profile-image-wrapper float">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl scale-110"></div>
              <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl ring-4 ring-primary/10 pulse-glow">
                {data.personalInfo.photo ? (
                  <img
                    src={data.personalInfo.photo}
                    alt={data.personalInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Add your photo here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={sectionRefs.about} className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-enhanced">
            About Me
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get to know me better and discover what drives my passion for technology and innovation.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-enhanced card-hover card-shimmer shadow-glow h-full">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center pulse-glow">
                      <Code className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gradient-enhanced">Background</h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {data.personalInfo.bio}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="glass-enhanced card-hover card-shimmer shadow-glow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center pulse-glow">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gradient-enhanced">Contact Info</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{data.personalInfo.location}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm">{data.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">{data.personalInfo.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full shadow-glow button-3d border-primary/20"
                    >
                      <Github className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full shadow-glow button-3d border-primary/20"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Experience Tabs */}
      <section id="experience" ref={sectionRefs.experience} className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-enhanced">
            Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            My professional journey and research experience in computer science and technology.
          </p>
        </div>
        
        <Tabs defaultValue="professional" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass-effect border border-primary/20">
            <TabsTrigger value="professional" className="font-medium">
              Professional
            </TabsTrigger>
            <TabsTrigger value="research" className="font-medium">
              Research
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="professional" className="space-y-6 mt-8">
            {data.experiences
              .filter((exp) => exp.type === "professional")
              .map((exp, index) => (
                <Card
                  key={exp.id}
                  className="glass-card card-hover shadow-glow fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-gradient group-hover:text-primary transition-colors">
                            {exp.title}
                          </h3>
                          <p className="text-lg text-primary font-medium">{exp.company}</p>
                        </div>
                        <Badge variant="outline" className="glass-effect border-primary/20 px-4 py-2">
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                        </Badge>
                      </div>
                      <ul className="space-y-2">
                        {exp.description.map((bullet, index) => (
                          <li key={`${exp.id}-bullet-${index}`} className="flex items-start gap-3 text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="research" className="space-y-6 mt-8">
            {data.experiences
              .filter((exp) => exp.type === "research")
              .map((exp, index) => (
                <Card
                  key={exp.id}
                  className="glass-card card-hover shadow-glow fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-gradient group-hover:text-primary transition-colors">
                            {exp.title}
                          </h3>
                          <p className="text-lg text-primary font-medium">{exp.company}</p>
                        </div>
                        <Badge variant="outline" className="glass-effect border-primary/20 px-4 py-2">
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                        </Badge>
                      </div>
                      <ul className="space-y-2">
                        {exp.description.map((bullet, index) => (
                          <li key={`${exp.id}-bullet-${index}`} className="flex items-start gap-3 text-muted-foreground">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </section>

      {/* Projects Section */}
      <section id="projects" ref={sectionRefs.projects} className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-enhanced">
            Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A showcase of my technical projects and creative solutions in software development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.projects.map((project, index) => (
            <Card
              key={project.id}
              className="project-card card-hover shadow-glow overflow-hidden fade-in-up group h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              <CardContent className="p-6 h-full flex flex-col">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Braces className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gradient group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={`${project.id}-tag-${index}`} className="glass-effect border-primary/20 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" ref={sectionRefs.skills} className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-enhanced">
            Skills
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            My technical expertise and proficiency in various programming languages and technologies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-enhanced card-hover card-shimmer shadow-glow">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center pulse-glow">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gradient-enhanced">Programming Languages</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {data.skills
                    .filter((skill) => skill.category === "programming")
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className="skill-card flex items-center gap-3 p-4 rounded-xl border border-primary/20 shadow-glow group"
                      >
                        <div className="text-primary group-hover:scale-110 transition-transform">
                          {skillIcons[skill.name] || <Code className="h-5 w-5" />}
                        </div>
                        <span className="font-medium">{skill.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-enhanced card-hover card-shimmer shadow-glow">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center pulse-glow">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gradient-enhanced">Tools & Technologies</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {data.skills
                    .filter((skill) => skill.category === "other")
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className="skill-card flex items-center gap-3 p-4 rounded-xl border border-primary/20 shadow-glow group"
                      >
                        <div className="text-primary group-hover:scale-110 transition-transform">
                          {skillIcons[skill.name] || <Server className="h-5 w-5" />}
                        </div>
                        <span className="font-medium">{skill.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Languages */}
      <section className="container py-16">
        <Card className="glass-enhanced card-hover card-shimmer shadow-glow max-w-2xl mx-auto pulse-glow">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center pulse-glow">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-gradient-enhanced">Languages</h3>
              </div>
              <div className="flex justify-center gap-6">
                {data.languages.map((language) => (
                  <div
                    key={language.id}
                    className="skill-card px-6 py-4 rounded-xl shadow-glow border border-primary/20 text-center min-w-[120px]"
                  >
                    <p className="font-semibold text-gradient-enhanced text-lg">{language.name}</p>
                    <p className="text-sm text-muted-foreground">{language.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={sectionRefs.contact} className="container py-24 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-enhanced">
            Get In Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to collaborate or just want to say hello? I'd love to hear from you!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="glass-enhanced card-hover card-shimmer shadow-glow">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center pulse-glow">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gradient-enhanced">Contact Information</h3>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Feel free to reach out if you're interested in my work or would like to collaborate on a project.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>{data.personalInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{data.personalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{data.personalInfo.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-enhanced card-hover card-shimmer shadow-glow">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center pulse-glow">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gradient-enhanced">Send a Message</h3>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-primary/20 bg-card/50 glass-effect focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg border border-primary/20 bg-card/50 glass-effect focus:border-primary/50 focus:outline-none transition-colors"
                        placeholder="Your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-primary/20 bg-card/50 glass-effect focus:border-primary/50 focus:outline-none transition-colors min-h-[120px] resize-none"
                      placeholder="Your message"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full button-enhanced shadow-glow border-primary/20 text-lg py-6"
                    disabled={isFormSubmitting}
                  >
                    {isFormSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </span>
                    )}
                  </Button>

                  {formSuccess && (
                    <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg text-accent">
                      <p className="text-sm">Message sent successfully! I'll get back to you soon.</p>
                    </div>
                  )}
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 md:py-8 glass-effect">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">©</span> {new Date().getFullYear()} {data.personalInfo.name}.{" "}
            <span className="text-primary">All</span> <span className="text-accent">rights</span>{" "}
            <span className="text-primary">reserved</span>.
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="font-mono">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="font-mono">
              Terms of Service
            </Button>
          </div>
        </div>
      </footer>
    </main>
  )
}
