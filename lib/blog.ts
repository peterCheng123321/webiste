import fs from "fs"
import path from "path"
import {
  parseMarkdownDocument,
  readingMinutes,
  type MarkdownFrontmatter,
} from "@/lib/markdown"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export type BlogFrontmatter = MarkdownFrontmatter

export type BlogPostMeta = BlogFrontmatter & {
  slug: string
  readingMinutes: number
}

export type BlogPost = BlogPostMeta & {
  content: string
}

function ensureDir() {
  return fs.existsSync(BLOG_DIR)
}

function parseFile(filename: string, includeDrafts = false): BlogPost | null {
  const full = path.join(BLOG_DIR, filename)
  const raw = fs.readFileSync(full, "utf8")
  const doc = parseMarkdownDocument(raw)
  if (!doc) return null
  if (doc.frontmatter.draft && !includeDrafts) return null

  const slug = filename.replace(/\.mdx?$/, "")

  return {
    slug,
    ...doc.frontmatter,
    content: doc.content,
    readingMinutes: readingMinutes(doc.content),
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
