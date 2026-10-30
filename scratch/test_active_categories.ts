import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { getActiveCategories } from '../src/lib/categories/display-number';

const env: Record<string, string> = Object.fromEntries(
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

async function test() {
  const { data: categoriesData } = await adminClient
    .from("categories")
    .select("id, code, name, slug, short_description, eligibility_criteria, is_active")
    .eq("is_active", true)
    .order("display_order");

  const active = getActiveCategories(categoriesData);
  console.log("Total active returned:", active.length);
  active.forEach(c => {
    console.log(`Display #${c.displayNumber} | Code: ${c.code} | ID: ${c.id} | Name: ${c.name}`);
  });
}

test().catch(console.error);
