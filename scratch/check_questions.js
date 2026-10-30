const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkQuestions() {
  const ids = [
    'c2026000-0000-0000-0000-000000000014',
    'c2026000-0000-0000-0000-000000000015',
    'c2026000-0000-0000-0000-000000000016',
    'c2026000-0000-0000-0000-000000000017',
    'c2026000-0000-0000-0000-000000000018',
    'c2026000-0000-0000-0000-000000000019',
  ];

  const { data: q } = await adminClient.from('category_questions').select('category_id').in('category_id', ids);
  console.log("Questions found for 14-19:", q ? q.length : 0);

  const { data: u } = await adminClient.from('category_upload_requirements').select('category_id').in('category_id', ids);
  console.log("Upload reqs found for 14-19:", u ? u.length : 0);
}

checkQuestions().catch(console.error);
