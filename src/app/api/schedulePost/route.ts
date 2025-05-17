import { scheduledPostTask } from "@/trigger/scheduledPost";
import { schedules } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();
  // data: { userId, cron, timezone }

  const createdSchedule = await schedules.create({
    task: scheduledPostTask.id,
    cron:"46 18 * * *",// data.cron, // e.g., "0 8 * * *"
    timezone: "Europa/Madrid", //data.timezone, // e.g., "America/New_York"
    externalId: data.userId, // or postId, etc.
    deduplicationKey: `${data.userId}-scheduled-post`,
  });

  return NextResponse.json(createdSchedule);
}
