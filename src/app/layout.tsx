import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kutchmitra Home & Decor Awards 2026",
  description:
    "Celebrating excellence and visionary craftsmanship in architecture, interior design, and residential spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans bg-ivory text-navy-900 flex flex-col antialiased selection:bg-gold-500 selection:text-navy-950">
        <AnnouncementBar />
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
