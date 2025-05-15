"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

import {
  deleteGeneration,
  duplicateGeneration,
  updateGeneration,
} from "../generator/actions"

type Generation = {
  id: string
  response: string
  image_url: string | null
  created_at: string
  status: "draft" | "queue" | "sent"
}

type User = {
  id: string
  username?: string | null
  fullName?: string | null
  firstName?: string | null
  imageUrl?: string | null
}

export function PostCard({
  generation,
  user,
  hasTwitter,
}: {
  generation: Generation
  user: User
  hasTwitter: boolean
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
  const [loadingBluesky, setLoadingBluesky] = useState(false)
  const [hasBluesky, setHasBluesky] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [publishTwitter, setPublishTwitter] = useState(false)
  const [publishBluesky, setPublishBluesky] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: handle image upload if imageFile is set
    await updateGeneration({
      id: generation.id,
      response,
      image_url: imageUrl,
    })
    setSaving(false)
    setOpen(false)
    // Optionally, refresh the page or mutate SWR/React Query
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

  useEffect(() => {
    if (blueskyDialogOpen) {
      setLoadingBluesky(true)
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
        .finally(() => setLoadingBluesky(false))
    }
  }, [blueskyDialogOpen])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Pencil className="size-3" />
            {generation.status.charAt(0).toUpperCase() +
              generation.status.slice(1)}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={async () => {
                await duplicateGeneration({
                  id: generation.id,
                  user_id: user.id,
                })
                window.location.reload()
              }}
            >
              <Copy className="mr-2 size-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                await deleteGeneration(generation.id)
                window.location.reload()
              }}
            >
              <Trash2 className="mr-2 size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4 md:flex-row">
        {imageUrl !== "" ? (
          <Image
            src={imageUrl || ""}
            alt="Post image"
            width={160}
            height={90}
            className="max-h-36 rounded border object-contain"
          />
        ) : null}
        <div className="flex-1 whitespace-pre-wrap text-gray-800">
          {response}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:justify-between">
        <div className="text-muted-foreground text-xs">
          Created {new Date(generation.created_at).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasTwitter}
            title={
              !hasTwitter
                ? "Connect your Twitter account to enable this action."
                : undefined
            }
          >
            Add to Queue
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setPublishModalOpen(true)
              setPublishTwitter(false)
              setPublishBluesky(false)
            }}
          >
            Publish
          </Button>
        </div>
      </CardFooter>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-4" /> Edit
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
                  <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
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
                {imageUrl !== "" ? (
                  <div className="relative">
                    <Image
                      src={imageUrl || ""}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="max-h-20 rounded border object-contain"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute -top-2 -right-2"
                      onClick={() => {
                        setImageUrl("")
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
                  {imageUrl !== "" ? "Change Image" : "Add Image"}
                </Button>
              </div>
            </div>
            <div className="hidden flex-1 border-l pl-6 md:block">
              <div className="mb-2 font-semibold">Threads Preview</div>
              <div className="rounded-lg border bg-white p-4">
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
                  <span className="text-muted-foreground ml-2 text-xs">
                    now
                  </span>
                </div>
                <div className="mb-2 whitespace-pre-wrap text-gray-800">
                  {response}
                </div>
                {imageUrl !== "" ? (
                  <Image
                    src={imageUrl || ""}
                    alt="Preview"
                    width={240}
                    height={180}
                    className="max-h-40 rounded border object-contain"
                  />
                ) : null}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              />
              <span>Bluesky</span>
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={publishing}>
                Cancel
              </Button>
            </DialogClose>
            <Button
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
                <div className="font-medium text-green-700">
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
                  <label className="mb-1 block flex items-center gap-1 font-medium">
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
    </Card>
  )
}
