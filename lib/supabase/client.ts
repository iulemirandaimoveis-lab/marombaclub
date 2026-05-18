import { createClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getPublicSupabaseEnv();
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}
