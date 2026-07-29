import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const resolutionSchema = z.object({
  status: z.enum(["resolved", "dismissed"]),
  note: z.string().trim().min(3).max(1000),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin moderation is not allowed");
  }
  const limit = checkRateLimit(request, "moderator:reports", { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) {
    return authError(429, "RATE_LIMITED", "Too many moderation actions", { "Retry-After": String(limit.retryAfterSeconds) });
  }

  try {
    await requirePortalIdentity({ permissions: ["report.resolve"] });
    const parsed = resolutionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_RESOLUTION", "A resolution note is required");
    const { id } = await context.params;
    const supabase = await createClient();
    const { error } = await supabase.rpc("resolve_content_report", {
      target_report_id: id,
      new_status: parsed.data.status,
      selected_action: parsed.data.status,
      note: parsed.data.note,
    });
    if (error) return authError(400, "RESOLUTION_FAILED", error.message);
    return NextResponse.json({ error: false, status: parsed.data.status });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "MODERATION_UNAVAILABLE", "Moderation is temporarily unavailable");
  }
}
