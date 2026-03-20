import { cn } from "@/lib/utils";

export default function Loading({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 50 50">
      <title>Loading</title>
      <defs>
        <linearGradient
          id="spinner-gradient"
          x1="0%"
          x2="100%"
          y1="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            style={{
              stopColor: "currentcolor",
              stopOpacity: "1",
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: "currentcolor",
              stopOpacity: "0",
            }}
          />
        </linearGradient>
      </defs>
      <circle
        cx="25"
        cy="25"
        fill="none"
        r="20"
        stroke="url(#spinner-gradient)"
        strokeDasharray="75,150"
        strokeDashoffset="0"
        strokeLinecap="round"
        strokeWidth="8"
      />
    </svg>
  );
}
