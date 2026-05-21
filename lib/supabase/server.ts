import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

const SUPABASE_URL = "https://jrxshopwmqynwyiqhyza.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyeHNob3B3bXF5bnd5aXFoeXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTU3MDMsImV4cCI6MjA5NDY5MTcwM30.J5oiSzU7nFWphQv46kP2TYOmPElhCL3-adHiXfRiSdU";

function makeCookieHandler() {
  return {
    async getAll() {
      const store = await cookies();
      return store.getAll();
    },
    async setAll(
      cookiesToSet: { name: string; value: string; options?: object }[]
    ) {
      try {
        const store = await cookies();
        cookiesToSet.forEach(({ name, value, options }) =>
          store.set(name, value, options as Parameters<typeof store.set>[2])
        );
      } catch {
        // Server component — can't set cookies
      }
    },
  };
}

export async function createClient() {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: makeCookieHandler(),
  });
}

export async function createAdminClient() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY;
  return createServerClient<Database>(SUPABASE_URL, serviceKey, {
    cookies: makeCookieHandler(),
  });
}
