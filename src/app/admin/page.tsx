import Link from "next/link";
import { AlertTriangle, Clock3, History, ShieldCheck, UserCheck, Users } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import WorkspaceStatCard from "@/components/workspace/WorkspaceStatCard";
import AdminContentPublisher from "./AdminContentPublisher";

export default async function AdminPanel() {
  await requirePageIdentity({ roles: ["admin"], permissions: ["user.read", "report.read", "faculty.verify", "audit.read"] });
  const supabase = await createClient();
  const [users, pendingUsers, reports, verifications, audit] = await Promise.all([
    supabase.from("portal_users").select("id", { count: "exact", head: true }),
    supabase.from("portal_users").select("id", { count: "exact", head: true }).eq("account_status", "pending"),
    supabase.from("content_reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
    supabase.from("faculty_verification_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "reviewing"]),
    supabase.from("admin_audit_log").select("id, action, target_user_id, created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  return <div className="space-y-10">
    <header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Administration · moderation · verification</p><h1 className="text-4xl font-black tracking-tight text-foreground">Administrative overview</h1><p className="mt-3 max-w-3xl text-foreground/55">One accountable prototype role supervises accounts, resolves reports, verifies faculty, publishes essential content, and reviews immutable activity history.</p></header>
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><WorkspaceStatCard label="Portal users" value={users.count || 0} detail="All accounts" icon={<Users className="h-5 w-5" />} /><WorkspaceStatCard label="Pending accounts" value={pendingUsers.count || 0} detail="Approval" icon={<Clock3 className="h-5 w-5" />} /><WorkspaceStatCard label="Open reports" value={reports.count || 0} detail="Moderation" icon={<AlertTriangle className="h-5 w-5" />} /><WorkspaceStatCard label="Faculty reviews" value={verifications.count || 0} detail="Verification" icon={<UserCheck className="h-5 w-5" />} /></section>
    <section className="grid gap-5 md:grid-cols-3">{[
      { href: "/admin/users", title: "Account supervision", text: "Approve, suspend, reactivate, and assign normalized roles.", icon: Users },
      { href: "/admin/reports", title: "Forum moderation", text: "Resolve reports and soft-hide or remove inappropriate posts.", icon: ShieldCheck },
      { href: "/admin/faculty-verification", title: "Faculty verification", text: "Review institutional evidence before faculty privileges activate.", icon: UserCheck },
    ].map((item) => <Link key={item.href} href={item.href} className="group rounded-2xl border border-outline bg-surface p-6 transition-all hover:border-primary/50 hover:shadow-lg"><item.icon className="h-6 w-6 text-primary" /><h2 className="mt-5 text-lg font-black text-foreground group-hover:text-primary">{item.title}</h2><p className="mt-2 text-sm leading-6 text-foreground/55">{item.text}</p></Link>)}</section>
    <AdminContentPublisher />
    <section className="rounded-2xl border border-outline bg-surface p-6 md:p-8"><div className="mb-6 flex items-center gap-3"><History className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black text-foreground">Administrative history</h2><p className="text-sm text-foreground/50">Append-only privileged account actions. Audit records cannot be deleted from this interface.</p></div></div><div className="divide-y divide-outline">{(audit.data || []).map((entry) => <div key={entry.id} className="grid gap-2 py-4 text-sm md:grid-cols-[1fr_14rem]"><div><p className="font-bold capitalize text-foreground">{entry.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-foreground/40">Target reference: {entry.target_user_id || "platform"}</p></div><time className="text-xs text-foreground/45 md:text-right">{new Date(entry.created_at).toLocaleString()}</time></div>)}{(audit.data || []).length === 0 && <p className="py-10 text-center text-sm text-foreground/45">No administrative actions have been recorded yet.</p>}</div></section>
  </div>;
}
