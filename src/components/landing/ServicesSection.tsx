import { Button } from "../ui/button"

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative overflow-hidden border-b border-neutral-200 bg-white px-4 py-28 sm:px-8"
    >
      <div className="bg-stripes max-w-screen-minus-scrollbar pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden object-none opacity-[0.04]" />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-4xl font-extrabold tracking-tight text-neutral-900">
          What can you create with Airlume?
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-md transition hover:shadow-lg">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="mb-2 text-xl font-bold">Blog Articles</h3>
            <p className="mb-6 text-base text-neutral-600">
              Generate complete, SEO-optimized articles in minutes.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-md transition hover:shadow-lg">
            <div className="mb-4 text-4xl">🐦</div>
            <h3 className="mb-2 text-xl font-bold">Posts for X (Twitter)</h3>
            <p className="mb-6 text-base text-neutral-600">
              Create viral threads and engaging tweets ready to publish.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-md transition hover:shadow-lg">
            <div className="mb-4 text-4xl">💼</div>
            <h3 className="mb-2 text-xl font-bold">Posts for LinkedIn</h3>
            <p className="mb-6 text-base text-neutral-600">
              Boost your personal brand with professional, creative posts.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
          <div className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-neutral-50 p-8 text-center shadow-md transition hover:shadow-lg">
            <div className="mb-4 text-4xl">🎨</div>
            <h3 className="mb-2 text-xl font-bold">AI Images</h3>
            <p className="mb-6 text-base text-neutral-600">
              Generate original images to accompany your posts.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
