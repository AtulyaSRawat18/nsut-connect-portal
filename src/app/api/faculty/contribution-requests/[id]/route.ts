import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const reviewSchema = z.object({ status: z.enum(["accepted", "rejected"]), note: z.string().trim().max(1000).optional() }).superRefine((value, context) => {
  if (value.status === "rejected" && (!value.note || value.note.length < 3)) context.addIssue({ code: "custom", message: "A rejection note is required" });
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin contribution reviews are not allowed");
  const limit = checkRateLimit(request, "faculty:contribution-review", { limit: 40, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many review actions", { "Retry-After": String(limit.retryAfterSeconds) });
  try {
    await requirePortalIdentity({ roles: ["faculty"], permissions: ["contribution.review"] });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_REQUEST", "Invalid contribution request");
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_REVIEW", parsed.error.issues[0]?.message || "Invalid review");
    const supabase = await createClient();
    const { error } = await supabase.rpc("review_project_contribution_request", { target_request_id: id, new_status: parsed.data.status, review_note: parsed.data.note || null });
    if (error) return authError(400, "REVIEW_FAILED", error.message);
    return NextResponse.json({ error: false, status: parsed.data.status });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "REVIEW_UNAVAILABLE", "Contribution review is temporarily unavailable");
  }
}
