import Image from "next/image"
import { SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="bg-background shadow-custom relative px-4 py-32 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-20 md:flex-row">
        <div className="flex-1">
          <div className="text-foreground/70 mb-6 text-base font-semibold tracking-wider uppercase">
            Trusted by 200+ creators
          </div>
          <h1 className="text-foreground mb-8 text-6xl leading-tight font-extrabold tracking-tight">
            Create irresistible content for your blog and social media with AI
          </h1>
          <p className="text-foreground/70 mb-10 max-w-xl text-2xl leading-relaxed">
            Airlume helps you create articles, threads, and viral posts in
            seconds. Save time, spark your creativity, and grow your audience.
          </p>
          <div className="mb-12 flex gap-6">
            <SignUpButton>
              <Button variant="custom" size="lg">
                Get started free
              </Button>
            </SignUpButton>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">See features</a>
            </Button>
          </div>
        </div>
        <div className="flex flex-1 justify-center">
          <Image
            src="/hero-demo.png"
            alt="Airlume demo"
            width={480}
            height={360}
            className="border-border bg-background rounded-3xl border shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}
