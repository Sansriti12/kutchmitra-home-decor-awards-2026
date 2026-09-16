import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export function JuryPreviewSection() {
  return (
    <section className="bg-navy-950 text-white py-12 sm:py-16 relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(197,160,89,0.08)_0%,_transparent_50%)] pointer-events-none" />

      <div className="container-editorial relative z-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Heading & Neutral statement (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <SectionMarker number="06" label="Evaluation" theme="dark" />
            <h2 className="heading-editorial text-white leading-tight">
              Independent Jury Evaluation
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-lg">
              Entries will be evaluated through a confidential scoring framework upholding rigorous benchmarks of design thinking, functionality, and craftsmanship.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs font-mono text-gold-400">
              <ShieldCheck size={14} />
              <span>Jury profiles will be announced by Kutchmitra.</span>
            </div>
          </div>

          {/* Right: Action & Placeholder Card (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-navy-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>EVALUATION FRAMEWORK</span>
              <span className="text-gold-400 font-semibold">EDITION 2026</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The jury panel will comprise distinguished experts across architecture, interior design, and residential development.
            </p>
            <Button
              href="/jury"
              variant="secondary"
              size="md"
              icon={<ArrowRight size={14} />}
              className="w-full"
            >
              Jury &amp; Evaluation Overview
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
