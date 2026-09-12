import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Upload, Eye, ShieldCheck, Save, Clock } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How to Nominate | Kutchmitra Home & Decor Awards 2026",
  description: "Step-by-step instructions and submission guidelines for the Kutchmitra Home & Decor Awards 2026 nomination process.",
};

export default function HowToNominatePage() {
  const STAGES = [
    {
      number: "01",
      title: "Applicant Profile / Register",
      desc: "Create an official applicant account with your professional or studio credentials to gain secure portal access.",
    },
    {
      number: "02",
      title: "Select Category",
      desc: "Choose the award category that best represents the nature and scale of your completed residential or interior work.",
    },
    {
      number: "03",
      title: "Project / Professional Details",
      desc: "Provide core project metadata including project title, completion timeline, spatial scope, and design team credits.",
    },
    {
      number: "04",
      title: "Questionnaire",
      desc: "Answer structured category-specific questions explaining design thinking, spatial intent, materials, and challenges solved.",
    },
    {
      number: "05",
      title: "Upload Media & Documents",
      desc: "Attach supported submission materials including cover image, project photos, interior/exterior views, floor plans/drawings, 3D views/renderings, portfolio/brochure, and supporting documents.",
    },
    {
      number: "06",
      title: "Preview Application",
      desc: "Review a complete, formatted preview of all answers, uploaded drawings, and images prior to committing your submission.",
    },
    {
      number: "07",
      title: "Declaration & Submit",
      desc: "Acknowledge the declaration of authorship, finalize submission, and receive your unique Nomination ID with printable acknowledgement.",
    },
  ];

  const FEATURES = [
    {
      icon: <Save size={18} className="text-gold-600" />,
      title: "Save as Draft",
      desc: "Save your progress at any stage and return whenever you are ready before the submission closing deadline.",
    },
    {
      icon: <Clock size={18} className="text-gold-600" />,
      title: "Continue Later",
      desc: "Resume incomplete drafts directly from your personalized Applicant Dashboard at any time.",
    },
    {
      icon: <CheckCircle2 size={18} className="text-gold-600" />,
      title: "Client & Server Validation",
      desc: "Clear field validation ensures all mandatory questions and required submission elements are completed prior to final submission.",
    },
    {
      icon: <Upload size={18} className="text-gold-600" />,
      title: "Secure Upload System",
      desc: "Upload cover images, project photography, architectural drawings, 3D views, and portfolio documents with configurable upload limits.",
    },
    {
      icon: <Eye size={18} className="text-gold-600" />,
      title: "Read-Only Preview",
      desc: "Inspect your complete dossier exactly as the technical verification team and jury will view it.",
    },
    {
      icon: <ShieldCheck size={18} className="text-gold-600" />,
      title: "Nomination ID & Receipt",
      desc: "Successful submission generates an official unique Nomination ID and a downloadable receipt acknowledgement.",
    },
  ];

  const SUPPORTED_UPLOADS = [
    { name: "Cover Image", note: "Primary hero image representing the project" },
    { name: "Project Photos", note: "Photographs documenting the built work" },
    { name: "Interior & Exterior Photos", note: "Detailed spatial and environmental photography" },
    { name: "Floor Plans / Drawings", note: "Architectural layouts and drawings where applicable" },
    { name: "3D Views / Renderings", note: "Spatial visualizations and concept renderings" },
    { name: "Portfolio / Brochure", note: "Studio overview or project narrative document" },
    { name: "Supporting Documents", note: "Supplementary approvals, credits, or verification notes" },
  ];

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Submission Guide" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            How to Submit Your Nomination
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            A comprehensive overview of the 7-step digital nomination workflow, supported document upload types, and submission rules for the 2026 edition.
          </p>
        </div>
      </section>

      {/* 7-Step Detailed Workflow */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="02" label="Step-by-Step Workflow" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              The Seven-Stage Nomination Journey
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              The nomination portal guides applicants through a structured sequence to ensure all critical architectural and design data is captured accurately.
            </p>
          </div>

          <div className="space-y-4">
            {STAGES.map((stage) => (
              <div
                key={stage.number}
                className="p-6 sm:p-8 bg-[#FBFAF7] border border-navy-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-5">
                  <span className="font-mono text-3xl sm:text-4xl font-light text-gold-600 w-12 flex-shrink-0">
                    {stage.number}
                  </span>
                  <div className="space-y-1 max-w-2xl">
                    <h3 className="font-display text-xl text-navy-900 font-medium">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-[#4A4F5C] font-sans leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 bg-sand-100 border border-navy-900/5 px-3 py-1 flex-shrink-0 self-start sm:self-auto">
                  Stage {stage.number} of 07
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Upload Materials Section */}
      <section className="py-10 sm:py-14 lg:py-16 bg-[#FBFAF7] border-b border-navy-900/10">
        <div className="container-editorial space-y-10">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="03" label="Submission Materials" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Supported Dossier Upload Types
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              The digital portal accommodates standard documentation types required to comprehensively present built and interior works.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_UPLOADS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border border-navy-900/10 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-gold-600 flex-shrink-0" />
                  <h3 className="font-display text-base text-navy-900 font-medium">
                    {item.name}
                  </h3>
                </div>
                <p className="text-xs text-[#4A4F5C] font-sans pl-6">
                  {item.note}
                </p>
              </div>
            ))}
          </div>

          {/* Neutral Specification Disclaimer Box */}
          <div className="p-6 bg-ivory border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold block">
              Official Submission Notice
            </span>
            <p className="text-sm font-sans text-navy-900 font-medium">
              Detailed submission and file specifications will be confirmed by the organizing committee.
            </p>
            <p className="text-xs font-sans text-[#4A4F5C]">
              Upload limits, allowed file formats, resolution recommendations, and maximum file sizes will be configured within the portal prior to nomination opening.
            </p>
          </div>
        </div>
      </section>

      {/* Key Portal Features */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="04" label="Platform Capabilities" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Key Nomination Features
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              Designed to give applicants complete flexibility and confidence when preparing high-caliber entries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-3 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {feat.icon}
                  <h3 className="font-display text-lg text-navy-900 font-medium">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-navy-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-mono text-[#4A4F5C]">
              * Note: The digital nomination engine will become accessible upon official portal opening.
            </p>
            <Button href="/register" variant="primary" size="md" icon={<ArrowRight size={14} />}>
              Start Your Nomination
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
