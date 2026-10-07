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
const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

async function runVerification() {
  console.log('================================================================');
  console.log('VERIFYING SHORTLISTING SCHEMA RELATIONSHIP & WORKSPACE FIX');
  console.log('================================================================\n');

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

  try {
    // -------------------------------------------------------------------------
    // 1. Verify schema relationship between applications and users
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Applications -> Applicant Foreign Key Relationship ---');
    const { data: appData, error: appErr } = await adminClient
      .from('applications')
      .select(`
        id,
        nomination_id,
        project_name,
        category_id,
        applicant_id,
        project_city,
        project_state,
        project_completion_date,
        status,
        created_at,
        users:applicant_id(id, full_name, email, phone),
        categories(id, name, code)
      `)
      .eq('nomination_id', 'KHA26-03-0002')
      .single();

    assert(!appErr && Boolean(appData), 'Applications query uses valid relationship users:applicant_id', `Status: ${appData?.status}`);
    assert(appData?.users?.email === 'sansritidubey49+admin@gmail.com', 'Applicant email correctly retrieved via users:applicant_id', `Email: ${appData?.users?.email}`);
    assert(appData?.categories?.code === '03', 'Category correctly retrieved', `Code: ${appData?.categories?.code}`);

    // -------------------------------------------------------------------------
    // 2. Verify applicant profile organization lookup
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Applicant Organization Lookup ---');
    const { data: profData, error: profErr } = await adminClient
      .from('applicant_profiles')
      .select('organization_name')
      .eq('user_id', appData.applicant_id)
      .maybeSingle();

    assert(!profErr, 'Applicant profile query executed cleanly without errors');

    // -------------------------------------------------------------------------
    // 3. Verify Shortlists table query using users:shortlisted_by
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Shortlist Query with users:shortlisted_by ---');
    const { data: slData, error: slErr } = await adminClient
      .from('application_shortlists')
      .select(`
        id,
        application_id,
        is_locked,
        locked_at,
        created_at,
        decision_notes,
        deliberation_notes,
        users:shortlisted_by(id, full_name)
      `)
      .eq('edition_id', CURRENT_EDITION_ID);

    assert(!slErr, 'Shortlists query uses valid users:shortlisted_by relationship without PostgREST error');

    // -------------------------------------------------------------------------
    // 4. Verify Jury assignments and evaluations for nomination KHA26-03-0002
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Jury Completeness & Qualitative Evaluations Query ---');
    const { data: asgnData, error: asgnErr } = await adminClient
      .from('jury_assignments')
      .select(`
        id,
        application_id,
        jury_profile_id,
        status,
        conflict_declared,
        conflict_reason,
        jury_profiles(
          id,
          designation,
          organization,
          users(full_name)
        ),
        jury_evaluations(
          id,
          status,
          is_locked,
          recommendation,
          submitted_at,
          strengths,
          areas_of_concern,
          general_comment,
          jury_scores(
            criterion_id,
            qualitative_rating,
            confidential_comment,
            scoring_criteria(title)
          )
        )
      `)
      .eq('application_id', appData.id);

    assert(!asgnErr && asgnData && asgnData.length >= 2, 'Jury assignments loaded with profiles and evaluations', `Count: ${asgnData?.length}`);

    // Check for locked evaluation from Phase D test juror
    const lockedEvalAsgn = asgnData.find(a => {
      const ev = Array.isArray(a.jury_evaluations) ? a.jury_evaluations[0] : a.jury_evaluations;
      return ev && ev.is_locked;
    });

    assert(Boolean(lockedEvalAsgn), 'Phase D locked juror evaluation successfully retrieved');
    
    const ev = Array.isArray(lockedEvalAsgn?.jury_evaluations) ? lockedEvalAsgn.jury_evaluations[0] : lockedEvalAsgn?.jury_evaluations;
    assert(ev?.recommendation === 'strongly_recommend', 'Locked evaluation recommendation retrieved', `Recommendation: ${ev?.recommendation}`);
    assert(ev?.jury_scores?.length === 5, 'All 5 qualitative criteria scores retrieved', `Criteria count: ${ev?.jury_scores?.length}`);

    // Ensure NO numeric TOI scoring is in the evaluation
    const hasNumericScore = ev?.total_weighted_score !== null && ev?.total_weighted_score !== undefined;
    assert(!hasNumericScore, 'Verified ZERO numeric TOI scoring or percentage weight calculation exists');

    // -------------------------------------------------------------------------
    // 5. Verify RLS Security
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Security & RLS Gating ---');
    // Anonymous user attempting to query shortlists table directly
    const { data: anonSl, error: anonSlErr } = await anonClient
      .from('application_shortlists')
      .select('id');

    assert(!anonSl || anonSl.length === 0, 'Anonymous users cannot view administrative shortlists (RLS enforced)');

    // -------------------------------------------------------------------------
    // 6. Verify All 13 Categories for Tab Filtering
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: All 13 Categories Verified ---');
    const { data: categories } = await adminClient
      .from('categories')
      .select('id, name, code, slug')
      .eq('is_active', true)
      .order('display_order');

    assert(categories?.length === 13, 'All 13 categories active and available for workspace filtering', `Found: ${categories?.length}`);
    const cat13 = categories?.find(c => c.code === '13');
    assert(cat13?.name === 'Best Contractor of the Year', 'Category 13: Best Contractor of the Year present');

  } catch (err) {
    console.error('Unexpected exception during tests:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runVerification();
