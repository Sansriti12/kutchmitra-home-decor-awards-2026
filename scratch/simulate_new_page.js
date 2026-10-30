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

// We'll import getActiveCategories from compiled or tsx
async function test() {
  const { data: categoriesData } = await adminClient
    .from("categories")
    .select("id, code, name, slug, short_description, eligibility_criteria, is_active")
    .eq("is_active", true)
    .order("display_order");

  console.log("DB returned count:", categoriesData.length);
  categoriesData.forEach(c => console.log(`DB Row: code=${c.code}, id=${c.id}, name=${c.name}`));
}

test().catch(console.error);
