"use client";

import { BadgeCheck, BookOpen, Briefcase, Code2, ContactRound, Edit3, ExternalLink, FileText, Globe, GraduationCap, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfileEditForm, { type EditableProfile } from "./ProfileEditForm";
import { getDepartmentCompactLabel } from "@/lib/departments";

const isLink = (value: unknown): value is string => typeof value === "string" && (value.startsWith("https://") || value.startsWith("/"));

type ProfileProject = { id: string; title: string; status: string };

export default function ProfileWrapper({ profile, projects, isOwner }: { profile: EditableProfile; projects: ProfileProject[]; isOwner: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const displayName = profile.name || "Anonymous user";
  const contactEmail = profile.contact_email || profile.email;
  const links = [
    { label: "Website", value: profile.website_url, icon: Globe },
    { label: "GitHub", value: profile.github_url, icon: Code2 },
    { label: "LinkedIn", value: profile.linkedin_url, icon: ContactRound },
    { label: "Google Scholar", value: profile.scholar_url, icon: GraduationCap },
  ].filter((item) => isLink(item.value));

  if (isEditing) {
    return <div className="min-h-screen bg-surface py-16"><div className="mx-auto max-w-4xl px-6"><ProfileEditForm profile={profile} onCancel={() => setIsEditing(false)} onUpdate={() => { setIsEditing(false); router.refresh(); }} /></div></div>;
  }

  return (
    <div className="min-h-screen bg-surface py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-48 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />
        <div className="-mt-16 mb-12 rounded-b-2xl border border-outline bg-background px-8 pb-12 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-outline pb-8 md:flex-row md:items-end">
            <div className="-mt-12 flex flex-col items-center gap-6 md:flex-row md:items-end">
              <div className="h-32 w-32 flex-shrink-0 rounded-full border-2 border-outline-variant bg-background p-2 shadow-lg"><div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary/20 text-4xl font-bold text-primary">{displayName.charAt(0).toUpperCase()}</div></div>
              <div className="mb-2 text-center md:text-left"><div className="flex items-center justify-center gap-2 md:justify-start"><h1 className="text-3xl font-bold text-foreground">{displayName}</h1>{profile.verification_status === "approved" && <BadgeCheck className="h-6 w-6 text-blue-500" />}</div><p className="mt-2 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-foreground/70 md:justify-start"><Briefcase className="h-4 w-4" /> {profile.designation || profile.role} · {getDepartmentCompactLabel(profile.department)}</p></div>
            </div>
            {isOwner && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-lg border border-outline bg-surface px-6 py-2 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-outline/30"><Edit3 className="h-4 w-4" /> Edit profile</button>}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3">
            <aside className="space-y-8 md:col-span-1">
              <section><h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground/50">Contact & links</h2><div className="space-y-4">
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 break-all text-sm text-foreground/80 hover:text-primary"><Mail className="h-4 w-4 shrink-0 text-primary" /> {contactEmail}</a>
                {(profile.roll_number || profile.office_location) && <div className="flex items-center gap-3 text-sm text-foreground/80">{profile.office_location ? <MapPin className="h-4 w-4 shrink-0 text-primary" /> : <Briefcase className="h-4 w-4 shrink-0 text-primary" />}{profile.office_location || profile.roll_number}</div>}
                {profile.office_hours && <div className="text-sm leading-6 text-foreground/70">Office hours: {profile.office_hours}</div>}
                {links.map(({ label, value, icon: Icon }) => <a key={label} href={value as string} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-foreground/80 hover:text-primary"><Icon className="h-4 w-4 shrink-0 text-primary" /> {label}<ExternalLink className="h-3 w-3" /></a>)}
              </div></section>
              {profile.research_area && <section><h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-foreground/50">Research area</h2><p className="text-sm text-foreground/80">{profile.research_area}</p></section>}
              {profile.orcid && <section><h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-foreground/50">ORCID</h2><p className="text-sm text-foreground/80">{profile.orcid}</p></section>}
            </aside>

            <main className="space-y-12 md:col-span-2">
              <section><h2 className="mb-4 text-xl font-bold text-foreground">Biography</h2><p className="whitespace-pre-wrap leading-relaxed text-foreground/80">{profile.bio || `This ${profile.role} has not added a biography yet.`}</p>{profile.cv_url && profile.cv_url !== "NA" && (isLink(profile.cv_url) ? <a href={profile.cv_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"><FileText className="h-4 w-4" /> Open CV / résumé</a> : <p className="mt-4 text-sm text-foreground/60">CV / résumé: {profile.cv_url}</p>)}</section>
              <section><h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground"><GraduationCap className="h-5 w-5 text-primary" /> Education</h2><p className="whitespace-pre-wrap leading-relaxed text-foreground/80">{profile.education || "No education details have been added."}</p></section>
              <section><h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground"><BookOpen className="h-5 w-5 text-primary" />{profile.role === "faculty" ? "Supervised projects" : "Project activity"}</h2><div className="space-y-4">{projects.length > 0 ? projects.map((project) => project && <div key={project.id} className="flex items-center justify-between rounded-lg border border-outline bg-surface p-6"><div><h3 className="font-bold text-foreground">{project.title}</h3><span className="mt-1 block text-xs font-bold uppercase tracking-widest text-foreground/50">Status: {project.status}</span></div><Link href={`/projects/${project.id}`} className="rounded border border-outline p-2 hover:bg-primary hover:text-white">View</Link></div>) : <div className="py-4 italic text-foreground/50">No public projects available.</div>}</div></section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
