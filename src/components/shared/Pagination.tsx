import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <nav aria-label="Pagination" className="portal-pagination">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} aria-label="Previous page" title="Previous page" className="icon-control">
          <ArrowLeft size={18} />
        </Link>
      ) : <span />}
      <span className="text-xs font-semibold text-foreground/50">Page {currentPage} of {totalPages}</span>
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} aria-label="Next page" title="Next page" className="icon-control">
          <ArrowRight size={18} />
        </Link>
      ) : <span />}
    </nav>
  );
}
