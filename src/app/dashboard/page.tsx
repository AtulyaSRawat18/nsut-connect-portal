import FacultyDashboard from "@/components/dashboard/FacultyDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { requirePageIdentity } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const profile = await requirePageIdentity();

  if (profile.roles.includes("moderator") && !profile.roles.includes("faculty")) {
    redirect("/moderator");
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        {profile.role === "faculty" || profile.role === "admin" ? (
          <FacultyDashboard profile={profile} />
        ) : (
          <StudentDashboard profile={profile} />
        )}
      </div>
    </div>
  );
}
