import type React from "react"
import "./globals.css"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { TrafficTracker } from "@/components/traffic-tracker"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata = {
  title: "Zhongquan Cheng — Analyst · Technology Transformation",
  description:
    "Zhongquan Cheng — Incoming Analyst 1 at Deloitte Technology Transformation in Shanghai. M.S. Computer Science at WashU. Backend engineering, applied ML, and PeterOS.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans`}
      >
        {children}
        <TrafficTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
