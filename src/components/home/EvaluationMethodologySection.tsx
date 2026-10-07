import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Lightbulb,
  Building2,
  Leaf,
  Scale,
  Sparkles,
} from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

interface EvaluationCriterion {
  number: string;
  pillar: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const CRITERIA: EvaluationCriterion[] = [
  {
    number: "01",
    pillar: "Pillar 01",
    title: "Design Excellence & Innovation",
    description: "Aesthetic distinction, design thinking, spatial innovation, and novel material or conceptual approaches.",
    icon: Lightbulb,
  },
  {
    number: "02",
    pillar: "Pillar 02",
    title: "Functionality & Usability",
    description: "Practicality, intelligent spatial planning, circulation efficiency, and responsiveness to occupants' lifestyle.",
    icon: Compass,
  },
  {
    number: "03",
    pillar: "Pillar 03",
    title: "Quality of Craftsmanship & Execution",
    description: "Structural coherence, finishing precision, superior workmanship, and meticulous detail resolution.",
    icon: Building2,
  },
  {
    number: "04",
    pillar: "Pillar 04",
    title: "Sustainability & Material Sensitivity",
    description: "Environmental responsibility, passive climate responsiveness, resource efficiency, and local material usage.",
    icon: Leaf,
  },
  {
    number: "05",
    pillar: "Pillar 05",
    title: "Contextual Relevance & Cultural Harmony",
    description: "Integration with regional architectural heritage, cultural resonance, and contextual harmony within Kutch.",
    icon: Sparkles,
  },
];

export function EvaluationMethodologySection() {
  return (
    <section className="bg-ivory py-12 sm:py-16 lg:py-20 border-b border-navy-900/10">
      <div className="container-editorial space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="06" label="Evaluation Methodology" theme="light" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy-900 font-medium leading-tight tracking-tight">
              How Winners Are Chosen
            </h2>
            <p className="text-sm sm:text-base text-[#4A4F5C] font-sans leading-relaxed">
              Every qualifying nomination undergoes rigorous and confidential evaluation by an independent expert jury across five approved evaluation criteria to ensure an impartial and holistic assessment.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gold-500/30 text-xs font-mono text-gold-700 shadow-sm self-start md:self-end">
            <Scale size={14} className="text-gold-600" />
            <span>Official Evaluation Framework</span>
          </div>
        </div>

        {/* 5 Evaluation Cards — 1 horizontal row on desktop (lg:grid-cols-5), 2-3 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CRITERIA.map((criterion) => {
            const Icon = criterion.icon;
            return (
              <article
                key={criterion.number}
                className="p-5 sm:p-6 bg-white border border-navy-900/10 shadow-sm space-y-3.5 hover:border-gold-500/40 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top: Criterion Number + Pillar Badge */}
                  <div className="flex items-center justify-between border-b border-navy-900/10 pb-2.5">
                    <span className="font-mono text-xs text-slate-400 font-medium">
                      CRITERION {criterion.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 font-semibold px-2 py-0.5 bg-sand-100 border border-gold-500/20">
                      {criterion.pillar}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded bg-sand-100 border border-gold-500/20 flex items-center justify-center text-gold-700 mb-2">
                      <Icon size={16} />
                    </div>
                    <h3 className="font-display text-base text-navy-900 font-medium leading-snug">
                      {criterion.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                    {criterion.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-navy-900/5 flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>Assessment Focus</span>
                  <span className="text-gold-700 font-semibold">Qualitative Merit</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Total Score Banner & Action */}
        <div className="p-6 bg-[#FBFAF7] border border-gold-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl text-navy-900 font-semibold tracking-tight">
                Holistic Assessment
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-gold-700 font-bold bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
                5 Core Criteria
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans">
              A comprehensive assessment celebrating visionary design thinking, execution quality, functionality, cultural harmony, and environmental sensitivity.
            </p>
          </div>

          <Button
            href="/jury"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
            className="self-stretch sm:self-auto whitespace-nowrap"
          >
            Explore Jury &amp; Evaluation
          </Button>
        </div>
      </div>
    </section>
  );
}
