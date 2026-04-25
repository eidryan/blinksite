import type React from "react"
import type { Metadata } from "next"
import { Geist as GeistSans, Geist_Mono as GeistMono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = GeistSans({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = GeistMono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Blink Dashboard",
  description: "Painel de acompanhamento de projetos Blink",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-foreground antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
