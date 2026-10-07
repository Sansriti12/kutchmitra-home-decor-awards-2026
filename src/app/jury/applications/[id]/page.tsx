import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getJurySession } from "@/lib/jury/auth";
import { getJuryApplicationDossier } from "@/lib/jury/actions";
import JuryDossierClient from "@/components/jury/JuryDossierClient";

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Jury Evaluation Dossier | Kutchmitra Awards 2026`,
    description: "Confidential architectural review and criteria evaluation.",
  };
}

export default async function JuryApplicationDetailPage({ params }: PageProps) {
  const session = await getJurySession();
  if (!session) {
    redirect(`/jury/login?redirect=/jury/applications/${params.id}`);
  }

  const result = await getJuryApplicationDossier(params.id);

  if (!result.success || !result.dossier) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6 text-slate-200">
        <div className="bg-navy-900 border border-white/10 p-8 max-w-md space-y-4 text-center">
          <div className="w-12 h-12 bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-display text-white">Evaluation Access Denied</h2>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            {result.error || "You do not possess authorized jury evaluation clearance for this nomination."}
          </p>
          <div className="pt-2">
            <Link
              href="/jury/portal"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider"
            >
              <ArrowLeft size={13} />
              <span>Back to Jury Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <JuryDossierClient dossier={result.dossier} />;
}
