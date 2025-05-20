import { cn } from "@/lib/utils"

type NoPostsProps = {
  className?: string
  primaryColor?: string // For airlume
  backgroundColor?: string // For background
}

export function NoPosts({
  className,
  primaryColor = "var(--color-airlume)", // default airlume
  backgroundColor = "var(--color-primary)", // default background
}: NoPostsProps) {
  return (
    <svg
      width="87"
      height="73"
      viewBox="0 0 87 73"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M16.1644 18.5097C16.8449 15.8559 19.2367 14 21.9764 14H67.0236C69.7633 14 72.1551 15.8559 72.8356 18.5097L77.6951 37.4617C77.8963 38.2464 77.9365 39.0637 77.8133 39.8643L74.9903 58.2142C74.54 61.1412 72.0215 63.3019 69.06 63.3019H19.94C16.9785 63.3019 14.46 61.1412 14.0097 58.2142L11.1867 39.8643C11.0635 39.0637 11.1037 38.2464 11.3049 37.4617L16.1644 18.5097Z"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M11.6318 38.6509H28.2238L32.7499 44.9874C33.8761 46.5641 35.6946 47.4999 37.6323 47.4999H51.9993C53.937 47.4999 55.7554 46.5641 56.8817 44.9874L61.4078 38.6509H77.9998"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M65.1505 26.6416H23.8486C21.6395 26.6416 19.8486 28.4325 19.8486 30.6416V37.019L19.9205 36.3545C20.2502 33.3084 22.8219 31 25.8857 31H63.0383C65.9176 31 68.391 33.0454 68.9316 35.8735L69.1505 37.019V30.6416C69.1505 28.4325 67.3597 26.6416 65.1505 26.6416Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M69.1505 38.019V36.9624C69.1505 34.7533 67.3597 32.9624 65.1505 32.9624H23.8486C21.6395 32.9624 19.8486 34.7533 19.8486 36.9624V38.019"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M69.1505 31.6982V24.3208C69.1505 22.1117 67.3597 20.3208 65.1505 20.3208H23.8486C21.6395 20.3208 19.8486 22.1117 19.8486 24.3208V31.6982"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M78.8805 12.4454C77.9778 12.4316 77.2349 13.1522 77.2211 14.0548V14.0548C77.2073 14.9575 77.9279 15.7004 78.8305 15.7142L84.2497 15.797C85.1524 15.8108 85.8953 15.0902 85.9091 14.1876V14.1876C85.9229 13.2849 85.2023 12.542 84.2997 12.5282L78.8805 12.4454Z"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M71.6547 3.10803C71.6685 2.20538 72.4114 1.48482 73.3141 1.49861V1.49861C74.2167 1.51241 74.9373 2.25534 74.9235 3.15799L74.8407 8.57718C74.8269 9.47983 74.084 10.2004 73.1813 10.1866V10.1866C72.2786 10.1728 71.5581 9.42987 71.5719 8.52722L71.6547 3.10803Z"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle
        cx="14"
        cy="59"
        r="13"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeWidth="1"
      />
      <path
        d="M12.5 52.5C12.5 51.6716 13.1716 51 14 51V51C14.8284 51 15.5 51.6716 15.5 52.5V58.5C15.5 59.3284 14.8284 60 14 60V60C13.1716 60 12.5 59.3284 12.5 58.5V52.5Z"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 65.5C12.5 66.3284 13.1716 67 14 67V67C14.8284 67 15.5 66.3284 15.5 65.5V65.5C15.5 64.6716 14.8284 64 14 64V64C13.1716 64 12.5 64.6716 12.5 65.5V65.5Z"
        stroke={primaryColor}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}
