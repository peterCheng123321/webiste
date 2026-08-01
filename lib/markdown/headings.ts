import type { Heading } from "./types"

/**
 * Extract h2/h3 headings from markdown source for TOC.
 * Ignores fenced code blocks so `#` in examples is not treated as a heading.
 */
export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n")
  const headings: Heading[] = []
  let inFence = false

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue

    const level = m[1].length as 2 | 3
    const text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim()
    if (!text) continue

    headings.push({
      id: slugify(text),
      text,
      level,
    })
  }

  return dedupeIds(headings)
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function dedupeIds(headings: Heading[]): Heading[] {
  const seen = new Map<string, number>()
  return headings.map((h) => {
    const n = seen.get(h.id) ?? 0
    seen.set(h.id, n + 1)
    if (n === 0) return h
    return { ...h, id: `${h.id}-${n}` }
  })
}
