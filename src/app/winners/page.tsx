import React from "react";
import type { Metadata } from "next";
import { Award, Clock, ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Winners Showcase | Kutchmitra Home & Decor Awards 2026",
  description: "Official winners archive and project showcase for the Kutchmitra Home & Decor Awards 2026.",
};

export default function WinnersPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Honors Archive" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            2026 Winners Showcase
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Winner announcements will be published here following the completion of the awards process.
          </p>
        </div>
      </section>

      {/* Elegant Pre-Event Showcase Placeholder */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10">
        <div className="container-editorial max-w-3xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 mx-auto bg-sand-100 border border-gold-500/30 flex items-center justify-center text-gold-600">
            <Award size={32} />
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl text-navy-900 font-medium tracking-tight">
              Awaiting Official Announcement
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#4A4F5C] leading-relaxed max-w-xl mx-auto">
              Winner announcements will be published here following the completion of the awards process. Following jury evaluation and the gala ceremony, comprehensive project spotlights, citations, and architect profiles will be featured in this dedicated gallery.
            </p>
          </div>

          <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 text-xs font-mono text-[#4A4F5C] max-w-lg mx-auto space-y-2">
            <span className="text-gold-600 font-semibold block uppercase tracking-wider">
              2026 Edition Pipeline
            </span>
            <p>
              Nomination submissions will proceed through technical verification, independent jury scoring, and shortlisting prior to final winner selection.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button href="/categories" variant="outline-dark" size="md">
              Explore 13 Categories
            </Button>
            <Button href="/register" variant="primary" size="md" icon={<ArrowRight size={14} />}>
              Nominate Now
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
