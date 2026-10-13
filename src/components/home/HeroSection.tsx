import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EditorialLink } from "@/components/ui/EditorialLink";

export function HeroSection() {
  return (
    <section className="relative bg-ivory text-navy-900 overflow-hidden py-8 sm:py-12 lg:py-14 border-b border-navy-900/10">
      {/* Subtle ambient lighting accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(197,160,89,0.09)_0%,_transparent_70%)] pointer-events-none" />

      <div className="container-editorial relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center animate-fade-up">
          {/* 1. Kutchmitra / Janmabhoomi Group Organizer Logo — significantly increased size */}
          <div className="relative w-[280px] sm:w-[360px] md:w-[440px] lg:w-[480px] xl:w-[500px] h-[70px] sm:h-[90px] md:h-[110px] lg:h-[120px] xl:h-[125px]">
            <Image
              src="/assets/branding/kutchmitra-logo.png"
              alt="Kutchmitra - Janmabhoomi Group"
              fill
              priority
              sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, (max-width: 1024px) 440px, 500px"
              className="object-contain object-center"
            />
          </div>

          {/* 2. "Presents" Relationship */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 my-2 sm:my-2.5">
            <span className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-gold-500/50" />
            <span className="font-display italic text-base sm:text-lg text-gold-600 tracking-wider">
              Presents
            </span>
            <span className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>

          {/* 3. Official Kutchmitra Home & Decor Awards 2026 Logo */}
          <div className="relative w-64 sm:w-72 md:w-80 lg:w-[340px] aspect-square drop-shadow-sm">
            <Image
              src="/assets/branding/home-decor-awards-2026-logo.png"
              alt="Kutchmitra Home & Decor Awards 2026"
              fill
              priority
              sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 340px"
              className="object-contain object-center"
            />
          </div>

          {/* 4. Short Positioning Statement */}
          <div className="space-y-2 pt-3 sm:pt-4 max-w-2xl">
            <p className="body-editorial text-[#4A4F5C] text-base sm:text-lg md:text-xl leading-relaxed">
              Recognizing excellence across architecture, interior design, residential design, craftsmanship and spatial innovation.
            </p>
          </div>

          {/* 5. CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-5">
            <Button
              href="/register"
              variant="primary"
              size="lg"
              icon={<ArrowRight size={15} />}
            >
              Nominate Now
            </Button>
            <Button
              href="/categories"
              variant="outline-dark"
              size="lg"
            >
              Explore Categories
            </Button>
            <EditorialLink
              href="/about"
              theme="light"
              showArrow
              className="sm:ml-2 text-sm"
            >
              About the Awards
            </EditorialLink>
          </div>

          {/* 6. Subtle Edition Coordinate Indicator */}
          <div className="pt-5 sm:pt-6 flex items-center justify-center gap-2 text-xs font-mono text-[#4A4F5C]">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-600" />
            <span>12 Official Award Categories &bull; 2026 Edition Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
}
