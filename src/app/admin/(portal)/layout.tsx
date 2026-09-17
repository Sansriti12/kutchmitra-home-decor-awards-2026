import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.isSuperAdmin ? "Super Admin" : "Admin";

  return (
    <AdminShell
      userEmail={session.user.email}
      userName={session.user.fullName}
      userRole={userRole}
      isSuperAdmin={session.isSuperAdmin}
    >
      {children}
    </AdminShell>
  );
}
