import React from "react"
import { UserProfile } from "@clerk/nextjs"

export function UserProfileDialog({
  open,
  onOpenChange,
  title = "Account",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog content */}
      <div className="relative z-50 flex w-auto flex-col items-center rounded-lg">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-60 rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-zinc-900 focus:outline-none dark:hover:text-white"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* Optional title for accessibility */}
        <h2 className="sr-only">{title}</h2>
        <div className="flex w-full flex-col items-center p-6">
          <UserProfile />
        </div>
      </div>
    </div>
  )
}
