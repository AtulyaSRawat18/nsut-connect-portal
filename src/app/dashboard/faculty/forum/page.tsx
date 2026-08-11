import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { requirePageIdentity } from "@/lib/auth/server";
import { DEPARTMENTS, getDepartmentLabel, isDepartmentId } from "@/lib/departments";
import { createClient } from "@/utils/supabase/server";
import ForumPostForm from "./ForumPostForm";

type ForumPostRow = {
  id: string;
  title: string;
  content: string;
  department: string;
  upvotes: number | null;
  created_at: string;
};

export default async function FacultyForumPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; department?: string }>;
}) {
  const identity = await requirePageIdentity({ roles: ["faculty", "admin"] });
  const params = await searchParams;
  const q = (params?.q || "").trim().toLowerCase();
  const department = isDepartmentId(params?.department) ? params.department : "all";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_posts")
    .select("id, title, content, department, upvotes, created_at")
    .eq("author_id", identity.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const posts = ((data || []) as ForumPostRow[]).filter((post) => {
    const matchesQuery = !q || post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q);
    const matchesDepartment = department === "all" || post.department === department;
    return matchesQuery && matchesDepartment;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Community publishing</p>
          <h1 className="text-4xl font-black text-foreground">My forum posts</h1>
          <p className="mt-3 text-foreground/55">Start academic discussions and review posts published under your identity.</p>
        </div>
        <Link href="/forum" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View public forum</Link>
      </header>

      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <ForumPostForm />

        <section className="space-y-5">
          <form className="grid gap-3 rounded-2xl border border-outline bg-surface p-4 sm:grid-cols-[1fr_12rem_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-foreground/40" />
              <input
                name="q"
                defaultValue={params?.q || ""}
                placeholder="Search my posts"
                className="w-full rounded-lg border border-outline bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </label>
            <select
              name="department"
              defaultValue={department}
              className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">All departments</option>
              {DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}
            </select>
            <button className="rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background">Filter</button>
          </form>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-sm text-red-600">
              Forum posts could not be loaded. Try again shortly.
            </div>
          )}

          {!error && posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-outline bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">{getDepartmentLabel(post.department)}</span>
                <span className="text-xs text-foreground/45">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className="mt-4 text-xl font-black text-foreground">{post.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/60">{post.content}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-outline pt-4 text-xs text-foreground/45">
                <MessageSquare className="h-4 w-4" /> {post.upvotes || 0} upvotes
              </div>
            </article>
          ))}

          {!error && posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline p-14 text-center text-foreground/45">
              No forum posts match these filters.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
