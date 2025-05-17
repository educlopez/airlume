export default function TestimonialsSection() {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50 px-4 py-28 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-4xl font-extrabold tracking-tight text-neutral-900">
          What our users say
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="mb-6 text-lg font-medium text-neutral-700 italic">
              &quot;Now I can publish every day effortlessly. Airlume&apos;s AI
              is amazing!&quot;
            </p>
            <div className="text-lg font-bold">Ana G.</div>
            <div className="text-base text-neutral-500">Content Creator</div>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="mb-6 text-lg font-medium text-neutral-700 italic">
              &quot;My LinkedIn posts have tripled in reach since I started
              using Airlume.&quot;
            </p>
            <div className="text-lg font-bold">Luis M.</div>
            <div className="text-base text-neutral-500">Marketer</div>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-4xl">🌟</div>
            <p className="mb-6 text-lg font-medium text-neutral-700 italic">
              &quot;The best tool to inspire ideas and save time.&quot;
            </p>
            <div className="text-lg font-bold">Sofia R.</div>
            <div className="text-base text-neutral-500">Entrepreneur</div>
          </div>
        </div>
      </div>
    </section>
  )
}
