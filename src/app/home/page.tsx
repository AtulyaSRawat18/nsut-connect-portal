import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, Lightbulb, MessageSquare, Users } from "lucide-react";
import { showcaseNews, showcaseProjects } from "@/content/showcase";
import { getDepartmentCompactLabel } from "@/lib/departments";

const destinations = [
  { title: "Find a project", detail: "Research with a purpose", href: "/projects", icon: FlaskConical, tone: "green" },
  { title: "Meet your people", detail: "Interests beyond your branch", href: "/idea", icon: Lightbulb, tone: "red" },
  { title: "Find a mentor", detail: "Expertise across NSUT", href: "/faculty", icon: Users, tone: "blue" },
  { title: "Join a conversation", detail: "Questions worth exploring", href: "/forum", icon: MessageSquare, tone: "gold" },
];
export default function ResearchHome() {
  return <div className="community-home">
    <section className="community-banner"><Image src="/campus-fountain.jpg" alt="NSUT campus entrance and science mural" fill priority sizes="100vw" /><div className="community-banner-content"><p>Our campus. Our community.</p><h1>NSUT Connect</h1><p>Good questions bring us together.<br />Find the people and projects to take yours further.</p><Link href="/idea" className="portal-button">Explore IDea <ArrowRight size={17} /></Link></div></section>
    <nav className="community-shortcuts" aria-label="Start exploring">{destinations.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href}><span className={`portal-symbol tone-${item.tone}`}><Icon size={22} /></span><span><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRight size={17} /></Link>)}</nav>
    <section className="community-section"><header className="portal-section-heading"><div><p className="portal-eyebrow">From curiosity to collaboration</p><h2>Research worth exploring</h2><p>Selected prototype projects from across the campus.</p></div><Link href="/projects">All projects <ArrowRight size={16} /></Link></header><div className="community-projects">{showcaseProjects.slice(0,4).map(project => <article key={project.id}><div className="community-project-meta"><span>{getDepartmentCompactLabel(project.department)}</span><span>Showcase</span></div><h3><Link href={`/projects/${project.id}`}>{project.title}</Link></h3><p>{project.summary}</p><footer><span><Users size={15} /> {project.maxStudents} student places</span><Link href={`/projects/${project.id}`}>View project <ArrowUpRight size={16} /></Link></footer></article>)}</div></section>
    <section className="community-journal"><div className="community-section"><header className="portal-section-heading"><div><p className="portal-eyebrow">The reading room</p><h2>A little perspective goes a long way.</h2></div><Link href="/news">All research briefs <ArrowRight size={16} /></Link></header><div className="community-news">{showcaseNews.slice(0,3).map((item,index) => <article key={item.id}><span className="community-news-number">0{index+1}</span><p>{item.category.replace("-", " & ")}</p><h3><Link href={`/news/${item.id}`}>{item.title}</Link></h3><p>{item.summary}</p><Link href={`/news/${item.id}`}>Read brief <ArrowUpRight size={15} /></Link></article>)}</div></div></section>
    <section className="community-section community-bottom"><div><BookOpen size={26} /><h2>Follow the evidence.</h2><p>Explore publications, methods, and the work behind the ideas.</p></div><Link href="/publications" className="portal-button-secondary">Browse publications <ArrowRight size={17} /></Link></section>
  </div>;
}
