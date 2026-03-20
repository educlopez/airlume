export default function TestimonialsSection() {
  return (
    <section className="bg-primary px-4 py-28 shadow-custom sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center font-extrabold text-4xl text-foreground tracking-tight">
          What our users say
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-3xl border border-border bg-background p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="mb-6 font-medium text-foreground text-lg italic">
              &quot;Now I can publish every day effortlessly. Airlume&apos;s AI
              is amazing!&quot;
            </p>
            <div className="font-bold text-foreground text-lg">Ana G.</div>
            <div className="text-base text-foreground/70">Content Creator</div>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-border bg-background p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="mb-6 font-medium text-foreground text-lg italic">
              &quot;My LinkedIn posts have tripled in reach since I started
              using Airlume.&quot;
            </p>
            <div className="font-bold text-foreground text-lg">Luis M.</div>
            <div className="text-base text-foreground/70">Marketer</div>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-border bg-background p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="mb-6 font-medium text-foreground text-lg italic">
              &quot;The best tool to inspire ideas and save time.&quot;
            </p>
            <div className="font-bold text-foreground text-lg">Sofia R.</div>
            <div className="text-base text-foreground/70">Entrepreneur</div>
          </div>
        </div>
      </div>
    </section>
  );
}
