import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { NoPosts } from "@/components/icons/no-posts";
import { NoScheduledPosts } from "@/components/icons/no-scheduled-posts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createServerSupabaseClient } from "@/lib/supabase-client";

import { type Generation, PostCard, type Schedule } from "./post-card";

export const metadata: Metadata = {
  title: "Posts",
};

// Generate static params for build-time validation (required by Cache Components)
// This route is dynamic, but we provide a dummy entry for build validation
export function generateStaticParams() {
  return [{ username: "dummy" }];
}

// Define the type for the raw Supabase response
interface ScheduleRaw {
  error_message?: string | null;
  generation:
    | {
        id: string;
        response: string;
        image_url: string | null;
        created_at: string;
      }
    | {
        id: string;
        response: string;
        image_url: string | null;
        created_at: string;
      }[];
  id: string;
  platform: "twitter" | "bluesky" | "linkedin";
  published_post_id?: string | null;
  scheduled_at: string;
  status: "queue" | "sent" | "failed";
}

// Extracted async component for data fetching (wrapped in Suspense)
async function PostsContent() {
  const user = await currentUser();
  if (!user) {
    return <div>Please sign in to view your posts.</div>;
  }

  const hasTwitter = user.externalAccounts?.some(
    (acc) =>
      acc.provider === "oauth_twitter" ||
      acc.provider === "twitter" ||
      acc.provider === "x" ||
      acc.provider?.includes("twitter") ||
      acc.provider?.includes("x")
  );

  const safeUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    firstName: user.firstName,
    imageUrl: user.imageUrl,
  };

  const supabase = createServerSupabaseClient();

  // 1. Drafts: generations sin schedules activos
  const { data: drafts, error: draftsError } = await supabase
    .from("generations")
    .select(
      "id, response, image_url, created_at, status, scheduled_at, generations_platforms(status)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Schedules: generations_platforms join generations
  const { data: schedulesRaw, error: schedulesError } = await supabase
    .from("generations_platforms")
    .select(
      "id, platform, status, scheduled_at, error_message, published_post_id, generation:generations(id, response, image_url, created_at)"
    )
    .eq("generation.user_id", user.id)
    .order("scheduled_at", { ascending: false });

  if (draftsError || schedulesError) {
    return <div>Error loading posts.</div>;
  }

  // Normalize schedules: ensure generation is a Generation with status
  const schedules: Schedule[] = (schedulesRaw || []).map((s: ScheduleRaw) => {
    let generation: Generation;
    // For scheduled posts, we want the Generation to reflect the schedule's status for UI purposes
    if (Array.isArray(s.generation)) {
      generation = {
        ...s.generation[0],
        status: s.status as Generation["status"],
      };
    } else {
      generation = {
        ...s.generation,
        status: s.status as Generation["status"],
      };
    }
    return { ...s, generation };
  });

  // Drafts: solo los que no tienen schedules activos (queue, sent, failed) Y status === 'draft'
  const draftPosts: Generation[] = (drafts || [])
    .filter(
      (g: Generation & { generations_platforms?: { status: string }[] }) =>
        g.status === "draft" &&
        (!g.generations_platforms ||
          g.generations_platforms.length === 0 ||
          g.generations_platforms.every(
            (p) => !["queue", "sent", "failed"].includes(p.status)
          ))
    )
    .map((g) => ({ ...g, status: "draft" as const }));

  // Schedules por status y plataforma
  const queueTwitter = schedules.filter(
    (s) => s.status === "queue" && s.platform === "twitter"
  );
  const queueBluesky = schedules.filter(
    (s) => s.status === "queue" && s.platform === "bluesky"
  );
  const queueLinkedIn = schedules.filter(
    (s) => s.status === "queue" && s.platform === "linkedin"
  );
  const sentTwitter = schedules.filter(
    (s) => s.status === "sent" && s.platform === "twitter"
  );
  const sentBluesky = schedules.filter(
    (s) => s.status === "sent" && s.platform === "bluesky"
  );
  const sentLinkedIn = schedules.filter(
    (s) => s.status === "sent" && s.platform === "linkedin"
  );
  const failedTwitter = schedules.filter(
    (s) => s.status === "failed" && s.platform === "twitter"
  );
  const failedBluesky = schedules.filter(
    (s) => s.status === "failed" && s.platform === "bluesky"
  );
  const failedLinkedIn = schedules.filter(
    (s) => s.status === "failed" && s.platform === "linkedin"
  );

  // Direct-published sent posts (not in generations_platforms)
  const directSentPosts = (drafts || []).filter(
    (
      g: Generation & {
        status: string;
        generations_platforms?: { status: string }[];
      }
    ) =>
      g.status === "sent" &&
      (!g.generations_platforms || g.generations_platforms.length === 0)
  );

  // Optionally, if you want to support Bluesky direct-publish, filter by platform if you store that info
  // For now, show all direct-published as Twitter (or adjust as needed)

  // getGenerationFromSchedule and getScheduleWithGeneration are now identity
  function getGenerationFromSchedule(s: Schedule): Generation {
    return s.generation;
  }

  function getScheduleWithGeneration(s: Schedule): Schedule {
    return s;
  }

  const statusTabs = [
    { value: "draft", label: "Drafts" },
    { value: "queue", label: "Queue" },
    { value: "sent", label: "Sent" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-6 font-bold text-2xl">Your Posts</h1>
      {!hasTwitter && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800">
          Connect your Twitter account in <b>Account</b> settings to publish
          posts directly to X.com.
        </div>
      )}

      <Tabs className="w-full" defaultValue="draft">
        <TabsList className="mb-6">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="draft">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {draftPosts.length === 0 && (
              <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                <NoPosts
                  backgroundColor="var(--color-primary)"
                  className="ml-2"
                  primaryColor="var(--color-airlume)"
                />
                <span className="text-muted-foreground text-sm">
                  No draft founds.
                </span>
              </Card>
            )}
            {draftPosts.map((gen) => (
              <PostCard
                generation={gen}
                hasTwitter={hasTwitter}
                key={gen.id}
                user={safeUser}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="queue">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">Twitter</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 text-xs">
                  {queueTwitter.length}
                </span>
              </div>
              {queueTwitter.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoScheduledPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No scheduled posts.
                  </span>
                </Card>
              )}
              {queueTwitter.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">Bluesky</span>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-800 text-xs">
                  {queueBluesky.length}
                </span>
              </div>
              {queueBluesky.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoScheduledPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No scheduled posts.
                  </span>
                </Card>
              )}
              {queueBluesky.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">LinkedIn</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-800 text-xs">
                  {queueLinkedIn.length}
                </span>
              </div>
              {queueLinkedIn.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoScheduledPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No scheduled posts.
                  </span>
                </Card>
              )}
              {queueLinkedIn.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sent">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">Twitter</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 text-xs">
                  {sentTwitter.length + directSentPosts.length}
                </span>
              </div>
              {sentTwitter.length + directSentPosts.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No sent posts.
                  </span>
                </Card>
              )}
              {/* Scheduled sent posts */}
              {sentTwitter.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
              {/* Direct-published sent posts */}
              {directSentPosts.map((gen) => (
                <PostCard
                  generation={gen}
                  hasTwitter={hasTwitter}
                  key={gen.id}
                  user={safeUser}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">Bluesky</span>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-800 text-xs">
                  {sentBluesky.length}
                </span>
              </div>
              {sentBluesky.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No sent posts.
                  </span>
                </Card>
              )}
              {sentBluesky.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">LinkedIn</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-800 text-xs">
                  {sentLinkedIn.length}
                </span>
              </div>
              {sentLinkedIn.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No sent posts.
                  </span>
                </Card>
              )}
              {sentLinkedIn.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="failed">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">Twitter</span>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 text-xs">
                  {failedTwitter.length}
                </span>
              </div>
              {failedTwitter.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No failed posts.
                  </span>
                </Card>
              )}
              {failedTwitter.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">Bluesky</span>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-sky-800 text-xs">
                  {failedBluesky.length}
                </span>
              </div>
              {failedBluesky.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No failed posts.
                  </span>
                </Card>
              )}
              {failedBluesky.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <span className="text-airlume">LinkedIn</span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-800 text-xs">
                  {failedLinkedIn.length}
                </span>
              </div>
              {failedLinkedIn.length === 0 && (
                <Card className="flex flex-col items-center justify-start border-none bg-background shadow-custom">
                  <NoPosts
                    backgroundColor="var(--color-primary)"
                    className="ml-2"
                    primaryColor="var(--color-airlume)"
                  />
                  <span className="text-muted-foreground text-sm">
                    No failed posts.
                  </span>
                </Card>
              )}
              {failedLinkedIn.map((s) => (
                <PostCard
                  generation={getGenerationFromSchedule(s)}
                  hasTwitter={hasTwitter}
                  key={s.id}
                  schedule={getScheduleWithGeneration(s)}
                  user={safeUser}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading fallback component
function PostsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-64 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsLoading />}>
      <PostsContent />
    </Suspense>
  );
}
