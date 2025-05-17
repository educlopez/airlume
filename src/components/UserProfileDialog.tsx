import React from "react"
import { UserProfile } from "@clerk/nextjs"
import { XIcon } from "lucide-react"

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
        className="bg-background/90 fixed inset-0 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog content */}
      <div className="relative z-50 flex w-auto flex-col items-center rounded-lg">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="bg-background text-foreground shadow-custom absolute top-4 right-4 z-60 cursor-pointer rounded-full p-2 opacity-90 hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <XIcon size={20} />
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
