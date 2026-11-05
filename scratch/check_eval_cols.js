const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCols() {
  const { data: evals, error: evalErr } = await adminClient
    .from('jury_evaluations')
    .select('*')
    .limit(1);
  console.log('jury_evaluations sample keys:', evals && evals[0] ? Object.keys(evals[0]) : 'empty or err', evalErr);

  const { data: assigns, error: assignErr } = await adminClient
    .from('jury_assignments')
    .select('*')
    .limit(1);
  console.log('jury_assignments sample keys:', assigns && assigns[0] ? Object.keys(assigns[0]) : 'empty or err', assignErr);
}

checkCols();
