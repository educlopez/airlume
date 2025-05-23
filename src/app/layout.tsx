import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "next-themes"

import { baseUrl } from "./sitemap"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Airlume | AI-Powered Content Generation",
    template: "%s | Airlume",
  },
  description:
    "Airlume is a modern tool to generate social media posts using smart presets, reusable prompts, and a streamlined interface.",
  openGraph: {
    title: "Airlume | AI-Powered Content Generation",
    description:
      "Airlume is a modern tool to generate social media posts using smart presets, reusable prompts, and a streamlined interface.",
    url: baseUrl,
    siteName: "Airlume",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `/opengraph-image.jpg`,
        width: 800,
        height: 600,
      },
      {
        url: `/opengraph-image.jpg`,
        width: 1800,
        height: 1600,
      },
    ],
  },
  twitter: {
    title: "Airlume | AI-Powered Content Generation",
    description:
      "Airlume is a modern tool to generate social media posts using smart presets, reusable prompts, and a streamlined interface.",
    images: [
      {
        url: `/opengraph-image.jpg`,
        width: 800,
        height: 600,
      },
      {
        url: `/opengraph-image.jpg`,
        width: 1800,
        height: 1600,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {process.env.NODE_ENV === "production" && (
            <script
              defer
              src="https://cloud.umami.is/script.js"
              data-website-id="79cc1f27-28ad-42b8-b452-efb8858a0730"
            ></script>
          )}
        </head>
        <body
          className={`${geistMono.variable} ${geistSans.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
