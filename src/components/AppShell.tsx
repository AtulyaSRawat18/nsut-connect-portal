"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const entry = ["/", "/login", "/signup"].includes(usePathname());
  return (
    <>
      {!entry && <Navbar />}
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      {!entry && <Footer />}
    </>
  );
}
