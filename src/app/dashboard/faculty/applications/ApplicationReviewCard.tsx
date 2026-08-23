"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Clock3, ExternalLink, FileText, Loader2, X } from "lucide-react";

export type FacultyApplication = {
  id: string;
  statement_of_purpose: string;
  skills_summary: string | null;
  availability_hours: number | null;
  resume_url: string | null;
  google_form_response_url: string | null;
  faculty_note: string | null;
  reviewed_at: string | null;
  status: string;
  applied_at: string;
  student_id: string;
  projects: { id: string; title: string } | { id: string; title: string }[];
  portal_users: { name: string; email: string } | { name: string; email: string }[];
};

export function ApplicationReviewCard({ application }: { application: FacultyApplication }) {
  const [loadingAction, setLoadingAction] = useState<"accepted" | "rejected" | null>(null);
  const [reviewNote, setReviewNote] = useState(application.faculty_note || "");
  const [errorText, setErrorText] = useState("");
  const router = useRouter();
  const project = Array.isArray(application.projects) ? application.projects[0] : application.projects;
  const student = Array.isArray(application.portal_users) ? application.portal_users[0] : application.portal_users;
  const linkedResume = Boolean(application.resume_url && (application.resume_url.startsWith("https://") || application.resume_url.startsWith("/")));

  const handleAction = async (status: "accepted" | "rejected") => {
    setLoadingAction(status);
    setErrorText("");
    try {
      const response = await fetch(`/api/faculty/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: reviewNote.trim() || undefined }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setErrorText(body.message || "Unable to review this application");
        return;
      }
      router.refresh();
    } catch {
      setErrorText("Application review is temporarily unavailable");
    } finally {
      setLoadingAction(null);
    }
  };

  const statusClass = application.status === "pending" ? "bg-amber-500/15 text-amber-700" : application.status === "accepted" ? "bg-green-500/15 text-green-700" : "bg-red-500/15 text-red-700";

  return (
    <article className="rounded-2xl border border-outline bg-surface p-6 shadow-sm md:p-7">
      <div className="flex flex-col justify-between gap-4 border-b border-outline pb-5 md:flex-row md:items-start">
        <div><h2 className="text-xl font-black text-foreground">{student.name}</h2><p className="mt-1 text-sm text-foreground/50">{student.email}</p><p className="mt-2 text-xs font-semibold text-foreground/40">Applied {new Date(application.applied_at).toLocaleString()}</p></div>
        <div className="md:text-right"><p className="text-[10px] font-black uppercase tracking-widest text-primary">Project</p><Link href={`/projects/${project.id}`} className="mt-1 block max-w-md font-bold text-foreground hover:text-primary hover:underline">{project.title}</Link><span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass}`}>{application.status}</span></div>
      </div>

      <div className="grid gap-5 py-6 xl:grid-cols-[1.3fr_.7fr]">
        <div className="space-y-5">
          <section className="rounded-xl border border-outline bg-background p-5"><h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Statement of purpose</h3><p className="whitespace-pre-wrap text-sm leading-6 text-foreground/75">{application.statement_of_purpose}</p></section>
          <section className="rounded-xl border border-outline bg-background p-5"><h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/45">Relevant skills and evidence</h3><p className="whitespace-pre-wrap text-sm leading-6 text-foreground/75">{application.skills_summary || "Not supplied in this legacy application."}</p></section>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-outline bg-background p-5"><div className="flex items-center gap-2 text-foreground/45"><Clock3 className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-widest">Availability</span></div><p className="mt-3 text-2xl font-black text-foreground">{application.availability_hours ? `${application.availability_hours} hrs/week` : "Not supplied"}</p></div>
          {linkedResume ? <a href={application.resume_url!} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/5 p-5 text-sm font-black text-primary hover:bg-primary/10"><span className="flex items-center gap-3"><FileText className="h-5 w-5" /> Open CV / résumé</span><ExternalLink className="h-4 w-4" /></a> : <div className="rounded-xl border border-outline bg-background p-4 text-xs font-semibold text-foreground/65">CV / résumé: {application.resume_url || "Not supplied"}</div>}
          {application.google_form_response_url && application.google_form_response_url !== "NA" ? <a href={application.google_form_response_url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-blue-500/25 bg-blue-500/5 p-5 text-sm font-black text-blue-700 hover:bg-blue-500/10"><span>Open questionnaire evidence</span><ExternalLink className="h-4 w-4" /></a> : <div className="rounded-xl border border-outline bg-background p-4 text-xs font-semibold text-foreground/60">No separate questionnaire was assigned to this application.</div>}
        </aside>
      </div>

      <div className="border-t border-outline pt-5">
        <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-foreground/45">Faculty decision note</span><textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={1000} placeholder="Record selection reasoning or required follow-up. A note is compulsory for rejection." className="h-24 w-full resize-y rounded-lg border border-outline bg-background p-3 text-sm outline-none focus:border-primary" /></label>
        {errorText && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{errorText}</p>}
        {application.status === "pending" ? <div className="mt-4 flex flex-wrap justify-end gap-3"><button onClick={() => handleAction("rejected")} disabled={loadingAction !== null} className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-500/5 disabled:opacity-50">{loadingAction === "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}Reject</button><button onClick={() => handleAction("accepted")} disabled={loadingAction !== null} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-primary hover:brightness-110 disabled:opacity-50">{loadingAction === "accepted" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Accept</button></div> : application.reviewed_at && <p className="mt-3 text-right text-xs font-semibold text-foreground/45">Reviewed {new Date(application.reviewed_at).toLocaleString()}</p>}
      </div>
    </article>
  );
}
