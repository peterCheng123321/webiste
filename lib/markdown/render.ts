import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkSmartypants from "remark-smartypants"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeExternalLinks from "rehype-external-links"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeStringify from "rehype-stringify"
import type { RenderedMarkdown } from "./types"
import { extractHeadings } from "./headings"

/** Sanitize schema: GFM + pretty-code attributes + safe anchors/images */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className"],
      ["data-language"],
      ["data-theme"],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      ["className"],
      ["data-language"],
      ["data-theme"],
      ["style"],
      ["tabindex"],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className"],
      ["style"],
      ["data-line"],
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ["className"],
      ["data-rehype-pretty-code-fragment"],
      ["data-rehype-pretty-code-title"],
      ["data-language"],
      ["data-theme"],
    ],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["className"],
      ["ariaHidden"],
      ["tabIndex"],
      "target",
      "rel",
    ],
    h1: [...(defaultSchema.attributes?.h1 ?? []), ["id"], ["className"]],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ["id"], ["className"]],
    h3: [...(defaultSchema.attributes?.h3 ?? []), ["id"], ["className"]],
    h4: [...(defaultSchema.attributes?.h4 ?? []), ["id"], ["className"]],
    h5: [...(defaultSchema.attributes?.h5 ?? []), ["id"], ["className"]],
    h6: [...(defaultSchema.attributes?.h6 ?? []), ["id"], ["className"]],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["className"],
      "loading",
      "decoding",
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "div",
    "span",
    "section",
    "figure",
    "figcaption",
  ],
}

/**
 * Full markdown → HTML pipeline (server / build time).
 * GFM, smart quotes, syntax highlighting, heading anchors, external links.
 */
export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const headings = extractHeadings(markdown)

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm, { singleTilde: false })
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: {
        className: ["blog-heading-link"],
      },
    })
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
      protocols: ["http", "https", "mailto"],
    })
    .use(rehypePrettyCode, {
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      keepBackground: false,
      defaultLang: "plaintext",
      onVisitLine(node) {
        // Prevent empty lines from collapsing
        if (node.children.length === 0) {
          node.children = [{ type: "text", value: " " }]
        }
      },
    })
    .use(rehypeStringify)
    .process(markdown)

  return {
    html: String(file),
    headings,
  }
}
