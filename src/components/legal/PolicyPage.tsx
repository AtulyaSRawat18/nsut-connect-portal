import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export type PolicySection = { title: string; paragraphs?: string[]; bullets?: string[] };

export default function PolicyPage({ eyebrow, title, summary, sections }: { eyebrow: string; title: string; summary: string; sections: PolicySection[] }) {
  return (
    <div className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary"><ArrowLeft className="h-4 w-4" /> Entry home</Link>
        <header className="mt-10 border-b border-outline pb-10"><p className="text-xs font-black uppercase tracking-[0.25em] text-primary">{eyebrow}</p><h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{title}</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/65">{summary}</p></header>
        <div className="mt-8 flex gap-4 border border-amber-500/30 bg-amber-500/5 p-5 text-sm leading-relaxed text-foreground/75"><AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" /><p><strong>Draft for institutional review.</strong> This prototype text is not an approved NSUT policy and must be reviewed by the university’s legal, privacy, research and information-security owners before public production use.</p></div>
        <div className="mt-12 space-y-12">{sections.map((section, index) => <section key={section.title} className="grid gap-5 md:grid-cols-[3rem_1fr]"><span className="text-sm font-black text-primary">{String(index + 1).padStart(2, "0")}</span><div><h2 className="text-2xl font-black">{section.title}</h2>{section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-4 leading-7 text-foreground/70">{paragraph}</p>)}{section.bullets && <ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-foreground/70">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div></section>)}</div>
        <div className="mt-16 border-t border-outline pt-8 text-sm text-foreground/55">Last prototype revision: 2 August 2026. Policy owner, effective date, version history and approved contact must be added before launch.</div>
      </div>
    </div>
  );
}
