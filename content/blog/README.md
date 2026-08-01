# Notes / blog

Markdown posts for [petercheng.dev/blog](https://petercheng.dev/blog).

## Author a post

Create `content/blog/your-slug.md`:

```md
---
title: "Your title"
description: "One-line summary for the index and SEO"
date: 2026-08-01
updated: 2026-08-02   # optional
tags:
  - systems
  - agents
draft: false          # true = hidden from public list
canonical: https://...  # optional
source: substack        # optional
image: /path/or/url     # optional
---

Write **GitHub-flavored Markdown** here.

## Headings become anchors

- Tables, task lists, strikethrough
- Footnotes (GFM)
- Fenced code with language tags:

\`\`\`ts
export const ok = true
\`\`\`

> Blockquotes work.

![Alt text](https://example.com/image.png)
```

## Features

| Feature | Status |
|--------|--------|
| YAML frontmatter | required `title` + `date` |
| GFM (tables, task lists, strikethrough) | yes |
| Smart punctuation | yes |
| Syntax highlighting (Shiki) | yes — language on fence |
| Heading IDs + deep links | yes |
| Table of contents | auto when ≥2 `##` / `###` |
| External links | `target=_blank` + `rel=noopener` |
| Drafts | `draft: true` |
| Reading analytics | views, scroll, complete |

## Publish

```bash
git add content/blog/your-slug.md
git commit -m "Add note: your-slug"
git push origin main
```

Vercel rebuilds static `/blog` and `/blog/your-slug`.
