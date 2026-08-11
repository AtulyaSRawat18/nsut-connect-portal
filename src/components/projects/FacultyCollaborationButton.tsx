"use client";

import { useState } from "react";
import { Handshake, Loader2, X } from "lucide-react";

const collaborationTypes = [
  ["research", "Research collaboration"], ["methodology", "Methodology"], ["facilities", "Facilities / laboratory"],
  ["data", "Data or infrastructure"], ["co_supervision", "Co-supervision"], ["publication", "Publication"], ["other", "Other"],
] as const;

export function FacultyCollaborationButton({ projectId, isClosed }: { projectId: string; isClosed: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<(typeof collaborationTypes)[number][0]>("research");
  const [proposal, setProposal] = useState("");
  const [expertise, setExpertise] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/collaboration-requests`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collaborationType: type, proposal, expertiseSummary: expertise }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.message || "The collaboration request could not be submitted"); return; }
      setSuccess(true);
    } catch {
      setError("Collaboration requests are temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }

  if (isClosed) return <button disabled className="block w-full cursor-not-allowed rounded bg-outline py-4 text-sm font-bold uppercase tracking-widest text-foreground/50">Collaboration closed</button>;
  return <>
    <button onClick={() => { setOpen(true); setSuccess(false); }} className="flex w-full items-center justify-center gap-2 rounded bg-primary py-4 text-sm font-bold uppercase tracking-widest text-on-primary hover:brightness-110"><Handshake className="h-4 w-4" /> Request faculty collaboration</button>
    <p className="mt-3 text-xs leading-5 text-foreground/55">Faculty collaboration is independent of student vacancies and never occupies a seat.</p>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-outline bg-surface p-7 shadow-2xl md:p-9"><button onClick={() => setOpen(false)} aria-label="Close collaboration form" className="absolute right-5 top-5 rounded-full p-2 text-foreground/50 hover:bg-foreground/5"><X className="h-5 w-5" /></button>{success ? <div className="py-8 text-center"><Handshake className="mx-auto h-10 w-10 text-primary" /><h3 className="mt-4 text-2xl font-black">Collaboration request sent</h3><p className="mt-3 text-sm text-foreground/60">The project owner will review it in the faculty collaboration queue.</p><button onClick={() => setOpen(false)} className="mt-6 rounded bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background">Close</button></div> : <><p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Faculty-to-faculty workflow</p><h3 className="mt-2 text-3xl font-black">Propose collaboration</h3><form onSubmit={submit} className="mt-7 space-y-5"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Collaboration type</span><select value={type} onChange={(event) => setType(event.target.value as typeof type)} className="w-full rounded border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary">{collaborationTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Collaboration proposal</span><textarea required minLength={80} maxLength={3000} value={proposal} onChange={(event) => setProposal(event.target.value)} className="h-40 w-full rounded border border-outline bg-background p-4 text-sm outline-none focus:border-primary" placeholder="Describe scope, responsibilities, outputs and expected research value." /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest">Expertise and resources offered</span><textarea required minLength={40} maxLength={1200} value={expertise} onChange={(event) => setExpertise(event.target.value)} className="h-28 w-full rounded border border-outline bg-background p-4 text-sm outline-none focus:border-primary" /></label>{error && <p role="alert" className="rounded border border-red-500/30 bg-red-500/5 p-3 text-sm font-bold text-red-600">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded bg-primary py-4 text-sm font-bold uppercase tracking-widest text-on-primary disabled:opacity-50">{loading && <Loader2 className="h-4 w-4 animate-spin" />} Send collaboration request</button></form></>}</div></div>}
  </>;
}
