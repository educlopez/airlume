"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserProfileDialog } from "@/components/user-profile-dialog"

interface SocialConnectionsCardProps {
  isTwitterConnected: boolean
  isBlueskyConnected: boolean
  username: string
}

export function SocialConnectionsCard({
  isTwitterConnected,
  isBlueskyConnected,
  username,
}: SocialConnectionsCardProps) {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)

  return (
    <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
      <div>
        <span className="mb-2 block font-semibold">Social Connections</span>
        {!isTwitterConnected && (
          <div className="mb-2 flex flex-col gap-1 text-sm text-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Twitter not connected
            </div>
            <span className="text-muted-foreground text-xs">
              To connect Twitter, add the account from the Clerk account modal.{" "}
              <Button
                variant="link"
                className="text-foreground h-auto p-0 align-baseline text-xs"
                onClick={() => setAccountDialogOpen(true)}
              >
                Open Clerk account modal
              </Button>
            </span>
          </div>
        )}
        {!isBlueskyConnected && (
          <div className="mb-2 flex flex-col gap-1 text-sm text-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Bluesky not connected
            </div>
            <span className="text-muted-foreground text-xs">
              To connect Bluesky, go to the Settings page and use the Connect
              Bluesky option.
            </span>
          </div>
        )}
        {isTwitterConnected && isBlueskyConnected && (
          <div className="text-airlume flex flex-row items-center gap-2 text-sm">
            <Check className="h-4 w-4" /> All social accounts connected!
          </div>
        )}
      </div>
      <Button className="w-fit" variant="outline" asChild>
        <Link href={`/${username}/settings`}>Manage Connections</Link>
      </Button>
      <UserProfileDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
      />
    </Card>
  )
}
