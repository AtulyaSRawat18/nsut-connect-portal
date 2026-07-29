import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProfileWrapper from "@/components/profile/ProfileWrapper";

export default async function Profile({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Fetch from core portal_users table
  const { data: userRecord } = await supabase
    .from("portal_users")
    .select("*")
    .eq("id", id)
    .single();

  if (!userRecord) {
    notFound();
  }

  // 2. Fetch role-specific details
  let roleDetails = null;
  if (userRecord.role === "faculty") {
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
    ...userRecord,
    ...roleDetails,
    full_name: userRecord.name, // Mapping for UI consistency
  };

  // Fetch their projects (if faculty) or applied/accepted (if student)
  let projects: any[] = [];
  if (profile.role === 'faculty') {
    const { data } = await supabase.from('projects').select('id, title, status').eq('faculty_id', id);
    projects = data || [];
  } else {
    // Note: if projects table logic hasn't evolved yet, this might return empty
    const { data } = await supabase.from('applications').select('projects(id, title, status)').eq('student_id', id);
    projects = data?.map((a: any) => a.projects) || [];
  }

  // Check if current user is viewing their own profile
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === id;

  return <ProfileWrapper profile={profile} projects={projects} isOwner={isOwner} />;
}
