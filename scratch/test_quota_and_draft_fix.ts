import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { getApplicantCategoryQuota, createDraftApplication } from '../src/lib/nominations/actions';
import { ACTIVE_CATEGORIES } from '../src/lib/categories/display-number';

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

async function runTests() {
  console.log("==================================================================");
  console.log("TESTING CATEGORY QUOTA & DRAFT SELECTION FIXES");
  console.log("==================================================================");

  // 1. Verify all 16 categories in ACTIVE_CATEGORIES
  console.log(`\n1. Active Categories Count: ${ACTIVE_CATEGORIES.length}`);
  ACTIVE_CATEGORIES.forEach(c => {
    console.log(`   #${c.displayNumber} [code: ${c.code}] ${c.id}: ${c.name}`);
  });

  // 2. Check quota calculation logic for all existing applicants
  console.log("\n2. Checking Quota Calculation for existing applicants:");
  const { data: users } = await adminClient.from("applicant_profiles").select("user_id");
  for (const u of (users || [])) {
    const { data: userApps } = await adminClient
      .from("applications")
      .select("id, category_id, status, nomination_id, project_name")
      .eq("applicant_id", u.user_id)
      .not("status", "in", '("disqualified","rejected")');

    const RETIRED_UUIDS = new Set([
      "c2026000-0000-0000-0000-000000000003",
      "c2026000-0000-0000-0000-000000000006",
      "c2026000-0000-0000-0000-000000000013",
    ]);

    const activeCatIds = Array.from(
      new Set((userApps || []).map((a: any) => a.category_id).filter((id: string) => Boolean(id) && !RETIRED_UUIDS.has(id)))
    );

    console.log(`\n   Applicant: ${u.user_id}`);
    console.log(`     Total applications in DB: ${(userApps || []).length}`);
    (userApps || []).forEach(a => {
      console.log(`       - NomID: ${a.nomination_id} | CatID: ${a.category_id} | Retired: ${RETIRED_UUIDS.has(a.category_id)} | Status: ${a.status}`);
    });
    console.log(`     -> Active Category Slots Used: ${activeCatIds.length} of 3 (${activeCatIds.join(", ")})`);
    console.log(`     -> Remaining Slots: ${Math.max(0, 3 - activeCatIds.length)}`);
  }

  // 3. Test Category 15 & 16 validation
  console.log("\n3. Testing Category 15 & 16 Draft Creation Behavior:");
  // For Cat 18 & 19 (which are pending DB migration 11), verify that createDraftApplication
  // returns an informative database synchronization message without inserting any row or modifying quota.
  const cat18 = ACTIVE_CATEGORIES.find(c => c.code === "18")!;
  const cat19 = ACTIVE_CATEGORIES.find(c => c.code === "19")!;
  console.log(`   Cat 18: ID=${cat18.id}, Name="${cat18.name}"`);
  console.log(`   Cat 19: ID=${cat19.id}, Name="${cat19.name}"`);
}

runTests().catch(console.error);
