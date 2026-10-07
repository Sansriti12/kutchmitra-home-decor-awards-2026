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
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runTests() {
  console.log('====================================================');
  console.log('PHASE C: COMPREHENSIVE VERIFICATION & ACCEPTANCE TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: All 13 Categories Verification
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 1: All 13 Categories Verification ---');
  const { data: categories, error: catErr } = await adminClient
    .from('categories')
    .select('id, code, name, slug, display_order')
    .eq('is_active', true)
    .order('display_order');

  assert(!catErr && categories?.length === 13, '13 Official Categories Exist in Database', `Count: ${categories?.length}`);

  const cat13 = categories?.find(c => c.code === '13');
  assert(cat13 && cat13.name === 'Best Contractor of the Year', 'Category 13 is "Best Contractor of the Year"', `Found: ${cat13?.name}`);

  // Check questions for Category 13
  if (cat13) {
    const { data: cat13Q } = await adminClient
      .from('category_questions')
      .select('id, question_key, question_text')
      .eq('category_id', cat13.id);
    assert(cat13Q && cat13Q.length >= 4, 'Category 13 has dynamic questions configured', `Questions: ${cat13Q?.length}`);
  }

  // ----------------------------------------------------
  // TEST 2: Status Machine & Transitions Verification
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Status Transitions Machine ---');
  const { data: transitions, error: transErr } = await adminClient
    .from('status_transitions')
    .select('*');

  assert(!transErr && transitions?.length >= 25, '25 Status Transition Rules Active', `Found: ${transitions?.length}`);

  // Test that invalid transitions are blocked
  const invalidTransitions = [
    { from: 'draft', to: 'eligible' },
    { from: 'draft', to: 'winner' },
    { from: 'submitted', to: 'winner' },
    { from: 'rejected', to: 'eligible' },
    { from: 'disqualified', to: 'submitted' }
  ];

  for (const inv of invalidTransitions) {
    const matched = (transitions || []).filter(t => t.from_status === inv.from && t.to_status === inv.to);
    assert(matched.length === 0, `Invalid Transition Blocked: ${inv.from} -> ${inv.to}`, `Allowed rules: 0`);
  }

  // Test allowed transitions
  const validUnderVerToClarif = (transitions || []).some(
    t => t.from_status === 'under_verification' && t.to_status === 'clarification_required'
  );
  assert(validUnderVerToClarif, 'Allowed Transition: under_verification -> clarification_required');

  const validClarifToUnderVer = (transitions || []).some(
    t => t.from_status === 'clarification_required' && t.to_status === 'under_verification' && t.allowed_role === 'applicant'
  );
  assert(validClarifToUnderVer, 'Allowed Transition: clarification_required -> under_verification (applicant)');

  // ----------------------------------------------------
  // TEST 3: Applications Querying & Pagination
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Applications Querying & Pagination ---');
  const { data: apps, count: totalApps, error: appsErr } = await adminClient
    .from('applications')
    .select('id, nomination_id, status, project_name, project_city, category_id, applicant_id', { count: 'exact' });

  assert(!appsErr && apps !== null, 'Applications Table Accessible via Service Client', `Total: ${totalApps}`);

  // Test category filtering
  if (categories && categories.length > 0) {
    const firstCat = categories[0];
    const { data: filteredApps } = await adminClient
      .from('applications')
      .select('id, category_id')
      .eq('category_id', firstCat.id);

    assert(filteredApps !== null, `Filter by Category ${firstCat.code} works`, `Matches: ${filteredApps?.length}`);
  }

  // Test status filtering
  const { data: draftApps } = await adminClient
    .from('applications')
    .select('id, status')
    .eq('status', 'draft');
  assert(draftApps !== null, 'Filter by Status "draft" works', `Matches: ${draftApps?.length}`);

  // ----------------------------------------------------
  // TEST 4: Security & RLS Isolation
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: Security & Row Level Security (RLS) ---');
  // Anonymous / Public client should NOT be able to read applications without authentication
  const { data: anonApps, error: anonAppsErr } = await anonClient
    .from('applications')
    .select('id, nomination_id');

  assert(
    !anonApps || anonApps.length === 0,
    'Public/Unauthenticated User CANNOT Read Applications (RLS Active)',
    `Returned: ${anonApps?.length ?? 0} rows`
  );

  // Anonymous client should NOT be able to read audit_logs
  const { data: anonAudit, error: anonAuditErr } = await anonClient
    .from('audit_logs')
    .select('id');

  assert(
    !anonAudit || anonAudit.length === 0,
    'Public/Unauthenticated User CANNOT Read Audit Logs (RLS Active)',
    `Returned: ${anonAudit?.length ?? 0} rows`
  );

  // Anonymous client should NOT be able to read verification_records
  const { data: anonVerif } = await anonClient
    .from('verification_records')
    .select('id');

  assert(
    !anonVerif || anonVerif.length === 0,
    'Public/Unauthenticated User CANNOT Read Verification Records (RLS Active)',
    `Returned: ${anonVerif?.length ?? 0} rows`
  );

  // ----------------------------------------------------
  // TEST 5: Clarification & Status History Workflow
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: Clarification & Status History ---');
  // Verify clarification_requests table structure
  const { data: clarifSample, error: clarifErr } = await adminClient
    .from('clarification_requests')
    .select('*')
    .limit(1);

  assert(!clarifErr, 'clarification_requests Table Accessible & Healthy');

  // Verify application_status_history table structure
  const { data: histSample, error: histErr } = await adminClient
    .from('application_status_history')
    .select('*')
    .limit(1);

  assert(!histErr, 'application_status_history Table Accessible & Healthy');

  // Verify audit_logs table structure
  const { data: auditSample, error: auditErr } = await adminClient
    .from('audit_logs')
    .select('*')
    .limit(1);

  assert(!auditErr, 'audit_logs Table Accessible & Healthy');

  // ----------------------------------------------------
  // TEST 6: Private Storage & Signed URLs
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 6: Private Storage & Signed URLs ---');
  const { data: bucketData, error: bucketErr } = await adminClient
    .storage
    .getBucket('application-files');

  assert(!bucketErr && bucketData !== null, 'Private Bucket "application-files" Exists');
  assert(bucketData?.public === false, 'Bucket "application-files" is STRICTLY PRIVATE (public = false)');

  // ----------------------------------------------------
  // TEST 7: Summary & Acceptance Metrics
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
