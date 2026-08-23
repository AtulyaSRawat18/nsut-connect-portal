import { Building2, Calendar, User } from "lucide-react";
import Link from "next/link";
import { getDepartmentCompactLabel } from "@/lib/departments";

interface ProjectCardProps {
  id: string;
  title: string;
  department: string;
  mentor: string;
  deadline: string;
  tags: string[];
}

export default function ProjectCard({ id, title, department, mentor, deadline, tags }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-surface-low rounded-lg p-6 transition-all duration-300 group-hover:bg-surface-lowest group-hover:shadow-[0_20px_50px_rgba(0,30,64,0.1)] group-hover:-translate-y-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="text-[9px] font-sans font-black tracking-widest uppercase px-2 py-0.5 rounded-sm bg-primary/5 text-primary">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-display font-black text-primary leading-tight mb-4 group-hover:text-foreground transition-colors">
          {title}
        </h3>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2 text-foreground/50">
            <Building2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase">{getDepartmentCompactLabel(department)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-foreground/50">
            <User className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase">{mentor}</span>
          </div>
          
          <div className="flex items-center gap-2 text-primary/70">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase">Deadline: {deadline}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
