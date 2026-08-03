import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const replySchema = z.object({ content: z.string().trim().min(2).max(5000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin replies are not allowed");
  const limit = checkRateLimit(request, "forum:reply", { limit: 12, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many replies", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_POST", "Invalid forum post");
    const parsed = replySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_REPLY", parsed.error.issues[0]?.message || "Invalid reply");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("forum_replies")
      .insert({ post_id: id, author_id: identity.id, content: parsed.data.content })
      .select("id, post_id, author_id, content, score, created_at")
      .single();
    if (error) return authError(400, "REPLY_FAILED", error.message);
    revalidateTag("public-forum", "max");
    return NextResponse.json({ error: false, reply: { ...data, authorName: identity.name, authorRole: identity.role } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "FORUM_UNAVAILABLE", "Replies are temporarily unavailable");
  }
}
