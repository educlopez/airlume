"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Copy,
  EllipsisVertical,
  Eye,
  EyeOff,
  Info,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { SocialBluesky } from "@/components/icons/social-bluesky"
import { SocialX } from "@/components/icons/social-x"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import {
  deleteGeneration,
  duplicateGeneration,
  scheduleGenerationMultiPlatform,
  updateGeneration,
} from "../generator/actions"
import MediaLibraryPicker from "./MediaLibraryPicker"

export type Generation = {
  id: string
  response: string
  image_url: string | null
  created_at: string
  status: "draft" | "queue" | "sent"
  scheduled_at?: string | null
}

export type Schedule = {
  id: string
  platform: "twitter" | "bluesky"
  status: "queue" | "sent" | "failed"
  scheduled_at: string
  error_message?: string | null
  published_post_id?: string | null
  generation: Generation
}

type User = {
  id: string
  username?: string | null
  fullName?: string | null
  firstName?: string | null
  imageUrl?: string | null
}

export type PlatformStatus = {
  platform: "twitter" | "bluesky"
  status: "queue" | "sent" | "failed"
  scheduled_at?: string
  error_message?: string | null
  published_post_id?: string | null
}

// NUEVO: Hook para obtener el estado por plataforma
function usePlatformStatuses(generationId: string): PlatformStatus[] {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  useEffect(() => {
    fetch(`/api/generations/${generationId}/platforms`)
      .then((r) => r.json())
      .then((data) => setPlatforms(data.platforms || []))
  }, [generationId])
  return platforms
}

export function PostCard({
  generation,
  user,
  hasTwitter,
  schedule,
}: {
  generation: Generation
  user: User
  hasTwitter: boolean
  schedule?: Schedule
}) {
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState(generation.response)
  const [imageUrl, setImageUrl] = useState(generation.image_url ?? "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const [blueskyDialogOpen, setBlueskyDialogOpen] = useState(false)
  const [blueskyHandle, setBlueskyHandle] = useState("")
  const [blueskyPassword, setBlueskyPassword] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [publishingBluesky, setPublishingBluesky] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loadingBluesky] = useState(false)
  const [hasBluesky, setHasBluesky] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [publishTwitter, setPublishTwitter] = useState(false)
  const [publishBluesky, setPublishBluesky] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [scheduleTwitter, setScheduleTwitter] = useState(false)
  const [scheduleBluesky, setScheduleBluesky] = useState(false)
  const [scheduledDateTwitter, setScheduledDateTwitter] = useState<
    Date | undefined
  >()
  const [scheduledTimeTwitter, setScheduledTimeTwitter] = useState("")
  const [scheduledDateBluesky, setScheduledDateBluesky] = useState<
    Date | undefined
  >()
  const [scheduledTimeBluesky, setScheduledTimeBluesky] = useState("")
  const [scheduling, setScheduling] = useState(false)
  const [editPlatform, setEditPlatform] = useState<null | {
    platform: string
    scheduled_at: string
  }>(null)
  const [editDate, setEditDate] = useState<Date | undefined>()
  const [editTime, setEditTime] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [retryPlatform, setRetryPlatform] = useState<null | string>(null)
  const [retryLoading, setRetryLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageFileError, setImageFileError] = useState<string | null>(null)
  const [imageUrlFromLibrary, setImageUrlFromLibrary] = useState<string | null>(
    null
  )
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)

  const platforms = usePlatformStatuses(generation.id)

  // Si hay schedule, sobreescribe los datos relevantes
  const platform = schedule?.platform
  const scheduleStatus = schedule?.status
  const scheduledAt = schedule?.scheduled_at
  const errorMessage = schedule?.error_message

  // Hide action buttons if sent (direct or any platform sent)
  const isSent =
    generation.status === "sent" || platforms.some((p) => p.status === "sent")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Always clear all other image states when picking a new file
    setImageUrlFromLibrary(null)
    setImageFileError(null)
    if (file) {
      if (file.size > 1024 * 1024) {
        setImageFileError("Image must be less than 1MB.")
        setImageFile(null)
        setImageUrl("")
      } else {
        setImageUrl(URL.createObjectURL(file))
        setImageFile(file)
        setImageFileError(null)
      }
    } else {
      setImageFile(null)
      setImageUrl("")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    let finalImageUrl = imageUrlFromLibrary ? imageUrlFromLibrary : imageUrl
    if (imageFile) {
      try {
        const { uploadImageToSupabase } = await import("../generator/actions")
        const result = await uploadImageToSupabase({
          userId: user.id,
          imageFile,
        })
        if (typeof result === "object" && result.error) {
          toast.error(result.error)
          setSaving(false)
          return
        }
        finalImageUrl = result as string
      } catch (err) {
        toast.error("Error uploading image")
        console.error(err)
        setSaving(false)
        return
      }
    }
    await updateGeneration({
      id: generation.id,
      response,
      image_url: finalImageUrl ? finalImageUrl : "",
    })
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  const handleMultiPublish = async () => {
    setPublishing(true)
    let anySuccess = false
    // Twitter
    if (publishTwitter) {
      const res = await fetch("/api/twitter/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postContent: response, id: generation.id }),
      })
      if (res.ok) {
        toast.success("Published to Twitter!")
        anySuccess = true
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to publish to Twitter.")
      }
    }
    // Bluesky
    if (publishBluesky) {
      let imageBase64 = null
      if (imageUrl) {
        try {
          const res = await fetch(imageUrl)
          const blob = await res.blob()
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () =>
              resolve((reader.result as string).split(",")[1])
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        } catch {
          toast.error("Could not read image for Bluesky upload.")
          setPublishing(false)
          return
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
      })
      if (res.ok) {
        toast.success("Published to Bluesky!")
        anySuccess = true
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to publish to Bluesky.")
      }
    }
    setPublishing(false)
    setPublishModalOpen(false)
    if (anySuccess) router.refresh()
  }

  const handleSaveBlueskyCreds = async () => {
    setPublishingBluesky(true)
    try {
      const res = await fetch("/api/bluesky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: blueskyHandle,
          appPassword: blueskyPassword,
        }),
      })
      if (!res.ok) throw new Error("Failed to save credentials")
      setHasBluesky(true)
      setBlueskyPassword("")
      return true
    } catch {
      toast.error("Failed to save Bluesky credentials")
      return false
    } finally {
      setPublishingBluesky(false)
    }
  }

  const handlePublishBluesky = async () => {
    if (!hasBluesky) {
      const ok = await handleSaveBlueskyCreds()
      if (!ok) return
    }
    setPublishingBluesky(true)
    let imageBase64 = null
    if (imageUrl) {
      try {
        const res = await fetch(imageUrl)
        const blob = await res.blob()
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(",")[1])
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch {
        toast.error("Could not read image for Bluesky upload.")
        setPublishingBluesky(false)
        return
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
    })
    setPublishingBluesky(false)
    setBlueskyDialogOpen(false)
    if (res.ok) {
      toast.success("Published to Bluesky!")
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to publish to Bluesky.")
    }
  }

  const handleScheduleMulti = async () => {
    const platforms = []
    if (scheduleTwitter && scheduledDateTwitter && scheduledTimeTwitter) {
      const [h, m] = scheduledTimeTwitter.split(":")
      const d = new Date(scheduledDateTwitter)
      d.setHours(Number(h))
      d.setMinutes(Number(m))
      d.setSeconds(0)
      d.setMilliseconds(0)
      platforms.push({ platform: "twitter", scheduled_at: d.toISOString() })
    }
    if (scheduleBluesky && scheduledDateBluesky && scheduledTimeBluesky) {
      const [h, m] = scheduledTimeBluesky.split(":")
      const d = new Date(scheduledDateBluesky)
      d.setHours(Number(h))
      d.setMinutes(Number(m))
      d.setSeconds(0)
      d.setMilliseconds(0)
      platforms.push({ platform: "bluesky", scheduled_at: d.toISOString() })
    }
    if (platforms.length === 0) return
    setScheduling(true)
    await scheduleGenerationMultiPlatform({ id: generation.id, platforms })
    setScheduling(false)
    setScheduleDialogOpen(false)
    window.location.reload()
  }

  // Edit schedule logic
  const handleEditSchedule = async () => {
    if (!editPlatform || !editDate || !editTime) return
    setEditLoading(true)
    const [h, m] = editTime.split(":")
    const d = new Date(editDate)
    d.setHours(Number(h))
    d.setMinutes(Number(m))
    d.setSeconds(0)
    d.setMilliseconds(0)
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
    )
    setEditLoading(false)
    setEditPlatform(null)
    if (res.ok) {
      toast.success("Schedule updated!")
      window.location.reload()
    } else {
      toast.error("Failed to update schedule")
    }
  }

  // Retry logic
  const handleRetry = async (platform: string) => {
    setRetryLoading(true)
    const endpoint =
      platform === "twitter"
        ? "/api/twitter/publish"
        : platform === "bluesky"
          ? "/api/bluesky/publish"
          : null
    if (!endpoint) return
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postContent: response,
        id: generation.id,
        userId: user.id,
      }),
    })
    setRetryLoading(false)
    setRetryPlatform(null)
    if (res.ok) {
      toast.success(`Re-published to ${platform}`)
      window.location.reload()
    } else {
      const data = await res.json()
      toast.error(data.error || `Failed to re-publish to ${platform}`)
    }
  }

  // Cancelar schedule de una plataforma (solo borra la fila de generations_platforms)
  const handleCancelQueue = async (platform: string) => {
    setCancelLoading(platform)
    const res = await fetch(
      `/api/generations/${generation.id}/platforms/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      }
    )
    setCancelLoading(null)
    if (res.ok) {
      toast.success(`Queue cancelled for ${platform}`)
      window.location.reload()
    } else {
      toast.error(`Failed to cancel queue for ${platform}`)
    }
  }

  useEffect(() => {
    // Check Bluesky connection on mount
    fetch("/api/bluesky")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.handle) {
          setBlueskyHandle(data.handle)
          setHasBluesky(true)
        } else {
          setHasBluesky(false)
        }
      })
      .catch(() => setHasBluesky(false))
  }, [])

  return (
    <Card className="shadow-custom bg-background gap-4 border-none py-4">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          {/* Icono de plataforma fuera del badge */}
          {schedule && (
            <div className="bg-airlume/10 flex items-center justify-center gap-2 rounded-full p-2">
              {platform === "twitter" && (
                <SocialX className="text-airlume size-4" />
              )}
              {platform === "bluesky" && (
                <SocialBluesky className="text-airlume size-4" />
              )}
            </div>
          )}
          {/* Badge de status tipo "Status" */}
          <span className="shadow-custom bg-primary text-foreground inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-medium">
            <span
              className="mr-2 inline-block h-3 w-3 rounded"
              style={{
                backgroundColor: isSent
                  ? "#12B981" // sent color
                  : scheduleStatus === "failed"
                    ? "#F43F5F"
                    : scheduleStatus === "queue"
                      ? "#A88BFA"
                      : "#A1A1AA",
              }}
            />
            {isSent
              ? "Sent"
              : scheduleStatus
                ? scheduleStatus.charAt(0).toUpperCase() +
                  scheduleStatus.slice(1)
                : generation.status.charAt(0).toUpperCase() +
                  generation.status.slice(1)}
            {scheduledAt && (
              <span className="text-foreground/70 ml-1 text-xs">
                ({format(new Date(scheduledAt), "MMM d, HH:mm")})
              </span>
            )}
          </span>
        </div>
        {/* DropdownMenu: solo permite duplicar si todas sent/failed/draft, borrar solo si todas draft/failed */}
        {!schedule && !isSent && (
          <div className="flex flex-row items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Pencil className="size-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-4xl min-w-2xl p-8">
                <DialogHeader>
                  <DialogTitle>Edit Draft</DialogTitle>
                </DialogHeader>
                <div className="mt-4 flex w-full flex-col gap-6 md:flex-row">
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={user?.imageUrl ?? ""}
                          alt={user?.fullName || user?.username || "User"}
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
                      className="min-h-[120px] w-full rounded border p-2 focus:border-blue-400 focus:ring focus:outline-none"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                    />
                    <div className="mt-2 flex items-center gap-4">
                      {imageUrlFromLibrary || imageUrl ? (
                        <div className="relative">
                          <Image
                            src={
                              imageUrlFromLibrary
                                ? imageUrlFromLibrary
                                : imageUrl
                            }
                            alt="Preview"
                            width={80}
                            height={80}
                            className="max-h-20 min-h-10 min-w-10 rounded border object-contain"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute -top-2 -right-2"
                            onClick={() => {
                              setImageUrl("")
                              setImageUrlFromLibrary(null)
                              setImageFile(null)
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ) : null}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imageUrlFromLibrary || imageUrl
                          ? "Change Image"
                          : "Add Image"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMediaDialogOpen(true)}
                      >
                        Choose from Media Library
                      </Button>
                      <MediaLibraryPicker
                        userId={user.id}
                        open={mediaDialogOpen}
                        onOpenChange={setMediaDialogOpen}
                        onSelect={(url: string) => {
                          // Always clear all other image states when picking from library
                          setImageUrlFromLibrary(url)
                          setImageUrl("")
                          setImageFile(null)
                          setImageFileError(null)
                          setMediaDialogOpen(false)
                        }}
                      />
                    </div>
                    {imageFileError && (
                      <div className="mt-2 text-xs text-red-500">
                        {imageFileError}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      disabled={saving || !!imageFileError}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="custom"
                    onClick={handleSave}
                    disabled={saving || !!imageFileError}
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
                      })
                      toast.success("Post duplicated as draft")
                      window.location.reload()
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
                        await deleteGeneration(generation.id)
                        toast.success("Post deleted")
                        window.location.reload()
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
      <CardContent className="shadow-custom bg-primary mx-4 flex flex-col items-start gap-4 rounded-lg p-2 md:flex-row">
        {generation.image_url ? (
          <div className="shadow-custom flex max-h-36 max-w-36 items-center justify-center overflow-hidden rounded">
            <Image
              src={generation.image_url}
              alt="Post image"
              width={160}
              height={160}
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="text-foreground flex-1 whitespace-pre-wrap">
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
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditPlatform({
                    platform: platform || "",
                    scheduled_at: scheduledAt || "",
                  })
                  setEditDate(scheduledAt ? new Date(scheduledAt) : new Date())
                  setEditTime(
                    scheduledAt ? format(new Date(scheduledAt), "HH:mm") : ""
                  )
                }}
              >
                Edit {platform} Schedule
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleCancelQueue(platform || "")}
                disabled={cancelLoading === platform}
              >
                {cancelLoading === platform
                  ? "Cancelling..."
                  : `Cancel ${platform}`}
              </Button>
            </>
          )}
          {schedule && scheduleStatus === "failed" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setRetryPlatform(platform || "")
                handleRetry(platform || "")
              }}
              disabled={retryLoading && retryPlatform === platform}
            >
              {retryLoading && retryPlatform === platform
                ? "Retrying..."
                : `Retry ${platform}`}
            </Button>
          )}
          {/* Acciones para drafts */}
          {!schedule && !isSent && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasTwitter}
                title={
                  !hasTwitter
                    ? "Connect your Twitter account to enable this action."
                    : undefined
                }
                onClick={() => setScheduleDialogOpen(true)}
              >
                Add to Queue
              </Button>
              <Button
                variant="custom"
                size="sm"
                onClick={() => {
                  setPublishModalOpen(true)
                  setPublishTwitter(false)
                  setPublishBluesky(false)
                }}
              >
                Publish
              </Button>
            </>
          )}
        </div>
      </CardFooter>

      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to Social Networks</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={publishTwitter}
                onCheckedChange={(v) => setPublishTwitter(!!v)}
                disabled={!!imageUrl || !hasTwitter}
              />
              <span>Twitter/X</span>
              {imageUrl && (
                <span className="ml-2 text-xs text-yellow-600">
                  (No se pueden publicar imágenes en Twitter/X por el momento)
                </span>
              )}
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={publishBluesky}
                onCheckedChange={(v) => setPublishBluesky(!!v)}
                disabled={!hasBluesky}
              />
              <span>Bluesky</span>
              {!hasBluesky && (
                <span className="ml-2 text-xs text-gray-500">
                  Connect your Bluesky account in
                  <Link
                    href={
                      user?.username
                        ? `/${user.username}/settings`
                        : "/settings"
                    }
                    className="text-airlume ml-1 underline"
                  >
                    Settings
                  </Link>{" "}
                  to enable this option.
                </span>
              )}
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={publishing}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="custom"
              onClick={handleMultiPublish}
              disabled={publishing || (!publishTwitter && !publishBluesky)}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={blueskyDialogOpen} onOpenChange={setBlueskyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Bluesky</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {hasBluesky ? (
              <div className="space-y-2">
                <div className="text-airlume font-medium">
                  Connected to Bluesky as <b>@{blueskyHandle}</b>
                </div>
                <div className="text-xs text-gray-500">
                  Your credentials are securely stored. You can update or remove
                  them in Settings.
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 flex items-center gap-1 font-medium">
                    Handle
                    <span
                      className="inline-block"
                      aria-label="Your Bluesky username (handle)"
                    >
                      <Info className="size-4" />
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      @
                    </span>
                    <input
                      type="text"
                      className="w-full rounded border p-2 pl-8"
                      placeholder="handle"
                      value={blueskyHandle}
                      onChange={(e) => setBlueskyHandle(e.target.value)}
                      autoComplete="username"
                      disabled={loadingBluesky}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    For example: yourname.bsky.social
                  </div>
                </div>
                <div>
                  <label className="mb-1 block font-medium">
                    Bluesky App Password
                  </label>
                  <div className="mb-2 text-xs text-gray-500">
                    Use an app password to connect safely. This is <b>not</b>{" "}
                    your account password.{" "}
                    <a
                      href="https://bsky.app/settings/app-passwords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Generate app password in Bluesky
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded border p-2 pr-10"
                      placeholder="xxxx-xxxx-xxxx-xxxx"
                      value={blueskyPassword}
                      onChange={(e) => setBlueskyPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={loadingBluesky}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
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
                <label className="mb-1 block font-medium">
                  Image Alt Text (optional)
                </label>
                <input
                  type="text"
                  className="w-full rounded border p-2"
                  placeholder="Description of the image for accessibility"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={publishingBluesky || loadingBluesky}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="custom"
              onClick={handlePublishBluesky}
              disabled={
                publishingBluesky ||
                (!hasBluesky && (!blueskyHandle || !blueskyPassword)) ||
                loadingBluesky
              }
            >
              {publishingBluesky
                ? "Publishing..."
                : !hasBluesky
                  ? "Save Credentials and Publish"
                  : "Publish to Bluesky"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <label className="font-medium">Select platforms to schedule:</label>
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
                  <label className="font-medium">Date (Twitter):</label>
                  <Calendar
                    mode="single"
                    selected={scheduledDateTwitter}
                    onSelect={setScheduledDateTwitter}
                    fromDate={new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <label className="font-medium">Time (Twitter):</label>
                  <Input
                    type="time"
                    value={scheduledTimeTwitter}
                    onChange={(e) => setScheduledTimeTwitter(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2">
              <Checkbox
                checked={scheduleBluesky}
                onCheckedChange={(v) => setScheduleBluesky(!!v)}
                disabled={!hasBluesky}
              />
              <span>Bluesky</span>
              {!hasBluesky && (
                <span className="ml-2 text-xs text-gray-500">
                  Connect your Bluesky account in
                  <Link
                    href={
                      user?.username
                        ? `/${user.username}/settings`
                        : "/settings"
                    }
                    className="text-airlume ml-1 underline"
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
                  <label className="font-medium">Date (Bluesky):</label>
                  <Calendar
                    mode="single"
                    selected={scheduledDateBluesky}
                    onSelect={setScheduledDateBluesky}
                    fromDate={new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <label className="font-medium">Time (Bluesky):</label>
                  <Input
                    type="time"
                    value={scheduledTimeBluesky}
                    onChange={(e) => setScheduledTimeBluesky(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={scheduling}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="custom"
              onClick={handleScheduleMulti}
              disabled={
                scheduling ||
                (!scheduleTwitter && !scheduleBluesky) ||
                (scheduleTwitter &&
                  (!scheduledDateTwitter || !scheduledTimeTwitter)) ||
                (scheduleBluesky &&
                  (!scheduledDateBluesky || !scheduledTimeBluesky))
              }
            >
              {scheduling ? "Scheduling..." : "Add to Queue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal para editar schedule */}
      <Dialog open={!!editPlatform} onOpenChange={() => setEditPlatform(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editPlatform?.platform} Schedule</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <label className="font-medium">Date:</label>
            <Calendar
              mode="single"
              selected={editDate}
              onSelect={setEditDate}
              fromDate={new Date()}
              className="rounded-md border"
            />
            <label className="font-medium">Time:</label>
            <Input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-32"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={editLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="custom"
              onClick={handleEditSchedule}
              disabled={editLoading || !editDate || !editTime}
            >
              {editLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Mostrar error si failed */}
      {schedule && scheduleStatus === "failed" && errorMessage && (
        <div className="px-4 pb-2 text-xs text-red-500">{errorMessage}</div>
      )}
    </Card>
  )
}
