export default function FAQSection() {
  return (
    <section
      id="faq"
      className="border-border bg-background border-b px-4 py-28 sm:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-foreground mb-14 text-center text-4xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="border-border bg-muted rounded-2xl border p-6 shadow-md">
            <div className="text-foreground mb-2 text-lg font-bold">
              Can I try Airlume for free?
            </div>
            <div className="text-foreground/70 text-base">
              Yes, you can sign up and generate your first content at no cost.
            </div>
          </div>
          <div className="border-border bg-muted rounded-2xl border p-6 shadow-md">
            <div className="text-foreground mb-2 text-lg font-bold">
              What AI does Airlume use?
            </div>
            <div className="text-foreground/70 text-base">
              We use advanced OpenAI models and our own techniques to
              personalize results.
            </div>
          </div>
          <div className="border-border bg-muted rounded-2xl border p-6 shadow-md">
            <div className="text-foreground mb-2 text-lg font-bold">
              Can I publish directly to my social networks?
            </div>
            <div className="text-foreground/70 text-base">
              Yes, you can connect your accounts and publish to X (Twitter) and
              LinkedIn from the platform.
            </div>
          </div>
          <div className="border-border bg-muted rounded-2xl border p-6 shadow-md">
            <div className="text-foreground mb-2 text-lg font-bold">
              Is my content secure?
            </div>
            <div className="text-foreground/70 text-base">
              Your information is protected and only you can access your
              generated content.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
