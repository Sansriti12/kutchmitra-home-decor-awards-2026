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

async function testCategorySync() {
  // Test if adminClient can read and upsert a category row safely
  console.log("Checking adminClient permissions on categories table...");
  const { data, error } = await adminClient
    .from('categories')
    .select('id, code, name')
    .eq('id', 'c2026000-0000-0000-0000-000000000018')
    .maybeSingle();

  console.log("Query result:", data, "Error:", error);
}

testCategorySync().catch(console.error);
