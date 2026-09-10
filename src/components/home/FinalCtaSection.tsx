import React from "react";
import { ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCtaSection() {
  return (
    <section className="bg-navy-950 text-white py-16 sm:py-20 relative overflow-hidden">
      {/* Architectural ambient lighting & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(197,160,89,0.1)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      
      {/* Structural Hairlines */}
      <div className="container-editorial relative z-10 text-center max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold-500/40 bg-gold-500/10 text-gold-400 text-xs font-mono tracking-widest uppercase">
          <Award size={13} className="text-gold-400" />
          <span>Kutchmitra Home &amp; Decor Awards 2026</span>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white font-medium tracking-tight leading-[1.15]">
            Your Work Deserves to Be Seen &amp; Celebrated
          </h2>
          <p className="font-sans text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Submit your completed architecture, interior design, and residential projects to the 2026 edition.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button
            href="/register"
            variant="primary"
            size="lg"
            icon={<ArrowRight size={15} />}
          >
            Nominate Now
          </Button>
          <Button
            href="/categories"
            variant="secondary"
            size="lg"
          >
            Explore Categories
          </Button>
        </div>

        <div className="pt-6 border-t border-white/10 text-xs font-mono text-slate-400">
          <span>Official 2026 Edition Platform &bull; Architectural &amp; Interior Design Honors</span>
        </div>
      </div>
    </section>
  );
}
