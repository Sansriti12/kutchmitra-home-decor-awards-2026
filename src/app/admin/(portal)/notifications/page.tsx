import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getAdminNotificationLogs } from "@/lib/notifications/actions";
import AdminNotificationsClient from "@/components/admin/AdminNotificationsClient";

export const metadata: Metadata = {
  title: "Notifications & Email Communications | Admin Portal | Kutchmitra Awards 2026",
  description: "Monitor multi-channel transactional dispatches, audit idempotency deduplication keys, and retry failed communications.",
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login?redirect=/admin/notifications");
  }

  const result = await getAdminNotificationLogs({ page: 1, pageSize: 20 });

  if (!result.success) {
    return (
      <div className="p-8 bg-red-950/70 border border-red-500/40 text-red-200 font-mono text-xs">
        <h2 className="font-bold text-sm text-red-300">Failed to load Notifications Center</h2>
        <p className="mt-1">{result.error}</p>
      </div>
    );
  }

  return (
    <AdminNotificationsClient
      initialLogs={result.logs}
      initialStats={result.stats}
      initialPagination={result.pagination}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
