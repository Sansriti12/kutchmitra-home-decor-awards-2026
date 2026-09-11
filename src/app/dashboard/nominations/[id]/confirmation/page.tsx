import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NominationConfirmationClient from "@/components/nominations/NominationConfirmationClient";

export const dynamic = "force-dynamic";

interface ConfirmationPageProps {
  params: {
    id: string;
  };
}

export default async function NominationConfirmationPage({ params }: ConfirmationPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/nominations/${params.id}/confirmation`);
  }

  // 1. Fetch the application
  const { data: application, error: appErr } = await supabase
    .from("applications")
    .select("*, categories(id, code, name)")
    .eq("id", params.id)
    .maybeSingle();

  if (appErr || !application) {
    notFound();
  }

  // 2. Strict applicant isolation check
  if (application.applicant_id !== user.id) {
    notFound();
  }

  // 3. If application is still draft, redirect to wizard
  if (application.status === "draft" && !application.is_locked) {
    redirect(`/dashboard/nominations/${params.id}`);
  }

  const category = application.categories as any;

  return (
    <NominationConfirmationClient
      applicationId={application.id}
      nominationId={application.nomination_id}
      projectName={application.project_name}
      categoryName={category?.name || "Award Category"}
      categoryCode={category?.code || "01"}
      submittedAt={application.submitted_at || application.updated_at}
      projectLocation={`${application.project_city}, ${application.project_state}`}
    />
  );
}
