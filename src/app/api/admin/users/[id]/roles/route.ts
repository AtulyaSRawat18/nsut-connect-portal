import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const roleSchema = z.object({ role: z.enum(["student", "faculty", "moderator", "admin"]) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) return authError(403, "INVALID_ORIGIN", "Cross-origin role management is not allowed");
  const limit = checkRateLimit(request, "admin:roles", { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return authError(429, "RATE_LIMITED", "Too many role changes", { "Retry-After": String(limit.retryAfterSeconds) });
  try {
    await requirePortalIdentity({ roles: ["admin"], permissions: ["role.manage"] });
    const parsed = roleSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return authError(400, "INVALID_ROLE", "A recognized role is required");
    const { id } = await context.params;
    const supabase = await createClient();
    const { error } = await supabase.rpc("assign_portal_role", { target_id: id, new_role: parsed.data.role });
    if (error) return authError(400, "ROLE_ASSIGNMENT_FAILED", error.message);
    return NextResponse.json({ error: false, role: parsed.data.role });
  } catch (error) {
    if (error instanceof AuthenticationError) return authError(401, "UNAUTHENTICATED", error.message);
    if (error instanceof AuthorizationError) return authError(403, "FORBIDDEN", error.message);
    return authError(503, "ROLE_SERVICE_UNAVAILABLE", "Role management is temporarily unavailable");
  }
}
