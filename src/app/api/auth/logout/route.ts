import { NextResponse } from "next/server";
import { authError } from "@/lib/auth/responses";
import { isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin logout is not allowed");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return authError(500, "LOGOUT_FAILED", "Unable to end the session");
    }
    return NextResponse.json({ error: false, message: "Logged out successfully" });
  } catch {
    return authError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable");
  }
}
