import { Atom, Beaker, BookOpen, Lightbulb, Microscope, Orbit, Rocket, Ruler } from "lucide-react";

const marks = [
  { Icon: Microscope, className: "left-[4%] top-[14%] -rotate-6" },
  { Icon: Atom, className: "left-[17%] top-[5%] rotate-6" },
  { Icon: Beaker, className: "left-[8%] bottom-[12%] rotate-3" },
  { Icon: Rocket, className: "right-[8%] top-[10%] rotate-12" },
  { Icon: Orbit, className: "right-[20%] top-[4%] -rotate-6" },
  { Icon: BookOpen, className: "right-[5%] bottom-[9%] rotate-6" },
  { Icon: Ruler, className: "right-[22%] bottom-[4%] -rotate-12" },
  { Icon: Lightbulb, className: "left-[21%] bottom-[4%] rotate-6" },
];

export default function ResearchBackdrop({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden text-secondary">
      <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(rgba(9,35,70,.16)_0.7px,transparent_0.7px)] [background-size:9px_9px]" />
      <div className="absolute -left-24 -top-32 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      {marks.map(({ Icon, className }) => (
        <Icon key={className} className={`absolute ${className} ${compact ? "h-10 w-10 opacity-[0.055]" : "h-14 w-14 opacity-[0.09] md:h-20 md:w-20"}`} strokeWidth={1.3} />
      ))}
      <svg className="absolute inset-x-0 bottom-0 h-28 w-full opacity-[0.12]" viewBox="0 0 1200 140" preserveAspectRatio="none">
        <path d="M0 108h1200M80 108V55h110v53m15 0V34h145v74m22 0V68h92v40m34 0V22h190v86m18 0V53h108v55m22 0V40h154v68" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M40 108c80-46 133-35 194 0m432 0c98-66 172-55 238 0m146 0c55-40 100-39 150 0" fill="none" stroke="currentColor" strokeDasharray="6 8" strokeWidth="2" />
      </svg>
    </div>
  );
}
