import React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { format, isAfter, parseISO } from "date-fns"

import { createServerSupabaseClient } from "@/lib/supabaseClient"
import { DashboardGreeting } from "@/components/dashboard-greeting"
import { DashboardHeaderGradient } from "@/components/dashboard-header-gradient"
import { NotImageFound } from "@/components/icons/no-image-found"
import { NoScheduledPosts } from "@/components/icons/no-scheduled-posts"
import { SocialConnectionsCard } from "@/components/social-connections-card"
import BlueskyPromoImage from "@/components/ui/BlueskyPromoImage"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Dashboard",
}
// Types for scheduled post rows
// Local type for gallery files
type GalleryFile = {
  name: string
  updated_at?: string
}

interface Generation {
  id: string
  response?: string
}

interface ScheduledRow {
  id: string
  scheduled_at: string
  status: string
  generation: Generation | Generation[]
}

export default async function DashboardHomePage() {
  // Get Clerk user
  const user = await currentUser()
  if (!user) {
    return <div className="p-6">Please sign in to view your dashboard.</div>
  }
  const userId = user.id

  // Twitter connection (Clerk external accounts)
  const isTwitterConnected = !!user.externalAccounts?.some(
    (acc) =>
      acc.provider === "oauth_twitter" ||
      acc.provider === "twitter" ||
      acc.provider === "x" ||
      acc.provider?.includes("twitter") ||
      acc.provider?.includes("x")
  )

  // Supabase client
  const supabase = createServerSupabaseClient()

  // Draft count
  const { count: draftCount, error: draftError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "draft")

  // Bluesky connection: check user_bluesky_accounts table for user_id
  let isBlueskyConnected = false
  try {
    const { data: blueskyAccount } = await supabase
      .from("user_bluesky_accounts")
      .select("id")
      .eq("user_id", userId)
      .single()
    isBlueskyConnected = !!blueskyAccount
  } catch {
    isBlueskyConnected = false
  }

  // 1. Next scheduled post (generations_platforms with status 'queue' and scheduled_at in the future)
  const { data: scheduledRows } = await supabase
    .from("generations_platforms")
    .select("id, scheduled_at, status, generation:generations(id, response)")
    .eq("status", "queue")
    .order("scheduled_at", { ascending: true })
    .limit(10)
  const now = new Date()
  const nextScheduled = scheduledRows
    ? (scheduledRows as ScheduledRow[]).find(
        (row) => row.scheduled_at && isAfter(parseISO(row.scheduled_at), now)
      )
    : null

  // 2. Gallery: get 3 most recent images from storage
  const { data: galleryFiles } = await supabase.storage
    .from("images")
    .list(userId + "/", { limit: 10 })
  const galleryImages = (galleryFiles ?? [])
    .filter((f: GalleryFile) => f.name)
    .sort((a: GalleryFile, b: GalleryFile) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bTime - aTime
    })
    .slice(0, 3)
    .map(
      (f: GalleryFile) =>
        `https://kdwolwebviyzyjulmzgb.supabase.co/storage/v1/object/public/images/${userId}/${f.name}`
    )

  // 3. Recent activity (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [
    { count: publishedCount = 0 } = {},
    { count: draftCountRecent = 0 } = {},
    { count: imageCount = 0 } = {},
  ] = await Promise.all([
    supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "sent")
      .gte("created_at", weekAgo),
    supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "draft")
      .gte("created_at", weekAgo),
    // For images, count files in storage (approximate)
    Promise.resolve({
      count: (galleryFiles ?? []).filter(
        (f: GalleryFile) =>
          f.updated_at && isAfter(new Date(f.updated_at), new Date(weekAgo))
      ).length,
    }),
  ])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <DashboardHeaderGradient>
        <div>
          <DashboardGreeting />
          <p className="text-lg">
            Generate, program and manage your content with AI in one place.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Card className="shadow-custom bg-primary/80 flex flex-col items-start gap-2 border-none p-4">
            <span className="font-semibold">Drafts</span>
            <span className="font-mono text-4xl font-bold">
              {draftError ? "-" : draftCount}
            </span>
            <span className="text-muted-foreground text-xs">
              Unpublished posts
            </span>
          </Card>
        </div>
      </DashboardHeaderGradient>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Social Connections */}
        <SocialConnectionsCard
          isTwitterConnected={isTwitterConnected}
          isBlueskyConnected={isBlueskyConnected}
          username={user.username ?? ""}
        />

        {/* Next scheduled post card */}
        <Card className="bg-background shadow-custom flex flex-col justify-start border-none p-6">
          <span className="mb-2 block font-semibold">Next scheduled post</span>
          <div className="flex h-full flex-col items-start justify-between gap-2">
            {nextScheduled ? (
              <>
                <div className="flex flex-row items-center gap-4">
                  <div className="shadow-custom bg-primary flex max-w-fit flex-col items-center rounded-md p-4">
                    <span className="font-mono text-4xl font-bold">
                      {format(parseISO(nextScheduled.scheduled_at), "d")}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs uppercase">
                      {format(parseISO(nextScheduled.scheduled_at), "MMM")}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {format(parseISO(nextScheduled.scheduled_at), "HH:mm")}
                    </span>
                  </div>
                  <div className="line-clamp-4 text-sm">
                    {(() => {
                      const gen = Array.isArray(nextScheduled.generation)
                        ? nextScheduled.generation[0]
                        : nextScheduled.generation
                      return gen?.response
                        ? gen.response.split(" ").slice(0, 12).join(" ") +
                            (gen.response.split(" ").length > 12 ? "..." : "")
                        : ""
                    })()}
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/${user.username}/posts`}>See all posts</Link>
                </Button>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <NoScheduledPosts
                  primaryColor="var(--color-airlume)"
                  backgroundColor="var(--color-primary)"
                  className="ml-2"
                />
                <span className="text-muted-foreground text-sm">
                  There are no scheduled posts.
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Gallery card */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <span className="mb-2 block font-semibold">Media Library</span>
          <div className="flex h-full w-full items-center justify-center gap-2">
            {galleryImages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center">
                <NotImageFound
                  primaryColor="var(--color-airlume)"
                  backgroundColor="var(--color-primary)"
                  className="ml-2"
                />
                <span className="text-muted-foreground text-sm">No images</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((src, i) => (
                <div
                  key={i}
                  className="relative h-full w-full overflow-hidden rounded-md border"
                >
                  <Image
                    src={src}
                    alt="gallery"
                    className="h-full w-full object-cover"
                    width={64}
                    height={64}
                  />
                </div>
              ))}
            </div>
          </div>

          {galleryImages.length >= 1 && (
            <Button variant="outline" asChild>
              <Link href={`/${user.username}/media-library`}>
                See all images
              </Link>
            </Button>
          )}
        </Card>
      </div>

      {/* Promo Bluesky + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Bluesky promo */}
        <Card className="bg-background shadow-custom flex flex-row items-center justify-between overflow-hidden border-none p-6">
          <div className="flex-1 pr-4">
            <span className="mb-2 block font-semibold">
              Publish your photos in Bluesky!
            </span>
            <p className="text-muted-foreground text-sm">
              Connect your account and share images generated by AI directly in
              Bluesky.
            </p>
          </div>
          <div className="group relative flex-1">
            <div className="absolute -right-20 -bottom-40 transition-all duration-300 group-hover:-bottom-36">
              <BlueskyPromoImage
                src="https://github.com/educlopez.png"
                alt="Bluesky avatar user preview"
              />
            </div>
          </div>
        </Card>
        {/* Recent Activity */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <span className="mb-2 block font-semibold">Recent Activity</span>
          <ul className="ml-5 list-disc text-sm">
            <li>{publishedCount} posts published this week</li>
            <li>{draftCountRecent} drafts edited</li>
            <li>{imageCount} images uploaded</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
