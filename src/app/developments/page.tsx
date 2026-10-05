import NewsDirectory from "@/components/shared/NewsDirectory";

export default function DevelopmentsPage(props: { searchParams?: Promise<{ q?: string; category?: string; department?: string; page?: string }> }) {
  return <NewsDirectory {...props} title="Campus & research developments" basePath="/developments" />;
}
