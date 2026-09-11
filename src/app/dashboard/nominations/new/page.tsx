import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureApplicantProfile } from "@/lib/auth/profile";
import CategorySelectorClient from "@/components/nominations/CategorySelectorClient";
import type { CategoryOption } from "@/components/nominations/Step2Category";

export const dynamic = "force-dynamic";

export default async function NewNominationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/nominations/new");
  }

  // Idempotently ensure applicant profile exists
  await ensureApplicantProfile(supabase, user);

  // Fetch active 2026 categories
  const { data: categoriesData, error: catErr } = await supabase
    .from("categories")
    .select("id, code, name, slug, short_description, eligibility_criteria")
    .eq("is_active", true)
    .order("display_order");

  if (catErr || !categoriesData) {
    throw new Error("Unable to load award categories. Please try again later.");
  }

  const categories: CategoryOption[] = categoriesData.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    slug: c.slug,
    short_description: c.short_description,
    eligibility_criteria: c.eligibility_criteria,
  }));

  return <CategorySelectorClient categories={categories} />;
}
