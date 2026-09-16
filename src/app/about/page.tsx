import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  BookOpen,
  Users,
  Compass,
  Briefcase,
  HeartHandshake,
} from "lucide-react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us | Janmabhoomi Group & Kutchmitra",
  description:
    "Learn about the Janmabhoomi Group, Saurashtra Trust (est. 1931 by Shri Amrutlal Sheth), and Kutchmitra's 93+ year legacy of credible journalism, social responsibility, and regional connect.",
};

export default function AboutPage() {
  const OFFICIAL_METRICS = [
    {
      figure: "93+",
      unit: "Years",
      label: "Institutional Legacy",
      detail: "Under the stewardship of Saurashtra Trust",
    },
    {
      figure: "1931",
      unit: "Founded",
      label: "Saurashtra Trust",
      detail: "Established by patriot Shri Amrutlal Sheth",
    },
    {
      figure: "5+",
      unit: "Publications",
      label: "Respected Dailies & Periodicals",
      detail: "Including Janmabhoomi, Kutchmitra & Phulchhab",
    },
    {
      figure: "5M+",
      unit: "Readers",
      label: "Regional Readership",
      detail: "Across Gujarat, Maharashtra & beyond",
    },
  ];

  const INSTITUTIONAL_PILLARS = [
    {
      number: "01",
      title: "Credible Journalism",
      description:
        "Editorial independence, factual rigor, and enduring integrity cultivated across generations of Gujarati-language journalism.",
      icon: BookOpen,
    },
    {
      number: "02",
      title: "Public Interest",
      description:
        "Deeply rooted commitment to informing communities, reflecting regional aspirations, and highlighting essential development issues.",
      icon: Users,
    },
    {
      number: "03",
      title: "Responsible Communication",
      description:
        "Balanced, constructive public discourse that emphasizes not only reporting events, but contributing to societal awareness and welfare.",
      icon: Shield,
    },
    {
      number: "04",
      title: "Regional Connect",
      description:
        "Unrivaled grassroots understanding and authentic cultural connection with communities across Kutch, Saurashtra, and Gujarat.",
      icon: Compass,
    },
    {
      number: "05",
      title: "Social Responsibility",
      description:
        "A historic record of standing with communities during natural calamities, national crises, and supporting those in need.",
      icon: HeartHandshake,
    },
    {
      number: "06",
      title: "Business & Commercial Awareness",
      description:
        "Authoritative commercial coverage, commercial publishing, and economic insight connecting people, ideas, and regional enterprises.",
      icon: Briefcase,
    },
  ];

  return (
    <main className="flex-1 bg-ivory text-navy-900 font-sans">
      {/* ========================================================================= */}
      {/* SECTION 01 — HERO & INSTITUTIONAL FOUNDATION */}
      {/* ========================================================================= */}
      <section className="relative py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7] overflow-hidden">
        {/* Subtle ambient lighting accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-[radial-gradient(ellipse_at_top,_rgba(197,168,128,0.14)_0%,_transparent_70%)] pointer-events-none" />

        <div className="container-editorial relative z-10 space-y-6 sm:space-y-7">
          {/* Section Marker & Legacy Badge */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SectionMarker number="01" label="About Us" theme="light" />
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-gold-700 bg-gold-500/10 border border-gold-500/20 px-3 py-1 font-semibold">
              93+ Years of Legacy • Saurashtra Trust
            </span>
          </div>

          {/* Institutional Masthead & Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative w-48 sm:w-56 md:w-64 h-14 sm:h-16 flex-shrink-0">
              <Image
                src="/assets/branding/kutchmitra-logo.png"
                alt="Kutchmitra - Janmabhoomi Group"
                fill
                priority
                sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                className="object-contain object-left"
              />
            </div>
            <div className="hidden sm:block w-px h-14 bg-navy-900/15" />
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-700 font-semibold block">
                Janmabhoomi Group
              </span>
              <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans max-w-xl">
                Under the stewardship of Saurashtra Trust • Established 1931
              </p>
            </div>
          </div>

          {/* Main Editorial Heading */}
          <div className="space-y-3.5 max-w-4xl">
            <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-gold-700 font-semibold block">
              About Kutchmitra Home &amp; Decor Awards 2026
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-navy-900 font-medium leading-[1.18] tracking-tight">
              A Legacy of Journalism, Public Service &amp; Regional Connect
            </h1>
            <div className="space-y-3 text-base sm:text-lg text-[#3A3F4C] leading-relaxed font-sans">
              <p>
                For over <strong className="font-semibold text-navy-900">93 years</strong>, the Janmabhoomi Group, under the stewardship of Saurashtra Trust, has been a respected institution in Gujarati journalism, public communication and business publishing. With a strong legacy of editorial credibility, regional understanding and public service, the Group has built an enduring relationship of trust with millions of readers across generations.
              </p>
              <p className="text-sm sm:text-base text-[#4A4F5C]">
                The Saurashtra Trust was established in <strong className="text-navy-900 font-semibold">1931</strong> by the distinguished patriot and freedom fighter <strong className="text-navy-900 font-semibold">Shri Amrutlal Sheth</strong>. On <strong className="text-navy-900 font-semibold">9 June 1934</strong>, the Trust began publishing the Gujarati daily <em>Janmabhoomi</em> from Mumbai. The Trust was founded with the objective of publishing newspapers and periodicals while supporting social institutions in their work and efforts.
              </p>
            </div>
          </div>

          {/* Official Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-navy-900/10">
            {OFFICIAL_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="p-4 sm:p-5 bg-white border border-navy-900/10 shadow-sm space-y-1"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl sm:text-3xl text-navy-900 font-semibold tracking-tight">
                    {metric.figure}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-gold-700 font-semibold">
                    {metric.unit}
                  </span>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 block font-medium">
                  {metric.label}
                </span>
                <p className="text-[11px] text-[#5A5F6C] font-sans pt-0.5">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02 — KUTCHMITRA: SERVING THE PEOPLE OF KUTCH */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <SectionMarker number="02" label="Regional Voice" theme="light" />
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy-900 font-medium leading-tight">
                  Kutchmitra: A Distinctive Voice for the Kutchi Community
                </h2>

                <div className="p-5 sm:p-6 bg-white border border-navy-900/10 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <Image
                        src="/assets/branding/home-decor-awards-2026-logo.png"
                        alt="Official Awards Crest"
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 font-semibold block">
                        Kutchmitra Initiative
                      </span>
                      <h3 className="font-display text-base text-navy-900 font-medium leading-snug">
                        Home &amp; Decor Awards 2026
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#4A4F5C] font-sans leading-relaxed border-t border-navy-900/10 pt-2.5">
                    A regional celebration honoring excellence in residential design, craftsmanship, and the built environment across Kutch and Gujarat.
                  </p>
                </div>
              </div>

              {/* Official Website Card */}
              <div className="p-4 bg-[#FBFAF7] border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 block">
                    Official Daily Portal
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-navy-900 font-semibold">
                    kutchmitradaily.com
                  </span>
                </div>
                <a
                  href="https://www.kutchmitradaily.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white hover:bg-gold-600 font-mono text-xs uppercase tracking-wider font-semibold transition-colors duration-200"
                >
                  <span>Visit Website</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Right Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Editorial Quote Box */}
              <div className="p-6 sm:p-7 bg-[#FBFAF7] border-l-4 border-gold-500 border-y border-r border-navy-900/10 space-y-2.5 shadow-sm">
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
                  A Legacy Built on Trust
                </span>
                <p className="font-display text-lg sm:text-xl text-navy-900 leading-snug italic">
                  &ldquo;Over the decades, the Janmabhoomi Group has evolved into a respected media and publishing institution with a presence across print, digital and business publishing. Its publications have played an important role in informing communities, reflecting regional aspirations, highlighting development issues and creating informed public discourse.&rdquo;
                </p>
              </div>

              {/* Verified Editorial Text */}
              <div className="space-y-4 text-sm sm:text-base text-[#4A4F5C] font-sans leading-relaxed">
                <p>
                  Serving the people of Kutch for decades, <strong className="text-navy-900 font-semibold">Kutchmitra</strong> has developed a distinctive identity as a strong regional voice and an important source of news and information for the Kutchi community.
                </p>
                <p>
                  Its coverage reflects the region&apos;s social, economic and developmental journey, while its long-standing association with the people of Kutch has been particularly evident during natural disasters and periods of public need.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 bg-white p-4 border border-navy-900/10">
                  The Group&apos;s longstanding credibility, regional influence and connection with readers have made it a distinctive institution in Gujarati-language journalism and commercial publishing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03 — JOURNALISM WITH SOCIAL RESPONSIBILITY */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial space-y-6 sm:space-y-7">
          <div className="space-y-3 max-w-3xl">
            <SectionMarker number="03" label="Social Commitment" theme="light" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy-900 font-medium leading-tight">
              Journalism with a Strong Sense of Social Responsibility
            </h2>
            <p className="body-editorial text-[#4A4F5C] text-base sm:text-lg">
              For the Janmabhoomi Group, journalism has historically been closely connected with public service and social responsibility. The Group&apos;s publications have repeatedly stood with communities during natural calamities, social challenges and moments of national importance.
            </p>
            <p className="text-xs sm:text-sm text-[#5A5F6C] font-sans leading-relaxed">
              Their institutional philosophy has emphasized not only reporting events, but also contributing to public awareness, social welfare and constructive community action.
            </p>
          </div>

          {/* Three Documented Relief & Service Proof Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Janmabhoomi Service */}
            <article className="p-6 bg-white border border-navy-900/10 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 bg-gold-500/10 px-2 py-0.5 border border-gold-500/20 font-semibold">
                    1999 Kargil Appeal
                  </span>
                  <span className="font-mono text-xs font-bold text-navy-900">
                    ≈ ₹8.10 Cr
                  </span>
                </div>
                <h3 className="font-display text-xl text-navy-900 font-medium leading-snug">
                  Janmabhoomi – Service as a Responsibility
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  Throughout its history, Janmabhoomi has combined journalism with a strong sense of public service. During the 1999 Kargil conflict, the Group participated in a patriotic fund-raising effort that collected approximately <strong className="text-navy-900 font-semibold">₹8.10 crore</strong>, reflecting the strong public response generated through its social appeal.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 font-sans border-t border-navy-900/10 pt-3">
                Historical record also reflects involvement in education, social reform, relief efforts and initiatives supporting those in need.
              </p>
            </article>

            {/* Card 2: Kutchmitra Calamity & Recovery */}
            <article className="p-6 bg-white border-2 border-gold-500/40 space-y-4 shadow-sm flex flex-col justify-between relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold-700 bg-gold-500/15 px-2 py-0.5 border border-gold-500/30 font-semibold">
                    1998 Cyclone &amp; 2001 Quake
                  </span>
                  <span className="font-mono text-xs font-bold text-gold-700">
                    5 Villages Rebuilt
                  </span>
                </div>
                <h3 className="font-display text-xl text-navy-900 font-medium leading-snug">
                  Kutchmitra – Standing with Kutch
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  Kutchmitra has maintained a particularly close relationship with the people of Kutch. During major calamities, including the 1998 cyclone and the devastating 2001 earthquake, it remained closely connected with affected communities.
                </p>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  Following the 2001 earthquake, Kutchmitra not only upheld its commitment to responsible and constructive journalism, but also <strong className="text-navy-900 font-semibold">contributed to the rehabilitation of five remote villages in Kutch</strong>.
                </p>
              </div>
              <p className="text-[11px] text-gold-800 font-medium font-sans border-t border-navy-900/10 pt-3">
                Reflects a tradition of going beyond journalism to actively contribute to community recovery and rebuilding.
              </p>
            </article>

            {/* Card 3: Phulchhab Regional Journalism */}
            <article className="p-6 bg-white border border-navy-900/10 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-navy-900/10 pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 border border-slate-200 font-semibold">
                    Saurashtra Trust Daily
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-600">
                    Saurashtra
                  </span>
                </div>
                <h3 className="font-display text-xl text-navy-900 font-medium leading-snug">
                  Phulchhab – Public-Oriented Journalism
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                  Phulchhab also has a long history of public-oriented journalism and social engagement. Its historical journey includes involvement during natural calamities, social challenges and public movements, reinforcing its identity as a publication closely connected with the people of Saurashtra.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 font-sans border-t border-navy-900/10 pt-3">
                Integral part of Saurashtra Trust&apos;s enduring regional journalism stewardship.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 04 — FREEDOM MOVEMENT & INSTITUTIONAL PILLARS */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-ivory">
        <div className="container-editorial space-y-6 sm:space-y-7">
          <div className="space-y-3 max-w-3xl">
            <SectionMarker number="04" label="Heritage & Principles" theme="light" />
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy-900 font-medium leading-tight">
              A Tradition of Public-Interest Journalism
            </h2>
            <p className="body-editorial text-[#4A4F5C] text-base sm:text-lg">
              The history of the Janmabhoomi Group is closely associated with India&apos;s freedom movement and the development of Gujarati journalism.
            </p>
            <p className="text-xs sm:text-sm text-[#5A5F6C] font-sans leading-relaxed">
              The Group&apos;s publications have historically covered national affairs, politics, economics, education, social reform, culture, community issues and development. Janmabhoomi, in particular, played an active role in reporting the national movement and subsequently continued to focus on the responsibilities and challenges of independent India.
            </p>
          </div>

          {/* The Six Official Pillars from Source Document */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {INSTITUTIONAL_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.number}
                  className="p-5 sm:p-6 bg-white border border-navy-900/10 space-y-3 hover:border-gold-500/50 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-navy-900/10 pb-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-sand-100 text-gold-700 border border-gold-500/30">
                        {pillar.number}
                      </span>
                      <Icon size={16} className="text-gold-700" />
                    </div>
                    <h3 className="font-display text-base sm:text-lg text-navy-900 font-medium leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 05 — FROM PRINT LEGACY TO A WIDER MEDIA ECOSYSTEM */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-14 lg:py-16 border-b border-navy-900/10 bg-[#FBFAF7]">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <SectionMarker number="05" label="Media Evolution" theme="light" />
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-navy-900 font-medium leading-tight">
                From Print Legacy to a Wider Media Ecosystem
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-[#4A4F5C] font-sans leading-relaxed">
                <p>
                  While its roots are firmly established in print journalism, the Janmabhoomi Group&apos;s communication ecosystem has evolved with changing technology and audience behaviour.
                </p>
                <p>
                  Its publications now extend their presence through digital platforms and online news portals, enabling readers to access news and business information across devices and geographies.
                </p>
                <p>
                  This combination of legacy media credibility and digital accessibility enables the Group to remain connected with both traditional and emerging audiences.
                </p>
              </div>
            </div>

            {/* Right Column (5 cols) — Summary Card */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-7 bg-white border border-navy-900/10 space-y-4 shadow-sm">
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gold-700 font-semibold block">
                    Institutional Reach
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl text-navy-900 font-medium">
                    A Trusted Media Group
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#4A4F5C] leading-relaxed font-sans">
                  With a legacy spanning more than nine decades, the Janmabhoomi Group represents more than a collection of publications. It represents an enduring institution built around journalism, public service, regional identity, business communication and community connection.
                </p>
                <div className="p-3.5 bg-[#FBFAF7] border border-navy-900/10 text-xs text-slate-600 font-mono space-y-1">
                  <span className="font-semibold text-navy-900 block">Audience Geographies:</span>
                  <span>Gujarat • Maharashtra • Beyond</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 06 — THE AWARDS & THE OFFICIAL CREDO (DARK AWARDS CTA) */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 lg:py-20 bg-navy-900 text-white relative overflow-hidden border-t-2 border-gold-500/40 border-b border-navy-950">
        {/* Hairline Gold Top Accent */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

        {/* Ambient subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(197,160,89,0.08)_0%,_transparent_75%)] pointer-events-none" />

        <div className="container-editorial relative z-10 space-y-8 max-w-4xl mx-auto text-center">
          {/* Section Marker */}
          <div className="flex justify-center">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold-400 font-semibold block">
              Kutchmitra Home &amp; Decor Awards 2026
            </span>
          </div>

          {/* Contextual Connection to Awards */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-medium leading-tight tracking-tight">
              A Continuing Commitment to Society &amp; Public Recognition
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              Rooted in Kutchmitra&apos;s decades of regional stewardship and chronicling the developmental journey of Kutch, the Home &amp; Decor Awards 2026 honors the architects, interior designers, craftsmen, and creators shaping our built environment.
            </p>
          </div>

          {/* THE OFFICIAL TRIPARTITE CREDO (DIRECT FROM SOURCE) */}
          <div className="p-6 sm:p-8 bg-navy-950/70 border border-gold-500/30 backdrop-blur-sm space-y-3 max-w-3xl mx-auto shadow-xl">
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold-400 font-semibold block">
              Institutional Credo
            </span>
            <div className="space-y-1.5 font-display text-lg sm:text-xl md:text-2xl text-gold-200 italic leading-snug">
              <p>&ldquo;A legacy built over generations.</p>
              <p>A media ecosystem evolving with the times.</p>
              <p>A continuing commitment to journalism, society and public service.&rdquo;</p>
            </div>
          </div>

          {/* Clean Portal CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Button
              href="/categories"
              variant="primary"
              size="md"
              icon={<ArrowRight size={14} />}
              className="px-6 font-semibold tracking-wider text-xs uppercase"
            >
              Explore Award Categories
            </Button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-white/20 bg-transparent text-slate-200 hover:text-white hover:border-gold-400 hover:bg-white/5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors duration-150"
            >
              Applicant Portal Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-white/20 bg-transparent text-slate-200 hover:text-white hover:border-gold-400 hover:bg-white/5 text-xs font-mono uppercase tracking-wider font-semibold transition-colors duration-150"
            >
              Register Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
