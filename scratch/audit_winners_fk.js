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

async function tryQuery(label, select) {
  const { data, error } = await admin.from('winners').select(select).limit(3);
  console.log(`\n[${label}] select: ${select.replace(/\s+/g, ' ')}`);
  if (error) console.log('  ERROR:', error.code, error.message, error.hint || '');
  else console.log('  OK rows:', data.length, JSON.stringify(data[0] || null));
}

(async () => {
  // Columns on winners
  const { data: one, error: e0 } = await admin.from('winners').select('*').limit(1);
  console.log('winners columns:', e0 ? e0.message : Object.keys(one[0] || {}));
  const { count } = await admin.from('winners').select('id', { count: 'exact', head: true });
  console.log('winners row count:', count);

  await tryQuery('hint winners_category_id_fkey (BROKEN)', 'id, categories!winners_category_id_fkey(code,name,slug)');
  await tryQuery('implicit categories(...)', 'id, categories(code,name,slug)');
  await tryQuery('explicit column categories:category_id(...)', 'id, categories:category_id(code,name,slug)');
  await tryQuery('applications -> categories', 'id, application_id, applications(id, category_id, categories(code,name,slug))');

  // Try to discover the real FK constraint names via PostgREST error hints
  const { error } = await admin.from('winners').select('id, categories!no_such_fk(code)').limit(1);
  console.log('\nHint discovery error:', error && JSON.stringify(error));
})();
