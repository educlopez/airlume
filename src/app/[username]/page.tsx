import { currentUser } from "@clerk/nextjs/server";
import { format, isAfter, parseISO } from "date-fns";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardHeaderGradient } from "@/components/dashboard-header-gradient";
import { NotImageFound } from "@/components/icons/no-image-found";
import { NoScheduledPosts } from "@/components/icons/no-scheduled-posts";
import { SocialConnectionsCard } from "@/components/social-connections-card";
import BlueskyPromoImage from "@/components/ui/bluesky-promo-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Generate static params for build-time validation (required by Cache Components)
// This route is dynamic, but we provide a dummy entry for build validation
export function generateStaticParams() {
  return [{ username: "dummy" }];
}

// Types for scheduled post rows
// Local type for gallery files
interface GalleryFile {
  name: string;
  updated_at?: string | null;
}

interface Generation {
  id: string;
  response?: string;
}

interface ScheduledRow {
  generation: Generation | Generation[];
  id: string;
  scheduled_at: string;
  status: string;
}

function getActivityMessage(
  publishedCount: number | null,
  draftCountRecent: number | null,
  imageCount: number | null
): string {
  if (Number(publishedCount) > 0) {
    return `Just published ${publishedCount} post${Number(publishedCount) > 1 ? "s" : ""}! 🚀`;
  }
  if (Number(draftCountRecent) > 0) {
    return `Working on ${draftCountRecent} draft${Number(draftCountRecent) > 1 ? "s" : ""}... ✍️`;
  }
  if (Number(imageCount) > 0) {
    return `Uploaded ${imageCount} image${Number(imageCount) > 1 ? "s" : ""} to the gallery! 🖼️`;
  }
  return "Start creating to see your activity here!";
}

function checkTwitterConnection(
  externalAccounts: { provider: string }[] | undefined
): boolean {
  return !!externalAccounts?.some(
    (acc) =>
      acc.provider === "oauth_twitter" ||
      acc.provider === "twitter" ||
      acc.provider === "x" ||
      acc.provider?.includes("twitter") ||
      acc.provider?.includes("x")
  );
}

function checkLinkedInConnection(
  externalAccounts: { provider: string }[] | undefined
): boolean {
  return !!externalAccounts?.some(
    (acc) =>
      acc.provider === "oauth_linkedin" ||
      acc.provider === "linkedin" ||
      acc.provider === "oauth_linkedin_oidc" ||
      acc.provider?.toLowerCase().includes("linkedin")
  );
}

// Extracted async component for data fetching (wrapped in Suspense)
async function DashboardContent() {
  // Get Clerk user
  const user = await currentUser();
  if (!user) {
    return <div className="p-6">Please sign in to view your dashboard.</div>;
  }
  const userId = user.id;

  const isTwitterConnected = checkTwitterConnection(user.externalAccounts);
  const isLinkedInConnected = checkLinkedInConnection(user.externalAccounts);

  // Supabase client
  const supabase = createServerSupabaseClient();

  // Draft count
  const { count: draftCount, error: draftError } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "draft");

  // Bluesky connection: check user_bluesky_accounts table for user_id
  let isBlueskyConnected = false;
  try {
    const { data: blueskyAccount } = await supabase
      .from("user_bluesky_accounts")
      .select("id")
      .eq("user_id", userId)
      .single();
    isBlueskyConnected = !!blueskyAccount;
  } catch {
    isBlueskyConnected = false;
  }

  // 1. Next scheduled post (generations_platforms with status 'queue' and scheduled_at in the future)
  const { data: scheduledRows } = await supabase
    .from("generations_platforms")
    .select("id, scheduled_at, status, generation:generations(id, response)")
    .eq("status", "queue")
    .order("scheduled_at", { ascending: true })
    .limit(10);
  const now = new Date();
  const nextScheduled = scheduledRows
    ? (scheduledRows as ScheduledRow[]).find(
        (row) => row.scheduled_at && isAfter(parseISO(row.scheduled_at), now)
      )
    : null;

  // 2. Gallery: get 3 most recent images from storage
  const { data: galleryFiles } = await supabase.storage
    .from("images")
    .list(`${userId}/`, { limit: 10 });
  const galleryImages = (galleryFiles ?? [])
    .filter((f: GalleryFile) => f.name)
    .sort((a: GalleryFile, b: GalleryFile) => {
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3)
    .map(
      (f: GalleryFile) =>
        `https://kdwolwebviyzyjulmzgb.supabase.co/storage/v1/object/public/images/${userId}/${f.name}`
    );

  // 3. Recent activity (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
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
  ]);

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
          <Card className="flex flex-col items-start gap-2 border-none bg-primary/80 p-4 shadow-custom">
            <span className="font-semibold">Drafts</span>
            <span className="font-bold font-mono text-4xl">
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
          isBlueskyConnected={isBlueskyConnected}
          isLinkedInConnected={isLinkedInConnected}
          isTwitterConnected={isTwitterConnected}
          username={user.username ?? ""}
        />

        {/* Next scheduled post card */}
        <Card className="flex flex-col justify-start border-none bg-background p-6 shadow-custom">
          <span className="mb-2 block font-semibold">Next scheduled post</span>
          <div className="flex h-full flex-col items-start justify-between gap-2">
            {nextScheduled ? (
              <>
                <div className="flex flex-row items-center gap-4">
                  <div className="flex max-w-fit flex-col items-center rounded-md bg-primary p-4 shadow-custom">
                    <span className="font-bold font-mono text-4xl">
                      {format(parseISO(nextScheduled.scheduled_at), "d")}
                    </span>
                    <span className="font-mono text-muted-foreground text-xs uppercase">
                      {format(parseISO(nextScheduled.scheduled_at), "MMM")}
                    </span>
                    <span className="font-mono text-muted-foreground text-xs">
                      {format(parseISO(nextScheduled.scheduled_at), "HH:mm")}
                    </span>
                  </div>
                  <div className="line-clamp-4 text-sm">
                    {(() => {
                      const gen = Array.isArray(nextScheduled.generation)
                        ? nextScheduled.generation[0]
                        : nextScheduled.generation;
                      return gen?.response
                        ? gen.response.split(" ").slice(0, 12).join(" ") +
                            (gen.response.split(" ").length > 12 ? "..." : "")
                        : "";
                    })()}
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/${user.username}/posts`}>See all posts</Link>
                </Button>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <NoScheduledPosts
                  backgroundColor="var(--color-primary)"
                  className="ml-2"
                  primaryColor="var(--color-airlume)"
                />
                <span className="text-muted-foreground text-sm">
                  There are no scheduled posts.
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Gallery card */}
        <Card className="flex flex-col justify-between border-none bg-background p-6 shadow-custom">
          <span className="mb-2 block font-semibold">Media Library</span>
          <div className="flex h-full w-full items-center justify-center gap-2">
            {galleryImages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center">
                <NotImageFound
                  backgroundColor="var(--color-primary)"
                  className="ml-2"
                  primaryColor="var(--color-airlume)"
                />
                <span className="text-muted-foreground text-sm">No images</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((src) => (
                <div
                  className="relative h-full w-full overflow-hidden rounded-md border"
                  key={src}
                >
                  <Image
                    alt="gallery"
                    className="h-full w-full object-cover"
                    height={64}
                    src={src}
                    width={64}
                  />
                </div>
              ))}
            </div>
          </div>

          {galleryImages.length >= 1 && (
            <Button asChild variant="outline">
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
        <Card className="flex flex-col items-center justify-between overflow-hidden border-none bg-background p-6 shadow-custom md:flex-row">
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
            <div className="-right-20 -bottom-40 transition-all duration-300 group-hover:-bottom-36 md:absolute">
              <BlueskyPromoImage
                alt="Bluesky avatar user preview"
                src="https://github.com/educlopez.png"
              />
            </div>
          </div>
        </Card>
        {/* Recent Activity */}
        <Card className="flex flex-col justify-between overflow-hidden border-none bg-background p-6 shadow-custom md:flex-row md:items-center">
          {/* Left: Activity List */}
          <div className="flex-1 pr-4">
            <span className="mb-2 block font-semibold">Recent Activity</span>
            <ul className="ml-5 list-disc text-sm">
              <li>{publishedCount} posts published this week</li>
              <li>{draftCountRecent} drafts edited</li>
              <li>{imageCount} images uploaded</li>
            </ul>
          </div>
          {/* Right: Animated Post Preview */}
          <div className="flex flex-1 items-center justify-center">
            <Link
              className="group relative w-full max-w-xs cursor-pointer rounded-lg bg-primary shadow-custom transition-transform duration-300 hover:scale-105"
              href={`/${user.username}/generator`}
            >
              <div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-center gap-2">
                  <Image
                    alt="User avatar"
                    className="h-10 w-10 rounded border border-primary/30 shadow-custom"
                    height={32}
                    src={user.imageUrl || "https://github.com/educlopez.png"}
                    width={32}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">
                      {user.username || "user"}
                    </span>
                    <span className="block text-muted-foreground text-xs">
                      Just now
                    </span>
                  </div>
                </div>
                <div className="text-foreground/90 text-sm">
                  {getActivityMessage(
                    publishedCount,
                    draftCountRecent,
                    imageCount
                  )}
                </div>
              </div>
              {/* Animated background accent */}
              <div className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-32 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            className="h-48 animate-pulse rounded bg-gray-100 dark:bg-gray-800"
            key={i}
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardHomePage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
