import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient<Database>(url, key, {
    cookies: makeCookieHandler(),
  });
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createServerClient<Database>(url, serviceKey, {
    cookies: makeCookieHandler(),
  });
}
