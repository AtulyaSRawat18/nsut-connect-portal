import { Users, Search, Filter, Mail, Globe } from "lucide-react";
import Link from "next/link";

export default function FacultyDirectory() {
  const faculty = [
    { name: "Dr. Anita Sharma", role: "Professor", dept: "CSE", email: "asharma@nsut.ac.in", research: "AI & Machine Learning" },
    { name: "Dr. Ramesh Kumar", role: "Associate Professor", dept: "ECE", email: "rkumar@nsut.ac.in", research: "Smart Grids" },
    { name: "Dr. Sunita Bansal", role: "Professor", dept: "IT", email: "sbansal@nsut.ac.in", research: "Computer Vision" },
  ];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-display font-black text-primary mb-4 tracking-tight">Faculty Directory</h1>
        <p className="text-foreground/70 mb-12 max-w-2xl">Connect with NSUT researchers and find the right mentor for your academic journey.</p>
        
        <div className="bg-surface border border-outline p-4 flex items-center gap-4 mb-12">
          <Search className="w-5 h-5 text-foreground/50 ml-2" />
          <input type="text" placeholder="Search by name, department, or research area..." className="w-full bg-transparent border-none focus:ring-0 text-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculty.map((f, i) => (
            <div key={i} className="bg-surface border border-outline p-8 hover:border-primary transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {f.name.split(' ')[1][0]}
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{f.name}</h3>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{f.role} • {f.dept}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/70 mb-6 font-medium italic">&quot;{f.research}&quot;</p>
              <div className="flex gap-4">
                <Link href={`mailto:${f.email}`} className="text-primary hover:underline flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Mail className="w-4 h-4" /> Email
                </Link>
                <Link href="#" className="text-primary hover:underline flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Globe className="w-4 h-4" /> Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
