import React from "react";
import type { Metadata } from "next";
import { getPublicSiteSettings } from "@/lib/cms/public";
import ContactClient from "@/components/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact Awards Desk | Kutchmitra Home & Decor Awards 2026",
  description:
    "Official contact channels, regional office address in Bhuj, dedicated helpline, and inquiry form for the Kutchmitra Home & Decor Awards 2026.",
};

export const revalidate = 60; // ISR cache revalidation

export default async function ContactPage() {
  const siteSettings = await getPublicSiteSettings();

  return <ContactClient siteSettings={siteSettings} />;
}
