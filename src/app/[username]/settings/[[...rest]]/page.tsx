"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Eye, EyeOff, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserProfileDialog } from "@/components/user-profile-dialog"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [apiKey, setApiKey] = useState("")
  const [hasKey, setHasKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [blueskyHandle, setBlueskyHandle] = useState("")
  const [blueskyPassword, setBlueskyPassword] = useState("")
  const [blueskyStatus, setBlueskyStatus] = useState("")
  const [hasBluesky, setHasBluesky] = useState(false)
  const [showBlueskyPassword, setShowBlueskyPassword] = useState(false)
  const [loadingBluesky, setLoadingBluesky] = useState(false)
  const [last4, setLast4] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKeyStatus() {
      setLoading(true)
      try {
        const res = await fetch("/api/user-openai-key")
        const data = await res.json()
        setHasKey(Boolean(data.hasKey))
        setLast4(data.last4 || null)
      } catch {
        setHasKey(false)
        setLast4(null)
      } finally {
        setLoading(false)
      }
    }
    fetchKeyStatus()
  }, [])

  useEffect(() => {
    async function fetchBluesky() {
      setLoadingBluesky(true)
      try {
        const res = await fetch("/api/bluesky")
        const data = await res.json()
        if (data && data.handle) {
          setHasBluesky(true)
          setBlueskyHandle(data.handle)
        } else {
          setHasBluesky(false)
          setBlueskyHandle("")
        }
      } catch {
        setHasBluesky(false)
        setBlueskyHandle("")
      } finally {
        setLoadingBluesky(false)
      }
    }
    fetchBluesky()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setStatus("")
    try {
      const res = await fetch("/api/user-openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openai_key: apiKey }),
      })
      if (!res.ok) throw new Error("Failed to save key")
      setStatus("Saved!")
      setHasKey(true)
      setApiKey("")
    } catch {
      setStatus("Failed to save key")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setStatus("")
    try {
      const res = await fetch("/api/user-openai-key", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete key")
      setStatus("Deleted!")
      setHasKey(false)
      setApiKey("")
    } catch {
      setStatus("Failed to delete key")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBluesky = async () => {
    setLoadingBluesky(true)
    setBlueskyStatus("")
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
      setBlueskyStatus("Saved!")
      setHasBluesky(true)
      setBlueskyPassword("")
    } catch {
      setBlueskyStatus("Failed to save credentials")
    } finally {
      setLoadingBluesky(false)
    }
  }

  const handleDeleteBluesky = async () => {
    setLoadingBluesky(true)
    setBlueskyStatus("")
    try {
      const res = await fetch("/api/bluesky", { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete credentials")
      setBlueskyStatus("Deleted!")
      setHasBluesky(false)
      setBlueskyHandle("")
      setBlueskyPassword("")
    } catch {
      setBlueskyStatus("Failed to delete credentials")
    } finally {
      setLoadingBluesky(false)
    }
  }

  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Please sign in.</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Account Info Section */}
        <Card className="shadow-custom space-y-4 border-none p-6">
          <div className="text-lg font-semibold">
            Account Info & Social Connections
          </div>
          <div className="text-foreground/70 text-sm">
            To change your account info (profile, email, password, or social
            connections), use the Account dialog below. This is managed securely
            by Clerk.
          </div>
          <Button onClick={() => setAccountDialogOpen(true)} variant="outline">
            Open Account Dialog
          </Button>
          <UserProfileDialog
            open={accountDialogOpen}
            onOpenChange={setAccountDialogOpen}
          />
        </Card>
        {/* OpenAI API Key Section */}
        <Card className="shadow-custom space-y-4 border-none p-6">
          <div className="text-lg font-semibold">OpenAI API Key</div>
          {hasKey ? (
            <div className="flex flex-col gap-4 space-y-2">
              <div className="text-airlume">
                Your own OpenAI API key is set. You can use all models in the
                generator.
                {last4 && (
                  <span className="text-foreground/70 ml-2">
                    (ends in <b>{last4}</b>)
                  </span>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Remove API Key
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 space-y-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
              />
              <Button
                variant="custom"
                onClick={handleSave}
                disabled={loading || !apiKey}
              >
                Save API Key
              </Button>
              <div className="text-foreground/70 text-sm">
                Add your own OpenAI API key to unlock all models. Without it,
                only GPT-4o-nano is available.
              </div>
            </div>
          )}
          {status && <div className="text-airlume text-sm">{status}</div>}
        </Card>
        {/* Bluesky Credentials Section */}
        <Card className="shadow-custom space-y-4 border-none p-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            Bluesky Credentials
          </div>
          {hasBluesky ? (
            <div className="flex flex-col gap-4 space-y-2">
              <div className="text-airlume">
                Connected to Bluesky as <b>@{blueskyHandle}</b>
              </div>
              <div className="text-foreground/70 text-sm">
                Your credentials are securely stored. You can update or remove
                them below.
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteBluesky}
                disabled={loadingBluesky}
              >
                Remove Bluesky Credentials
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
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
                  <Input
                    type="text"
                    className="pl-8"
                    placeholder="handle"
                    value={blueskyHandle}
                    onChange={(e) => setBlueskyHandle(e.target.value)}
                    autoComplete="username"
                    disabled={loadingBluesky}
                  />
                </div>
                <div className="text-foreground/70 mt-1 text-xs">
                  For example: yourname.bsky.social
                </div>
              </div>
              <div>
                <label className="mb-1 block font-medium">
                  Bluesky App Password
                </label>
                <div className="text-foreground/70 mb-2 text-xs">
                  Use an app password to connect safely. This is <b>not</b> your
                  account password.{" "}
                  <a
                    href="https://bsky.app/settings/app-passwords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-airlume underline"
                  >
                    Generate app password in Bluesky
                  </a>
                </div>
                <div className="relative">
                  <Input
                    type={showBlueskyPassword ? "text" : "password"}
                    className="pr-10"
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    value={blueskyPassword}
                    onChange={(e) => setBlueskyPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loadingBluesky}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowBlueskyPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showBlueskyPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleSaveBluesky}
                disabled={loadingBluesky || !blueskyHandle || !blueskyPassword}
              >
                {loadingBluesky ? "Saving..." : "Save Credentials"}
              </Button>
            </div>
          )}
          {blueskyStatus && (
            <div className="text-airlume text-sm">{blueskyStatus}</div>
          )}
        </Card>
      </div>
    </div>
  )
}
