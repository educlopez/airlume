import { SignUpButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50 px-4 py-24 text-center sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-neutral-900">
          Ready to take your content to the next level?
        </h2>
        <p className="mb-10 text-xl leading-relaxed text-neutral-600">
          Join Airlume and start creating high-impact content in minutes.
        </p>
        <SignUpButton>
          <Button variant="custom" size="lg">
            Get started free now
          </Button>
        </SignUpButton>
      </div>
    </section>
  )
}
