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

async function testFK() {
  // Let's test what happens if an insert is attempted with c2026000-0000-0000-0000-000000000018
  // We can test by doing a dry-run or checking constraints
  console.log("Checking categories in DB...");
  const { data: cat18 } = await adminClient.from('categories').select('*').eq('id', 'c2026000-0000-0000-0000-000000000018');
  console.log("cat18 in DB:", cat18);

  const { data: cat14 } = await adminClient.from('categories').select('*').eq('id', 'c2026000-0000-0000-0000-000000000014');
  console.log("cat14 in DB:", cat14);
}

testFK().catch(console.error);
