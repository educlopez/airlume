export default function FAQSection() {
  return (
    <section
      id="faq"
      className="border-b border-neutral-200 bg-white px-4 py-28 sm:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-14 text-center text-4xl font-extrabold tracking-tight text-neutral-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-md">
            <div className="mb-2 text-lg font-bold">
              Can I try Airlume for free?
            </div>
            <div className="text-base text-neutral-600">
              Yes, you can sign up and generate your first content at no cost.
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-md">
            <div className="mb-2 text-lg font-bold">
              What AI does Airlume use?
            </div>
            <div className="text-base text-neutral-600">
              We use advanced OpenAI models and our own techniques to
              personalize results.
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-md">
            <div className="mb-2 text-lg font-bold">
              Can I publish directly to my social networks?
            </div>
            <div className="text-base text-neutral-600">
              Yes, you can connect your accounts and publish to X (Twitter) and
              LinkedIn from the platform.
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-md">
            <div className="mb-2 text-lg font-bold">Is my content secure?</div>
            <div className="text-base text-neutral-600">
              Your information is protected and only you can access your
              generated content.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
