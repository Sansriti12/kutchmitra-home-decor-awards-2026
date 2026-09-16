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
          <h1 className="heading-display text-navy-900">Privacy Policy</h1>
        </div>

        {/* Advisory Callout */}
        <div className="p-5 bg-[#FBFAF7] border-l-2 border-gold-500 border-y border-r border-navy-900/10 space-y-2 text-xs font-sans text-[#4A4F5C] leading-relaxed">
          <p className="font-semibold text-sm text-navy-900 font-mono uppercase tracking-wider">
            Applicant Data Protection &amp; Confidentiality
          </p>
          <p>
            Official data protection policies and terms will be updated by Kutchmitra. The platform adheres to strict confidentiality standards for all applicant profiles, project documentation, and submitted architectural materials.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#FBFAF7] border border-navy-900/10 space-y-4 text-sm text-[#4A4F5C] font-sans leading-relaxed">
          <p className="font-medium text-navy-900 font-mono text-xs uppercase tracking-wider">
            Data Handling Principles
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
            * Formal privacy documentation will be published upon ratification by Kutchmitra.
          </p>
        </div>
      </div>
    </main>
  );
}
