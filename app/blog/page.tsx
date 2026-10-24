import Link from "next/link"
import type { Metadata } from "next"
import { formatPostDate, getAllPosts } from "@/lib/blog"
import { BlogIndexList } from "@/components/blog/blog-index-list"
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
        <Link href="/" className="blog-top-brand">
          Zhongquan Cheng
        </Link>
        <span className="blog-top-edition">
          Notes · {String(posts.length).padStart(3, "0")} entries
        </span>
        <Link href="/" className="blog-top-site">Portfolio</Link>
      </header>

      <section className="blog-hero" aria-labelledby="notes-title">
        <div>
          <p className="blog-kicker">Field notes · systems · work</p>
          <h1 className="blog-title" id="notes-title">Notes from<br />the work.</h1>
        </div>
        <p className="blog-lede">
          <strong>Working memory, made public.</strong> Systems lessons, research
          crumbs, and career logs—edited for signal, kept close to the work that
          produced them.
        </p>
      </section>

      <BlogListTracker count={posts.length} />

      {posts.length === 0 ? (
        <p className="blog-empty">No published posts yet.</p>
      ) : (
        <BlogIndexList
          posts={posts.map((post) => ({
            ...post,
            formattedDate: formatPostDate(post.date),
          }))}
        />
      )}

      <footer className="blog-foot">
        <Link href="/">Portfolio</Link>
        <a
          href="https://substack.com/@petercheng2"
          target="_blank"
          rel="noreferrer"
        >
          Substack
        </a>
        <a href="/resume.pdf" target="_blank" rel="noreferrer">
          Résumé
        </a>
        <a href="mailto:chengzhongquan0630@gmail.com">Email</a>
        <span className="blog-foot-mark">Shanghai · 2026</span>
      </footer>
    </main>
  )
}
