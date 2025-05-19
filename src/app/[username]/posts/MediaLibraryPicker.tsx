"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

// Local type for Supabase file items
export type FileItem = {
  id?: string
  name: string
  updated_at?: string
}

// Create Supabase client ONCE outside the component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

interface MediaLibraryPickerProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (url: string) => void
}

export default function MediaLibraryPicker({
  userId,
  open,
  onOpenChange,
  onSelect,
}: MediaLibraryPickerProps) {
  const [mediaFiles, setMediaFiles] = useState<FileItem[]>([])
  useEffect(() => {
    if (!open) return
    async function fetchFiles() {
      const { data, error } = await supabase.storage
        .from("images")
        .list(userId + "/", { limit: 100 })
      if (!error && data) {
        setMediaFiles((data as FileItem[]).filter((f: FileItem) => f.name))
      }
    }
    fetchFiles()
  }, [open, userId])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Select an image from your library</DialogTitle>
        <div className="grid grid-cols-3 gap-4">
          {mediaFiles.length === 0 && (
            <div className="text-muted-foreground col-span-3 text-center">
              No images found.
            </div>
          )}
          {mediaFiles.map((file) => {
            const publicUrl = `https://kdwolwebviyzyjulmzgb.supabase.co/storage/v1/object/public/images/${userId}/${file.name}`
            return (
              <div
                key={file.name}
                className="group h-32 overflow-hidden rounded-sm"
              >
                <Image
                  src={publicUrl}
                  alt={file.name}
                  width={200}
                  height={200}
                  className="h-full w-full cursor-pointer rounded border object-cover transition-all duration-300 group-hover:scale-105"
                  onClick={() => {
                    onSelect(publicUrl)
                  }}
                />
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
