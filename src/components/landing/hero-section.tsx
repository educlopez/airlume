import { SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="bg-background shadow-custom relative px-4 py-32 sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h1 className="text-foreground text-6xl leading-tight font-extrabold tracking-tight">
          Create irresistible content for your social media with AI
        </h1>
        <p className="text-foreground/70 mb-10 text-2xl leading-relaxed">
          Airlume helps you create threads and viral posts in seconds. Save
          time, spark your creativity, and grow your audience.
        </p>
        <div className="flex gap-6">
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
    </section>
  )
}
