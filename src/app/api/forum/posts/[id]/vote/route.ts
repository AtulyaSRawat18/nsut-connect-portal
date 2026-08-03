import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const voteSchema = z.object({ value: z.union([z.literal(-1), z.literal(0), z.literal(1)]) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin voting is not allowed");
  const limit = checkRateLimit(request, "forum:vote", { limit: 40, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many votes", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity();
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_POST", "Invalid forum post");
    const parsed = voteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_VOTE", "Vote must be up, down, or cleared");
    const supabase = await createClient();
    const current = await supabase.from("forum_post_votes").select("value").eq("post_id", id).eq("voter_id", identity.id).maybeSingle();
    if (current.error) return authError(400, "VOTE_FAILED", current.error.message);

    const requested = parsed.data.value;
    if (requested === 0 || current.data?.value === requested) {
      const removed = await supabase.from("forum_post_votes").delete().eq("post_id", id).eq("voter_id", identity.id);
      if (removed.error) return authError(400, "VOTE_FAILED", removed.error.message);
    } else {
      const saved = await supabase.from("forum_post_votes").upsert(
        { post_id: id, voter_id: identity.id, value: requested, updated_at: new Date().toISOString() },
        { onConflict: "post_id,voter_id" },
      );
      if (saved.error) return authError(400, "VOTE_FAILED", saved.error.message);
    }
    const { data: post } = await supabase.from("forum_posts").select("upvotes").eq("id", id).single();
    revalidateTag("public-forum", "max");
    return NextResponse.json({ error: false, score: post?.upvotes || 0, vote: requested === 0 || current.data?.value === requested ? 0 : requested });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "FORUM_UNAVAILABLE", "Voting is temporarily unavailable");
  }
}
