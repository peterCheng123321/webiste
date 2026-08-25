"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type Filter = "all" | "systems" | "ai" | "field"

type Post = {
  slug: string
  title: string
  description?: string
  date: string
  formattedDate: string
  readingMinutes: number
  tags?: string[]
}

function groupsFor(post: Post) {
  const terms = `${post.title} ${(post.tags ?? []).join(" ")}`.toLowerCase()
  const groups = new Set<Filter>()
  if (/systems?|backend|local-first|loop|gateway/.test(terms)) groups.add("systems")
  if (/ai|llm|agents?|research|local-first/.test(terms)) groups.add("ai")
  if (/career|deloitte|shanghai|product|notes|meta/.test(terms)) groups.add("field")
  if (groups.size === 0) groups.add("field")
  return groups
}

export function BlogIndexList({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<Filter>("all")
  const visible = useMemo(
    () => posts.filter((post) => filter === "all" || groupsFor(post).has(filter)),
    [filter, posts],
  )

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: "All" },
    { id: "systems", label: "Systems" },
    { id: "ai", label: "AI + research" },
    { id: "field", label: "Field notes" },
  ]

  return (
    <>
      <div className="blog-controls" aria-label="Filter notes">
        <span className="blog-controls-label">Index</span>
        <div className="blog-filters">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`blog-filter${filter === item.id ? " is-active" : ""}`}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="blog-controls-count">
          {String(visible.length).padStart(2, "0")} {visible.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <ol className="blog-list">
        {visible.map((post) => {
          const originalIndex = posts.findIndex((item) => item.slug === post.slug)
          return (
            <li key={post.slug} className="blog-list-item">
              <span className="blog-list-num" aria-hidden="true">
                {String(originalIndex + 1).padStart(2, "0")}
              </span>
              <div className="blog-list-body">
                <Link href={`/blog/${post.slug}`} className="blog-list-link">
                  {post.title}
                </Link>
                {post.description ? <p className="blog-list-desc">{post.description}</p> : null}
              </div>
              <p className="blog-list-tags">
                {(post.tags ?? []).slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
              </p>
              <p className="blog-list-meta">
                <time dateTime={post.date}>{post.formattedDate}</time>
                <span>{post.readingMinutes} min</span>
              </p>
            </li>
          )
        })}
      </ol>
    </>
  )
}
