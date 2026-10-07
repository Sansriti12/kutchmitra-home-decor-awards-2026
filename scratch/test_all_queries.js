const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

async function runTests() {
  console.log("=== Testing Query 1: Admin Jury Overview (Jury Profiles) ===");
  const q1 = await admin
    .from("jury_profiles")
    .select(`
      id,
      user_id,
      edition_id,
      honorific,
      organization,
      designation,
      bio,
      photo_url,
      display_order,
      is_public,
      created_at,
      users (
        id,
        email,
        full_name,
        is_active
      )
    `)
    .order("display_order", { ascending: true });
  console.log("Q1 Profiles:", q1.error ? "FAILED: " + q1.error.message : "SUCCESS (count: " + q1.data?.length + ")");

  console.log("\n=== Testing Query 2: Admin Jury Overview (Assignments) ===");
  const q2 = await admin
    .from("jury_assignments")
    .select(`
      id,
      edition_id,
      jury_profile_id,
      application_id,
      assigned_by,
      status,
      conflict_declared,
      conflict_reason,
      completed_at,
      created_at,
      applications (
        id,
        nomination_id,
        project_name,
        project_city,
        project_state,
        category_id,
        categories (
          id,
          code,
          name,
          slug
        )
      ),
      jury_profiles (
        id,
        user_id,
        organization,
        designation,
        users (
          id,
          full_name,
          email
        )
      ),
      jury_evaluations (
        id,
        status,
        is_locked,
        submitted_at,
        recommendation,
        general_comment
      )
    `)
    .order("created_at", { ascending: false });
  console.log("Q2 Assignments:", q2.error ? "FAILED: " + q2.error.message : "SUCCESS (count: " + q2.data?.length + ")");

  console.log("\n=== Testing Query 3: Admin Eligible Applications ===");
  const q3 = await admin
    .from("applications")
    .select(`
      id,
      nomination_id,
      project_name,
      project_city,
      status,
      category_id,
      categories (
        id,
        code,
        name,
        slug
      )
    `)
    .in("status", ["eligible", "jury_review"])
    .order("nomination_id", { ascending: true });
  console.log("Q3 Eligible:", q3.error ? "FAILED: " + q3.error.message : "SUCCESS (count: " + q3.data?.length + ")");

  console.log("\n=== Testing Query 4: Juror Dashboard Assignments ===");
  const q4 = await admin
    .from("jury_assignments")
    .select(`
      id,
      edition_id,
      jury_profile_id,
      application_id,
      assigned_by,
      status,
      conflict_declared,
      conflict_reason,
      completed_at,
      created_at,
      applications (
        id,
        nomination_id,
        project_name,
        project_city,
        project_state,
        category_id,
        categories (
          id,
          code,
          name,
          slug
        )
      ),
      jury_evaluations (
        id,
        status,
        is_locked,
        submitted_at,
        recommendation,
        general_comment
      )
    `)
    .order("created_at", { ascending: false });
  console.log("Q4 Juror Dashboard:", q4.error ? "FAILED: " + q4.error.message : "SUCCESS (count: " + q4.data?.length + ")");

  console.log("\n=== Testing Query 5: Dossier Application Query ===");
  const { data: sampleApp } = await admin.from("applications").select("id").limit(1).single();
  if (sampleApp) {
    const q5 = await admin
      .from("applications")
      .select(`
        id,
        nomination_id,
        project_name,
        project_city,
        project_state,
        project_completion_date,
        built_up_area_sqft,
        status,
        category_id,
        categories (
          id,
          code,
          name,
          slug,
          short_description
        )
      `)
      .eq("id", sampleApp.id)
      .single();
    console.log("Q5 Application Dossier:", q5.error ? "FAILED: " + q5.error.message : "SUCCESS (Nomination: " + q5.data?.nomination_id + ", Category: " + q5.data?.categories?.name + ")");
  }
}

runTests();
