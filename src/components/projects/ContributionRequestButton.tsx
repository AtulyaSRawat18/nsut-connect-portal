"use client";

import { useState } from "react";
import { HandHeart, Loader2, X } from "lucide-react";

export function ContributionRequestButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [statement, setStatement] = useState("");
  const [skills, setSkills] = useState("");
  const [hours, setHours] = useState("6");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/contribution-requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contributionStatement: statement, skillsSummary: skills, availabilityHours: Number(hours) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.message || "The contribution request could not be submitted"); return; }
      setSuccess(true);
    } catch {
      setError("Contribution requests are temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button onClick={() => { setOpen(true); setSuccess(false); }} className="flex w-full items-center justify-center gap-2 rounded bg-secondary py-4 text-sm font-bold uppercase tracking-widest text-secondary-foreground transition-colors hover:brightness-110"><HandHeart className="h-4 w-4" /> Request to contribute</button>
    <p className="mt-3 text-xs leading-5 text-foreground/55">All student seats are filled. This request proposes a non-seat contribution and does not change project capacity.</p>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-outline bg-surface p-7 shadow-2xl md:p-9"><button onClick={() => setOpen(false)} aria-label="Close contribution form" className="absolute right-5 top-5 rounded-full p-2 text-foreground/50 hover:bg-foreground/5"><X className="h-5 w-5" /></button>{success ? <div className="py-8 text-center"><HandHeart className="mx-auto h-10 w-10 text-primary" /><h3 className="mt-4 text-2xl font-black">Contribution request sent</h3><p className="mt-3 text-sm leading-6 text-foreground/60">The faculty owner will review it separately from seat applications.</p><button onClick={() => setOpen(false)} className="mt-6 rounded bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background">Close</button></div> : <><p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Non-seat student pathway</p><h3 className="mt-2 text-3xl font-black">Request to contribute</h3><p className="mt-3 text-sm leading-6 text-foreground/60">Explain a bounded contribution you can make without occupying a student vacancy.</p><form onSubmit={submit} className="mt-7 space-y-5"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Proposed contribution</span><textarea required minLength={80} maxLength={2500} value={statement} onChange={(event) => setStatement(event.target.value)} className="h-36 w-full rounded border border-outline bg-background p-4 text-sm outline-none focus:border-primary" placeholder="Describe the task, output and how it supports the existing team." /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Relevant skills and evidence</span><textarea required minLength={40} maxLength={1200} value={skills} onChange={(event) => setSkills(event.target.value)} className="h-28 w-full rounded border border-outline bg-background p-4 text-sm outline-none focus:border-primary" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Weekly availability</span><input required type="number" min={1} max={40} value={hours} onChange={(event) => setHours(event.target.value)} className="w-full rounded border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" /></label>{error && <p role="alert" className="rounded border border-red-500/30 bg-red-500/5 p-3 text-sm font-bold text-red-600">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-primary py-4 text-sm font-bold uppercase tracking-widest text-on-primary disabled:opacity-50">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Send contribution request</button></form></>}</div></div>}
  </>;
}
