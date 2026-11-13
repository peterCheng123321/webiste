"use client"

import { useState } from "react"
import {
  Glass,
  GLASS_MATERIALS,
  DEFAULT_GLASS_MATERIAL,
  DEFAULT_TRANSLUCENT_MATERIAL,
  type GlassMaterial,
  type GlassTone,
} from "@/components/glass"
import "./preview.css"

const LABELS: Record<GlassMaterial, string> = {
  solid: "Solid fallback (default)",
  regular: "Regular frost",
  thin: "Thin lens",
  clear: "Clear dim",
  chrome: "Frost plus Chrome lens",
}

export default function GlassPreviewPage() {
  const [material, setMaterial] = useState<GlassMaterial>(DEFAULT_GLASS_MATERIAL)
  const [tone, setTone] = useState<GlassTone>("light")

  return (
    <main className="glass-preview">
      <header className="glass-preview__header">
        <p className="glass-preview__kicker">Preview only · not site chrome</p>
        <h1 className="glass-preview__title">Glass surface</h1>
        <p className="glass-preview__lede">
          Default path is the solid opaque plate. Switch material without
          changing callers. Page background stays editorial paper.
        </p>
      </header>

      <div className="glass-preview__controls" role="group" aria-label="Glass options">
        <label className="glass-preview__field">
          <span>Material</span>
          <select
            value={material}
            onChange={(event) => setMaterial(event.target.value as GlassMaterial)}
          >
            {GLASS_MATERIALS.map((option) => (
              <option key={option} value={option}>
                {LABELS[option]}
                {option === DEFAULT_TRANSLUCENT_MATERIAL ? " (recommended translucent)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="glass-preview__field">
          <span>Tone</span>
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as GlassTone)}
          >
            <option value="light">Light glass</option>
            <option value="dark">Dark glass</option>
          </select>
        </label>
      </div>

      <section className="glass-preview__stage" aria-label="Glass sample stage">
        <div className="glass-preview__field-split" aria-hidden="true">
          <div className="glass-preview__half glass-preview__half--paper">Paper</div>
          <div className="glass-preview__half glass-preview__half--ink">Ink</div>
        </div>

        <Glass
          className="glass-preview__sample"
          material={material}
          tone={tone}
          aria-label={`${LABELS[material]}, ${tone} tone`}
        >
          <p className="glass-preview__sample-label">Label</p>
          <p className="glass-preview__sample-secondary glass-muted">Secondary</p>
        </Glass>
      </section>

      <section className="glass-preview__bar-demo" aria-label="Nav-shaped sample">
        <Glass className="glass-preview__bar" material={material} tone={tone} as="nav">
          <span>Peter Cheng · 程钟泉</span>
          <span className="glass-muted">Work · Contact · Résumé</span>
        </Glass>
      </section>

      <p className="glass-preview__note">
        Active: <strong>{LABELS[material]}</strong> · {tone}. Reduced transparency
        and missing backdrop-filter both force the solid plate.
      </p>
    </main>
  )
}
