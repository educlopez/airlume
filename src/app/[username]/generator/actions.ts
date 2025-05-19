"use server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"

export async function saveGeneration({
  userId,
  response,
  imageFile, // File | undefined
  imageUrl, // string | undefined
}: {
  userId: string
  prompt: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  presencePenalty: number
  frequencyPenalty: number
  topP: number
  response: string
  imageFile?: File
  imageUrl?: string
}) {
  const supabase = createServerSupabaseClient()
  let finalImageUrl: string | null = null

  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, imageFile)
    if (uploadError) throw uploadError
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath)
    finalImageUrl = publicUrlData?.publicUrl || null
  } else if (imageUrl) {
    finalImageUrl = imageUrl
  }

  const { error } = await supabase.from("generations").insert([
    {
      user_id: userId,
      response,
      image_url: finalImageUrl,
      created_at: new Date().toISOString(),
      status: 'draft',
    },
  ])
  if (error) throw error
  return { success: true }
}

export async function updateGeneration({
  id,
  response,
  image_url,
}: {
  id: string
  response: string
  image_url?: string | null
}) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("generations")
    .update({ response, image_url })
    .eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function deleteGeneration(id: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function duplicateGeneration({
  id,
  user_id,
}: {
  id: string
  user_id: string
}) {
  const supabase = createServerSupabaseClient()
  // Get the original generation
  const { data: original, error: fetchError } = await supabase
    .from("generations")
    .select("response, image_url")
    .eq("id", id)
    .single()
  if (fetchError || !original) throw fetchError || new Error("Not found")
  // Insert a new generation with the same data, new id, new created_at, status draft
  const { error: insertError } = await supabase.from("generations").insert([
    {
      user_id,
      response: original.response,
      image_url: original.image_url,
      created_at: new Date().toISOString(),
      status: "draft",
    },
  ])
  if (insertError) throw insertError
  return { success: true }
}

export async function scheduleGeneration({
  id,
  scheduled_at,
}: {
  id: string
  scheduled_at: string
}) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("generations")
    .update({ scheduled_at, status: 'queue' })
    .eq("id", id)
  if (error) throw error
  return { success: true }
}

export async function scheduleGenerationMultiPlatform({
  id,
  platforms,
}: {
  id: string
  platforms: { platform: string; scheduled_at: string }[]
}) {
  const supabase = createServerSupabaseClient();
  const inserts = platforms.map((p) => ({
    generation_id: id,
    platform: p.platform,
    scheduled_at: p.scheduled_at,
    status: "queue",
  }));
  const { error } = await supabase.from("generations_platforms").insert(inserts);
  if (error) throw error;
  return { success: true };
}

export async function uploadImageToSupabase({ userId, imageFile }: { userId: string, imageFile: File }) {
  // Server-side file size validation
  if (imageFile.size > 1024 * 1024) {
    return { error: "Image must be less than 1MB." }
  }
  const supabase = createServerSupabaseClient()
  const fileExt = imageFile.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, imageFile)
  if (uploadError) return { error: uploadError.message }
  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(fileName)
  return publicUrlData?.publicUrl || ""
}
