const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectJuryDatabase() {
  console.log('=== 1. JURY_PROFILES TABLE ===');
  const { data: profiles, error: profErr } = await adminClient
    .from('jury_profiles')
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
    `);

  if (profErr) {
    console.error('Prof Err:', profErr);
  } else {
    console.log(`Found ${profiles.length} jury_profiles:`);
    profiles.forEach((p, idx) => {
      console.log(`\n[Profile ${idx + 1}]`);
      console.log(`  ID: ${p.id}`);
      console.log(`  User ID: ${p.user_id}`);
      console.log(`  Name: ${p.honorific ? p.honorific + ' ' : ''}${p.users?.full_name || 'No User'}`);
      console.log(`  Email: ${p.users?.email || 'N/A'}`);
      console.log(`  Org: ${p.organization}`);
      console.log(`  Designation: ${p.designation}`);
      console.log(`  Photo URL: ${p.photo_url}`);
      console.log(`  Is Public: ${p.is_public}`);
    });
  }

  console.log('\n=== 2. USERS WITH JURY ROLES (user_roles) ===');
  const { data: userRoles, error: urErr } = await adminClient
    .from('user_roles')
    .select(`
      user_id,
      role_id,
      users (
        id,
        email,
        full_name,
        is_active
      )
    `)
    .eq('role_id', 'jury_member');

  if (urErr) {
    console.error('UR Err:', urErr);
  } else {
    console.log(`Found ${userRoles.length} users with role 'jury_member':`);
    userRoles.forEach((ur, idx) => {
      console.log(`  [${idx + 1}] User: ${ur.users?.full_name} (${ur.users?.email}) ID: ${ur.user_id}`);
    });
  }

  console.log('\n=== 3. JURY_ASSIGNMENTS COUNT ===');
  const { count: assignCount, error: countErr } = await adminClient
    .from('jury_assignments')
    .select('*', { count: 'exact', head: true });
  console.log(`Total jury assignments in DB: ${assignCount}`);

  console.log('\n=== 4. JURY_EVALUATIONS COUNT ===');
  const { count: evalCount, error: evalErr } = await adminClient
    .from('jury_evaluations')
    .select('*', { count: 'exact', head: true });
  console.log(`Total jury evaluations in DB: ${evalCount}`);

  console.log('\n=== 5. CHECK SPECIFIC JURY CANDIDATE EMAILS OR USERS ===');
  const { data: allUsers } = await adminClient
    .from('users')
    .select('id, email, full_name, is_active')
    .or('full_name.ilike.%Hasmukh%,full_name.ilike.%Parul%,full_name.ilike.%Hiren%,full_name.ilike.%Sarosh%');
  console.log('Appointed members in users table:', allUsers);
}

inspectJuryDatabase();
