import React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { format, isAfter, parseISO } from "date-fns"

import { createServerSupabaseClient } from "@/lib/supabaseClient"
import { DashboardGreeting } from "@/components/dashboard-greeting"
import { DashboardHeaderGradient } from "@/components/dashboard-header-gradient"
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

  // 4. Placeholder image for Bluesky promo
  const blueskyImage = galleryImages[0] || "/placeholder-bluesky.jpg"

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
          <Card className="shadow-custom bg-primary/80 flex flex-col items-start border-none p-4">
            <span className="font-semibold">Drafts</span>
            <span className="text-2xl font-bold">
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
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <div>
            <span className="mb-2 block font-semibold">Social Connections</span>
            {!isTwitterConnected && (
              <div className="mb-2 flex items-center gap-2 text-sm text-red-500">
                <span>⚠️</span> Twitter not connected
              </div>
            )}
            {!isBlueskyConnected && (
              <div className="mb-2 flex items-center gap-2 text-sm text-red-500">
                <span>⚠️</span> Bluesky not connected
              </div>
            )}
            {isTwitterConnected && isBlueskyConnected && (
              <div className="text-sm text-green-600">
                All social accounts connected!
              </div>
            )}
          </div>
          <Button className="mt-4 w-fit" variant="outline">
            Manage Connections
          </Button>
        </Card>

        {/* Next scheduled post card */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          {nextScheduled ? (
            <>
              <div className="mb-2">
                <span className="bg-muted text-muted-foreground mb-2 inline-block rounded px-2 py-0.5 text-xs font-semibold">
                  READY
                </span>
                <div className="truncate text-lg font-semibold">
                  {(() => {
                    const gen = Array.isArray(nextScheduled.generation)
                      ? nextScheduled.generation[0]
                      : nextScheduled.generation
                    return gen?.response
                      ? gen.response.split(" ").slice(0, 6).join(" ") +
                          (gen.response.split(" ").length > 6 ? "..." : "")
                      : ""
                  })()}
                </div>
                <div className="text-muted-foreground text-sm">scheduled</div>
                <hr className="border-muted my-2" />
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold">
                    {format(parseISO(nextScheduled.scheduled_at), "d")}
                  </span>
                  <span className="text-muted-foreground text-xs uppercase">
                    {format(parseISO(nextScheduled.scheduled_at), "MMM")}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {format(parseISO(nextScheduled.scheduled_at), "HH:mm")}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-muted-foreground">
                No hay posts programados
              </span>
            </div>
          )}
        </Card>

        {/* Gallery card */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <div>
            <span className="mb-2 block font-semibold">Galería</span>
            <div className="mb-2 flex gap-2">
              {galleryImages.length === 0 && (
                <span className="text-muted-foreground text-xs">No images</span>
              )}
              {galleryImages.map((src, i) => (
                <div
                  key={i}
                  className="relative h-16 w-16 overflow-hidden rounded border"
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
          <Link
            href={`/${user.username}/media-library`}
            className="text-primary mt-2 text-xs underline"
          >
            Gestionar galería
          </Link>
        </Card>
      </div>

      {/* Promo Bluesky + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Bluesky promo */}
        <Card className="bg-background shadow-custom flex flex-row items-center justify-between border-none p-6">
          <div className="flex-1 pr-4">
            <span className="mb-2 block font-semibold">
              Publish your photos in Bluesky!¡Publica tus fotos en Bluesky!
            </span>
            <p className="text-muted-foreground text-sm">
              Connect your account and share images generated by AI directly in
              Bluesky.
            </p>
          </div>
          <div className="flex-shrink-0">
            <BlueskyPromoImage src={blueskyImage} alt="Bluesky post preview" />
          </div>
        </Card>
        {/* Recent Activity */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <span className="mb-2 block font-semibold">Recent Activity</span>
          <ul className="ml-5 list-disc text-sm">
            <li>{publishedCount} posts publicados esta semana</li>
            <li>{draftCountRecent} borradores editados</li>
            <li>{imageCount} imágenes subidas</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
