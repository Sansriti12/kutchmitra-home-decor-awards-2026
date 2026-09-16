import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { AWARD_CATEGORIES } from "@/data/categories";

export const metadata: Metadata = {
  title: "Award Categories | Kutchmitra Home & Decor Awards 2026",
  description: "Browse the 12 official award categories celebrating architecture, interior design, and residential craftsmanship in the 2026 edition.",
};

export default function CategoriesPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Award Directory" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            12 Official Award Categories
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Explore the complete spectrum of award disciplines recognizing built residential architecture, interior environments, and spatial innovations.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container-editorial space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {AWARD_CATEGORIES.map((category) => (
              <article
                key={category.id}
                className="group relative bg-[#FBFAF7] border border-navy-900/10 p-7 flex flex-col justify-between transition-all duration-300 hover:border-gold-500/50 hover:shadow-card-hover"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-sand-100 text-gold-600 border border-gold-500/30">
                      {category.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#4A4F5C]">
                      Award Category
                    </span>
                  </div>

                  {/* Architectural Image */}
                  <div className="relative aspect-[16/10] w-full bg-navy-950 overflow-hidden border border-navy-900/10">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-2xl text-navy-900 font-medium tracking-tight group-hover:text-gold-600 transition-colors">
                      {category.title}
                    </h2>
                    <p className="text-sm text-[#4A4F5C] leading-relaxed font-sans">
                      {category.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-navy-900/10 flex items-center justify-between text-xs font-mono">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center gap-1.5 text-navy-900 group-hover:text-gold-600 tracking-wide uppercase font-semibold"
                  >
                    <span>View Category</span>
                    <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <Link
                    href="/register"
                    className="text-gold-600 hover:text-gold-700 uppercase"
                  >
                    Nominate →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom Note */}
          <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#4A4F5C]">
            <span>Official nomination guidelines and category details are published for the 2026 edition.</span>
            <Button href="/register" variant="primary" size="sm" icon={<ArrowRight size={13} />}>
              Nominate Now
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
