import Image from "next/image"
import { SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative border-b border-neutral-200 bg-neutral-50 px-4 py-32 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-20 md:flex-row">
        <div className="flex-1">
          <div className="mb-6 text-base font-semibold tracking-wider text-neutral-500 uppercase">
            Trusted by 200+ creators
          </div>
          <h1 className="mb-8 text-6xl leading-tight font-extrabold tracking-tight text-neutral-900">
            Create irresistible content for your blog and social media with AI
          </h1>
          <p className="mb-10 max-w-xl text-2xl leading-relaxed text-neutral-600">
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
            className="rounded-3xl border border-neutral-200 bg-white shadow-xl"
          />
        </div>
      </div>
    </section>
  )
}
