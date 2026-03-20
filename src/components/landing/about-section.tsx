import { Card, CardContent } from "../ui/card";

export default function AboutSection() {
  return (
    <section
      className="relative overflow-hidden bg-background px-4 py-28 text-center shadow-custom sm:px-8"
      id="about"
    >
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full max-w-screen-minus-scrollbar overflow-hidden bg-stripes object-none opacity-[0.04]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-20">
        <div className="flex-1">
          <h2 className="mb-6 font-extrabold text-4xl text-foreground tracking-tight">
            About Airlume
          </h2>
          <p className="mb-10 max-w-xl text-foreground/70 text-xl leading-relaxed">
            <span className="font-bold text-airlume">Airlume</span> is a modern
            AI-powered tool to generate engaging social media posts using smart
            presets, reusable prompts, and a streamlined interface. Built with
            <span className="font-bold text-airlume">
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
            <Card className="z-10 -mr-12 w-80 rotate-[-8deg] select-none rounded-2xl border border-gray-300 border-dashed bg-primary py-6 shadow-md transition-transform duration-200 hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="font-medium text-foreground/70 text-xl">
                AI-Powered Social Media Content That Drives Engagement
              </CardContent>
            </Card>
            {/* Card 2 */}
            <Card className="z-20 -mr-12 w-80 rotate-[4deg] select-none rounded-2xl border border-gray-300 border-dashed bg-primary py-6 shadow-md transition-transform duration-200 hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="font-medium text-foreground/70 text-xl">
                Streamlining Social Media Management with Smart AI Presets
              </CardContent>
            </Card>
            {/* Card 3 */}
            <Card className="z-0 w-80 rotate-[7deg] select-none rounded-2xl border border-gray-300 border-dashed bg-primary py-6 shadow-md transition-transform duration-200 hover:-translate-y-2 hover:shadow-lg">
              <CardContent className="font-medium text-foreground/70 text-xl">
                Create Viral Social Media Posts with AI Assistance and Schedule
                Them
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
