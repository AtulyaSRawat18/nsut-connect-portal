import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const collaborationSchema = z.object({
  collaborationType: z.enum(["research", "methodology", "facilities", "data", "co_supervision", "publication", "other"]),
  proposal: z.string().trim().min(80).max(3000),
  expertiseSummary: z.string().trim().min(40).max(1200),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin collaboration requests are not allowed");
  const limit = checkRateLimit(request, "project:faculty-collaboration", { limit: 8, windowMs: 15 * 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many collaboration requests", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity({ roles: ["faculty"], permissions: ["collaboration.create"] });
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return authError(400, "INVALID_PROJECT", "Invalid project");
    const parsed = collaborationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_COLLABORATION", parsed.error.issues[0]?.message || "Complete the collaboration request");

    const supabase = await createClient();
    const { data: project, error: projectError } = await supabase.from("projects").select("id, faculty_id, status").eq("id", id).maybeSingle();
    if (projectError) return authError(503, "PROJECT_UNAVAILABLE", "The project could not be checked");
    if (!project) return authError(404, "PROJECT_NOT_FOUND", "Project not found");
    if (project.status !== "open") return authError(409, "PROJECT_CLOSED", "This project is not accepting collaboration requests");
    if (project.faculty_id === identity.id) return authError(409, "OWN_PROJECT", "You already own this project");

    const { data, error } = await supabase.from("faculty_collaboration_requests").insert({
      project_id: id,
      requester_faculty_id: identity.id,
      collaboration_type: parsed.data.collaborationType,
      proposal: parsed.data.proposal,
      expertise_summary: parsed.data.expertiseSummary,
      status: "pending",
    }).select("id, status, created_at").single();
    if (error?.code === "23505") return authError(409, "ALREADY_REQUESTED", "You already requested collaboration on this project");
    if (error) return authError(400, "COLLABORATION_FAILED", "The collaboration request could not be submitted");
    return NextResponse.json({ error: false, request: data }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "COLLABORATION_UNAVAILABLE", "Collaboration requests are temporarily unavailable");
  }
}
