import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Lightbulb, ListChecks, MessageCircleQuestion } from "lucide-react";
import { getShowcaseNews } from "@/content/showcase";

export default async function ResearchBriefDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getShowcaseNews(id);
  if (!item) notFound();
  return <div className="min-h-screen bg-background px-6 py-16 text-foreground"><article className="mx-auto max-w-4xl"><Link href="/feed" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><ArrowLeft className="h-4 w-4" /> Research feed</Link><header className="mt-10 border-b border-outline pb-10"><div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest"><span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{item.category.replace("-", " & ")}</span><span className="text-foreground/45">Curated brief · {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div><h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">{item.title}</h1><p className="mt-6 text-xl leading-relaxed text-foreground/65">{item.summary}</p></header>
    <section className="mt-10 border border-outline bg-surface p-8"><div className="flex items-center gap-3"><Lightbulb className="h-6 w-6 text-primary" /><h2 className="text-2xl font-black">Why it matters</h2></div><p className="mt-5 leading-8 text-foreground/70">{item.whyItMatters}</p></section>
    <section className="mt-10"><div className="flex items-center gap-3"><ListChecks className="h-6 w-6 text-primary" /><h2 className="text-2xl font-black">Evidence snapshot</h2></div><ul className="mt-6 space-y-4">{item.points.map((point) => <li key={point} className="border-l-4 border-primary bg-surface px-6 py-4 leading-7 text-foreground/70">{point}</li>)}</ul></section>
    <section className="mt-10 border-y border-outline py-9"><div className="flex items-center gap-3"><MessageCircleQuestion className="h-6 w-6 text-primary" /><h2 className="text-2xl font-black">Questions for a research group</h2></div><ol className="mt-6 list-decimal space-y-3 pl-6 leading-7 text-foreground/70">{item.questions.map((question) => <li key={question}>{question}</li>)}</ol></section>
    <section className="mt-10 rounded-xl bg-secondary p-8 text-white"><p className="text-[10px] font-black uppercase tracking-widest text-white/55">Primary source</p><h2 className="mt-3 text-xl font-black">{item.sourceLabel}</h2><p className="mt-3 text-sm leading-relaxed text-white/70">This page is an editorial summary. Read the source before citing or acting on the information.</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">Open official source <ExternalLink className="h-4 w-4" /></a></section>
  </article></div>;
}
