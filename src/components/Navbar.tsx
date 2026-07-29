"use client";

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLogout } from '@/utils/auth';
import { LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const logout = useLogout();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          <Link href="/opportunities" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Opportunities</Link>
          <Link href="/feed" className="text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-primary transition-colors">Feed</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-20 bg-surface animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/80 hover:text-primary transition-all">
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="ml-2 text-foreground/50 hover:text-primary transition-colors p-2"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signup" className="border border-primary text-primary px-4 py-2 text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all">
                Register
              </Link>
              <Link href="/login" className="bg-primary text-on-primary px-5 py-2 text-xs font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
