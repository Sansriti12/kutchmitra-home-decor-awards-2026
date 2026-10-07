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
