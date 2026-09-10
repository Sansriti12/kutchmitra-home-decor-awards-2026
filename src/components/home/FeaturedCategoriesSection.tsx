import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { FEATURED_CATEGORIES } from "@/data/categories";

export function FeaturedCategoriesSection() {
  return (
    <section className="bg-ivory py-12 sm:py-16 border-b border-navy-900/10">
      <div className="container-editorial space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="02" label="Categories Preview" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Featured Award Categories
            </h2>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
            A curated preview of disciplines honored in the 2026 edition, celebrating architectural and interior design excellence.
          </p>
        </div>

        {/* 6 Featured Categories Grid with Strong Architectural Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_CATEGORIES.map((category) => (
            <article
              key={category.id}
              className="group relative bg-[#FBFAF7] border border-navy-900/10 flex flex-col justify-between transition-all duration-300 hover:border-gold-500/50 hover:shadow-card-hover overflow-hidden"
            >
              <div className="space-y-4">
                {/* 1. Architectural Photo */}
                <div className="relative aspect-[16/10] w-full bg-navy-950 overflow-hidden border-b border-navy-900/10">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Category Number Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-navy-950/85 backdrop-blur-sm text-gold-400 border border-gold-500/40">
                      {category.number}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="px-6 pb-2 space-y-2">
                  <h3 className="font-display text-xl sm:text-2xl text-navy-900 font-medium tracking-tight group-hover:text-gold-600 transition-colors duration-200">
                    {category.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4F5C] leading-relaxed font-sans line-clamp-2">
                    {category.shortDescription}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pt-4 pb-5 mt-2 border-t border-navy-900/10 flex items-center justify-between text-xs font-medium">
                <Link
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-1 text-navy-900 group-hover:text-gold-600 font-mono tracking-wide uppercase font-semibold"
                >
                  <span>View Category</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/register"
                  className="text-gold-600 hover:text-gold-700 font-mono uppercase text-[11px] font-semibold"
                >
                  Nominate →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Action: Explore All 12 Categories */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <span className="text-xs font-mono text-[#4A4F5C]">
            Total 12 official categories available for the 2026 edition.
          </span>
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
