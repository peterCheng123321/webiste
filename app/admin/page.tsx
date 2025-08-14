"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Plus, Trash2, Upload, Eye, Terminal, Code, Database, Server, Cpu, QrCode } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Login } from "./login"
import { type WebsiteData, defaultData } from "@/lib/default-data"
import { saveToLocalStorage } from "@/lib/browser-storage"

// Define the types
interface PersonalInfo {
  name: string
  title: string
  bio: string
  location: string
  email: string
  phone: string
  photo: string
  qrCode: string
}

interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  current: boolean
  description: string[]
  type: "professional" | "research"
}

interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  repoUrl: string
  demoUrl: string
  learnings: string
}

interface Skill {
  id: string
  name: string
  category: "programming" | "other"
}

interface Language {
  id: string
  name: string
  level: string
}

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<WebsiteData>(defaultData)
  const [isSaved, setIsSaved] = useState(true)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrCodeInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveError, setShowSaveError] = useState(false)

  // Check authentication on initial render
  useEffect(() => {
    const authStatus = localStorage.getItem("admin-authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  // Load data from API on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/website-data")
        const result = await response.json()

        if (result.data) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    fetchData()
  }, [])

  // Save data to API
  const saveData = async () => {
    try {
      setIsSaving(true)

      // Always save to localStorage as a fallback
      saveToLocalStorage(data)

      const response = await fetch("/api/website-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSaved(true)
        setShowSaveSuccess(true)

        // Show a warning if data was only saved to fallback storage
        if (result.warning) {
          console.warn(result.warning)
        }

        setTimeout(() => setShowSaveSuccess(false), 3000)
      } else {
        setShowSaveError(true)
        setTimeout(() => setShowSaveError(false), 3000)
      }
    } catch (error) {
      console.error("Error saving data:", error)

      // Try to save to localStorage as a last resort
      const localSaved = saveToLocalStorage(data)

      if (localSaved) {
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)
      } else {
        setShowSaveError(true)
        setTimeout(() => setShowSaveError(false), 3000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Mark as unsaved when data changes
  const updateData = (newData: WebsiteData) => {
    setData(newData)
    setIsSaved(false)
  }

  // Update personal info
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    updateData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    })
  }

  // Handle file upload for profile photo
  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle file upload for QR code
  const handleQrCodeUpload = () => {
    if (qrCodeInputRef.current) {
      qrCodeInputRef.current.click()
    }
  }

  // Process the selected file for profile photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          updatePersonalInfo("photo", event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Process the selected file for QR code
  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          updatePersonalInfo("qrCode", event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Add a new experience
  const addExperience = (type: "professional" | "research") => {
    const newExperience: Experience = {
      id: `exp${Date.now()}`,
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
      type,
    }

    updateData({
      ...data,
      experiences: [...data.experiences, newExperience],
    })
  }

  // Update an experience
  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    updateData({
      ...data,
      experiences: data.experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  // Update experience description bullet point
  const updateExperienceDescription = (expId: string, index: number, value: string) => {
    updateData({
      ...data,
      experiences: data.experiences.map((exp) => {
        if (exp.id === expId) {
          const newDescription = [...exp.description]
          newDescription[index] = value
          return { ...exp, description: newDescription }
        }
        return exp
      }),
    })
  }

  // Add a bullet point to an experience
  const addExperienceBullet = (expId: string) => {
    updateData({
      ...data,
      experiences: data.experiences.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, description: [...exp.description, ""] }
        }
        return exp
      }),
    })
  }

  // Remove a bullet point from an experience
  const removeExperienceBullet = (expId: string, index: number) => {
    updateData({
      ...data,
      experiences: data.experiences.map((exp) => {
        if (exp.id === expId) {
          const newDescription = [...exp.description]
          newDescription.splice(index, 1)
          return { ...exp, description: newDescription }
        }
        return exp
      }),
    })
  }

  // Delete an experience
  const deleteExperience = (id: string) => {
    updateData({
      ...data,
      experiences: data.experiences.filter((exp) => exp.id !== id),
    })
  }

  // Add a new project
  const addProject = () => {
    const newProject: Project = {
      id: `proj${Date.now()}`,
      title: "",
      description: "",
      tags: [],
      repoUrl: "",
      demoUrl: "",
      learnings: "",
    }

    updateData({
      ...data,
      projects: [...data.projects, newProject],
    })
  }

  // Update a project
  const updateProject = (id: string, field: keyof Project, value: any) => {
    updateData({
      ...data,
      projects: data.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    })
  }

  // Update project tags
  const updateProjectTags = (id: string, tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    updateData({
      ...data,
      projects: data.projects.map((proj) => (proj.id === id ? { ...proj, tags } : proj)),
    })
  }

  // Delete a project
  const deleteProject = (id: string) => {
    updateData({
      ...data,
      projects: data.projects.filter((proj) => proj.id !== id),
    })
  }

  // Add a new skill
  const addSkill = (category: "programming" | "other") => {
    const newSkill: Skill = {
      id: `skill${Date.now()}`,
      name: "",
      category,
    }

    updateData({
      ...data,
      skills: [...data.skills, newSkill],
    })
  }

  // Update a skill
  const updateSkill = (id: string, name: string) => {
    updateData({
      ...data,
      skills: data.skills.map((skill) => (skill.id === id ? { ...skill, name } : skill)),
    })
  }

  // Delete a skill
  const deleteSkill = (id: string) => {
    updateData({
      ...data,
      skills: data.skills.filter((skill) => skill.id !== id),
    })
  }

  // Add a new language
  const addLanguage = () => {
    const newLanguage: Language = {
      id: `lang${Date.now()}`,
      name: "",
      level: "",
    }

    updateData({
      ...data,
      languages: [...data.languages, newLanguage],
    })
  }

  // Update a language
  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    updateData({
      ...data,
      languages: data.languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)),
    })
  }

  // Delete a language
  const deleteLanguage = (id: string) => {
    updateData({
      ...data,
      languages: data.languages.filter((lang) => lang.id !== id),
    })
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("admin-authenticated")
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-background noise-bg">
      <header className="sticky top-0 z-10 w-full border-b border-primary/20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="button-3d">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h1 className="font-bold text-xl text-gradient font-mono">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout} className="button-3d shadow-code">
              Logout
            </Button>
            <Button variant="outline" size="sm" asChild className="button-3d shadow-code">
              <Link href="/" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button onClick={saveData} disabled={isSaved || isSaving} size="sm" className="button-3d shadow-code">
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {showSaveSuccess && (
        <div className="container mt-4">
          <Alert className="bg-green-50 text-green-800 border-green-200 glass-effect">
            <AlertDescription className="font-mono">
              <span className="text-green-500">✓</span> Changes saved successfully!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {showSaveError && (
        <div className="container mt-4">
          <Alert className="bg-red-50 text-red-800 border-red-200 glass-effect">
            <AlertDescription className="font-mono">
              <span className="text-red-500">✗</span> Error saving changes. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container py-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 glass-effect border border-primary/20 shadow-code">
            <TabsTrigger value="personal" className="font-mono flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="experience" className="font-mono flex items-center gap-1">
              <Server className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="projects" className="font-mono flex items-center gap-1">
              <Code className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="skills" className="font-mono flex items-center gap-1">
              <Terminal className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="languages" className="font-mono flex items-center gap-1">
              <Database className="h-4 w-4" />
              Languages
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4 mt-6">
            <Card className="glass-card border-primary/20 shadow-code">
              <CardHeader className="border-b border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">personal-info.json</span>
                  </div>
                </div>
                <CardTitle className="text-gradient font-mono">Personal Information</CardTitle>
                <CardDescription className="font-mono">
                  Update your basic information that appears across the website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-mono">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={data.personalInfo.name}
                      onChange={(e) => updatePersonalInfo("name", e.target.value)}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-mono">
                      Professional Title
                    </Label>
                    <Input
                      id="title"
                      value={data.personalInfo.title}
                      onChange={(e) => updatePersonalInfo("title", e.target.value)}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-mono">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={data.personalInfo.bio}
                    onChange={(e) => updatePersonalInfo("bio", e.target.value)}
                    className="glass-effect font-mono border-primary/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-mono">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={data.personalInfo.location}
                      onChange={(e) => updatePersonalInfo("location", e.target.value)}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.personalInfo.email}
                      onChange={(e) => updatePersonalInfo("email", e.target.value)}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-mono">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={data.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo" className="font-mono">
                    Profile Photo URL
                  </Label>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Input
                        id="photo"
                        value={data.personalInfo.photo}
                        onChange={(e) => updatePersonalInfo("photo", e.target.value)}
                        placeholder="/placeholder.svg?height=200&width=200"
                        className="glass-effect font-mono border-primary/20"
                      />
                    </div>
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-primary/20 shadow-code">
                      <img
                        src={data.personalInfo.photo || "/placeholder.svg?height=64&width=64"}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    <span className="text-primary">//</span> Enter a URL for your profile photo or use the upload button
                    to add a new image.
                  </p>
                </div>

                <div className="pt-2">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full button-3d shadow-code font-mono border-primary/20"
                    onClick={handlePhotoUpload}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Photo
                  </Button>
                </div>

                {/* QR Code Section */}
                <div className="mt-6 pt-6 border-t border-primary/10">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-gradient font-mono">QR Code</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qrCode" className="font-mono">
                      QR Code Image
                    </Label>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Input
                          id="qrCode"
                          value={data.personalInfo.qrCode}
                          onChange={(e) => updatePersonalInfo("qrCode", e.target.value)}
                          placeholder="URL to your QR code image"
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <div className="w-16 h-16 overflow-hidden border border-primary/20 shadow-code bg-white">
                        {data.personalInfo.qrCode ? (
                          <img
                            src={data.personalInfo.qrCode || "/placeholder.svg"}
                            alt="QR code preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <QrCode className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      <span className="text-primary">//</span> Upload a QR code image that links to your contact info,
                      portfolio, or social media.
                    </p>
                  </div>

                  <div className="pt-2">
                    {/* Hidden file input for QR code */}
                    <input
                      type="file"
                      ref={qrCodeInputRef}
                      onChange={handleQrCodeChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full button-3d shadow-code font-mono border-primary/20"
                      onClick={handleQrCodeUpload}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient font-mono flex items-center gap-2">
                <Server className="h-5 w-5" />
                Professional Experience
              </h2>
              <Button onClick={() => addExperience("professional")} className="button-3d shadow-code font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Add Professional Experience
              </Button>
            </div>

            {data.experiences
              .filter((exp) => exp.type === "professional")
              .map((exp) => (
                <Card
                  key={exp.id}
                  className="relative glass-card border-primary/20 shadow-code transition-all duration-300 hover:translate-y-[-5px]"
                >
                  <CardHeader className="border-b border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-mono">experience-{exp.id}.json</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <CardTitle>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                          className="font-bold text-lg border-none p-0 h-7 focus-visible:ring-0 glass-effect font-mono"
                          placeholder="Position Title"
                        />
                      </CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="button-3d">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-primary/20">
                          <DialogHeader>
                            <DialogTitle className="font-mono">Are you sure?</DialogTitle>
                            <DialogDescription className="font-mono">
                              This will permanently delete this experience entry.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {}} className="button-3d shadow-code font-mono">
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteExperience(exp.id)}
                              className="button-3d font-mono"
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Company/Organization</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="Company name"
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono">Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="font-mono">End Date</Label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={exp.current}
                              onCheckedChange={(checked) => {
                                updateExperience(exp.id, "current", checked)
                                if (checked) {
                                  updateExperience(exp.id, "endDate", "")
                                }
                              }}
                              id={`current-${exp.id}`}
                            />
                            <Label htmlFor={`current-${exp.id}`} className="text-sm font-mono">
                              Current
                            </Label>
                          </div>
                        </div>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.current}
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-mono">Description</Label>
                      <div className="space-y-2">
                        {exp.description.map((bullet, index) => (
                          <div key={`${exp.id}-bullet-${index}`} className="flex gap-2">
                            <Input
                              value={bullet}
                              onChange={(e) => updateExperienceDescription(exp.id, index, e.target.value)}
                              placeholder="Description bullet point"
                              className="flex-1 glass-effect font-mono border-primary/20"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeExperienceBullet(exp.id, index)}
                              disabled={exp.description.length <= 1}
                              className="button-3d shadow-code"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addExperienceBullet(exp.id)}
                          className="button-3d shadow-code font-mono"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Bullet Point
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            <Separator className="my-6 border-primary/20" />

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient font-mono flex items-center gap-2">
                <Code className="h-5 w-5" />
                Research Experience
              </h2>
              <Button onClick={() => addExperience("research")} className="button-3d shadow-code font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Add Research Experience
              </Button>
            </div>

            {data.experiences
              .filter((exp) => exp.type === "research")
              .map((exp) => (
                <Card
                  key={exp.id}
                  className="relative glass-card border-primary/20 shadow-code transition-all duration-300 hover:translate-y-[-5px]"
                >
                  <CardHeader className="border-b border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-mono">experience-{exp.id}.json</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <CardTitle>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                          className="font-bold text-lg border-none p-0 h-7 focus-visible:ring-0 glass-effect font-mono"
                          placeholder="Position Title"
                        />
                      </CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="button-3d">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-primary/20">
                          <DialogHeader>
                            <DialogTitle className="font-mono">Are you sure?</DialogTitle>
                            <DialogDescription className="font-mono">
                              This will permanently delete this experience entry.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => {}} className="button-3d shadow-code font-mono">
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteExperience(exp.id)}
                              className="button-3d font-mono"
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="font-mono">Institution/Lab</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="Institution name"
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-mono">Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="font-mono">End Date</Label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={exp.current}
                              onCheckedChange={(checked) => {
                                updateExperience(exp.id, "current", checked)
                                if (checked) {
                                  updateExperience(exp.id, "endDate", "")
                                }
                              }}
                              id={`current-${exp.id}`}
                            />
                            <Label htmlFor={`current-${exp.id}`} className="text-sm font-mono">
                              Current
                            </Label>
                          </div>
                        </div>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.current}
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-mono">Description</Label>
                      <div className="space-y-2">
                        {exp.description.map((bullet, index) => (
                          <div key={`${exp.id}-bullet-${index}`} className="flex gap-2">
                            <Input
                              value={bullet}
                              onChange={(e) => updateExperienceDescription(exp.id, index, e.target.value)}
                              placeholder="Description bullet point"
                              className="flex-1 glass-effect font-mono border-primary/20"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeExperienceBullet(exp.id, index)}
                              disabled={exp.description.length <= 1}
                              className="button-3d shadow-code"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addExperienceBullet(exp.id)}
                          className="button-3d shadow-code font-mono"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Bullet Point
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient font-mono flex items-center gap-2">
                <Code className="h-5 w-5" />
                Projects
              </h2>
              <Button onClick={addProject} className="button-3d shadow-code font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>

            {data.projects.map((project) => (
              <Card
                key={project.id}
                className="glass-card border-primary/20 shadow-code transition-all duration-300 hover:translate-y-[-5px]"
              >
                <CardHeader className="border-b border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground font-mono">project-{project.id}.json</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <CardTitle>
                      <Input
                        value={project.title}
                        onChange={(e) => updateProject(project.id, "title", e.target.value)}
                        className="font-bold text-lg border-none p-0 h-7 focus-visible:ring-0 glass-effect font-mono"
                        placeholder="Project Title"
                      />
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="button-3d">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-primary/20">
                        <DialogHeader>
                          <DialogTitle className="font-mono">Are you sure?</DialogTitle>
                          <DialogDescription className="font-mono">
                            This will permanently delete this project.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}} className="button-3d shadow-code font-mono">
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteProject(project.id)}
                            className="button-3d font-mono"
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label className="font-mono">Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateProject(project.id, "description", e.target.value)}
                      placeholder="Project description"
                      rows={3}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono">Tags (comma separated)</Label>
                    <Input
                      value={project.tags.join(", ")}
                      onChange={(e) => updateProjectTags(project.id, e.target.value)}
                      placeholder="e.g. React, Web Development, UI/UX"
                      className="glass-effect font-mono border-primary/20"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.tags.map((tag, index) => (
                        <Badge
                          key={`${project.id}-tag-${index}`}
                          variant="secondary"
                          className="glass-effect font-mono"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* New fields for project links and learnings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="font-mono">GitHub Repository URL</Label>
                      <Input
                        value={project.repoUrl || ""}
                        onChange={(e) => updateProject(project.id, "repoUrl", e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="glass-effect font-mono border-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono">Live Demo URL</Label>
                      <Input
                        value={project.demoUrl || ""}
                        onChange={(e) => updateProject(project.id, "demoUrl", e.target.value)}
                        placeholder="https://your-demo-site.com"
                        className="glass-effect font-mono border-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="font-mono">What I Learned / Challenges Faced</Label>
                    <Textarea
                      value={project.learnings || ""}
                      onChange={(e) => updateProject(project.id, "learnings", e.target.value)}
                      placeholder="Share what you learned or challenges you overcame in this project"
                      rows={3}
                      className="glass-effect font-mono border-primary/20"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient font-mono flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Programming Skills
              </h2>
              <Button onClick={() => addSkill("programming")} className="button-3d shadow-code font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Add Programming Skill
              </Button>
            </div>

            <Card className="glass-card border-primary/20 shadow-code transition-all duration-300 hover:translate-y-[-5px]">
              <CardHeader className="border-b border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">skills-programming.json</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {data.skills
                    .filter((skill) => skill.category === "programming")
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-1 glass-effect rounded-md px-2 py-1 font-mono"
                      >
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, e.target.value)}
                          className="w-auto min-w-[80px] h-6 p-1 border-none bg-transparent focus-visible:ring-0"
                          placeholder="Skill name"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => deleteSkill(skill.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mt-8">
              <h2 className="text-xl font-bold text-gradient font-mono flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Other Skills
              </h2>
              <Button onClick={() => addSkill("other")} className="button-3d shadow-code font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Add Other Skill
              </Button>
            </div>

            <Card className="glass-card border-primary/20 shadow-code transition-all duration-300 hover:translate-y-[-5px]">
              <CardHeader className="border-b border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">skills-other.json</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {data.skills
                    .filter((skill) => skill.category === "other")
                    .map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-1 glass-effect rounded-md px-2 py-1 font-mono"
                      >
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, e.target.value)}
                          className="w-auto min-w-[80px] h-6 p-1 border-none bg-transparent focus-visible:ring-0"
                          placeholder="Skill name"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={() => deleteSkill(skill.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gradient font-mono flex items-center gap-2">
                <Database className="h-5 w-5" />
                Languages
              </h2>
              <Button onClick={addLanguage} className="button-3d shadow-code font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Add Language
              </Button>
            </div>

            <Card className="glass-card border-primary/20 shadow-code transition-all duration-300 hover:translate-y-[-5px]">
              <CardHeader className="border-b border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 h-6 ml-2 bg-midnight-900/20 rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">languages.json</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {data.languages.map((language) => (
                    <div key={language.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          value={language.name}
                          onChange={(e) => updateLanguage(language.id, "name", e.target.value)}
                          placeholder="Language name"
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={language.level}
                          onChange={(e) => updateLanguage(language.id, "level", e.target.value)}
                          placeholder="Proficiency level"
                          className="glass-effect font-mono border-primary/20"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLanguage(language.id)}
                        className="button-3d"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
