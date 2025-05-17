import { currentUser } from "@clerk/nextjs/server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"
import { DashboardGreeting } from "@/components/DashboardGreeting"
import { DashboardHeaderGradient } from "@/components/DashboardHeaderGradient"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// import { useUser } from '@clerk/nextjs'; // Uncomment if using Clerk hooks
// import { getDraftCount, getScheduledPosts, getSocialConnections } from '@/lib/supabase/dashboard'; // Example data fetchers

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

  // Scheduled posts (status = 'queue')
  const { count: scheduledPosts, error: queueError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "queue")

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <DashboardHeaderGradient>
        <div>
          <DashboardGreeting />
          <p className="text-lg">
            Generate, schedule, and manage your AI-powered content in one place.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Card className="shadow-custom flex flex-col items-start bg-white/80 p-4">
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

        {/* Scheduled Posts */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <div>
            <span className="mb-2 block font-semibold">Scheduled Posts</span>
            <span className="text-2xl font-bold">
              {queueError ? "-" : scheduledPosts}
            </span>
            <span className="text-muted-foreground text-xs">
              Posts scheduled for future publishing
            </span>
          </div>
          <Button className="mt-4 w-fit" variant="secondary" disabled>
            Scheduling coming soon
          </Button>
        </Card>

        {/* Tips/Help */}
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <div>
            <span className="mb-2 block font-semibold">💡 AI Content Tip</span>
            <p className="mb-2 text-sm">
              Use smart presets to speed up your content creation and keep your
              brand voice consistent.
            </p>
          </div>
          <Button variant="custom" className="mt-4 w-fit">
            Read Docs
          </Button>
        </Card>
      </div>

      {/* Testimonial/Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <blockquote className="text-muted-foreground mb-4 italic">
            &quot;Airlume helped me generate 10 high-quality posts in a single
            afternoon. The scheduling and AI presets are a game changer!&quot;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-300" />
            <div>
              <div className="font-semibold">Jane Doe</div>
              <div className="text-muted-foreground text-xs">
                Content Creator
              </div>
            </div>
          </div>
        </Card>
        <Card className="bg-background shadow-custom flex flex-col justify-between border-none p-6">
          <span className="mb-2 block font-semibold">Recent Activity</span>
          <ul className="ml-5 list-disc text-sm">
            <li>Published 2 posts this week</li>
            <li>3 drafts updated</li>
            <li>Connected Twitter account</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
