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
const CAT3_ID = 'c2026000-0000-0000-0000-000000000003';
const CURRENT_EDITION_ID = 'e2026000-0000-0000-0000-000000002026';

async function applyMigration() {
  console.log('================================================================');
  console.log('APPLYING MIGRATION 08: REMOVE CATEGORY 3 — BEST APARTMENT DESIGN');
  console.log('================================================================\n');

  const now = new Date().toISOString();

  // 1. Deactivate Category 03
  console.log('Step 1: Deactivating Category 03 in categories table...');
  const { data: updatedCat, error: catErr } = await adminClient
    .from('categories')
    .update({
      is_active: false,
      updated_at: now,
    })
    .eq('id', CAT3_ID)
    .eq('edition_id', CURRENT_EDITION_ID)
    .select();

  if (catErr) {
    console.error('Error deactivating Category 03:', catErr);
    process.exit(1);
  }
  console.log('Successfully updated category:', updatedCat);

  // 2. Deactivate Category 03 Questions
  console.log('\nStep 2: Deactivating Category 03 questions in category_questions table...');
  const { data: updatedQ, error: qErr } = await adminClient
    .from('category_questions')
    .update({
      is_active: false,
      updated_at: now,
    })
    .eq('category_id', CAT3_ID)
    .select();

  if (qErr) {
    console.error('Error deactivating Category 03 questions:', qErr);
  } else {
    console.log(`Deactivated ${updatedQ?.length || 0} questions.`);
  }

  // 3. Deactivate Category 03 Upload Requirements
  console.log('\nStep 3: Deactivating Category 03 upload requirements...');
  const { data: updatedReqs, error: reqErr } = await adminClient
    .from('category_upload_requirements')
    .update({
      is_active: false,
      updated_at: now,
    })
    .eq('category_id', CAT3_ID)
    .select();

  if (reqErr) {
    console.error('Error deactivating Category 03 upload requirements:', reqErr);
  } else {
    console.log(`Deactivated ${updatedReqs?.length || 0} upload requirements.`);
  }

  // 4. Deactivate Scoring Criteria for Category 03
  console.log('\nStep 4: Deactivating Category 03 scoring criteria...');
  const { data: updatedSc, error: scErr } = await adminClient
    .from('scoring_criteria')
    .update({
      is_active: false,
      updated_at: now,
    })
    .eq('category_id', CAT3_ID)
    .select();

  if (scErr) {
    console.error('Error deactivating Category 03 scoring criteria:', scErr);
  } else {
    console.log(`Deactivated ${updatedSc?.length || 0} scoring criteria.`);
  }

  // 5. Insert Audit Log
  console.log('\nStep 5: Writing audit log entry...');
  const { error: auditErr } = await adminClient
    .from('audit_logs')
    .insert({
      actor_id: null,
      action: 'category_deactivated',
      entity_type: 'category',
      entity_id: CAT3_ID,
      old_values: { code: '03', name: 'Best Apartment Design', is_active: true },
      new_values: { code: '03', name: 'Best Apartment Design', is_active: false, reason: 'Committee retirement of Category 03 for 2026 edition' },
      created_at: now,
    });

  if (auditErr) {
    console.warn('Audit log write warning:', auditErr.message);
  } else {
    console.log('Audit log successfully written.');
  }

  // 6. Verification
  console.log('\n================================================================');
  console.log('VERIFICATION OF ACTIVE CATEGORIES AFTER MIGRATION');
  console.log('================================================================');

  const { data: activeCats, error: verifyErr } = await adminClient
    .from('categories')
    .select('id, code, slug, name, is_active, display_order')
    .eq('is_active', true)
    .order('display_order');

  if (verifyErr) {
    console.error('Error verifying active categories:', verifyErr);
    process.exit(1);
  }

  console.log(`\nActive categories count: ${activeCats.length} (Expected: 12)`);
  activeCats.forEach((c) => {
    console.log(`Order: ${c.display_order} | Code: ${c.code} | Name: ${c.name} | Active: ${c.is_active} | ID: ${c.id}`);
  });

  const cat3InActive = activeCats.find((c) => c.id === CAT3_ID || c.code === '03');
  if (cat3InActive) {
    console.error('\nFAILED: Category 03 is still present in active categories!');
    process.exit(1);
  } else {
    console.log('\nSUCCESS: Category 03 is completely absent from active categories!');
  }

  const cat13Active = activeCats.find((c) => c.code === '13');
  if (!cat13Active) {
    console.error('FAILED: Category 13 is missing from active categories!');
    process.exit(1);
  } else {
    console.log('SUCCESS: Category 13 (Best Contractor of the Year) is active and intact!');
  }

  console.log('\nMigration 08 applied and verified successfully.');
}

applyMigration();
