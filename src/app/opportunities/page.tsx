import OpportunitiesDirectory from "@/components/shared/OpportunitiesDirectory";

export default function OpportunitiesPage(props: { searchParams?: Promise<{ q?: string; type?: string; deadline?: string; department?: string; page?: string }> }) {
  return <OpportunitiesDirectory {...props} />;
}
