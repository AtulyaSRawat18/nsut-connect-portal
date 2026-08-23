import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { isQuestionnaireResponseReference } from "@/lib/application-forms";

const applicationSchema = z.object({
  statementOfPurpose: z.string().trim().min(100).max(3000),
  skillsSummary: z.string().trim().min(40).max(1200),
  availabilityHours: z.coerce.number().int().min(1).max(40),
  resumeUrl: z.string().trim().min(1).max(700),
  googleFormResponseUrl: z.string().trim().min(1).max(700).refine((value) => value === "NA" || isQuestionnaireResponseReference(value), "Provide the Google Forms URL or approved demo completion reference"),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin applications are not allowed");
  const limit = checkRateLimit(request, "project:application", { limit: 6, windowMs: 15 * 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many application attempts", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity({ roles: ["student"], permissions: ["application.create"] });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_PROJECT", "Invalid project");
    const parsed = applicationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_APPLICATION", parsed.error.issues[0]?.message || "Complete every required application field");

    const supabase = await createClient();
    const projectRead = await supabase.from("projects").select("id, status, available_seats, application_form_url").eq("id", id).maybeSingle();
    let project = projectRead.data;
    let projectError = projectRead.error;
    if (projectError && projectError.message.includes("application_form_url")) {
      const legacyRead = await supabase.from("projects").select("id, status, available_seats").eq("id", id).maybeSingle();
      project = legacyRead.data ? { ...legacyRead.data, application_form_url: "NA" } : null;
      projectError = legacyRead.error;
    }
    if (projectError) return authError(503, "PROJECT_UNAVAILABLE", "The project could not be checked");
    if (!project) return authError(404, "PROJECT_NOT_FOUND", "Project not found");
    if (project.status !== "open") return authError(409, "PROJECT_CLOSED", "This project is not accepting applications");
    if (project.available_seats <= 0) return authError(409, "PROJECT_FULL", "This project has no seats available");
    const hasQuestionnaire = project.application_form_url && project.application_form_url !== "NA";
    if (hasQuestionnaire && parsed.data.googleFormResponseUrl === "NA") return authError(400, "QUESTIONNAIRE_REQUIRED", "Complete the project questionnaire before applying");
    if (!hasQuestionnaire && parsed.data.googleFormResponseUrl !== "NA") return authError(400, "QUESTIONNAIRE_NOT_ASSIGNED", "This project does not require questionnaire evidence");

    const { data, error } = await supabase.from("applications").insert({
      project_id: id,
      student_id: identity.id,
      statement_of_purpose: parsed.data.statementOfPurpose,
      skills_summary: parsed.data.skillsSummary,
      availability_hours: parsed.data.availabilityHours,
      resume_url: parsed.data.resumeUrl,
      google_form_response_url: parsed.data.googleFormResponseUrl,
      status: "pending",
    }).select("id, status, applied_at").single();

    if (error?.code === "23505") return authError(409, "ALREADY_APPLIED", "You have already applied for this project");
    if (error) return authError(400, "APPLICATION_FAILED", "The application could not be submitted");
    return NextResponse.json({ error: false, application: data }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "APPLICATION_UNAVAILABLE", "Applications are temporarily unavailable");
  }
}
