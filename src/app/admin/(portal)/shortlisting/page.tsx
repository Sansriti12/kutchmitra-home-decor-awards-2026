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
