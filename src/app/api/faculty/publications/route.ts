import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const publicationSchema = z.object({
  title: z.string().trim().min(5).max(300),
  authors: z.array(z.string().trim().min(1).max(150)).min(1).max(30),
  publishedDate: z.string().date().optional(),
  url: z.string().url().optional(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin publishing is not allowed");
  const limit = checkRateLimit(request, "faculty:publications", { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many publication changes", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity({ permissions: ["publication.manage.own"] });
    const parsed = publicationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_PUBLICATION", parsed.error.issues[0]?.message || "Invalid publication");
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publications")
      .insert({
        title: parsed.data.title,
        authors: parsed.data.authors,
        published_date: parsed.data.publishedDate || null,
        url: parsed.data.url || null,
        faculty_id: identity.id,
      })
      .select("id")
      .single();
    if (error) return authError(400, "PUBLICATION_FAILED", error.message);
    revalidateTag("public-publications", "max");
    return NextResponse.json({ error: false, id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "PUBLICATION_UNAVAILABLE", "Publication service is temporarily unavailable");
  }
}
