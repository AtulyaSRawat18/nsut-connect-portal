import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const reviewSchema = z.object({
  decision: z.enum(["approved", "rejected", "changes_requested"]),
  note: z.string().trim().max(1000).optional(),
}).superRefine((value, context) => {
  if (value.decision !== "approved" && !value.note) {
    context.addIssue({ code: "custom", message: "A review note is required" });
  }
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin moderation is not allowed");
  }
  const limit = checkRateLimit(request, "moderator:faculty-verification", { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    return authError(429, "RATE_LIMITED", "Too many verification actions", { "Retry-After": String(limit.retryAfterSeconds) });
  }

  try {
    await requirePortalIdentity({ permissions: ["faculty.verify"] });
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_REVIEW", parsed.error.issues[0]?.message || "Invalid review");
    const { id } = await context.params;
    const supabase = await createClient();
    const { error } = await supabase.rpc("review_faculty_verification", {
      request_id: id,
      decision: parsed.data.decision,
      note: parsed.data.note || null,
    });
    if (error) return authError(400, "REVIEW_FAILED", error.message);
    return NextResponse.json({ error: false, decision: parsed.data.decision });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "VERIFICATION_UNAVAILABLE", "Verification is temporarily unavailable");
  }
}
