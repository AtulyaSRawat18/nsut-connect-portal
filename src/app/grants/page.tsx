import { Landmark, Calendar, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Grants() {
  const grants = [
    { title: "SERB Core Research Grant", agency: "Govt. of India", amount: "₹45.5 Lakhs", deadline: "May 2026" },
    { title: "Institutional Innovation Seed Fund", agency: "NSUT R&D", amount: "₹5 Lakhs", deadline: "Open" },
    { title: "DST-INSPIRE Faculty Fellowship", agency: "DST", amount: "Full Stipend", deadline: "June 2026" },
  ];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-display font-black text-primary mb-4 tracking-tight">Research Grants & Funding</h1>
        <p className="text-foreground/70 mb-12 max-w-2xl">Discover internal and external funding opportunities to support your pioneering research at Netaji Subhas University of Technology.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {grants.map((g, i) => (
            <div key={i} className="bg-surface border border-outline p-8 rounded-xl hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">{g.title}</h3>
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/50">
                    <span>Agency</span>
                    <span className="text-foreground">{g.agency}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/50">
                    <span>Amount</span>
                    <span className="text-primary">{g.amount}</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-black text-secondary tracking-widest uppercase">
                    <Calendar className="w-4 h-4" /> Final Date: {g.deadline}
                 </div>
              </div>
              <Link href="#" className="flex items-center justify-center gap-2 w-full bg-secondary text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all rounded">
                Apply for Grant <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
