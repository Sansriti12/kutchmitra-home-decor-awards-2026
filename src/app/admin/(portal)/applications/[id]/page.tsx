import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getAdminApplicationDossier } from "@/lib/admin/actions";
import AdminDossierClient from "@/components/admin/AdminDossierClient";

export const dynamic = "force-dynamic";

interface AdminApplicationDossierPageProps {
  params: {
    id: string;
  };
}

export default async function AdminApplicationDossierPage({
  params,
}: AdminApplicationDossierPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect(`/admin/login?redirect=/admin/applications/${params.id}`);
  }

  const dossier = await getAdminApplicationDossier(params.id);

  if (!dossier.success || !dossier.application) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <AdminDossierClient dossier={dossier} />
    </div>
  );
}
