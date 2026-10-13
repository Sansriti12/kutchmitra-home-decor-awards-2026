const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const categoriesContent = fs.readFileSync('src/data/categories.ts', 'utf8');

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

async function runTests() {
  console.log('================================================================');
  console.log('VERIFICATION TEST: REMOVAL OF CATEGORY 3 (BEST APARTMENT DESIGN)');
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
    // ----------------------------------------------------
    // TEST GROUP 1: Database Category Status & Integrity
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: Database Categories Status & Preservation ---');

    // 1.1 Active categories count
    const { data: activeCats, error: activeErr } = await adminClient
      .from('categories')
      .select('id, code, name, slug, display_order, is_active')
      .eq('is_active', true)
      .order('display_order');

    assert(!activeErr && activeCats?.length === 12, 'Active categories in database equals exactly 12', `Count: ${activeCats?.length}`);

    // 1.2 Category 03 is NOT active
    const cat3InActive = activeCats?.find(c => c.id === CAT3_ID || c.code === '03' || c.slug === 'best-apartment-design');
    assert(!cat3InActive, 'Category 03 is absent from active database categories');

    // 1.3 Category 03 exists in database with is_active = false
    const { data: cat3Db, error: cat3Err } = await adminClient
      .from('categories')
      .select('id, code, name, slug, is_active')
      .eq('id', CAT3_ID)
      .single();

    assert(!cat3Err && cat3Db?.is_active === false, 'Category 03 safely preserved in database with is_active = false', `Name: ${cat3Db?.name}`);

    // 1.4 Remaining categories (01, 02, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13)
    const expectedCodes = ['01', '02', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
    const actualCodes = (activeCats || []).map(c => c.code);
    const codesMatch = expectedCodes.every(code => actualCodes.includes(code)) && actualCodes.length === 12;
    assert(codesMatch, 'Remaining 12 categories maintain exact codes 01, 02, 04-13 (no renumbering)', `Codes: ${actualCodes.join(', ')}`);

    // 1.5 Category 13 is fully active and preserved
    const cat13 = activeCats?.find(c => c.code === '13');
    assert(cat13 && cat13.name === 'Best Contractor of the Year', 'Category 13 (Best Contractor of the Year) is fully active and preserved', `ID: ${cat13?.id}`);

    // ----------------------------------------------------
    // TEST GROUP 2: Category Questions & Upload Requirements
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Category 03 Configuration Deactivation ---');

    const { data: qCat3 } = await adminClient
      .from('category_questions')
      .select('id, is_active')
      .eq('category_id', CAT3_ID);

    const allQInactive = (qCat3 || []).every(q => q.is_active === false);
    assert(qCat3?.length === 6 && allQInactive, 'Category 03 questions (6) are all marked is_active = false');

    const { data: reqCat3 } = await adminClient
      .from('category_upload_requirements')
      .select('id, is_active')
      .eq('category_id', CAT3_ID);

    const allReqInactive = (reqCat3 || []).every(r => r.is_active === false);
    assert(reqCat3?.length === 4 && allReqInactive, 'Category 03 upload requirements (4) are all marked is_active = false');

    // ----------------------------------------------------
    // TEST GROUP 3: Historical Records Preservation
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Historical Data Integrity & FK Preservation ---');

    const { data: histApps, error: histAppErr } = await adminClient
      .from('applications')
      .select('id, nomination_id, status, category_id')
      .eq('category_id', CAT3_ID);

    assert(!histAppErr && histApps?.length === 2, 'Historical applications referencing Category 03 are preserved', `Count: ${histApps?.length}`);

    // Check jury assignments for historical applications
    const histAppIds = (histApps || []).map(a => a.id);
    const { data: histJa } = await adminClient
      .from('jury_assignments')
      .select('id, application_id, status')
      .in('application_id', histAppIds);

    assert(histJa?.length === 2, 'Historical jury assignments referencing Category 03 applications are preserved', `Count: ${histJa?.length}`);

    // Check shortlist records for historical applications
    const { data: histSl } = await adminClient
      .from('application_shortlists')
      .select('id, application_id')
      .in('application_id', histAppIds);

    assert(histSl?.length === 1, 'Historical shortlist records referencing Category 03 applications are preserved', `Count: ${histSl?.length}`);

    // ----------------------------------------------------
    // TEST GROUP 4: Public Static Data & Routing
    // ----------------------------------------------------
    const idMatches = (categoriesContent.match(/slug:\s*["'][^"']+["']/g) || []);
    assert(idMatches.length === 12, 'Public AWARD_CATEGORIES array contains exactly 12 categories', `Count: ${idMatches.length}`);

    const hasCat3Slug = categoriesContent.includes('best-apartment-design');
    assert(!hasCat3Slug, 'Slug "best-apartment-design" is absent from data/categories.ts');

    const hasCat13 = categoriesContent.includes('best-contractor-of-the-year');
    assert(hasCat13, 'Category 13 ("best-contractor-of-the-year") is present in data/categories.ts');

    const featuredMatches = categoriesContent.includes('[1, 2, 4, 5, 6, 7]');
    assert(featuredMatches, 'FEATURED_CATEGORIES correctly excludes Category 3');

    // ----------------------------------------------------
    // TEST GROUP 5: Nomination & Workflow Inactivity Guards
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 5: Workflow Guards for Inactive Category 03 ---');

    // 5.1 Verification that active category query for Step 2 excludes Category 03
    const { data: applicantCats } = await adminClient
      .from('categories')
      .select('id, code, name')
      .eq('is_active', true)
      .order('display_order');

    const appCat3Found = (applicantCats || []).some(c => c.id === CAT3_ID);
    assert(!appCat3Found, 'Applicant category selection query excludes Category 03');

    // 5.2 Verification that admin jury overview query excludes Category 03 from eligible applications
    const { data: eligApps } = await adminClient
      .from('applications')
      .select(`
        id,
        nomination_id,
        category_id,
        categories(id, is_active)
      `)
      .in('status', ['eligible', 'jury_review']);

    const eligWithCat3 = (eligApps || []).filter(a => {
      const cat = Array.isArray(a.categories) ? a.categories[0] : a.categories;
      return cat && cat.is_active === false;
    });

    assert(eligWithCat3.length === 0, 'No applications with inactive categories in eligible/jury_review assignment pool');

  } catch (err) {
    console.error('Unhandled test exception:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
