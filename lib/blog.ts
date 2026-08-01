import fs from "fs"
import path from "path"
import matter from "gray-matter"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export type BlogFrontmatter = {
  title: string
  description?: string
  date: string
  updated?: string
  tags?: string[]
  draft?: boolean
}

export type BlogPostMeta = BlogFrontmatter & {
  slug: string
  readingMinutes: number
}

export type BlogPost = BlogPostMeta & {
  content: string
}

function ensureDir() {
  if (!fs.existsSync(BLOG_DIR)) return false
  return true
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220))
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === "string" && value.trim()) {
    // YAML may give "2026-03-02" or a full ISO string
    return value.slice(0, 10)
  }
  return ""
}

function parseFile(filename: string, includeDrafts = false): BlogPost | null {
  const full = path.join(BLOG_DIR, filename)
  const raw = fs.readFileSync(full, "utf8")
  const { data, content } = matter(raw)
  const fm = data as BlogFrontmatter

  const date = toIsoDate(fm.date)
  if (!fm.title || !date) return null
  if (fm.draft && !includeDrafts) return null

  const slug = filename.replace(/\.mdx?$/, "")
  const tags = Array.isArray(fm.tags)
    ? fm.tags.map(String)
    : fm.tags
      ? [String(fm.tags)]
      : []

  return {
    slug,
    title: String(fm.title),
    description: fm.description ? String(fm.description) : "",
    date,
    updated: fm.updated ? toIsoDate(fm.updated) : undefined,
    tags,
    draft: Boolean(fm.draft),
    content: content.trim(),
    readingMinutes: readingMinutes(content),
  }
}

export function getAllPosts(options?: { includeDrafts?: boolean }): BlogPostMeta[] {
  if (!ensureDir()) return []

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))

  const posts = files
    .map((f) => parseFile(f, options?.includeDrafts))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return posts.map(({ content: _c, ...meta }) => meta)
}

export function getPostBySlug(
  slug: string,
  options?: { includeDrafts?: boolean },
): BlogPost | null {
  if (!ensureDir()) return null

  for (const ext of [".md", ".mdx"]) {
    const file = `${slug}${ext}`
    const full = path.join(BLOG_DIR, file)
    if (fs.existsSync(full)) {
      return parseFile(file, options?.includeDrafts)
    }
  }
  return null
}

export function getAllSlugs(options?: { includeDrafts?: boolean }): string[] {
  return getAllPosts(options).map((p) => p.slug)
}

export function formatPostDate(iso: string) {
  const raw = String(iso ?? "")
  const d = new Date(raw.includes("T") ? raw : `${raw.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
