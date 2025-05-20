import { cn } from "@/lib/utils"

type NotImageFoundProps = {
  className?: string
  primaryColor?: string // For airlume
  backgroundColor?: string // For background
}

export function NotImageFound({
  className,
  primaryColor = "var(--color-airlume)", // default airlume
  backgroundColor = "var(--color-primary)", // default background
}: NotImageFoundProps) {
  return (
    <svg
      width="73"
      height="79"
      viewBox="0 0 73 79"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <rect
        x="1"
        y="12"
        width="58"
        height="58"
        rx="8"
        fill={backgroundColor}
        stroke={primaryColor}
      />
      <path
        d="M7 23C7 20.2386 9.23858 18 12 18H48C50.7614 18 53 20.2386 53 23V51C53 53.7614 50.7614 56 48 56H12C9.23858 56 7 53.7614 7 51V23Z"
        stroke={primaryColor}
      />
      <path
        d="M16.0498 37.7949C18.2108 35.5646 21.7892 35.5646 23.9502 37.7949L30.7812 44.8457C32.0177 46.1218 34.0147 46.2686 35.4248 45.1875L39.6533 41.9453C41.6275 40.4318 44.3725 40.4318 46.3467 41.9453L52.5 46.6631V50C52.5 53.0376 50.0376 55.5 47 55.5H13C9.96243 55.5 7.5 53.0376 7.5 50V46.6191L16.0498 37.7949Z"
        fill={primaryColor}
        stroke={primaryColor}
      />
      <path
        d="M36.5283 29.9629C38.5457 29.9629 40.1836 31.6036 40.1836 33.6299C40.1834 35.656 38.5456 37.2958 36.5283 37.2959C34.511 37.2959 32.8732 35.6561 32.873 33.6299C32.873 31.6035 34.5109 29.9629 36.5283 29.9629Z"
        fill={primaryColor}
        stroke={primaryColor}
      />
      <path
        d="M64.7879 12C63.8851 12 63.1533 12.7318 63.1533 13.6346V13.6346C63.1533 14.5373 63.8851 15.2692 64.7879 15.2692L70.2077 15.2692C71.1105 15.2692 71.8423 14.5373 71.8423 13.6346V13.6346C71.8423 12.7318 71.1105 12 70.2077 12L64.7879 12Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M57.4199 2.77424C57.4199 1.87148 58.1518 1.13965 59.0545 1.13965V1.13965C59.9573 1.13965 60.6891 1.87148 60.6891 2.77424L60.6891 8.19406C60.6891 9.09682 59.9573 9.82864 59.0545 9.82864V9.82864C58.1518 9.82864 57.4199 9.09681 57.4199 8.19406V2.77424Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <circle
        cx="57"
        cy="65"
        r="13"
        fill={backgroundColor}
        stroke={primaryColor}
      />
      <path
        d="M55.5 58.5C55.5 57.6716 56.1716 57 57 57V57C57.8284 57 58.5 57.6716 58.5 58.5V64.5C58.5 65.3284 57.8284 66 57 66V66C56.1716 66 55.5 65.3284 55.5 64.5V58.5Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M55.5 71.5C55.5 72.3284 56.1716 73 57 73V73C57.8284 73 58.5 72.3284 58.5 71.5V71.5C58.5 70.6716 57.8284 70 57 70V70C56.1716 70 55.5 70.6716 55.5 71.5V71.5Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
    </svg>
  )
}
