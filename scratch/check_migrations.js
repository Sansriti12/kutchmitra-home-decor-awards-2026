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

async function checkMigrations() {
  const { data, error } = await adminClient.from('_prisma_migrations').select('*');
  console.log("prisma migrations:", error ? error.message : data);

  const { data: d2, error: e2 } = await adminClient.from('schema_migrations').select('*');
  console.log("schema_migrations:", e2 ? e2.message : d2);
  
  const { data: d3, error: e3 } = await adminClient.from('editions').select('*');
  console.log("editions:", e3 ? e3.message : d3);
}

checkMigrations().catch(console.error);
