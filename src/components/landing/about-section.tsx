import Image from "next/image"

export default function AboutSection() {
  return (
    <section
      id="about"
      className="border-border bg-background border-b px-4 py-28 sm:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-20 md:flex-row">
        <div className="flex flex-1 justify-center">
          <Image
            src="/team-photo.png"
            alt="Airlume team"
            width={340}
            height={260}
            className="border-border bg-background rounded-3xl border shadow-xl"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-foreground mb-6 text-4xl font-extrabold tracking-tight">
            About Airlume
          </h2>
          <p className="text-foreground/70 mb-10 max-w-xl text-xl leading-relaxed">
            We are a team passionate about technology and digital marketing. We
            created Airlume to help creators, marketers, and companies save time
            and boost their online presence with high-quality AI-generated
            content.
          </p>
          <div className="flex gap-8">
            <div className="border-border bg-muted flex-1 rounded-2xl border px-8 py-6 text-center">
              <div className="text-primary mb-1 text-3xl font-extrabold">
                +10K
              </div>
              <div className="text-foreground/70 text-base">
                Contents generated
              </div>
            </div>
            <div className="border-border bg-muted flex-1 rounded-2xl border px-8 py-6 text-center">
              <div className="text-primary mb-1 text-3xl font-extrabold">
                98%
              </div>
              <div className="text-foreground/70 text-base">
                User satisfaction
              </div>
            </div>
            <div className="border-border bg-muted flex-1 rounded-2xl border px-8 py-6 text-center">
              <div className="text-primary mb-1 text-3xl font-extrabold">
                2023
              </div>
              <div className="text-foreground/70 text-base">Founded</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
