"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [apiKey, setApiKey] = useState("")
  const [hasKey, setHasKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    async function fetchKeyStatus() {
      setLoading(true)
      try {
        const res = await fetch("/api/user-openai-key")
        const data = await res.json()
        setHasKey(Boolean(data.hasKey))
      } catch {
        setHasKey(false)
      } finally {
        setLoading(false)
      }
    }
    fetchKeyStatus()
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

  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Please sign in.</div>

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      {/* Profile Info */}
      <Card className="flex items-center gap-4 p-6">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={user.imageUrl}
            alt={user.fullName || user.username || "User"}
          />
          <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-lg font-semibold">
            {user.fullName || user.username}
          </div>
          <div className="text-gray-500">
            {user.primaryEmailAddress?.emailAddress}
          </div>
        </div>
        {/* TODO: Add update profile info form/button if needed */}
      </Card>
      {/* OpenAI API Key Section */}
      <Card className="space-y-4 p-6">
        <div className="text-lg font-semibold">OpenAI API Key</div>
        {hasKey ? (
          <div className="space-y-2">
            <div className="text-green-700">
              Your own OpenAI API key is set. You can use all models in the
              generator.
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
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleSave} disabled={loading || !apiKey}>
              Save API Key
            </Button>
            <div className="text-sm text-gray-500">
              Add your own OpenAI API key to unlock all models. Without it, only
              GPT-4o-nano is available.
            </div>
          </div>
        )}
        {status && <div className="text-sm text-blue-600">{status}</div>}
      </Card>
    </div>
  )
}
