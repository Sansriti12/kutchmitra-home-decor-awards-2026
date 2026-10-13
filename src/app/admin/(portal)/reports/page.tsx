import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { getAdminSession } from "@/lib/admin/auth";
import { getReportsWorkspaceData } from "@/lib/admin/report-actions";
import AdminReportsClient from "@/components/admin/AdminReportsClient";

export const metadata: Metadata = {
  title: "Reports & Exports | Admin Portal | Kutchmitra Awards 2026",
  description:
    "Executive reporting, category metrics, jury evaluation progress, and data exports for Kutchmitra Home & Decor Awards 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  // 1. Enforce Server-Side Authentication
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/reports");
  }

  // 2. Strict Role Gate: Only Manager / Admin & Super Admin permitted
  // Verification Team, Jury Members, Applicants are completely forbidden
  if (!session.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-950/70 border-2 border-red-500/50 p-8 space-y-4 shadow-card">
          <div className="flex items-center gap-3 text-red-400">
            <ShieldAlert size={28} />
            <h1 className="font-display text-xl font-bold text-white">
              Access Restricted — Management Privileges Required
            </h1>
          </div>
          <p className="text-xs text-red-200 leading-relaxed font-sans">
            Reports &amp; Data Exports are strictly confidential internal governance modules restricted to
            Managerial and Super Administrator accounts. Verification team members and operational reviewers
            do not have authorization to access aggregate reporting or download candidate datasets.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-mono uppercase tracking-wider transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Return to Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fetch authoritative report workspace data
  const reportData = await getReportsWorkspaceData();

  if (!reportData.success) {
    return (
      <div className="p-8 bg-red-950/70 border border-red-500/40 text-red-200 font-mono text-xs space-y-2">
        <h2 className="font-bold text-sm text-red-300">Failed to load Reports Dashboard</h2>
        <p>{reportData.error || "An unexpected error occurred while compiling reports data."}</p>
        <Link
          href="/admin"
          className="inline-block mt-3 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <AdminReportsClient
      initialData={{
        applications: reportData.applications,
        executiveStats: reportData.executiveStats,
        categoryMetrics: reportData.categoryMetrics,
        juryMetric: reportData.juryMetric,
        filterOptions: reportData.filterOptions,
      }}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
