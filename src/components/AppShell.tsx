"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const entry = ["/", "/login", "/signup"].includes(usePathname());
  return (
    <>
      {!entry && <Navbar />}
      <main id="main-content" tabIndex={-1} className={`flex flex-1 flex-col${entry ? "" : " portal-content"}`}>
        {children}
      </main>
      {!entry && <Footer />}
    </>
  );
}
