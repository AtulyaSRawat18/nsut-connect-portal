import { MessageCircle, Newspaper, Search, History, GraduationCap } from "lucide-react";
import Link from "next/link";
import StudentFeed from "./StudentFeed";

interface StudentProfile { id?: string; name?: string }

export default function StudentDashboard({ profile }: { profile: StudentProfile | null }) {
  return (
    <div className="space-y-12">
      <header className="mb-12">
        <h1 className="text-4xl font-display font-black text-primary mb-2 tracking-tight">Student Portal</h1>
        <p className="text-foreground/50 font-medium">Welcome back, {profile?.name || "Student"}. Explore research opportunities.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <Search className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Explore Projects</h3>
          <p className="text-sm text-foreground/50 mb-6">Find and apply for research projects under various departments.</p>
          <Link href="/projects" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Browse Projects</Link>
        </div>

        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <History className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">My Applications</h3>
          <p className="text-sm text-foreground/50 mb-6">Track the status of your research group applications.</p>
          <Link href="/dashboard/student/applications" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Check Status</Link>
        </div>

        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <GraduationCap className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">My Profile</h3>
          <p className="text-sm text-foreground/50 mb-6">Update your academic details and research interests.</p>
          <Link href={`/profile/${profile?.id}`} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Update CV</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <MessageCircle className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Student Forum</h3>
          <p className="text-sm text-foreground/50 mb-6">Discuss with peers and get guidance from faculty members.</p>
          <Link href="/forum" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Go to Forum</Link>
        </div>

        <div className="bg-surface border border-outline p-8 group hover:border-primary transition-all">
          <Newspaper className="w-10 h-10 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Opportunities</h3>
          <p className="text-sm text-foreground/50 mb-6">Explore curated research translation programs, data sprints and reading groups.</p>
          <Link href="/opportunities" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">View All</Link>
        </div>
      </div>

      <StudentFeed />
    </div>
  );
}
