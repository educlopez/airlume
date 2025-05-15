"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Copy, EllipsisVertical, Pencil, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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

  const handlePublish = async () => {
    setSaving(true)
    // Remove all image logic, only send text and id
    const res = await fetch("/api/twitter/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postContent: response, id: generation.id }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success("Published to Twitter!")
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to publish.")
    }
  }

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
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasTwitter || saving}
                title={
                  !hasTwitter
                    ? "Connect your Twitter account to enable this action."
                    : undefined
                }
                onClick={handlePublish}
              >
                {saving ? (
                  "Publishing..."
                ) : (
                  <>
                    <Send className="mr-2 size-4" /> Publish Now
                  </>
                )}
              </Button>
            </DropdownMenuItem>
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
        </div>
      </CardFooter>
    </Card>
  )
}
