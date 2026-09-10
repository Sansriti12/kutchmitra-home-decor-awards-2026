import React from "react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Compass, Maximize2, Layers } from "lucide-react";

export function ArchitecturalShowcaseSection() {
  const PILLARS = [
    { label: "Architecture", desc: "Structural form, climate orientation & spatial volume" },
    { label: "Interiors", desc: "Bespoke furnishings, curated textures & ambient lighting" },
    { label: "Craftsmanship", desc: "Material integrity, artisanal joinery & meticulous detail" },
    { label: "Home & Decor", desc: "Elevated residential living & contextual harmony" },
  ];

  return (
    <section className="bg-ivory py-16 sm:py-24 lg:py-28 border-b border-navy-900/10 overflow-hidden">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Architectural Composition (6 cols) */}
          <div className="lg:col-span-6 relative">
            {/* Fine Outer Framing Hairline */}
            <div className="absolute -inset-4 border border-navy-900/10 pointer-events-none" />

            <div className="relative aspect-[16/10] bg-navy-950 text-white overflow-hidden border border-navy-900/10 shadow-card">
              {/* Architectural Grid Details */}
              <div className="absolute inset-4 border border-white/10 pointer-events-none" />
              <div className="absolute top-4 right-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-gold-400">
                <Maximize2 size={12} />
                <span>SPATIAL ELEVATION</span>
              </div>

              {/* Central Architectural Motif */}
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">
                    Design Principles
                  </span>
                  <p className="font-display text-2xl text-white font-medium">
                    Form, Materiality &amp; Scale
                  </p>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4">
                  <span className="font-mono text-[10px] text-gold-400 uppercase tracking-widest block">
                    Curated Project Feature
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-sm">
                    High-resolution architectural photography of submitted residential and interior works will occupy this dedicated showcase.
                  </p>
                </div>
              </div>
            </div>

            {/* Corner Coordinate Detail */}
            <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#4A4F5C]">
              <span>SPEC: FULL-APERTURE FRAMING</span>
              <span className="text-gold-600 font-semibold">HONORS DOSSIER</span>
            </div>
          </div>

          {/* Right Column: Editorial Commentary & Focus Pillars (6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <SectionMarker number="07" label="Design Philosophy" theme="light" />
              <h2 className="heading-editorial text-navy-900">
                Where Visionary Spaces Meet Flawless Execution
              </h2>
              <p className="body-editorial text-[#4A4F5C]">
                The Kutchmitra Home &amp; Decor Awards 2026 recognize the holistic interplay between exterior architecture, interior curation, and artisanal execution.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {PILLARS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-1"
                >
                  <h3 className="font-display text-lg text-navy-900 font-medium">
                    {item.label}
                  </h3>
                  <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-navy-900/10 flex items-center gap-2 text-xs font-mono text-[#4A4F5C]">
              <Layers size={13} className="text-gold-600" />
              <span>Dedicated recognition across diverse typologies and scales.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
