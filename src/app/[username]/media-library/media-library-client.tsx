"use client";

import { Check, Eye, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { NotImageFound } from "@/components/icons/no-image-found";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { deleteImage, isImageUsed, uploadImage } from "./actions";

interface FileItem {
  id?: string | null;
  name: string;
  updated_at?: string | null;
}

export default function MediaLibraryClient({
  userId,
  files,
}: {
  userId: string;
  files: FileItem[];
}) {
  const [items, setItems] = useState(files);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [usedMap, setUsedMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [massDeleting, setMassDeleting] = useState(false);

  useEffect(() => {
    const checkUsed = async () => {
      const map: Record<string, boolean> = {};
      await Promise.all(
        items.map(async (file) => {
          const res = await isImageUsed({ userId, fileName: file.name });
          map[file.name] = !!res.used;
        })
      );
      setUsedMap(map);
    };
    checkUsed();
  }, [items, userId]);

  const handleImageClick = useCallback(
    (name: string, publicUrl: string) => {
      if (!isSelecting) {
        setPreview(publicUrl);
        return;
      }
      setSelected((prev) =>
        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
      );
    },
    [isSelecting]
  );

  const handleDelete = async (name: string) => {
    setDeleting(name);
    setError(null);
    const res = await deleteImage({ userId, fileName: name });
    if (res?.error) {
      setError(`Error al eliminar: ${res.error}`);
      console.error("Server action delete error:", res.error);
    } else {
      setItems(items.filter((f) => f.name !== name));
      setSelected(selected.filter((n) => n !== name));
    }
    setDeleting(null);
  };

  const handleMassDelete = async () => {
    setMassDeleting(true);
    setError(null);
    for (const name of selected) {
      const res = await deleteImage({ userId, fileName: name });
      if (res?.error) {
        setError(`Error al eliminar: ${res.error}`);
        console.error("Server action delete error:", res.error);
        break;
      }
      setItems((prev) => prev.filter((f) => f.name !== name));
    }
    setSelected([]);
    setMassDeleting(false);
  };

  const handleReset = () => {
    setSelected([]);
    setIsSelecting(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Image must be less than 1MB.");
      return;
    }
    // Upload logic
    const res = await uploadImage({ userId, file });
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    // Extract file name from URL or use file.name
    let name = file.name;
    if (res.url) {
      const parts = res.url.split("/");
      name = parts.at(-1) ?? file.name;
    }
    setItems((prev) => [
      { name, updated_at: new Date().toISOString() },
      ...prev,
    ]);
    toast.success("Image uploaded!");
  };

  if (!items.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <NotImageFound
          backgroundColor="var(--color-primary)"
          className="ml-2"
          primaryColor="var(--color-airlume)"
        />
        <span className="text-muted-foreground text-sm">No images yet</span>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Upload button and input */}
      <div className="mb-4 flex items-center gap-2">
        <input
          accept="image/*"
          className="hidden"
          id="media-upload-input"
          onChange={handleFileChange}
          type="file"
        />
        <label htmlFor="media-upload-input">
          <Button asChild variant="outline">
            <span>Upload Image</span>
          </Button>
        </label>
        <span className="ml-2 text-gray-500 text-xs">
          Max file size: 1MB. Larger files will be rejected.
        </span>
      </div>
      {/* Top bar */}
      <div className="flex justify-start gap-2">
        <motion.div
          aria-label={isSelecting ? "Cancel selection" : "Select images"}
          onClick={() => {
            setIsSelecting((prev) => {
              if (prev) {
                setSelected([]);
              }
              return !prev;
            });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {" "}
          {isSelecting ? (
            <Button variant="destructive">Cancel selection</Button>
          ) : (
            <Button variant="custom">Select to delete</Button>
          )}
        </motion.div>
        {selected.length > 0 && (
          <motion.div
            aria-label="Reset selection"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline">Reset selection</Button>
          </motion.div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="my-4 rounded border border-red-300 bg-red-100 p-2 text-red-700 text-sm">
          {error}
        </div>
      )}
      {/* Gallery grid */}
      <motion.div className="my-4 grid grid-cols-4 gap-2" layout>
        <AnimatePresence>
          {items.map((file) => {
            const publicUrl = `https://kdwolwebviyzyjulmzgb.supabase.co/storage/v1/object/public/images/${userId}/${file.name}`;
            const isSelected = selected.includes(file.name);
            const isUsed = usedMap[file.name];
            return (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border ${isSelected && isSelecting ? "ring-2 ring-airlume" : ""}`}
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                key={file.name}
                layout
                onClick={() => handleImageClick(file.name, publicUrl)}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Image
                  alt={file.name}
                  className={`h-full w-full object-cover transition-all duration-200 group-hover:opacity-80 ${isSelected && isSelecting ? "opacity-60" : ""}`}
                  height={300}
                  loading="lazy"
                  src={publicUrl}
                  width={300}
                />
                {/* Overlay for selected */}
                {isSelecting && isSelected && (
                  <Button
                    className="absolute right-2 bottom-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-custom"
                    variant="custom"
                  >
                    <Check size={20} />
                  </Button>
                )}
                {/* Overlay for in-use */}
                {isUsed && (
                  <div className="absolute top-2 left-2 z-2 flex items-center gap-1 rounded bg-background px-2 py-1 text-foreground text-xs shadow-custom">
                    <Eye size={14} /> In use
                  </div>
                )}
                {/* Delete button (individual) */}
                {isSelecting && !isUsed && (
                  <Button
                    className="absolute bottom-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-custom"
                    disabled={deleting === file.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.name);
                    }}
                    variant="destructive"
                  >
                    {deleting === file.name ? (
                      <X size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {/* Mass delete bar */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed right-0 bottom-0 left-0 z-30 flex items-center justify-between border bg-white/80 p-4 shadow backdrop-blur dark:bg-black/40"
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
          >
            <span className="font-semibold text-black dark:text-white">
              {selected.length} seleccionadas
            </span>
            <Button
              className="flex items-center gap-2"
              disabled={massDeleting || selected.length === 0}
              onClick={handleMassDelete}
              variant="destructive"
            >
              <Trash2 size={20} />
              {massDeleting ? "Eliminando..." : "Borrar seleccionadas"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Preview dialog */}
      <Dialog onOpenChange={() => setPreview(null)} open={!!preview}>
        <DialogContent className="flex flex-col items-center p-0">
          <DialogTitle className="sr-only">Preview Image</DialogTitle>
          {preview && (
            <Image
              alt="Vista previa"
              className="max-h-[80vh] max-w-full rounded-lg border shadow-lg"
              height={1000}
              src={preview}
              width={1000}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
