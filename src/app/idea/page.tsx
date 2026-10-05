import type { Metadata } from "next";
import IdeaExplorer from "@/components/idea/IdeaExplorer";
export const metadata: Metadata = {
  title: "IDea | NSUT Connect",
  description:
    "Find collaborators, explore research interests, and share ideas across every NSUT branch.",
};
export default async function IdeaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const scope = view === "mine" || view === "connections" ? view : "explore";
  return <IdeaExplorer key={scope} initialScope={scope} />;
}
