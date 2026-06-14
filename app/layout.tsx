import type React from "react"
import "./globals.css"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"

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
  title: "Zhongquan Cheng — Software Engineer & Researcher",
  description:
    "Portfolio of Zhongquan Cheng — M.S. Computer Science at Washington University in St. Louis. Backend engineering, applied ML, and computer-vision research.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-surface="paper">
      <head>
        {/* Apply the saved Paper/Ink surface before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=localStorage.getItem('zc-surface');if(s==='ink'||s==='paper')document.documentElement.setAttribute('data-surface',s)}catch(e){}",
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  )
}
