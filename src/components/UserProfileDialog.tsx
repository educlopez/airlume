import React from "react"
import { UserProfile } from "@clerk/nextjs"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function UserProfileDialog({
  open,
  onOpenChange,
  title = "Account",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-auto max-w-auto w-auto p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <UserProfile />
      </DialogContent>
    </Dialog>
  )
}
