"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Categories", href: "/categories" },
  { label: "How to Nominate", href: "/how-to-nominate" },
  { label: "Jury", href: "/jury" },
  { label: "Important Dates", href: "/important-dates" },
  { label: "FAQs", href: "/faqs" },
  { label: "Winners", href: "/winners" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll state for refined backdrop blur and shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-navy-950/95 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-navy-950 border-b border-white/10"
      )}
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-3">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="group flex flex-col focus-visible:outline-none flex-shrink-0"
            aria-label="Kutchmitra Home & Decor Awards 2026 Home"
          >
            <span className="font-mono text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase group-hover:text-gold-400 transition-colors duration-200">
              Kutchmitra
            </span>
            <span className="font-display text-base sm:text-lg 2xl:text-xl font-semibold tracking-tight text-white group-hover:text-gold-300 transition-colors duration-200 whitespace-nowrap">
              Home &amp; Decor Awards <span className="text-gold-500 font-sans text-xs sm:text-sm font-medium">2026</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden xl:flex items-center gap-2 2xl:gap-3.5 flex-nowrap"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap text-[11px] 2xl:text-xs tracking-wider uppercase font-medium transition-colors duration-150 relative py-1 px-1.5",
                    isActive
                      ? "text-gold-400 font-semibold"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gold-500"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Applicant Login + Nominate Now */}
          <div className="hidden lg:flex items-center gap-2.5 2xl:gap-3.5 flex-nowrap flex-shrink-0">
            <Link
              href="/login"
              className="whitespace-nowrap inline-flex items-center gap-1 text-[11px] 2xl:text-xs tracking-wider uppercase font-medium text-slate-300 hover:text-gold-400 px-2 py-1 transition-colors duration-150"
            >
              <User size={13} className="text-gold-500/80 flex-shrink-0" />
              <span className="whitespace-nowrap">Applicant Portal</span>
            </Link>

            <Button
              href="/register"
              variant="primary"
              size="sm"
              icon={<ArrowRight size={12} />}
              className="whitespace-nowrap !min-h-[34px] !px-3.5 !py-1 text-[11px] font-semibold tracking-wider"
            >
              Nominate Now
            </Button>
          </div>

          {/* Mobile Actions: Nominate Button + Hamburger Toggle */}
          <div className="flex xl:hidden items-center gap-2.5">
            <Button
              href="/register"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex whitespace-nowrap !min-h-[32px] !px-3 !py-1 text-xs"
            >
              Nominate
            </Button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="xl:hidden fixed inset-x-0 top-[calc(4rem+1px)] lg:top-[calc(4.5rem+1px)] bottom-0 z-50 bg-navy-950/98 backdrop-blur-lg border-t border-white/10 overflow-y-auto animate-fade-up"
        >
          <div className="container-editorial py-6 flex flex-col min-h-full justify-between gap-8">
            <nav aria-label="Mobile Navigation" className="flex flex-col divide-y divide-white/5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "py-3.5 text-base font-medium tracking-wide flex items-center justify-between transition-colors",
                      isActive
                        ? "text-gold-400 font-semibold pl-2 border-l-2 border-gold-500"
                        : "text-slate-200 hover:text-white"
                    )}
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={14} className={isActive ? "text-gold-400" : "text-slate-600"} />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer Actions */}
            <div className="pt-6 border-t border-white/10 space-y-3 pb-8">
              <Button
                href="/register"
                variant="primary"
                size="md"
                className="w-full"
                icon={<ArrowRight size={14} />}
              >
                Nominate Now
              </Button>

              <Button
                href="/login"
                variant="secondary"
                size="md"
                className="w-full"
                icon={<User size={14} />}
              >
                Applicant Portal Login
              </Button>

              <p className="text-[11px] text-center text-slate-500 font-mono tracking-wider uppercase pt-2">
                Kutchmitra Home &amp; Decor Awards 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
