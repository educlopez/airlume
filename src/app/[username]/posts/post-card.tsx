"use client";

import { format } from "date-fns";
import {
  Copy,
  EllipsisVertical,
  Eye,
  EyeOff,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SocialBluesky } from "@/components/icons/social-bluesky";
import { SocialLinkedIn } from "@/components/icons/social-linkedin";
import { SocialX } from "@/components/icons/social-x";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import {
  deleteGeneration,
  duplicateGeneration,
  scheduleGenerationMultiPlatform,
  updateGeneration,
} from "../generator/actions";
import MediaLibraryPicker from "./media-library-picker";

export interface Generation {
  created_at: string;
  id: string;
  image_url: string | null;
  response: string;
  scheduled_at?: string | null;
  status: "draft" | "queue" | "sent";
}

export interface Schedule {
  error_message?: string | null;
  generation: Generation;
  id: string;
  platform: "twitter" | "bluesky" | "linkedin";
  published_post_id?: string | null;
  scheduled_at: string;
  status: "queue" | "sent" | "failed";
}

interface User {
  firstName?: string | null;
  fullName?: string | null;
  id: string;
  imageUrl?: string | null;
  username?: string | null;
}

export interface PlatformStatus {
  error_message?: string | null;
  platform: "twitter" | "bluesky" | "linkedin";
  published_post_id?: string | null;
  scheduled_at?: string;
  status: "queue" | "sent" | "failed";
}

const PLATFORM_ENDPOINTS: Record<string, string> = {
  twitter: "/api/twitter/publish",
  bluesky: "/api/bluesky/publish",
  linkedin: "/api/linkedin/publish",
};

function getStatusColor(status: string, isSent: boolean): string {
  if (isSent) {
    return "#12B981";
  }
  if (status === "failed") {
    return "#F43F5F";
  }
  if (status === "queue") {
    return "#A88BFA";
  }
  return "#A1A1AA";
}

function getStatusLabel(
  isSent: boolean,
  scheduleStatus: string | undefined,
  generationStatus: string
): string {
  if (isSent) {
    return "Sent";
  }
  if (scheduleStatus) {
    return scheduleStatus.charAt(0).toUpperCase() + scheduleStatus.slice(1);
  }
  return generationStatus.charAt(0).toUpperCase() + generationStatus.slice(1);
}

// NUEVO: Hook para obtener el estado por plataforma
function usePlatformStatuses(generationId: string): PlatformStatus[] {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  useEffect(() => {
    fetch(`/api/generations/${generationId}/platforms`)
      .then((r) => r.json())
      .then((data) => setPlatforms(data.platforms || []));
  }, [generationId]);
  return platforms;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: large component
export function PostCard({
  generation,
  user,
  hasTwitter,
  schedule,
}: {
  generation: Generation;
  user: User;
  hasTwitter: boolean;
  schedule?: Schedule;
}) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(generation.response);
  const [imageUrl, setImageUrl] = useState(generation.image_url ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [blueskyDialogOpen, setBlueskyDialogOpen] = useState(false);
  const [blueskyHandle, setBlueskyHandle] = useState("");
  const [blueskyPassword, setBlueskyPassword] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [publishingBluesky, setPublishingBluesky] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingBluesky] = useState(false);
  const [hasBluesky, setHasBluesky] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);
  const [hasTwitterOAuth1, setHasTwitterOAuth1] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishTwitter, setPublishTwitter] = useState(false);
  const [publishBluesky, setPublishBluesky] = useState(false);
  const [publishLinkedIn, setPublishLinkedIn] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleTwitter, setScheduleTwitter] = useState(false);
  const [scheduleBluesky, setScheduleBluesky] = useState(false);
  const [scheduleLinkedIn, setScheduleLinkedIn] = useState(false);
  const [scheduledDateTwitter, setScheduledDateTwitter] = useState<
    Date | undefined
  >();
  const [scheduledTimeTwitter, setScheduledTimeTwitter] = useState("");
  const [scheduledDateBluesky, setScheduledDateBluesky] = useState<
    Date | undefined
  >();
  const [scheduledTimeBluesky, setScheduledTimeBluesky] = useState("");
  const [scheduledDateLinkedIn, setScheduledDateLinkedIn] = useState<
    Date | undefined
  >();
  const [scheduledTimeLinkedIn, setScheduledTimeLinkedIn] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [editPlatform, setEditPlatform] = useState<null | {
    platform: string;
    scheduled_at: string;
  }>(null);
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [retryPlatform, setRetryPlatform] = useState<null | string>(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileError, setImageFileError] = useState<string | null>(null);
  const [imageUrlFromLibrary, setImageUrlFromLibrary] = useState<string | null>(
    null
  );
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);

  const platforms = usePlatformStatuses(generation.id);

  // Si hay schedule, sobreescribe los datos relevantes
  const platform = schedule?.platform;
  const scheduleStatus = schedule?.status;
  const scheduledAt = schedule?.scheduled_at;
  const errorMessage = schedule?.error_message;

  // Hide action buttons if sent (direct or any platform sent)
  const isSent =
    generation.status === "sent" || platforms.some((p) => p.status === "sent");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Always clear all other image states when picking a new file
    setImageUrlFromLibrary(null);
    setImageFileError(null);
    if (file) {
      if (file.size > 1024 * 1024) {
        setImageFileError("Image must be less than 1MB.");
        setImageFile(null);
        setImageUrl("");
      } else {
        setImageUrl(URL.createObjectURL(file));
        setImageFile(file);
        setImageFileError(null);
      }
    } else {
      setImageFile(null);
      setImageUrl("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    let finalImageUrl = imageUrlFromLibrary ? imageUrlFromLibrary : imageUrl;
    if (imageFile) {
      try {
        const { uploadImageToSupabase } = await import("../generator/actions");
        const result = await uploadImageToSupabase({
          userId: user.id,
          imageFile,
        });
        if (typeof result === "object" && result.error) {
          toast.error(result.error);
          setSaving(false);
          return;
        }
        finalImageUrl = result as string;
      } catch (err) {
        toast.error("Error uploading image");
        console.error(err);
        setSaving(false);
        return;
      }
    }
    await updateGeneration({
      id: generation.id,
      response,
      image_url: finalImageUrl ? finalImageUrl : "",
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multi-platform publish handler
  const handleMultiPublish = async () => {
    setPublishing(true);
    let anySuccess = false;
    // Twitter
    if (publishTwitter) {
      let imageBase64: string | null = null;
      // If we have an image and OAuth 1.0a connection, include it
      if (imageUrl && hasTwitterOAuth1) {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          toast.error("Could not read image for Twitter upload.");
          setPublishing(false);
          return;
        }
      }

      const res = await fetch("/api/twitter/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: response,
          id: generation.id,
          imageBase64: imageBase64 || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Published to Twitter!");
        anySuccess = true;
      } else {
        const data = await res.json();
        if (data.needsOAuth1) {
          toast.error("Please connect Twitter via Settings to post images");
        } else {
          toast.error(data.error || "Failed to publish to Twitter.");
        }
      }
    }
    // Bluesky
    if (publishBluesky) {
      let imageBase64: string | null = null;
      if (imageUrl) {
        try {
          const res = await fetch(imageUrl);
          const blob = await res.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          toast.error("Could not read image for Bluesky upload.");
          setPublishing(false);
          return;
        }
      }
      const res = await fetch("/api/bluesky/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: response,
          imageBase64,
          imageAlt,
          id: generation.id,
        }),
      });
      if (res.ok) {
        toast.success("Published to Bluesky!");
        anySuccess = true;
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to publish to Bluesky.");
      }
    }
    // LinkedIn
    if (publishLinkedIn) {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postContent: response,
          id: generation.id,
          imageUrl: imageUrl || null,
          imageAlt: imageAlt || "",
        }),
      });
      if (res.ok) {
        toast.success("Published to LinkedIn!");
        anySuccess = true;
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to publish to LinkedIn.");
      }
    }
    setPublishing(false);
    setPublishModalOpen(false);
    if (anySuccess) {
      router.refresh();
    }
  };

  const handleSaveBlueskyCreds = async () => {
    setPublishingBluesky(true);
    try {
      const res = await fetch("/api/bluesky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: blueskyHandle,
          appPassword: blueskyPassword,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save credentials");
      }
      setHasBluesky(true);
      setBlueskyPassword("");
      return true;
    } catch {
      toast.error("Failed to save Bluesky credentials");
      return false;
    } finally {
      setPublishingBluesky(false);
    }
  };

  const handlePublishBluesky = async () => {
    if (!hasBluesky) {
      const ok = await handleSaveBlueskyCreds();
      if (!ok) {
        return;
      }
    }
    setPublishingBluesky(true);
    let imageBase64: string | null = null;
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch {
        toast.error("Could not read image for Bluesky upload.");
        setPublishingBluesky(false);
        return;
      }
    }
    const res = await fetch("/api/bluesky/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postContent: response,
        imageBase64,
        imageAlt,
        handle: blueskyHandle,
        appPassword: blueskyPassword,
        id: generation.id,
      }),
    });
    setPublishingBluesky(false);
    setBlueskyDialogOpen(false);
    if (res.ok) {
      toast.success("Published to Bluesky!");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to publish to Bluesky.");
    }
  };

  const handleScheduleMulti = async () => {
    const platforms: Array<{ platform: string; scheduled_at: string }> = [];
    if (scheduleTwitter && scheduledDateTwitter && scheduledTimeTwitter) {
      const [h, m] = scheduledTimeTwitter.split(":");
      const d = new Date(scheduledDateTwitter);
      d.setHours(Number(h));
      d.setMinutes(Number(m));
      d.setSeconds(0);
      d.setMilliseconds(0);
      platforms.push({ platform: "twitter", scheduled_at: d.toISOString() });
    }
    if (scheduleBluesky && scheduledDateBluesky && scheduledTimeBluesky) {
      const [h, m] = scheduledTimeBluesky.split(":");
      const d = new Date(scheduledDateBluesky);
      d.setHours(Number(h));
      d.setMinutes(Number(m));
      d.setSeconds(0);
      d.setMilliseconds(0);
      platforms.push({ platform: "bluesky", scheduled_at: d.toISOString() });
    }
    if (scheduleLinkedIn && scheduledDateLinkedIn && scheduledTimeLinkedIn) {
      const [h, m] = scheduledTimeLinkedIn.split(":");
      const d = new Date(scheduledDateLinkedIn);
      d.setHours(Number(h));
      d.setMinutes(Number(m));
      d.setSeconds(0);
      d.setMilliseconds(0);
      platforms.push({ platform: "linkedin", scheduled_at: d.toISOString() });
    }
    if (platforms.length === 0) {
      return;
    }
    setScheduling(true);
    await scheduleGenerationMultiPlatform({ id: generation.id, platforms });
    setScheduling(false);
    setScheduleDialogOpen(false);
    window.location.reload();
  };

  // Edit schedule logic
  const handleEditSchedule = async () => {
    if (!(editPlatform && editDate && editTime)) {
      return;
    }
    setEditLoading(true);
    const [h, m] = editTime.split(":");
    const d = new Date(editDate);
    d.setHours(Number(h));
    d.setMinutes(Number(m));
    d.setSeconds(0);
    d.setMilliseconds(0);
    const res = await fetch(
      `/api/generations/${generation.id}/platforms/schedule`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: editPlatform.platform,
          scheduled_at: d.toISOString(),
        }),
      }
    );
    setEditLoading(false);
    setEditPlatform(null);
    if (res.ok) {
      toast.success("Schedule updated!");
      window.location.reload();
    } else {
      toast.error("Failed to update schedule");
    }
  };

  // Retry logic
  const handleRetry = async (platform: string) => {
    setRetryLoading(true);
    const endpoint = PLATFORM_ENDPOINTS[platform] ?? null;
    if (!endpoint) {
      return;
    }
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postContent: response,
        id: generation.id,
        userId: user.id,
      }),
    });
    setRetryLoading(false);
    setRetryPlatform(null);
    if (res.ok) {
      toast.success(`Re-published to ${platform}`);
      window.location.reload();
    } else {
      const data = await res.json();
      toast.error(data.error || `Failed to re-publish to ${platform}`);
    }
  };

  // Cancelar schedule de una plataforma (solo borra la fila de generations_platforms)
  const handleCancelQueue = async (platform: string) => {
    setCancelLoading(platform);
    const res = await fetch(
      `/api/generations/${generation.id}/platforms/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      }
    );
    setCancelLoading(null);
    if (res.ok) {
      toast.success(`Queue cancelled for ${platform}`);
      window.location.reload();
    } else {
      toast.error(`Failed to cancel queue for ${platform}`);
    }
  };

  useEffect(() => {
    // Check Bluesky connection on mount
    fetch("/api/bluesky", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.handle) {
          setBlueskyHandle(data.handle);
          setHasBluesky(true);
        } else {
          setHasBluesky(false);
        }
      })
      .catch(() => setHasBluesky(false));

    // Check LinkedIn connection on mount with cache busting
    fetch(`/api/linkedin?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        console.log("[PostCard] LinkedIn connection data:", data);
        if (data?.connected) {
          setHasLinkedIn(true);
        } else {
          setHasLinkedIn(false);
          console.log("[PostCard] LinkedIn not connected. Debug:", data.debug);
        }
      })
      .catch((error) => {
        console.error("[PostCard] Error checking LinkedIn:", error);
        setHasLinkedIn(false);
      });

    // Check Twitter OAuth 1.0a connection for image support
    fetch("/api/twitter/oauth/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        console.log("[PostCard] Twitter OAuth 1.0a data:", data);
        setHasTwitterOAuth1(data.connected);
      })
      .catch((error) => {
        console.error("[PostCard] Error checking Twitter OAuth 1.0a:", error);
        setHasTwitterOAuth1(false);
      });
  }, []);

  return (
    <Card className="gap-4 border-none bg-background py-4 shadow-custom">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          {/* Icono de plataforma fuera del badge */}
          {schedule && (
            <div className="flex items-center justify-center gap-2 rounded-full bg-airlume/10 p-2">
              {platform === "twitter" && (
                <SocialX className="size-4 text-airlume" />
              )}
              {platform === "bluesky" && (
                <SocialBluesky className="size-4 text-airlume" />
              )}
              {platform === "linkedin" && (
                <SocialLinkedIn className="size-4 text-airlume" />
              )}
            </div>
          )}
          {/* Badge de status tipo "Status" */}
          <span className="inline-flex items-center rounded-lg bg-primary px-2 py-0.5 font-medium text-foreground text-sm shadow-custom">
            <span
              className="mr-2 inline-block h-3 w-3 rounded"
              style={{
                backgroundColor: getStatusColor(scheduleStatus ?? "", isSent),
              }}
            />
            {getStatusLabel(isSent, scheduleStatus, generation.status)}
            {scheduledAt && (
              <span className="ml-1 text-foreground/70 text-xs">
                ({format(new Date(scheduledAt), "MMM d, HH:mm")})
              </span>
            )}
          </span>
        </div>
        {/* DropdownMenu: solo permite duplicar si todas sent/failed/draft, borrar solo si todas draft/failed */}
        {!(schedule || isSent) && (
          <div className="flex flex-row items-center gap-2">
            <Dialog onOpenChange={setOpen} open={open}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Pencil className="size-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full min-w-2xl max-w-4xl p-8">
                <DialogHeader>
                  <DialogTitle>Edit Draft</DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex w-full flex-col gap-6 md:flex-row">
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          alt={user?.fullName || user?.username || "User"}
                          src={user?.imageUrl ?? ""}
                        />
                        <AvatarFallback>
                          {user?.firstName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user?.fullName || user?.username}
                      </span>
                    </div>
                    <textarea
                      className="min-h-[120px] w-full rounded border p-2 focus:border-blue-400 focus:outline-none focus:ring"
                      onChange={(e) => setResponse(e.target.value)}
                      value={response}
                    />
                    <div className="mt-2 flex items-center gap-4">
                      {imageUrlFromLibrary || imageUrl ? (
                        <div className="relative">
                          <Image
                            alt="Preview"
                            className="max-h-20 min-h-10 min-w-10 rounded border object-contain"
                            height={80}
                            src={
                              imageUrlFromLibrary
                                ? imageUrlFromLibrary
                                : imageUrl
                            }
                            width={80}
                          />
                          <Button
                            className="absolute -top-2 -right-2"
                            onClick={() => {
                              setImageUrl("");
                              setImageUrlFromLibrary(null);
                              setImageFile(null);
                            }}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            ×
                          </Button>
                        </div>
                      ) : null}
                      <input
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        type="file"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        variant="outline"
                      >
                        {imageUrlFromLibrary || imageUrl
                          ? "Change Image"
                          : "Add Image"}
                      </Button>
                      <Button
                        onClick={() => setMediaDialogOpen(true)}
                        type="button"
                        variant="outline"
                      >
                        Choose from Media Library
                      </Button>
                      <MediaLibraryPicker
                        onOpenChange={setMediaDialogOpen}
                        onSelect={(url: string) => {
                          // Always clear all other image states when picking from library
                          setImageUrlFromLibrary(url);
                          setImageUrl("");
                          setImageFile(null);
                          setImageFileError(null);
                          setMediaDialogOpen(false);
                        }}
                        open={mediaDialogOpen}
                        userId={user.id}
                      />
                    </div>
                    {imageFileError && (
                      <div className="mt-2 text-red-500 text-xs">
                        {imageFileError}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button
                      disabled={saving || !!imageFileError}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={saving || !!imageFileError}
                    onClick={handleSave}
                    variant="custom"
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <EllipsisVertical className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Duplicar: solo si todas las plataformas están en sent, failed o draft */}
                {platforms.every((p) =>
                  ["sent", "failed", "draft"].includes(p.status)
                ) && (
                  <DropdownMenuItem
                    onClick={async () => {
                      await duplicateGeneration({
                        id: generation.id,
                        user_id: user.id,
                      });
                      toast.success("Post duplicated as draft");
                      window.location.reload();
                    }}
                  >
                    <Copy className="mr-2 size-4" /> Duplicate
                  </DropdownMenuItem>
                )}
                {/* Borrar: solo si todas draft o failed */}
                {platforms.every((p) =>
                  ["draft", "failed"].includes(p.status)
                ) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await deleteGeneration(generation.id);
                        toast.success("Post deleted");
                        window.location.reload();
                      }}
                    >
                      <Trash2 className="mr-2 size-4" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
                {/* Si hay alguna sent, no permitir borrar */}
                {platforms.some((p) => p.status === "sent") && (
                  <DropdownMenuItem disabled>
                    <Trash2 className="mr-2 size-4" /> Cannot delete published
                    post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent className="mx-4 flex flex-col items-start gap-4 rounded-lg bg-primary p-2 shadow-custom md:flex-row">
        {generation.image_url ? (
          <div className="flex max-h-36 max-w-36 items-center justify-center overflow-hidden rounded shadow-custom">
            <Image
              alt="Post image"
              className="object-cover"
              height={160}
              src={generation.image_url}
              width={160}
            />
          </div>
        ) : null}
        <div className="flex-1 whitespace-pre-wrap text-foreground">
          {generation.response}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between">
        <div className="text-primary-foreground text-xs">
          Created:{" "}
          <span className="font-mono">
            {new Date(generation.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          {/* Acciones por schedule */}
          {schedule && scheduleStatus === "queue" && (
            <>
              <Button
                onClick={() => {
                  setEditPlatform({
                    platform: platform || "",
                    scheduled_at: scheduledAt || "",
                  });
                  setEditDate(scheduledAt ? new Date(scheduledAt) : new Date());
                  setEditTime(
                    scheduledAt ? format(new Date(scheduledAt), "HH:mm") : ""
                  );
                }}
                size="sm"
                variant="outline"
              >
                Edit {platform} Schedule
              </Button>
              <Button
                disabled={cancelLoading === platform}
                onClick={() => handleCancelQueue(platform || "")}
                size="sm"
                variant="destructive"
              >
                {cancelLoading === platform
                  ? "Cancelling..."
                  : `Cancel ${platform}`}
              </Button>
            </>
          )}
          {schedule && scheduleStatus === "failed" && (
            <Button
              disabled={retryLoading && retryPlatform === platform}
              onClick={() => {
                setRetryPlatform(platform || "");
                handleRetry(platform || "");
              }}
              size="sm"
              variant="destructive"
            >
              {retryLoading && retryPlatform === platform
                ? "Retrying..."
                : `Retry ${platform}`}
            </Button>
          )}
          {/* Acciones para drafts */}
          {!(schedule || isSent) && (
            <>
              <Button
                disabled={!hasTwitter}
                onClick={() => setScheduleDialogOpen(true)}
                size="sm"
                title={
                  hasTwitter
                    ? undefined
                    : "Connect your Twitter account to enable this action."
                }
                variant="outline"
              >
                Add to Queue
              </Button>
              <Button
                onClick={() => {
                  setPublishModalOpen(true);
                  setPublishTwitter(false);
                  setPublishBluesky(false);
                  setPublishLinkedIn(false);
                }}
                size="sm"
                variant="custom"
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </CardFooter>

      <Dialog onOpenChange={setPublishModalOpen} open={publishModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to Social Networks</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={publishTwitter}
                disabled={!hasTwitter || (!!imageUrl && !hasTwitterOAuth1)}
                onCheckedChange={(v) => setPublishTwitter(!!v)}
              />
              <span>Twitter/X</span>
              {hasTwitter && imageUrl && hasTwitterOAuth1 && (
                <span className="ml-2 text-green-600 text-xs">
                  ✓ Images supported
                </span>
              )}
              {hasTwitter && imageUrl && !hasTwitterOAuth1 && (
                <span className="ml-2 text-xs text-yellow-600">
                  (Connect Twitter in Settings for images)
                </span>
              )}
            </label>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={publishBluesky}
                disabled={!hasBluesky}
                onCheckedChange={(v) => setPublishBluesky(!!v)}
              />
              <span>Bluesky</span>
              {!hasBluesky && (
                <span className="ml-2 text-gray-500 text-xs">
                  Connect your Bluesky account in
                  <Link
                    className="ml-1 text-airlume underline"
                    href={
                      user?.username
                        ? `/${user.username}/settings`
                        : "/settings"
                    }
                  >
                    Settings
                  </Link>{" "}
                  to enable this option.
                </span>
              )}
            </label>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={publishLinkedIn}
                disabled={!hasLinkedIn}
                onCheckedChange={(v) => setPublishLinkedIn(!!v)}
              />
              <span>LinkedIn</span>
              {hasLinkedIn && imageUrl && (
                <span className="ml-2 text-green-600 text-xs">
                  ✓ Images supported
                </span>
              )}
              {!hasLinkedIn && (
                <span className="ml-2 text-gray-500 text-xs">
                  Connect your LinkedIn account in Account settings to enable
                  this option.
                </span>
              )}
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={publishing} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={
                publishing ||
                !(publishTwitter || publishBluesky || publishLinkedIn)
              }
              onClick={handleMultiPublish}
              variant="custom"
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setBlueskyDialogOpen} open={blueskyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Bluesky</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {hasBluesky ? (
              <div className="space-y-2">
                <div className="font-medium text-airlume">
                  Connected to Bluesky as <b>@{blueskyHandle}</b>
                </div>
                <div className="text-gray-500 text-xs">
                  Your credentials are securely stored. You can update or remove
                  them in Settings.
                </div>
              </div>
            ) : (
              <>
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="mb-1 flex items-center gap-1 font-medium">
                    Handle
                    <span
                      className="inline-block"
                      title="Your Bluesky username (handle)"
                    >
                      <Info className="size-4" />
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      @
                    </span>
                    <input
                      autoComplete="username"
                      className="w-full rounded border p-2 pl-8"
                      disabled={loadingBluesky}
                      onChange={(e) => setBlueskyHandle(e.target.value)}
                      placeholder="handle"
                      type="text"
                      value={blueskyHandle}
                    />
                  </div>
                  <div className="mt-1 text-gray-500 text-xs">
                    For example: yourname.bsky.social
                  </div>
                </div>
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="mb-1 block font-medium">
                    Bluesky App Password
                  </label>
                  <div className="mb-2 text-gray-500 text-xs">
                    Use an app password to connect safely. This is <b>not</b>{" "}
                    your account password.{" "}
                    <a
                      className="text-blue-600 underline"
                      href="https://bsky.app/settings/app-passwords"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Generate app password in Bluesky
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      autoComplete="current-password"
                      className="w-full rounded border p-2 pr-10"
                      disabled={loadingBluesky}
                      onChange={(e) => setBlueskyPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      type={showPassword ? "text" : "password"}
                      value={blueskyPassword}
                    />
                    <button
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
            {imageUrl && (
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                <label className="mb-1 block font-medium">
                  Image Alt Text (optional)
                </label>
                <input
                  className="w-full rounded border p-2"
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description of the image for accessibility"
                  type="text"
                  value={imageAlt}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                disabled={publishingBluesky || loadingBluesky}
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={
                publishingBluesky ||
                !(hasBluesky || (blueskyHandle && blueskyPassword)) ||
                loadingBluesky
              }
              onClick={handlePublishBluesky}
              variant="custom"
            >
              {publishingBluesky && "Publishing..."}
              {!publishingBluesky && hasBluesky && "Publish to Bluesky"}
              {!(publishingBluesky || hasBluesky) &&
                "Save Credentials and Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setScheduleDialogOpen} open={scheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="font-medium">Select platforms to schedule:</label>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={scheduleTwitter}
                onCheckedChange={(v) => setScheduleTwitter(!!v)}
              />
              <span>Twitter/X</span>
            </label>
            {scheduleTwitter && (
              <div className="ml-4 flex items-end gap-4">
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="font-medium">Date (Twitter):</label>
                  <Calendar
                    className="rounded-md border"
                    fromDate={new Date()}
                    mode="single"
                    onSelect={setScheduledDateTwitter}
                    selected={scheduledDateTwitter}
                  />
                </div>
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="font-medium">Time (Twitter):</label>
                  <Input
                    className="w-32"
                    onChange={(e) => setScheduledTimeTwitter(e.target.value)}
                    type="time"
                    value={scheduledTimeTwitter}
                  />
                </div>
              </div>
            )}
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={scheduleBluesky}
                disabled={!hasBluesky}
                onCheckedChange={(v) => setScheduleBluesky(!!v)}
              />
              <span>Bluesky</span>
              {!hasBluesky && (
                <span className="ml-2 text-gray-500 text-xs">
                  Connect your Bluesky account in
                  <Link
                    className="ml-1 text-airlume underline"
                    href={
                      user?.username
                        ? `/${user.username}/settings`
                        : "/settings"
                    }
                  >
                    Settings
                  </Link>{" "}
                  to enable this option.
                </span>
              )}
            </label>
            {scheduleBluesky && (
              <div className="ml-4 flex items-end gap-4">
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="font-medium">Date (Bluesky):</label>
                  <Calendar
                    className="rounded-md border"
                    fromDate={new Date()}
                    mode="single"
                    onSelect={setScheduledDateBluesky}
                    selected={scheduledDateBluesky}
                  />
                </div>
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="font-medium">Time (Bluesky):</label>
                  <Input
                    className="w-32"
                    onChange={(e) => setScheduledTimeBluesky(e.target.value)}
                    type="time"
                    value={scheduledTimeBluesky}
                  />
                </div>
              </div>
            )}
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={scheduleLinkedIn}
                disabled={!hasLinkedIn}
                onCheckedChange={(v) => setScheduleLinkedIn(!!v)}
              />
              <span>LinkedIn</span>
              {!hasLinkedIn && (
                <span className="ml-2 text-gray-500 text-xs">
                  Connect your LinkedIn account in Account settings to enable
                  this option.
                </span>
              )}
            </label>
            {scheduleLinkedIn && (
              <div className="ml-4 flex items-end gap-4">
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="font-medium">Date (LinkedIn):</label>
                  <Calendar
                    className="rounded-md border"
                    fromDate={new Date()}
                    mode="single"
                    onSelect={setScheduledDateLinkedIn}
                    selected={scheduledDateLinkedIn}
                  />
                </div>
                <div>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
                  <label className="font-medium">Time (LinkedIn):</label>
                  <Input
                    className="w-32"
                    onChange={(e) => setScheduledTimeLinkedIn(e.target.value)}
                    type="time"
                    value={scheduledTimeLinkedIn}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={scheduling} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={
                scheduling ||
                !(scheduleTwitter || scheduleBluesky || scheduleLinkedIn) ||
                (scheduleTwitter &&
                  !(scheduledDateTwitter && scheduledTimeTwitter)) ||
                (scheduleBluesky &&
                  !(scheduledDateBluesky && scheduledTimeBluesky)) ||
                (scheduleLinkedIn &&
                  !(scheduledDateLinkedIn && scheduledTimeLinkedIn))
              }
              onClick={handleScheduleMulti}
              variant="custom"
            >
              {scheduling ? "Scheduling..." : "Add to Queue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal para editar schedule */}
      <Dialog onOpenChange={() => setEditPlatform(null)} open={!!editPlatform}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editPlatform?.platform} Schedule</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="font-medium">Date:</label>
            <Calendar
              className="rounded-md border"
              fromDate={new Date()}
              mode="single"
              onSelect={setEditDate}
              selected={editDate}
            />
            {/* biome-ignore lint/a11y/noLabelWithoutControl: custom form controls */}
            <label className="font-medium">Time:</label>
            <Input
              className="w-32"
              onChange={(e) => setEditTime(e.target.value)}
              type="time"
              value={editTime}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={editLoading} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={editLoading || !editDate || !editTime}
              onClick={handleEditSchedule}
              variant="custom"
            >
              {editLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Mostrar error si failed */}
      {schedule && scheduleStatus === "failed" && errorMessage && (
        <div className="px-4 pb-2 text-red-500 text-xs">{errorMessage}</div>
      )}
    </Card>
  );
}
