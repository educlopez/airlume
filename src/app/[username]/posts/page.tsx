import { currentUser } from "@clerk/nextjs/server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { PostCard } from "./PostCard"

export default async function PostsPage() {
  const user = await currentUser()
  if (!user) return <div>Please sign in to view your posts.</div>

  const hasTwitter = user.externalAccounts?.some(
    (acc) =>
      acc.provider === "oauth_twitter" ||
      acc.provider === "twitter" ||
      acc.provider === "x" ||
      acc.provider?.includes("twitter") ||
      acc.provider?.includes("x")
  )

  const safeUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    firstName: user.firstName,
    imageUrl: user.imageUrl,
  }

  const supabase = createServerSupabaseClient()
  const { data: generations, error } = await supabase
    .from("generations")
    .select("id, response, image_url, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return <div>Error loading posts: {error.message}</div>
  if (!generations || generations.length === 0)
    return <div>No posts found.</div>

  const statusTabs = [
    { value: "draft", label: "Drafts" },
    { value: "queue", label: "Queue" },
    { value: "sent", label: "Sent" },
  ]

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-6 text-2xl font-bold">Your Posts</h1>
      {!hasTwitter && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
          Connect your Twitter account in <b>Account</b> settings to publish
          posts directly to X.com.
        </div>
      )}
      <Tabs defaultValue="draft" className="w-full">
        <TabsList className="mb-6">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {generations.filter((g) => g.status === tab.value).length ===
                0 && (
                <div className="text-muted-foreground">No posts found.</div>
              )}
              {generations
                .filter((g) => g.status === tab.value)
                .map((gen) => (
                  <PostCard
                    key={gen.id}
                    generation={gen}
                    user={safeUser}
                    hasTwitter={hasTwitter}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
