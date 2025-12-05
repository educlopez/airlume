import { Suspense } from "react"
import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"

import MediaLibraryClient from "./MediaLibraryClient"

export const metadata: Metadata = {
  title: "Media Library",
}

// Generate static params for build-time validation (required by Cache Components)
// This route is dynamic, but we provide a dummy entry for build validation
export function generateStaticParams() {
  return [{ username: "dummy" }]
}

// Extracted async component for data fetching (wrapped in Suspense)
async function MediaLibraryContent() {
  let userId: string | null = null
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch {
    // During build-time prerendering, auth may not be available
    return (
      <div className="space-y-6 p-6">
        <h1 className="mb-6 text-2xl font-bold">Media Library</h1>
        <div className="p-8">Not authenticated</div>
      </div>
    )
  }

  if (!userId)
    return (
      <div className="space-y-6 p-6">
        <h1 className="mb-6 text-2xl font-bold">Media Library</h1>
        <div className="p-8">Not authenticated</div>
      </div>
    )

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.storage
    .from("images")
    .list(userId + "/", { limit: 100 })
  if (error)
    return (
      <div className="space-y-6 p-6">
        <h1 className="mb-6 text-2xl font-bold">Media Library</h1>
        <div className="p-8">Error loading images</div>
      </div>
    )

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-6 text-2xl font-bold">Media Library</h1>
      <MediaLibraryClient userId={userId} files={data?.filter((f) => f.name)} />
    </div>
  )
}

// Loading fallback component
function MediaLibraryLoading() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-6 text-2xl font-bold">Media Library</h1>
      <div className="h-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

export default function MediaLibraryPage() {
  return (
    <Suspense fallback={<MediaLibraryLoading />}>
      <MediaLibraryContent />
    </Suspense>
  )
}
