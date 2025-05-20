"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Check, Eye, Trash2, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

import { deleteImage, isImageUsed, uploadImage } from "./actions"

interface FileItem {
  id?: string
  name: string
  updated_at?: string
}

export default function MediaLibraryClient({
  userId,
  files,
}: {
  userId: string
  files: FileItem[]
}) {
  const [items, setItems] = useState(files)
  const [selected, setSelected] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [usedMap, setUsedMap] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [massDeleting, setMassDeleting] = useState(false)

  useEffect(() => {
    const checkUsed = async () => {
      const map: Record<string, boolean> = {}
      await Promise.all(
        items.map(async (file) => {
          const res = await isImageUsed({ userId, fileName: file.name })
          map[file.name] = !!res.used
        })
      )
      setUsedMap(map)
    }
    checkUsed()
  }, [items, userId])

  const handleImageClick = useCallback(
    (name: string, publicUrl: string) => {
      if (!isSelecting) {
        setPreview(publicUrl)
        return
      }
      setSelected((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
      )
    },
    [isSelecting]
  )

  const handleDelete = async (name: string) => {
    setDeleting(name)
    setError(null)
    const res = await deleteImage({ userId, fileName: name })
    if (res?.error) {
      setError(`Error al eliminar: ${res.error}`)
      console.error("Server action delete error:", res.error)
    } else {
      setItems(items.filter((f) => f.name !== name))
      setSelected(selected.filter((n) => n !== name))
    }
    setDeleting(null)
  }

  const handleMassDelete = async () => {
    setMassDeleting(true)
    setError(null)
    for (const name of selected) {
      const res = await deleteImage({ userId, fileName: name })
      if (res?.error) {
        setError(`Error al eliminar: ${res.error}`)
        console.error("Server action delete error:", res.error)
        break
      } else {
        setItems((prev) => prev.filter((f) => f.name !== name))
      }
    }
    setSelected([])
    setMassDeleting(false)
  }

  const handleReset = () => {
    setSelected([])
    setIsSelecting(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      toast.error("Image must be less than 1MB.")
      return
    }
    // Upload logic
    const res = await uploadImage({ userId, file })
    if (res?.error) {
      toast.error(res.error)
      return
    }
    // Extract file name from URL or use file.name
    let name = file.name
    if (res.url) {
      const parts = res.url.split("/")
      name = parts[parts.length - 1]
    }
    setItems((prev) => [
      { name, updated_at: new Date().toISOString() },
      ...prev,
    ])
    toast.success("Image uploaded!")
  }

  if (!items.length)
    return (
      <div className="text-muted-foreground text-center">No images found.</div>
    )

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Upload button and input */}
      <div className="mb-4 flex items-center gap-2">
        <input
          id="media-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <label htmlFor="media-upload-input">
          <Button asChild variant="outline">
            <span>Upload Image</span>
          </Button>
        </label>
        <span className="ml-2 text-xs text-gray-500">
          Max file size: 1MB. Larger files will be rejected.
        </span>
      </div>
      {/* Top bar */}
      <div className="flex justify-start gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsSelecting((prev) => {
              if (prev) setSelected([])
              return !prev
            })
          }}
          aria-label={isSelecting ? "Cancel selection" : "Select images"}
        >
          {" "}
          {!isSelecting ? (
            <Button variant="custom">Select to delete</Button>
          ) : (
            <Button variant="destructive">Cancel selection</Button>
          )}
        </motion.div>
        {selected.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            aria-label="Reset selection"
          >
            <Button variant="outline">Reset selection</Button>
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="my-4 rounded border border-red-300 bg-red-100 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {/* Gallery grid */}
      <motion.div className="my-4 grid grid-cols-4 gap-2" layout>
        <AnimatePresence>
          {items.map((file) => {
            const publicUrl = `https://kdwolwebviyzyjulmzgb.supabase.co/storage/v1/object/public/images/${userId}/${file.name}`
            const isSelected = selected.includes(file.name)
            const isUsed = usedMap[file.name]
            return (
              <motion.div
                key={file.name}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border ${isSelected && isSelecting ? "ring-airlume ring-2" : ""}`}
                onClick={() => handleImageClick(file.name, publicUrl)}
              >
                <Image
                  src={publicUrl}
                  alt={file.name}
                  width={300}
                  height={300}
                  className={`h-full w-full object-cover transition-all duration-200 group-hover:opacity-80 ${isSelected && isSelecting ? "opacity-60" : ""}`}
                  loading="lazy"
                />
                {/* Overlay for selected */}
                {isSelecting && isSelected && (
                  <Button
                    variant="custom"
                    className="shadow-custom absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center rounded-full"
                  >
                    <Check size={20} />
                  </Button>
                )}
                {/* Overlay for in-use */}
                {isUsed && (
                  <div className="bg-background shadow-custom text-foreground absolute top-2 left-2 z-2 flex items-center gap-1 rounded px-2 py-1 text-xs">
                    <Eye size={14} /> In use
                  </div>
                )}
                {/* Delete button (individual) */}
                {isSelecting && !isUsed && (
                  <Button
                    variant="destructive"
                    className="shadow-custom absolute bottom-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(file.name)
                    }}
                    disabled={deleting === file.name}
                  >
                    {deleting === file.name ? (
                      <X size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </Button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
      {/* Mass delete bar */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-between border bg-white/80 p-4 shadow backdrop-blur dark:bg-black/40"
          >
            <span className="font-semibold text-black dark:text-white">
              {selected.length} seleccionadas
            </span>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={handleMassDelete}
              disabled={massDeleting || selected.length === 0}
            >
              <Trash2 size={20} />
              {massDeleting ? "Eliminando..." : "Borrar seleccionadas"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Preview dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="flex flex-col items-center p-0">
          <DialogTitle className="sr-only">Preview Image</DialogTitle>
          {preview && (
            <Image
              src={preview}
              width={1000}
              height={1000}
              alt="Vista previa"
              className="max-h-[80vh] max-w-full rounded-lg border shadow-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
