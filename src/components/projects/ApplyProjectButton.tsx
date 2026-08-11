"use client";

import { useState } from "react";
import { ExternalLink, FileText, Loader2, X } from "lucide-react";

type ApplicationDraft = {
  statementOfPurpose: string;
  skillsSummary: string;
  availabilityHours: string;
  resumeUrl: string;
  googleFormResponseUrl: string;
};

const emptyDraft: ApplicationDraft = {
  statementOfPurpose: "",
  skillsSummary: "",
  availabilityHours: "8",
  resumeUrl: "",
  googleFormResponseUrl: "",
};

export function ApplyProjectButton({ projectId, availableSeats, isClosed }: { projectId: string; availableSeats: number; isClosed: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [confirmedForm, setConfirmedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  const setField = (field: keyof ApplicationDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorText("");
    try {
      const response = await fetch(`/api/projects/${projectId}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, availabilityHours: Number(draft.availabilityHours) }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setErrorText(body.message || "The application could not be submitted");
        return;
      }
      setSuccess(true);
      setDraft(emptyDraft);
      setConfirmedForm(false);
    } catch {
      setErrorText("Applications are temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  if (isClosed) {
    return <button disabled className="block w-full cursor-not-allowed rounded bg-outline py-4 text-sm font-bold uppercase tracking-widest text-foreground/50">Project Closed</button>;
  }

  return (
    <>
      <button onClick={() => { setIsOpen(true); setSuccess(false); }} className="block w-full rounded bg-primary py-4 text-sm font-bold uppercase tracking-widest text-on-primary transition-colors hover:brightness-110">
        Apply now ({availableSeats} {availableSeats === 1 ? "seat" : "seats"} left)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-outline bg-surface shadow-2xl">
            <button onClick={() => setIsOpen(false)} aria-label="Close application form" className="absolute right-5 top-5 z-10 rounded-full p-2 text-foreground/50 hover:bg-foreground/5 hover:text-foreground"><X className="h-5 w-5" /></button>
            <div className="border-b border-outline p-7 pr-16 md:p-9 md:pr-20">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">Structured student application</p>
              <h3 className="text-3xl font-black text-foreground">Apply to this project</h3>
              <p className="mt-3 text-sm leading-6 text-foreground/60">Faculty reviewers will see every field below together. Share academic evidence only—never passwords, access tokens, private IDs, or unrelated personal data.</p>
            </div>

            {success ? (
              <div className="p-9 text-center">
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 font-bold text-green-700">Application submitted. Track its decision from My Applications.</div>
                <button onClick={() => setIsOpen(false)} className="mt-6 rounded-lg bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest text-background">Close</button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-6 p-7 md:p-9">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-foreground/65">Statement of purpose *</span>
                  <textarea value={draft.statementOfPurpose} onChange={(event) => setField("statementOfPurpose", event.target.value)} required minLength={100} maxLength={3000} placeholder="Explain your motivation, the problem you want to work on, and the contribution you can make." className="h-44 w-full resize-y rounded-lg border border-outline bg-background p-4 text-sm leading-6 outline-none focus:border-primary" />
                  <span className="mt-1 block text-right text-[10px] font-bold uppercase tracking-wider text-foreground/40">{draft.statementOfPurpose.length} / 3000</span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-foreground/65">Relevant skills and evidence *</span>
                  <textarea value={draft.skillsSummary} onChange={(event) => setField("skillsSummary", event.target.value)} required minLength={40} maxLength={1200} placeholder="List methods, tools, courses, projects, or laboratory experience relevant to this work." className="h-28 w-full resize-y rounded-lg border border-outline bg-background p-4 text-sm leading-6 outline-none focus:border-primary" />
                </label>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-foreground/65">Weekly availability *</span>
                    <div className="relative"><input type="number" min={1} max={40} required value={draft.availabilityHours} onChange={(event) => setField("availabilityHours", event.target.value)} className="w-full rounded-lg border border-outline bg-background px-4 py-3 pr-20 text-sm outline-none focus:border-primary" /><span className="absolute right-4 top-3 text-xs font-semibold text-foreground/45">hours</span></div>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-foreground/65">CV / résumé reference *</span>
                    <input type="text" required value={draft.resumeUrl} onChange={(event) => setField("resumeUrl", event.target.value)} placeholder="Drive/Docs/Word/PDF link, text, or NA" className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <div className="mb-3 flex items-start gap-3"><ExternalLink className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" /><div><h4 className="font-black text-foreground">Google Form evidence</h4><p className="mt-1 text-xs leading-5 text-foreground/55">Complete the project questionnaire supplied by the faculty lead, then paste its Google Forms response or questionnaire link.</p></div></div>
                  <input type="url" required value={draft.googleFormResponseUrl} onChange={(event) => setField("googleFormResponseUrl", event.target.value)} placeholder="https://docs.google.com/forms/..." className="w-full rounded-lg border border-outline bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                  <label className="mt-4 flex items-start gap-3 text-xs font-semibold text-foreground/65"><input type="checkbox" required checked={confirmedForm} onChange={(event) => setConfirmedForm(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />I confirm the linked questionnaire is relevant to this application and can be opened by the faculty reviewer.</label>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-outline bg-background p-4 text-xs text-foreground/55"><FileText className="h-5 w-5 shrink-0 text-primary" />Your CV and application are visible only to you and the faculty owner under database access policies.</div>
                {errorText && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm font-bold text-red-600">{errorText}</p>}
                <button type="submit" disabled={loading || !confirmedForm} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-sm font-bold uppercase tracking-widest text-on-primary hover:brightness-110 disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit complete application"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
