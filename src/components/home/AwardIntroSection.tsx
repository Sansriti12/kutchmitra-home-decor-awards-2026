import React from "react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { EditorialLink } from "@/components/ui/EditorialLink";

export function AwardIntroSection() {
  return (
    <section className="bg-[#FBFAF7] py-14 sm:py-18 border-b border-navy-900/10">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left: Section marker & heading (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <SectionMarker number="01" label="About" theme="light" />
            <h2 className="heading-editorial text-navy-900 leading-tight">
              Recognizing Design Excellence
            </h2>
          </div>

          {/* Right: Short paragraph & CTA (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <p className="body-editorial text-[#4A4F5C]">
              The Kutchmitra Home &amp; Decor Awards 2026 celebrate outstanding residential architecture, interior design, and craftsmanship. The platform honors visionary design thinking and spatial innovation across diverse residential categories.
            </p>
            <div>
              <EditorialLink href="/about" theme="light" showArrow>
                Read About the Awards
              </EditorialLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
