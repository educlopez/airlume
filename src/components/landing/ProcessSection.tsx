export default function ProcessSection() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50 px-4 py-28 sm:px-8">
      <div className="bg-stripes max-w-screen-minus-scrollbar pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden object-none opacity-[0.04]" />
      <div className="relative mx-auto max-w-5xl">
        <h2 className="mb-14 text-center text-4xl font-extrabold tracking-tight text-neutral-900">
          How does it work?
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-5xl">📝</div>
            <h4 className="mb-2 text-lg font-bold">Choose your goal</h4>
            <p className="text-base text-neutral-600">
              Select the type of content and the social network.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-5xl">⚡</div>
            <h4 className="mb-2 text-lg font-bold">Customize your prompt</h4>
            <p className="text-base text-neutral-600">
              Adjust the tone, topic, and details for your audience.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-md">
            <div className="mb-4 text-5xl">🚀</div>
            <h4 className="mb-2 text-lg font-bold">Generate and publish</h4>
            <p className="text-base text-neutral-600">
              Get your content ready to publish in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
