"use client";

import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Local type for Supabase file items
export interface FileItem {
  id?: string;
  name: string;
  updated_at?: string;
}

// Create Supabase client ONCE outside the component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ""
);

interface MediaLibraryPickerProps {
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  open: boolean;
  userId: string;
}

export default function MediaLibraryPicker({
  userId,
  open,
  onOpenChange,
  onSelect,
}: MediaLibraryPickerProps) {
  const [mediaFiles, setMediaFiles] = useState<FileItem[]>([]);
  useEffect(() => {
    if (!open) {
      return;
    }
    async function fetchFiles() {
      const { data, error } = await supabase.storage
        .from("images")
        .list(`${userId}/`, { limit: 100 });
      if (!error && data) {
        setMediaFiles((data as FileItem[]).filter((f: FileItem) => f.name));
      }
    }
    fetchFiles();
  }, [open, userId]);
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Select an image from your library</DialogTitle>
        <div className="grid grid-cols-3 gap-4">
          {mediaFiles.length === 0 && (
            <div className="col-span-3 text-center text-muted-foreground">
              No images found.
            </div>
          )}
          {mediaFiles.map((file) => {
            const publicUrl = `https://kdwolwebviyzyjulmzgb.supabase.co/storage/v1/object/public/images/${userId}/${file.name}`;
            return (
              <div
                className="group h-32 overflow-hidden rounded-sm"
                key={file.name}
              >
                <Image
                  alt={file.name}
                  className="h-full w-full cursor-pointer rounded border object-cover transition-all duration-300 group-hover:scale-105"
                  height={200}
                  onClick={() => {
                    onSelect(publicUrl);
                  }}
                  src={publicUrl}
                  width={200}
                />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
