import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, Shield, FileText, CheckCircle2 } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { AWARD_CATEGORIES, getCategoryBySlug } from "@/data/categories";

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return AWARD_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: "Category Not Found | Kutchmitra Home & Decor Awards 2026",
    };
  }
  return {
    title: `${category.title} | Kutchmitra Home & Decor Awards 2026`,
    description: category.shortDescription,
  };
}

export default function CategoryDetailPage({ params }: PageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Top Breadcrumb & Navigation */}
      <section className="py-6 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#4A4F5C] hover:text-navy-900 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to All Categories</span>
          </Link>
        </div>
      </section>

      {/* Category Hero */}
      <section className="py-14 sm:py-20 border-b border-navy-900/10">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            {/* Left: Category Info */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold px-2.5 py-1 bg-sand-100 text-gold-600 border border-gold-500/30">
                  CATEGORY {category.number}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-[#4A4F5C]">
                  Official Category
                </span>
              </div>

              <h1 className="heading-display text-navy-900 leading-tight">
                {category.title}
              </h1>

              <p className="body-editorial text-[#4A4F5C] text-lg sm:text-xl leading-relaxed">
                {category.shortDescription}
              </p>

              {/* Status Banner per user requirement */}
              <div className="p-5 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold-600 font-semibold block">
                  Edition 2026 Notice
                </span>
                <p className="text-sm font-sans text-[#4A4F5C] leading-relaxed">
                  Category details will be published as the 2026 edition guidelines are finalized.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button href="/register" variant="primary" size="md" icon={<ArrowRight size={14} />}>
                  Nominate in this Category
                </Button>
                <Button href="/how-to-nominate" variant="outline-dark" size="md">
                  Nomination Guidelines
                </Button>
              </div>
            </div>

            {/* Right: Submission Details Card with Architectural Photo */}
            <div className="lg:col-span-4 p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-5">
              <div className="relative aspect-[16/10] w-full bg-navy-950 overflow-hidden border border-navy-900/10">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-gold-400 block">
                    Category {category.number}
                  </span>
                  <p className="font-display text-base text-white font-medium truncate">
                    {category.title}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-sans text-[#4A4F5C]">
                <span className="font-mono uppercase text-[11px] tracking-wider text-navy-900 font-semibold block">
                  Supported Submission Materials
                </span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-gold-600 flex-shrink-0 mt-0.5" />
                    <span>Cover Image &amp; Project Photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-gold-600 flex-shrink-0 mt-0.5" />
                    <span>Interior &amp; Exterior Photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-gold-600 flex-shrink-0 mt-0.5" />
                    <span>Floor Plans &amp; Architectural Drawings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-gold-600 flex-shrink-0 mt-0.5" />
                    <span>3D Views, Renderings &amp; Portfolio Brochure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-gold-600 flex-shrink-0 mt-0.5" />
                    <span>Supporting Documentation</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-navy-900/10 space-y-1">
                <p className="text-[11px] font-sans text-[#4A4F5C] italic leading-relaxed">
                  Detailed submission and file specifications will be confirmed by the organizing committee.
                </p>
                <span className="text-[10px] font-mono text-slate-400 block pt-1">
                  CONFIDENTIAL JURY EVALUATION
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
