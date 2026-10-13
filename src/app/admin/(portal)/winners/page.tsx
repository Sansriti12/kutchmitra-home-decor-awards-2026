import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getWinnersWorkspaceData } from "@/lib/admin/winner-actions";
import AdminWinnersClient from "@/components/admin/AdminWinnersClient";

export const metadata: Metadata = {
  title: "Winner Management & Grand Finale | Admin Portal | Kutchmitra Awards 2026",
  description: "Curate winner profiles, manage publication workflows, and publish official results.",
};

export const dynamic = "force-dynamic";

export default async function AdminWinnersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/winners");
  }

  // Strict Role Gate: Winner management is restricted to Management & Super Admin
  if (!session.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-950/70 border-2 border-red-500/50 p-8 space-y-4 shadow-card">
          <h1 className="font-display text-xl font-bold text-white">
            Access Restricted — Management Privileges Required
          </h1>
          <p className="text-xs text-red-200 leading-relaxed font-sans">
            Winner designation, editorial profile curation, and official publication are strictly restricted to Managerial and Super Administrator accounts.
            Verification team members do not have authorization to designate or publish winners.
          </p>
        </div>
      </div>
    );
  }

  const result = await getWinnersWorkspaceData();

  if (!result.success) {
    return (
      <div className="p-8 bg-red-950/70 border border-red-500/40 text-red-200 font-mono text-xs">
        <h2 className="font-bold text-sm text-red-300">Failed to load Winner Management</h2>
        <p className="mt-1">{result.error}</p>
      </div>
    );
  }

  return (
    <AdminWinnersClient
      categories={result.categories}
      winners={result.winners}
      shortlistedCandidates={result.shortlistedCandidates}
      stats={result.stats}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
