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
        <SectionMarker number="01" label="Legal &amp; Governance" theme="light" />
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-semibold">
            Draft / Provisional — Subject to Organizing Committee &amp; Legal Approval
          </div>
          <h1 className="heading-display text-navy-900">Terms &amp; Conditions</h1>
        </div>

        {/* Prominent Warning Callout */}
        <div className="p-5 bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs font-sans text-amber-900 leading-relaxed">
          <p className="font-semibold text-sm text-amber-950 font-mono uppercase tracking-wider">
            Notice: Draft Legal Framework
          </p>
          <p>
            The content below represents an initial structural framework and prototype placeholder only. It is not final or legally binding. Official terms and conditions, participation rules, and eligibility criteria will be formally ratified by the organizing committee and legal counsel prior to portal launch.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#FBFAF7] border border-navy-900/10 space-y-4 text-sm text-[#4A4F5C] font-sans leading-relaxed">
          <p className="font-medium text-navy-900 font-mono text-xs uppercase tracking-wider">
            Provisional Overview (Subject to Formal Approval)
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
            * Formal legal documentation will be published upon ratification by the organizing committee.
          </p>
        </div>
      </div>
    </main>
  );
}
