import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink } from "lucide-react";
import { getShowcaseOpportunity } from "@/content/showcase";

export default async function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getShowcaseOpportunity(id);
  if (!item) notFound();
  return <div className="min-h-screen bg-background px-6 py-16 text-foreground"><article className="mx-auto max-w-4xl"><Link href="/opportunities" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><ArrowLeft className="h-4 w-4" /> Opportunities</Link><header className="mt-10 border-b border-outline pb-10"><div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest"><span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{item.type}</span>{item.deadline && <span className="flex items-center gap-2 text-foreground/45"><CalendarDays className="h-4 w-4" /> Review deadline {new Date(item.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>}</div><h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">{item.title}</h1><p className="mt-6 text-xl leading-relaxed text-foreground/65">{item.summary}</p></header>
    <div className="mt-10 grid gap-6 md:grid-cols-2"><section className="border border-outline bg-surface p-7"><h2 className="text-xl font-black">Eligibility</h2><ul className="mt-5 space-y-3">{item.eligibility.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-foreground/70"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" /> {point}</li>)}</ul></section><section className="border border-outline bg-surface p-7"><h2 className="text-xl font-black">What participants receive</h2><ul className="mt-5 space-y-3">{item.support.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-foreground/70"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" /> {point}</li>)}</ul></section></div>
    <section className="mt-8 border border-outline p-8"><h2 className="text-2xl font-black">Expression-of-interest checklist</h2><ol className="mt-6 list-decimal space-y-4 pl-6 leading-7 text-foreground/70">{item.howToApply.map((point) => <li key={point}>{point}</li>)}</ol></section>
    <div className="mt-8 border border-amber-500/30 bg-amber-500/5 p-6 text-sm leading-7 text-foreground/70"><strong>Publication status:</strong> {item.note}</div>
    {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">Open related official resource <ExternalLink className="h-4 w-4" /></a>}
  </article></div>;
}
