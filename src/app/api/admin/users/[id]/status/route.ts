import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AuthenticationError,
  AuthorizationError,
  requirePortalIdentity,
} from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";
import { checkRateLimit, isSameOrigin } from "@/lib/auth/rate-limit";
import { createClient } from "@/utils/supabase/server";

const statusSchema = z.object({
  status: z.enum(["pending", "active", "suspended"]),
  reason: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return authError(403, "INVALID_ORIGIN", "Cross-origin admin actions are not allowed");
  }

  const rateLimit = checkRateLimit(request, "admin:account-status", {
    limit: 30,
    windowMs: 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    return authError(429, "RATE_LIMITED", "Too many admin actions", {
      "Retry-After": String(rateLimit.retryAfterSeconds),
    });
  }

  try {
    const admin = await requirePortalIdentity({ roles: ["admin"] });
    const { id } = await context.params;
    const parsed = statusSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return authError(400, "INVALID_STATUS", "A valid account status is required");
    }
    if (admin.id === id && parsed.data.status !== "active") {
      return authError(400, "SELF_LOCKOUT", "Administrators cannot suspend themselves");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_account_status", {
      target_id: id,
      new_status: parsed.data.status,
      reason: parsed.data.reason || null,
    });

    if (error) {
      return authError(400, "STATUS_UPDATE_FAILED", error.message);
    }

    return NextResponse.json({ error: false, status: parsed.data.status });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return authError(401, "UNAUTHENTICATED", error.message);
    }
    if (error instanceof AuthorizationError) {
      return authError(403, "FORBIDDEN", error.message);
    }
    return authError(503, "ADMIN_UNAVAILABLE", "Admin service is temporarily unavailable");
  }
}
