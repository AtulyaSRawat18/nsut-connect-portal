"use client";

import { FormEvent, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, MessageSquareReply, Send, X } from "lucide-react";
import ForumReportButton from "./ForumReportButton";

type ForumResponse = { message?: string; score?: number; vote?: number };

async function postJson(url: string, body: object) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => ({}))) as ForumResponse;
  if (!response.ok) {
    throw new Error(response.status === 401 ? "Sign in to participate." : result.message || "The request could not be completed.");
  }
  return result;
}

export default function ForumQuickActions({ postId, initialScore }: { postId: string; initialScore: number }) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState(0);
  const [replyOpen, setReplyOpen] = useState(false);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState<"vote" | "reply" | null>(null);
  const [message, setMessage] = useState("");

  async function cast(value: -1 | 1) {
    if (pending) return;
    setPending("vote");
    setMessage("");
    try {
      const result = await postJson(`/api/forum/posts/${postId}/vote`, { value });
      setScore(Number(result.score || 0));
      setVote(Number(result.vote || 0));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Voting is unavailable.");
    } finally {
      setPending(null);
    }
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending("reply");
    setMessage("");
    try {
      await postJson(`/api/forum/posts/${postId}/replies`, { content });
      setContent("");
      setReplyOpen(false);
      setMessage("Reply posted. Open the full discussion to view it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Replying is unavailable.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-5 border-t border-outline pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => cast(1)} disabled={Boolean(pending)} aria-label="Upvote discussion" aria-pressed={vote === 1} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-black ${vote === 1 ? "border-primary bg-primary text-white" : "border-outline hover:border-primary hover:text-primary"}`}><ArrowUp className="h-4 w-4" /> {score}</button>
        <button type="button" onClick={() => cast(-1)} disabled={Boolean(pending)} aria-label="Downvote discussion" aria-pressed={vote === -1} className={`rounded-lg border p-2 ${vote === -1 ? "border-secondary bg-secondary text-white" : "border-outline hover:border-secondary hover:text-secondary"}`}><ArrowDown className="h-4 w-4" /></button>
        <button type="button" onClick={() => { setReplyOpen((open) => !open); setMessage(""); }} className="inline-flex items-center gap-2 rounded-lg border border-outline px-3 py-2 text-xs font-black hover:border-primary hover:text-primary"><MessageSquareReply className="h-4 w-4" /> Reply here</button>
        <ForumReportButton entityType="forum_post" entityId={postId} />
        {pending === "vote" && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Saving vote" />}
      </div>

      {replyOpen && (
        <form onSubmit={submitReply} className="mt-4 rounded-xl bg-background p-4">
          <div className="flex items-center justify-between gap-3"><label htmlFor={`quick-reply-${postId}`} className="text-[10px] font-black uppercase tracking-widest text-foreground/55">Reply to this discussion</label><button type="button" onClick={() => setReplyOpen(false)} aria-label="Close reply form" className="rounded p-1 text-foreground/45 hover:bg-foreground/5"><X className="h-4 w-4" /></button></div>
          <textarea id={`quick-reply-${postId}`} value={content} onChange={(event) => setContent(event.target.value)} minLength={2} maxLength={5000} required className="mt-3 min-h-24 w-full rounded-lg border border-outline bg-surface p-3 text-sm leading-6 outline-none focus:border-primary" placeholder="Add evidence, a method, or a constructive follow-up." />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-[10px] font-semibold text-foreground/45">Your profile name and role will be shown.</p><button disabled={pending === "reply" || content.trim().length < 2} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-45">{pending === "reply" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post reply</button></div>
        </form>
      )}
      {message && <p role="status" className={`mt-3 text-xs ${message.startsWith("Reply posted") ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>{message}</p>}
    </div>
  );
}
