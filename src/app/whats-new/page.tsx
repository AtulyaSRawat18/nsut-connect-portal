import OpportunitiesDirectory from "@/components/shared/OpportunitiesDirectory";

export default function HighlightsPage(props: { searchParams?: Promise<{ q?: string; type?: string; deadline?: string; department?: string; page?: string }> }) {
  return <OpportunitiesDirectory {...props} title="Opportunities & highlights" basePath="/whats-new" />;
}
