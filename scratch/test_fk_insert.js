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

async function testFKInsert() {
  const { data, error } = await adminClient
    .from('applications')
    .insert({
      nomination_id: 'TEST-TEMP-9999',
      edition_id: 'e2026000-0000-0000-0000-000000002026',
      category_id: 'c2026000-0000-0000-0000-000000000018',
      applicant_id: '1f738ba8-1081-46f2-804f-a151a42bfe4e',
      project_name: 'Test Entry',
      project_city: 'Bhuj',
      project_state: 'Gujarat',
      status: 'draft',
      current_wizard_step: 1
    })
    .select();

  console.log("Insert result error:", error);
  if (data) {
    console.log("Data inserted! Cleaning up test row...");
    await adminClient.from('applications').delete().eq('nomination_id', 'TEST-TEMP-9999');
  }
}

testFKInsert().catch(console.error);
