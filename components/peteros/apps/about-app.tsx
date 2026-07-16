"use client"

import { useState } from "react"
import { defaultData } from "@/lib/default-data"

type Tab = "overview" | "experience" | "skills" | "contact"

export function AboutApp() {
  const { personalInfo, education, experiences, skills, awards, languages } = defaultData
  const [tab, setTab] = useState<Tab>("overview")
  const deloitte = experiences.find((e) => e.company === "Deloitte")
  const current = experiences.filter((e) => e.current)

  return (
    <div className="mac-app about-app">
      <div className="mac-toolbar">
        {(
          [
            ["overview", "Overview"],
            ["experience", "Experience"],
            ["skills", "Skills"],
            ["contact", "Contact"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "mac-seg active" : "mac-seg"}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mac-app-body">
        {tab === "overview" && (
          <div className="about-overview">
            <div className="about-hero-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={personalInfo.photo} alt="" className="about-avatar" />
              <div className="about-hero-text">
                <h2>{personalInfo.name}</h2>
                <p className="about-sub">{personalInfo.title}</p>
                {deloitte && (
                  <span className="about-badge">Incoming · Deloitte TT · Analyst 1</span>
                )}
              </div>
            </div>

            <div className="about-spec-grid">
              <Spec label="Role" value="Analyst 1 · Tech Transformation" />
              <Spec label="Firm" value="Deloitte (full-time)" />
              <Spec label="Education" value={education[0]?.degree ?? "—"} />
              <Spec label="School" value="WashU · Syracuse" />
              <Spec label="Based in" value={personalInfo.location} />
              <Spec label="Focus" value="Backend · Applied ML · CV" />
            </div>

            <p className="about-bio">{personalInfo.bio}</p>

            <div className="about-now">
              <h3>Currently</h3>
              <div className="about-now-row">
                {current.map((e) => (
                  <div key={e.id} className="about-now-card">
                    <span className="about-now-dot" />
                    <strong>{e.company.split("·")[0].trim()}</strong>
                    <span>{e.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "experience" && (
          <div className="about-timeline">
            {experiences.map((e) => (
              <article key={e.id} className="about-exp-card">
                <div className="about-exp-rail">
                  <span className={e.current ? "about-exp-dot on" : "about-exp-dot"} />
                </div>
                <div className="about-exp-body">
                  <header>
                    <strong>{e.title}</strong>
                    <span className="about-exp-meta">
                      {e.company}
                      {e.current ? " · now" : e.endDate ? ` · ${e.endDate.slice(0, 4)}` : ""}
                    </span>
                  </header>
                  <ul>
                    {e.description.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
            {awards.length > 0 && (
              <div className="about-awards">
                <h3>Awards</h3>
                {awards.map((a) => (
                  <div key={a.id} className="about-award-chip">
                    <strong>{a.title}</strong>
                    <span>
                      {a.organization} · {a.year}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "skills" && (
          <div className="about-skills">
            {(
              [
                ["languages", "Languages"],
                ["ml", "ML & Data"],
                ["mobile", "Mobile & Reality"],
                ["tools", "Platforms"],
              ] as const
            ).map(([cat, title]) => (
              <section key={cat}>
                <h3>{title}</h3>
                <div className="about-skill-cloud">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <span key={s.id} className="about-skill-pill">
                        {s.name}
                      </span>
                    ))}
                </div>
              </section>
            ))}
            <section>
              <h3>Languages</h3>
              <div className="about-skill-cloud">
                {languages.map((l) => (
                  <span key={l.id} className="about-skill-pill soft">
                    {l.name} · {l.level}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "contact" && (
          <div className="about-contact">
            <a className="about-contact-btn primary" href={`mailto:${personalInfo.email}`}>
              <span className="about-contact-ico">✉</span>
              <span>
                <strong>Email</strong>
                <small>{personalInfo.email}</small>
              </span>
            </a>
            {personalInfo.linkedin && (
              <a
                className="about-contact-btn"
                href={personalInfo.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <span className="about-contact-ico">in</span>
                <span>
                  <strong>LinkedIn</strong>
                  <small>zhongquan-cheng</small>
                </span>
              </a>
            )}
            {personalInfo.github && (
              <a
                className="about-contact-btn"
                href={personalInfo.github}
                target="_blank"
                rel="noreferrer"
              >
                <span className="about-contact-ico">⌥</span>
                <span>
                  <strong>GitHub</strong>
                  <small>petercheng123321</small>
                </span>
              </a>
            )}
            <a className="about-contact-btn" href={`tel:${personalInfo.phone.replace(/\s/g, "")}`}>
              <span className="about-contact-ico">☎</span>
              <span>
                <strong>Phone</strong>
                <small>{personalInfo.phone}</small>
              </span>
            </a>
            <a className="about-contact-btn" href="/resume.pdf" target="_blank" rel="noreferrer">
              <span className="about-contact-ico">⬇</span>
              <span>
                <strong>Download résumé</strong>
                <small>PDF</small>
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="about-spec">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
