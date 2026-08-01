import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  formatPostDate,
  getAllSlugs,
  getPostBySlug,
} from "@/lib/blog"
import { BlogMarkdown } from "@/components/blog/blog-markdown"
import { BlogReadingTracker } from "@/components/blog/blog-reading-tracker"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: "Not found" }
  return {
    title: `${post.title} — Zhongquan Cheng`,
    description: post.description || undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="blog blog-post-page">
      <BlogReadingTracker slug={post.slug} title={post.title} />

      <header className="blog-top">
        <Link href="/blog" className="blog-top-back">
          ← Notes
        </Link>
        <Link href="/" className="blog-top-site">
          Home
        </Link>
      </header>

      <article className="blog-article">
        <header className="blog-article-head">
          <p className="blog-kicker">Note</p>
          <h1 className="blog-article-title">{post.title}</h1>
          <p className="blog-article-meta">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true"> · </span>
            <span>{post.readingMinutes} min read</span>
            {post.tags && post.tags.length > 0 ? (
              <>
                <span aria-hidden="true"> · </span>
                <span>{post.tags.join(" · ")}</span>
              </>
            ) : null}
          </p>
          {post.description ? (
            <p className="blog-article-desc">{post.description}</p>
          ) : null}
        </header>

        <BlogMarkdown content={post.content} slug={post.slug} />
      </article>

      <footer className="blog-foot">
        <Link href="/blog">All notes</Link>
        <Link href="/">Home</Link>
        <a href="mailto:chengzhongquan0630@gmail.com">Email</a>
      </footer>
    </main>
  )
}
