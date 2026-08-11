"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, HandHeart, Handshake, Loader2, X } from "lucide-react";

export type FacultyProjectRequest = {
  id: string;
  kind: "contribution" | "collaboration";
  status: string;
  createdAt: string;
  project: { id: string; title: string };
  requester: { id: string; name: string; email: string };
  primaryText: string;
  secondaryText: string;
  metadata: string;
  reviewNote: string | null;
};

export function RequestReviewCard({ request }: { request: FacultyProjectRequest }) {
  const [note, setNote] = useState(request.reviewNote || "");
  const [loading, setLoading] = useState<"accepted" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const isContribution = request.kind === "contribution";

  async function review(status: "accepted" | "rejected") {
    setLoading(status);
    setError("");
    try {
      const endpoint = isContribution ? "contribution-requests" : "collaboration-requests";
      const response = await fetch(`/api/faculty/${endpoint}/${request.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, note: note.trim() || undefined }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.message || "The request could not be reviewed"); return; }
      router.refresh();
    } catch {
      setError("Request review is temporarily unavailable");
    } finally {
      setLoading(null);
    }
  }

  return <article className={`rounded-2xl border bg-surface p-6 ${isContribution ? "border-amber-500/30" : "border-blue-500/30"}`}>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isContribution ? "bg-amber-500/10 text-amber-700" : "bg-blue-500/10 text-blue-700"}`}>{isContribution ? <HandHeart className="h-3.5 w-3.5" /> : <Handshake className="h-3.5 w-3.5" />}{isContribution ? "Student contribution" : "Faculty collaboration"}</span><h2 className="mt-3 text-xl font-black text-foreground">{request.project.title}</h2><p className="mt-1 text-sm font-semibold text-foreground/65">{request.requester.name} · {request.requester.email}</p></div><span className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/55">{request.status}</span></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2"><section className="rounded-xl border border-outline bg-background p-4"><h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/45">{isContribution ? "Proposed contribution" : "Collaboration proposal"}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/70">{request.primaryText}</p></section><section className="rounded-xl border border-outline bg-background p-4"><h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/45">{isContribution ? "Skills" : "Expertise offered"}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/70">{request.secondaryText}</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">{request.metadata}</p></section></div>
    <label className="mt-5 block"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground/45">Owner decision note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} disabled={request.status !== "pending"} className="h-24 w-full rounded border border-outline bg-background p-3 text-sm outline-none focus:border-primary disabled:opacity-60" placeholder="Required when rejecting; optional when accepting." /></label>
    {error && <p role="alert" className="mt-3 rounded border border-red-500/30 bg-red-500/5 p-3 text-sm font-bold text-red-600">{error}</p>}
    {request.status === "pending" && <div className="mt-4 flex flex-wrap gap-3"><button onClick={() => review("accepted")} disabled={Boolean(loading)} className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50">{loading === "accepted" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept</button><button onClick={() => review("rejected")} disabled={Boolean(loading)} className="inline-flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50">{loading === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Reject</button></div>}
  </article>;
}
