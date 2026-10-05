import NewsDirectory from "@/components/shared/NewsDirectory";

export default function NewsPage(props: { searchParams?: Promise<{ q?: string; category?: string; department?: string; page?: string }> }) {
  return <NewsDirectory {...props} />;
}
