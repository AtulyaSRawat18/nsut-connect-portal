import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import { RequestReviewCard, type FacultyProjectRequest } from "./RequestReviewCard";

type ProjectRelation = { id: string; title: string } | { id: string; title: string }[];

export default async function FacultyRequestsPage() {
  // Existing faculty workspace permission keeps the page reachable while a
  // deployment is between application code and migration 011. RLS and the
  // review RPCs still require the workflow-specific permissions.
  const identity = await requirePageIdentity({ roles: ["faculty"], permissions: ["application.review"] });
  const supabase = await createClient();
  const [contributionResult, collaborationResult, sentCollaborationResult] = await Promise.all([
    supabase.from("project_contribution_requests").select("id, student_id, contribution_statement, skills_summary, availability_hours, status, faculty_note, created_at, projects!inner(id, title, faculty_id)").eq("projects.faculty_id", identity.id).order("created_at", { ascending: false }),
    supabase.from("faculty_collaboration_requests").select("id, requester_faculty_id, collaboration_type, proposal, expertise_summary, status, owner_note, created_at, projects!inner(id, title, faculty_id)").eq("projects.faculty_id", identity.id).order("created_at", { ascending: false }),
    supabase.from("faculty_collaboration_requests").select("id, collaboration_type, proposal, status, owner_note, created_at, projects!inner(id, title, faculty_id)").eq("requester_faculty_id", identity.id).order("created_at", { ascending: false }),
  ]);
  const requesterIds = Array.from(new Set([
    ...(contributionResult.data || []).map((item) => item.student_id),
    ...(collaborationResult.data || []).map((item) => item.requester_faculty_id),
    ...(sentCollaborationResult.data || []).flatMap((item) => {
      const project = Array.isArray(item.projects) ? item.projects[0] : item.projects;
      return project?.faculty_id ? [project.faculty_id] : [];
    }),
  ]));
  const profileResult = requesterIds.length ? await supabase.from("profiles").select("id, full_name, email").in("id", requesterIds) : { data: [], error: null };
  const profiles = new Map((profileResult.data || []).map((profile) => [profile.id, { id: profile.id, name: profile.full_name || "Account unavailable", email: profile.email }]));

  const contributions: FacultyProjectRequest[] = (contributionResult.data || []).flatMap((item) => {
    const requester = profiles.get(item.student_id);
    const project = Array.isArray(item.projects) ? item.projects[0] : item.projects as ProjectRelation;
    return requester && project && !Array.isArray(project) ? [{ id: item.id, kind: "contribution", status: item.status, createdAt: item.created_at, project: { id: project.id, title: project.title }, requester, primaryText: item.contribution_statement, secondaryText: item.skills_summary, metadata: `${item.availability_hours} hours / week · no seat`, reviewNote: item.faculty_note }] : [];
  });
  const collaborations: FacultyProjectRequest[] = (collaborationResult.data || []).flatMap((item) => {
    const requester = profiles.get(item.requester_faculty_id);
    const project = Array.isArray(item.projects) ? item.projects[0] : item.projects as ProjectRelation;
    return requester && project && !Array.isArray(project) ? [{ id: item.id, kind: "collaboration", status: item.status, createdAt: item.created_at, project: { id: project.id, title: project.title }, requester, primaryText: item.proposal, secondaryText: item.expertise_summary, metadata: item.collaboration_type.replace("_", " "), reviewNote: item.owner_note }] : [];
  });
  const sentCollaborations = (sentCollaborationResult.data || []).flatMap((item) => {
    const project = Array.isArray(item.projects) ? item.projects[0] : item.projects;
    const owner = project ? profiles.get(project.faculty_id) : null;
    return project && owner ? [{ id: item.id, project: { id: project.id, title: project.title }, owner, type: item.collaboration_type, proposal: item.proposal, status: item.status, note: item.owner_note, createdAt: item.created_at }] : [];
  });
  const queryFailed = Boolean(contributionResult.error || collaborationResult.error || sentCollaborationResult.error || profileResult.error);

  return <div className="space-y-10"><header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Project relationship requests</p><h1 className="text-4xl font-black text-foreground">Contribution & collaboration</h1><p className="mt-3 max-w-3xl text-foreground/55">Student contribution requests are non-seat work proposed only after vacancies fill. Faculty collaboration requests are peer-to-peer research proposals and never participate in seat accounting.</p></header>{queryFailed ? <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-10 text-amber-700">Request queues require database migration <code>202608110011_project_contribution_and_collaboration_requests.sql</code>.</div> : <><section className="space-y-5"><div><h2 className="text-2xl font-black">Student contribution requests</h2><p className="mt-1 text-sm text-foreground/50">Non-seat contributions received after student capacity reached zero.</p></div>{contributions.map((request) => <RequestReviewCard key={request.id} request={request} />)}{contributions.length === 0 && <p className="rounded-2xl border border-dashed border-outline p-10 text-center text-sm text-foreground/45">No student contribution requests.</p>}</section><section className="space-y-5"><div><h2 className="text-2xl font-black">Faculty collaboration requests received</h2><p className="mt-1 text-sm text-foreground/50">Research, methodology, facilities, data, co-supervision and publication proposals for projects you own.</p></div>{collaborations.map((request) => <RequestReviewCard key={request.id} request={request} />)}{collaborations.length === 0 && <p className="rounded-2xl border border-dashed border-outline p-10 text-center text-sm text-foreground/45">No faculty collaboration requests.</p>}</section><section className="space-y-5"><div><h2 className="text-2xl font-black">Collaboration requests you sent</h2><p className="mt-1 text-sm text-foreground/50">Track peer proposals independently from your owned-project review queues.</p></div><div className="divide-y divide-outline overflow-hidden rounded-2xl border border-outline bg-surface">{sentCollaborations.map((request) => <article key={request.id} className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center"><div><h3 className="font-black text-foreground">{request.project.title}</h3><p className="mt-1 text-sm text-foreground/55">Owner: {request.owner.name} · {request.type.replace("_", " ")}</p><p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/65">{request.proposal}</p>{request.note && <p className="mt-2 text-sm text-foreground/65">Owner note: {request.note}</p>}</div><span className="w-fit rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700">{request.status}</span></article>)}{sentCollaborations.length === 0 && <p className="p-10 text-center text-sm text-foreground/45">No outgoing collaboration requests.</p>}</div></section></>}</div>;
}
