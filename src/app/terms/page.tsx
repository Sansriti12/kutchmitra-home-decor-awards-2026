import React from "react";
import type { Metadata } from "next";
import { SectionMarker } from "@/components/ui/SectionMarker";

export const metadata: Metadata = {
  title: "Terms & Conditions | Kutchmitra Home & Decor Awards 2026",
  description: "Terms and conditions governing participation in the Kutchmitra Home & Decor Awards 2026.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900 py-16 sm:py-24">
      <div className="container-editorial max-w-4xl space-y-8">
        <SectionMarker number="01" label="Governance &amp; Terms" theme="light" />
        <div className="space-y-3">
          <h1 className="heading-display text-navy-900">Terms &amp; Conditions</h1>
        </div>

        {/* Advisory Callout */}
        <div className="p-5 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-2 text-xs font-sans text-[#4A4F5C] leading-relaxed">
          <p className="font-semibold text-sm text-navy-900 font-mono uppercase tracking-wider">
            Nomination Terms &amp; Participation Guidelines
          </p>
          <p>
            Official terms, participation rules, and eligibility criteria will be updated by Kutchmitra. Participation in the awards is governed by standard professional integrity, intellectual property, and evaluation standards outlined below.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#FBFAF7] border border-navy-900/10 space-y-4 text-sm text-[#4A4F5C] font-sans leading-relaxed">
          <p className="font-medium text-navy-900 font-mono text-xs uppercase tracking-wider">
            General Participation Principles
          </p>
          <p>
            1. <strong>Authorship &amp; Ownership:</strong> All submitted entries must represent authentic works conceived, designed, or executed by the applicant or applicant studio.
          </p>
          <p>
            2. <strong>Submission Integrity:</strong> Applicants are responsible for ensuring all provided details, measurements, photography credits, and narratives are accurate and truthful.
          </p>
          <p>
            3. <strong>Independent Evaluation:</strong> Jury deliberations and scoring remain independent, confidential, and final.
          </p>
          <p>
            4. <strong>Publication Rights:</strong> By submitting, applicants grant permission for submitted imagery and project summaries to be displayed in official award galleries and communications.
          </p>
          <p className="text-xs font-mono text-slate-400 pt-3 border-t border-navy-900/10">
            * Formal legal documentation will be published upon ratification by Kutchmitra.
          </p>
        </div>
      </div>
    </main>
  );
}
