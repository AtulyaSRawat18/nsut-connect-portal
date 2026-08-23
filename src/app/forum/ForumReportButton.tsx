"use client";

import { FormEvent, useState } from "react";
import { Flag, Loader2, X } from "lucide-react";

const categories = [
  ["spam", "Spam"],
  ["harassment", "Harassment"],
  ["misinformation", "Misinformation"],
  ["privacy", "Privacy concern"],
  ["academic_integrity", "Academic integrity"],
  ["other", "Other"],
] as const;

export default function ForumReportButton({ entityType, entityId }: { entityType: "forum_post" | "forum_reply"; entityId: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof categories)[number][0]>("spam");
  const [summary, setSummary] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/forum/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entityType, entityId, category, summary }),
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in to report content." : result.message || "The report could not be submitted.");
      setSummary("");
      setMessage("Report sent to the moderator queue.");
      setOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reporting is unavailable.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => { setOpen((value) => !value); setMessage(""); }} className="inline-flex items-center gap-1.5 rounded-lg border border-outline px-3 py-2 text-xs font-black text-foreground/60 hover:border-red-500/50 hover:text-red-600">
        <Flag className="h-4 w-4" /> Report
      </button>
      {open && (
        <form onSubmit={submit} className="mt-3 w-full max-w-md rounded-xl border border-outline bg-background p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-widest">Report identified forum content</p><button type="button" onClick={() => setOpen(false)} aria-label="Close report form" className="rounded p-1 text-foreground/45 hover:bg-foreground/5"><X className="h-4 w-4" /></button></div>
          <label className="mt-4 block text-[10px] font-black uppercase tracking-widest text-foreground/50">Reason<select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-2 w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm font-medium normal-case tracking-normal"><option disabled value="">Choose a reason</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="mt-3 block text-[10px] font-black uppercase tracking-widest text-foreground/50">Details<textarea value={summary} onChange={(event) => setSummary(event.target.value)} minLength={10} maxLength={500} required placeholder="Explain what the moderator should review." className="mt-2 min-h-24 w-full resize-y rounded-lg border border-outline bg-surface p-3 text-sm font-medium leading-6 normal-case tracking-normal" /></label>
          <div className="mt-3 flex justify-end"><button disabled={pending || summary.trim().length < 10} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-45">{pending && <Loader2 className="h-4 w-4 animate-spin" />} Send report</button></div>
        </form>
      )}
      {message && <p role="status" className={`mt-2 text-xs ${message.startsWith("Report sent") ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>{message}</p>}
    </div>
  );
}
