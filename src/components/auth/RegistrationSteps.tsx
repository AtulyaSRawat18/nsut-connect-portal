import { Check } from "lucide-react";

const steps = ["Fill details", "Confirm email", "Build profile"];

export default function RegistrationSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Registration progress">
      {steps.map((label, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;
        return <li key={label} className="text-center"><div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${complete ? "border-primary bg-primary text-on-primary" : active ? "border-primary bg-primary/10 text-primary" : "border-outline text-foreground/35"}`}>{complete ? <Check className="h-4 w-4" /> : number}</div><span className={`mt-2 block text-[9px] font-bold uppercase tracking-wider ${active ? "text-primary" : "text-foreground/45"}`}>{label}</span></li>;
      })}
    </ol>
  );
}
