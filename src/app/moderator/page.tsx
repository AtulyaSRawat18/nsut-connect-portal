import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, UserCheck } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import WorkspaceStatCard from "@/components/workspace/WorkspaceStatCard";

export default async function ModeratorDashboard() {
  await requirePageIdentity({ permissions: ["report.read", "faculty.verify"] });
  const supabase = await createClient();
  const [openReports, urgentReports, pendingFaculty, resolvedReports, recentReports] =
    await Promise.all([
      supabase.from("content_reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
      supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("priority", "urgent").in("status", ["open", "reviewing"]),
      supabase.from("faculty_verification_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "reviewing"]),
      supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "resolved"),
      supabase
        .from("content_reports")
        .select("id, entity_type, category, summary, priority, status, created_at")
        .in("status", ["open", "reviewing"])
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Trust and safety</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Moderation overview</h1>
        <p className="mt-3 max-w-2xl text-foreground/55">
          Review institutional identity requests and keep community content safe with traceable decisions.
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard label="Open reports" value={openReports.count || 0} detail="Live" icon={<AlertTriangle className="h-5 w-5" />} />
        <WorkspaceStatCard label="Urgent reports" value={urgentReports.count || 0} detail="Priority" icon={<Clock3 className="h-5 w-5" />} />
        <WorkspaceStatCard label="Faculty reviews" value={pendingFaculty.count || 0} detail="Pending" icon={<UserCheck className="h-5 w-5" />} />
        <WorkspaceStatCard label="Reports resolved" value={resolvedReports.count || 0} detail="All time" icon={<CheckCircle2 className="h-5 w-5" />} />
      </section>

      <section className="rounded-2xl border border-outline bg-surface p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground">Latest reports</h2>
            <p className="text-sm text-foreground/50">Newest unresolved items across the platform.</p>
          </div>
          <Link href="/moderator/reports" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            Open queue
          </Link>
        </div>
        <div className="divide-y divide-outline">
          {(recentReports.data || []).map((report) => (
            <Link key={report.id} href="/moderator/reports" className="grid gap-3 py-5 transition-colors hover:bg-foreground/[0.02] md:grid-cols-[8rem_9rem_1fr_6rem] md:items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">{report.entity_type.replaceAll("_", " ")}</span>
              <span className="text-xs font-semibold text-primary">{report.category.replaceAll("_", " ")}</span>
              <span className="line-clamp-1 text-sm text-foreground">{report.summary}</span>
              <span className={`w-fit rounded-full px-2 py-1 text-[10px] font-bold uppercase ${report.priority === "urgent" ? "bg-red-500/10 text-red-500" : "bg-foreground/5 text-foreground/50"}`}>
                {report.priority}
              </span>
            </Link>
          ))}
          {(recentReports.data || []).length === 0 && (
            <p className="py-10 text-center text-sm text-foreground/45">The moderation queue is clear.</p>
          )}
        </div>
      </section>
    </div>
  );
}
