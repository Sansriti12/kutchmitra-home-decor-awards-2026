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

async function checkSchemaTables() {
  const { data: u1, error: e1 } = await adminClient.from('users').select('id').limit(1);
  console.log("public.users exists:", !e1, e1 ? e1.message : "OK");

  const { data: ur, error: er } = await adminClient.from('user_roles').select('*').limit(1);
  console.log("public.user_roles exists:", !er, er ? er.message : "OK");

  const { data: r, error: errR } = await adminClient.from('roles').select('*').limit(1);
  console.log("public.roles exists:", !errR, errR ? errR.message : "OK");

  const { data: ed, error: edErr } = await adminClient.from('editions').select('*').limit(1);
  console.log("public.editions exists:", !edErr, edErr ? edErr.message : "OK");
  
  const { data: aed, error: aedErr } = await adminClient.from('award_editions').select('*').limit(1);
  console.log("public.award_editions exists:", !aedErr, aedErr ? aedErr.message : "OK");
}

checkSchemaTables().catch(console.error);
