import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  ArrowLeft,
  MapPin,
  Building,
  User,
  Calendar,
  Share2,
  Award,
} from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { getPublicWinnerDetail } from "@/lib/winners/public-actions";

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const winner = await getPublicWinnerDetail(params.id);
  if (!winner) {
    return {
      title: "Honoree Showcase Not Found | Kutchmitra Awards 2026",
    };
  }

  return {
    title: `${winner.awardTitle}: ${winner.projectName} | Kutchmitra Awards 2026`,
    description: winner.summaryDescription || winner.citation || "Official Kutchmitra Home & Decor Awards 2026 Honoree.",
  };
}

export default async function WinnerDetailPage({ params }: PageProps) {
  const winner = await getPublicWinnerDetail(params.id);

  if (!winner) {
    notFound();
  }

  const isPrimary = winner.winnerType === "winner";

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Top Breadcrumb Bar */}
      <section className="py-4 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial flex items-center justify-between text-xs font-mono text-[#4A4F5C]">
          <Link
            href="/winners"
            className="inline-flex items-center gap-1.5 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to 2026 Winners Showcase</span>
          </Link>
          <span className="text-gold-600 font-semibold uppercase">
            Category {winner.categoryCode} // {winner.categoryName}
          </span>
        </div>
      </section>

      {/* Hero Header Section */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10">
        <div className="container-editorial space-y-8">
          <div className="space-y-4 max-w-4xl">
            {/* Award Honor Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-navy-900 text-gold-400 border border-gold-500/50 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
              <Trophy size={14} className="text-gold-400" />
              <span>
                {winner.awardTitle} // {winner.categoryName}
              </span>
            </div>

            {/* Project Name */}
            <h1 className="heading-display text-navy-900 text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
              {winner.projectName}
            </h1>

            {/* Meta Details: Entrant, Studio & Location */}
            <div className="flex flex-wrap items-center gap-6 text-sm font-sans text-[#4A4F5C] pt-2 border-t border-navy-900/10">
              <div className="flex items-center gap-2">
                <User size={15} className="text-gold-600" />
                <span className="font-semibold text-navy-900">{winner.entrantName}</span>
              </div>

              {winner.organizationName && (
                <div className="flex items-center gap-2">
                  <Building size={15} className="text-gold-600" />
                  <span>{winner.organizationName}</span>
                </div>
              )}

              {winner.projectLocation && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-gold-600" />
                  <span>{winner.projectLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Hero Image Showcase */}
          {winner.heroImageUrl && (
            <div className="relative aspect-[16/9] max-h-[550px] w-full bg-sand-100 overflow-hidden border border-navy-900/10 shadow-sm">
              <img
                src={winner.heroImageUrl}
                alt={winner.projectName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Editorial Content: Citation & Narrative */}
      <section className="py-12 sm:py-16 border-b border-navy-900/10">
        <div className="container-editorial max-w-4xl space-y-12">
          {/* Official Jury Citation */}
          {winner.citation && (
            <div className="p-8 sm:p-10 bg-[#FBFAF7] border-l-4 border-gold-500 border-y border-r border-navy-900/10 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gold-600 font-bold block">
                Official Jury Commendation
              </span>
              <blockquote className="font-display text-xl sm:text-2xl text-navy-900 leading-relaxed italic">
                "{winner.citation}"
              </blockquote>
            </div>
          )}

          {/* Project Narrative & Architectural Story */}
          {winner.projectStory && (
            <div className="space-y-4">
              <SectionMarker number="02" label="Architectural Narrative" theme="light" />
              <h2 className="heading-editorial text-navy-900 text-2xl sm:text-3xl">
                Design Philosophy &amp; Execution
              </h2>
              <div className="body-editorial text-[#4A4F5C] text-base sm:text-lg leading-relaxed whitespace-pre-wrap space-y-4 pt-2">
                {winner.projectStory}
              </div>
            </div>
          )}

          {/* Gallery Showcase if multiple images */}
          {winner.galleryUrls && winner.galleryUrls.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-navy-900/10">
              <SectionMarker number="03" label="Project Photography" theme="light" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {winner.galleryUrls.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-[4/3] bg-sand-100 border border-navy-900/10 overflow-hidden">
                    <img src={imgUrl} alt={`${winner.projectName} - Photography ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="pt-8 border-t border-navy-900/10 flex flex-wrap items-center justify-between gap-4">
            <Button href="/winners" variant="outline-dark" size="md" icon={<ArrowLeft size={13} />}>
              Back to Winners Showcase
            </Button>
            <Button href="/categories" variant="primary" size="md">
              Explore All Categories
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
