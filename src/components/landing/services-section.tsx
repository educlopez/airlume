import { Button } from "../ui/button"

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="shadow-custom bg-background relative overflow-hidden px-4 py-28 sm:px-8"
    >
      <div className="bg-stripes max-w-screen-minus-scrollbar pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden object-none opacity-[0.04]" />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="text-foreground mb-14 text-center text-4xl font-extrabold tracking-tight">
          What can you create with Airlume?
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-primary shadow-custom flex flex-col items-center rounded-3xl p-8 text-center transition">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Blog Articles
            </h3>
            <p className="text-foreground/70 mb-6 text-base">
              Generate complete, SEO-optimized articles in minutes.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
          <div className="bg-primary shadow-custom flex flex-col items-center rounded-3xl p-8 text-center transition">
            <div className="mb-4 text-4xl">🐦</div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Posts for X (Twitter)
            </h3>
            <p className="text-foreground/70 mb-6 text-base">
              Create viral threads and engaging tweets ready to publish.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
          <div className="bg-primary shadow-custom flex flex-col items-center rounded-3xl p-8 text-center transition">
            <div className="mb-4 text-4xl">💼</div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              Posts for LinkedIn
            </h3>
            <p className="text-foreground/70 mb-6 text-base">
              Boost your personal brand with professional, creative posts.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="#features">See example</a>
            </Button>
          </div>
          <div className="bg-primary shadow-custom flex flex-col items-center rounded-3xl p-8 text-center transition">
            <div className="mb-4 text-4xl">🎨</div>
            <h3 className="text-foreground mb-2 text-xl font-bold">
              AI Images
            </h3>
            <p className="text-foreground/70 mb-6 text-base">
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
