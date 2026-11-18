import React from "react";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { EditorialLink } from "@/components/ui/EditorialLink";
import {
  Award,
  TrendingUp,
  Sparkles,
  Users,
  BookOpen,
  Share2,
} from "lucide-react";

export function WhyNominateSection() {
  const BENEFITS = [
    {
      icon: Award,
      title: "Gain Recognition",
      description: "Gain recognition and celebrate your hard work and achievements.",
    },
    {
      icon: TrendingUp,
      title: "Enhance Your Profile",
      description: "Enhance your profile and promote your business to potential new customers.",
    },
    {
      icon: Sparkles,
      title: "Boost Workplace Morale",
      description: "Boost your workplace morale and encourage further innovation.",
    },
    {
      icon: Users,
      title: "Grow Your Network",
      description: "Grow your network and connect with other influential business leaders.",
    },
    {
      icon: BookOpen,
      title: "Best Practice & Insight",
      description: "Share your insight into best practice and learn from fellow professionals.",
    },
    {
      icon: Share2,
      title: "PR & Media Exposure",
      description: "Improve your business through PR, news sites and social media.",
    },
  ];

  return (
    <section id="why-nominate" className="bg-[#FBFAF7] py-14 sm:py-20 lg:py-24 border-b border-navy-900/10">
      <div className="container-editorial space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <SectionMarker number="03" label="Benefits &amp; Value" theme="light" />
            <h2 className="heading-editorial text-navy-900 leading-tight">
              Why Nominate
            </h2>
            <p className="body-editorial text-[#4A4F5C] text-sm sm:text-base">
              A peer-reviewed platform dedicated to honoring craftsmanship, celebrating exceptional design, and establishing benchmarks of professional excellence across Kutch.
            </p>
          </div>
          <div className="self-start md:self-end">
            <EditorialLink href="/how-to-nominate" theme="light" showArrow>
              How to Nominate
            </EditorialLink>
          </div>
        </div>

        {/* 6 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-6 sm:p-7 bg-white border border-navy-900/10 space-y-3 hover:border-gold-500/50 hover:shadow-card transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center text-gold-700 group-hover:bg-gold-500 group-hover:text-navy-950 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="font-mono text-xs font-semibold text-gold-700 tracking-wider">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-navy-900 font-medium group-hover:text-navy-950 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4F5C] font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
