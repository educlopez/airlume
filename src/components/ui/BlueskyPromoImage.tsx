"use client"

import React from "react"
import Image from "next/image"

export default function BlueskyPromoImage({
  src,
  alt,
}: {
  src: string
  alt?: string
}) {
  return (
    <div className="group relative h-32 w-32 overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg">
      <Image
        src={src}
        alt={alt || "Bluesky post preview"}
        fill
        className="object-cover object-left transition-transform duration-300 group-hover:scale-110"
        style={{ clipPath: "inset(0 50% 0 0)" }}
        priority
      />
      {/* Overlay for half-visibility */}
      <div className="from-background/80 pointer-events-none absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l to-transparent" />
    </div>
  )
}
