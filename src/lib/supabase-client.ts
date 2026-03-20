import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";

export function createServerSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}
