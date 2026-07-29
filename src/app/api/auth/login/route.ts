import { NextResponse } from "next/server";
import { z } from "zod";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().endsWith("@nsut.ac.in"),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin authentication is not allowed");
  }

  const rateLimit = checkRateLimit(request, "auth:login", {
    limit: 5,
    windowMs: 15 * 60 * 1_000,
  });

  if (!rateLimit.allowed) {
    return authError(
      429,
      "RATE_LIMITED",
      "Too many sign-in attempts. Try again later.",
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return authError(400, "INVALID_CREDENTIALS", "Enter a valid NSUT email and password");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    // Keep the response intentionally generic to avoid account enumeration.
    if (error || !data.user) {
      return authError(401, "INVALID_CREDENTIALS", "Incorrect email or password");
    }

    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return authError(403, "EMAIL_NOT_VERIFIED", "Verify your NSUT email before signing in");
    }

    const { data: profile, error: profileError } = await supabase
      .from("portal_users")
      .select("id, name, email, role, account_status, banned_until, ban_reason")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return authError(403, "PROFILE_INCOMPLETE", "Your portal profile has not been provisioned");
    }

    const bannedUntil = profile.banned_until
      ? new Date(profile.banned_until).getTime()
      : null;
    const isBanned =
      profile.account_status === "suspended" ||
      (bannedUntil !== null && bannedUntil > Date.now());

    if (isBanned) {
      await supabase.auth.signOut();
      return authError(
        403,
        "ACCOUNT_SUSPENDED",
        profile.ban_reason || "This account is suspended",
      );
    }

    if (profile.account_status !== "active") {
      await supabase.auth.signOut();
      return authError(
        403,
        "ACCOUNT_PENDING",
        "Your account is awaiting institutional approval",
      );
    }

    return NextResponse.json({
      error: false,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
      },
    });
  } catch {
    return authError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable");
  }
}
