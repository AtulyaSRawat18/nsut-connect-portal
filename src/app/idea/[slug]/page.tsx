import { notFound } from "next/navigation";
import { IDEA_TOPICS } from "@/lib/idea-search";
import IdeaExplorer from "@/components/idea/IdeaExplorer";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = IDEA_TOPICS.find((topic) => topic.id === slug);
  return { title: `${topic?.title || "Space not found"} | IDea` };
}
export default async function IdeaSpace({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!IDEA_TOPICS.some((topic) => topic.id === slug)) notFound();
  return <IdeaExplorer topicId={slug} />;
}
