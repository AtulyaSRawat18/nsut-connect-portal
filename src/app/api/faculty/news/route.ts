import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { isDepartmentId } from "@/lib/departments";
import { createClient } from "@/utils/supabase/server";

const newsSchema = z.object({
  title: z.string().trim().min(5).max(180),
  content: z.string().trim().min(20).max(8000),
  category: z.string().trim().min(1).max(80),
  department: z.string().refine(isDepartmentId, "Select a valid department"),
  sourceUrl: z.string().url().refine((value) => value.startsWith("https://"), "An HTTPS source link is required"),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin publishing is not allowed");
  const limit = checkRateLimit(request, "faculty:news", { limit: 8, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many news submissions", { "Retry-After": String(limit.retryAfterSeconds) });
  try {
    const identity = await requirePortalIdentity({ permissions: ["announcement.create"] });
    const parsed = newsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_NEWS", parsed.error.issues[0]?.message || "Invalid news");
    const supabase = await createClient();
    const { data, error } = await supabase.from("announcements").insert({
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      department: parsed.data.department,
      source_url: parsed.data.sourceUrl,
      author_id: identity.id,
    }).select("id").single();
    if (error) return authError(400, "NEWS_FAILED", error.message);
    revalidateTag("public-news", "max");
    revalidateTag("public-feed", "max");
    return NextResponse.json({ error: false, id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "NEWS_UNAVAILABLE", "News publishing is temporarily unavailable");
  }
}
