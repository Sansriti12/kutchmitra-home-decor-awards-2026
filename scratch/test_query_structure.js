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

async function testQueryStructure() {
  const { data: apps } = await admin.from('applications').select('id, edition_id').limit(1);
  const { data: jurors } = await admin.from('jury_profiles').select('id, edition_id').limit(1);
  if (!apps?.length || !jurors?.length) return console.log('No apps or jurors');

  console.log('App:', apps[0].id, 'Juror:', jurors[0].id);

  // Insert a test assignment if not exists
  const { data: assign, error: aErr } = await admin.from('jury_assignments').upsert({
    application_id: apps[0].id,
    jury_profile_id: jurors[0].id,
    edition_id: apps[0].edition_id,
    assigned_by: 'e77a5c50-ea54-45b7-806c-1352388232c4',
    status: 'assigned',
    conflict_declared: false
  }, { onConflict: 'jury_profile_id, application_id' }).select().single();

  if (aErr) console.log('Assign insert error:', aErr);

  const { data: res, error: qErr } = await admin
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

  if (qErr) {
    console.error('Query error:', qErr);
  } else {
    console.log('Query output:');
    console.log(JSON.stringify(res, null, 2));

    const item = res[0];
    const app = Array.isArray(item.applications) ? item.applications[0] : item.applications;
    const cat = app ? (Array.isArray(app.categories) ? app.categories[0] : app.categories) : null;
    const jp = Array.isArray(item.jury_profiles) ? item.jury_profiles[0] : item.jury_profiles;
    const u = jp ? (Array.isArray(jp.users) ? jp.users[0] : jp.users) : null;

    console.log('\nParsed data check:');
    console.log('Nomination ID:', app?.nomination_id);
    console.log('Category Name:', cat?.name);
    console.log('Juror Name:', u?.full_name);
  }

  // Clean up test assignment
  if (assign) {
    await admin.from('jury_assignments').delete().eq('id', assign.id);
  }
}

testQueryStructure();
