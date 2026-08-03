import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const opportunitySchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(20).max(8000),
  type: z.enum(["internship", "scholarship", "event", "highlight"]),
  linkUrl: z.string().trim().refine((value) => value.startsWith("https://") || value.startsWith("/"), "An HTTPS or site-local action link is required"),
  deadline: z.string().date(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin publishing is not allowed");
  const limit = checkRateLimit(request, "opportunities:create", { limit: 8, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many opportunity submissions", { "Retry-After": String(limit.retryAfterSeconds) });
  try {
    await requirePortalIdentity({ permissions: ["opportunity.create"] });
    const parsed = opportunitySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_OPPORTUNITY", parsed.error.issues[0]?.message || "Invalid opportunity");
    const supabase = await createClient();
    const { data, error } = await supabase.from("highlights").insert({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      link_url: parsed.data.linkUrl,
      deadline: parsed.data.deadline,
    }).select("id").single();
    if (error) return authError(400, "OPPORTUNITY_FAILED", error.message);
    revalidateTag("public-opportunities", "max");
    return NextResponse.json({ error: false, id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "OPPORTUNITIES_UNAVAILABLE", "Opportunity publishing is temporarily unavailable");
  }
}
