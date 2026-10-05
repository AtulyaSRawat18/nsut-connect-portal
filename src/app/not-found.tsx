import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return <section className="portal-container portal-status-page"><Search size={36} /><p className="portal-eyebrow">Page not found</p><h1>We could not find that page.</h1><p>It may have moved, or the link may no longer be available.</p><Link href="/home" className="portal-button"><ArrowLeft size={17} /> Back to community</Link></section>;
}
