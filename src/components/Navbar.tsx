"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, ChevronDown, Compass, FolderKanban, GraduationCap, LayoutDashboard, Lightbulb, LogOut, Menu, MessageSquare, Search, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useLogout } from "@/utils/auth";

const primary = [
  { href: "/home", label: "Home", icon: Compass },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/idea", label: "IDea", icon: Lightbulb },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/opportunities", label: "Opportunities", icon: GraduationCap },
];
const explore = [
  { title: "Research", links: [["Faculty directory", "/faculty"], ["Publications", "/publications"], ["Research feed", "/feed"], ["Grants & funding", "/grants"]] },
  { title: "On campus", links: [["News & briefs", "/news"], ["Developments", "/developments"], ["Highlights", "/whats-new"]] },
  { title: "The community", links: [["About NSUT Connect", "/about"], ["Contact & support", "/contact"], ["Research ethics", "/ethics"]] },
];
const isActive = (path: string, href: string) => path === href || path.startsWith(href + "/");

export default function Navbar() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchArea, setSearchArea] = useState("/projects");
  const more = useRef<HTMLDetailsElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const logout = useLogout();
  const menuOpen = menuPath === pathname;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then(async response => response.ok ? response.json() : null)
      .then(payload => { if (!controller.signal.aborted) setUser(payload?.user || null); })
      .catch(() => { if (!controller.signal.aborted) setUser(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [pathname]);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (more.current && !more.current.contains(event.target as Node)) more.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuPath(null);
        if (more.current?.open) { more.current.open = false; more.current.querySelector("summary")?.focus(); }
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);

  return <header className="site-header">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <nav className="site-navigation" aria-label="Main navigation">
      <Link href="/home" className="site-brand" onClick={() => setMenuPath(null)}>
        <Image src="/nsut-logo.png" alt="" width={42} height={42} />
        <span>NSUT <strong>Connect</strong><small>Research & community</small></span>
      </Link>
      <div className="site-primary-links">{primary.map(item => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>{item.label}{item.href === "/idea" && <span className="nav-new-dot" />}</Link>)}
        <details ref={more} className="site-explore">
          <summary className={explore.some(group => group.links.some(([, href]) => isActive(pathname, href))) ? "is-current" : ""}>Explore <ChevronDown size={14} /></summary>
          <div className="site-explore-panel">{explore.map(group => <div key={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined} onClick={() => { if (more.current) more.current.open = false; }}>{label}<ArrowRight size={13} /></Link>)}</div>)}</div>
        </details>
      </div>
      <div className="site-actions">
        <button className="icon-control" title="Search portal" aria-label="Search portal" onClick={() => searchDialog.current?.showModal()}><Search size={19} /></button>
        <ThemeToggle />
        {loading ? <span className="site-session-loading" aria-label="Loading account" /> : user ? <><Link className="site-workspace-link" href="/dashboard" title="Your workspace"><LayoutDashboard size={17} /><span>Workspace</span></Link><button className="icon-control site-signout" title="Sign out" aria-label="Sign out" onClick={logout}><LogOut size={17} /></button></> : <Link href="/login" className="site-signin">Sign in <ArrowRight size={15} /></Link>}
        <button className="icon-control site-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} title={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuPath(menuOpen ? null : pathname)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </nav>
    {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="site-mobile-nav">
      <div className="site-mobile-primary">{primary.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined} onClick={() => setMenuPath(null)}><Icon size={18} />{item.label}</Link>)}</div>
      <div className="site-mobile-groups">{explore.map(group => <div key={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuPath(null)} aria-current={isActive(pathname, href) ? "page" : undefined}>{label}</Link>)}</div>)}</div>
      {!user && <Link className="site-mobile-register" href="/signup" onClick={() => setMenuPath(null)}>Join the community <ArrowRight size={16} /></Link>}
      {user && <button className="site-mobile-register" onClick={logout}><LogOut size={16} /> Sign out</button>}
    </nav>}
    <dialog ref={searchDialog} aria-labelledby="portal-search-title" className="portal-search-dialog" onClick={event => { if (event.target === event.currentTarget) searchDialog.current?.close(); }}>
      <div className="portal-dialog-heading"><BookOpen size={21} /><h2 id="portal-search-title">Find your next connection</h2><button className="icon-control" title="Close search" aria-label="Close search" onClick={() => searchDialog.current?.close()}><X size={20} /></button></div>
      <form action={searchArea} method="get" onSubmit={() => searchDialog.current?.close()}>
        <label>Search in<select value={searchArea} onChange={event => setSearchArea(event.target.value)}><option value="/projects">Research projects</option><option value="/faculty">Faculty directory</option><option value="/publications">Publications</option><option value="/forum">Discussions</option><option value="/opportunities">Opportunities</option></select></label>
        <label>Keywords<input name="q" type="search" required maxLength={160} placeholder="A topic, a name, a question..." /></label>
        <button className="portal-button" type="submit"><Search size={17} /> Search</button>
      </form>
    </dialog>
  </header>;
}
