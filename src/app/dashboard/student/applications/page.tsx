import { createClient } from "@/utils/supabase/server";
import { getDepartmentCompactLabel } from "@/lib/departments";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

type StudentApplication = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  applied_at: string;
  projects: {
    id: string;
    title: string;
    department: string | null;
    portal_users: { name: string } | null;
  };
};

type StudentContribution = {
  id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  faculty_note: string | null;
  projects: { id: string; title: string; department: string | null };
};

export default async function StudentApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch applications for this student
  const { data: applications } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      applied_at,
      projects (
        id,
        title,
        department,
        portal_users!projects_faculty_id_fkey(name)
      )
    `)
    .eq("student_id", user.id)
    .order("applied_at", { ascending: false });
  const studentApplications = (applications ?? []) as unknown as StudentApplication[];
  const { data: contributionRequests } = await supabase
    .from("project_contribution_requests")
    .select("id, status, created_at, faculty_note, projects(id, title, department)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });
  const contributions = (contributionRequests ?? []) as unknown as StudentContribution[];

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">My Applications</h1>
        <p className="text-foreground/50 mb-12">Track the status of your research applications.</p>

        <div className="bg-surface rounded-xl border border-outline overflow-hidden">
          <div className="grid grid-cols-4 sm:grid-cols-12 gap-4 p-4 border-b border-outline bg-surface-container-lowest text-xs font-bold uppercase tracking-widest text-foreground/50">
            <div className="col-span-2 sm:col-span-6">Project</div>
            <div className="col-span-1 sm:col-span-3">Applied On</div>
            <div className="col-span-1 sm:col-span-3 text-right">Status</div>
          </div>

          <div className="divide-y divide-outline">
            {studentApplications.length > 0 ? (
              studentApplications.map((app) => (
                <div key={app.id} className="grid grid-cols-4 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container-lowest transition-colors">
                  <div className="col-span-2 sm:col-span-6">
                    <Link href={`/projects/${app.projects.id}`} className="font-bold text-foreground hover:text-primary transition-colors block truncate">
                      {app.projects.title}
                    </Link>
                    <p className="text-xs text-foreground/70 mt-1">
                      {app.projects.portal_users?.name} • {getDepartmentCompactLabel(app.projects.department)}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-3 text-sm text-foreground/70">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 sm:col-span-3 text-right flex justify-end">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold tracking-widest uppercase ${
                      app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700' :
                      app.status === 'accepted' ? 'bg-green-500/10 text-green-700' :
                      'bg-red-500/10 text-red-700'
                    }`}>
                      {app.status === 'pending' && <Clock className="w-3 h-3" />}
                      {app.status === 'accepted' && <CheckCircle2 className="w-3 h-3" />}
                      {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {app.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-foreground/50 text-sm">
                You haven&apos;t applied to any projects yet.
              </div>
            )}
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-4"><h2 className="text-2xl font-black text-foreground">Non-seat contribution requests</h2><p className="mt-1 text-sm text-foreground/50">These requests are separate from vacancy allotment and never consume a student seat.</p></div>
          <div className="divide-y divide-outline overflow-hidden rounded-xl border border-outline bg-surface">
            {contributions.map((request) => <div key={request.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><Link href={`/projects/${request.projects.id}`} className="font-bold text-foreground hover:text-primary">{request.projects.title}</Link><p className="mt-1 text-xs text-foreground/55">{getDepartmentCompactLabel(request.projects.department)} · requested {new Date(request.created_at).toLocaleDateString()}</p>{request.faculty_note && <p className="mt-2 text-sm text-foreground/65">Faculty note: {request.faculty_note}</p>}</div><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${request.status === "pending" ? "bg-yellow-500/10 text-yellow-700" : request.status === "accepted" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>{request.status}</span></div>)}
            {contributions.length === 0 && <p className="p-8 text-center text-sm text-foreground/50">No non-seat contribution requests yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
