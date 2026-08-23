import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const contributionSchema = z.object({
  contributionStatement: z.string().trim().min(80).max(2500),
  skillsSummary: z.string().trim().min(40).max(1200),
  availabilityHours: z.coerce.number().int().min(1).max(40),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin contribution requests are not allowed");
  const limit = checkRateLimit(request, "project:contribution-request", { limit: 5, windowMs: 15 * 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many contribution requests", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity({ roles: ["student"], permissions: ["contribution.create"] });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_PROJECT", "Invalid project");
    const parsed = contributionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_CONTRIBUTION", parsed.error.issues[0]?.message || "Complete the contribution request");

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase.from("projects").select("id, faculty_id, status, available_seats").eq("id", id).maybeSingle();
    if (projectError) return authError(503, "PROJECT_UNAVAILABLE", "The project could not be checked");
    if (!project) return authError(404, "PROJECT_NOT_FOUND", "Project not found");
    if (project.status !== "open") return authError(409, "PROJECT_CLOSED", "This project is closed");
    if (project.available_seats > 0) return authError(409, "SEATS_AVAILABLE", "Apply for an available student seat instead");
    if (project.faculty_id === identity.id) return authError(409, "INVALID_REQUEST", "Project owners cannot request contribution");

    const { data: existingApplication } = await supabase.from("applications").select("id").eq("project_id", id).eq("student_id", identity.id).maybeSingle();
    if (existingApplication) return authError(409, "APPLICATION_EXISTS", "You already have a student application for this project");

    const { data, error } = await supabase.from("project_contribution_requests").insert({
      project_id: id,
      student_id: identity.id,
      contribution_statement: parsed.data.contributionStatement,
      skills_summary: parsed.data.skillsSummary,
      availability_hours: parsed.data.availabilityHours,
      status: "pending",
    }).select("id, status, created_at").single();
    if (error?.code === "23505") return authError(409, "ALREADY_REQUESTED", "You already requested to contribute to this project");
    if (error) return authError(400, "CONTRIBUTION_FAILED", "The contribution request could not be submitted");
    return NextResponse.json({ error: false, request: data }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "CONTRIBUTION_UNAVAILABLE", "Contribution requests are temporarily unavailable");
  }
}
