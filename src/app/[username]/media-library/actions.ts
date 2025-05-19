"use server"

import { auth } from "@clerk/nextjs/server"
import { createServerSupabaseClient } from "@/lib/supabaseClient"

export async function deleteImage({ userId, fileName }: { userId: string; fileName: string }) {
  const { userId: authUserId } = await auth()
  if (!authUserId || authUserId !== userId) {
    return { error: "No autorizado" }
  }
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.storage.from("images").remove([`${userId}/${fileName}`])
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function isImageUsed({ userId, fileName }: { userId: string; fileName: string }) {
  const supabase = createServerSupabaseClient()
  const publicUrl = supabase.storage.from("images").getPublicUrl(`${userId}/${fileName}`).data.publicUrl
  const { data, error } = await supabase
    .from("generations")
    .select("id")
    .eq("image_url", publicUrl)
    .limit(1)
  if (error) return { error: error.message }
  return { used: !!(data && data.length > 0) }
}

export async function uploadImage({ userId, file }: { userId: string; file: File }) {
  const supabase = createServerSupabaseClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`
  const { error } = await supabase.storage.from("images").upload(filePath, file)
  if (error) return { error: error.message }
  const { data: publicUrlData } = supabase.storage.from("images").getPublicUrl(filePath)
  return { url: publicUrlData?.publicUrl || "" }
}