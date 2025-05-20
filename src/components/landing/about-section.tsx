export default function AboutSection() {
  return (
    <section
      id="about"
      className="shadow-custom bg-background relative overflow-hidden px-4 py-28 sm:px-8"
    >
      <div className="bg-stripes max-w-screen-minus-scrollbar pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden object-none opacity-[0.04]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-20 md:flex-row">
        <div className="flex-1">
          <h2 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight">
            About Airlume
          </h2>
          <p className="text-foreground/70 mb-10 max-w-xl text-xl leading-relaxed">
            ContentPilot AI (Airlume) is a modern AI-powered tool to generate
            blog articles and social media posts using smart presets, reusable
            prompts, and a streamlined interface. Built with Next.js, Supabase,
            Clerk, and OpenAI.
          </p>
        </div>
      </div>
    </section>
  )
}
