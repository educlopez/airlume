import { cn } from "@/lib/utils"

type NoScheduledPostsProps = {
  className?: string
  primaryColor?: string // For airlume
  backgroundColor?: string // For background
}

export function NoScheduledPosts({
  className,
  primaryColor = "var(--color-airlume)", // default airlume
  backgroundColor = "var(--color-primary)", // default background
}: NoScheduledPostsProps) {
  return (
    <svg
      width="92"
      height="75"
      viewBox="0 0 92 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M72 6H20C16.134 6 13 9.13401 13 13V55C13 58.3137 15.6863 61 19 61H73C76.3137 61 79 58.3137 79 55V13C79 9.13401 75.866 6 72 6Z"
        fill={backgroundColor}
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M13.001 13C13.001 9.13401 16.135 6 20.001 6H72.001C75.867 6 79.001 9.13401 79.001 13V18H13.001V13Z"
        fill={primaryColor}
      />
      <path
        d="M27 3C27 1.89543 27.8954 1 29 1V1C30.1046 1 31 1.89543 31 3V9C31 10.1046 30.1046 11 29 11V11C27.8954 11 27 10.1046 27 9V3Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M22.5 28C22.5 26.8954 23.3954 26 24.5 26H27.5C28.6046 26 29.5 26.8954 29.5 28V31C29.5 32.1046 28.6046 33 27.5 33H24.5C23.3954 33 22.5 32.1046 22.5 31V28Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M49.5 28C49.5 26.8954 50.3954 26 51.5 26H54.5C55.6046 26 56.5 26.8954 56.5 28V31C56.5 32.1046 55.6046 33 54.5 33H51.5C50.3954 33 49.5 32.1046 49.5 31V28Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M62.5 28C62.5 26.8954 63.3954 26 64.5 26H67.5C68.6046 26 69.5 26.8954 69.5 28V31C69.5 32.1046 68.6046 33 67.5 33H64.5C63.3954 33 62.5 32.1046 62.5 31V28Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M49.5 43C49.5 41.8954 50.3954 41 51.5 41H54.5C55.6046 41 56.5 41.8954 56.5 43V46C56.5 47.1046 55.6046 48 54.5 48H51.5C50.3954 48 49.5 47.1046 49.5 46V43Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M35.5 28C35.5 26.8954 36.3954 26 37.5 26H40.5C41.6046 26 42.5 26.8954 42.5 28V31C42.5 32.1046 41.6046 33 40.5 33H37.5C36.3954 33 35.5 32.1046 35.5 31V28Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M35.5 43C35.5 41.8954 36.3954 41 37.5 41H40.5C41.6046 41 42.5 41.8954 42.5 43V46C42.5 47.1046 41.6046 48 40.5 48H37.5C36.3954 48 35.5 47.1046 35.5 46V43Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M61 3C61 1.89543 61.8954 1 63 1V1C64.1046 1 65 1.89543 65 3V9C65 10.1046 64.1046 11 63 11V11C61.8954 11 61 10.1046 61 9V3Z"
        fill={primaryColor}
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <circle
        cx="78"
        cy="55"
        r="13"
        fill={backgroundColor}
        stroke={primaryColor}
      />
      <path
        d="M76.5 48.5C76.5 47.6716 77.1716 47 78 47V47C78.8284 47 79.5 47.6716 79.5 48.5V54.5C79.5 55.3284 78.8284 56 78 56V56C77.1716 56 76.5 55.3284 76.5 54.5V48.5Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M76.5 61.5C76.5 62.3284 77.1716 63 78 63V63C78.8284 63 79.5 62.3284 79.5 61.5V61.5C79.5 60.6716 78.8284 60 78 60V60C77.1716 60 76.5 60.6716 76.5 61.5V61.5Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M8.05487 63.2695C8.95762 63.2695 9.68945 62.5377 9.68945 61.6349V61.6349C9.68945 60.7322 8.95762 60.0004 8.05487 60.0004L2.63504 60.0004C1.73229 60.0004 1.00046 60.7322 1.00046 61.6349V61.6349C1.00046 62.5377 1.73229 63.2695 2.63504 63.2695L8.05487 63.2695Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
      <path
        d="M15.4229 72.4953C15.4229 73.3981 14.691 74.1299 13.7883 74.1299V74.1299C12.8855 74.1299 12.1537 73.3981 12.1537 72.4953L12.1537 67.0755C12.1537 66.1727 12.8855 65.4409 13.7883 65.4409V65.4409C14.691 65.4409 15.4229 66.1727 15.4229 67.0755L15.4229 72.4953Z"
        stroke={primaryColor}
        strokeLinejoin="round"
      />
    </svg>
  )
}
