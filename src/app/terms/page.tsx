import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, Scale, FileText } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";

export const metadata: Metadata = {
  title: "Terms & Conditions | Kutchmitra Home & Decor Awards 2026",
  description:
    "Official Terms and Conditions governing participation in the Kutchmitra Home & Decor Awards 2026.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 bg-ivory text-navy-900 font-sans">
      {/* ========================================================================= */}
      {/* HERO BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial max-w-4xl space-y-5">
          <SectionMarker number="01" label="Official Governance" theme="light" />
          <div className="space-y-2">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-gold-700 font-semibold block">
              Kutchmitra Home &amp; Decor Awards 2026
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-navy-900 font-medium leading-[1.18] tracking-tight">
              Terms &amp; Conditions
            </h1>
          </div>
          <p className="text-base sm:text-lg text-[#4A4F5C] leading-relaxed">
            These Terms &amp; Conditions govern participation, submission, evaluation, and winner recognition in the Kutchmitra Home &amp; Decor Awards 2026.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LEGAL CONTENT BODY */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial max-w-4xl space-y-12">
          {/* Quick Notice Header */}
          <div className="p-5 sm:p-6 bg-[#FBFAF7] border-l-4 border-gold-500 border-y border-r border-navy-900/10 shadow-sm space-y-1.5 text-xs sm:text-sm text-[#4A4F5C] leading-relaxed">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-navy-900 font-bold">
              <Scale size={15} className="text-gold-700" />
              <span>Participation Agreement</span>
            </div>
            <p>
              By submitting an entry or nomination, the Participant acknowledges and agrees to be bound unconditionally by these official Terms &amp; Conditions.
            </p>
          </div>

          <div className="space-y-12 divide-y divide-navy-900/10">
            {/* 01. Definitions */}
            <article className="pt-8 first:pt-0 space-y-5">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 01
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  01. Definitions
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3.5 text-sm font-sans">
                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    AWARDS
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    Kutchmitra Home &amp; Decor Awards 2026.
                  </p>
                </div>

                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    AWARDS MANAGEMENT
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    The Kutchmitra team, Janmabhoomi Group of Newspapers, and its affiliates, agencies and partners involved in organising and executing the Awards.
                  </p>
                </div>

                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    PARTICIPANT
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    Any individual, brand, company or organisation submitting an entry for consideration in the Awards.
                  </p>
                </div>

                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    APPLICATION
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    A completed nomination/entry form submitted by a Participant.
                  </p>
                </div>

                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    JURY
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    The panel of industry experts appointed to evaluate the submitted entries.
                  </p>
                </div>

                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    PROCESS ADVISOR
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    An independent party appointed, where applicable, to oversee or audit the fairness and integrity of the Awards process.
                  </p>
                </div>

                <div className="p-4 bg-white border border-navy-900/10 shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-navy-900 font-bold block">
                    TERMS
                  </span>
                  <p className="text-[#4A4F5C] leading-relaxed">
                    These Terms &amp; Conditions governing participation in the Awards.
                  </p>
                </div>
              </div>
            </article>

            {/* 02. Acceptance of Terms */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 02
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  02. Acceptance of Terms
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  By submitting an entry or nomination, the Participant acknowledges and agrees to be bound by these Terms &amp; Conditions.
                </li>
                <li>
                  Awards Management reserves the right to amend or update these Terms &amp; Conditions at any time. Continued participation in the Awards following any such amendment shall constitute acceptance of the revised Terms.
                </li>
              </ul>
            </article>

            {/* 03. About the Awards */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 03
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  03. About the Awards
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                The Kutchmitra Home &amp; Decor Awards 2026 celebrate excellence in architecture, interior design, home products and contemporary living innovations. The Awards recognise individuals, projects and brands contributing to and shaping India&apos;s evolving home and design ecosystem.
              </p>
            </article>

            {/* 04. Eligibility */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 04
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  04. Eligibility
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Participants must be legally registered and operational in Kutch district, wherever applicable, and only projects located within Kutch district are eligible for participation.
                </li>
                <li>
                  Submitted projects must have been completed within the three years preceding the Awards.
                </li>
                <li>
                  Entries must relate to work, products or projects that are active or have been completed within the applicable period specified for the relevant category.
                </li>
                <li>
                  Employees, partners and affiliates of Awards Management are not eligible to participate.
                </li>
                <li>
                  All entries must comply with the definitions, eligibility requirements and evaluation criteria applicable to the respective category.
                </li>
              </ul>
            </article>

            {/* 05. Awards Process */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 05
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  05. Awards Process
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  All submitted entries will undergo an initial screening to verify eligibility and completeness.
                </li>
                <li>
                  Entries meeting the eligibility requirements will proceed to evaluation by the designated jury panel.
                </li>
                <li>
                  Awards Management reserves the right to modify, merge or withdraw any category depending on the level of participation or the quality of entries received.
                </li>
                <li>
                  The decision of the Jury shall be final and binding.
                </li>
              </ul>
            </article>

            {/* 06. Evaluation Criteria */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 06
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  06. Evaluation Criteria
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Entries may be assessed based on a combination of the following parameters:
              </p>
              <ul className="space-y-2.5 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li><strong className="text-navy-900 font-semibold">Design Excellence / Product Innovation</strong></li>
                <li><strong className="text-navy-900 font-semibold">Functionality &amp; User Experience</strong></li>
                <li><strong className="text-navy-900 font-semibold">Aesthetic &amp; Material Quality</strong></li>
                <li><strong className="text-navy-900 font-semibold">Sustainability &amp; Future Readiness</strong></li>
                <li><strong className="text-navy-900 font-semibold">Market Impact / Consumer Adoption</strong></li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-500 font-sans pt-1">
                The applicable evaluation methodology, scoring system and weightage may vary as determined for the Awards.
              </p>
            </article>

            {/* 07. Winner Selection */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 07
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  07. Winner Selection
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Winners will be determined through a multi-stage evaluation process.
                </li>
                <li>
                  Shortlisted entries may be featured across KUTCHMITRA platforms.
                </li>
                <li>
                  No correspondence or queries concerning the final results will be entertained.
                </li>
                <li>
                  Winning an Award does not entitle the Participant to any monetary compensation unless specifically stated by Awards Management.
                </li>
              </ul>
            </article>

            {/* 08. Participant Declarations */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 08
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  08. Participant Declarations
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                By submitting an entry, Participants confirm that:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  All information and materials provided are true, accurate and complete.
                </li>
                <li>
                  They have the necessary authority and rights to submit the entry and the materials provided.
                </li>
                <li>
                  The submitted material does not infringe upon the intellectual property or other rights of any third party.
                </li>
                <li>
                  They agree to indemnify Awards Management against claims arising from or in connection with their submission.
                </li>
              </ul>
            </article>

            {/* 09. Usage Rights & Publicity */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 09
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  09. Usage Rights &amp; Publicity
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Participants grant Awards Management a non-exclusive, royalty-free, to use the submitted content for editorial, promotional and marketing purposes.
                </li>
                <li>
                  Participation may involve media appearances, interviews or promotional features without additional compensation.
                </li>
                <li>
                  Submitted content may be published across KUTCHMITRA platforms and associated partner networks.
                </li>
              </ul>
            </article>

            {/* 10. Disqualification */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 10
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  10. Disqualification
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Awards Management reserves the right to:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Disqualify a Participant for providing false or misleading information, misconduct or non-compliance with these Terms.
                </li>
                <li>
                  Withdraw an Award title or recognition if discrepancies or violations are discovered after the Award has been granted.
                </li>
                <li>
                  Replace a winner where the winner cannot be contacted or fails to comply with applicable requirements.
                </li>
              </ul>
            </article>

            {/* 11. Social Media Guidelines */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 11
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  11. Social Media Guidelines
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Final approval and publishing rights shall remain with Kutchmitra.
                </li>
                <li>
                  Social media posts will be published on <strong className="text-navy-900 font-semibold">Kutchmitra Digital</strong>, a sub-property of Kutchmitra.
                </li>
              </ul>
            </article>

            {/* 12. Liability & Disclaimer */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 12
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  12. Liability &amp; Disclaimer
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Awards Management shall not be responsible for technical errors, loss of submissions or system failures.
                </li>
                <li>
                  Participation in the Awards is undertaken at the Participant&apos;s own risk.
                </li>
                <li>
                  The Awards are provided on an &ldquo;as-is&rdquo; basis, without warranties except where expressly stated.
                </li>
              </ul>
            </article>

            {/* 13. Prohibited Activities */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 13
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  13. Prohibited Activities
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                Participants shall not:
              </p>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Attempt to manipulate, hack, interfere with or disrupt the nomination or evaluation process.
                </li>
                <li>
                  Submit fraudulent, misleading, plagiarised or otherwise unauthorised content.
                </li>
                <li>
                  Undertake any activity that may compromise the fairness, security or integrity of the Awards.
                </li>
              </ul>
            </article>

            {/* 14. Data Privacy */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 14
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  14. Data Privacy
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Participant information will be collected and processed for the administration and management of the Awards and for approved promotional purposes.
                </li>
                <li>
                  Participant data may be shared with relevant partners strictly where required for execution of the Awards.
                </li>
                <li>
                  All handling of personal information shall be undertaken in accordance with applicable laws and the applicable Privacy Policy.
                </li>
              </ul>
            </article>

            {/* 15. Intellectual Property */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 15
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  15. Intellectual Property
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Participants retain ownership of the intellectual property rights in their submitted material.
                </li>
                <li>
                  Participants grant Awards Management the necessary rights to use such material for approved editorial, promotional and marketing purposes.
                </li>
                <li>
                  Participants agree to indemnify Awards Management against claims arising from any intellectual property-related dispute concerning their submission.
                </li>
              </ul>
            </article>

            {/* 16. General Clauses */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 16
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  16. General Clauses
                </h2>
              </div>
              <ul className="space-y-3 text-sm sm:text-base text-[#4A4F5C] leading-relaxed list-disc pl-5">
                <li>
                  Participation in the Awards does not guarantee selection as a finalist or winner.
                </li>
                <li>
                  Awards Management reserves the right to amend, suspend or cancel the Awards or any part thereof at any stage.
                </li>
                <li>
                  Decisions of the Jury shall be final and non-contestable.
                </li>
              </ul>
            </article>

            {/* 17. Contact */}
            <article className="pt-8 space-y-4">
              <div className="space-y-1">
                <span className="font-mono text-xs text-gold-700 font-semibold tracking-wider block">
                  SECTION 17
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium tracking-tight">
                  17. Contact
                </h2>
              </div>
              <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 space-y-3 shadow-sm max-w-xl">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
                  For nominations and queries:
                </p>
                <div className="space-y-2 text-sm font-sans">
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-gold-700 flex-shrink-0" />
                    <span className="font-mono text-slate-500 text-xs uppercase">Email:</span>
                    <a
                      href="mailto:Kutchmitraweb@gmail.com"
                      className="font-medium text-navy-900 hover:text-gold-700 transition-colors"
                    >
                      Kutchmitraweb@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-gold-700 flex-shrink-0" />
                    <span className="font-mono text-slate-500 text-xs uppercase">Helpline:</span>
                    <a
                      href="tel:+917211189211"
                      className="font-medium text-navy-900 hover:text-gold-700 transition-colors font-mono"
                    >
                      +91 7211189211
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

