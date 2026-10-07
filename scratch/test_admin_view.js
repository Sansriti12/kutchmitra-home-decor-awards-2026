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

async function checkAdminJuryOverview() {
  const { data: profiles, error: pErr } = await admin
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
    `)
    .order('display_order', { ascending: true });

  console.log('Admin overview profiles count:', profiles?.length);
  for (const p of (profiles || [])) {
    console.log(`- Juror: ${p.users?.full_name} | Email: ${p.users?.email} | Org: ${p.organization} | Desig: ${p.designation} | Active: ${p.users?.is_active}`);
  }
}

checkAdminJuryOverview();
