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

async function checkMigration12() {
  const { data: certs, error: certErr } = await adminClient.from('participant_certificates').select('id').limit(1);
  console.log("participant_certificates table exists:", !certErr, certErr ? certErr.message : "OK");

  const { data: appCol, error: colErr } = await adminClient.from('applications').select('applicant_district, coa_registration_number, declaration_signer_name').limit(1);
  console.log("Migration 12 application columns exist:", !colErr, colErr ? colErr.message : "OK");
}

checkMigration12().catch(console.error);
