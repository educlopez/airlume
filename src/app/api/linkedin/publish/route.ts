import { auth, clerkClient } from "@clerk/nextjs/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabaseClient"

export async function POST(req: NextRequest) {
  try {
    console.log(">>> /api/linkedin/publish endpoint HIT <<<")
    const { postContent, id, userId: userIdFromBody, imageUrl, imageAlt } = await req.json()
    let userId = userIdFromBody

    // If not in body, get from Clerk (for manual case)
    if (!userId) {
      const authResult = await auth()
      userId = authResult.userId
    }

    console.log("[LINKEDIN PUBLISH] userId:", userId)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", debug: {} }, { status: 401 })
    }

    // Get the Clerk client
    const client = await clerkClient()

    // Get the user and their external accounts from Clerk
    const user = await client.users.getUser(userId)
    const externalAccounts = user.externalAccounts || []

    console.log("[LINKEDIN PUBLISH] externalAccounts:", JSON.stringify(externalAccounts))

    // Find LinkedIn account - check multiple possible provider names
    const linkedinAccount = externalAccounts.find(
      (acc) =>
        acc.provider === "oauth_linkedin" ||
        acc.provider === "linkedin" ||
        acc.provider === "oauth_linkedin_oidc" ||
        acc.provider?.toLowerCase().includes("linkedin")
    )

    console.log("[LINKEDIN PUBLISH] linkedinAccount:", JSON.stringify(linkedinAccount))

    if (!linkedinAccount) {
      return NextResponse.json(
        { error: "No LinkedIn connection found in Clerk.", debug: { userId, externalAccounts } },
        { status: 400 }
      )
    }

    // Get the correct provider name from the connected account
    const linkedinProvider = linkedinAccount.provider as "oauth_linkedin" | "oauth_linkedin_oidc"
    console.log("[LINKEDIN PUBLISH] Using provider:", linkedinProvider)

    // Get the access token using the correct provider
    let tokensResponse: Awaited<ReturnType<typeof client.users.getUserOauthAccessToken>>
    try {
      tokensResponse = await client.users.getUserOauthAccessToken(userId, linkedinProvider)
    } catch (error) {
      console.error("[LINKEDIN PUBLISH] Error getting access token:", error)
      return NextResponse.json(
        { error: "Failed to get LinkedIn access token", debug: { userId, provider: linkedinProvider, error: String(error) } },
        { status: 500 }
      )
    }

    console.log("[LINKEDIN PUBLISH] tokensResponse:", JSON.stringify(tokensResponse))

    const accessToken = tokensResponse.data[0]?.token

    console.log("[LINKEDIN PUBLISH] accessToken:", accessToken ? accessToken.slice(0, 8) + "..." : null)

    if (!accessToken) {
      return NextResponse.json(
        { error: "No LinkedIn access token found.", debug: { userId, provider: linkedinProvider, externalAccounts, tokensResponse } },
        { status: 400 }
      )
    }

    // Get the LinkedIn user ID (sub from the account)
    const linkedinUserId: string | null | undefined = linkedinAccount.externalId || linkedinAccount.username

    if (!linkedinUserId) {
      return NextResponse.json(
        { error: "LinkedIn user ID not found", debug: { linkedinAccount } },
        { status: 400 }
      )
    }

    // Handle image upload if imageUrl is provided
    let media: Array<{
      status: string
      description: { text: string }
      media: string
      title: { text: string }
    }> | null = null

    if (imageUrl) {
      try {
        console.log("[LINKEDIN PUBLISH] Starting image upload process")

        // Step 1: Register the image upload
        const registerUploadRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: `urn:li:person:${linkedinUserId}`,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          }),
        })

        const uploadData = await registerUploadRes.json()
        console.log("[LINKEDIN PUBLISH] Upload registration response:", JSON.stringify(uploadData))

        if (!registerUploadRes.ok || !uploadData.value) {
          console.error("[LINKEDIN PUBLISH] Failed to register upload:", uploadData)
          return NextResponse.json(
            { error: "Failed to register image upload with LinkedIn", debug: uploadData },
            { status: 500 }
          )
        }

        const uploadUrl =
          uploadData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl
        const asset = uploadData.value.asset

        // Step 2: Upload the actual image
        console.log("[LINKEDIN PUBLISH] Fetching image from:", imageUrl)
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        console.log("[LINKEDIN PUBLISH] Image size:", imageBuffer.byteLength, "bytes")

        const uploadImageRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: imageBuffer,
        })

        if (!uploadImageRes.ok) {
          const errorText = await uploadImageRes.text()
          console.error("[LINKEDIN PUBLISH] Failed to upload image:", errorText)
          return NextResponse.json(
            { error: "Failed to upload image to LinkedIn", debug: errorText },
            { status: 500 }
          )
        }

        console.log("[LINKEDIN PUBLISH] Image uploaded successfully, asset:", asset)

        // Step 3: Set media for the post
        media = [
          {
            status: "READY",
            description: {
              text: imageAlt || "",
            },
            media: asset,
            title: {
              text: "Image",
            },
          },
        ]
      } catch (error) {
        console.error("[LINKEDIN PUBLISH] Error during image upload:", error)
        return NextResponse.json(
          {
            error: "Failed to process image for LinkedIn",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        )
      }
    }

    // Create the post using LinkedIn API v2
    // https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
    const postBody = {
      author: `urn:li:person:${linkedinUserId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: postContent,
          },
          shareMediaCategory: media ? "IMAGE" : "NONE",
          ...(media && { media }),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }

    const linkedinRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    })

    const responseText = await linkedinRes.text()
    console.log("[LINKEDIN PUBLISH] LinkedIn API response:", responseText)

    let data: unknown
    try {
      data = JSON.parse(responseText)
    } catch {
      if (linkedinRes.ok) {
        // LinkedIn sometimes returns empty body on success
        data = { success: true }
      } else {
        return NextResponse.json(
          { error: "Failed to parse LinkedIn response", raw: responseText, debug: { userId, postContent } },
          { status: 500 }
        )
      }
    }

    if (!linkedinRes.ok) {
      return NextResponse.json(
        { error: data, debug: { userId, postContent, linkedinApi: responseText } },
        { status: 400 }
      )
    }

    // Update Supabase status to 'sent'
    if (id) {
      const supabase = createServerSupabaseClient()
      const { data: updated, error: updateError } = await supabase
        .from("generations_platforms")
        .update({ status: "sent" })
        .eq("generation_id", id)
        .eq("platform", "linkedin")
        .select()

      if (updateError) {
        console.error("Failed to update post status in Supabase:", updateError)
        return NextResponse.json(
          {
            error: "Post published to LinkedIn, but failed to update status in Supabase",
            supabaseError: updateError.message,
            debug: { userId, postContent, linkedinApi: responseText },
          },
          { status: 500 }
        )
      }

      // If no row was updated in generations_platforms, update generations (direct publish)
      if (!updated || updated.length === 0) {
        const { error: genError } = await supabase.from("generations").update({ status: "sent" }).eq("id", id)
        if (genError) {
          console.error("Failed to update post status in generations:", genError)
          return NextResponse.json(
            {
              error: "Post published to LinkedIn, but failed to update status in generations",
              supabaseError: genError.message,
              debug: { userId, postContent, linkedinApi: responseText },
            },
            { status: 500 }
          )
        }
      }
    } else {
      console.warn("No post ID provided for status update.")
    }

    return NextResponse.json({
      success: true,
      data,
      debug: {
        userId,
        externalAccounts,
        accessToken: accessToken ? accessToken.slice(0, 8) + "..." : null,
        postContent,
        linkedinApi: responseText,
      },
    })
  } catch (error) {
    console.error("ERROR in /api/linkedin/publish:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : error },
      { status: 500 }
    )
  }
}

