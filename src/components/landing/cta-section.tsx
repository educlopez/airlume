"use client"

import { SignUpButton, useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export default function CTASection() {
  const { user, isLoaded, isSignedIn } = useUser()
  return (
    <section className="shadow-custom bg-primary px-4 py-24 text-center sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight">
          Ready to take your content to the next level?
        </h2>
        <p className="text-foreground/70 mb-10 text-xl leading-relaxed">
          Join Airlume and start creating high-impact content in minutes.
        </p>
        {isLoaded && isSignedIn && user ? (
          <Button variant="custom" size="lg" asChild>
            <a href={`/${user.username || ""}`.replace(/\/$/, "") || "/"}>
              Go to dashboard
            </a>
          </Button>
        ) : (
          <SignUpButton>
            <Button variant="custom" size="lg">
              Get started free now
            </Button>
          </SignUpButton>
        )}
      </div>
    </section>
  )
}
