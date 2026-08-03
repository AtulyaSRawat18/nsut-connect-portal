import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const departments = ["CSE", "ECE", "IT", "MAC", "ICE", "MECH", "CIVIL", "BT", "BBA"] as const;
const projectSchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(20).max(8000),
  department: z.enum(departments),
  maxStudents: z.number().int().min(1).max(50),
  briefUrl: z.string().trim().refine((value) => /^(https:\/\/|\/).+\.pdf(?:[?#].*)?$/i.test(value), "A direct HTTPS or site-local PDF link is required"),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin project publishing is not allowed");
  const limit = checkRateLimit(request, "faculty:projects", { limit: 8, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many project submissions", { "Retry-After": String(limit.retryAfterSeconds) });
  try {
    const identity = await requirePortalIdentity({ permissions: ["project.create"] });
    const parsed = projectSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_PROJECT", parsed.error.issues[0]?.message || "Invalid project");
    const supabase = await createClient();
    const { data, error } = await supabase.from("projects").insert({
      title: parsed.data.title,
      description: parsed.data.description,
      department: parsed.data.department,
      max_students: parsed.data.maxStudents,
      brief_url: parsed.data.briefUrl,
      faculty_id: identity.id,
      status: "open",
      progress_percent: 0,
      health_status: "on_track",
    }).select("id").single();
    if (error) return authError(400, "PROJECT_FAILED", error.message);
    revalidateTag("public-projects", "max");
    return NextResponse.json({ error: false, id: data.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "PROJECTS_UNAVAILABLE", "Project publishing is temporarily unavailable");
  }
}
