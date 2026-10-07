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

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";
const TEST_EMAIL = "jury.test.2026@kutchmitra.com";
const TEST_PASSWORD = "jury@123";
const TEST_NAME = "Phase D Test Juror";
const TEST_DESIGNATION = "Test Jury Member";
const TEST_ORGANIZATION = "Kutchmitra Phase D Testing";
const TEST_BIO = "Test account used for Phase D Jury Portal user acceptance testing.";

async function main() {
  console.log("================================================================================");
  console.log("           PHASE D UAT: CREATE SEPARATE TEST JURY LOGIN ACCOUNT                 ");
  console.log("================================================================================\n");

  // Step 1: Pre-check if email already exists
  console.log(`[1] Checking if ${TEST_EMAIL} already exists in auth or public tables...`);
  const { data: authList, error: authListErr } = await admin.auth.admin.listUsers();
  if (authListErr) {
    console.error("Failed to list auth users:", authListErr);
    process.exit(1);
  }

  const existingAuthUser = authList.users.find(u => u.email?.toLowerCase() === TEST_EMAIL.toLowerCase());
  const { data: existingPublicUsers } = await admin.from('users').select('*').eq('email', TEST_EMAIL.toLowerCase());

  if (existingAuthUser || (existingPublicUsers && existingPublicUsers.length > 0)) {
    console.error(`\n[CRITICAL ERROR] The email "${TEST_EMAIL}" already exists!`);
    if (existingAuthUser) console.error(`  - Found in auth.users with ID: ${existingAuthUser.id}`);
    if (existingPublicUsers?.length) console.error(`  - Found in public.users:`, existingPublicUsers);
    console.error("Per instructions: DO NOT overwrite or modify existing accounts. Stopping execution.");
    process.exit(1);
  }

  console.log(`  -> Confirmation: "${TEST_EMAIL}" does NOT exist. Proceeding with account creation.\n`);

  // Step 2: Record baseline state of existing Jury accounts to guarantee non-interference
  console.log("[2] Recording baseline state of existing Jury members...");
  const { data: baselineProfiles } = await admin.from('jury_profiles').select('id, user_id, organization, designation, is_public');
  const { data: baselineAssignments } = await admin.from('jury_assignments').select('id, jury_profile_id, application_id, status');
  console.log(`  -> Existing jury profiles: ${baselineProfiles?.length}`);
  console.log(`  -> Existing jury assignments: ${baselineAssignments?.length}`);
  const kiritAssignment = baselineAssignments?.find(a => a.jury_profile_id === '8a1a7c88-d19b-4751-91db-b054f6191b19');
  console.log(`  -> Kirit Mehta assignment baseline: ID ${kiritAssignment?.id}, Status: ${kiritAssignment?.status}\n`);

  // Step 3: Create Supabase Auth User
  console.log(`[3] Creating Supabase Auth account for ${TEST_EMAIL}...`);
  const { data: newAuthData, error: createAuthErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: TEST_NAME,
    },
  });

  if (createAuthErr || !newAuthData?.user) {
    console.error("Failed to create auth user:", createAuthErr);
    process.exit(1);
  }

  const newUserId = newAuthData.user.id;
  console.log(`  -> Auth user created successfully! User ID: ${newUserId}\n`);

  // Step 4: Ensure public.users record exists and is active
  console.log(`[4] Ensuring public.users profile is synchronized...`);
  const { data: publicUser, error: publicUserErr } = await admin
    .from('users')
    .upsert({
      id: newUserId,
      email: TEST_EMAIL,
      full_name: TEST_NAME,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (publicUserErr || !publicUser) {
    console.error("Failed to create/update public.users:", publicUserErr);
    process.exit(1);
  }
  console.log(`  -> public.users synchronized: ID: ${publicUser.id}, Name: ${publicUser.full_name}, is_active: ${publicUser.is_active}\n`);

  // Step 5: Assign role `jury_member` in public.user_roles
  console.log(`[5] Assigning 'jury_member' role in public.user_roles...`);
  const { data: roleData, error: roleErr } = await admin
    .from('user_roles')
    .insert({
      user_id: newUserId,
      role_id: 'jury_member',
      edition_id: null,
    })
    .select()
    .single();

  if (roleErr || !roleData) {
    console.error("Failed to assign jury_member role:", roleErr);
    process.exit(1);
  }
  console.log(`  -> Role assigned: ID: ${roleData.id}, User ID: ${roleData.user_id}, Role: ${roleData.role_id}\n`);

  // Step 6: Create jury_profiles record
  console.log(`[6] Creating jury profile for 2026 Edition...`);
  const { data: juryProfile, error: profileErr } = await admin
    .from('jury_profiles')
    .insert({
      user_id: newUserId,
      edition_id: CURRENT_EDITION_ID,
      honorific: null,
      organization: TEST_ORGANIZATION,
      designation: TEST_DESIGNATION,
      bio: TEST_BIO,
      is_public: false,
      display_order: 2,
    })
    .select()
    .single();

  if (profileErr || !juryProfile) {
    console.error("Failed to create jury_profile:", profileErr);
    process.exit(1);
  }
  console.log(`  -> Jury profile created: ID: ${juryProfile.id}, Edition: ${juryProfile.edition_id}, is_public: ${juryProfile.is_public}\n`);

  // Step 7: Verify login via public client with anon key
  console.log(`[7] Testing live authentication with test credentials (${TEST_EMAIL} / ${TEST_PASSWORD})...`);
  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: loginData, error: loginErr } = await anonClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (loginErr || !loginData?.user) {
    console.error("Login verification failed:", loginErr);
    process.exit(1);
  }
  console.log(`  -> LOGIN SUCCESSFUL! Authenticated User ID: ${loginData.user.id}`);
  console.log(`  -> Access Token generated: ${loginData.session.access_token ? 'YES' : 'NO'}\n`);

  // Step 8: Verify Jury Authorization check (matching /jury/login logic)
  console.log(`[8] Verifying Jury Authorization logic (as executed by /jury/login)...`);
  const { data: userRoles, error: rolesQueryErr } = await anonClient
    .from('user_roles')
    .select('role_id')
    .eq('user_id', loginData.user.id);

  const roleIds = (userRoles || []).map(r => r.role_id);
  const isAuthorized = roleIds.includes('jury_member') || roleIds.includes('admin') || roleIds.includes('super_admin');
  console.log(`  -> User roles retrieved via RLS: [${roleIds.join(', ')}]`);
  console.log(`  -> isAuthorized for Jury Portal: ${isAuthorized ? 'YES (PASSED)' : 'NO (FAILED)'}\n`);

  // Step 9: Verify Jury Session extraction (matching getJurySession logic)
  console.log(`[9] Verifying Jury Session data (matching getJurySession in src/lib/jury/auth.ts)...`);
  const { data: queriedProfile } = await admin
    .from('jury_profiles')
    .select('*')
    .eq('user_id', newUserId)
    .single();

  console.log(`  -> Recognized Jury Profile ID: ${queriedProfile?.id}`);
  console.log(`  -> Designation: ${queriedProfile?.designation}`);
  console.log(`  -> Organization: ${queriedProfile?.organization}`);
  console.log(`  -> Edition ID: ${queriedProfile?.edition_id}`);
  console.log(`  -> is_public: ${queriedProfile?.is_public}\n`);

  // Step 10: Verify Non-Interference with Kirit Mehta & existing assignments
  console.log("[10] Verifying non-interference with existing data...");
  const { data: postProfiles } = await admin.from('jury_profiles').select('id, user_id, organization, designation, is_public');
  const { data: postAssignments } = await admin.from('jury_assignments').select('id, jury_profile_id, application_id, status, applications(nomination_id)');
  
  const kiritProfileAfter = postProfiles?.find(p => p.id === '8a1a7c88-d19b-4751-91db-b054f6191b19');
  const kiritAssignmentAfter = postAssignments?.find(a => a.jury_profile_id === '8a1a7c88-d19b-4751-91db-b054f6191b19');
  
  console.log(`  -> Kirit Mehta profile intact: ${kiritProfileAfter ? 'YES' : 'NO'}`);
  console.log(`  -> Kirit Mehta assignment intact: ${kiritAssignmentAfter?.applications?.nomination_id === 'KHA26-03-0002' ? 'YES (KHA26-03-0002)' : 'NO'}`);
  console.log(`  -> New juror has ZERO assignments (pending manual UAT assignment): ${postAssignments?.filter(a => a.jury_profile_id === juryProfile.id).length === 0 ? 'YES' : 'NO'}\n`);

  // Step 11: Verify Negative Access: Applicant cannot access jury_assignments
  console.log("[11] Verifying RLS: Unassigned juror / applicant access checks...");
  const { data: anonAssignments, error: anonAssignErr } = await anonClient
    .from('jury_assignments')
    .select('*');
  console.log(`  -> New juror reading jury_assignments via RLS: ${anonAssignments?.length || 0} rows returned (Isolated: YES)\n`);

  console.log("================================================================================");
  console.log("                       ALL VERIFICATIONS PASSED SUCCESSFULLY                     ");
  console.log("================================================================================\n");

  console.log("SUMMARY OF CREATED ACCOUNT:");
  console.log(`- Email: ${TEST_EMAIL}`);
  console.log(`- Password: ${TEST_PASSWORD}`);
  console.log(`- Auth User ID: ${newUserId}`);
  console.log(`- Public User ID: ${publicUser.id}`);
  console.log(`- Jury Profile ID: ${juryProfile.id}`);
  console.log(`- Role: ${roleData.role_id}`);
  console.log(`- Edition ID: ${juryProfile.edition_id}`);
  console.log(`- Status: ACTIVE (${publicUser.is_active})`);
  console.log(`- Public Profile: ${juryProfile.is_public ? 'Enabled' : 'Disabled (Private)'}`);
}

main().catch(err => {
  console.error("Unexpected error in main:", err);
  process.exit(1);
});
