import { ArrowUpRight, FlaskConical, Landmark, GraduationCap, Info } from "lucide-react";
import Link from "next/link";
import PageHeading from "@/components/shared/PageHeading";

const routes = [
  { title: "Research project funding", icon: Landmark, tone: "green", description: "Funding enquiries for faculty-led proposals, equipment, and collaborative research." },
  { title: "Early-stage ideas", icon: FlaskConical, tone: "red", description: "Explore possible institutional support for prototypes and interdisciplinary ideas." },
  { title: "Fellowships & scholarships", icon: GraduationCap, tone: "blue", description: "Look for published opportunities that support your academic and research journey." },
];
export default function GrantsPage() {
  return <div className="portal-page"><div className="portal-container">
    <PageHeading eyebrow="Support for the next step" title="Grants & research funding" description="Find a starting point for funding enquiries and explore published opportunities." />
    <div className="portal-notice" role="note"><Info size={20} /><p>No verified grant calls are published here yet. Confirm eligibility, amounts, and deadlines with the issuing organization before applying.</p></div>
    <div className="funding-routes">{routes.map(({ icon: Icon, ...route }) => <section key={route.title}><span className={`portal-symbol tone-${route.tone}`}><Icon size={22} /></span><h2>{route.title}</h2><p>{route.description}</p><Link href={route.tone === "blue" ? "/opportunities?type=scholarship" : "/contact"}>{route.tone === "blue" ? "View scholarships" : "Funding enquiries"}<ArrowUpRight size={16} /></Link></section>)}</div>
  </div></div>;
}
