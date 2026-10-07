const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load env safely from .env.local
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

async function audit() {
  console.log('--- 1. Fetching Categories 1, 2, 3, 4 ---');
  const { data: cats, error: catErr } = await admin
    .from('categories')
    .select('id, code, slug, name, display_order')
    .in('code', ['01', '02', '03', '04'])
    .order('code');

  if (catErr) {
    console.error('Category error:', catErr);
    return;
  }
  console.log('Categories:', cats);

  console.log('\n--- 2. Fetching Applications for Categories 1, 2, 3, 4 ---');
  const catIds = cats.map(c => c.id);
  const { data: apps, error: appErr } = await admin
    .from('applications')
    .select('id, nomination_id, category_id, applicant_id, status, project_name, created_at')
    .in('category_id', catIds)
    .order('nomination_id');

  if (appErr) {
    console.error('App error:', appErr);
    return;
  }

  console.log(`Found ${apps.length} applications across categories 1-4:`);
  apps.forEach(a => {
    const cat = cats.find(c => c.id === a.category_id);
    console.log({
      nomination_id: a.nomination_id,
      category_code: cat ? cat.code : 'unknown',
      category_slug: cat ? cat.slug : 'unknown',
      applicant_id_prefix: a.applicant_id ? a.applicant_id.substring(0, 8) + '...' : 'none',
      status: a.status,
      project_name: a.project_name,
      created_at: a.created_at
    });
  });

  console.log('\n--- 3. Total count of all applications across all categories ---');
  const { data: allApps, error: allErr } = await admin
    .from('applications')
    .select('nomination_id, category_id, status, created_at')
    .order('created_at', { ascending: false });

  if (allErr) {
    console.error('All apps error:', allErr);
  } else {
    console.log(`Total applications in database: ${allApps.length}`);
    const summary = {};
    allApps.forEach(a => {
      const code = a.nomination_id ? a.nomination_id.split('-')[1] : 'unknown';
      summary[code] = (summary[code] || 0) + 1;
    });
    console.log('Applications by category code in nomination_id:', summary);
  }
}

audit();
