import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { isDepartmentId } from "@/lib/departments";

const optionalText = (maximum: number) => z.string().trim().max(maximum).optional().transform((value) => value || null);
const optionalLink = z.string().trim().max(700).optional().transform((value, context) => {
  if (!value) return null;
  if (value === "NA" || value.startsWith("/") || /^https:\/\/\S+$/i.test(value)) return value;
  context.addIssue({ code: "custom", message: "Links must use HTTPS, a portal-local path, or NA" });
  return z.NEVER;
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  department: z.string().trim().transform((value, context) => {
    if (isDepartmentId(value)) return value;
    context.addIssue({ code: "custom", message: "Select a valid department" });
    return z.NEVER;
  }),
  designation: optionalText(100),
  research_area: optionalText(300),
  roll_number: optionalText(30),
  course: optionalText(80),
  year: z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().min(1).max(8).nullable()),
  bio: optionalText(3000),
  education: optionalText(3000),
  contact_email: z.string().trim().max(254).optional().transform((value, context) => {
    if (!value) return null;
    if (z.email().safeParse(value).success) return value.toLowerCase();
    context.addIssue({ code: "custom", message: "Enter a valid public contact email" });
    return z.NEVER;
  }),
  website_url: optionalLink,
  github_url: optionalLink,
  linkedin_url: optionalLink,
  cv_url: optionalLink,
  office_location: optionalText(200),
  office_hours: optionalText(300),
  scholar_url: optionalLink,
  orcid: optionalText(40),
});

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin profile updates are not allowed");
  const limit = checkRateLimit(request, "profile:update", { limit: 12, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many profile updates", { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const identity = await requirePortalIdentity({ permissions: ["profile.update.own"], allowPending: true });
    const parsed = profileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_PROFILE", parsed.error.issues[0]?.message || "Invalid profile details");

    const supabase = await createClient();
    const { error: userError } = await supabase.from("portal_users").update({ name: parsed.data.name }).eq("id", identity.id);
    if (userError) return authError(400, "PROFILE_UPDATE_FAILED", userError.message);

    const common = {
      department: parsed.data.department,
      bio: parsed.data.bio,
      education: parsed.data.education,
      contact_email: parsed.data.contact_email,
      website_url: parsed.data.website_url,
      github_url: parsed.data.github_url,
      linkedin_url: parsed.data.linkedin_url,
      cv_url: parsed.data.cv_url,
    };
    const details = identity.role === "faculty"
      ? {
          ...common,
          designation: parsed.data.designation,
          research_area: parsed.data.research_area,
          office_location: parsed.data.office_location,
          office_hours: parsed.data.office_hours,
          scholar_url: parsed.data.scholar_url,
          orcid: parsed.data.orcid,
        }
      : {
          ...common,
          roll_number: parsed.data.roll_number,
          course: parsed.data.course,
          year: parsed.data.year,
        };
    const table = identity.role === "faculty" ? "faculty_profiles" : "student_profiles";
    const { error: detailError } = await supabase.from(table).update(details).eq("user_id", identity.id);
    if (detailError) return authError(400, "PROFILE_UPDATE_FAILED", detailError.message);

    const { error: completionError } = await supabase.rpc("mark_own_profile_complete");
    if (completionError) return authError(400, "PROFILE_UPDATE_FAILED", completionError.message);

    return NextResponse.json({ error: false });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "PROFILE_UNAVAILABLE", "Profile updates are temporarily unavailable");
  }
}
