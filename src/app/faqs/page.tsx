import React from "react";
import type { Metadata } from "next";
import { getPublicFaqs } from "@/lib/cms/public";
import FaqsAccordionClient from "@/components/faqs/FaqsAccordionClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Kutchmitra Home & Decor Awards 2026",
  description:
    "Official guidance and answers on eligibility, nomination procedures, categories, jury evaluation, and the Kutchmitra Home & Decor Awards 2026 ceremony.",
};

export const revalidate = 60; // ISR cache revalidation

export default async function FaqsPage() {
  const faqs = await getPublicFaqs();

  return <FaqsAccordionClient faqs={faqs} />;
}
