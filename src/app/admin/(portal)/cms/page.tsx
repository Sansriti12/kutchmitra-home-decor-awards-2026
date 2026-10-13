import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { getAdminSession, isManagementAuthorized } from "@/lib/admin/auth";
import { getCmsWorkspaceData } from "@/lib/cms/actions";
import AdminCmsClient from "@/components/admin/AdminCmsClient";

export const metadata: Metadata = {
  title: "Content / CMS | Admin Portal | Kutchmitra Awards 2026",
  description:
    "Content Management System for public timeline, FAQs, jury profiles, announcements, and contact channels for Kutchmitra Home & Decor Awards 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  // 1. Enforce Server-Side Authentication
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/cms");
  }

  // 2. Strict Role Gate: Restricted to Management (Admin) and Super Admin
  if (!isManagementAuthorized(session)) {
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
            The Content Management System (CMS) is restricted to Managerial and Super Administrator accounts.
            Operational reviewers, verification team members, and jury members do not have authorization to edit
            public website content or modify global announcement banners.
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

  // 3. Fetch authoritative CMS workspace data
  const workspaceData = await getCmsWorkspaceData();

  if (!workspaceData.success) {
    return (
      <div className="p-8 bg-red-950/70 border border-red-500/40 text-red-200 font-mono text-xs space-y-2">
        <h2 className="font-bold text-sm text-red-300">Failed to load CMS Workspace</h2>
        <p>{workspaceData.error || "An unexpected error occurred while compiling CMS records."}</p>
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
    <AdminCmsClient
      initialData={{
        dates: workspaceData.dates,
        faqs: workspaceData.faqs,
        announcements: workspaceData.announcements,
        siteSettings: workspaceData.siteSettings,
        juryProfiles: workspaceData.juryProfiles,
        categories: workspaceData.categories,
        winnerStats: workspaceData.winnerStats,
      }}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
