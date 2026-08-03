import { Mail, Phone, MapPin, Shield, Users, Target } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="py-24 px-8 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-display font-black mb-8 tracking-tight">Mission & Vision</h1>
          <p className="text-xl text-white/70 leading-relaxed font-medium">
            NSUT Connect is a pioneering digital infrastructure designed to bridge the gap between academic research 
            and real-world opportunity, fostering a transparent, community-driven ecosystem for innovation.
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-24 px-8 border-b border-outline">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
             <h2 className="text-xs font-black text-primary tracking-[0.3em] uppercase mb-4">The Platform</h2>
             <h3 className="text-4xl font-display font-black text-foreground mb-8 leading-tight">Empowering Every Researcher.</h3>
             <p className="text-foreground/70 text-lg leading-relaxed mb-8">
               Our portal provides a unified interface for students to discover faculty-led projects, apply with verified credentials, and engage in high-impact intellectual discourse. Structured workflows keep applications clear, attributable, and easy for faculty to review.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                   <Shield className="w-6 h-6 text-primary flex-shrink-0" />
                   <div>
                      <h4 className="font-bold text-foreground">Verified Profiles</h4>
                      <p className="text-sm text-foreground/50">Only institutional members can contribute to the core ecosystem.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <Target className="w-6 h-6 text-primary flex-shrink-0" />
                   <div>
                      <h4 className="font-bold text-foreground">Structured Collaboration</h4>
                      <p className="text-sm text-foreground/50">Clear project requirements and application workflows connect skills with research needs.</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="bg-surface rounded-3xl aspect-square flex items-center justify-center border-2 border-dashed border-outline">
             <div className="text-center p-12">
                <Users className="w-16 h-16 text-primary/30 mx-auto mb-6" />
                <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs">Join 2,500+ NSUT Active Researchers</p>
             </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-1">
                 <h2 className="text-3xl font-display font-black text-foreground mb-8">Get in Touch</h2>
                 <p className="text-foreground/70 mb-12">For institutional inquiries, partnership proposals, or technical support, please reach out via our official Research Office channels.</p>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 text-foreground/70 text-sm font-bold">
                       <Mail className="w-5 h-5 text-primary" /> research.office@nsut.ac.in
                    </div>
                    <div className="flex items-center gap-4 text-foreground/70 text-sm font-bold">
                       <Phone className="w-5 h-5 text-primary" /> +91 011 2500 0212
                    </div>
                    <div className="flex items-center gap-4 text-foreground/70 text-sm font-bold">
                       <MapPin className="w-5 h-5 text-primary" /> Azad Hind Fauj Marg, Sector 3, Dwarka
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-2">
                 <form className="bg-background p-10 border border-outline rounded-2xl shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Full Name</label>
                          <input type="text" className="w-full bg-surface border border-outline p-4 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="John Doe" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Email Address</label>
                          <input type="email" className="w-full bg-surface border border-outline p-4 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="john@nsut.ac.in" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Subject</label>
                       <input type="text" className="w-full bg-surface border border-outline p-4 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Research Partnership" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Message</label>
                       <textarea rows={5} className="w-full bg-surface border border-outline p-4 rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Describe your inquiry..." />
                    </div>
                    <button className="bg-primary text-white px-10 py-4 font-bold uppercase tracking-widest text-xs rounded hover:bg-primary-dark transition-all w-full md:w-auto">
                       Send Message
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </section>
      
      {/* Footer Branding */}
      <footer className="py-12 border-t border-outline text-center">
         <div className="flex justify-center items-center gap-2 mb-4">
            <span className="text-primary font-black tracking-tighter text-2xl">NSUT</span>
            <span className="text-foreground/20 font-light text-2xl">|</span>
            <span className="text-foreground/50 font-bold uppercase tracking-widest text-[10px]">Research Portal</span>
         </div>
         <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">© 2026 NSUT Connect prototype</p>
      </footer>
    </div>
  );
}
