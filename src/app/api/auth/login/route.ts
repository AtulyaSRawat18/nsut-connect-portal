import { NextResponse } from "next/server";
import { z } from "zod";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { isPortalRole, type PortalRole } from "@/lib/auth/types";
import { createClient } from "@/utils/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().endsWith("@nsut.ac.in"),
  password: z.string().min(8).max(128),
  portalMode: z.enum(["student", "faculty"]),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin authentication is not allowed");
  const rateLimit = checkRateLimit(request, "auth:login", { limit: 5, windowMs: 15 * 60_000 });
  if (!rateLimit.allowed) return authError(429, "RATE_LIMITED", "Too many sign-in attempts. Try again later.", { "Retry-After": String(rateLimit.retryAfterSeconds) });

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authError(400, "INVALID_CREDENTIALS", "Enter a valid NSUT email, password, and portal type");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    if (error || !data.user) return authError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
    if (!data.user.email_confirmed_at) { await supabase.auth.signOut(); return authError(403, "EMAIL_NOT_VERIFIED", "Verify your NSUT email before signing in"); }

    const [profileResult, roleResult] = await Promise.all([
      supabase.from("portal_users").select("id, name, email, role, account_status, banned_until, ban_reason").eq("id", data.user.id).single(),
      supabase.from("user_roles").select("role_key").eq("user_id", data.user.id),
    ]);
    const profile = profileResult.data;
    if (profileResult.error || !profile || !isPortalRole(profile.role)) { await supabase.auth.signOut(); return authError(403, "PROFILE_INCOMPLETE", "Your portal profile has not been provisioned"); }

    const roles = new Set<PortalRole>([profile.role, ...((roleResult.data || []).map((item) => item.role_key).filter(isPortalRole))]);
    const modeAllowed = parsed.data.portalMode === "student" ? roles.has("student") : ["faculty", "moderator", "admin"].some((role) => roles.has(role as PortalRole));
    if (!modeAllowed) { await supabase.auth.signOut(); return authError(403, "PORTAL_MODE_MISMATCH", "This account is not enabled for the selected portal type"); }

    const bannedUntil = profile.banned_until ? new Date(profile.banned_until).getTime() : null;
    const isBanned = profile.account_status === "suspended" || (bannedUntil !== null && bannedUntil > Date.now());
    if (isBanned) { await supabase.auth.signOut(); return authError(403, "ACCOUNT_SUSPENDED", profile.ban_reason || "This account is suspended"); }
    if (profile.account_status !== "active") { await supabase.auth.signOut(); return authError(403, "ACCOUNT_PENDING", "Your account is awaiting institutional approval"); }

    const response = NextResponse.json({ error: false, user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role }, portalMode: parsed.data.portalMode });
    response.cookies.set("nsut_portal_mode", parsed.data.portalMode, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
    return response;
  } catch {
    return authError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable");
  }
}
