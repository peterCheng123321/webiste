"use client"

import React, { useState } from "react"
import { ArrowUpRight } from "lucide-react"

/**
 * Contact form that composes a pre-filled message in the visitor's own email
 * client via a `mailto:` link. No backend required — submitting hands the draft
 * (subject + body) off to whatever mail app the visitor uses.
 */
export function ContactForm({ email }: { email: string }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = `Portfolio inquiry from ${formData.name || "a visitor"}`
    const body = `${formData.message}\n\n— ${formData.name}${
      formData.email ? ` <${formData.email}>` : ""
    }`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="col-span-12 md:col-span-7 space-y-8 reveal"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="form-field">
          <label htmlFor="name" className="eyebrow">
            01 · Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Your name"
          />
        </div>
        <div className="form-field">
          <label htmlFor="email" className="eyebrow">
            02 · Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="you@domain.com"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="message" className="eyebrow">
          03 · Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="form-input resize-none"
          placeholder="Tell me what you're building…"
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <span className="eyebrow">
          {submitted
            ? `— Opening your email app. If nothing happens, write to ${email}.`
            : "Opens a draft in your email app."}
        </span>
        <button type="submit" className="btn btn-solid">
          Compose email <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
