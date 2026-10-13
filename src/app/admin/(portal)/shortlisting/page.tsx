import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getShortlistingWorkspaceData } from "@/lib/admin/shortlist-actions";
import AdminShortlistingClient from "@/components/admin/AdminShortlistingClient";

export const metadata: Metadata = {
  title: "Shortlisting & Deliberation | Admin Portal | Kutchmitra Awards 2026",
  description: "Curate official shortlists, review qualitative jury recommendations, and freeze finalists.",
};

export const dynamic = "force-dynamic";

export default async function AdminShortlistingPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/shortlisting");
  }

  // Strict Role Gate: Shortlisting is restricted to Management & Super Admin
  if (!session.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-950/70 border-2 border-red-500/50 p-8 space-y-4 shadow-card">
          <h1 className="font-display text-xl font-bold text-white">
            Access Restricted — Management Privileges Required
          </h1>
          <p className="text-xs text-red-200 leading-relaxed font-sans">
            Shortlisting curation, committee deliberation, and finalist locking are strictly restricted to Managerial and Super Administrator accounts.
            Verification team members do not have authorization to curate or lock shortlists.
          </p>
        </div>
      </div>
    );
  }

  const result = await getShortlistingWorkspaceData();

  if (!result.success) {
    return (
      <div className="p-8 bg-red-950/70 border border-red-500/40 text-red-200 font-mono text-xs">
        <h2 className="font-bold text-sm text-red-300">Failed to load shortlisting workspace</h2>
        <p className="mt-1">{result.error}</p>
      </div>
    );
  }

  return (
    <AdminShortlistingClient
      initialItems={result.items}
      stats={result.stats}
      categories={result.categories}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
