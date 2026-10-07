import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getJurySession } from "@/lib/jury/auth";
import { getJuryDashboardData } from "@/lib/jury/actions";
import JuryDashboardClient from "@/components/jury/JuryDashboardClient";

export const metadata: Metadata = {
  title: "Grand Jury Evaluation Portal | Kutchmitra Awards 2026",
  description: "Confidential design assessment workspace for appointed Grand Jury panelists.",
};

export const dynamic = "force-dynamic";

export default async function JuryPortalPage() {
  const session = await getJurySession();
  if (!session) {
    redirect("/jury/login?redirect=/jury/portal");
  }

  const result = await getJuryDashboardData();

  if (!result.success || !result.juror || !result.stats || !result.assignments) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-center text-slate-200">
        <div className="bg-navy-900 border border-white/10 p-8 max-w-md space-y-4">
          <h2 className="text-xl font-display text-red-400">Jury Portal Notice</h2>
          <p className="text-xs font-mono text-slate-300">
            {result.error || "Unable to load assigned nominations at this time."}
          </p>
          <a
            href="/jury/login"
            className="inline-block px-4 py-2 bg-gold-500 text-navy-950 font-mono text-xs font-bold uppercase tracking-wider"
          >
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <JuryDashboardClient
      juror={result.juror}
      stats={result.stats}
      assignments={result.assignments}
    />
  );
}
