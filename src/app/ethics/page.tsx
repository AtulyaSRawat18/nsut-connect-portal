import { ArrowRight, FileText, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";
import PageHeading from "@/components/shared/PageHeading";

const guidelines = [
  { title: "Privacy & responsible data use", href: "/privacy", description: "How personal information should be handled within this portal." },
  { title: "Intellectual property", href: "/ip-policy", description: "Draft guidance on ownership, attribution, and sharing research outputs." },
  { title: "Community terms", href: "/terms", description: "Expectations for participation, content, and responsible collaboration." },
];
export default function EthicsPage() {
  return <div className="portal-page"><div className="portal-container">
    <PageHeading eyebrow="Responsible collaboration" title="Research ethics & guidance" description="Build trust alongside your research. Start with consent, clear attribution, and thoughtful use of information." />
    <div className="portal-notice"><Info size={20} /><p>These are prototype drafts, not approved university policies. Institutional research review is not available through this portal.</p></div>
    <div className="ethics-layout"><div className="guidance-list">{guidelines.map(item => <Link key={item.href} href={item.href}><FileText size={23} /><div><h2>{item.title}</h2><p>{item.description}</p><span>Read draft guidance</span></div><ArrowRight size={18} /></Link>)}</div><aside><ShieldCheck size={28} /><h2>Need institutional guidance?</h2><p>For sensitive data, human-participant research, or a research review, confirm the appropriate university process before proceeding.</p><Link href="/contact">Contact information <ArrowRight size={16} /></Link></aside></div>
  </div></div>;
}
