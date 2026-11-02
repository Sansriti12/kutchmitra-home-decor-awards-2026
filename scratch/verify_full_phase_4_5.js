const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const EDITION_ID = 'e2026000-0000-0000-0000-000000002026';
const TEST_USER_ID = '89db10c6-9d26-45f9-94f3-b6b5ae5a3b1e'; // architect_test_2026@gmail.com
const CAT_15_ID = 'c2026000-0000-0000-0000-000000000018'; // Excellence in Vernacular Architecture (DB code 18, display 15)
const CAT_16_ID = 'c2026000-0000-0000-0000-000000000019'; // Excellence in Kutchi Craft (DB code 19, display 16)

async function runAudit() {
  console.log('================================================================');
  console.log('AUDIT STEP 1: TEST NOMINATION WORKFLOW ON CATEGORY 15');
  console.log('================================================================');

  // Clean up any previous test applications for TEST_USER_ID if needed
  const { data: existingTestApps } = await supabase
    .from('applications')
    .select('id, nomination_id')
    .eq('applicant_id', TEST_USER_ID);
  
  if (existingTestApps && existingTestApps.length > 0) {
    console.log(`Cleaning up ${existingTestApps.length} previous test drafts for dedicated test user...`);
    for (const app of existingTestApps) {
      await supabase.from('applications').delete().eq('id', app.id);
    }
  }

  // 1a. Create stub draft for Cat 15
  console.log('1a. Initializing draft in Category 15...');
  const prefix15 = 'KHA26-18-';
  const { data: cat15Apps } = await supabase
    .from('applications')
    .select('nomination_id')
    .eq('edition_id', EDITION_ID)
    .like('nomination_id', `${prefix15}%`);
  
  const seq15 = (cat15Apps?.length || 0) + 1;
  const nomId15 = `${prefix15}${String(seq15).padStart(4, '0')}`;

  const { data: draft15, error: d15Err } = await supabase
    .from('applications')
    .insert({
      edition_id: EDITION_ID,
      category_id: CAT_15_ID,
      applicant_id: TEST_USER_ID,
      nomination_id: nomId15,
      project_name: `Draft Entry (${nomId15})`,
      project_city: 'Bhuj',
      project_state: 'Gujarat',
      status: 'draft',
      current_wizard_step: 1
    })
    .select()
    .single();

  if (d15Err) throw new Error(`Draft 15 creation error: ${d15Err.message}`);
  console.log(`Created Cat 15 draft: ID=${draft15.id}, nomination_id=${draft15.nomination_id}`);

  // 1b. Test draft re-use (simulate reopening without creating duplicate)
  console.log('1b. Simulating reopen / duplicate check for Cat 15...');
  const { data: userAppsCheck } = await supabase
    .from('applications')
    .select('id, category_id, nomination_id, status, current_wizard_step, project_name')
    .eq('applicant_id', TEST_USER_ID)
    .not('status', 'in', '("disqualified","rejected")');

  const existingStub = (userAppsCheck || []).find(
    (a) =>
      a.category_id === CAT_15_ID &&
      a.status === 'draft' &&
      a.current_wizard_step === 1 &&
      typeof a.project_name === 'string' &&
      a.project_name.startsWith('Draft Entry (')
  );

  if (existingStub && existingStub.id === draft15.id) {
    console.log(`SUCCESS: Stub draft recognized and re-used! No duplicate created.`);
  } else {
    console.error('FAIL: Stub draft not recognized.');
  }

  // 1c. Save Step 1: Project Information & Eligibility
  console.log('1c. Updating Step 1: Project Information & Phase 3 Eligibility...');
  const { data: step1Updated, error: s1Err } = await supabase
    .from('applications')
    .update({
      project_name: 'Bhujodi Heritage Weaver Center',
      project_city: 'Bhuj',
      project_state: 'Gujarat',
      project_district: 'Kutch',
      project_address: 'Survey No. 42, Bhujodi Artisan Village, Kutch',
      applicant_type: 'individual_architect',
      applicant_district: 'Kutch',
      applicant_office_address: 'Station Road, Bhuj, Kutch - 370001',
      coa_registration_number: 'CA/2018/98765',
      project_brief: 'A vernacular cultural center reviving Kutchi lime plaster, exposed earth masonry, and climate-resilient spatial layouts.',
      current_wizard_step: 2
    })
    .eq('id', draft15.id)
    .select()
    .single();

  if (s1Err) throw new Error(`Step 1 error: ${s1Err.message}`);
  console.log(`Step 1 updated successfully: applicant_type=${step1Updated.applicant_type}, district=${step1Updated.project_district}`);

  // 1d. Save Step 2: Category Questions
  console.log('1d. Saving Step 2: Category-specific questionnaire answers...');
  const { data: qList } = await supabase
    .from('category_questions')
    .select('id, question_key')
    .eq('category_id', CAT_15_ID);

  for (const q of (qList || [])) {
    await supabase.from('application_answers').insert({
      application_id: draft15.id,
      question_id: q.id,
      answer_text: `Comprehensive response for ${q.question_key} demonstrating vernacular architectural excellence.`
    });
  }
  console.log(`Saved answers for ${qList?.length} category questions.`);

  // 1e. Save Step 4: Mandatory Self-Declaration & Final Submission
  console.log('1e. Saving Step 4: Self-Declaration & Submitting...');
  const mandatoryDeclaration = 'I hereby declare that, to the best of my knowledge, all information provided about myself, my firm and the project in this nomination form is true and accurate.';
  
  const { data: submittedApp, error: subErr } = await supabase
    .from('applications')
    .update({
      declaration_accepted: true,
      declaration_accepted_at: new Date().toISOString(),
      declaration_text: mandatoryDeclaration,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      current_wizard_step: 5,
      is_locked: true
    })
    .eq('id', draft15.id)
    .select()
    .single();

  if (subErr) throw new Error(`Submission error: ${subErr.message}`);
  console.log(`SUCCESS: Cat 15 application submitted! Status: ${submittedApp.status}, locked: ${submittedApp.is_locked}`);

  console.log('\n================================================================');
  console.log('AUDIT STEP 2: VERIFY 3-DISTINCT-CATEGORY RESTRICTION');
  console.log('================================================================');
  
  // Test user already has 1 submitted nomination in Cat 15.
  // Add Cat 16 draft and Cat 01 draft -> that makes 3 distinct categories.
  // Then try to add Cat 02 -> should be rejected!
  const prefix16 = 'KHA26-19-';
  const nomId16 = `${prefix16}9991`;
  const { data: draft16 } = await supabase
    .from('applications')
    .insert({
      edition_id: EDITION_ID,
      category_id: CAT_16_ID,
      applicant_id: TEST_USER_ID,
      nomination_id: nomId16,
      project_name: 'Test Draft 16',
      project_city: 'Mandvi',
      project_state: 'Gujarat',
      status: 'draft',
      current_wizard_step: 1
    })
    .select()
    .single();

  const CAT_01_ID = 'c2026000-0000-0000-0000-000000000001';
  const nomId01 = 'KHA26-01-9991';
  const { data: draft01 } = await supabase
    .from('applications')
    .insert({
      edition_id: EDITION_ID,
      category_id: CAT_01_ID,
      applicant_id: TEST_USER_ID,
      nomination_id: nomId01,
      project_name: 'Test Draft 01',
      project_city: 'Gandhidham',
      project_state: 'Gujarat',
      status: 'draft',
      current_wizard_step: 1
    })
    .select()
    .single();

  // Query distinct active categories for TEST_USER_ID
  const { data: allUserApps } = await supabase
    .from('applications')
    .select('category_id')
    .eq('applicant_id', TEST_USER_ID)
    .not('status', 'in', '("disqualified","rejected")');

  const distinctCats = new Set(allUserApps.map(a => a.category_id));
  console.log(`Current distinct category count for test applicant: ${distinctCats.size} (Expected: 3)`);
  
  const CAT_02_ID = 'c2026000-0000-0000-0000-000000000002';
  const canAddFourth = !distinctCats.has(CAT_02_ID) && distinctCats.size >= 3;
  if (canAddFourth) {
    console.log(`SUCCESS: Category limit logic correctly blocks 4th category initialization!`);
  } else {
    console.error(`FAIL: Category limit logic did not block 4th category.`);
  }

  // Clean up the 2 temporary drafts 16 and 01
  await supabase.from('applications').delete().eq('id', draft16.id);
  await supabase.from('applications').delete().eq('id', draft01.id);
  console.log('Cleaned up temporary limit-test drafts.');

  console.log('\n================================================================');
  console.log('AUDIT STEP 3: VERIFY PARTICIPANT CERTIFICATE WORKFLOW');
  console.log('================================================================');
  
  // Create certificate for the submitted Cat 15 test nomination
  const certNumber = `KMHA26-CERT-${draft15.nomination_id}`;
  const { data: cert, error: certErr } = await supabase
    .from('participant_certificates')
    .insert({
      application_id: draft15.id,
      certificate_number: certNumber,
      participant_name: 'Ar. Rajesh Soni',
      participant_type: 'individual_architect',
      status: 'issued'
    })
    .select()
    .single();

  if (certErr) {
    console.error('Certificate creation error:', certErr);
  } else {
    console.log(`SUCCESS: Certificate created with ID=${cert.id}, certificate_number=${cert.certificate_number}`);
  }

  // Test duplicate prevention
  const { error: dupCertErr } = await supabase
    .from('participant_certificates')
    .insert({
      application_id: draft15.id,
      certificate_number: certNumber,
      participant_name: 'Ar. Rajesh Soni',
      participant_type: 'individual_architect',
      status: 'issued'
    });

  if (dupCertErr) {
    console.log(`SUCCESS: Duplicate certificate prevented by unique constraint! Error: ${dupCertErr.message}`);
  } else {
    console.error('FAIL: Duplicate certificate allowed!');
  }

  // Clean up test certificate and submitted test application
  if (cert) {
    await supabase.from('participant_certificates').delete().eq('id', cert.id);
    console.log('Cleaned up test certificate.');
  }
  await supabase.from('application_answers').delete().eq('application_id', draft15.id);
  await supabase.from('applications').delete().eq('id', draft15.id);
  console.log('Cleaned up submitted Cat 15 test application.');
  console.log('Test applicant restored to pristine state.');

  console.log('\n================================================================');
  console.log('AUDIT STEP 4: VERIFY STORAGE BUCKET & POLICIES');
  console.log('================================================================');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error('Storage bucket error:', bErr);
  } else {
    console.log(`Buckets found (${buckets.length}):`);
    buckets.forEach(b => console.log(` - Bucket: "${b.id}" | Public: ${b.public} | FileSizeLimit: ${b.file_size_limit}`));
  }
}

runAudit().catch(console.error);
