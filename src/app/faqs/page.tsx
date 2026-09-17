"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, HelpCircle, ArrowRight, Phone, Mail } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqEntry[] = [
  {
    id: "faq-1",
    question: "Who can nominate for the Kutchmitra Home & Decor Awards 2026?",
    answer:
      "The awards celebrate excellence across residential architecture, interior design, craftsmanship, and the built environment. Practicing architects, interior designers, landscape specialists, structural consultants, and project studios with completed or eligible works are invited to participate. Detailed category-specific eligibility guidelines will be confirmed by Kutchmitra ahead of portal opening.",
  },
  {
    id: "faq-2",
    question: "How do I submit a nomination?",
    answer:
      "The nomination process is conducted entirely online through the digital portal: (1) Register your entrant profile, (2) Select your award category, (3) Enter project details and built area, (4) Complete the category-specific questions, (5) Upload required high-resolution drawings and photos, (6) Review your dossier preview, and (7) Submit your final declaration. You may save your progress as a draft at any stage and resume at your convenience.",
  },
  {
    id: "faq-3",
    question: "Can I nominate a project in more than one category?",
    answer:
      "Yes. Applicants may nominate different projects across multiple categories, or enter a single comprehensive project into more than one eligible category (such as Best Luxury Residence and Interior Designer of the Year), provided each entry fulfills the distinct criteria of that specific category.",
  },
  {
    id: "faq-4",
    question: "What happens after I submit my nomination?",
    answer:
      "Upon final submission, your nomination dossier receives an official Nomination ID and timestamped confirmation. It enters technical verification to confirm completeness of drawings, narratives, and uploads. Verified entries subsequently advance to the independent Grand Jury for confidential evaluation.",
  },
  {
    id: "faq-5",
    question: "How will entries be evaluated?",
    answer:
      "Every qualifying entry undergoes a confidential, criteria-based evaluation. The jury assesses submissions on a 1–10 scale across five core dimensions: Design/Product Impact (25%), Innovation (20%), Scalability/Market Presence (20%), Business Excellence (20%), and Sustainability & Inclusivity (15%).",
  },
  {
    id: "faq-6",
    question: "Who will evaluate the nominations?",
    answer:
      "Nominations are evaluated by an independent Grand Jury composed of distinguished architects, interior designers, urban planners, and design authorities. To preserve absolute meritocracy, jury scoring remains confidential, and jurors declare any potential conflict of interest prior to evaluating assigned entries.",
  },
  {
    id: "faq-7",
    question: "When will the jury profiles be announced?",
    answer:
      "Jury profiles will be announced by Kutchmitra ahead of the jury evaluation stage.",
  },
  {
    id: "faq-8",
    question: "When will the important award dates be announced?",
    answer:
      "Official milestone dates for nomination opening, submission deadlines, verification, jury evaluation, shortlisting, and the awards gala will be formally announced by Kutchmitra.",
  },
  {
    id: "faq-9",
    question: "When will shortlisted projects and winners be announced?",
    answer:
      "A shortlist of qualifying finalist entries will be announced following jury evaluation. The final winners across all 13 categories will be celebrated and officially announced at the grand awards ceremony.",
  },
  {
    id: "faq-10",
    question: "Does submitting a nomination guarantee an award?",
    answer:
      "No. Submitting a nomination registers your project for consideration. Awards and commendations are conferred strictly on merit through independent jury deliberations and scoring standards.",
  },
  {
    id: "faq-11",
    question: "Where can I find the submission requirements?",
    answer:
      "General guidelines and supported materials (photographs, floor plans, 3D renderings, and project sheets) are listed on our How to Nominate and Category detail pages. Specific upload limits, file formats, and detailed questionnaire guidelines will be confirmed and published by Kutchmitra.",
  },
  {
    id: "faq-12",
    question: "How can I contact Kutchmitra regarding my nomination?",
    answer:
      "You can connect directly with Kutchmitra via email at Kutchmitraweb@gmail.com, call our dedicated helpline at +91 7211189211, or submit an inquiry through our Contact page. Our regional office is located at Kutchmitra, Nr. Indirabai Park, Bhuj, Kutch – 370001.",
  },
];

export default function FaqsPage() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900 font-sans">
      {/* ========================================================================= */}
      {/* SECTION 01 — HERO BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-5">
          <SectionMarker number="01" label="Support &amp; Guidance" theme="light" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-navy-900 font-medium leading-[1.18] tracking-tight max-w-3xl">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-[#4A4F5C] max-w-2xl leading-relaxed">
            Find official guidance on candidate eligibility, nomination procedures, multi-category submissions, jury evaluation criteria, and award announcements.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02 — ACCORDION FAQ */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial max-w-4xl space-y-10">
          <div className="border-t border-navy-900/15">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openId === faq.id;
              const itemNumber = (index + 1).toString().padStart(2, "0");

              return (
                <div
                  key={faq.id}
                  className="border-b border-navy-900/15 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full py-5 sm:py-6 flex items-start justify-between gap-4 sm:gap-6 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <div className="flex items-start gap-3 sm:gap-5">
                      <span className="font-mono text-xs sm:text-sm text-gold-700 font-semibold pt-1 select-none flex-shrink-0">
                        {itemNumber}
                      </span>
                      <span className="font-display text-lg sm:text-xl md:text-2xl text-navy-900 font-medium tracking-tight group-hover:text-gold-700 transition-colors leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "p-1.5 sm:p-2 border border-navy-900/15 flex-shrink-0 text-navy-900 mt-0.5 transition-all duration-200",
                        isOpen
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white group-hover:border-gold-500/50"
                      )}
                      aria-hidden="true"
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pb-6 pl-7 sm:pl-10 pr-4 sm:pr-8 text-sm sm:text-base text-[#4A4F5C] font-sans leading-relaxed">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Notice Banner */}
          <div className="p-5 sm:p-6 bg-[#FBFAF7] border border-navy-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#4A4F5C]">
            <span>Official guidelines, questionnaire criteria, and deadlines will be confirmed and published by Kutchmitra.</span>
            <Link
              href="/how-to-nominate"
              className="inline-flex items-center gap-1.5 text-gold-700 hover:text-navy-900 font-semibold uppercase tracking-wider whitespace-nowrap transition-colors"
            >
              <span>Nomination Guide</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03 — CONTACT KUTCHMITRA CTA */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 bg-[#FBFAF7] border-b border-navy-900/10">
        <div className="container-editorial max-w-4xl">
          <div className="p-8 sm:p-10 bg-white border border-navy-900/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
                Direct Assistance
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-navy-900 font-medium leading-tight">
                Have a question about the awards?
              </h2>
              <p className="text-sm text-[#4A4F5C] font-sans leading-relaxed">
                Connect with Kutchmitra for questions on eligibility, category guidelines, or technical submission assistance.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={12} className="text-gold-700" />
                  <span>Kutchmitraweb@gmail.com</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={12} className="text-gold-700" />
                  <span>+91 7211189211</span>
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                href="/contact"
                variant="primary"
                size="md"
                icon={<ArrowRight size={14} />}
                className="w-full sm:w-auto font-semibold uppercase tracking-wider text-xs"
              >
                Contact Kutchmitra
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
