"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { defaultData } from "@/lib/default-data"

const HELP = `Available commands:
  help       Show this help
  whoami     Identity
  now        What I'm doing
  ls         List portfolio sections
  toys       List playable toys
  cat <file> Read a file (bio, projects, skills, contact)
  open <app> Open app or toy
             system: about projects resume finder terminal
             toys:   scheduler ats sensor segment paint
  clear      Clear the screen
  neofetch   System info
`

function runCommand(
  raw: string,
  onOpenApp?: (app: string) => void
): string[] {
  const line = raw.trim()
  if (!line) return []
  const [cmd, ...rest] = line.split(/\s+/)
  const arg = rest.join(" ").toLowerCase()

  switch (cmd.toLowerCase()) {
    case "help":
    case "?":
      return HELP.split("\n")
    case "whoami":
      return [
        defaultData.personalInfo.name,
        defaultData.personalInfo.title,
        defaultData.personalInfo.location,
      ]
    case "now":
      return defaultData.experiences
        .filter((e) => e.current)
        .map((e) => `${e.title} @ ${e.company}`)
        .concat(
          defaultData.education[0]
            ? `${defaultData.education[0].degree} · ${defaultData.education[0].school}`
            : []
        )
    case "ls":
      return ["about/", "projects/", "experience/", "skills/", "toys/", "resume.pdf", "contact.txt"]
    case "toys":
      return [
        "scheduler  — course grid (Engineering Course Scheduler)",
        "ats        — keyword triage (Application Tracker)",
        "sensor     — IMU-style signal (sensor pipelines)",
        "segment    — click masks (AI for Health CV)",
        "paint      — doodle desk toy",
        "",
        "tip: open scheduler",
      ]
    case "cat": {
      if (!arg) return ["usage: cat <bio|projects|skills|contact>"]
      if (arg === "bio") return [defaultData.personalInfo.bio]
      if (arg === "projects")
        return defaultData.projects.map((p) => `• ${p.title} (${p.year ?? "—"})`)
      if (arg === "skills")
        return [defaultData.skills.map((s) => s.name).join(", ")]
      if (arg === "contact")
        return [
          defaultData.personalInfo.email,
          defaultData.personalInfo.github ?? "",
          defaultData.personalInfo.linkedin ?? "",
        ].filter(Boolean)
      return [`cat: ${arg}: No such file`]
    }
    case "open": {
      const app = arg || rest[0]
      if (!app) {
        return [
          "usage: open <app>",
          "apps: about projects resume finder terminal scheduler ats sensor segment paint",
        ]
      }
      if (onOpenApp) onOpenApp(app)
      return [`Opening ${app}…`]
    }
    case "clear":
      return ["__CLEAR__"]
    case "neofetch":
      return [
        "peter@peteros",
        "-------------",
        "OS: PeterOS 0.1",
        "Host: personal website",
        `User: ${defaultData.personalInfo.name}`,
        `Shell: zsh-ish`,
        `Uptime: since you opened this tab`,
        `Packages: ${defaultData.projects.length} projects, ${defaultData.skills.length} skills`,
        `Location: ${defaultData.personalInfo.location}`,
      ]
    case "sudo":
      return ["Nice try. Permission denied (and documented)."]
    case "rm":
    case "rm-rf":
    case "rm-rf/":
      return ["Filesystem is read-only. Portfolio survives."]
    default:
      return [`command not found: ${cmd}. Type 'help'.`]
  }
}

type Props = {
  onOpenApp?: (app: string) => void
}

export function TerminalApp({ onOpenApp }: Props) {
  const [lines, setLines] = useState<string[]>([
    "PeterOS Terminal — type `help` to begin.",
    "",
  ])
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [lines])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const cmd = input
    const out = runCommand(cmd, onOpenApp)
    if (out[0] === "__CLEAR__") {
      setLines([])
    } else {
      setLines((prev) => [...prev, `peter@os ~ % ${cmd}`, ...out, ""])
    }
    if (cmd.trim()) {
      setHistory((h) => [cmd, ...h].slice(0, 50))
    }
    setHistIdx(-1)
    setInput("")
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = Math.min(histIdx + 1, history.length - 1)
      if (history[next] != null) {
        setHistIdx(next)
        setInput(history[next])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = histIdx - 1
      if (next < 0) {
        setHistIdx(-1)
        setInput("")
      } else {
        setHistIdx(next)
        setInput(history[next])
      }
    }
  }

  return (
    <div
      className="pos-app pos-terminal"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="pos-terminal-scroll">
        {lines.map((l, i) => (
          <div key={i} className="pos-terminal-line">
            {l}
          </div>
        ))}
        <form className="pos-terminal-input-row" onSubmit={submit}>
          <span className="pos-terminal-prompt">peter@os ~ %</span>
          <input
            ref={inputRef}
            className="pos-terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
          />
        </form>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
