import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <section className="mx-auto max-w-xl rounded-2xl border border-outline bg-surface p-10 text-center shadow-sm">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-primary">
          Access restricted
        </p>
        <h1 className="mb-4 text-3xl font-black text-foreground">
          You do not have permission to open this page.
        </h1>
        <p className="mb-8 text-foreground/60">
          Your account may still be awaiting approval, or this area may require a different institutional role.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
