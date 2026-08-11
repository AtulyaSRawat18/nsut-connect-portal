import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type PortalRole = "student" | "faculty" | "moderator" | "admin";

function rolesForPath(pathname: string): readonly PortalRole[] | null {
  if (pathname.startsWith("/admin")) return ["admin"];
  if (pathname.startsWith("/moderator")) return ["moderator", "admin"];
  if (pathname.startsWith("/dashboard/faculty")) return ["faculty", "admin"];
  if (pathname.startsWith("/dashboard/student")) return ["student"];
  if (pathname.startsWith("/dashboard/opportunities")) return ["faculty", "admin"];
  if (pathname.startsWith("/dashboard")) return ["student", "faculty", "moderator", "admin"];
  return null;
}

function redirectTo(
  request: NextRequest,
  pathname: string,
  reason?: string,
  cookieSource?: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  const response = NextResponse.redirect(url);
  for (const cookie of cookieSource?.cookies.getAll() ?? []) {
    response.cookies.set(cookie);
  }
  return withSecurityHeaders(response);
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return rolesForPath(request.nextUrl.pathname)
      ? redirectTo(request, "/login", "auth_configuration")
      : withSecurityHeaders(NextResponse.next());
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const pathname = request.nextUrl.pathname;
    const requiredRoles = rolesForPath(pathname);
    const isProtectedRoute = requiredRoles !== null;
    const isAuthRoute = pathname === "/login";

    if (isProtectedRoute || isAuthRoute) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // getUser validates the JWT rather than trusting unverified cookie data.
      if (!user && isProtectedRoute) {
        return redirectTo(request, "/login", "authentication_required", supabaseResponse);
      }

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("portal_users")
          .select("role, account_status, banned_until, profile_completed_at")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          if (isProtectedRoute) {
            return redirectTo(request, "/login", "profile_incomplete", supabaseResponse);
          }
          return withSecurityHeaders(supabaseResponse);
        }

        const { data: roleAssignments } = await supabase
          .from("user_roles")
          .select("role_key")
          .eq("user_id", user.id);
        const assignedRoles = new Set<PortalRole>([
          profile.role as PortalRole,
          ...((roleAssignments || []).map((item) => item.role_key) as PortalRole[]),
        ]);
        const isBanned =
          profile.account_status === "suspended" ||
          (profile.banned_until &&
            new Date(profile.banned_until).getTime() > Date.now());
        const isActive = profile.account_status === "active" && !isBanned;

        if (isProtectedRoute && !isActive) {
          return redirectTo(request, "/unauthorized", "account_inactive", supabaseResponse);
        }

        if (isProtectedRoute && !profile.profile_completed_at) {
          return redirectTo(request, "/onboarding", "profile_setup_required", supabaseResponse);
        }

        if (
          isProtectedRoute &&
          requiredRoles &&
          !requiredRoles.some((role) => assignedRoles.has(role))
        ) {
          return redirectTo(request, "/unauthorized", "insufficient_role", supabaseResponse);
        }

        if (isAuthRoute && isActive) {
          return redirectTo(request, "/dashboard", undefined, supabaseResponse);
        }
      }
    }
  } catch {
    if (rolesForPath(request.nextUrl.pathname)) {
      return redirectTo(request, "/login", "authentication_unavailable", supabaseResponse);
    }
    return withSecurityHeaders(NextResponse.next());
  }

  return withSecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
