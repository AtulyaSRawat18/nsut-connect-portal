import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AuthenticationError,
  AuthorizationError,
  requirePortalIdentity,
} from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { isDepartmentId } from "@/lib/departments";
import { createClient } from "@/utils/supabase/server";

const forumPostSchema = z.object({
  title: z.string().trim().min(8).max(180),
  content: z.string().trim().min(30).max(5000),
  department: z.string().refine(isDepartmentId, "Select a valid department"),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin forum publishing is not allowed");
  }

  const limit = checkRateLimit(request, "forum:posts", { limit: 8, windowMs: 60_000 });
  if (!limit.allowed) {
    return authError(429, "RATE_LIMITED", "Too many forum posts", {
      "Retry-After": String(limit.retryAfterSeconds),
    });
  }

  try {
    const identity = await requirePortalIdentity({ roles: ["faculty", "admin"] });
    const parsed = forumPostSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return authError(
        400,
        "INVALID_FORUM_POST",
        parsed.error.issues[0]?.message || "Invalid forum post",
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("forum_posts")
      .insert({
        ...parsed.data,
        author_id: identity.id,
      })
      .select("id")
      .single();

    if (error) return authError(400, "FORUM_POST_FAILED", error.message);
    revalidateTag("public-forum", "max");
    return NextResponse.json({ error: false, id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return authError(401, "UNAUTHENTICATED", error.message);
    }
    if (error instanceof AuthorizationError) {
      return authError(403, "FORBIDDEN", error.message);
    }
    return authError(503, "FORUM_UNAVAILABLE", "Forum publishing is temporarily unavailable");
  }
}
