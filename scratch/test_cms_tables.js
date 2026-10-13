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
  const [d, f, a, s] = await Promise.all([
    supabase.from('cms_important_dates').select('*').order('display_order'),
    supabase.from('cms_faqs').select('*').order('display_order'),
    supabase.from('cms_announcements').select('*').order('display_order'),
    supabase.from('cms_site_settings').select('*')
  ]);

  console.log('cms_important_dates count:', d.data ? d.data.length : 'ERR: ' + d.error?.message);
  if (d.data) console.log('  sample date:', d.data[0]?.title, d.data[0]?.date_text);

  console.log('cms_faqs count:', f.data ? f.data.length : 'ERR: ' + f.error?.message);
  if (f.data) console.log('  sample faq:', f.data[0]?.question.slice(0, 40));

  console.log('cms_announcements count:', a.data ? a.data.length : 'ERR: ' + a.error?.message);
  if (a.data) console.log('  sample announcement:', a.data[0]?.title);

  console.log('cms_site_settings count:', s.data ? s.data.length : 'ERR: ' + s.error?.message);
  if (s.data) console.log('  settings helpline:', s.data[0]?.helpline_phone);

  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Storage Buckets:', buckets ? buckets.map(b => ({ id: b.id, public: b.public })) : bErr?.message);
}

check();
