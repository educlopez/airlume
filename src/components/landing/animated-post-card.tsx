"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export interface AnimatedPostCardProps {
  avatar?: string; // image path
  className?: string;
  style?: React.CSSProperties;
  title: string; // now the post content
}

export default function AnimatedPostCard({
  title,
  style,
  className = "",
  avatar,
}: AnimatedPostCardProps) {
  return (
    <Card
      className={`gap-4 border-none bg-background py-1.5 shadow-custom ${className}`}
      style={style}
    >
      <CardContent className="justifiy-start mx-2 flex flex-row items-start gap-3 rounded-lg bg-primary p-2 shadow-custom">
        {avatar && (
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage alt={avatar} src={avatar} />
            <AvatarFallback className="rounded-full">{avatar}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col items-start gap-2">
          <div className="font-normal text-base text-foreground leading-snug">
            {title}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
