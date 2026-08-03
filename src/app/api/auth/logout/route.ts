import { NextResponse } from "next/server";
import { authError } from "@/lib/auth/responses";
import { isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin logout is not allowed");
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return authError(500, "LOGOUT_FAILED", "Unable to end the session");
    const response = NextResponse.json({ error: false, message: "Logged out successfully" });
    response.cookies.set("nsut_portal_mode", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
    return response;
  } catch {
    return authError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable");
  }
}
