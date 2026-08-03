import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline py-12 px-8 transition-colors">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-3">
            <img 
              alt="NSUT Logo" 
              className="h-10 w-10 object-contain dark:opacity-90" 
              src="/nsut-logo.png"
            />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-foreground uppercase">
                NSUT Connect<sub className="text-[9px] ml-0.5 lowercase font-bold text-foreground/70">-by IQAC</sub>
              </span>
              <span className="text-[10px] text-foreground/50 uppercase font-semibold">Research Collaboration Prototype</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <Link href="https://nsut.ac.in" className="text-xs font-bold text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors">University Site</Link>
            <Link href="/ethics" className="text-xs font-bold text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors">Ethics Committee</Link>
            <Link href="/ip-policy" className="text-xs font-bold text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors">IP Policy</Link>
            <Link href="/contact" className="text-xs font-bold text-foreground/50 hover:text-primary uppercase tracking-widest transition-colors">Contact</Link>
          </div>
        </div>
        <div className="border-t border-outline pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-foreground/40 text-[11px] uppercase font-semibold tracking-widest">
            © 2026 NSUT Connect prototype. Institutional review pending.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-foreground/40 hover:text-primary transition-colors text-[11px] font-bold uppercase tracking-widest">Privacy</Link>
            <Link href="/terms" className="text-foreground/40 hover:text-primary transition-colors text-[11px] font-bold uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
