import { cn } from "@/lib/utils"

export default function Loading({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 50 50">
      <defs>
        <linearGradient
          id="spinner-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            style={{
              stopColor: "currentcolor",
              stopOpacity: "1",
            }}
          ></stop>
          <stop
            offset="100%"
            style={{
              stopColor: "currentcolor",
              stopOpacity: "0",
            }}
          ></stop>
        </linearGradient>
      </defs>
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="url(#spinner-gradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="75,150"
        strokeDashoffset="0"
      ></circle>
    </svg>
  )
}
