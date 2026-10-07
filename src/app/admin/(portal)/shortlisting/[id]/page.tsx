import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/lib/admin/auth";
import { getFinalDeliberationDossier } from "@/lib/admin/shortlist-actions";
import AdminDeliberationClient from "@/components/admin/AdminDeliberationClient";

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: "Final Deliberation Dossier | Admin Portal | Kutchmitra Awards 2026",
    description: "Confidential committee review, jury evaluation synthesis, and winner selection.",
  };
}

export default async function AdminDeliberationPage({ params }: PageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect(`/admin/login?redirect=/admin/shortlisting/${params.id}`);
  }

  const result = await getFinalDeliberationDossier(params.id);

  if (!result.success || !result.dossier) {
    return (
      <div className="p-8 bg-navy-900 border border-white/10 max-w-md mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-display text-white">Deliberation Dossier Not Found</h2>
        <p className="text-xs font-mono text-slate-400">
          {result.error || "The requested nomination could not be retrieved for final deliberation."}
        </p>
        <div className="pt-2">
          <Link
            href="/admin/shortlisting"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-mono font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={13} />
            <span>Back to Shortlisting Workspace</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminDeliberationClient
      dossier={result.dossier}
      isAdmin={session.isAdmin}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
