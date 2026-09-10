import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export function HowToNominateSection() {
  const STEPS = [
    {
      number: "01",
      title: "Register / Login",
      description: "Create an applicant account with your credentials to access the digital nomination dashboard.",
    },
    {
      number: "02",
      title: "Select a Category",
      description: "Choose from the 12 approved award categories matching your project type or professional practice.",
    },
    {
      number: "03",
      title: "Complete Your Nomination",
      description: "Provide structured project details, design philosophy narratives, and answering category questionnaire items.",
    },
    {
      number: "04",
      title: "Upload & Submit",
      description: "Attach high-resolution drawings, cover imagery, and portfolio documents, review, and confirm final submission.",
    },
    {
      number: "05",
      title: "Track Your Submission",
      description: "Receive a unique Nomination ID to monitor your entry's status through verification and jury evaluation.",
    },
  ];

  return (
    <section className="bg-ivory py-16 sm:py-24 lg:py-28 border-b border-navy-900/10">
      <div className="container-editorial space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="04" label="The Process" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              How the Nomination Journey Works
            </h2>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
            A structured, 5-stage digital journey designed to make project submission intuitive, transparent, and seamless.
          </p>
        </div>

        {/* 5-Step Process Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className="relative p-6 bg-[#FBFAF7] border border-navy-900/10 flex flex-col justify-between space-y-6 group hover:border-gold-500/50 transition-colors"
            >
              {/* Top Step Number & Connecting Line Indicator */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl sm:text-3xl font-light text-gold-600">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    STAGE {idx + 1}
                  </span>
                </div>

                <div className="w-full h-px bg-navy-900/10 group-hover:bg-gold-500/40 transition-colors" />

                <h3 className="font-display text-lg sm:text-xl text-navy-900 font-medium tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/60" />
                <span>Online Portal</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <p className="text-xs font-mono text-[#4A4F5C]">
            * Draft saving is supported at each step so you can resume your entry at your convenience.
          </p>
          <Button
            href="/how-to-nominate"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
          >
            Learn How to Nominate
          </Button>
        </div>
      </div>
    </section>
  );
}
