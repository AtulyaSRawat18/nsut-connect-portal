import { notFound } from "next/navigation";
import { DemoApplicationQuestionnaire } from "@/components/projects/DemoApplicationQuestionnaire";
import { demoApplicationForms, getDemoApplicationForm } from "@/lib/application-forms";

export function generateStaticParams() {
  return demoApplicationForms.map((form) => ({ slug: form.slug }));
}

export default async function DemoApplicationFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = getDemoApplicationForm(slug);
  if (!form) notFound();
  return <main className="min-h-screen bg-background"><DemoApplicationQuestionnaire form={form} /></main>;
}
