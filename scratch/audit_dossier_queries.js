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
const appId = '1894da7e-6e33-4e4e-884d-43cc8c5f870a';
const catId = 'c2026000-0000-0000-0000-000000000004';

async function t(label, p) {
  const r = await p;
  console.log(`${r.error ? '[FAIL]' : '[ OK ]'} ${label}${r.error ? '  -> ' + r.error.code + ' ' + r.error.message : '  rows=' + (Array.isArray(r.data) ? r.data.length : r.data ? 1 : 0)}`);
}

(async () => {
  console.log('--- JURY dossier queries (as currently coded) ---');
  await t('jury: category_questions', admin.from('category_questions').select('id, question_key, question_text, help_text, field_type, display_order').eq('category_id', catId).eq('is_active', true).order('display_order'));
  await t('jury: application_answers (with answer_date/answer_boolean)', admin.from('application_answers').select('question_id, answer_text, answer_json, answer_number, answer_date, answer_boolean, category_questions(question_key)').eq('application_id', appId));
  await t('jury: application_files (title,file_name,file_path)', admin.from('application_files').select('id, upload_type, title, description, file_path, file_name, file_size_bytes, mime_type').eq('application_id', appId));
  await t('jury: scoring_criteria', admin.from('scoring_criteria').select('id, code, title, description, weight_percentage, max_score, display_order, is_active').eq('is_active', true));
  await t('jury: jury_evaluations(+jury_scores)', admin.from('jury_evaluations').select('id, jury_assignment_id, status, is_locked, submitted_at, general_comment, strengths, areas_of_concern, recommendation, qualitative_assessment, jury_scores(id, criterion_id, score, qualitative_rating, confidential_comment)').limit(1));
  await t('jury: applications(+categories short_description)', admin.from('applications').select('id, nomination_id, project_name, project_city, project_state, project_completion_date, built_up_area_sqft, status, category_id, categories(id, code, name, slug, short_description)').eq('id', appId));

  console.log('\n--- CORRECTED shapes ---');
  await t('fix: application_answers (existing cols only)', admin.from('application_answers').select('question_id, answer_text, answer_number, answer_json').eq('application_id', appId));
  await t('fix: question_options', admin.from('question_options').select('id, question_id, label, value, display_order, is_active').order('display_order'));
  await t('fix: application_files (real cols)', admin.from('application_files').select('id, upload_type, caption, original_filename, storage_path, file_size_bytes, mime_type, display_order').eq('application_id', appId));
  await t('fix: category_questions + is_required', admin.from('category_questions').select('id, question_key, question_text, help_text, field_type, is_required, display_order').eq('category_id', catId).eq('is_active', true));

  console.log('\n--- storage bucket check ---');
  const files = await admin.from('application_files').select('storage_path').limit(3);
  for (const f of files.data || []) {
    for (const b of ['application-files', 'nomination-files']) {
      const s = await admin.storage.from(b).createSignedUrl(f.storage_path, 60);
      console.log(`  ${b}: ${s.error ? 'ERR ' + s.error.message : 'signed OK'}  (${f.storage_path.slice(0, 40)}...)`);
    }
  }
})();
