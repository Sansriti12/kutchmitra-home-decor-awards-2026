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

const RETIRED_UUIDS = new Set([
  "c2026000-0000-0000-0000-000000000003",
  "c2026000-0000-0000-0000-000000000006",
  "c2026000-0000-0000-0000-000000000013",
]);

async function simulateQuotas() {
  const { data: apps } = await adminClient
    .from("applications")
    .select("id, applicant_id, category_id, status, project_name")
    .not("status", "in", '("disqualified","rejected")');

  const byUser = {};
  for (const a of apps) {
    byUser[a.applicant_id] = byUser[a.applicant_id] || [];
    byUser[a.applicant_id].push(a);
  }

  for (const [userId, userApps] of Object.entries(byUser)) {
    // Current buggy calculation (includes retired categories)
    const oldEntered = Array.from(new Set(userApps.map(a => a.category_id).filter(Boolean)));
    
    // Corrected calculation (strictly excludes retired categories)
    const newEntered = Array.from(new Set(userApps.map(a => a.category_id).filter(id => Boolean(id) && !RETIRED_UUIDS.has(id))));

    console.log(`\nUser: ${userId}`);
    console.log(`  Apps in DB: ${userApps.length}`);
    userApps.forEach(a => console.log(`    - Nom: ${a.project_name} | Cat: ${a.category_id} | Retired: ${RETIRED_UUIDS.has(a.category_id)}`));
    console.log(`  BEFORE fix -> distinctCount: ${oldEntered.length} of 3 (${oldEntered.join(', ')})`);
    console.log(`  AFTER fix  -> distinctCount: ${newEntered.length} of 3 (${newEntered.join(', ')})`);
  }
}

simulateQuotas().catch(console.error);
