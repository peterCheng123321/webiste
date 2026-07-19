"use client"

import { AppIcon } from "../app-icon"
import { usePeterOS } from "../context"

export function ResumeApp() {
  const { appearance } = usePeterOS()

  return (
    <div className="mac-app resume-app">
      <aside className="resume-inspector" aria-label="Document information">
        <div className="resume-file-hero">
          <AppIcon id="resume" size={72} appearance={appearance} open />
          <div>
            <h2>resume.pdf</h2>
            <p>PDF document</p>
          </div>
        </div>

        <dl className="resume-file-meta">
          <div>
            <dt>Pages</dt>
            <dd>1</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>105 KB</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>US Letter</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>Feb 19, 2026</dd>
          </div>
        </dl>

        <div className="resume-file-actions">
          <a className="mac-btn primary" href="/resume.pdf" download data-window-focus>
            Download
          </a>
          <a className="mac-btn" href="/resume.pdf" target="_blank" rel="noreferrer">
            Open in Browser
          </a>
        </div>

        <p className="resume-inspector-note">
          Public résumé · one-page preview
        </p>
      </aside>

      <section className="resume-viewer" aria-label="Résumé preview">
        <div className="resume-viewer-bar">
          <span>resume.pdf</span>
          <span className="resume-viewer-hint">1 page · Fit width</span>
        </div>
        <iframe
          src="/resume.pdf#view=FitH&toolbar=1"
          title="Résumé PDF preview"
          className="resume-iframe"
        />
        <div className="resume-viewer-status">
          <span>Page 1 of 1</span>
          <a href="/resume.pdf" target="_blank" rel="noreferrer">
            Open PDF in new tab
          </a>
        </div>
      </section>
    </div>
  )
}
