import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProfileWrapper from "@/components/profile/ProfileWrapper";

type ProfileProject = { id: string; title: string; status: string };

export default async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Public identity comes from the intentionally public compatibility profile.
  // portal_users stays private because it also carries account-management state.
  const { data: publicIdentity } = await supabase
    .from("profiles")
    .select("id, email, role, full_name, department")
    .eq("id", id)
    .single();

  if (!publicIdentity || !["student", "faculty"].includes(publicIdentity.role)) {
    notFound();
  }

  // 2. Fetch role-specific details
  let roleDetails = null;
  if (publicIdentity.role === "faculty") {
    const { data } = await supabase
      .from("faculty_profiles")
      .select("*")
      .eq("user_id", id)
      .single();
    roleDetails = data;
  } else {
    const { data } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", id)
      .single();
    roleDetails = data;
  }

  const profile = {
    id: publicIdentity.id,
    name: publicIdentity.full_name,
    email: publicIdentity.email,
    role: publicIdentity.role as "student" | "faculty",
    department: publicIdentity.department,
    ...roleDetails,
    full_name: publicIdentity.full_name,
  };

  // Fetch their projects (if faculty) or applied/accepted (if student)
  let projects: ProfileProject[] = [];
  if (profile.role === 'faculty') {
    const { data } = await supabase.from('projects').select('id, title, status').eq('faculty_id', id);
    projects = (data || []) as ProfileProject[];
  } else {
    const { data } = await supabase.from('applications').select('projects(id, title, status)').eq('student_id', id);
    projects = (data || []).flatMap((application) => {
      const related = application.projects;
      return Array.isArray(related) ? related : related ? [related] : [];
    }) as ProfileProject[];
  }

  // Check if current user is viewing their own profile
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === id;

  return <ProfileWrapper profile={profile} projects={projects} isOwner={isOwner} />;
}
