const fs = require('fs');
const envContent = fs.readFileSync('c:/projects/Kutchmitra-Home-Decor-Awards-2026/.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(l => {
  const t = l.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) {
      let val = t.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[t.slice(0, idx).trim()] = val;
    }
  }
});
const { createClient } = require('@supabase/supabase-js');
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testLock() {
  const { data: user } = await admin.auth.admin.createUser({ email: 'lock_test_' + Date.now() + '@example.com', password: 'Password123!', email_confirm: true });
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await client.auth.signInWithPassword({ email: user.user.email, password: 'Password123!' });

  const { data: cat } = await admin.from('categories').select('id, edition_id').limit(1).single();
  const { data: app, error: inErr } = await client.from('applications').insert({
    nomination_id: 'KHA26-TEST-' + Date.now(),
    edition_id: cat.edition_id,
    category_id: cat.id,
    applicant_id: user.user.id,
    project_name: 'Test Project',
    project_city: 'Bhuj',
    project_state: 'Gujarat',
    status: 'draft',
    is_locked: false
  }).select().single();

  console.log('Inserted:', app ? app.id : null, inErr ? inErr.message : '');

  // Try updating is_locked using client
  const { error: clientUpErr } = await client.from('applications').update({ status: 'submitted', is_locked: true }).eq('id', app.id);
  console.log('Client update error:', clientUpErr ? clientUpErr.message : 'SUCCESS');

  // Try updating using admin
  const { error: adminUpErr } = await admin.from('applications').update({ status: 'submitted', is_locked: true }).eq('id', app.id);
  console.log('Admin update error:', adminUpErr ? adminUpErr.message : 'SUCCESS');

  await admin.from('applications').delete().eq('id', app.id);
  await admin.auth.admin.deleteUser(user.user.id);
}
testLock();
