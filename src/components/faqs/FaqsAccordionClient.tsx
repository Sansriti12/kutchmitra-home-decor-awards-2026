"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight, Phone, Mail } from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { CmsFaq } from "@/lib/cms/types";

interface FaqsAccordionClientProps {
  faqs: CmsFaq[];
}

export default function FaqsAccordionClient({ faqs }: FaqsAccordionClientProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <main className="flex-1 bg-ivory text-navy-900 font-sans">
      {/* SECTION 01 — HERO BANNER */}
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

      {/* SECTION 02 — ACCORDION FAQ */}
      <section className="py-12 sm:py-16 lg:py-20 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial max-w-4xl space-y-10">
          <div className="border-t border-navy-900/15">
            {faqs.map((faq, index) => {
              const isOpen = openId === faq.id;
              const itemNumber = (index + 1).toString().padStart(2, "0");

              return (
                <div key={faq.id} className="border-b border-navy-900/15 transition-colors">
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
                    <div className="pt-1.5 flex-shrink-0 text-slate-400 group-hover:text-gold-700 transition-colors">
                      {isOpen ? (
                        <Minus size={20} className="stroke-[2]" />
                      ) : (
                        <Plus size={20} className="stroke-[2]" />
                      )}
                    </div>
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-96 opacity-100 pb-6 sm:pb-7" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pl-7 sm:pl-11 pr-4 sm:pr-8">
                      <p className="text-sm sm:text-base text-[#4A4F5C] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 03 — STILL HAVE QUESTIONS BANNER */}
      <section className="py-12 sm:py-16 bg-[#FBFAF7] border-b border-navy-900/10">
        <div className="container-editorial">
          <div className="max-w-4xl mx-auto p-8 sm:p-10 bg-white border border-navy-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="font-mono text-xs text-gold-700 uppercase tracking-widest font-semibold block">
                Direct Helpdesk Support
              </span>
              <h3 className="font-display text-2xl text-navy-900 font-medium">
                Have specific queries regarding your nomination?
              </h3>
              <p className="text-sm text-[#4A4F5C]">
                Our dedicated support desk in Bhuj is ready to assist with category classifications, eligibility verifications, or document uploads.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <Button href="/contact" variant="primary" size="md" icon={<ArrowRight size={14} />}>
                Contact Desk
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
