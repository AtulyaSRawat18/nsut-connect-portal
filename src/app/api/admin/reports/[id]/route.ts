import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const actionSchema = z.object({
  action: z.enum(["resolved", "dismissed", "hidden", "removed", "restored"]),
  note: z.string().trim().min(3).max(1000),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin moderation is not allowed");
  const limit = checkRateLimit(request, "admin:report-action", { limit: 50, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many moderation actions", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    await requirePortalIdentity({ roles: ["admin"], permissions: ["report.resolve", "content.moderate"] });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_REPORT", "Invalid report");
    const parsed = actionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_ACTION", parsed.error.issues[0]?.message || "Invalid moderation action");
    const supabase = await createClient();
    const basicResolution = parsed.data.action === "resolved" || parsed.data.action === "dismissed";
    const { error } = basicResolution
      ? await supabase.rpc("resolve_content_report", {
          target_report_id: id,
          new_status: parsed.data.action,
          selected_action: parsed.data.action,
          note: parsed.data.note,
        })
      : await supabase.rpc("admin_moderate_report", {
          target_report_id: id,
          selected_action: parsed.data.action,
          note: parsed.data.note,
        });
    if (error) return authError(400, "MODERATION_FAILED", error.message);
    revalidateTag("public-forum", "max");
    return NextResponse.json({ error: false, action: parsed.data.action });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "MODERATION_UNAVAILABLE", "Moderation is temporarily unavailable");
  }
}
