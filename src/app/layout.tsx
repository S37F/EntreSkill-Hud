import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/client/components/providers";
import { SiteHeader } from "@/client/components/site-header";
import Link from "next/link";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EntreSkill Hub — Skill to startup",
  description:
    "Discover business ideas that fit your skills, follow roadmaps, learn with curated resources, and connect with mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
          <footer className="border-t border-slate-200/80 bg-[var(--surface)] py-10 text-center text-sm text-slate-600">
            <div className="mx-auto max-w-6xl px-4">
              <p className="font-medium text-emerald-800">EntreSkill Hub</p>
              <p className="mt-2 max-w-xl mx-auto">
                Empowering tailoring, crafts, food, repair, digital skills — and beyond — into sustainable micro-businesses.
              </p>
              <Link href="/ideas" className="mt-3 inline-block text-emerald-800 underline">
                Explore ideas
              </Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
