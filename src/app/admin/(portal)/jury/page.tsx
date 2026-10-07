import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getAdminJuryOverview } from "@/lib/jury/actions";
import AdminJuryClient from "@/components/admin/AdminJuryClient";

export const metadata: Metadata = {
  title: "Grand Jury Management | Kutchmitra Awards 2026 Admin",
  description: "Governance, juror appointment, nomination assignments, and confidential evaluation monitoring.",
};

export const dynamic = "force-dynamic";

export default async function AdminJuryPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/jury");
  }

  const overview = await getAdminJuryOverview();

  if (!overview.success || !overview.stats || !overview.juryMembers || !overview.assignments) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-display text-red-400">Failed to load Grand Jury Governance</h2>
        <p className="text-xs font-mono text-slate-400">{overview.error || "Unknown server error."}</p>
      </div>
    );
  }

  return (
    <AdminJuryClient
      initialData={{
        stats: overview.stats,
        juryMembers: overview.juryMembers,
        assignments: overview.assignments,
        eligibleApplications: overview.eligibleApplications || [],
      }}
      currentUserEmail={session.user.email}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
