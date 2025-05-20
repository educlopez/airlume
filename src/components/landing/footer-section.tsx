import Image from "next/image"
import SmoothuiIcon from "@/assets/images/smoothui.png"
import SparkbitesIcon from "@/assets/images/sparkbites.png"

import Logo from "../logo"
import { Separator } from "../ui/separator"

export default function Footer() {
  return (
    <>
      <footer className="border-border bg-background text-foreground/70 z-30 flex flex-col items-center justify-center border-t text-center text-base">
        <div className="flex w-full flex-col items-center justify-center gap-2 px-2 py-10">
          <p className="text-foreground/70 text-xs">I ALSO BUILD:</p>
          <div className="flex flex-row items-center justify-center gap-2 text-xs md:gap-8">
            <a
              href="https://sparkbites.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/80 hover:bg-primary hover:shadow-custom flex items-center gap-2 rounded-md p-2 transition-colors"
            >
              <Image
                src={SparkbitesIcon.src}
                alt="Sparkbites"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <div className="flex max-w-[200px] flex-col items-start justify-start text-left">
                <p className="text-foreground font-bold">Sparkbites</p>
                <p className="text-foreground/70 text-xs">
                  Inspiration directory for your next project
                </p>
              </div>
            </a>
            <a
              href="https://smoothui.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/80 hover:shadow-custom hover:bg-primary flex items-center gap-2 rounded-md p-2 transition-colors"
            >
              <Image
                src={SmoothuiIcon.src}
                alt="Sparkbites"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <div className="flex max-w-[200px] flex-col items-start justify-start text-left">
                <p className="text-foreground font-bold">SmoothUI</p>
                <p className="text-foreground/70 text-xs">
                  Components using Motion, React and TailwindCSS
                </p>
              </div>
            </a>
          </div>
        </div>
        <Separator />
        <div className="relative">
          <Logo className="text-foreground/3 z-0 h-auto w-full md:h-40" />
          <a
            href="https://x.com/educalvolpz"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-foreground hover:text-foreground/80 hover:shadow-custom hover:bg-primary absolute top-1/2 left-1/2 z-1 flex w-fit -translate-x-1/2 -translate-y-1/2 flex-row items-center justify-center gap-2 rounded-sm p-2"
          >
            <p className="text-xs font-medium">Made by</p>
            <div className="flex h-6 w-6 shrink-0 gap-2 rounded-full">
              <Image
                src="https://github.com/educlopez.png"
                alt="User Avatar of Eduardo Calvo"
                width={28}
                height={28}
                className="shrink-0 rounded-md"
              />
            </div>
            <p className="text-xs font-bold">Eduardo Calvo</p>
          </a>
        </div>
      </footer>
    </>
  )
}
