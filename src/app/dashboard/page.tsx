import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { requirePageIdentity } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const profile = await requirePageIdentity();
  const portalMode = (await cookies()).get("nsut_portal_mode")?.value;

  if (portalMode === "student" && profile.roles.includes("student")) {
    return <div className="portal-page"><div className="portal-container"><StudentDashboard profile={profile} /></div></div>;
  }

  if (portalMode === "faculty") {
    if (profile.roles.includes("admin")) redirect("/admin");
    if (profile.roles.includes("moderator")) redirect("/moderator");
    if (profile.roles.includes("faculty")) redirect("/dashboard/faculty");
  }

  if (profile.roles.includes("admin")) redirect("/admin");
  if (profile.roles.includes("moderator") && !profile.roles.includes("faculty")) redirect("/moderator");
  if (profile.roles.includes("faculty")) redirect("/dashboard/faculty");
  return <div className="portal-page"><div className="portal-container"><StudentDashboard profile={profile} /></div></div>;
}
