import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let publicClient: SupabaseClient | undefined;
async function retryPublicRead(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    // A single immediate retry prevents a transient network reset from becoming
    // a cached empty discovery view. This client is read-only and anonymous.
    return fetch(input, init);
  }
}

export function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public data access is not configured");
  }

  if (!publicClient) {
    publicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        fetch: retryPublicRead,
      },
    });
  }

  return publicClient;
}
