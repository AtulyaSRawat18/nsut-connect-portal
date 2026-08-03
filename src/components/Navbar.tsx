"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useLogout } from "@/utils/auth";

const navigation = [
  { href: "/home", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/forum", label: "Forum" },
  { href: "/news", label: "News" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/feed", label: "Feed" },
];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const logout = useLogout();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = response.ok ? await response.json() as { user?: { id: string; name: string; role: string } } : null;
        if (active) setUser(payload?.user ?? null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchUser();
    return () => { active = false; };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline bg-background transition-colors">
      <nav className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-4 transition-opacity hover:opacity-80">
          <img alt="NSUT Logo" className="h-12 w-12 object-contain" src="/nsut-logo.png" />
          <div className="flex flex-col border-l border-outline pl-4 text-left"><span className="text-lg font-extrabold uppercase leading-tight tracking-tight text-primary">NSUT Connect</span><span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/70">Research Prototype</span></div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navigation.map((item) => {
            const active = isCurrentPath(pathname, item.href);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`rounded-lg border-b-2 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-transparent text-foreground/70 hover:bg-foreground/5 hover:text-primary"}`}>{item.label}</Link>;
          })}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {loading ? <div className="h-8 w-20 animate-pulse bg-surface" /> : user ? <div className="flex items-center gap-2"><Link href="/dashboard" aria-current={pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/moderator") ? "page" : undefined} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest transition-all ${pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/moderator") ? "bg-primary/10 text-primary" : "text-foreground/80 hover:text-primary"}`}><LayoutDashboard size={16} /><span className="hidden sm:inline">Dashboard</span></Link><button onClick={logout} className="ml-1 p-2 text-foreground/50 transition-colors hover:text-primary" title="Sign Out"><LogOut size={18} /></button></div> : <div className="flex items-center gap-2"><Link href="/signup" aria-current={pathname === "/signup" ? "page" : undefined} className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition-all ${pathname === "/signup" ? "border-primary bg-primary/10 text-primary" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}>Register</Link><Link href="/login" aria-current={pathname === "/login" ? "page" : undefined} className="bg-primary px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-on-primary transition-all hover:brightness-110">Sign In</Link></div>}
        </div>
      </nav>
    </header>
  );
}
