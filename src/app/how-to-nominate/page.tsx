import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  ShieldCheck,
  Save,
  Clock,
  MapPin,
  Calendar,
  Building2,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How to Nominate & Eligibility Guidelines | Kutchmitra Home & Decor Awards 2026",
  description:
    "Official eligibility criteria, submission rules, completion period, and 7-step digital nomination workflow for the Kutchmitra Home & Decor Awards 2026.",
};

export default function HowToNominatePage() {
  const ELIGIBILITY_CRITERIA = [
    {
      icon: Building2,
      label: "Applicant Eligibility",
      headline: "Architect / Firm Based in Kutch",
      description:
        "The nominating applicant must be an architect based in Kutch or an architectural firm based in Kutch with an established professional practice in the region.",
    },
    {
      icon: MapPin,
      label: "Project Location Eligibility",
      headline: "Located Within Kutch District",
      description:
        "The submitted project must be physically located within Kutch district. Note that applicant location and project location are distinct requirements—both must be satisfied.",
    },
    {
      icon: Calendar,
      label: "Project Completion Period",
      headline: "1 Jan 2024 – 31 Dec 2026",
      description:
        "The project must have been completed between 1 January 2024 and 31 December 2026 (calendar years 2024, 2025, or 2026). Ongoing or unbuilt concept projects are strictly ineligible.",
    },
    {
      icon: Layers,
      label: "Maximum Category Entries",
      headline: "Up to 3 Categories per Applicant",
      description:
        "An applicant may submit nominations across multiple categories up to a strict maximum of 3 categories. Each submission requires a distinct project dossier.",
    },
  ];

  const STAGES = [
    {
      number: "01",
      title: "Applicant Profile / Register",
      desc: "Create an official applicant account with your professional credentials and confirm your Kutch-based architectural practice details.",
    },
    {
      number: "02",
      title: "Select Category (16 Categories)",
      desc: "Choose from the 16 award categories matching your project type. Applicants may enter up to a maximum of 3 categories.",
    },
    {
      number: "03",
      title: "Project / Professional Details",
      desc: "Provide project metadata including title, completion year (2024, 2025, or 2026), site address within Kutch district, and design team credits.",
    },
    {
      number: "04",
      title: "Questionnaire",
      desc: "Answer structured category-specific questions explaining design thinking, spatial intent, materials, craft integration, and climate responsiveness.",
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
    { name: "Cover Image", note: "Primary hero image (min 500×500 px, 1000×1000 px recommended, max 10 MB, JPG/PNG, square 1:1 recommended)" },
    { name: "Project Photos", note: "High-resolution photography documenting built work (min 500×500 px, max 10 MB, JPG/PNG)" },
    { name: "Interior & Exterior Photos", note: "Detailed spatial photography (min 500×500 px, 1000×1000 px recommended, max 10 MB)" },
    { name: "Floor Plans / Drawings", note: "Architectural project plan in A3 size format for jury review" },
    { name: "3D Views / Renderings", note: "Spatial visualizations and concept renderings" },
    { name: "Portfolio / Brochure", note: "Studio overview or project narrative document (PDF format)" },
    { name: "Supporting Documents", note: "Supplementary approvals, credits, or verification notes" },
  ];

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Submission &amp; Eligibility Guide" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            Eligibility Guidelines &amp; Nomination Process
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Essential applicant criteria, project location requirements, completion periods, and a step-by-step walkthrough of the 7-stage digital nomination workflow for the 2026 edition.
          </p>
        </div>
      </section>

      {/* SECTION 02: OFFICIAL ELIGIBILITY CRITERIA */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial space-y-10">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="02" label="Eligibility Framework" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Official Eligibility Criteria
            </h2>
            <p className="body-editorial text-[#4A4F5C]">
              Please review all eligibility rules carefully before preparing your submission dossier.
            </p>
          </div>

          {/* 4 Eligibility Condition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {ELIGIBILITY_CRITERIA.map((crit, idx) => {
              const Icon = crit.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-navy-900/10 space-y-3 hover:border-gold-500/50 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-navy-900/10 pb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 font-semibold">
                        {crit.label}
                      </span>
                      <Icon size={18} className="text-gold-700" />
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-semibold text-navy-900 leading-snug">
                      {crit.headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                      {crit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Traditional & Contemporary Approaches Notice Box */}
          <div className="p-6 sm:p-8 bg-[#FBFAF7] border-l-4 border-gold-600 border-y border-r border-navy-900/10 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-800 font-semibold block">
                Design Approach &amp; Architectural Language
              </span>
              <h3 className="font-display text-xl sm:text-2xl text-navy-900 font-medium">
                Traditional and Contemporary Approaches Are Equally Welcomed
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-navy-900 font-medium">
                  <CheckCircle2 size={16} className="text-gold-600 flex-shrink-0" />
                  <span>Historic Reproduction Is Not Required</span>
                </div>
                <p>
                  Applicants are <strong>not expected to reproduce historic or rustic architectural styles</strong>. The awards recognize modern living solutions and progressive architectural practices alongside traditional idioms.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-navy-900 font-medium">
                  <CheckCircle2 size={16} className="text-gold-600 flex-shrink-0" />
                  <span>Contemporary Interpretations Encouraged</span>
                </div>
                <p>
                  Contemporary interpretations of Kutchi heritage, local materials, artisan collaboration, and climate-responsive techniques are warmly encouraged. All submissions will be evaluated on design excellence, contextual sensitivity, and execution quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Step Detailed Workflow */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="03" label="Step-by-Step Workflow" theme="light" />
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
                className="p-6 sm:p-8 bg-white border border-navy-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-gold-500/40 transition-colors shadow-sm"
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

                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 bg-sand-100 border border-navy-900/5 px-3 py-1 flex-shrink-0 self-start sm:self-auto font-medium">
                  Stage {stage.number} of 07
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Upload Materials Section */}
      <section className="py-10 sm:py-14 lg:py-16 bg-ivory border-b border-navy-900/10">
        <div className="container-editorial space-y-10">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="04" label="Submission Materials" theme="light" />
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
                className="p-5 bg-white border border-navy-900/10 space-y-1.5 shadow-sm"
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
          <div className="p-6 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-gold-600 font-semibold block">
              Official Submission Notice
            </span>
            <p className="text-sm font-sans text-navy-900 font-medium">
              Detailed submission and file specifications will be confirmed by Kutchmitra.
            </p>
            <p className="text-xs font-sans text-[#4A4F5C]">
              Upload limits, allowed file formats, resolution recommendations, and maximum file sizes will be configured within the portal prior to nomination opening.
            </p>
          </div>
        </div>
      </section>

      {/* Key Portal Features */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-12">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="05" label="Platform Capabilities" theme="light" />
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
                className="p-6 bg-white border border-navy-900/10 space-y-3 hover:border-gold-500/40 transition-colors shadow-sm"
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
