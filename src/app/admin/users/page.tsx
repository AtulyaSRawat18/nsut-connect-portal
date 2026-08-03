import { Filter, Search, Users } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { createClient } from "@/utils/supabase/server";
import UserManagementActions from "./UserManagementActions";

const statuses = ["all", "pending", "active", "suspended"] as const;
type UserRow = { id: string; name: string; email: string; role: string; account_status: string; created_at: string };

export default async function AdminUsersPage({ searchParams }: { searchParams?: Promise<{ q?: string; status?: string }> }) {
  const identity = await requirePageIdentity({ roles: ["admin"], permissions: ["user.read", "user.suspend", "role.manage"] });
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const status = statuses.includes(params?.status as (typeof statuses)[number]) ? params?.status || "all" : "all";
  const supabase = await createClient();
  let userQuery = supabase.from("portal_users").select("id, name, email, role, account_status, created_at").order("created_at", { ascending: false }).limit(200);
  if (status !== "all") userQuery = userQuery.eq("account_status", status);
  const [usersResult, rolesResult] = await Promise.all([userQuery, supabase.from("user_roles").select("user_id, role_key")]);
  const rolesByUser = new Map<string, string[]>();
  for (const assignment of rolesResult.data || []) rolesByUser.set(assignment.user_id, [...(rolesByUser.get(assignment.user_id) || []), assignment.role_key]);
  const users = ((usersResult.data || []) as UserRow[]).filter((user) => !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q));

  return <div className="space-y-8">
    <header><p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Account supervision</p><h1 className="text-4xl font-black text-foreground">Users and roles</h1><p className="mt-3 max-w-2xl text-foreground/55">Approve, suspend, reactivate, and add normalized student, faculty, moderator, or admin assignments. Passwords and authentication secrets are never available here.</p></header>
    <form className="grid gap-3 rounded-2xl border border-outline bg-surface p-4 md:grid-cols-[1fr_13rem_auto]"><label className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-foreground/40" /><input name="q" defaultValue={params?.q || ""} placeholder="Name or institutional email" className="w-full rounded-lg border border-outline bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" /></label><select name="status" defaultValue={status} className="rounded-lg border border-outline bg-background px-4 py-3 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="active">Active</option><option value="suspended">Suspended</option></select><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" />Filter</button></form>
    {usersResult.error || rolesResult.error ? <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">User administration is temporarily unavailable.</div> : <section className="grid gap-5 xl:grid-cols-2">{users.map((user) => { const roles = Array.from(new Set([user.role, ...(rolesByUser.get(user.id) || [])])); return <article key={user.id} className="rounded-2xl border border-outline bg-surface p-6"><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-black text-foreground">{user.name}</h2><p className="truncate text-sm text-foreground/50">{user.email}</p><div className="mt-3 flex flex-wrap gap-2">{roles.map((role) => <span key={role} className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-foreground/60">{role}</span>)}<span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${user.account_status === "active" ? "bg-green-500/10 text-green-700" : user.account_status === "suspended" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-700"}`}>{user.account_status}</span></div></div></div><UserManagementActions userId={user.id} status={user.account_status} roles={roles} isSelf={identity.id === user.id} /></article>; })}{users.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-outline p-16 text-center text-foreground/45">No users match these filters.</div>}</section>}
  </div>;
}
