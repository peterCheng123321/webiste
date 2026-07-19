import Link from "next/link"
import { defaultData } from "@/lib/default-data"
import { OsStage } from "@/components/peteros/os-stage"
import { ShanghaiDayProgress } from "@/components/shanghai-day-progress"

const FEATURED_EXPERIENCE_IDS = ["exp0", "res1", "exp1", "res2", "exp2"]

export default function Home() {
  const { personalInfo, experiences, education, projects } = defaultData
  const featuredExperiences = FEATURED_EXPERIENCE_IDS.flatMap((id) => {
    const experience = experiences.find((item) => item.id === id)
    return experience ? [experience] : []
  })

  return (
    <main className="home">
      <div className="home-grid" aria-hidden="true" />
      <div className="home-ambient" aria-hidden="true" />

      <div className="home-plate">
        <span className="home-plate-name">{personalInfo.name}</span>
        <span className="home-plate-place">
          {personalInfo.location} · UTC+08:00
        </span>
      </div>

      <header className="home-hero">
        <h1 className="home-big">
          Peter is joining{" "}
          <a
            className="home-underline"
            href="https://www.deloitte.com"
            target="_blank"
            rel="noreferrer"
          >
            Deloitte
          </a>.
        </h1>
      </header>

      <ShanghaiDayProgress />

      <section className="home-meta">
        <p className="home-small">
          Technology transformation · backend systems · applied research.
          <span className="home-small-secondary">
            {education[0] ? ` ${education[0].degree} · WashU` : ""} ·{" "}
            {personalInfo.location}.
          </span>
        </p>

        <div className="home-index">
          <nav
            className="home-index-panel home-index-explore"
            aria-labelledby="home-explore-heading"
          >
            <div className="home-index-head">
              <h2 className="home-label" id="home-explore-heading">
                <span aria-hidden="true">01</span> Explore
              </h2>
              <span className="home-index-note">Enter</span>
            </div>
            <ul className="home-index-list home-index-actions">
              <li>
                <button
                  type="button"
                  className="home-index-link home-text-btn"
                  data-open-peteros
                >
                  <span>Open PeterOS</span>
                  <span className="home-index-sub">Interactive desktop</span>
                </button>
              </li>
              <li>
                <Link className="home-index-link" href="/os">
                  <span>Full desktop</span>
                  <span className="home-index-sub">Dedicated route</span>
                </Link>
              </li>
              <li>
                <a
                  className="home-index-link"
                  href="/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Résumé</span>
                  <span className="home-index-sub">PDF</span>
                </a>
              </li>
            </ul>
          </nav>

          <section
            className="home-index-panel home-index-experience"
            aria-labelledby="home-experience-heading"
          >
            <div className="home-index-head">
              <h2 className="home-label" id="home-experience-heading">
                <span aria-hidden="true">02</span> Experience
              </h2>
              <span className="home-index-note">
                {featuredExperiences.length} roles
              </span>
            </div>
            <ol className="home-index-list" id="work">
              {featuredExperiences.map((experience, index) => (
                <li className="home-index-row" key={experience.id}>
                  <span className="home-index-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="home-index-copy">
                    <span className="home-index-title">
                      {experience.company}
                    </span>
                    <span className="home-index-sub">{experience.title}</span>
                  </span>
                  <span className="home-index-meta">
                    <span>{experience.type === "research" ? "Research" : "Work"}</span>
                    <span>
                      {experience.company === "Deloitte"
                        ? "Incoming"
                        : experience.current
                          ? "Now"
                          : experience.endDate.slice(0, 4)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="home-index-panel home-index-projects"
            aria-labelledby="home-projects-heading"
          >
            <div className="home-index-head">
              <h2 className="home-label" id="home-projects-heading">
                <span aria-hidden="true">03</span> Projects
              </h2>
              <span className="home-index-note">Selected</span>
            </div>
            <ol className="home-index-list">
              {projects.map((project, index) => (
                <li className="home-index-row" key={project.id}>
                  <span className="home-index-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="home-index-copy">
                    <span className="home-index-title">{project.title}</span>
                    {project.subtitle ? (
                      <span className="home-index-sub">{project.subtitle}</span>
                    ) : null}
                  </span>
                  {project.year ? (
                    <span className="home-index-meta">{project.year}</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-col">
          <p className="home-footer-whisper">Zhongquan · Peter</p>
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
