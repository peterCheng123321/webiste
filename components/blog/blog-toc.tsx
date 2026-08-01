import type { Heading } from "@/lib/markdown"

export function BlogToc({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null

  return (
    <nav className="blog-toc" aria-label="On this page">
      <p className="blog-toc-label">On this page</p>
      <ol className="blog-toc-list">
        {headings.map((h) => (
          <li
            key={h.id}
            className={
              h.level === 3 ? "blog-toc-item blog-toc-item-h3" : "blog-toc-item"
            }
          >
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
