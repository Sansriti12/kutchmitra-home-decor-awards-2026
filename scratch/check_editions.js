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

async function checkEditions() {
  const { data: aed } = await adminClient.from('award_editions').select('*');
  console.log("award_editions in DB:", aed);

  const { data: roles } = await adminClient.from('roles').select('*');
  console.log("roles in DB:", roles);
}

checkEditions().catch(console.error);
