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

async function inspect() {
  console.log("=== INSPECTING DATABASE CATEGORIES ===");
  const { data: categories, error: catErr } = await adminClient
    .from('categories')
    .select('id, code, name, slug, display_order, is_active, edition_id')
    .order('code');

  if (catErr) {
    console.error("Error querying categories:", catErr);
    return;
  }

  console.log(`Total categories found in DB: ${categories.length}`);
  categories.forEach(c => {
    console.log(`Code: ${c.code} | ID: ${c.id} | Active: ${c.is_active} | Slug: ${c.slug} | Name: ${c.name}`);
  });

  console.log("\n=== CHECKING CODES 18 & 19 IN DB ===");
  const cat18 = categories.find(c => c.code === '18');
  const cat19 = categories.find(c => c.code === '19');
  console.log("Category 18 in DB:", cat18 || "NOT FOUND");
  console.log("Category 19 in DB:", cat19 || "NOT FOUND");

  console.log("\n=== INSPECTING RECENT APPLICATIONS ===");
  const { data: apps, error: appErr } = await adminClient
    .from('applications')
    .select('id, nomination_id, applicant_id, category_id, status, project_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (appErr) {
    console.error("Error querying applications:", appErr);
    return;
  }

  console.log(`Recent applications (last 10):`);
  apps.forEach(a => {
    console.log(`ID: ${a.id} | NomID: ${a.nomination_id} | Applicant: ${a.applicant_id} | CatID: ${a.category_id} | Status: ${a.status} | Project: ${a.project_name} | Created: ${a.created_at}`);
  });
}

inspect().catch(console.error);
