import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";

const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Categories", href: "/categories" },
  { label: "How to Nominate", href: "/how-to-nominate" },
  { label: "Jury", href: "/jury" },
  { label: "Important Dates", href: "/important-dates" },
];

const PORTAL_LINKS = [
  { label: "Applicant Login", href: "/login" },
  { label: "Registration", href: "/register" },
  { label: "FAQs", href: "/faqs" },
  { label: "Winners", href: "/winners" },
  { label: "Contact", href: "/contact" },
];

const CATEGORIES_SAMPLE = [
  "Architect of the Year",
  "Best Luxury Residence",
  "Best Apartment Design",
  "Best Renovation Project",
  "Best Sustainable Home",
  "Ultra-Luxury Residential",
  "Interior Designer of the Year",
  "Emerging Designer",
  "Best Compact Home",
  "Best Smart Home",
  "Best Themed Project",
  "Luxury Villa Project",
];

export function Footer() {
  return (
    <footer className="bg-[#060B18] text-slate-300 border-t border-white/15 mt-auto">
      {/* Top Hairline Gold Accent */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="container-editorial py-7 sm:py-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Col 1: Concise Brand & Edition (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-400 font-semibold block">
                Kutchmitra
              </span>
              <h3 className="font-display text-xl sm:text-2xl text-white font-medium tracking-tight">
                Home &amp; Decor Awards <span className="text-gold-500 font-sans text-base">2026</span>
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-sans max-w-xs">
              Celebrating architectural innovation, interior design excellence, and craftsmanship.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/10 bg-navy-900/60 text-[11px] font-mono text-slate-300">
              <Award size={12} className="text-gold-400" />
              <span>2026 Edition Platform</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs font-sans">
              {NAVIGATION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-gold-400 transition-colors duration-150 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Portal & Support (2 cols) */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold">
              Portal
            </h4>
            <ul className="space-y-1.5 text-xs font-sans">
              {PORTAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-gold-400 transition-colors duration-150 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Categories & Secretariat Notice (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-white font-semibold">
                12 Categories
              </h4>
              <Link
                href="/categories"
                className="text-[10px] font-mono uppercase tracking-wider text-gold-400 hover:text-gold-300"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400 font-sans">
              {CATEGORIES_SAMPLE.slice(0, 6).map((cat) => (
                <span key={cat} className="truncate">
                  • {cat}
                </span>
              ))}
            </div>
            <div className="p-2.5 bg-navy-900/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-gold-400 font-mono text-[10px] uppercase tracking-wider block font-semibold mb-0.5">
                Secretariat Notice
              </span>
              Official helpline &amp; contact info will be published prior to nominations.
            </div>
          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-sans">
          <p>
            &copy; {new Date().getFullYear()} Kutchmitra Home &amp; Decor Awards. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <Link href="/terms" className="hover:text-gold-400 transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/privacy" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-slate-400 italic">
              Provisional edition framework
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
