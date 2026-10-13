const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const testTables = [
    'categories', 'editions', 'applications', 'application_status_history',
    'applicant_profiles', 'jury_profiles', 'jury_assignments', 'jury_evaluations',
    'application_shortlists', 'winners', 'audit_logs', 'notifications',
    'email_logs', 'faqs', 'important_dates', 'announcements', 'cms_content',
    'content_blocks', 'settings', 'site_settings'
  ];

  console.log('Testing table existence:');
  for (const t of testTables) {
    const { data, error: tErr } = await supabase.from(t).select('*').limit(1);
    if (!tErr) {
      console.log('  EXISTS:', t);
    } else {
      console.log('  DOES NOT EXIST:', t, '(' + tErr.message + ')');
    }
  }

  // Check storage buckets
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('\nStorage buckets:');
  if (bErr) console.log('  Error:', bErr.message);
  else console.log(' ', buckets.map(b => ({ id: b.id, name: b.name, public: b.public })));

  // Check audit_logs structure if it exists
  const { data: sampleAudit, error: aErr } = await supabase.from('audit_logs').select('*').limit(1);
  if (!aErr && sampleAudit && sampleAudit.length > 0) {
    console.log('\naudit_logs columns:', Object.keys(sampleAudit[0]));
  } else if (!aErr) {
    console.log('\naudit_logs exists but empty. Testing columns with empty insert rollback or table schema query:');
  }

  // Check jury_profiles structure
  const { data: sampleJury, error: jErr } = await supabase.from('jury_profiles').select('*').limit(1);
  if (!jErr && sampleJury && sampleJury.length > 0) {
    console.log('\njury_profiles columns:', Object.keys(sampleJury[0]));
  }
}

check();
