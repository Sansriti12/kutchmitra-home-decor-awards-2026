"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { HOMEPAGE_FAQS } from "@/data/faqs";
import { cn } from "@/lib/utils";

const EXTENDED_FAQS = [
  ...HOMEPAGE_FAQS,
  {
    id: "faq-7",
    question: "Is there a nomination fee to participate?",
    answer:
      "Any applicable nomination fee or payment requirements will be announced by the organizing committee.",
  },
  {
    id: "faq-8",
    question: "Can an application be updated after final submission?",
    answer:
      "Once an application is officially submitted, it becomes read-only to preserve evaluation integrity. If a clarification is requested by the verification team, the entry may be reopened specifically for that purpose.",
  },
  {
    id: "faq-9",
    question: "When will the finalists and winners be announced?",
    answer:
      "A shortlist of entries advancing to the final stage will be published following jury evaluation. Final winner announcements will be made at the official awards ceremony.",
  },
];

export default function FaqsPage() {
  const [openId, setOpenId] = useState<string | null>(EXTENDED_FAQS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900">
      {/* Banner */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6">
          <SectionMarker number="01" label="Support &amp; Guidance" theme="light" />
          <h1 className="heading-display text-navy-900 max-w-3xl">
            Frequently Asked Questions
          </h1>
          <p className="body-editorial text-[#4A4F5C] max-w-2xl text-lg">
            Find clear answers to common questions regarding eligibility, digital submission workflows, media guidelines, and jury review.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10">
        <div className="container-editorial max-w-4xl space-y-8">
          <div className="divide-y divide-navy-900/10 border-y border-navy-900/10">
            {EXTENDED_FAQS.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full py-6 flex items-center justify-between gap-4 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <span className="font-display text-xl sm:text-2xl text-navy-900 font-medium tracking-tight group-hover:text-gold-600 transition-colors">
                      {faq.question}
                    </span>
                    <span
                      className={cn(
                        "p-1.5 border border-navy-900/10 transition-transform duration-200 flex-shrink-0 text-navy-900",
                        isOpen ? "rotate-180 bg-gold-500/10 border-gold-500/40 text-gold-600" : ""
                      )}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="pb-6 pr-8 text-sm sm:text-base text-[#4A4F5C] font-sans leading-relaxed animate-fade-up">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-[#FBFAF7] border border-navy-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#4A4F5C]">
            <span>Detailed guidelines will be confirmed and published by the organizing team.</span>
            <Button href="/contact" variant="outline-dark" size="sm">
              Contact Secretariat
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
