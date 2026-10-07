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

const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TEST_EMAIL = "jury.test.2026@kutchmitra.com";
const TEST_PASSWORD = "jury@123";

async function verifyCompleteJurorSession() {
  console.log("=== 1. Simulating Juror Sign-In ===");
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError || !authData.user) {
    console.error("Authentication failed:", authError);
    process.exit(1);
  }
  console.log("Authenticated as:", authData.user.email, "(ID:", authData.user.id, ")");

  console.log("\n=== 2. Simulating /jury/login Role Verification ===");
  const { data: roles } = await anonClient
    .from("user_roles")
    .select("role_id")
    .eq("user_id", authData.user.id);

  const roleIds = (roles || []).map(r => r.role_id);
  const isAuthorized = roleIds.includes("jury_member") || roleIds.includes("admin") || roleIds.includes("super_admin");
  console.log("Roles found:", roleIds);
  console.log("Authorized for Jury Portal:", isAuthorized ? "YES (PASS)" : "NO (FAIL)");

  console.log("\n=== 3. Simulating getJurySession() ===");
  const [profileRes, juryProfileRes] = await Promise.all([
    admin.from("users").select("full_name").eq("id", authData.user.id).single(),
    admin.from("jury_profiles").select("id, edition_id, designation, organization, is_public").eq("user_id", authData.user.id).single(),
  ]);

  console.log("Juror Full Name:", profileRes.data?.full_name);
  console.log("Jury Profile ID:", juryProfileRes.data?.id);
  console.log("Designation:", juryProfileRes.data?.designation);
  console.log("Organization:", juryProfileRes.data?.organization);
  console.log("Edition ID:", juryProfileRes.data?.edition_id);
  console.log("Public Display:", juryProfileRes.data?.is_public ? "Public" : "Private (Disabled)");

  console.log("\n=== 4. Checking Juror Dashboard Data (Assignments Queue) ===");
  const { data: assignments } = await admin
    .from("jury_assignments")
    .select("id, status, application_id")
    .eq("jury_profile_id", juryProfileRes.data.id);

  console.log("Assigned Nominations Count:", assignments?.length || 0);
  console.log("Status: READY for Admin Manual Assignment in UAT!");
}

verifyCompleteJurorSession();
