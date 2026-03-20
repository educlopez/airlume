"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import MediaLibraryPicker from "./media-library-picker";

export default function MediaLibraryPickerButton({
  userId,
}: {
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const handleSelect = (url: string) => {
    console.log("Selected image URL:", url);
    setOpen(false);
  };
  return (
    <>
      <Button className="mb-4" onClick={() => setOpen(true)}>
        Open Media Library
      </Button>
      <MediaLibraryPicker
        onOpenChange={setOpen}
        onSelect={handleSelect}
        open={open}
        userId={userId}
      />
    </>
  );
}
