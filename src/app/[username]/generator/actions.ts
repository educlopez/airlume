"use server"

import { createServerSupabaseClient } from "@/lib/supabaseClient"

export async function saveGeneration({
  userId,
  response,
  imageFile, // File | undefined
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
}) {
  const supabase = createServerSupabaseClient()
  let imageUrl: string | null = null

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
    imageUrl = publicUrlData?.publicUrl || null
  }

  const { error } = await supabase.from("generations").insert([
    {
      user_id: userId,
      response,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    },
  ])
  if (error) throw error
  return { success: true }
}
