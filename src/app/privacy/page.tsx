import React from "react";
import type { Metadata } from "next";
import { SectionMarker } from "@/components/ui/SectionMarker";

export const metadata: Metadata = {
  title: "Privacy Policy | Kutchmitra Home & Decor Awards 2026",
  description: "Privacy policy regarding applicant data collection and confidentiality for the Kutchmitra Home & Decor Awards 2026.",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900 py-16 sm:py-24">
      <div className="container-editorial max-w-4xl space-y-8">
        <SectionMarker number="01" label="Data Governance" theme="light" />
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-mono font-semibold">
            Draft / Provisional — Subject to Organizing Committee &amp; Legal Approval
          </div>
          <h1 className="heading-display text-navy-900">Privacy Policy</h1>
        </div>

        {/* Prominent Warning Callout */}
        <div className="p-5 bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs font-sans text-amber-900 leading-relaxed">
          <p className="font-semibold text-sm text-amber-950 font-mono uppercase tracking-wider">
            Notice: Draft Privacy Framework
          </p>
          <p>
            The content below represents an initial operational outline and frontend placeholder only. It is not final or legally binding. Specific legal terms, data-retention schedules, and user privacy protections will be formally reviewed, approved, and enacted by the organizing committee and legal counsel before user registrations begin.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#FBFAF7] border border-navy-900/10 space-y-4 text-sm text-[#4A4F5C] font-sans leading-relaxed">
          <p className="font-medium text-navy-900 font-mono text-xs uppercase tracking-wider">
            Provisional Overview (Subject to Formal Approval)
          </p>
          <p>
            1. <strong>Data Collection:</strong> We collect contact details, professional affiliations, project documentation, and uploaded materials solely for managing award entries and evaluation.
          </p>
          <p>
            2. <strong>Confidentiality:</strong> Proprietary drawings and confidential applicant details are restricted to authorized verification and jury personnel.
          </p>
          <p>
            3. <strong>Security:</strong> All account data and uploaded assets are secured behind role-based access controls.
          </p>
          <p className="text-xs font-mono text-slate-400 pt-3 border-t border-navy-900/10">
            * Formal privacy documentation will be published upon ratification by the organizing committee.
          </p>
        </div>
      </div>
    </main>
  );
}
