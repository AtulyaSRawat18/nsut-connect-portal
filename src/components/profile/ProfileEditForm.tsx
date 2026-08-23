"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DEPARTMENTS, getDepartmentLabel, isDepartmentId, normalizeDepartmentId } from "@/lib/departments";

const optionalLink = z.string().trim().refine(
  (value) => !value || value === "NA" || value.startsWith("/") || /^https:\/\/\S+$/i.test(value),
  "Use an HTTPS link, portal-local path, or NA",
);

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  department: z.string().refine(isDepartmentId, "Select a department"),
  designation: z.string().max(100),
  research_area: z.string().max(300),
  roll_number: z.string().max(30),
  course: z.string().max(80),
  year: z.string().refine((value) => !value || (/^[1-8]$/.test(value)), "Year must be between 1 and 8"),
  bio: z.string().max(3000),
  education: z.string().max(3000),
  contact_email: z.string().trim().refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email"),
  website_url: optionalLink,
  github_url: optionalLink,
  linkedin_url: optionalLink,
  cv_url: optionalLink,
  office_location: z.string().max(200),
  office_hours: z.string().max(300),
  scholar_url: optionalLink,
  orcid: z.string().max(40),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export type EditableProfile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role: "student" | "faculty";
  department?: string | null;
  designation?: string | null;
  research_area?: string | null;
  roll_number?: string | null;
  course?: string | null;
  year?: number | null;
  bio?: string | null;
  education?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  cv_url?: string | null;
  office_location?: string | null;
  office_hours?: string | null;
  scholar_url?: string | null;
  orcid?: string | null;
  verification_status?: string | null;
};

const fieldClass = "w-full rounded border border-outline bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";
const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-foreground/50";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className={labelClass}>{label}</span>{children}{error && <span className="mt-1 block text-[10px] font-semibold text-red-500">{error}</span>}</label>;
}

export default function ProfileEditForm({
  profile,
  onCancel,
  onUpdate,
  completionMode = false,
}: {
  profile: EditableProfile;
  onCancel?: () => void;
  onUpdate: () => void;
  completionMode?: boolean;
}) {
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || "",
      department: normalizeDepartmentId(profile.department) || "",
      designation: profile.designation || "",
      research_area: profile.research_area || "",
      roll_number: profile.roll_number || "",
      course: profile.course || "",
      year: profile.year?.toString() || "",
      bio: profile.bio || "",
      education: profile.education || "",
      contact_email: profile.contact_email || "",
      website_url: profile.website_url || "",
      github_url: profile.github_url || "",
      linkedin_url: profile.linkedin_url || "",
      cv_url: profile.cv_url || "",
      office_location: profile.office_location || "",
      office_hours: profile.office_hours || "",
      scholar_url: profile.scholar_url || "",
      orcid: profile.orcid || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setServerError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setServerError(result.message || "Your profile could not be saved");
      return;
    }
    onUpdate();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 rounded-xl border border-outline bg-surface p-6 shadow-sm md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="text-xl font-black text-foreground">{completionMode ? "Build your profile" : "Edit profile details"}</h2><p className="mt-1 text-sm text-foreground/55">Everything below can be updated later. Your institutional sign-in email and account role stay protected.</p></div>
        {onCancel && <button type="button" aria-label="Close profile editor" onClick={onCancel} className="rounded p-1 text-foreground/50 hover:bg-foreground/5 hover:text-foreground"><X size={20} /></button>}
      </div>

      <section>
        <h3 className="mb-4 border-b border-outline pb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">Identity and academics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}><input {...register("name")} className={fieldClass} /></Field>
          <Field label="Department" error={errors.department?.message}><select {...register("department")} className={fieldClass}><option value="">Select department</option>{DEPARTMENTS.map((item) => <option key={item.id} value={item.id}>{getDepartmentLabel(item.id)}</option>)}</select></Field>
          {profile.role === "faculty" ? <>
            <Field label="Designation" error={errors.designation?.message}><input {...register("designation")} className={fieldClass} placeholder="Assistant Professor" /></Field>
            <Field label="Research area" error={errors.research_area?.message}><input {...register("research_area")} className={fieldClass} placeholder="Machine learning, power systems…" /></Field>
          </> : <>
            <Field label="Roll number" error={errors.roll_number?.message}><input {...register("roll_number")} className={fieldClass} placeholder="2025UCA1877" /></Field>
            <div className="grid grid-cols-2 gap-4"><Field label="Course" error={errors.course?.message}><input {...register("course")} className={fieldClass} placeholder="B.Tech" /></Field><Field label="Year" error={errors.year?.message}><input {...register("year")} type="number" min={1} max={8} className={fieldClass} /></Field></div>
          </>}
        </div>
      </section>

      <section>
        <h3 className="mb-4 border-b border-outline pb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">Biography and education</h3>
        <div className="space-y-4">
          <Field label="Biography" error={errors.bio?.message}><textarea {...register("bio")} className={`${fieldClass} min-h-28 resize-y`} placeholder="Introduce your interests, work, and goals." /></Field>
          <Field label="Education" error={errors.education?.message}><textarea {...register("education")} className={`${fieldClass} min-h-24 resize-y`} placeholder="Degrees, institutions, specialisations, and relevant study." /></Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 border-b border-outline pb-2 text-xs font-black uppercase tracking-[0.2em] text-primary">Contact, links, and CV</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Public contact email" error={errors.contact_email?.message}><input type="email" {...register("contact_email")} className={fieldClass} placeholder={profile.email || undefined} /></Field>
          <Field label="Website" error={errors.website_url?.message}><input {...register("website_url")} className={fieldClass} placeholder="https://…" /></Field>
          <Field label="GitHub" error={errors.github_url?.message}><input {...register("github_url")} className={fieldClass} placeholder="https://github.com/…" /></Field>
          <Field label="LinkedIn" error={errors.linkedin_url?.message}><input {...register("linkedin_url")} className={fieldClass} placeholder="https://linkedin.com/in/…" /></Field>
          <div className="md:col-span-2"><Field label="CV / résumé reference" error={errors.cv_url?.message}><input {...register("cv_url")} className={fieldClass} placeholder="HTTPS or portal link; use NA if unavailable" /></Field></div>
          {profile.role === "faculty" && <>
            <Field label="Office location" error={errors.office_location?.message}><input {...register("office_location")} className={fieldClass} /></Field>
            <Field label="Office hours" error={errors.office_hours?.message}><input {...register("office_hours")} className={fieldClass} placeholder="Tuesday 2–4 PM" /></Field>
            <Field label="Google Scholar" error={errors.scholar_url?.message}><input {...register("scholar_url")} className={fieldClass} placeholder="https://scholar.google.com/…" /></Field>
            <Field label="ORCID" error={errors.orcid?.message}><input {...register("orcid")} className={fieldClass} placeholder="0000-0000-0000-0000" /></Field>
          </>}
        </div>
      </section>

      {serverError && <p role="alert" className="rounded border border-red-500/30 bg-red-500/5 p-3 text-sm font-semibold text-red-600">{serverError}</p>}
      <div className="flex justify-end gap-3 border-t border-outline pt-5">
        {onCancel && <button type="button" onClick={onCancel} className="rounded px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-outline/20">Cancel</button>}
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-on-primary hover:brightness-110 disabled:opacity-50">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}{completionMode ? "Save profile and continue" : "Save changes"}</button>
      </div>
    </form>
  );
}
