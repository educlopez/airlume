import Image from "next/image"
import { currentUser } from "@clerk/nextjs/server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"

export default async function PostsPage() {
  const user = await currentUser()
  if (!user) return <div>Please sign in to view your posts.</div>

  const supabase = createServerSupabaseClient()
  const { data: generations, error } = await supabase
    .from("generations")
    .select("id, response, image_url")
    .eq("user_id", user.id)
    .order("id", { ascending: false })

  if (error) return <div>Error loading posts: {error.message}</div>
  if (!generations || generations.length === 0)
    return <div>No posts found.</div>

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Your Posts</h1>
      <div className="space-y-8">
        {generations.map((gen) => (
          <div
            key={gen.id}
            className="flex flex-col gap-4 rounded border bg-white p-4 shadow-sm"
          >
            {gen.image_url && (
              <Image
                src={gen.image_url}
                alt="Post image"
                width={400}
                height={220}
                className="max-h-56 rounded border object-contain"
              />
            )}
            <div className="whitespace-pre-wrap text-gray-800">
              {gen.response}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
