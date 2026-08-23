import { redirect } from "next/navigation";
import { AuthenticationError, AuthorizationError, requirePortalIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import OnboardingProfile from "./OnboardingProfile";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let identity;
  try {
    identity = await requirePortalIdentity({ permissions: ["profile.update.own"], allowPending: true });
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/login?reason=authentication_required");
    if (error instanceof AuthorizationError) redirect("/unauthorized?reason=profile_setup_denied");
    throw error;
  }

  const supabase = await createClient();
  const table = identity.role === "faculty" ? "faculty_profiles" : "student_profiles";
  const { data: details, error } = await supabase.from(table).select("*").eq("user_id", identity.id).single();
  if (error || !details) redirect("/unauthorized?reason=profile_incomplete");

  return <OnboardingProfile profile={{ ...details, id: identity.id, name: identity.name, email: identity.email, role: identity.role }} isActive={identity.accountStatus === "active"} />;
}
