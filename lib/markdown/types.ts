export type MarkdownFrontmatter = {
  title: string
  description?: string
  date: string
  updated?: string
  tags?: string[]
  draft?: boolean
  source?: string
  canonical?: string
  /** Optional hero image path or URL */
  image?: string
}

export type Heading = {
  id: string
  text: string
  level: 2 | 3
}

export type RenderedMarkdown = {
  html: string
  headings: Heading[]
}
