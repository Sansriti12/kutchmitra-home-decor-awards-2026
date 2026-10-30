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

async function inspectSchema() {
  const { data: catSample } = await adminClient.from('categories').select('*').limit(1);
  console.log("categories sample row:", catSample);

  const { data: appSample } = await adminClient.from('applications').select('*').limit(1);
  console.log("applications sample row keys:", appSample ? Object.keys(appSample[0]) : null);
}

inspectSchema().catch(console.error);
