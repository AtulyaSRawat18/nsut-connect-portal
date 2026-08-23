"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Loader2, MessageSquareText, Send } from "lucide-react";
import ForumReportButton from "../ForumReportButton";

export type DiscussionReply = {
  id?: string;
  authorId?: string;
  authorName: string;
  authorRole: string;
  content: string;
  score: number;
  createdAt?: string;
};

type JsonResult = { message?: string; score?: number; vote?: number; reply?: Record<string, unknown> };

async function postJson(url: string, body: object) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const result = (await response.json().catch(() => ({}))) as JsonResult;
  if (!response.ok) throw new Error(response.status === 401 ? "Sign in to participate in this discussion." : result.message || "The request could not be completed.");
  return result;
}

function VoteControl({ score: initialScore, endpoint, disabled = false }: { score: number; endpoint: string; disabled?: boolean }) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function cast(value: -1 | 1) {
    if (disabled || pending) return;
    setPending(true);
    setMessage("");
    try {
      const result = await postJson(endpoint, { value });
      setScore(Number(result.score || 0));
      setVote(Number(result.vote || 0));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Voting is unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button type="button" onClick={() => cast(1)} aria-label="Upvote" disabled={disabled || pending} className={"rounded p-1.5 transition " + (vote === 1 ? "bg-primary text-white" : "hover:bg-primary/10 hover:text-primary")}><ArrowUp className="h-5 w-5" /></button>
      <span className="min-w-8 text-center text-sm font-black">{score}</span>
      <button type="button" onClick={() => cast(-1)} aria-label="Downvote" disabled={disabled || pending} className={"rounded p-1.5 transition " + (vote === -1 ? "bg-secondary text-white" : "hover:bg-secondary/10 hover:text-secondary")}><ArrowDown className="h-5 w-5" /></button>
      {pending && <Loader2 className="h-3 w-3 animate-spin" />}
      {message && <span className="sr-only" role="status">{message}</span>}
    </div>
  );
}

export default function ForumDiscussion({ postId, initialScore, initialReplies, reportable = true }: { postId: string; initialScore: number; initialReplies: DiscussionReply[]; reportable?: boolean }) {
  const [replies, setReplies] = useState(initialReplies);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await postJson("/api/forum/posts/" + postId + "/replies", { content });
      const reply = result.reply || {};
      setReplies((current) => [
        ...current,
        {
          id: String(reply.id),
          authorId: reply.author_id ? String(reply.author_id) : undefined,
          authorName: String(reply.authorName || "NSUT member"),
          authorRole: String(reply.authorRole || "member"),
          content: String(reply.content || content),
          score: Number(reply.score || 0),
          createdAt: String(reply.created_at || new Date().toISOString()),
        },
      ]);
      setContent("");
      setMessage("Reply posted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Replying is unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <aside className="mt-8 flex items-center gap-4 rounded-xl border border-outline bg-surface p-4">
        <VoteControl score={initialScore} endpoint={"/api/forum/posts/" + postId + "/vote"} />
        <div><p className="text-xs font-black uppercase tracking-widest text-foreground/45">Community assessment</p><p className="mt-1 text-sm text-foreground/65">Upvote useful, evidence-based questions; downvote content that does not move the discussion forward.</p></div>
        {reportable && <div className="ml-auto"><ForumReportButton entityType="forum_post" entityId={postId} /></div>}
      </aside>

      <section className="mt-10">
        <div className="flex items-center gap-3"><MessageSquareText className="h-6 w-6 text-primary" /><h2 className="text-2xl font-black">Discussion</h2><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">{replies.length}</span></div>
        <form onSubmit={submitReply} className="mt-6 rounded-xl border border-outline bg-surface p-5">
          <label htmlFor="forum-reply" className="text-xs font-black uppercase tracking-widest text-foreground/55">Reply on this page</label>
          <textarea id="forum-reply" value={content} onChange={(event) => setContent(event.target.value)} minLength={2} maxLength={5000} required placeholder="Add evidence, a method, a clarification, or a constructive follow-up?" className="mt-3 min-h-28 w-full resize-y rounded-lg border border-outline bg-background p-4 text-sm leading-6 outline-none focus:border-primary" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className={"text-xs " + (message.includes("Sign in") || message.includes("unavailable") ? "text-red-600" : "text-foreground/50")} role="status">{message || "Your NSUT Connect profile name and role will be shown with this reply."}</p>
            <button disabled={pending || content.trim().length < 2} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-45">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post reply</button>
          </div>
        </form>
        <div className="mt-7 space-y-5">
          {replies.map((reply, index) => (
            <article key={reply.id || reply.authorName + "-" + index} className="grid grid-cols-[2.5rem_1fr] gap-4 rounded-xl border border-outline bg-surface p-5 md:p-7">
              <VoteControl score={reply.score} endpoint={reply.id ? "/api/forum/replies/" + reply.id + "/vote" : ""} disabled={!reply.id} />
              <div>
                <div className="flex flex-wrap items-center gap-3">{reply.authorId ? <Link href={`/profile/${reply.authorId}`} className="font-black hover:text-primary hover:underline">{reply.authorName}</Link> : <span className="font-black">{reply.authorName}</span>}<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">{reply.authorRole}</span>{reply.createdAt && <time className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{new Date(reply.createdAt).toLocaleDateString()}</time>}{reply.id && <div className="ml-auto"><ForumReportButton entityType="forum_reply" entityId={reply.id} /></div>}</div>
                <p className="mt-4 whitespace-pre-wrap leading-7 text-foreground/70">{reply.content}</p>
              </div>
            </article>
          ))}
          {replies.length === 0 && <div className="rounded-xl border border-dashed border-outline p-10 text-center text-sm text-foreground/45">No replies yet. Start the discussion above.</div>}
        </div>
        <p className="mt-6 text-xs leading-6 text-foreground/45">Be specific, cite sources where possible, and do not post personal or confidential information. <Link href="/terms" className="font-bold text-primary hover:underline">Community terms</Link> apply.</p>
      </section>
    </>
  );
}
