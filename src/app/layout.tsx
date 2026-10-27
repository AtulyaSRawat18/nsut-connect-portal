import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: { default: "NSUT Research Network", template: "%s | NSUT Research Network" },
  applicationName: "NSUT Research Network",
  description: "A research community for NSUT students and faculty to share knowledge, discover collaborators, and turn curiosity into interdisciplinary research.",
  icons: {
    icon: { url: "/nsut-research-network-logo.png", type: "image/png", sizes: "640x640" },
    shortcut: "/nsut-research-network-logo.png",
    apple: "/nsut-research-network-logo.png",
  },
  openGraph: {
    title: "NSUT Research Network",
    siteName: "NSUT Research Network",
    description: "Shared curiosity. Meaningful research. Connect with people, projects, and ideas across NSUT.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-on-surface font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
