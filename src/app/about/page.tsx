import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FlaskConical, Lightbulb, ShieldCheck, Users } from "lucide-react";
import PageHeading from "@/components/shared/PageHeading";

export default function About() {
  return <div className="portal-page"><div className="portal-container">
    <PageHeading eyebrow="Our community" title="About NSUT Connect" description="A shared place for students and faculty to find opportunities, exchange ideas, and build across disciplines." />
    <figure className="about-campus"><Image src="/campus-fountain.jpg" alt="The NSUT entrance, gardens, and science mural" width={1200} height={515} priority /><figcaption>Netaji Subhas University of Technology / New Delhi</figcaption></figure>
    <section className="about-introduction"><p className="portal-eyebrow">More connections. Better questions.</p><div><h2>Research begins with people.</h2><p>A promising question can begin in any department. NSUT Connect brings projects, faculty expertise, publications, and conversations into one campus community.</p><p>Students can find mentors and apply to projects. Faculty can share their work and build teams. IDea offers a place to discover common interests across branches.</p></div></section>
    <div className="about-principles">{[
      { icon: Users, title: "Across disciplines", description: "Meet people who bring a different perspective to the same question." },
      { icon: FlaskConical, title: "Grounded in research", description: "Explore methods, evidence, projects, and published work." },
      { icon: Lightbulb, title: "Open to curiosity", description: "Find a field, ask a question, or start an interdisciplinary conversation." },
      { icon: ShieldCheck, title: "Accountable participation", description: "Institutional sign-in, attributed discussions, and moderated participation." },
    ].map(({ icon: Icon, ...item }) => <section key={item.title}><Icon size={23} /><h3>{item.title}</h3><p>{item.description}</p></section>)}</div>
    <section className="about-status"><div><h2>A community taking shape.</h2><p>NSUT Connect is an internal research prototype pending institutional approval.</p></div><Link href="/contact" className="portal-button-secondary">Contact & support <ArrowRight size={16} /></Link></section>
  </div></div>;
}
