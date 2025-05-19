export default function FAQSection() {
  return (
    <section
      id="faq"
      className="shadow-custom bg-background relative overflow-hidden px-4 py-28 sm:px-8"
    >
      <div className="bg-stripes max-w-screen-minus-scrollbar pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden object-none opacity-[0.04]" />
      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-foreground mb-14 text-center text-4xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="shadow-custom bg-primary rounded-2xl p-6">
            <div className="text-foreground mb-2 text-lg font-bold">
              Can I try Airlume for free?
            </div>
            <div className="text-foreground/70 text-base">
              Yes, you can sign up and generate your first content at no cost.
            </div>
          </div>
          <div className="shadow-custom bg-primary rounded-2xl p-6">
            <div className="text-foreground mb-2 text-lg font-bold">
              What AI does Airlume use?
            </div>
            <div className="text-foreground/70 text-base">
              We use advanced OpenAI models and our own techniques to
              personalize results.
            </div>
          </div>
          <div className="shadow-custom bg-primary rounded-2xl p-6">
            <div className="text-foreground mb-2 text-lg font-bold">
              Can I publish directly to my social networks?
            </div>
            <div className="text-foreground/70 text-base">
              Yes, you can connect your accounts and publish to X (Twitter) and
              LinkedIn from the platform.
            </div>
          </div>
          <div className="shadow-custom bg-primary rounded-2xl p-6">
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
