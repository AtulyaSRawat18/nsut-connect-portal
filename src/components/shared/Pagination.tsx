import Link from "next/link";

export default function Pagination({
  basePath,
  currentPage,
  pageSize,
  searchParams,
  totalCount,
}: {
  basePath: string;
  currentPage: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
  totalCount: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const query = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && value !== "all") query.set(key, value);
    });
    query.set("page", String(page));
    return `${basePath}?${query.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-outline pt-6">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} className="rounded-lg border border-outline px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground hover:border-primary hover:text-primary">
          Previous
        </Link>
      ) : <span />}
      <span className="text-xs font-semibold text-foreground/50">Page {currentPage} of {totalPages}</span>
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} className="rounded-lg border border-outline px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground hover:border-primary hover:text-primary">
          Next
        </Link>
      ) : <span />}
    </nav>
  );
}
