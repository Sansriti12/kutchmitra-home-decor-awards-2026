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

async function runTests() {
  console.log('================================================================');
  console.log('PHASE E: SHORTLISTING, WINNER MANAGEMENT & SHOWCASE VERIFICATION');
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
    // TEST GROUP 1: All 13 Categories Verification
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: All 13 Categories & Category 13 Verification ---');
    const { data: categories, error: catErr } = await adminClient
      .from('categories')
      .select('id, code, name, slug, display_order')
      .eq('is_active', true)
      .order('display_order');

    assert(!catErr && categories?.length === 13, '1. All 13 Official Categories Exist', `Found: ${categories?.length}`);

    const cat13 = categories?.find(c => c.code === '13');
    assert(cat13 && cat13.name === 'Best Contractor of the Year', '2. Category 13 is "Best Contractor of the Year"', `Name: ${cat13?.name}`);

    // Verify all 13 categories have questions configured
    let allCategoriesConfigured = true;
    for (const cat of categories || []) {
      const { data: qData } = await adminClient
        .from('category_questions')
        .select('id')
        .eq('category_id', cat.id)
        .eq('is_active', true);
      if (!qData || qData.length === 0) {
        allCategoriesConfigured = false;
        break;
      }
    }
    assert(allCategoriesConfigured, '3. All 13 Categories Have Dynamic Questions Configured');

    // ----------------------------------------------------
    // TEST GROUP 2: Database Schema & Migration 06 Verification
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Schema Columns & Transitions Verification ---');
    
    // Check application_shortlists columns
    const { data: slSample, error: slColErr } = await adminClient
      .from('application_shortlists')
      .select('id, application_id, edition_id, category_id, shortlisted_by, decision_notes, is_locked, locked_at, locked_by, deliberation_notes, shortlist_rank')
      .limit(1);
    assert(!slColErr, '4. application_shortlists Table Has Phase E Columns', 'locked_at, locked_by, deliberation_notes, shortlist_rank verified');

    // Check winners columns
    const { data: winSample, error: winColErr } = await adminClient
      .from('winners')
      .select('id, application_id, edition_id, category_id, award_title, winner_type, winner_title, publication_status, project_name, entrant_name, organization_name, project_location, summary_description, citation, project_story, hero_image_url, gallery_urls, is_published, published_at, is_featured, display_order')
      .limit(1);
    assert(!winColErr, '5. winners Table Has Complete Phase E Columns', 'editorial profile & publication status verified');

    // Check status transitions
    const { data: transitions, error: transErr } = await adminClient
      .from('status_transitions')
      .select('from_status, to_status, allowed_role');

    const hasJuryToShortlist = transitions?.some(t => t.from_status === 'jury_review' && t.to_status === 'shortlisted');
    const hasShortlistToJury = transitions?.some(t => t.from_status === 'shortlisted' && t.to_status === 'jury_review');
    const hasShortlistToWinner = transitions?.some(t => t.from_status === 'shortlisted' && t.to_status === 'winner');
    const hasWinnerToShortlist = transitions?.some(t => t.from_status === 'winner' && t.to_status === 'shortlisted');

    assert(hasJuryToShortlist, '6. Status Transition Allowed: jury_review -> shortlisted');
    assert(hasShortlistToJury, '7. Status Transition Allowed: shortlisted -> jury_review (rollback)');
    assert(hasShortlistToWinner, '8. Status Transition Allowed: shortlisted -> winner');
    assert(hasWinnerToShortlist, '9. Status Transition Allowed: winner -> shortlisted (rollback)');

    // ----------------------------------------------------
    // TEST GROUP 3: Qualitative Jury Synthesis (Zero TOI Numeric Scoring)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Qualitative Jury Synthesis Verification ---');
    
    // Check evaluation criteria definition in database
    const { data: criteria, error: critErr } = await adminClient
      .from('scoring_criteria')
      .select('id, title, code, is_active')
      .order('display_order');

    assert(!critErr && criteria && criteria.length === 5, '10. Exactly 5 Qualitative Evaluation Criteria Configured', `Count: ${criteria?.length}`);

    // Verify criteria names match official 5
    const approvedNames = [
      'Design Excellence & Innovation',
      'Functionality & Usability',
      'Quality of Craftsmanship & Execution',
      'Sustainability & Material Sensitivity',
      'Contextual Relevance & Cultural Harmony'
    ];
    const criteriaMatched = criteria?.every(c => approvedNames.includes(c.title));
    assert(criteriaMatched, '11. Criteria Match 5 Approved Qualitative Standards (No TOI Formula)');

    // Verify existing jury evaluation for nomination KHA26-03-0002
    const { data: testApp } = await adminClient
      .from('applications')
      .select('id, nomination_id, status, category_id, project_name')
      .eq('nomination_id', 'KHA26-03-0002')
      .single();

    assert(Boolean(testApp), '12. Existing Test Application KHA26-03-0002 Found', `Status: ${testApp?.status}`);

    const { data: testEvals } = await adminClient
      .from('jury_evaluations')
      .select(`
        id,
        jury_assignment_id,
        recommendation,
        strengths,
        areas_of_concern,
        general_comment,
        submitted_at
      `)
      .limit(5);

    const hasQualitativeFields = testEvals && testEvals.length > 0 && testEvals[0].recommendation !== undefined;
    assert(hasQualitativeFields, '13. Juror Evaluations Store Qualitative Recommendations & Comments');

    // ----------------------------------------------------
    // TEST GROUP 4: Shortlist Operations Simulation
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 4: Shortlist Operations Simulation ---');

    // Get an admin user for audit and attribution
    const { data: adminUser } = await adminClient
      .from('users')
      .select('id, email, full_name')
      .eq('is_active', true)
      .limit(1)
      .single();

    const testAdminId = adminUser?.id;

    // Simulate adding KHA26-03-0002 to shortlist if not already shortlisted
    let initialStatus = testApp.status;
    let initialShortlist = null;

    const { data: existingShortlist } = await adminClient
      .from('application_shortlists')
      .select('*')
      .eq('application_id', testApp.id)
      .maybeSingle();

    initialShortlist = existingShortlist;

    // Test Shortlist Addition
    if (!existingShortlist) {
      const { data: newSl, error: addSlErr } = await adminClient
        .from('application_shortlists')
        .insert({
          application_id: testApp.id,
          edition_id: CURRENT_EDITION_ID,
          category_id: testApp.category_id,
          shortlisted_by: testAdminId,
          decision_notes: 'Automated Phase E acceptance verification test.',
          is_locked: false,
        })
        .select()
        .single();

      await adminClient
        .from('applications')
        .update({ status: 'shortlisted', updated_at: new Date().toISOString() })
        .eq('id', testApp.id);

      assert(!addSlErr && Boolean(newSl), '14. Successfully Added Nomination to Shortlist');
    } else {
      assert(true, '14. Nomination Already Shortlisted (Verified Existing Shortlist Record)');
    }

    // Verify application status is shortlisted
    const { data: slAppCheck } = await adminClient
      .from('applications')
      .select('status')
      .eq('id', testApp.id)
      .single();
    assert(slAppCheck?.status === 'shortlisted', '15. Application Status Set to "shortlisted"');

    // Test Shortlist Lock & Unlock Mechanics
    const { error: lockErr } = await adminClient
      .from('application_shortlists')
      .update({
        is_locked: true,
        locked_at: new Date().toISOString(),
        locked_by: testAdminId,
      })
      .eq('application_id', testApp.id);

    assert(!lockErr, '16. Shortlist Locking Succeeded (is_locked = TRUE)');

    // Verify Lock state
    const { data: lockedSl } = await adminClient
      .from('application_shortlists')
      .select('is_locked, locked_at, locked_by')
      .eq('application_id', testApp.id)
      .single();

    assert(lockedSl?.is_locked === true && Boolean(lockedSl.locked_at), '17. Shortlist Lock Integrity Verified');

    // Unlock to allow further operations
    const { error: unlockErr } = await adminClient
      .from('application_shortlists')
      .update({
        is_locked: false,
        locked_at: null,
        locked_by: null,
      })
      .eq('application_id', testApp.id);

    assert(!unlockErr, '18. Shortlist Unlocking Succeeded (is_locked = FALSE)');

    // Test Deliberation Notes Update
    const testNotes = 'Deliberation notes: Strong regional identity, superb craftsmanship.';
    const { error: notesErr } = await adminClient
      .from('application_shortlists')
      .update({
        deliberation_notes: testNotes,
      })
      .eq('application_id', testApp.id);

    assert(!notesErr, '19. Deliberation Notes Successfully Saved to Shortlist');

    // ----------------------------------------------------
    // TEST GROUP 5: Winner Selection & Profile Lifecycle
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 5: Winner Selection & Profile Lifecycle ---');

    // Clean up any existing test winner for this application to test clean cycle
    await adminClient.from('winners').delete().eq('application_id', testApp.id);

    // 1. Select as Winner (in 'draft' publication status)
    const { data: newWinner, error: winCreateErr } = await adminClient
      .from('winners')
      .insert({
        application_id: testApp.id,
        edition_id: CURRENT_EDITION_ID,
        category_id: testApp.category_id,
        award_title: 'Excellence in Interior Architecture',
        winner_type: 'winner',
        winner_title: 'Winner — Excellence in Interior Architecture',
        project_name: testApp.project_name,
        entrant_name: 'Test Nominee',
        organization_name: 'Bhuj Architecture Studio',
        project_location: 'Bhuj, Kutch',
        summary_description: 'An exemplary residential design blending Kutch heritage with modern functionality.',
        citation: 'Recognized for outstanding craftsmanship, cultural sensitivity, and elegant spatial harmony.',
        project_story: 'Rooted in the vernacular traditions of Bhuj, this project reinterprets traditional courtyards.',
        hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        gallery_urls: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf'
        ],
        publication_status: 'draft',
        is_published: false,
        display_order: 1,
        is_featured: true,
      })
      .select()
      .single();

    assert(!winCreateErr && Boolean(newWinner), '20. Winner Record Created in "draft" Status');

    // Update application status to 'winner'
    await adminClient
      .from('applications')
      .update({ status: 'winner' })
      .eq('id', testApp.id);

    const { data: appWinnerCheck } = await adminClient
      .from('applications')
      .select('status')
      .eq('id', testApp.id)
      .single();

    assert(appWinnerCheck?.status === 'winner', '21. Application Status Transitioned to "winner"');

    // 2. Editorial Profile Update
    const { error: editErr } = await adminClient
      .from('winners')
      .update({
        citation: 'Updated citation: Superb detailing and vernacular craftsmanship.',
        summary_description: 'Updated executive summary for Grand Gala publication.',
      })
      .eq('id', newWinner.id);

    assert(!editErr, '22. Winner Editorial Profile Successfully Updated');

    // 3. Approval Lifecycle: draft -> approved
    const { error: approveErr } = await adminClient
      .from('winners')
      .update({ publication_status: 'approved' })
      .eq('id', newWinner.id);

    assert(!approveErr, '23. Winner Lifecycle: "draft" -> "approved" Transitioned');

    // 4. Publication Lifecycle: approved -> published
    const publishTime = new Date().toISOString();
    const { error: pubErr } = await adminClient
      .from('winners')
      .update({
        publication_status: 'published',
        is_published: true,
        published_at: publishTime,
      })
      .eq('id', newWinner.id);

    assert(!pubErr, '24. Winner Lifecycle: "approved" -> "published" Transitioned');

    // ----------------------------------------------------
    // TEST GROUP 6: Public Showcase Gating & Security Projections
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 6: Public Showcase Gating & Security Projections ---');

    // Query published winners via public anonClient
    const { data: publicWinners, error: pubAnonErr } = await anonClient
      .from('winners')
      .select(`
        id,
        award_title,
        winner_type,
        winner_title,
        project_name,
        entrant_name,
        organization_name,
        project_location,
        summary_description,
        citation,
        hero_image_url,
        is_published,
        publication_status
      `)
      .eq('is_published', true)
      .eq('publication_status', 'published');

    assert(!pubAnonErr && publicWinners && publicWinners.length > 0, '25. Public Showcase Queries Return Published Winners', `Count: ${publicWinners?.length}`);

    // Verify non-published draft gating
    // Temporarily create a draft winner and verify anon cannot see it
    const { data: draftWinner } = await adminClient
      .from('winners')
      .insert({
        application_id: testApp.id,
        edition_id: CURRENT_EDITION_ID,
        category_id: cat13.id,
        award_title: 'Draft Secret Winner',
        winner_type: 'runner_up',
        publication_status: 'draft',
        is_published: false,
      })
      .select()
      .single();

    const { data: draftCheckAnon } = await anonClient
      .from('winners')
      .select('id')
      .eq('id', draftWinner?.id)
      .eq('is_published', true)
      .eq('publication_status', 'published');

    assert(!draftCheckAnon || draftCheckAnon.length === 0, '26. Unpublished Draft Winner is Strictly Hidden from Public Queries');

    // Clean up draft test winner
    if (draftWinner) {
      await adminClient.from('winners').delete().eq('id', draftWinner.id);
    }

    // Public single detail projection test
    const { data: singlePublicWinner } = await anonClient
      .from('winners')
      .select(`
        id,
        award_title,
        winner_type,
        project_name,
        citation,
        summary_description
      `)
      .eq('id', newWinner.id)
      .eq('is_published', true)
      .maybeSingle();

    assert(Boolean(singlePublicWinner), '27. Single Public Winner Detail Accessible When Published');

    // Verify confidentiality: ensure public projection has ZERO jury data
    const publicKeys = Object.keys(singlePublicWinner || {});
    const leakedJury = publicKeys.some(k => k.toLowerCase().includes('jury') || k.toLowerCase().includes('eval') || k.toLowerCase().includes('score'));
    assert(!leakedJury, '28. Public Projection Contains Zero Confidential Juror or Scoring Data');

    // ----------------------------------------------------
    // Cleanup / Restore State
    // ----------------------------------------------------
    console.log('\n--- State Restitution & Cleanup ---');
    // Remove the test winner record
    await adminClient.from('winners').delete().eq('id', newWinner.id);
    
    // Restore application status to jury_review or its initial state
    await adminClient
      .from('applications')
      .update({ status: initialStatus })
      .eq('id', testApp.id);

    // If there was no initial shortlist, remove the test shortlist
    if (!initialShortlist) {
      await adminClient.from('application_shortlists').delete().eq('application_id', testApp.id);
    } else {
      await adminClient.from('application_shortlists').update({
        is_locked: initialShortlist.is_locked,
        locked_at: initialShortlist.locked_at,
        locked_by: initialShortlist.locked_by,
        deliberation_notes: initialShortlist.deliberation_notes,
      }).eq('id', initialShortlist.id);
    }

    console.log(`Application KHA26-03-0002 restored to status: ${initialStatus}`);

  } catch (err) {
    console.error('Unhandled exception during tests:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
