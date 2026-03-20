import Image from "next/image";
import PostImage from "@/assets/images/post.png";
import PublishImage from "@/assets/images/publish.png";
import SettingsImage from "@/assets/images/settings.png";

export default function ProcessSection() {
  return (
    <section
      className="relative overflow-hidden bg-primary px-4 py-28 shadow-custom sm:px-8"
      id="features"
    >
      <div className="relative mx-auto max-w-5xl">
        <h2 className="mb-14 text-center font-extrabold text-4xl text-foreground tracking-tight">
          How does it work?
        </h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-3xl bg-background p-8 text-center shadow-custom">
            <div className="mb-4 size-20">
              <Image alt="Post" src={PostImage} />
            </div>
            <h4 className="mb-2 font-bold text-foreground text-lg">
              Choose your goal
            </h4>
            <p className="text-base text-foreground/70">
              Select the type of content and the social network.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-3xl bg-background p-8 text-center shadow-custom">
            <div className="mb-4 size-20">
              <Image alt="Settings" src={SettingsImage} />
            </div>
            <h4 className="mb-2 font-bold text-foreground text-lg">
              Customize your prompt
            </h4>
            <p className="text-base text-foreground/70">
              Adjust the tone, topic, and details for your audience.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-3xl bg-background p-8 text-center shadow-custom">
            <div className="mb-4 size-20">
              <Image alt="Publish" src={PublishImage} />
            </div>
            <h4 className="mb-2 font-bold text-foreground text-lg">
              Generate and publish
            </h4>
            <p className="text-base text-foreground/70">
              Get your content ready to publish in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
