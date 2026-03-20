"use client";

import { AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserProfileDialog } from "@/components/user-profile-dialog";

interface SocialConnectionsCardProps {
  isBlueskyConnected: boolean;
  isLinkedInConnected: boolean;
  isTwitterConnected: boolean;
  username: string;
}

export function SocialConnectionsCard({
  isTwitterConnected,
  isBlueskyConnected,
  isLinkedInConnected,
  username,
}: SocialConnectionsCardProps) {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  return (
    <Card className="flex flex-col justify-between border-none bg-background p-6 shadow-custom">
      <div>
        <span className="mb-2 block font-semibold">Social Connections</span>
        {!isTwitterConnected && (
          <div className="mb-2 flex flex-col gap-1 text-red-500 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Twitter not connected
            </div>
            <span className="text-muted-foreground text-xs">
              To connect Twitter, add the account from the Clerk account modal.{" "}
              <Button
                className="h-auto p-0 align-baseline text-foreground text-xs"
                onClick={() => setAccountDialogOpen(true)}
                variant="link"
              >
                Open Clerk account modal
              </Button>
            </span>
          </div>
        )}
        {!isBlueskyConnected && (
          <div className="mb-2 flex flex-col gap-1 text-red-500 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Bluesky not connected
            </div>
            <span className="text-muted-foreground text-xs">
              To connect Bluesky, go to the Settings page and use the Connect
              Bluesky option.
            </span>
          </div>
        )}
        {!isLinkedInConnected && (
          <div className="mb-2 flex flex-col gap-1 text-red-500 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> LinkedIn not connected
            </div>
            <span className="text-muted-foreground text-xs">
              To connect LinkedIn, add the account from the Clerk account modal.{" "}
              <Button
                className="h-auto p-0 align-baseline text-foreground text-xs"
                onClick={() => setAccountDialogOpen(true)}
                variant="link"
              >
                Open Clerk account modal
              </Button>
            </span>
          </div>
        )}
        {isTwitterConnected && isBlueskyConnected && isLinkedInConnected && (
          <div className="flex flex-row items-center gap-2 text-airlume text-sm">
            <Check className="h-4 w-4" /> All social accounts connected!
          </div>
        )}
      </div>
      <Button asChild className="w-fit" variant="outline">
        <Link href={`/${username}/settings`}>Manage Connections</Link>
      </Button>
      <UserProfileDialog
        onOpenChange={setAccountDialogOpen}
        open={accountDialogOpen}
      />
    </Card>
  );
}
