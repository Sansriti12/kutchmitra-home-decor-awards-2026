"use client";

import React, { useState } from "react";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { HOMEPAGE_FAQS } from "@/data/faqs";
import { cn } from "@/lib/utils";

export function FaqPreviewSection() {
  const [openId, setOpenId] = useState<string | null>(HOMEPAGE_FAQS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="bg-[#FBFAF7] py-16 sm:py-24 lg:py-28 border-b border-navy-900/10">
      <div className="container-editorial space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <SectionMarker number="08" label="Frequently Asked Questions" theme="light" />
            <h2 className="heading-editorial text-navy-900">
              Guidance for Applicants
            </h2>
          </div>
          <p className="body-editorial text-[#4A4F5C] max-w-md text-sm sm:text-base">
            Key insights regarding the nomination process, submission requirements, and award guidelines.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto divide-y divide-navy-900/10 border-y border-navy-900/10">
          {HOMEPAGE_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full py-5 sm:py-6 flex items-center justify-between gap-4 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  <span className="font-display text-lg sm:text-xl text-navy-900 font-medium tracking-tight group-hover:text-gold-600 transition-colors">
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

        {/* Bottom Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-900/10">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4A4F5C]">
            <HelpCircle size={14} className="text-gold-600" />
            <span>Have additional questions? Consult our full awards FAQ repository.</span>
          </div>

          <Button
            href="/faqs"
            variant="outline-dark"
            size="md"
            icon={<ArrowRight size={14} />}
          >
            View All FAQs
          </Button>
        </div>
      </div>
    </section>
  );
}
