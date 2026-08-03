import { Filter } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import AdminReportActions from "./AdminReportActions";

const statuses = ["all", "open", "reviewing", "resolved", "dismissed"] as const;

export default async function AdminReportsPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  await requirePageIdentity({ roles: ["admin"], permissions: ["report.read", "report.resolve", "content.moderate"] });
  const params = await searchParams;
  const status = statuses.includes(params?.status as (typeof statuses)[number]) ? params?.status || "all" : "all";
  const supabase = await createClient();
  let query = supabase.from("content_reports").select("id, entity_type, entity_id, category, summary, evidence, priority, status, resolution_note, created_at, portal_users!content_reports_reporter_id_fkey(name, email)").order("created_at", { ascending: true }).limit(100);
  if (status !== "all") query = query.eq("status", status);
  const { data: reports, error } = await query;

  return <div className="space-y-8">
    <header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Moderation and resolution</p><h1 className="text-4xl font-black text-foreground">Forum and content reports</h1><p className="mt-3 max-w-2xl text-foreground/55">Resolve or dismiss reports, and soft-hide or soft-remove reported forum posts. No action permanently deletes content or audit history.</p></header>
    <form className="flex flex-col gap-3 rounded-2xl border border-outline bg-surface p-4 sm:flex-row"><select name="status" defaultValue={status} className="flex-1 rounded-lg border border-outline bg-background px-4 py-3 text-sm"><option value="all">All report statuses</option><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" />Filter</button></form>
    {error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Moderation reports are temporarily unavailable.</div> : <section className="space-y-4">{(reports || []).map((report) => { const reporter = Array.isArray(report.portal_users) ? report.portal_users[0] : report.portal_users; const pending = report.status === "open" || report.status === "reviewing"; return <article key={report.id} className="rounded-2xl border border-outline bg-surface p-6"><div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{report.entity_type.replaceAll("_", " ")}</span><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${report.priority === "urgent" ? "bg-red-500/10 text-red-500" : "bg-foreground/5 text-foreground/50"}`}>{report.priority}</span><span className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] font-bold uppercase text-foreground/50">{report.status}</span></div><h2 className="text-lg font-black capitalize text-foreground">{report.category.replaceAll("_", " ")}</h2></div>{pending && <AdminReportActions reportId={report.id} canModeratePost={report.entity_type === "forum_post"} />}</div><p className="mb-5 leading-relaxed text-foreground/70">{report.summary}</p>{report.resolution_note && <p className="mb-5 rounded-lg border border-outline bg-background p-4 text-sm text-foreground/60"><strong>Decision note:</strong> {report.resolution_note}</p>}<div className="grid gap-2 border-t border-outline pt-4 text-xs text-foreground/45 md:grid-cols-3"><span>Reporter: {reporter?.name || "Member"}</span><span>Target reference: {report.entity_id}</span><span>{new Date(report.created_at).toLocaleString()}</span></div></article>; })}{(reports || []).length === 0 && <div className="rounded-2xl border border-dashed border-outline p-16 text-center text-foreground/45">No reports match this filter.</div>}</section>}
  </div>;
}
