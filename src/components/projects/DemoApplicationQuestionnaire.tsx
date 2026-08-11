"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clipboard, ShieldCheck } from "lucide-react";
import type { DemoApplicationForm } from "@/lib/application-forms";

export function DemoApplicationQuestionnaire({ form }: { form: DemoApplicationForm }) {
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const reference = `/demo-forms/${form.slug}?completed=1&reference=DEMO-${form.slug.toUpperCase()}`;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  async function copyReference() {
    await navigator.clipboard.writeText(reference);
    setCopied(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-7 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-800 dark:text-amber-200">
        <strong>Staging demo:</strong> this questionnaire imitates the faculty-configured Google Form workflow. Answers stay in this browser and are not transmitted or stored.
      </div>
      <div className="rounded-2xl border border-outline bg-surface shadow-xl">
        <header className="border-t-8 border-primary p-7 md:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">NSUT Connect application questionnaire</p>
          <h1 className="mt-3 text-3xl font-black text-foreground md:text-4xl">{form.title}</h1>
          <p className="mt-3 text-sm font-bold text-foreground/70">{form.projectTitle}</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-foreground/60">{form.introduction} Estimated completion time: {form.estimatedMinutes} minutes.</p>
        </header>

        {submitted ? (
          <section className="border-t border-outline p-7 md:p-10">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <h2 className="mt-4 text-2xl font-black text-foreground">Demo questionnaire completed</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/60">Copy this staging-only completion reference into the project application modal.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input readOnly value={reference} aria-label="Demo questionnaire completion reference" className="min-w-0 flex-1 rounded border border-outline bg-background px-4 py-3 text-sm text-foreground" />
              <button type="button" onClick={copyReference} className="inline-flex items-center justify-center gap-2 rounded bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-on-primary"><Clipboard className="h-4 w-4" /> {copied ? "Copied" : "Copy reference"}</button>
            </div>
            <Link href="/projects" className="mt-7 inline-block text-xs font-black uppercase tracking-widest text-primary hover:underline">Return to projects</Link>
          </section>
        ) : (
          <form onSubmit={submit} className="space-y-7 border-t border-outline p-7 md:p-10">
            {form.questions.map((question, index) => (
              <label key={question.id} className="block">
                <span className="mb-2 block text-sm font-black text-foreground">{index + 1}. {question.label} *</span>
                {question.type === "textarea" ? (
                  <textarea name={question.id} required minLength={20} placeholder={question.placeholder} className="min-h-28 w-full rounded border border-outline bg-background p-4 text-sm text-foreground outline-none focus:border-primary" />
                ) : question.type === "select" ? (
                  <select name={question.id} required defaultValue="" className="w-full rounded border border-outline bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"><option value="" disabled>Select an option</option>{question.options?.map((option) => <option key={option}>{option}</option>)}</select>
                ) : (
                  <input name={question.id} required minLength={3} placeholder={question.placeholder} className="w-full rounded border border-outline bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                )}
              </label>
            ))}
            <div className="flex items-start gap-3 rounded-lg border border-outline bg-background p-4 text-xs leading-5 text-foreground/55"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />Do not enter passwords, identity documents, private tokens, health information or unrelated personal data.</div>
            <button className="w-full rounded bg-primary py-4 text-sm font-black uppercase tracking-widest text-on-primary hover:brightness-110">Complete demo questionnaire</button>
          </form>
        )}
      </div>
    </div>
  );
}
