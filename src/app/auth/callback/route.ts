import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const destination = new URL("/dashboard", requestUrl.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=invalid_callback", requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=invalid_callback", requestUrl.origin));
    }

    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("portal_users")
      .select("account_status")
      .eq("id", userData.user?.id ?? "")
      .maybeSingle();

    if (!profile || profile.account_status !== "active") {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?status=pending", requestUrl.origin));
    }

    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_unavailable", requestUrl.origin));
  }
}
