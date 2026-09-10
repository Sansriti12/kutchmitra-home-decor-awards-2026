import React from "react";
import type { Metadata } from "next";
import { ArrowRight, Layers, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

export const metadata: Metadata = {
  title: "About the Awards | Kutchmitra Home & Decor Awards 2026",
  description: "Learn about the mission, evaluation philosophy, and recognition standards of the Kutchmitra Home & Decor Awards 2026.",
};

export default function AboutPage() {
  const VALUES = [
    {
      title: "Design Excellence",
      desc: "Celebrating projects that demonstrate exceptional design thinking, spatial clarity, and functional sophistication.",
    },
    {
      title: "Materiality & Craft",
      desc: "Highlighting nuanced detailing, authentic materials, artisanal craftsmanship, and structural execution.",
    },
    {
      title: "Contextual Responsibility",
      desc: "Honoring built spaces that engage thoughtfully with their environment, climate, orientation, and user needs.",
    },
    {
      title: "Fair & Independent Review",
      desc: "Maintaining confidential, criteria-based assessment conducted by an independent panel of design professionals.",
    },
  ];

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Header Banner */}
      <section className="py-16 sm:py-24 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="About the Awards" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            A Platform to Honor Spatial Distinction &amp; Visionary Craft
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            The Kutchmitra Home &amp; Decor Awards 2026 was created to establish a dedicated honors platform for architects, interior designers, and project studios.
          </p>
        </div>
      </section>

      {/* Purpose & Vision Split */}
      <section className="py-16 sm:py-24 border-b border-navy-900/10">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold block">
                The Objective
              </span>
              <h2 className="heading-editorial text-navy-900 leading-tight">
                Recognizing Excellence Across 12 Design Disciplines
              </h2>
              <p className="body-editorial text-[#4A4F5C]">
                Architecture and interior design shape the quality of human dwelling. The awards aim to document and celebrate works that redefine residential and spatial standards.
              </p>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="p-8 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold-600 font-semibold">
                  Core Proposition
                </span>
                <p className="font-display text-2xl text-navy-900 leading-snug">
                  &ldquo;A dedicated digital honours system bringing together public award discovery, transparent multi-step nomination, and independent jury evaluation.&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-sm font-sans text-[#4A4F5C] leading-relaxed">
                <p>
                  The platform provides a structured digital submission environment where architects and interior studios can present comprehensive dossiers, high-resolution photographs, floor plans, and design narratives.
                </p>
                <p>
                  Every submission is processed through technical verification before undergoing confidential evaluation by an independent jury, ensuring that recognition is based entirely on merit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Award Philosophy & Values Grid */}
      <section className="py-16 sm:py-24 bg-[#FBFAF7] border-b border-navy-900/10">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="02" label="Guiding Principles" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Evaluation Philosophy
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              The 2026 edition is governed by four core evaluation pillars that guide the jury review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-navy-900/10 space-y-3 hover:border-gold-500/40 transition-colors"
              >
                <span className="font-mono text-xs text-gold-600 font-semibold">
                  0{idx + 1}
                </span>
                <h3 className="font-display text-xl text-navy-900 font-medium">
                  {val.title}
                </h3>
                <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="py-16 sm:py-24 border-b border-navy-900/10">
        <div className="container-editorial space-y-8">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="03" label="Participation Value" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Why Submit to the Awards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 bg-[#FBFAF7] border border-navy-900/10 space-y-3">
              <span className="font-mono text-xs text-gold-600 font-semibold block">01 // VISIBILITY</span>
              <h3 className="font-display text-xl text-navy-900 font-medium">Professional Recognition</h3>
              <p className="text-sm text-[#4A4F5C] font-sans leading-relaxed">
                Gain dedicated platform recognition for completed works among industry professionals and design practitioners.
              </p>
            </div>

            <div className="p-7 bg-[#FBFAF7] border border-navy-900/10 space-y-3">
              <span className="font-mono text-xs text-gold-600 font-semibold block">02 // ARCHIVE</span>
              <h3 className="font-display text-xl text-navy-900 font-medium">Curated Project Dossier</h3>
              <p className="text-sm text-[#4A4F5C] font-sans leading-relaxed">
                Showcase spatial concepts, blueprints, and photographic execution through an editorial-grade presentation.
              </p>
            </div>

            <div className="p-7 bg-[#FBFAF7] border border-navy-900/10 space-y-3">
              <span className="font-mono text-xs text-gold-600 font-semibold block">03 // BENCHMARK</span>
              <h3 className="font-display text-xl text-navy-900 font-medium">Independent Evaluation</h3>
              <p className="text-sm text-[#4A4F5C] font-sans leading-relaxed">
                Have your work assessed against defined benchmarks of design thinking, usability, and craftsmanship.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center gap-4">
            <Button href="/register" variant="primary" size="md" icon={<ArrowRight size={14} />}>
              Nominate Now
            </Button>
            <Button href="/categories" variant="outline-dark" size="md">
              View Categories
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
