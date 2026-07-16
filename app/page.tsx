import Link from "next/link"
import { defaultData } from "@/lib/default-data"
import { OsStage } from "@/components/peteros/os-stage"

export default function Home() {
  const { personalInfo, experiences, education, projects } = defaultData
  const deloitte = experiences.find((e) => e.company === "Deloitte")
  const otherNow = experiences.filter((e) => e.current && e.company !== "Deloitte")

  return (
    <main className="home">
      <header className="home-hero">
        <p className="home-big">
          Zhongquan is joining
          <br />
          <a
            className="home-underline"
            href="https://www.deloitte.com"
            target="_blank"
            rel="noreferrer"
          >
            Deloitte
          </a>
          <br />
          for{" "}
          <span className="home-underline">Technology Transformation</span>.
        </p>
      </header>

      <section className="home-meta">
        <p className="home-small">
          {personalInfo.title}
          {deloitte ? " · Analyst 1 · Full-time" : ""}.{" "}
          {otherNow.length > 0 ? (
            <>
              Currently also{" "}
              {otherNow.map((e, i) => (
                <span key={e.id}>
                  {i > 0 ? "; " : ""}
                  {e.title} at {e.company}
                </span>
              ))}
              .{" "}
            </>
          ) : null}
          {education[0]
            ? `${education[0].degree} · ${education[0].school}. `
            : null}
          <span className="home-last-seen">Based in {personalInfo.location}.</span>
        </p>

        <div className="home-cols">
          <div>
            <p className="home-label">Explore</p>
            <ul className="home-vlist">
              <li>
                <button type="button" className="home-text-btn" data-open-peteros>
                  PeterOS
                </button>
              </li>
              <li>
                <Link href="/os">Full desktop</Link>
              </li>
              <li>
                <a href="/resume.pdf" target="_blank" rel="noreferrer">
                  Résumé
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="home-label">Past work</p>
            <ul className="home-vlist" id="work">
              {experiences.slice(0, 6).map((e) => (
                <li key={e.id}>
                  <span className="home-work-name">
                    {e.company.split("·")[0].trim()}
                  </span>
                  <span className="home-work-dim">
                    {e.current
                      ? e.company === "Deloitte"
                        ? " · incoming"
                        : " · now"
                      : e.endDate
                        ? ` · ${e.endDate.slice(0, 4)}`
                        : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="home-label">Projects</p>
            <ul className="home-vlist">
              {projects.map((p) => (
                <li key={p.id}>
                  <span>{p.title}</span>
                  {p.year ? (
                    <span className="home-work-dim"> · {p.year}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-col">
          <ul className="home-hlist">
            <li>
              <a href={`mailto:${personalInfo.email}`}>Email</a>
            </li>
            {personalInfo.github && (
              <li>
                <a href={personalInfo.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            )}
            {personalInfo.linkedin && (
              <li>
                <a href={personalInfo.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
            )}
          </ul>
        </div>
        <div className="home-footer-col home-footer-right">
          <button type="button" className="home-text-btn" data-open-peteros>
            Explore PeterOS
          </button>
        </div>
      </footer>

      <OsStage />
    </main>
  )
}
