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

async function checkRecentApp() {
  const { data: app } = await adminClient
    .from('applications')
    .select('*')
    .eq('id', '469c4441-e3d1-455f-aa3a-bd6ff445c2a1')
    .single();

  console.log("App 469c4441-e3d1-455f-aa3a-bd6ff445c2a1:", app);
}

checkRecentApp().catch(console.error);
