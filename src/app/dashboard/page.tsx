import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureApplicantProfile } from "@/lib/auth/profile";
import ApplicantDashboardClient from "@/components/dashboard/ApplicantDashboardClient";
import type {
  ApplicationItem,
  NotificationItem,
  CategoryItem,
} from "@/components/dashboard/ApplicantDashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Idempotently ensure applicant profile exists
  await ensureApplicantProfile(supabase, user);

  // Parallel fetch: User identity, roles, profile, applications, categories, notifications
  const [userRes, rolesRes, profileRes, appsRes, catsRes, notifsRes] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, email, phone, is_active, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role_id").eq("user_id", user.id),
    supabase
      .from("applicant_profiles")
      .select(
        "organization_name, designation, city, state, postal_code, address_line, website_url, portfolio_url"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("*")
      .eq("applicant_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, code, name, slug, short_description")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("notifications")
      .select("id, subject, body, channel, notification_type, status, created_at")
      .eq("recipient_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const dbUser = userRes.data;
  const profile = profileRes.data;
  const userRoles = rolesRes.data;
  const rawApplications = appsRes.data || [];
  const categories: CategoryItem[] = (catsRes.data as CategoryItem[]) || [];
  const notifications: NotificationItem[] = (notifsRes.data as NotificationItem[]) || [];

  // Create lookup map for categories
  const categoriesMap = new Map<string, CategoryItem>();
  categories.forEach((cat) => {
    categoriesMap.set(cat.id, cat);
  });

  // Attach category data to each application
  const applications: ApplicationItem[] = rawApplications.map((app) => {
    const matchedCategory = categoriesMap.get(app.category_id);
    return {
      id: app.id,
      nomination_id: app.nomination_id,
      edition_id: app.edition_id,
      category_id: app.category_id,
      project_name: app.project_name,
      project_city: app.project_city,
      project_state: app.project_state,
      project_completion_date: app.project_completion_date,
      built_up_area_sqft: app.built_up_area_sqft ? Number(app.built_up_area_sqft) : null,
      status: app.status,
      current_wizard_step: app.current_wizard_step,
      declaration_accepted: app.declaration_accepted,
      declaration_accepted_at: app.declaration_accepted_at,
      submitted_at: app.submitted_at,
      is_locked: app.is_locked,
      created_at: app.created_at,
      updated_at: app.updated_at,
      category: matchedCategory
        ? {
            code: matchedCategory.code,
            name: matchedCategory.name,
            slug: matchedCategory.slug,
          }
        : null,
    };
  });

  const roles = userRoles && userRoles.length > 0 ? userRoles.map((r) => r.role_id) : ["applicant"];

  return (
    <ApplicantDashboardClient
      user={{ id: user.id, email: user.email }}
      dbUser={dbUser}
      profile={profile}
      roles={roles}
      applications={applications}
      notifications={notifications}
      categories={categories}
    />
  );
}
