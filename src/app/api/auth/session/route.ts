import { NextResponse } from "next/server";
import { getPortalIdentity } from "@/lib/auth/server";
import { authError } from "@/lib/auth/responses";

export async function GET() {
  try {
    const identity = await getPortalIdentity();
    if (!identity) {
      return authError(401, "UNAUTHENTICATED", "No valid session");
    }

    return NextResponse.json(
      { error: false, user: identity },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return authError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable");
  }
}
