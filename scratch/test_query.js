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

async function testFullQuery() {
  console.log('--- Testing query with applications(...) and jury_profiles(...) ---');
  const res = await admin
    .from('jury_assignments')
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
    .limit(1);

  if (res.error) {
    console.error('Query Error:', res.error);
  } else {
    console.log('Query SUCCESS! Sample data:', JSON.stringify(res.data, null, 2));
  }
}

testFullQuery();
