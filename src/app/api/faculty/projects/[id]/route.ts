import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { isApplicationFormReference } from "@/lib/application-forms";
import { isDepartmentId } from "@/lib/departments";

const projectUpdateSchema = z.object({
  title: z.string().trim().min(5).max(180).optional(),
  description: z.string().trim().min(20).max(8000).optional(),
  department: z.string().refine(isDepartmentId, "Select a valid department").optional(),
  maxStudents: z.number().int().min(1).max(50).optional(),
  status: z.enum(["open", "closed"]).optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  healthStatus: z.enum(["on_track", "at_risk", "blocked", "completed"]).optional(),
  progressNote: z.string().trim().min(10).max(1000).optional(),
  briefReference: z.string().trim().min(1).max(700).optional(),
  applicationFormUrl: z.string().trim().min(1).max(700).refine(isApplicationFormReference, "Use a Google Forms URL, approved demo form, or NA").optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), "No project changes supplied");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin project updates are not allowed");
  const limit = checkRateLimit(request, "faculty:project-update", { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many project updates", { "Retry-After": String(limit.retryAfterSeconds) });
  try {
    const identity = await requirePortalIdentity({ permissions: ["project.update.own"] });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_PROJECT", "Invalid project");
    const parsed = projectUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_PROJECT_UPDATE", parsed.error.issues[0]?.message || "Invalid project update");
    const supabase = await createClient();
    const { data: project, error: readError } = await supabase.from("projects").select("faculty_id").eq("id", id).single();
    if (readError || !project) return NextResponse.json({ error: true, code: "PROJECT_NOT_FOUND", message: "Project not found" }, { status: 404 });
    if (project.faculty_id !== identity.id) return authError(403, "FORBIDDEN", "Only the project owner can update this project");
    const changes: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.title !== undefined) changes.title = parsed.data.title;
    if (parsed.data.description !== undefined) changes.description = parsed.data.description;
    if (parsed.data.department !== undefined) changes.department = parsed.data.department;
    if (parsed.data.maxStudents !== undefined) changes.max_students = parsed.data.maxStudents;
    if (parsed.data.status !== undefined) changes.status = parsed.data.status;
    if (parsed.data.progressPercent !== undefined) changes.progress_percent = parsed.data.progressPercent;
    if (parsed.data.healthStatus !== undefined) changes.health_status = parsed.data.healthStatus;
    if (parsed.data.progressNote !== undefined) changes.progress_note = parsed.data.progressNote;
    if (parsed.data.briefReference !== undefined) changes.brief_url = parsed.data.briefReference;
    if (parsed.data.applicationFormUrl !== undefined) changes.application_form_url = parsed.data.applicationFormUrl;
    if (parsed.data.progressPercent !== undefined || parsed.data.healthStatus !== undefined || parsed.data.progressNote !== undefined) changes.last_assessed_at = new Date().toISOString();
    const { data: updatedProject, error } = await supabase
      .from("projects")
      .update(changes)
      .eq("id", id)
      .select("id, max_students, available_seats, updated_at")
      .single();
    if (error?.code === "23514" && error.message.includes("Capacity cannot be lower")) {
      return authError(409, "CAPACITY_BELOW_ACCEPTED", "Student capacity cannot be lower than the number of accepted students");
    }
    if (error) return authError(400, "PROJECT_UPDATE_FAILED", error.message);
    revalidateTag("public-projects", "max");
    return NextResponse.json({ error: false, project: updatedProject });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "PROJECTS_UNAVAILABLE", "Project updates are temporarily unavailable");
  }
}
