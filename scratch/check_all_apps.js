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

async function checkAllApps() {
  const { data: apps, error } = await adminClient
    .from('applications')
    .select('id, nomination_id, applicant_id, category_id, status, project_name, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total applications in DB: ${apps.length}`);
  apps.forEach((a, idx) => {
    console.log(`[${idx+1}] ID: ${a.id} | Nom: ${a.nomination_id} | User: ${a.applicant_id} | Cat: ${a.category_id} | Status: ${a.status} | Name: ${a.project_name} | Created: ${a.created_at}`);
  });

  // Group by applicant_id
  const byUser = {};
  for (const a of apps) {
    byUser[a.applicant_id] = byUser[a.applicant_id] || [];
    byUser[a.applicant_id].push(a);
  }

  console.log("\nBreakdown by user:");
  for (const [userId, userApps] of Object.entries(byUser)) {
    const cats = new Set(userApps.filter(a => !['disqualified', 'rejected'].includes(a.status)).map(a => a.category_id));
    console.log(`User ${userId}: ${userApps.length} total apps, ${cats.size} distinct active categories:`, Array.from(cats));
  }
}

checkAllApps().catch(console.error);
