import Link from "next/link";
import { CheckCircle, Filter, MessageSquare, Search, User } from "lucide-react";
import Pagination from "@/components/shared/Pagination";
import ResearchBackdrop from "@/components/shared/ResearchBackdrop";
import { getPublicForumPosts } from "@/lib/public-data";
import ForumQuickActions from "./ForumQuickActions";

const departments = ["all", "CSE", "ECE", "IT", "MAC", "ICE", "MECH", "CIVIL", "BT", "BBA"] as const;

export default async function Forum({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; department?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const department = departments.includes(params?.department as (typeof departments)[number]) ? params?.department || "all" : "all";
  const result = await getPublicForumPosts({ q, department, page: Number(params?.page || 1) });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7ef] py-16 font-sans dark:bg-background">
      <ResearchBackdrop compact />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-primary">Ask · assess · improve</p>
            <h1 className="text-5xl font-black tracking-tight text-foreground">Academic Forum</h1>
            <p className="mt-4 max-w-2xl text-lg font-medium text-foreground/70">Vote on useful research questions and reply with evidence, methods, or constructive technical guidance—without leaving the forum feed.</p>
          </div>
          <Link href="/dashboard/faculty/forum" className="rounded bg-primary px-7 py-4 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg">Faculty publishing desk</Link>
        </div>

        <form className="mb-10 grid gap-3 rounded-2xl border border-outline bg-surface/95 p-4 shadow-sm backdrop-blur-sm md:grid-cols-[1fr_13rem_auto]">
          <label className="relative"><Search className="absolute left-3 top-3.5 h-5 w-5 text-foreground/45" /><input name="q" defaultValue={q} placeholder="Search discussions" className="w-full rounded-lg border border-outline bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" /></label>
          <select name="department" defaultValue={department} aria-label="Filter by department" className="rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">
            {departments.map((item) => <option key={item} value={item}>{item === "all" ? "All departments" : item}</option>)}
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-widest text-background"><Filter className="h-4 w-4" /> Filter</button>
        </form>

        {result.error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center text-red-600">Forum discussions are temporarily unavailable.</div>
        ) : result.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline bg-background/70 p-16 text-center text-foreground/50">No discussions match the selected filters.</div>
        ) : (
          <div className="lazy-card-list space-y-5">
            {result.data.map((post) => {
              const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
              return (
                <article key={post.id} className="group rounded-2xl border border-outline bg-surface/95 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-primary/50 md:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">{post.department}</span>
                    {author?.role === "faculty" && <span className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white"><CheckCircle className="h-3 w-3" /> Faculty verified</span>}
                    <time className="ml-auto text-[10px] font-bold uppercase tracking-widest text-foreground/50">{new Date(post.created_at).toLocaleDateString()}</time>
                  </div>
                  <h2 className="text-xl font-black text-foreground transition-colors group-hover:text-primary md:text-2xl"><Link href={`/forum/${post.id}`}>{post.title}</Link></h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/70">{post.content}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-6 text-xs font-bold text-foreground/50">
                    <span className="flex items-center gap-2"><User className="h-4 w-4" /> {author?.full_name || "NSUT member"}</span>
                    <Link href={`/forum/${post.id}`} className="flex items-center gap-2 text-primary"><MessageSquare className="h-4 w-4" /> Full discussion</Link>
                  </div>
                  <ForumQuickActions postId={post.id} initialScore={post.upvotes || 0} />
                </article>
              );
            })}
            <Pagination basePath="/forum" currentPage={result.page} pageSize={result.pageSize} searchParams={{ q, department }} totalCount={result.count} />
          </div>
        )}
      </div>
    </div>
  );
}
