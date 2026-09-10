import React from "react";
import { ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export function HowToNominatePreview() {
  const STEPS = [
    { number: "01", title: "Register / Login", desc: "Create your applicant account to initiate your award entry." },
    { number: "02", title: "Select a Category", desc: "Choose the award discipline matching your residential or interior project." },
    { number: "03", title: "Complete & Upload", desc: "Provide project narrative details, drawings, and photography files." },
    { number: "04", title: "Review & Submit", desc: "Preview your complete submission dossier, confirm declaration, and submit." },
  ];

  return (
    <section className="bg-ivory py-12 sm:py-16 border-b border-navy-900/10">
      <div className="container-editorial space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="04" label="Process Preview" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              How to Nominate
            </h2>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
            A simple 4-step digital nomination flow designed for architects, designers, and project studios.
          </p>
        </div>

        {/* 4-Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-3 relative group hover:border-gold-500/40 transition-colors"
            >
              <span className="font-mono text-2xl font-light text-gold-600 block">
                {step.number}
              </span>
              <h3 className="font-display text-lg text-navy-900 font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <span className="text-xs font-mono text-[#4A4F5C]">
            * Drafts can be saved at any stage before final submission.
          </span>
          <Button
            href="/how-to-nominate"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
          >
            How to Nominate
          </Button>
        </div>
      </div>
    </section>
  );
}
