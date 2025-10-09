"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function TwitterOAuthConnectionCard() {
  const [connected, setConnected] = useState(false)
  const [screenName, setScreenName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/twitter/oauth/status")
      const data = await res.json()
      setConnected(data.connected || false)
      setScreenName(data.screen_name || null)
    } catch (error) {
      console.error("Failed to check Twitter connection:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  async function handleConnect() {
    try {
      setConnecting(true)
      const res = await fetch("/api/twitter/oauth/initiate")
      const data = await res.json()

      if (data.url) {
        // Open OAuth flow in new window
        window.location.href = data.url
      } else {
        toast.error("Failed to initiate Twitter connection")
      }
    } catch (error) {
      console.error("Failed to connect Twitter:", error)
      toast.error("Failed to connect Twitter")
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    try {
      setDisconnecting(true)
      const res = await fetch("/api/twitter/oauth/disconnect", {
        method: "DELETE",
      })

      if (res.ok) {
        setConnected(false)
        setScreenName(null)
        toast.success("Twitter disconnected successfully")
      } else {
        toast.error("Failed to disconnect Twitter")
      }
    } catch (error) {
      console.error("Failed to disconnect Twitter:", error)
      toast.error("Failed to disconnect Twitter")
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <Card className="flex w-full flex-col items-start gap-6 border-none p-4 shadow-none">
        <div className="font-semibold">Twitter/X Connection (OAuth 1.0a)</div>
        <div className="text-foreground/70 text-sm">Loading...</div>
      </Card>
    )
  }

  return (
    <Card className="flex w-full flex-col items-start gap-6 border-none p-4 shadow-none">
      <div className="font-semibold">Twitter/X Connection for Images</div>
      <div className="text-foreground/70 text-xs">
        To post images to Twitter/X, you need to connect your Twitter account
        using OAuth 1.0a. This is separate from your Clerk social connection.
      </div>

      {connected ? (
        <div className="flex w-full flex-col gap-2">
          <div className="text-airlume flex items-center gap-2 text-sm">
            <Check className="h-4 w-4" />
            Connected as <span className="font-semibold">@{screenName}</span>
          </div>
          <div className="text-foreground/70 text-xs">
            You can now post images to Twitter/X!
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          <div className="text-foreground/70 text-xs">
            Not connected. Click below to authorize with Twitter.
          </div>
          <Button
            variant="custom"
            size="sm"
            onClick={handleConnect}
            disabled={connecting}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {connecting ? "Connecting..." : "Connect Twitter for Images"}
          </Button>
          <div className="text-foreground/70 mt-2 text-xs">
            <strong>Note:</strong> This will redirect you to Twitter to
            authorize the app. You&apos;ll be redirected back after
            authorization.
          </div>
        </div>
      )}
    </Card>
  )
}
