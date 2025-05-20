import Image from "next/image"

export default function Footer() {
  return (
    <footer className="border-border bg-background text-foreground/70 z-30 flex flex-col items-center justify-center border-t py-10 text-center text-base">
      <a
        href="https://x.com/educalvolpz"
        target="_blank"
        rel="noopener noreferrer"
        className="group text-light-950 dark:text-dark-950 flex w-full flex-row items-center justify-center gap-2"
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
    </footer>
  )
}
