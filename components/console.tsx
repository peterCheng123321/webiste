"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"

interface ConsoleProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandResult {
  command: string
  output: React.ReactNode
}

// Available commands for autocomplete
const AVAILABLE_COMMANDS = [
  "about",
  "skills",
  "projects",
  "contact",
  "clear",
  "help",
  "echo",
  "date",
  "whoami",
  "joke",
  "github",
  "linkedin",
  "email",
]

export function Console({ isOpen, onClose }: ConsoleProps) {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<CommandResult[]>([
    {
      command: "help",
      output: (
        <div className="mb-2">
          <p className="mb-1">Available commands:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-primary">about</span> - Display information about me
            </li>
            <li>
              <span className="text-primary">skills</span> - List my technical skills
            </li>
            <li>
              <span className="text-primary">projects</span> - Show my projects
            </li>
            <li>
              <span className="text-primary">contact</span> - How to reach me
            </li>
            <li>
              <span className="text-primary">clear</span> - Clear the console
            </li>
            <li>
              <span className="text-primary">help</span> - Show this help message
            </li>
            <li>
              <span className="text-primary">echo [text]</span> - Echo back your text
            </li>
            <li>
              <span className="text-primary">date</span> - Display current date and time
            </li>
            <li>
              <span className="text-primary">whoami</span> - Who are you?
            </li>
            <li>
              <span className="text-primary">joke</span> - Tell a programming joke
            </li>
            <li>
              <span className="text-primary">github</span> - Open my GitHub profile
            </li>
            <li>
              <span className="text-primary">linkedin</span> - Open my LinkedIn profile
            </li>
            <li>
              <span className="text-primary">email</span> - Send me an email
            </li>
          </ul>
        </div>
      ),
    },
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const consoleEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [history])

  // Update suggestions when input changes
  useEffect(() => {
    if (input.trim()) {
      const filtered = AVAILABLE_COMMANDS.filter((cmd) => cmd.startsWith(input.toLowerCase()))
      setSuggestions(filtered)
      setSelectedSuggestion(-1)
    } else {
      setSuggestions([])
    }
  }, [input])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key to execute command
    if (e.key === "Enter" && input.trim()) {
      executeCommand(input.trim())
      setCommandHistory((prev) => [input.trim(), ...prev])
      setHistoryIndex(-1)
      setInput("")
      return
    }

    // Handle Tab key for autocomplete
    if (e.key === "Tab") {
      e.preventDefault()
      if (suggestions.length > 0) {
        if (selectedSuggestion >= 0) {
          setInput(suggestions[selectedSuggestion])
        } else {
          setInput(suggestions[0])
        }
      }
      return
    }

    // Handle arrow up/down for command history
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (suggestions.length > 0 && selectedSuggestion < suggestions.length - 1) {
        // Navigate through suggestions
        setSelectedSuggestion((prev) => prev + 1)
      } else if (commandHistory.length > 0) {
        // Navigate through command history
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (suggestions.length > 0 && selectedSuggestion > -1) {
        // Navigate through suggestions
        setSelectedSuggestion((prev) => prev - 1)
      } else if (historyIndex > 0) {
        // Navigate through command history
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
      return
    }
  }

  const executeCommand = (cmd: string) => {
    let output: React.ReactNode
    const args = cmd.split(" ")
    const command = args[0].toLowerCase()
    const params = args.slice(1).join(" ")

    switch (command) {
      case "about":
        output = (
          <div className="mb-2">
            <p>I'm Zhongquan Cheng, a Computer Science student at Syracuse University.</p>
            <p>Passionate about data science, application development, and research.</p>
          </div>
        )
        break
      case "skills":
        output = (
          <div className="mb-2">
            <p className="mb-1">Technical Skills:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Programming: Python, Java, R, C#, HTML, Haskell</li>
              <li>Tools: Unity, MS Office Suite</li>
              <li>Areas: Data Analysis, Machine Learning</li>
            </ul>
          </div>
        )
        break
      case "projects":
        output = (
          <div className="mb-2">
            <p className="mb-1">Notable Projects:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Android App Development - Health and fitness tracking application</li>
              <li>Syracuse Hackathon - Emotion recognition through facial analysis</li>
              <li>WeChat Chatbot - CNN network development</li>
            </ul>
          </div>
        )
        break
      case "contact":
        output = (
          <div className="mb-2">
            <p className="mb-1">Contact Information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email: zcheng05@syr.edu</li>
              <li>Phone: 315-317-5618</li>
              <li>Location: Syracuse, New York</li>
            </ul>
          </div>
        )
        break
      case "clear":
        setHistory([])
        return
      case "help":
        output = (
          <div className="mb-2">
            <p className="mb-1">Available commands:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="text-primary">about</span> - Display information about me
              </li>
              <li>
                <span className="text-primary">skills</span> - List my technical skills
              </li>
              <li>
                <span className="text-primary">projects</span> - Show my projects
              </li>
              <li>
                <span className="text-primary">contact</span> - How to reach me
              </li>
              <li>
                <span className="text-primary">clear</span> - Clear the console
              </li>
              <li>
                <span className="text-primary">clear</span> - Clear the console
              </li>
              <li>
                <span className="text-primary">help</span> - Show this help message
              </li>
              <li>
                <span className="text-primary">echo [text]</span> - Echo back your text
              </li>
              <li>
                <span className="text-primary">date</span> - Display current date and time
              </li>
              <li>
                <span className="text-primary">whoami</span> - Who are you?
              </li>
              <li>
                <span className="text-primary">joke</span> - Tell a programming joke
              </li>
              <li>
                <span className="text-primary">github</span> - Open my GitHub profile
              </li>
              <li>
                <span className="text-primary">linkedin</span> - Open my LinkedIn profile
              </li>
              <li>
                <span className="text-primary">email</span> - Send me an email
              </li>
            </ul>
          </div>
        )
        break
      case "echo":
        output = <p className="mb-2">{params || "<empty>"}</p>
        break
      case "date":
        output = <p className="mb-2">{new Date().toLocaleString()}</p>
        break
      case "whoami":
        output = <p className="mb-2">You are a visitor to Zhongquan Cheng's portfolio website!</p>
        break
      case "joke":
        const jokes = [
          "Why do programmers prefer dark mode? Because light attracts bugs!",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
          "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
          "Why did the developer go broke? Because he used up all his cache!",
        ]
        output = <p className="mb-2">{jokes[Math.floor(Math.random() * jokes.length)]}</p>
        break
      case "github":
        window.open("https://github.com/", "_blank")
        output = <p className="mb-2">Opening GitHub profile in a new tab...</p>
        break
      case "linkedin":
        window.open("https://linkedin.com/in/", "_blank")
        output = <p className="mb-2">Opening LinkedIn profile in a new tab...</p>
        break
      case "email":
        window.open("mailto:zcheng05@syr.edu", "_blank")
        output = <p className="mb-2">Opening email client...</p>
        break
      default:
        output = <p className="text-red-500 mb-2">Command not found: {cmd}. Type 'help' for available commands.</p>
    }

    setHistory((prev) => [...prev, { command: cmd, output }])
  }

  return (
    <div className={`console ${isOpen ? "open" : ""}`}>
      <div className="console-header">
        <div className="terminal-header">
          <div className="terminal-dot terminal-dot-red"></div>
          <div className="terminal-dot terminal-dot-yellow"></div>
          <div className="terminal-dot terminal-dot-green"></div>
          <span className="terminal-title">console</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>
      <div className="console-content">
        <p className="mb-4 text-primary">Welcome to Zhongquan's console. Type 'help' for available commands.</p>
        <p className="mb-4 text-muted-foreground text-xs">
          Tip: Use Tab for autocomplete, and Up/Down arrows to navigate command history.
        </p>

        {history.map((item, index) => (
          <div key={index} className="mb-4">
            <div className="console-input">
              <span className="console-input-prompt">$</span>
              <span>{item.command}</span>
            </div>
            <div className="mt-1 pl-4">{item.output}</div>
          </div>
        ))}

        <div className="console-input">
          <span className="console-input-prompt">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="console-input-field"
            placeholder="Type a command..."
          />
        </div>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 pl-4 bg-card/50 border border-primary/20 rounded p-2">
            <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <span
                  key={suggestion}
                  className={`px-2 py-1 text-xs rounded cursor-pointer ${
                    index === selectedSuggestion ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => {
                    setInput(suggestion)
                    if (inputRef.current) inputRef.current.focus()
                  }}
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}

        <div ref={consoleEndRef}></div>
      </div>
    </div>
  )
}
