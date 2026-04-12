import Link from 'next/link';
import Hero from '@/components/home/Hero';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors">
      <Hero />

      {/* Institutional Links */}
      <section className="py-20 px-8 bg-background transition-colors">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-3">Institutional Resource</h2>
              <h3 className="text-3xl font-bold text-foreground">A Unified Research Ecosystem</h3>
            </div>
            <Link href="/projects" className="text-primary font-bold text-sm uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-primary-dark hover:border-primary-dark transition-all">
              View All Projects →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-outline">
            {/* Link Card 1 */}
            <div className="p-10 hover:bg-surface transition-colors border-r-0 md:border-r border-b md:border-b-0 border-outline last:border-r-0 last:border-b-0">
              <div className="text-primary font-extrabold text-[28px] mb-4">⚲</div>
              <h4 className="text-xl font-bold mb-4 text-foreground">Faculty Directory</h4>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">Access comprehensive profiles of NSUT faculty members, their research specializations, and publication history.</p>
              <Link href="/faculty" className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Find a Mentor</Link>
            </div>
            {/* Link Card 2 */}
            <div className="p-10 hover:bg-surface transition-colors border-r-0 md:border-r border-b md:border-b-0 border-outline last:border-r-0 last:border-b-0">
              <div className="text-primary font-extrabold text-[28px] mb-4">◳</div>
              <h4 className="text-xl font-bold mb-4 text-foreground">Active Projects</h4>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">Explore ongoing research initiatives across various engineering and technology departments seeking student researchers.</p>
              <Link href="/projects" className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Browse Listings</Link>
            </div>
            {/* Link Card 3 */}
            <div className="p-10 hover:bg-surface transition-colors border-r-0 md:border-r border-b md:border-b-0 border-outline last:border-r-0 last:border-b-0">
              <div className="text-primary font-extrabold text-[28px] mb-4">✓</div>
              <h4 className="text-xl font-bold mb-4 text-foreground">Compliance &amp; Ethics</h4>
              <p className="text-foreground/70 text-sm leading-relaxed mb-6">Institutional guidelines for research ethics, IP policy, and project management standards at NSUT.</p>
              <Link href="/ethics" className="text-primary font-bold text-xs uppercase tracking-widest hover:underline">Read Guidelines</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary py-16 px-8 transition-colors">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-primary text-4xl font-extrabold mb-2">450+</p>
            <p className="text-on-secondary/70 text-xs font-bold uppercase tracking-widest">Active Projects</p>
          </div>
          <div className="text-center border-l border-on-secondary/10">
            <p className="text-primary text-4xl font-extrabold mb-2">1,200+</p>
            <p className="text-on-secondary/70 text-xs font-bold uppercase tracking-widest">Research Students</p>
          </div>
          <div className="text-center border-l md:border-on-secondary/10 border-transparent">
            <p className="text-primary text-4xl font-extrabold mb-2">890</p>
            <p className="text-on-secondary/70 text-xs font-bold uppercase tracking-widest">Publications</p>
          </div>
          <div className="text-center border-l border-on-secondary/10">
            <p className="text-primary text-4xl font-extrabold mb-2">34</p>
            <p className="text-on-secondary/70 text-xs font-bold uppercase tracking-widest">Patents Pending</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 border-t border-outline bg-background transition-colors">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Advance Your Research at NSUT</h2>
          <p className="text-foreground/70 text-lg mb-12 max-w-2xl mx-auto">
            Whether you are a faculty member initiating a project or a student seeking to contribute, the research portal is your primary gateway.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/projects/new" className="bg-primary text-on-primary px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg">
              New Project Proposal
            </Link>
            <Link href="/contact" className="border border-foreground text-foreground px-12 py-4 text-sm font-bold uppercase tracking-widest hover:bg-surface transition-all">
              Contact Research Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
