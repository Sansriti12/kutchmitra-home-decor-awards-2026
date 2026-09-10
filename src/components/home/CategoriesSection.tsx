import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { AWARD_CATEGORIES } from "@/data/categories";

export function CategoriesSection() {
  return (
    <section id="categories" className="bg-ivory py-16 sm:py-24 lg:py-28 border-b border-navy-900/10">
      <div className="container-editorial space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="02" label="Disciplines &amp; Categories" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              12 Official Award Categories
            </h2>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
            Structured across architecture, interiors, residential innovation, and sustainable craftsmanship for the 2026 edition.
          </p>
        </div>

        {/* 12 Categories Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {AWARD_CATEGORIES.map((category) => (
            <article
              key={category.id}
              className="group relative bg-[#FBFAF7] border border-navy-900/10 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-gold-500/50 hover:shadow-card-hover"
            >
              {/* Category Micro Top Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 tracking-wider bg-sand-100 text-gold-600 border border-gold-500/30">
                    {category.number}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#4A4F5C]">
                    Award Category
                  </span>
                </div>

                {/* Architectural Thumbnail Specimen Placeholder */}
                <div className="relative aspect-[16/9] w-full bg-navy-950 overflow-hidden border border-navy-900/10 transition-colors">
                  <div className="absolute inset-2 border border-white/10 pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400">
                      {category.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans mt-1">
                      Project Dossier Image Specimen
                    </span>
                  </div>
                </div>

                {/* Category Title & Description */}
                <div className="space-y-2 pt-2">
                  <h3 className="font-display text-xl sm:text-2xl text-navy-900 font-medium tracking-tight group-hover:text-gold-600 transition-colors duration-200">
                    {category.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4F5C] leading-relaxed font-sans line-clamp-2">
                    {category.shortDescription}
                  </p>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-6 mt-4 border-t border-navy-900/10 flex items-center justify-between text-xs font-medium">
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-1.5 text-navy-900 group-hover:text-gold-600 font-mono tracking-wide uppercase"
                >
                  <span>Category Details</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/how-to-nominate"
                  className="text-gold-600 hover:text-gold-700 font-mono uppercase text-[11px]"
                >
                  Nominate →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Section Bottom Action */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <p className="text-xs font-mono text-[#4A4F5C] tracking-wide">
            Note: Category criteria and submission guidelines are configured for the 2026 edition.
          </p>
          <Button
            href="/categories"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
          >
            Explore All 12 Categories
          </Button>
        </div>
      </div>
    </section>
  );
}
