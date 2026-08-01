import matter from "gray-matter"
import type { MarkdownFrontmatter } from "./types"

function toIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 10)
  }
  return ""
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean)
  if (typeof value === "string" && value.trim()) return [value.trim()]
  return []
}

export type ParsedDocument = {
  frontmatter: MarkdownFrontmatter
  content: string
  raw: string
}

/**
 * Parse YAML frontmatter + body. Returns null if required fields are missing.
 */
export function parseMarkdownDocument(raw: string): ParsedDocument | null {
  const { data, content } = matter(raw)
  const date = toIsoDate(data.date)
  const title = data.title != null ? String(data.title).trim() : ""

  if (!title || !date) return null

  const frontmatter: MarkdownFrontmatter = {
    title,
    description: data.description != null ? String(data.description) : undefined,
    date,
    updated: data.updated ? toIsoDate(data.updated) : undefined,
    tags: toStringArray(data.tags),
    draft: Boolean(data.draft),
    source: data.source != null ? String(data.source) : undefined,
    canonical: data.canonical != null ? String(data.canonical) : undefined,
    image: data.image != null ? String(data.image) : undefined,
  }

  return {
    frontmatter,
    content: content.replace(/^\uFEFF/, "").trim(),
    raw,
  }
}

export function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}
