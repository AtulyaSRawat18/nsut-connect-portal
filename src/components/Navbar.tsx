import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 w-full z-50 bg-background border-b border-outline transition-colors">
      <nav className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <img 
            alt="NSUT Logo" 
            className="h-12 w-12 object-contain" 
            src="/nsut-logo.png"
          />
          <div className="flex flex-col border-l border-outline pl-4 text-left">
            <span className="text-lg font-extrabold text-primary leading-tight uppercase tracking-tight">
              NSUT Connect
            </span>
            <span className="text-[10px] text-foreground/70 uppercase font-semibold tracking-widest">
              Institutional Portal
            </span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Home</Link>
          <Link href="/projects" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Projects</Link>
          <Link href="/forum" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Forum</Link>
          <Link href="/news" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">News</Link>
          <Link href="/whats-new" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Opportunities</Link>
          <Link href="/developments" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Feed</Link>
          <Link href="/about" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="bg-primary text-on-primary px-5 py-2 text-xs font-black uppercase tracking-[0.2em] hover:bg-primary-dark transition-all">
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}
