import { Filter, Search } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import { ApplicationReviewCard, type FacultyApplication } from "./ApplicationReviewCard";

const statuses = ["all", "pending", "accepted", "rejected"] as const;

export default async function FacultyApplicationsPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string; project?: string }> }) {
  const identity = await requirePageIdentity({ roles: ["faculty"], permissions: ["application.review"] });
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const status = statuses.includes(params?.status as (typeof statuses)[number]) ? params?.status || "all" : "all";
  const supabase = await createClient();
  const applicationResult = await supabase
    .from("applications")
    .select("id, statement_of_purpose, skills_summary, availability_hours, resume_url, google_form_response_url, faculty_note, reviewed_at, status, applied_at, student_id, projects!inner(id, title)")
    .eq("projects.faculty_id", identity.id)
    .order("applied_at", { ascending: false });

  const studentIds = Array.from(new Set((applicationResult.data || []).map((application) => application.student_id)));
  const studentResult = studentIds.length
    ? await supabase.from("portal_users").select("id, name, email").in("id", studentIds)
    : { data: [], error: null };
  const studentsById = new Map((studentResult.data || []).map((student) => [student.id, student]));
  const missingStudent = studentIds.some((studentId) => !studentsById.has(studentId));
  const allApplications = (applicationResult.data || []).flatMap((application) => {
    const student = studentsById.get(application.student_id);
    return student ? [{ ...application, portal_users: { name: student.name, email: student.email } } as FacultyApplication] : [];
  });
  const queryFailed = Boolean(applicationResult.error || studentResult.error || missingStudent);

  const projectOptions = Array.from(new Map(allApplications.map((application) => {
    const project = Array.isArray(application.projects) ? application.projects[0] : application.projects;
    return [project.id, project.title];
  })).entries());
  const projectId = projectOptions.some(([id]) => id === params?.project) ? params?.project || "all" : "all";
  const applications = allApplications.filter((application) => {
    const project = Array.isArray(application.projects) ? application.projects[0] : application.projects;
    const student = Array.isArray(application.portal_users) ? application.portal_users[0] : application.portal_users;
    const matchesQuery = !q || project.title.toLowerCase().includes(q) || student.name.toLowerCase().includes(q) || student.email.toLowerCase().includes(q);
    return matchesQuery && (status === "all" || application.status === status) && (projectId === "all" || project.id === projectId);
  });

  return (
    <div className="space-y-8">
      <header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Student intake</p><h1 className="text-4xl font-black text-foreground">Application review</h1><p className="mt-3 max-w-2xl text-foreground/55">Compare complete statements, evidence, availability, CVs, and external questionnaires only for projects you own.</p></header>
      <form className="grid gap-3 rounded-2xl border border-outline bg-surface p-4 md:grid-cols-[1fr_11rem_15rem_auto]">
        <label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-foreground/40" /><input name="q" defaultValue={params?.q || ""} placeholder="Student or project" className="w-full rounded-lg border border-outline bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" /></label>
        <select name="status" defaultValue={status} aria-label="Filter applications by status" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All statuses</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select>
        <select name="project" defaultValue={projectId} aria-label="Filter applications by project" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"><option value="all">All projects</option>{projectOptions.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
      </form>
      {queryFailed ? <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Applications are temporarily unavailable.</div> : <section className="space-y-5"><p className="text-xs font-bold uppercase tracking-widest text-foreground/45">{applications.length} matching applications</p>{applications.map((application) => <ApplicationReviewCard key={application.id} application={application} />)}{applications.length === 0 && <div className="rounded-2xl border border-dashed border-outline p-14 text-center text-foreground/45">No applications match these filters.</div>}</section>}
    </div>
  );
}
