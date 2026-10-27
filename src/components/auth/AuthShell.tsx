import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import NetworkIdentity from "@/components/shared/NetworkIdentity";

export default function AuthShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "login" | "signup";
}) {
  return (
    <div className="auth-shell">
      <section className="auth-campus" aria-label="NSUT campus">
        <Image
          src="/campus-fountain.jpg"
          alt="The entrance to NSUT, with its science mural and campus gardens"
          fill
          priority
          sizes="(min-width: 900px) 52vw, 100vw"
          className="object-cover"
        />
        <Link href="/" className="auth-brand">
          <NetworkIdentity />
        </Link>
        <div className="auth-campus-caption">
          <span className="auth-kicker">A campus full of possibility</span>
          <h2>
            Shared curiosity.
            <br />
            Meaningful research.
          </h2>
          <p>
            Every discipline has something to contribute.
            <br />
            Find your people and take the next step together.
          </p>
          <Link href="/home">
            Explore the campus community <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="auth-panel">
        <header className="auth-panel-header">
          <Link href="/" className="site-brand auth-panel-brand">
            <NetworkIdentity />
          </Link>
          <ThemeToggle />
        </header>
        <div className="auth-form-wrap">
          <nav className="auth-tabs" aria-label="Account access">
            <Link
              href="/login"
              aria-current={mode === "login" ? "page" : undefined}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              aria-current={mode === "signup" ? "page" : undefined}
            >
              Create account
            </Link>
          </nav>
          {children}
        </div>
        <footer className="auth-footer">
          <span>NSUT Research Network</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <small>Internal prototype. Institutional review pending.</small>
        </footer>
      </section>
    </div>
  );
}
