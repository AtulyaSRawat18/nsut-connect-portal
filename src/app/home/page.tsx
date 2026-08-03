import Link from "next/link";
import { ArrowRight, Atom, BookOpen, CalendarDays, Lightbulb, MessagesSquare, Microscope, Rocket, Users } from "lucide-react";
import CampusLineArt from "@/components/home/CampusLineArt";
import ResearchBackdrop from "@/components/shared/ResearchBackdrop";
import { showcaseNews, showcaseProjects } from "@/content/showcase";

const researchPillars = [
  { Icon: Users, title: "Collaborate", copy: "Connect across disciplines and roles." },
  { Icon: Microscope, title: "Research", copy: "Review methods, evidence and briefs." },
  { Icon: Rocket, title: "Innovate", copy: "Track ideas from proposal to impact." },
  { Icon: Lightbulb, title: "Discover", copy: "Follow focused science and engineering." },
];

export default function ResearchHome() {
  return (
    <div className="bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-[#17345f]/20 bg-[#f7f2e8] px-6 pb-14 pt-16 text-[#092346] md:pt-24 dark:bg-[#07101f] dark:text-white">
        <ResearchBackdrop />
        <div aria-hidden className="absolute -right-32 top-0 h-28 w-[34rem] -rotate-12 rounded-[50%] bg-[#d6222a]/85" />
        <div aria-hidden className="absolute -left-32 bottom-12 h-32 w-[30rem] rotate-12 rounded-[50%] bg-[#173f78]/90" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 xl:grid-cols-[1.02fr_.98fr]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-primary">Public research home</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.045em] md:text-7xl">Ideas become stronger when methods, evidence and people connect.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-current/70">Explore focused research projects, evidence-based technology briefs and constructive academic discussions across engineering and science.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/projects" className="inline-flex items-center gap-2 rounded-md bg-primary px-7 py-4 text-xs font-black uppercase tracking-widest text-white">Browse projects <ArrowRight className="h-4 w-4" /></Link><Link href="/feed" className="inline-flex items-center gap-2 rounded-md border-2 border-current/25 bg-white/65 px-7 py-4 text-xs font-black uppercase tracking-widest backdrop-blur-sm dark:bg-white/5">Latest research feed</Link></div>
          </div>
          <div className="relative mt-6 rounded-[2rem] border border-[#17345f]/15 bg-[#fffdf8]/70 px-4 pb-5 pt-8 shadow-[0_30px_90px_-45px_rgba(9,35,70,.7)] backdrop-blur-sm xl:mt-0">
            <div className="absolute left-6 top-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d6222a]"><Atom className="h-4 w-4" /> NSUT research landscape</div>
            <CampusLineArt className="mt-5" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {researchPillars.map(({ Icon, title }) => <div key={title} className="rounded-lg border border-[#17345f]/10 bg-white/80 p-3 text-center"><Icon className="mx-auto h-5 w-5 text-[#d6222a]" /><p className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#17345f]">{title}</p></div>)}
            </div>
          </div>
        </div>
        <div className="relative mx-auto mt-12 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {researchPillars.map(({ Icon, title, copy }) => <article key={title} className="border border-current/15 bg-white/78 p-6 shadow-sm backdrop-blur-sm dark:bg-white/[0.06]"><Icon className="h-7 w-7 text-primary" /><h2 className="mt-5 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-current/60">{copy}</p></article>)}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Research opportunities</p><h2 className="mt-2 text-4xl font-black">Detailed enough to evaluate before applying.</h2></div><Link href="/projects" className="text-xs font-black uppercase tracking-widest text-primary">All projects →</Link></div>
          <div className="grid gap-6 lg:grid-cols-2">
            {showcaseProjects.slice(0, 4).map((project) => <article key={project.id} className="border border-outline bg-surface p-8"><div className="mb-5 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-primary">{project.department}</span><span className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">{project.maxStudents} student places</span></div><h3 className="text-2xl font-black">{project.title}</h3><p className="mt-4 text-sm leading-relaxed text-foreground/65">{project.summary}</p><Link href={`/projects/${project.id}`} className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">Project detail <ArrowRight className="h-4 w-4" /></Link></article>)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-outline bg-[#fbf7ef] px-6 py-20 dark:bg-surface">
        <ResearchBackdrop compact />
        <div className="relative mx-auto max-w-7xl"><div className="mb-10 flex items-center gap-4"><Atom className="h-8 w-8 text-primary" /><div><p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Research intelligence</p><h2 className="text-3xl font-black">Curated developments, linked to primary sources.</h2></div></div><div className="grid gap-5 md:grid-cols-2">{showcaseNews.slice(0, 4).map((item) => <Link key={item.id} href={`/news/${item.id}`} className="group border border-outline bg-background/90 p-7 backdrop-blur-sm"><div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground/45"><CalendarDays className="h-4 w-4" /> {item.category.replace("-", " & ")}</div><h3 className="mt-4 text-xl font-black group-hover:text-primary">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground/60">{item.summary}</p></Link>)}</div></div>
      </section>

      <section className="px-6 py-20"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2"><Link href="/forum" className="border border-outline p-8 hover:bg-surface"><MessagesSquare className="h-7 w-7 text-primary" /><h2 className="mt-8 text-2xl font-black">Ask, answer and improve the method.</h2><p className="mt-3 text-sm leading-relaxed text-foreground/60">Vote on complete technical questions and reply directly in the forum feed.</p></Link><Link href="/publications" className="border border-outline p-8 hover:bg-surface"><BookOpen className="h-7 w-7 text-primary" /><h2 className="mt-8 text-2xl font-black">Trace claims back to research.</h2><p className="mt-3 text-sm leading-relaxed text-foreground/60">Use publications and primary-source links to move from summaries to evidence.</p></Link></div></section>
    </div>
  );
}
