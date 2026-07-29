"use client";

import { useState } from "react";
import { BadgeCheck, MapPin, Globe, Mail, Briefcase, BookOpen, Edit3, Link as LinkIcon, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileEditForm from "./ProfileEditForm";

export default function ProfileWrapper({ profile, projects, isOwner }: { profile: any, projects: any[], isOwner: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  if (isEditing) {
    return (
      <div className="min-h-screen bg-surface font-sans py-16">
        <div className="max-w-3xl mx-auto px-6">
          <ProfileEditForm
            profile={profile}
            onCancel={() => setIsEditing(false)}
            onUpdate={() => {
              setIsEditing(false);
              router.refresh();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans py-16">
      <div className="max-w-5xl mx-auto px-6">

        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-primary to-secondary rounded-t-2xl"></div>

        {/* Profile Details Container */}
        <div className="bg-background border border-outline rounded-b-2xl shadow-sm -mt-16 px-8 pb-12 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12">
              <div className="w-32 h-32 bg-background p-2 rounded-full border-2 border-outline-variant shadow-lg flex-shrink-0">
                <div className="w-full h-full rounded-full bg-primary/20 flex flex-col items-center justify-center text-4xl text-primary font-bold overflow-hidden">
                  {profile.full_name?.charAt(0) || profile.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="text-center md:text-left mb-2">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-3xl font-display font-bold text-foreground">{profile.full_name || profile.name || 'Anonymous User'}</h1>
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-foreground/70 font-medium uppercase tracking-widest text-xs mt-2 flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-4 h-4" /> {profile.role} • {profile.department || profile.department || 'NSUT'}
                </p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-surface border border-outline text-foreground px-6 py-2 rounded-lg font-bold tracking-widest text-xs uppercase hover:bg-outline/30 flex items-center gap-2 transition-colors"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-8">
              <div>
                <h3 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-4">Contact & Links</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Mail className="w-4 h-4 text-primary" /> {profile.email}
                  </div>
                  {(profile.nsut_roll_number || profile.roll_number) && (
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Briefcase className="w-4 h-4 text-primary" /> {profile.nsut_roll_number || profile.roll_number}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Globe className="w-4 h-4 text-primary" /> <Link href="#" className="hover:underline">github.com/{ (profile.full_name || profile.name)?.split(' ')[0].toLowerCase()}</Link>
                  </div>
                </div>
              </div>

              {profile.designation && (
                <div>
                   <h3 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-1">Designation</h3>
                   <p className="text-sm font-bold text-primary">{profile.designation}</p>
                </div>
              )}

              {profile.research_area && (
                <div>
                   <h3 className="font-bold text-xs text-foreground/50 tracking-widest uppercase mb-1">Research Area</h3>
                   <p className="text-sm text-foreground/80">{profile.research_area}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-12">
              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-4">Biography</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Passionate {profile.role} focused on research and development at Netaji Subhas University of Technology.
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mt-4 hover:underline">
                  <LinkIcon className="w-4 h-4" /> Download CV / Resume
                </Link>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {profile.role === 'faculty' ? 'Supervised Projects' : 'Project Activity'}
                </h3>
                <div className="space-y-4">
                  {projects.length > 0 ? projects.map((p: any) => p && (
                    <div key={p.id} className="border border-outline bg-surface p-6 rounded-lg flex items-center justify-between group">
                      <div>
                        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer">{p.title}</h4>
                        <span className="text-xs font-bold text-foreground/50 uppercase tracking-widest mt-1 hidden md:block">Status: {p.status}</span>
                      </div>
                      <Link href={`/projects/${p.id}`} className="p-2 border border-outline rounded hover:bg-primary hover:text-white transition-colors">
                        View
                      </Link>
                    </div>
                  )) : (
                    <div className="text-foreground/50 italic py-4">No public projects available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
