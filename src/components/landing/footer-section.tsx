import Image from "next/image";
import SmoothuiIcon from "@/assets/images/smoothui.png";
import SparkbitesIcon from "@/assets/images/sparkbites.png";

import Logo from "../logo";
import { Separator } from "../ui/separator";

export default function Footer() {
  return (
    <footer className="z-30 flex flex-col items-center justify-center border-border border-t bg-background text-center text-base text-foreground/70">
      <div className="flex w-full flex-col items-center justify-center gap-2 px-2 py-10">
        <p className="text-foreground/70 text-xs">I ALSO BUILD:</p>
        <div className="flex flex-row items-center justify-center gap-2 text-xs md:gap-8">
          <a
            className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-primary hover:text-foreground/80 hover:shadow-custom"
            href="https://sparkbites.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Sparkbites"
              className="h-5 w-5"
              height={20}
              src={SparkbitesIcon.src}
              width={20}
            />
            <div className="flex max-w-[200px] flex-col items-start justify-start text-left">
              <p className="font-bold text-foreground">Sparkbites</p>
              <p className="text-foreground/70 text-xs">
                Inspiration directory for your next project
              </p>
            </div>
          </a>
          <a
            className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-primary hover:text-foreground/80 hover:shadow-custom"
            href="https://smoothui.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              alt="Sparkbites"
              className="h-5 w-5"
              height={20}
              src={SmoothuiIcon.src}
              width={20}
            />
            <div className="flex max-w-[200px] flex-col items-start justify-start text-left">
              <p className="font-bold text-foreground">SmoothUI</p>
              <p className="text-foreground/70 text-xs">
                Components using Motion, React and TailwindCSS
              </p>
            </div>
          </a>
        </div>
      </div>
      <Separator />
      <div className="relative">
        <Logo className="z-0 h-auto w-full text-foreground/3 md:h-40" />
        <a
          className="group absolute top-1/2 left-1/2 z-1 flex w-fit -translate-x-1/2 -translate-y-1/2 flex-row items-center justify-center gap-2 rounded-sm p-2 text-foreground hover:bg-primary hover:text-foreground/80 hover:shadow-custom"
          href="https://x.com/educalvolpz"
          rel="noopener noreferrer"
          target="_blank"
        >
          <p className="font-medium text-xs">Made by</p>
          <div className="flex h-6 w-6 shrink-0 gap-2 rounded-full">
            <Image
              alt="User Avatar of Eduardo Calvo"
              className="shrink-0 rounded-md"
              height={28}
              src="https://github.com/educlopez.png"
              width={28}
            />
          </div>
          <p className="font-bold text-xs">Eduardo Calvo</p>
        </a>
      </div>
    </footer>
  );
}
