import Link from "next/link"
import type { Metadata } from "next"
import { formatPostDate, getAllPosts } from "@/lib/blog"
import { BlogListTracker } from "@/components/blog/blog-list-tracker"

export const metadata: Metadata = {
  title: "Notes — Zhongquan Cheng",
  description:
    "Writing from Zhongquan (Peter) Cheng — systems notes, research crumbs, and career logs.",
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <main className="blog">
      <header className="blog-top">
        <Link href="/" className="blog-top-back">
          ← Zhongquan Cheng
        </Link>
        <a href="https://petercheng.dev" className="blog-top-site">
          petercheng.dev
        </a>
      </header>

      <div className="blog-hero">
        <p className="blog-kicker">Notes</p>
        <h1 className="blog-title">Writing</h1>
        <p className="blog-lede">
          Systems, research, and career breadcrumbs. Posts live as Markdown in
          the site repo — versioned on GitHub, tracked for reading.
        </p>
      </div>

      <BlogListTracker count={posts.length} />

      {posts.length === 0 ? (
        <p className="blog-empty">No published posts yet.</p>
      ) : (
        <ol className="blog-list">
          {posts.map((post, i) => (
            <li key={post.slug} className="blog-list-item">
              <span className="blog-list-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="blog-list-body">
                <Link href={`/blog/${post.slug}`} className="blog-list-link">
                  {post.title}
                </Link>
                {post.description ? (
                  <p className="blog-list-desc">{post.description}</p>
                ) : null}
                <p className="blog-list-meta">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden="true"> · </span>
                  <span>{post.readingMinutes} min</span>
                  {post.tags && post.tags.length > 0 ? (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span>{post.tags.join(", ")}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <footer className="blog-foot">
        <Link href="/">Home</Link>
        <a href="/resume.pdf" target="_blank" rel="noreferrer">
          Résumé
        </a>
        <a href="mailto:chengzhongquan0630@gmail.com">Email</a>
      </footer>
    </main>
  )
}
