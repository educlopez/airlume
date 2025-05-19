import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"

import MediaLibraryClient from "./MediaLibraryClient"

export const metadata: Metadata = {
  title: "Media Library",
}

export default async function MediaLibraryPage() {
  const { userId } = await auth()
  if (!userId) return <div className="p-8">Not authenticated</div>

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.storage
    .from("images")
    .list(userId + "/", { limit: 100 })
  if (error) return <div className="p-8">Error loading images</div>

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-6 text-2xl font-bold">Media Library</h1>
      <MediaLibraryClient userId={userId} files={data?.filter((f) => f.name)} />
    </div>
  )
}
