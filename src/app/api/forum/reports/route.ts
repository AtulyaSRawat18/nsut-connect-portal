import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const reportSchema = z.object({
  entityType: z.enum(["forum_post", "forum_reply"]),
  entityId: z.string().uuid(),
  category: z.enum(["spam", "harassment", "misinformation", "privacy", "academic_integrity", "other"]),
  summary: z.string().trim().min(10).max(500),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin reports are not allowed");

  const limit = checkRateLimit(request, "forum:reports", { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return authError(429, "RATE_LIMITED", "Too many reports", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  try {
    const identity = await requirePortalIdentity({ permissions: ["report.create"] });
    const parsed = reportSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return authError(400, "INVALID_REPORT", parsed.error.issues[0]?.message || "Invalid report");
    }

    const supabase = await createClient();
    const { entityType, entityId, category, summary } = parsed.data;
    let discussionId = entityId;

    if (entityType === "forum_post") {
      const { data: post, error } = await supabase.from("forum_posts").select("id").eq("id", entityId).maybeSingle();
      if (error || !post) return authError(404, "FORUM_POST_NOT_FOUND", "Forum post not found");
    } else {
      const { data: reply, error } = await supabase.from("forum_replies").select("id, post_id").eq("id", entityId).maybeSingle();
      if (error || !reply) return authError(404, "FORUM_REPLY_NOT_FOUND", "Forum reply not found");
      discussionId = reply.post_id;
    }

    const { error } = await supabase.from("content_reports").insert({
      reporter_id: identity.id,
      entity_type: entityType,
      entity_id: entityId,
      category,
      summary,
      evidence: { source: "forum", postId: discussionId },
      priority: "normal",
    });

    if (error?.code === "23505") return authError(409, "REPORT_EXISTS", "You already have an open report for this content");
    if (error) return authError(400, "REPORT_FAILED", "The report could not be submitted");

    return NextResponse.json({ error: false }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "REPORTING_UNAVAILABLE", "Forum reporting is temporarily unavailable");
  }
}
