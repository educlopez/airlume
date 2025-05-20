import { Card, CardContent } from "../ui/card"

export default function AboutSection() {
  return (
    <section
      id="about"
      className="shadow-custom bg-background relative overflow-hidden px-4 py-28 text-center sm:px-8"
    >
      <div className="bg-stripes max-w-screen-minus-scrollbar pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden object-none opacity-[0.04]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-20">
        <div className="flex-1">
          <h2 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight">
            About Airlume
          </h2>
          <p className="text-foreground/70 mb-10 max-w-xl text-xl leading-relaxed">
            <span className="text-airlume font-bold">Airlume</span> is a modern
            AI-powered tool to generate engaging social media posts using smart
            presets, reusable prompts, and a streamlined interface. Built with
            <span className="text-airlume font-bold">
              {" "}
              Next.js, Supabase, Clerk, and OpenAI
            </span>
            .
          </p>
        </div>
        {/* Right side: Rotated cards in a row */}
        <div className="flex items-center justify-center">
          <div className="relative flex flex-row gap-[-3rem] md:gap-[-4rem]">
            {/* Card 1 */}
            <Card className="bg-primary z-10 -mr-12 w-80 rotate-[-8deg] rounded-2xl border border-dashed border-gray-300 py-6 shadow-md transition-transform duration-200 select-none hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="text-foreground/70 text-xl font-medium">
                AI-Powered Social Media Content That Drives Engagement
              </CardContent>
            </Card>
            {/* Card 2 */}
            <Card className="bg-primary z-20 -mr-12 w-80 rotate-[4deg] rounded-2xl border border-dashed border-gray-300 py-6 shadow-md transition-transform duration-200 select-none hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="text-foreground/70 text-xl font-medium">
                Streamlining Social Media Management with Smart AI Presets
              </CardContent>
            </Card>
            {/* Card 3 */}
            <Card className="bg-primary z-0 w-80 rotate-[7deg] rounded-2xl border border-dashed border-gray-300 py-6 shadow-md transition-transform duration-200 select-none hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="text-foreground/70 text-xl font-medium">
                Create Viral Social Media Posts with AI Assistance and Schedule
                Them
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
