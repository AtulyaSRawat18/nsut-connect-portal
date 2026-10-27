import NetworkIdentity from "@/components/shared/NetworkIdentity";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const groups = [
  { title: "Discover", links: [["Projects", "/projects"], ["Faculty", "/faculty"], ["Publications", "/publications"], ["Research feed", "/feed"]] },
  { title: "Connect", links: [["IDea spaces", "/idea"], ["Academic forum", "/forum"], ["Opportunities", "/opportunities"], ["Contact", "/contact"]] },
  { title: "The portal", links: [["About", "/about"], ["Research ethics", "/ethics"], ["IP guidance", "/ip-policy"], ["Grants", "/grants"]] },
];
export default function Footer() {
  return <footer className="site-footer"><div className="site-footer-inner">
    <div className="site-footer-top"><div className="site-footer-intro"><Link href="/home" className="site-brand"><NetworkIdentity /></Link><p>Connecting curious minds across disciplines. Share knowledge, find collaborators, and grow your research together.</p><a href="https://nsut.ac.in" target="_blank" rel="noopener noreferrer">Visit the university <ArrowUpRight size={14} /></a></div>
      <nav aria-label="Footer navigation" className="site-footer-links">{groups.map(group => <div key={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>)}</nav>
    </div><div className="site-footer-bottom"><p>NSUT Research Network / Internal research prototype. Institutional review pending.</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div>
  </div></footer>;
}
