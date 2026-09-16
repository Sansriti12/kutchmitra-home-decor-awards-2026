import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Lightbulb,
  TrendingUp,
  Building2,
  Leaf,
  Scale,
} from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

interface EvaluationCriterion {
  number: string;
  weight: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const CRITERIA: EvaluationCriterion[] = [
  {
    number: "01",
    weight: "25%",
    title: "Design/Product Impact",
    description: "Aesthetic value and functional excellence.",
    icon: Compass,
  },
  {
    number: "02",
    weight: "20%",
    title: "Innovation",
    description: "Novelty in materials, technology, or approach.",
    icon: Lightbulb,
  },
  {
    number: "03",
    weight: "20%",
    title: "Scalability/Market Presence",
    description: "Impact across the Indian consumer landscape.",
    icon: TrendingUp,
  },
  {
    number: "04",
    weight: "20%",
    title: "Business Excellence",
    description: "Brand strength, growth trajectory, and reliability.",
    icon: Building2,
  },
  {
    number: "05",
    weight: "15%",
    title: "Sustainability & Inclusivity",
    description: "Commitment to eco-friendly practices and social benefit.",
    icon: Leaf,
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
              Every nomination undergoes rigorous evaluation by an expert jury. Each entry is scored on a 1–10 scale across five critical criteria, ensuring a comprehensive assessment.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gold-500/30 text-xs font-mono text-gold-700 shadow-sm self-start md:self-end">
            <Scale size={14} className="text-gold-600" />
            <span>Scale: 1–10 Scoring Framework</span>
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
                  {/* Top: Criterion Number + Gold Percentage Weight */}
                  <div className="flex items-center justify-between border-b border-navy-900/10 pb-2.5">
                    <span className="font-mono text-xs text-slate-400 font-medium">
                      CRITERION {criterion.number}
                    </span>
                    <span className="font-display text-xl font-bold text-gold-700">
                      {criterion.weight}
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
                  <span>Jury Weight</span>
                  <span className="text-gold-700 font-semibold">{criterion.weight}</span>
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
                Total Score
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-gold-700 font-bold bg-gold-500/10 px-2 py-0.5 border border-gold-500/20">
                100% Cumulative
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans">
              A holistic view of overall excellence across design, innovation, market presence, business integrity, and environmental stewardship.
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
