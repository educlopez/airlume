import Image from "next/image"
import PostImage from "@/assets/images/post.png"
import PublishImage from "@/assets/images/publish.png"
import SettingsImage from "@/assets/images/settings.png"

export default function ProcessSection() {
  return (
    <section
      id="features"
      className="bg-primary shadow-custom relative overflow-hidden px-4 py-28 sm:px-8"
    >
      <div className="relative mx-auto max-w-5xl">
        <h2 className="text-foreground mb-14 text-center text-4xl font-extrabold tracking-tight">
          How does it work?
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="bg-background shadow-custom flex flex-col items-center rounded-3xl p-8 text-center">
            <div className="mb-4 size-20">
              <Image src={PostImage} alt="Post" />
            </div>
            <h4 className="text-foreground mb-2 text-lg font-bold">
              Choose your goal
            </h4>
            <p className="text-foreground/70 text-base">
              Select the type of content and the social network.
            </p>
          </div>
          <div className="bg-background shadow-custom flex flex-col items-center rounded-3xl p-8 text-center">
            <div className="mb-4 size-20">
              <Image src={SettingsImage} alt="Settings" />
            </div>
            <h4 className="text-foreground mb-2 text-lg font-bold">
              Customize your prompt
            </h4>
            <p className="text-foreground/70 text-base">
              Adjust the tone, topic, and details for your audience.
            </p>
          </div>
          <div className="bg-background shadow-custom flex flex-col items-center rounded-3xl p-8 text-center">
            <div className="mb-4 size-20">
              <Image src={PublishImage} alt="Publish" />
            </div>
            <h4 className="text-foreground mb-2 text-lg font-bold">
              Generate and publish
            </h4>
            <p className="text-foreground/70 text-base">
              Get your content ready to publish in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
