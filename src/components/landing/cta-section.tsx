"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

const TRAILING_SLASH_REGEX = /\/$/;

export default function CTASection() {
  const { user, isLoaded, isSignedIn } = useUser();
  return (
    <section className="bg-primary px-4 py-24 text-center shadow-custom sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 font-extrabold text-4xl text-foreground tracking-tight">
          Ready to take your content to the next level?
        </h2>
        <p className="mb-10 text-foreground/70 text-xl leading-relaxed">
          Join Airlume and start creating high-impact content in minutes.
        </p>
        {isLoaded && isSignedIn && user ? (
          <Button asChild size="lg" variant="custom">
            <a
              href={
                `/${user.username || ""}`.replace(TRAILING_SLASH_REGEX, "") ||
                "/"
              }
            >
              Go to dashboard
            </a>
          </Button>
        ) : (
          <SignUpButton>
            <Button size="lg" variant="custom">
              Get started free now
            </Button>
          </SignUpButton>
        )}
      </div>
    </section>
  );
}
