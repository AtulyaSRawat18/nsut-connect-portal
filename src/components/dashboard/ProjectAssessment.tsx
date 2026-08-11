"use client";

import { FormEvent, useState } from "react";
import { FileText, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectAssessment({
  projectId,
  briefUrl,
  initialProgress,
  initialHealth,
  initialNote,
}: {
  projectId: string;
  briefUrl: string | null;
  initialProgress: number;
  initialHealth: string;
  initialNote: string | null;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [health, setHealth] = useState(initialHealth);
  const [note, setNote] = useState(initialNote || "");
  const [materialReference, setMaterialReference] = useState(briefUrl || "NA");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const linkedBrief = materialReference.startsWith("https://") || materialReference.startsWith("/");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const response = await fetch("/api/faculty/projects/" + projectId, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ progressPercent: progress, healthStatus: health, progressNote: note, briefReference: materialReference }),
    });
    const result = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setMessage(result.message || "Assessment could not be saved.");
      return;
    }
    setMessage("Assessment saved.");
    router.refresh();
  }

  return (
    <div className="mt-5 border-t border-outline pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-48 flex-1">
          <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest"><span>Research progress</span><span>{progress}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-foreground/10"><div className="h-full bg-primary transition-all" style={{ width: progress + "%" }} /></div>
        </div>
        {linkedBrief ? <a href={materialReference} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:underline"><FileText className="h-4 w-4" /> Project material</a> : <span className="max-w-64 truncate text-xs font-bold text-foreground/55">Material: {materialReference}</span>}
      </div>
      <form onSubmit={save} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <label className="text-xs font-bold text-foreground/55">Progress percent
            <input type="range" min={0} max={100} value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="mt-2 w-full accent-primary" />
          </label>
          <label className="text-xs font-bold text-foreground/55">Health
            <select value={health} onChange={(event) => setHealth(event.target.value)} className="mt-2 w-full rounded border border-outline bg-background px-3 py-2 text-sm text-foreground">
              <option value="on_track">On track</option>
              <option value="at_risk">At risk</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <label className="text-xs font-bold text-foreground/55">Assessment note
          <textarea value={note} onChange={(event) => setNote(event.target.value)} minLength={10} maxLength={1000} required className="mt-2 min-h-20 w-full rounded border border-outline bg-background p-3 text-sm text-foreground" placeholder="State the evidence completed, next milestone, risk and owner." />
        </label>
        <label className="text-xs font-bold text-foreground/55">Project material / reference
          <input value={materialReference} onChange={(event) => setMaterialReference(event.target.value)} minLength={1} maxLength={700} required className="mt-2 w-full rounded border border-outline bg-background px-3 py-2 text-sm text-foreground" placeholder="Drive/Docs/Word/PDF link, notes, or NA" />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className={"text-xs " + (message.includes("saved") ? "text-green-600" : "text-red-600")} role="status">{message}</span>
          <button disabled={pending || note.trim().length < 10} className="inline-flex items-center gap-2 rounded bg-foreground px-4 py-2 text-[10px] font-black uppercase tracking-widest text-background disabled:opacity-40">{pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save assessment</button>
        </div>
      </form>
    </div>
  );
}
