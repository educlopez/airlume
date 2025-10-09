import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    console.log("[LINKEDIN CHECK] No userId found")
    return NextResponse.json({ error: "Unauthorized", connected: false }, { status: 401 })
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const externalAccounts = user.externalAccounts || []

    console.log("[LINKEDIN CHECK] User ID:", userId)
    console.log("[LINKEDIN CHECK] External accounts:", JSON.stringify(externalAccounts.map(acc => ({
      provider: acc.provider,
      username: acc.username,
      id: acc.id
    }))))

    // Check if LinkedIn is connected via Clerk
    // Check multiple possible provider names
    const linkedinAccount = externalAccounts.find(
      (acc) =>
        acc.provider === "oauth_linkedin" ||
        acc.provider === "linkedin" ||
        acc.provider === "oauth_linkedin_oidc" ||
        acc.provider?.toLowerCase().includes("linkedin")
    )

    console.log("[LINKEDIN CHECK] LinkedIn account found:", linkedinAccount ? "YES" : "NO")
    if (linkedinAccount) {
      console.log("[LINKEDIN CHECK] LinkedIn provider:", linkedinAccount.provider)
    }

    if (!linkedinAccount) {
      return NextResponse.json({
        connected: false,
        debug: {
          userId,
          availableProviders: externalAccounts.map(acc => acc.provider)
        }
      })
    }

    const response = NextResponse.json({
      connected: true,
      provider: linkedinAccount.provider,
      username: linkedinAccount.username,
    })

    // Add cache control headers to prevent stale data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')

    return response
  } catch (error) {
    console.error("[LINKEDIN CHECK] Error fetching LinkedIn connection:", error)
    const errorResponse = NextResponse.json({
      error: "Failed to fetch LinkedIn connection",
      connected: false,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })

    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

    return errorResponse
  }
}

