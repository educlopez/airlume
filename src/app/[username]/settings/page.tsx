"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type ClerkAPIError = { errors: { message: string }[] }

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [apiKey, setApiKey] = useState("")
  const [hasKey, setHasKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  // Profile editing state
  const [name, setName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  )
  const [profileStatus, setProfileStatus] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)

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

  useEffect(() => {
    if (user) {
      setName(user.fullName || "")
      setEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [user])

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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileStatus("")
    try {
      if (user) {
        // Store the full name in firstName and clear lastName to avoid Clerk double-name bug
        await user.update({ firstName: name, lastName: "" })

        // Update email if changed
        if (email && email !== user.primaryEmailAddress?.emailAddress) {
          // Try both possible keys for Clerk SDK compatibility
          let newEmail
          try {
            // @ts-expect-error Clerk types may be out of sync, but this is the correct usage in some SDKs
            newEmail = await user.createEmailAddress({ emailAddress: email })
          } catch {
            // @ts-expect-error Clerk types may be out of sync, but this is the correct usage in some SDKs
            newEmail = await user.createEmailAddress({ email_address: email })
          }
          await user.update({ primaryEmailAddressId: newEmail.id })
          // Optionally, remove the old email
          for (const addr of user.emailAddresses) {
            if (addr.id !== newEmail.id) {
              await addr.destroy()
            }
          }
          // Optionally, trigger verification
          // await newEmail.prepareVerification({ strategy: "email_code" })
        }
        setProfileStatus("Profile updated!")
      }
    } catch (err: unknown) {
      let message = "Failed to update profile"
      if (
        typeof err === "object" &&
        err !== null &&
        "errors" in err &&
        Array.isArray((err as ClerkAPIError).errors)
      ) {
        message = (err as ClerkAPIError).errors?.[0]?.message || message
      } else if (err instanceof Error) {
        message = err.message
      }
      setProfileStatus(message)
    } finally {
      setProfileLoading(false)
    }
  }

  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Please sign in.</div>

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      {/* Profile Info */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-4">
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
        </div>
        <form
          onSubmit={handleProfileSave}
          className="mt-4 flex max-w-sm flex-col gap-2"
        >
          <label className="font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={profileLoading}
            required
          />
          <label className="font-medium">Email</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={profileLoading}
            required
            type="email"
          />
          <Button
            type="submit"
            disabled={profileLoading || !name || !email}
            className="mt-2"
          >
            {profileLoading ? "Saving..." : "Save Profile"}
          </Button>
          {profileStatus && (
            <div className="mt-1 text-sm text-blue-600">{profileStatus}</div>
          )}
        </form>
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
