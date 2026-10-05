"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="portal-container portal-status-page" role="alert"><AlertCircle size={36} /><p className="portal-eyebrow">Something went wrong</p><h1>This page is temporarily unavailable.</h1><p>Your session has not been changed. Try loading the page again.</p><div className="flex flex-wrap justify-center gap-3"><button className="portal-button" onClick={reset}><RefreshCw size={17} /> Try again</button><Link href="/home" className="portal-button-secondary">Back to community</Link></div></section>;
}
