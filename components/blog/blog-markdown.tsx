import { renderMarkdown } from "@/lib/markdown"
import { BlogToc } from "./blog-toc"

type Props = {
  content: string
  slug: string
  showToc?: boolean
}

/**
 * Server-rendered markdown: GFM, smart punctuation, Shiki code blocks,
 * heading anchors, external-link safety, optional TOC.
 */
export async function BlogMarkdown({ content, slug, showToc = true }: Props) {
  const { html, headings } = await renderMarkdown(content)

  return (
    <div className="blog-md" data-slug={slug}>
      {showToc && headings.length >= 2 ? <BlogToc headings={headings} /> : null}
      <div
        className="blog-prose"
        // HTML is produced by our rehype pipeline + sanitize step.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
