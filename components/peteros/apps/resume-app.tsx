"use client"

import { defaultData } from "@/lib/default-data"

export function ResumeApp() {
  const { personalInfo, education, experiences, skills } = defaultData
  const topSkills = skills.slice(0, 10)
  const headline = experiences.filter((e) => e.current).slice(0, 2)

  return (
    <div className="mac-app resume-app">
      <aside className="resume-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={personalInfo.photo} alt="" className="resume-side-photo" />
        <h2>{personalInfo.name}</h2>
        <p>{personalInfo.title}</p>

        <div className="resume-side-stats">
          <div>
            <strong>{experiences.length}</strong>
            <span>roles</span>
          </div>
          <div>
            <strong>{education.length}</strong>
            <span>degrees</span>
          </div>
          <div>
            <strong>{skills.length}</strong>
            <span>skills</span>
          </div>
        </div>

        <h3>Highlights</h3>
        <ul className="resume-side-list">
          {headline.map((e) => (
            <li key={e.id}>
              <strong>{e.company.split("·")[0].trim()}</strong>
              <span>{e.title}</span>
            </li>
          ))}
          {education[0] && (
            <li>
              <strong>{education[0].school.split(" ").slice(0, 2).join(" ")}</strong>
              <span>{education[0].degree}</span>
            </li>
          )}
        </ul>

        <h3>Stack</h3>
        <div className="resume-side-skills">
          {topSkills.map((s) => (
            <span key={s.id}>{s.name}</span>
          ))}
        </div>

        <div className="resume-side-actions">
          <a className="mac-btn primary" href="/resume.pdf" download>
            Download PDF
          </a>
          <a className="mac-btn" href="/resume.pdf" target="_blank" rel="noreferrer">
            Open in tab
          </a>
        </div>
      </aside>

      <div className="resume-viewer">
        <div className="resume-viewer-bar">
          <span>resume.pdf</span>
          <span className="resume-viewer-hint">scroll · zoom with browser controls</span>
        </div>
        <iframe src="/resume.pdf#view=FitH" title="Resume PDF" className="resume-iframe" />
      </div>
    </div>
  )
}
