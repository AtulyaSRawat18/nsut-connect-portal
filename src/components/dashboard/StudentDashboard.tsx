import { ArrowUpRight, MessageCircle, Newspaper, Search, History, GraduationCap, Lightbulb } from "lucide-react";
import Link from "next/link";
import PageHeading from "@/components/shared/PageHeading";
import StudentFeed from "./StudentFeed";

interface StudentProfile { id?: string; name?: string }

export default function StudentDashboard({ profile }: { profile: StudentProfile | null }) {
  const destinations = [
    { title: "Explore projects", detail: "Find a research team and contribute your perspective.", href: "/projects", icon: Search, tone: "green" },
    { title: "My applications", detail: "Follow your applications and the next steps.", href: "/dashboard/student/applications", icon: History, tone: "blue" },
    { title: "My profile", detail: "Your academic journey, work, and research interests.", href: profile?.id ? `/profile/${profile.id}` : "/onboarding", icon: GraduationCap, tone: "gold" },
    { title: "My IDea community", detail: "Meet people who share your curiosity, across branches.", href: "/idea", icon: Lightbulb, tone: "red" },
    { title: "Academic forum", detail: "Ask a question. Share evidence. Move an idea forward.", href: "/forum", icon: MessageCircle, tone: "green" },
    { title: "Opportunities", detail: "Research programs, scholarships, and reading groups.", href: "/opportunities", icon: Newspaper, tone: "blue" },
  ];
  return <div className="space-y-10">
    <PageHeading eyebrow="Your workspace" title={`Welcome back, ${profile?.name?.split(" ")[0] || "student"}`} description="Pick up where you left off, or find something new to explore." />
    <div className="student-destinations">{destinations.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href}><span className={`portal-symbol tone-${item.tone}`}><Icon size={22} /></span><h2>{item.title}</h2><p>{item.detail}</p><ArrowUpRight size={18} /></Link>)}</div>
    <StudentFeed />
  </div>;
}
