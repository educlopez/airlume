export default function TestimonialsSection() {
  return (
    <section className="border-border bg-muted border-b px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-foreground mb-14 text-center text-4xl font-extrabold tracking-tight">
          What our users say
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="border-border bg-background flex flex-col items-center rounded-3xl border p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="text-foreground mb-6 text-lg font-medium italic">
              &quot;Now I can publish every day effortlessly. Airlume&apos;s AI
              is amazing!&quot;
            </p>
            <div className="text-foreground text-lg font-bold">Ana G.</div>
            <div className="text-foreground/70 text-base">Content Creator</div>
          </div>
          <div className="border-border bg-background flex flex-col items-center rounded-3xl border p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="text-foreground mb-6 text-lg font-medium italic">
              &quot;My LinkedIn posts have tripled in reach since I started
              using Airlume.&quot;
            </p>
            <div className="text-foreground text-lg font-bold">Luis M.</div>
            <div className="text-foreground/70 text-base">Marketer</div>
          </div>
          <div className="border-border bg-background flex flex-col items-center rounded-3xl border p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="text-foreground mb-6 text-lg font-medium italic">
              &quot;The best tool to inspire ideas and save time.&quot;
            </p>
            <div className="text-foreground text-lg font-bold">Sofia R.</div>
            <div className="text-foreground/70 text-base">Entrepreneur</div>
          </div>
        </div>
      </div>
    </section>
  )
}
