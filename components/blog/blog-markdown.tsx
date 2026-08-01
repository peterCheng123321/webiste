"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { track } from "@/lib/track"

type Props = {
  content: string
  slug: string
}

export function BlogMarkdown({ content, slug }: Props) {
  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const external = Boolean(href && /^https?:\/\//i.test(href))
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                onClick={() => {
                  if (external && href) {
                    try {
                      const u = new URL(href)
                      track("blog_outbound", {
                        slug,
                        host: u.hostname,
                      })
                    } catch {
                      /* ignore */
                    }
                  }
                }}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
