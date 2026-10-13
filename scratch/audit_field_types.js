const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach((line) => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) { let v = (m[2] || '').trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); env[m[1]] = v; }
});
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const q = await admin.from('category_questions').select('field_type, category_id, is_active');
  const types = {};
  (q.data || []).forEach((r) => { types[r.field_type] = (types[r.field_type] || 0) + 1; });
  console.log('field_type counts:', JSON.stringify(types), 'total', (q.data || []).length);

  const f = await admin.from('application_files').select('*').limit(1);
  console.log('application_files columns:', f.error ? f.error.message : Object.keys((f.data || [])[0] || {}));
  const fc = await admin.from('application_files').select('id', { count: 'exact', head: true });
  console.log('application_files rows:', fc.count);

  const b = await admin.storage.listBuckets();
  console.log('buckets:', (b.data || []).map((x) => `${x.name}(public=${x.public})`).join(', '));

  const oc = await admin.from('question_options').select('*').limit(1);
  console.log('question_options columns:', oc.error ? oc.error.message : Object.keys((oc.data || [])[0] || {}));

  // each application's answer counts (history)
  const apps = await admin.from('applications').select('id, nomination_id, status, category_id');
  console.log('applications:', (apps.data || []).map((a) => `${a.nomination_id}:${a.status}`).join(' | '));
  const ar = await admin.from('application_answers').select('application_id');
  const cnt = {};
  (ar.data || []).forEach((r) => { cnt[r.application_id] = (cnt[r.application_id] || 0) + 1; });
  (apps.data || []).forEach((a) => console.log(' ', a.nomination_id, 'answers=', cnt[a.id] || 0));
})();
