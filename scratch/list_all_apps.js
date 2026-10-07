const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('c:/projects/Kutchmitra-Home-Decor-Awards-2026/.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(l => {
  const idx = l.indexOf('=');
  if (idx > 0) {
    let val = l.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[l.substring(0, idx).trim()] = val;
  }
});

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listAll() {
  const { data: apps, error } = await admin
    .from('applications')
    .select('id, nomination_id, applicant_id, status, project_name, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log('All applications in database:');
  apps.forEach(a => {
    console.log({
      nomination_id: a.nomination_id,
      applicant_prefix: a.applicant_id.substring(0, 8),
      project_name: a.project_name,
      status: a.status,
      created_at: a.created_at
    });
  });
}

listAll();
