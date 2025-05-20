"use client"

import React from "react"

import { Card, CardContent } from "@/components/ui/card"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export interface AnimatedPostCardProps {
  title: string // now the post content
  style?: React.CSSProperties
  className?: string
  avatar?: string // image path
}

export default function AnimatedPostCard({
  title,
  style,
  className = "",
  avatar,
}: AnimatedPostCardProps) {
  return (
    <Card
      className={`shadow-custom bg-background gap-4 border-none py-1.5 ${className}`}
      style={style}
    >
      <CardContent className="shadow-custom bg-primary justifiy-start mx-2 flex flex-row items-start gap-3 rounded-lg p-2">
        {avatar && (
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={avatar} alt={avatar} />
            <AvatarFallback className="rounded-full">{avatar}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col items-start gap-2">
          <div className="text-foreground text-base leading-snug font-normal">
            {title}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
