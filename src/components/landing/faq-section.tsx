export default function FAQSection() {
  return (
    <section
      className="relative overflow-hidden bg-background px-4 py-28 shadow-custom sm:px-8"
      id="faq"
    >
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full max-w-screen-minus-scrollbar overflow-hidden bg-stripes object-none opacity-[0.04]" />
      <div className="relative mx-auto max-w-3xl">
        <h2 className="mb-14 text-center font-extrabold text-4xl text-foreground tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="rounded-2xl bg-primary p-6 shadow-custom">
            <div className="mb-2 font-bold text-foreground text-lg">
              Can I try Airlume for free?
            </div>
            <div className="text-base text-foreground/70">
              Yes, you can sign up and generate your first content at no cost.
            </div>
          </div>
          <div className="rounded-2xl bg-primary p-6 shadow-custom">
            <div className="mb-2 font-bold text-foreground text-lg">
              What AI does Airlume use?
            </div>
            <div className="text-base text-foreground/70">
              We use advanced OpenAI models and our own techniques to
              personalize results.
            </div>
          </div>
          {/*
          <div className="shadow-custom bg-primary rounded-2xl p-6">
            <div className="text-foreground mb-2 text-lg font-bold">
              Can I publish directly to my social networks?
            </div>
            <div className="text-foreground/70 text-base">
              Yes, you can connect your accounts and publish to X (Twitter) and LinkedIn from the platform.
            </div>
          </div>
          */}
          <div className="rounded-2xl bg-primary p-6 shadow-custom">
            <div className="mb-2 font-bold text-foreground text-lg">
              Is my content secure?
            </div>
            <div className="text-base text-foreground/70">
              Your information is protected and only you can access your
              generated content.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
