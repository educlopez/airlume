"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import MediaLibraryPicker from "./MediaLibraryPicker"

export default function MediaLibraryPickerButton({
  userId,
}: {
  userId: string
}) {
  const [open, setOpen] = useState(false)
  const handleSelect = (url: string) => {
    console.log("Selected image URL:", url)
    setOpen(false)
  }
  return (
    <>
      <Button onClick={() => setOpen(true)} className="mb-4">
        Open Media Library
      </Button>
      <MediaLibraryPicker
        userId={userId}
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
      />
    </>
  )
}
