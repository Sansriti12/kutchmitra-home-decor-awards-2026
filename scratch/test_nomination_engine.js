const fs = require('fs');
const envContent = fs.readFileSync('c:/projects/Kutchmitra-Home-Decor-Awards-2026/.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(l => {
  const t = l.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) {
      let val = t.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[t.slice(0, idx).trim()] = val;
    }
  }
});

const { createClient } = require('@supabase/supabase-js');
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runTests() {
  console.log('================================================================');
  console.log('NOMINATION ENGINE & WIZARD TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check Categories
  const { data: categories, error: catErr } = await admin
    .from('categories')
    .select('id, code, name, edition_id')
    .eq('is_active', true)
    .order('display_order');

  assert(!catErr && categories?.length === 12, `Active 2026 Categories count is 12 (Found: ${categories?.length})`);

  // 2. Check Award Edition
  const { data: edition, error: edErr } = await admin
    .from('award_editions')
    .select('id, year, is_current')
    .eq('year', 2026)
    .single();

  assert(!edErr && edition?.year === 2026, `Award Edition 2026 exists with ID: ${edition?.id}`);

  // 3. Create or login a dedicated test applicant user
  const testEmail = `applicant_test_${Date.now()}@example.com`;
  const testPassword = 'Password123!@#Secure';

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Test Architect' }
  });

  assert(!authErr && authData?.user?.id, `Test applicant user created: ${testEmail}`);
  const testUserId = authData.user.id;

  // Sign in as this applicant to get a real authenticated session client
  const applicantClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: sessionData, error: signInErr } = await applicantClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  assert(!signInErr && sessionData?.session, `Applicant signed in with real authenticated JWT session`);

  // Ensure applicant profile
  await admin.from('applicant_profiles').upsert({
    user_id: testUserId,
    organization_name: 'Bhuj Architecture Lab',
    designation: 'Lead Architect',
    city: 'Bhuj',
    state: 'Gujarat',
    terms_accepted_at: new Date().toISOString(),
    privacy_accepted_at: new Date().toISOString(),
  });

  // 4. Test Draft Application Creation using Authenticated Session
  const chosenCat = categories[0]; // Architect of the Year (code: 01)
  const candidateId = `KHA26-${chosenCat.code}-0001`;

  const { data: draftApp, error: draftErr } = await applicantClient
    .from('applications')
    .insert({
      nomination_id: candidateId,
      edition_id: edition.id,
      category_id: chosenCat.id,
      applicant_id: testUserId,
      project_name: `Draft Entry (${candidateId})`,
      project_city: 'Bhuj',
      project_state: 'Gujarat',
      status: 'draft',
      current_wizard_step: 1,
      is_locked: false,
      declaration_accepted: false
    })
    .select('*')
    .single();

  assert(!draftErr && draftApp?.id, `Draft nomination created via authenticated client with ID: ${draftApp?.nomination_id}`);
  assert(draftApp?.status === 'draft', `Draft status is 'draft'`);
  assert(draftApp?.is_locked === false, `Draft is_locked is false`);
  assert(draftApp?.current_wizard_step === 1, `Draft wizard step initialized to 1`);

  // 5. Test Draft Resumability & Step Update
  const { data: updatedApp, error: updateErr } = await applicantClient
    .from('applications')
    .update({
      project_name: 'Villa Mandvi Heritage Residence',
      project_city: 'Mandvi',
      project_state: 'Gujarat',
      built_up_area_sqft: 5200.5,
      project_completion_date: '2025-11-20',
      current_wizard_step: 3,
      updated_at: new Date().toISOString()
    })
    .eq('id', draftApp.id)
    .select('*')
    .single();

  assert(!updateErr && updatedApp?.project_name === 'Villa Mandvi Heritage Residence', `Draft updated with real project name`);
  assert(updatedApp?.current_wizard_step === 3, `Draft wizard step progressed and persisted to Step 3`);
  assert(Number(updatedApp?.built_up_area_sqft) === 5200.5, `Built-up area saved correctly: 5200.5 sq.ft.`);

  // 6. Test RLS Isolation: Anonymous client cannot read this draft
  const { data: anonView, error: anonErr } = await anon
    .from('applications')
    .select('*')
    .eq('id', draftApp.id);

  assert(!anonErr && (!anonView || anonView.length === 0), `RLS Isolation: Anonymous user receives 0 records for private draft`);

  // 7. Test RLS Isolation: Another user cannot view or modify this draft
  const { data: otherUser } = await admin.auth.admin.createUser({
    email: `other_applicant_${Date.now()}@example.com`,
    password: 'Password123!@#Secure',
    email_confirm: true
  });
  const otherClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  await otherClient.auth.signInWithPassword({
    email: otherUser.user.email,
    password: 'Password123!@#Secure'
  });

  const { data: otherView } = await otherClient
    .from('applications')
    .select('*')
    .eq('id', draftApp.id);

  assert(!otherView || otherView.length === 0, `RLS Isolation: Cross-applicant query returns 0 records`);

  const { error: otherTamperErr } = await otherClient
    .from('applications')
    .update({ project_name: 'Hacked Project Name' })
    .eq('id', draftApp.id);

  // Re-verify project_name was not altered
  const { data: checkApp } = await admin.from('applications').select('project_name').eq('id', draftApp.id).single();
  assert(checkApp?.project_name === 'Villa Mandvi Heritage Residence', `RLS Integrity: Cross-applicant update rejected; data remains pristine`);

  // 8. Test Dynamic Questionnaire handling (0 rows)
  const { data: qList, error: qErr } = await applicantClient
    .from('category_questions')
    .select('id, question_text')
    .eq('category_id', chosenCat.id)
    .eq('is_active', true);

  assert(!qErr && qList?.length === 0, `Category questions gracefully returned 0 rows without failing`);

  // 9. Test Upload Requirements handling (0 rows)
  const { data: reqList, error: reqErr } = await applicantClient
    .from('category_upload_requirements')
    .select('id, title')
    .eq('category_id', chosenCat.id)
    .eq('is_active', true);

  assert(!reqErr && reqList?.length === 0, `Upload requirements gracefully returned 0 rows without failing`);

  // 10. Test Final Submission and Locking (via server-side trusted action)
  const submitTime = new Date().toISOString();
  const { data: submittedApp, error: submitErr } = await admin
    .from('applications')
    .update({
      status: 'submitted',
      is_locked: true,
      declaration_accepted: true,
      declaration_accepted_at: submitTime,
      submitted_at: submitTime,
      current_wizard_step: 7,
      updated_at: submitTime
    })
    .eq('id', draftApp.id)
    .select('*')
    .single();

  assert(!submitErr && submittedApp?.status === 'submitted', `Application status successfully transitioned to 'submitted'`);
  assert(submittedApp?.is_locked === true, `Application is_locked successfully set to true`);
  assert(submittedApp?.declaration_accepted === true, `Declaration acceptance recorded`);
  assert(submittedApp?.submitted_at !== null, `Submission timestamp recorded: ${submittedApp?.submitted_at}`);

  // 11. Test Audit History Entry
  const { error: histErr } = await admin.from('application_status_history').insert({
    application_id: draftApp.id,
    from_status: 'draft',
    to_status: 'submitted',
    changed_by: testUserId,
    comments: 'Automated test suite submission with accepted declaration.'
  });
  assert(!histErr, `Audit log entry created in application_status_history`);

  const { data: historyEntries } = await admin
    .from('application_status_history')
    .select('*')
    .eq('application_id', draftApp.id);
  assert(historyEntries?.length === 1, `Application status history contains exactly 1 chronological audit record`);

  // 12. Test Immutability of Submitted Entry: Applicant cannot modify a locked application
  const { error: postSubmitEditErr } = await applicantClient
    .from('applications')
    .update({ project_name: 'Post-submission Tamper Attempt' })
    .eq('id', draftApp.id);

  const { data: postCheckApp } = await admin.from('applications').select('project_name').eq('id', draftApp.id).single();
  assert(postCheckApp?.project_name === 'Villa Mandvi Heritage Residence', `Post-submission Lock: Applicant edit prevented by RLS (is_locked = TRUE)`);

  // Clean up test data
  await admin.from('applications').delete().eq('id', draftApp.id);
  await admin.auth.admin.deleteUser(testUserId);
  await admin.auth.admin.deleteUser(otherUser.user.id);
  console.log(`[CLEANUP] Test applications and test users cleaned up cleanly.`);

  console.log('================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
}

runTests();
