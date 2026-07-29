import { createClient } from "@/utils/supabase/server";
import { ApplicationReviewCard } from "./ApplicationReviewCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FacultyApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch applications for projects owned by this faculty
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      statement_of_purpose,
      status,
      applied_at,
      student_id,
      projects!inner(id, title),
      portal_users!applications_student_id_fkey(name, email)
    `)
    .eq("projects.faculty_id", user.id)
    .order("applied_at", { ascending: false });

  const pendingApps = applications?.filter((a: any) => a.status === 'pending') || [];
  const reviewedApps = applications?.filter((a: any) => a.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">Application Review</h1>
        <p className="text-foreground/50 mb-12">Review and manage student applications for your research projects.</p>

        <h3 className="text-lg font-bold mb-4 border-b border-outline pb-2">Pending Applications ({pendingApps.length})</h3>
        <div className="space-y-4 mb-12">
           {pendingApps.length > 0 ? (
             pendingApps.map((app: any) => (
                <ApplicationReviewCard key={app.id} application={app} />
             ))
           ) : (
             <p className="text-sm text-foreground/50 italic">No pending applications.</p>
           )}
        </div>

        <h3 className="text-lg font-bold mb-4 border-b border-outline pb-2">Reviewed Applications ({reviewedApps.length})</h3>
        <div className="space-y-4">
           {reviewedApps.length > 0 ? (
             reviewedApps.map((app: any) => (
                <ApplicationReviewCard key={app.id} application={app} />
             ))
           ) : (
             <p className="text-sm text-foreground/50 italic">No reviewed applications.</p>
           )}
        </div>
      </div>
    </div>
  );
}
