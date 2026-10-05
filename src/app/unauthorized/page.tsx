import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="portal-page">
      <section className="portal-container portal-status-page">
        <ShieldAlert size={36} />
        <p className="mb-3 text-xs font-semibold normal-case tracking-normal text-primary">
          Access restricted
        </p>
        <h1 className="mb-4 text-3xl font-semibold text-foreground">
          You do not have permission to open this page.
        </h1>
        <p className="mb-8 text-foreground/60">
          Your account may still be awaiting approval, or this area may require a different institutional role.
        </p>
        <Link
          href="/home"
          className="portal-button"
        >
          <ArrowLeft size={17} /> Back to community
        </Link>
      </section>
    </div>
  );
}
