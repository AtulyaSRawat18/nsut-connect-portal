import { ShieldCheck, FileText, Scale, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Ethics() {
  const guidelines = [
    { title: "Institutional Research Ethics", code: "NSUT-RE-2024", description: "Standard operating procedures for all academic research involving data and security." },
    { title: "Intellectual Property Policy", code: "NSUT-IP-112", description: "Guidelines for patent filing, software copyright, and commercialization of research." },
    { title: "Code of Conduct", code: "NSUT-CC-09", description: "Mandatory ethical conduct standards for faculty and student researchers." },
  ];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-start">
           <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-display font-black text-primary mb-6 tracking-tight">Compliance & Ethics</h1>
              <p className="text-foreground/70 text-lg leading-relaxed mb-12">Netaji Subhas University of Technology is committed to the highest standards of research integrity and transparency. All active projects must adhere to our institutional guidelines.</p>
              
              <div className="space-y-8">
                 {guidelines.map((g, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="w-12 h-12 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-sm">
                          <FileText className="w-6 h-6" />
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-xl font-bold text-foreground">{g.title}</h3>
                             <span className="text-[10px] font-black text-primary uppercase tracking-widest">{g.code}</span>
                          </div>
                          <p className="text-sm text-foreground/50 mb-4">{g.description}</p>
                          <Link href="#" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">
                             Download PDF <ArrowRight className="w-4 h-4" />
                          </Link>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="w-full lg:w-1/3 bg-surface border border-outline p-10 rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-primary mb-6" />
              <h4 className="text-xl font-display font-bold text-foreground mb-4">Ethical Review Board</h4>
              <p className="text-sm text-foreground/70 mb-8 leading-relaxed">Required for all projects involving human participants, medical data, or sensitive institutional datasets.</p>
              <button className="w-full bg-primary text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all rounded shadow-lg shadow-primary/20">
                Request Review
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
