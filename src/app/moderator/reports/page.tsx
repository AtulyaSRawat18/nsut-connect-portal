import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import ReportActions from "./ReportActions";

export default async function ModeratorReportsPage() {
  await requirePageIdentity({ permissions: ["report.read", "report.resolve"] });
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("content_reports")
    .select("id, entity_type, entity_id, category, summary, evidence, priority, status, created_at, portal_users!content_reports_reporter_id_fkey(name, email)")
    .in("status", ["open", "reviewing"])
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Moderation</p>
        <h1 className="text-4xl font-black text-foreground">Content reports</h1>
        <p className="mt-3 text-foreground/55">Oldest unresolved reports are shown first.</p>
      </header>

      <section className="space-y-4">
        {(reports || []).map((report) => {
          const reporter = Array.isArray(report.portal_users) ? report.portal_users[0] : report.portal_users;
          return (
            <article key={report.id} className="rounded-2xl border border-outline bg-surface p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{report.entity_type.replaceAll("_", " ")}</span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${report.priority === "urgent" ? "bg-red-500/10 text-red-500" : "bg-foreground/5 text-foreground/50"}`}>{report.priority}</span>
                  </div>
                  <h2 className="text-lg font-black capitalize text-foreground">{report.category.replaceAll("_", " ")}</h2>
                </div>
                <ReportActions reportId={report.id} />
              </div>
              <p className="mb-5 leading-relaxed text-foreground/70">{report.summary}</p>
              <div className="grid gap-2 border-t border-outline pt-4 text-xs text-foreground/45 md:grid-cols-3">
                <span>Reporter: {reporter?.name || "Member"}</span>
                <span>Target: {report.entity_id}</span>
                <span>{new Date(report.created_at).toLocaleString()}</span>
              </div>
            </article>
          );
        })}
        {(reports || []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline p-16 text-center text-foreground/45">No unresolved reports.</div>
        )}
      </section>
    </div>
  );
}
