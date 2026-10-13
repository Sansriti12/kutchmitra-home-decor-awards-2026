const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach((line) => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let v = (m[2] || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
});
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const appId = '1894da7e-6e33-4e4e-884d-43cc8c5f870a';
  const { data: app } = await admin.from('applications').select('id, nomination_id, category_id, status').eq('id', appId).single();
  console.log('APP:', JSON.stringify(app));

  // Raw rows, no join
  const raw = await admin.from('application_answers').select('*').eq('application_id', appId);
  console.log('\nRAW application_answers error:', raw.error && raw.error.message, 'count:', (raw.data || []).length);
  (raw.data || []).forEach((r) => console.log(' ', JSON.stringify(r)));

  // The exact jury query shape
  const j = await admin.from('application_answers')
    .select('question_id, answer_text, answer_json, answer_number, answer_date, answer_boolean, category_questions(question_key)')
    .eq('application_id', appId);
  console.log('\nJURY-SHAPE query error:', j.error && JSON.stringify(j.error));
  console.log('rows:', (j.data || []).length);
  (j.data || []).slice(0, 3).forEach((r) => console.log(' ', JSON.stringify(r)));

  // Question definitions for this category
  const qs = await admin.from('category_questions').select('id, question_key, question_text, field_type, is_active, display_order').eq('category_id', app.category_id).order('display_order');
  console.log('\nQUESTIONS error:', qs.error && qs.error.message, 'count:', (qs.data || []).length);
  (qs.data || []).forEach((q) => console.log(' ', q.display_order, q.question_key, q.field_type, q.is_active, q.id));

  const ids = new Set((raw.data || []).map((r) => r.question_id));
  console.log('\nAnswer question_ids that match an active question of this category:');
  (qs.data || []).forEach((q) => console.log(' ', q.question_key, ids.has(q.id) ? 'HAS ANSWER' : 'no answer row'));
})();
