import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getAdminJuryOverview } from "@/lib/jury/actions";
import AdminJuryClient from "@/components/admin/AdminJuryClient";

export const metadata: Metadata = {
  title: "Grand Jury Management | Kutchmitra Awards 2026 Admin",
  description: "Juror appointments, nomination assignments, and jury evaluation monitoring.",
};

export const dynamic = "force-dynamic";

export default async function AdminJuryPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/jury");
  }

  // Strict Role Gate: Jury governance is restricted to Management & Super Admin
  if (!session.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-950/70 border-2 border-red-500/50 p-8 space-y-4 shadow-card">
          <h1 className="font-display text-xl font-bold text-white">
            Access Restricted — Management Privileges Required
          </h1>
          <p className="text-xs text-red-200 leading-relaxed font-sans">
            Grand Jury Management and juror assignments are restricted to Managerial and Super Administrator accounts.
            Operational reviewers and verification team members do not have authorization to view or alter jury appointments.
          </p>
        </div>
      </div>
    );
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
