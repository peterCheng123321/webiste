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
        <Link href="/" className="blog-top-brand">Zhongquan Cheng</Link>
        <span className="blog-top-edition">Note · field record</span>
        <Link href="/blog" className="blog-top-site">All notes</Link>
      </header>

      <article className="blog-article">
        <header className="blog-article-head">
          <div>
            <p className="blog-kicker">
              {(post.tags ?? []).slice(0, 2).join(" · ") || "Field note"}
            </p>
            <h1 className="blog-article-title">{post.title}</h1>
          </div>
          <dl className="blog-article-meta">
            <div><dt>Published</dt><dd><time dateTime={post.date}>{formatPostDate(post.date)}</time></dd></div>
            <div><dt>Reading</dt><dd>{post.readingMinutes} minutes</dd></div>
            <div><dt>Edition</dt><dd>01 · web</dd></div>
            <div><dt>Status</dt><dd>Published</dd></div>
          </dl>
        </header>

        {post.description ? (
          <section className="blog-article-deck" aria-label="Article summary">
            <span className="blog-article-deck-label">In brief</span>
            <p>{post.description}</p>
            <span className="blog-article-deck-tags">
              {(post.tags ?? []).join(" · ")}
            </span>
          </section>
        ) : null}

        <BlogMarkdown
          content={post.content}
          slug={post.slug}
          aside={
            <aside className="blog-article-signals" aria-label="Article details">
              <p className="blog-rail-label">Record</p>
              <dl>
                <div><dt>Reading time</dt><dd>{post.readingMinutes}<small>minutes</small></dd></div>
                <div><dt>Topics</dt><dd>{post.tags?.length ?? 0}<small>{(post.tags ?? []).join(" · ") || "general"}</small></dd></div>
                <div><dt>Year</dt><dd>{post.date.slice(0, 4)}<small>field notes</small></dd></div>
              </dl>
            </aside>
          }
        />
      </article>

      <footer className="blog-foot">
        <Link href="/blog">All notes</Link>
        <Link href="/">Portfolio</Link>
        <a
          href="https://substack.com/@petercheng2"
          target="_blank"
          rel="noreferrer"
        >
          Substack
        </a>
        <a href="mailto:chengzhongquan0630@gmail.com">Email</a>
        <span className="blog-foot-mark">End · {post.slug}</span>
      </footer>
    </main>
  )
}
