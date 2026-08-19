"use client";

import { FormEvent, useState } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEPARTMENTS, getDepartmentLabel } from "@/lib/departments";
import { isApplicationFormReference } from "@/lib/application-forms";

type EditableProject = {
  id: string;
  title: string;
  description: string;
  department: string;
  status: string;
  max_students: number;
  available_seats: number;
  brief_url: string | null;
  application_form_url: string | null;
  progress_percent: number | null;
  health_status: string | null;
  progress_note: string | null;
};

export default function ProjectEditForm({ project }: { project: EditableProject }) {
  const router = useRouter();
  const acceptedStudents = Math.max(project.max_students - project.available_seats, 0);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [department, setDepartment] = useState(project.department);
  const [status, setStatus] = useState(project.status);
  const [capacity, setCapacity] = useState(project.max_students);
  const [availableSeats, setAvailableSeats] = useState(project.available_seats);
  const [material, setMaterial] = useState(project.brief_url || "NA");
  const [questionnaire, setQuestionnaire] = useState(project.application_form_url || "NA");
  const [progress, setProgress] = useState(project.progress_percent || 0);
  const [health, setHealth] = useState(project.health_status || "on_track");
  const [note, setNote] = useState(project.progress_note || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaved(false);
    if (!isApplicationFormReference(questionnaire.trim())) {
      setMessage("Use a Google Forms URL, an approved demo form, or NA for the questionnaire.");
      return;
    }
    if (capacity < Math.max(acceptedStudents, 1)) {
      setMessage(`Capacity cannot be below ${acceptedStudents} accepted student${acceptedStudents === 1 ? "" : "s"}.`);
      return;
    }
    if (note.trim().length > 0 && note.trim().length < 10) {
      setMessage("An assessment note must contain at least 10 characters or be left unchanged and empty.");
      return;
    }

    setPending(true);
    const response = await fetch(`/api/faculty/projects/${project.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        department,
        status,
        maxStudents: capacity,
        briefReference: material,
        applicationFormUrl: questionnaire,
        progressPercent: progress,
        healthStatus: health,
        ...(note.trim() ? { progressNote: note } : {}),
      }),
    });
    const result = await response.json().catch(() => ({})) as { message?: string; project?: { available_seats?: number } };
    setPending(false);
    if (!response.ok) {
      setMessage(result.message || "The project could not be updated.");
      return;
    }
    if (typeof result.project?.available_seats === "number") setAvailableSeats(result.project.available_seats);
    setSaved(true);
    setMessage("Project listing updated successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="grid gap-7 rounded-2xl border border-outline bg-surface p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Project title
          <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={5} maxLength={180} className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary" />
        </label>
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Department
          <select value={department} onChange={(event) => setDepartment(event.target.value)} required className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-primary">{DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}</select>
        </label>
      </div>

      <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Public project description
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={20} maxLength={8000} className="mt-2 min-h-44 w-full rounded border border-outline bg-background p-4 text-sm normal-case leading-6 tracking-normal text-foreground outline-none focus:border-primary" />
      </label>

      <div className="grid gap-6 md:grid-cols-3">
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Listing status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground"><option value="open">Open</option><option value="closed">Closed</option></select>
        </label>
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Student capacity
          <input type="number" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} required min={Math.max(acceptedStudents, 1)} max={50} className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground" />
        </label>
        <div className="rounded border border-outline bg-background p-4 text-xs leading-5 text-foreground/60"><strong className="block font-black uppercase tracking-widest text-foreground">Seat accounting</strong><span className="mt-2 block">{acceptedStudents} accepted · {availableSeats} currently available. Lowering capacity below accepted students is blocked by the database.</span></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Project PDF / material reference
          <input value={material} onChange={(event) => setMaterial(event.target.value)} required minLength={1} maxLength={700} placeholder="HTTPS/portal PDF, document reference, descriptive text, or NA" className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground" />
          {(material.startsWith("https://") || material.startsWith("/")) && <a href={material} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><ExternalLink className="h-3.5 w-3.5" /> Open current material</a>}
        </label>
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Application Google Form / questionnaire
          <input value={questionnaire} onChange={(event) => setQuestionnaire(event.target.value)} required minLength={1} maxLength={700} placeholder="https://forms.gle/... or NA" className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground" />
          {questionnaire !== "NA" && isApplicationFormReference(questionnaire) && <a href={questionnaire} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><ExternalLink className="h-3.5 w-3.5" /> Open current questionnaire</a>}
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_14rem]">
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Progress: {progress}%
          <input type="range" value={progress} onChange={(event) => setProgress(Number(event.target.value))} min={0} max={100} className="mt-4 w-full accent-primary" />
        </label>
        <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Project health
          <select value={health} onChange={(event) => setHealth(event.target.value)} className="mt-2 w-full rounded border border-outline bg-background px-4 py-3 text-sm normal-case tracking-normal text-foreground"><option value="on_track">On track</option><option value="at_risk">At risk</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select>
        </label>
      </div>

      <label className="text-xs font-black uppercase tracking-widest text-foreground/65">Assessment note
        <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Evidence completed, next milestone, risk and owner." className="mt-2 min-h-24 w-full rounded border border-outline bg-background p-4 text-sm normal-case leading-6 tracking-normal text-foreground" />
      </label>

      <div className="flex flex-col items-start justify-between gap-4 border-t border-outline pt-6 sm:flex-row sm:items-center">
        <p role="status" className={`text-sm font-bold ${saved ? "text-green-700" : "text-red-600"}`}>{message}</p>
        <button disabled={pending} className="inline-flex items-center gap-2 rounded bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-on-primary disabled:opacity-50">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save all changes</button>
      </div>
    </form>
  );
}
