"use client";

import Image from "next/image";

import { Card, CardContent } from "./card";

export default function BlueskyPromoImage({
  src,
  alt,
}: {
  src: string;
  alt?: string;
}) {
  return (
    <Card className="gap-4 border-none bg-background py-2 shadow-custom">
      <CardContent className="mx-2 flex flex-col items-start gap-4 rounded-lg bg-primary p-2 shadow-custom md:flex-row">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded shadow-custom">
          <Image
            alt={alt || "Bluesky post preview"}
            className="object-cover"
            height={100}
            priority
            src={src}
            width={100}
          />
        </div>
        <div className="flex-1 whitespace-pre-wrap text-base text-foreground">
          🚀 Ready to level up your skills? Dive into #LASTesting today! 💻✨
          Perfect for testers, devs & QA pros aiming for seamless software
          delivery. Lets make testing efficient & effective! 🔍 #SoftwareTesting
          #QualityAssurance #TechTips
        </div>
      </CardContent>
    </Card>
  );
}
