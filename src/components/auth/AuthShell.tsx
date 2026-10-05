import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          <Image src="/nsut-logo.png" width={46} height={46} alt="" />
          <span>
            NSUT Connect<small>Research & community</small>
          </span>
        </Link>
        <div className="auth-campus-caption">
          <span className="auth-kicker">A campus full of possibility</span>
          <h2>
            Good ideas.
            <br />
            Great company.
          </h2>
          <p>
            Find your people. Share your curiosity.
            <br />
            Build something that matters.
          </p>
          <Link href="/home">
            Explore the campus community <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="auth-panel">
        <header className="auth-panel-header">
          <Link href="/" className="font-bold">
            NSUT <span className="text-primary">Connect</span>
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
          <span>NSUT research community</span>
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
