export default function ProcessSection() {
  return (
    <section className="bg-primary shadow-custom relative overflow-hidden px-4 py-28 sm:px-8">
      <div className="relative mx-auto max-w-5xl">
        <h2 className="text-foreground mb-14 text-center text-4xl font-extrabold tracking-tight">
          How does it work?
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="border-border bg-background flex flex-col items-center rounded-3xl border p-8 text-center shadow-md">
            <div className="mb-4 text-5xl">📝</div>
            <h4 className="text-foreground mb-2 text-lg font-bold">
              Choose your goal
            </h4>
            <p className="text-foreground/70 text-base">
              Select the type of content and the social network.
            </p>
          </div>
          <div className="border-border bg-background flex flex-col items-center rounded-3xl border p-8 text-center shadow-md">
            <div className="mb-4 text-5xl">⚡</div>
            <h4 className="text-foreground mb-2 text-lg font-bold">
              Customize your prompt
            </h4>
            <p className="text-foreground/70 text-base">
              Adjust the tone, topic, and details for your audience.
            </p>
          </div>
          <div className="border-border bg-background flex flex-col items-center rounded-3xl border p-8 text-center shadow-md">
            <div className="mb-4 text-5xl">🚀</div>
            <h4 className="text-foreground mb-2 text-lg font-bold">
              Generate and publish
            </h4>
            <p className="text-foreground/70 text-base">
              Get your content ready to publish in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
