import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-background pt-20 pb-16 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Institutional Research Portal
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-black text-primary leading-[1.1] tracking-tight mb-8">
              Connecting <br />
              <span className="text-foreground">Research &</span> <br />
              Opportunity.
            </h1>
            
            <p className="max-w-xl mx-auto lg:mx-0 text-lg text-foreground/70 font-sans leading-relaxed mb-12">
              NSUT Connect bridges the gap between students and faculty, 
              fostering a transparent ecosystem for pioneering academic 
              collaboration and innovative development.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/projects"
                className="group bg-primary text-white px-10 py-4 font-sans font-bold tracking-widest text-[11px] uppercase rounded-sm flex items-center gap-3 transition-all hover:bg-primary-container shadow-xl shadow-primary/20"
              >
                Find Projects
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/faculty"
                className="px-10 py-4 font-sans font-bold tracking-widest text-[11px] uppercase text-primary hover:bg-primary/5 transition-all rounded-sm"
              >
                Faculty Directory
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="relative aspect-square w-full max-w-[500px] mx-auto">
              {/* Asymmetric Image Container */}
              <div className="absolute inset-0 bg-primary/10 rounded-2xl -rotate-6" />
              <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl border-l-4 border-primary max-w-[200px]">
                <p className="text-[24px] font-display font-black text-primary leading-none mb-1">450+</p>
                <p className="text-[9px] font-sans font-bold tracking-widest text-foreground/50 uppercase leading-tight">
                  Active projects seeking researchers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
