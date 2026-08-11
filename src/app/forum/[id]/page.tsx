import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { getShowcaseForumPost } from "@/content/showcase";
import ResearchBackdrop from "@/components/shared/ResearchBackdrop";
import ForumDiscussion, { type DiscussionReply } from "./ForumDiscussion";
import { createPublicClient } from "@/utils/supabase/public";

type LivePost = { id: string; title: string; content: string; department: string; upvotes: number | null; created_at: string; author_id: string; profiles: { full_name: string; role: string } | { full_name: string; role: string }[] | null };
type LiveReply = { id: string; author_id: string; content: string; score: number; created_at: string };

export default async function ForumDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const showcase = getShowcaseForumPost(id);
  const supabase = createPublicClient();
  const [postResult, replyResult] = await Promise.all([
    supabase.from("forum_posts").select("id, title, content, department, upvotes, created_at, author_id, profiles!forum_posts_author_id_fkey(full_name, role)").eq("id", id).maybeSingle(),
    supabase.from("forum_replies").select("id, author_id, content, score, created_at").eq("post_id", id).order("created_at"),
  ]);
  const livePost = postResult.data as LivePost | null;
  if (!livePost && !showcase) notFound();

  const liveReplies = (replyResult.data || []) as LiveReply[];
  const authorIds = Array.from(new Set(liveReplies.map((reply) => reply.author_id)));
  const profileResult = authorIds.length
    ? await supabase.from("profiles").select("id, full_name, role").in("id", authorIds)
    : { data: [] as { id: string; full_name: string; role: string }[] };
  const profiles = new Map((profileResult.data || []).map((profile) => [profile.id, profile]));
  const replies: DiscussionReply[] = liveReplies.length
    ? liveReplies.map((reply) => ({
        id: reply.id,
        authorId: reply.author_id,
        authorName: profiles.get(reply.author_id)?.full_name || "Account unavailable",
        authorRole: profiles.get(reply.author_id)?.role || "member",
        content: reply.content,
        score: reply.score,
        createdAt: reply.created_at,
      }))
    : (showcase?.replies || []).map((reply) => ({
        authorName: reply.author,
        authorRole: reply.role,
        content: reply.content,
        score: 0,
      }));
  const post = livePost || {
    id,
    title: showcase!.title,
    content: showcase!.content,
    department: showcase!.department,
    upvotes: showcase!.upvotes,
    created_at: "",
    author_id: "",
    profiles: null,
  };
  const postAuthor = livePost ? (Array.isArray(livePost.profiles) ? livePost.profiles[0] : livePost.profiles) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7ef] px-6 py-16 text-foreground dark:bg-background">
      <ResearchBackdrop compact />
      <article className="relative mx-auto max-w-4xl">
        <Link href="/forum" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><ArrowLeft className="h-4 w-4" /> Academic forum</Link>
        <header className="mt-10 rounded-2xl border border-outline bg-background/90 p-7 shadow-sm backdrop-blur-sm md:p-10">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest">
            <span className="rounded bg-primary/10 px-3 py-1 text-primary">{post.department}</span>
            {post.created_at && <time className="text-foreground/45">{new Date(post.created_at).toLocaleDateString()}</time>}
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground/60"><User className="h-4 w-4" /> {livePost ? <Link href={`/profile/${livePost.author_id}`} className="hover:text-primary hover:underline">{postAuthor?.full_name || "Account unavailable"}</Link> : "NSUT Connect showcase contributor"}{postAuthor?.role && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-primary">{postAuthor.role}</span>}</p>
          <p className="mt-5 text-lg leading-8 text-foreground/70">{post.content}</p>
        </header>
        <ForumDiscussion postId={post.id} initialScore={post.upvotes || 0} initialReplies={replies} reportable={Boolean(livePost)} />
      </article>
    </div>
  );
}
