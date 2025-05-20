"use client"

import React from "react"
import Image from "next/image"

import { Card, CardContent } from "./card"

export default function BlueskyPromoImage({
  src,
  alt,
}: {
  src: string
  alt?: string
}) {
  return (
    <Card className="shadow-custom bg-background gap-4 border-none py-2">
      <CardContent className="shadow-custom bg-primary mx-2 flex flex-col items-start gap-4 rounded-lg p-2 md:flex-row">
        <div className="shadow-custom flex h-10 w-10 items-center justify-center overflow-hidden rounded">
          <Image
            src={src}
            alt={alt || "Bluesky post preview"}
            width={100}
            height={100}
            className="object-cover"
            priority
          />
        </div>
        <div className="text-foreground flex-1 text-base whitespace-pre-wrap">
          🚀 Ready to level up your skills? Dive into #LASTesting today! 💻✨
          Perfect for testers, devs & QA pros aiming for seamless software
          delivery. Lets make testing efficient & effective! 🔍 #SoftwareTesting
          #QualityAssurance #TechTips
        </div>
      </CardContent>
    </Card>
  )
}
