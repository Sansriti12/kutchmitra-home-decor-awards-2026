const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
const CURRENT_EDITION_ID = 'e2026000-0000-0000-0000-000000002026';

async function testWorkspaceQueries() {
  console.log('Testing Shortlisting Workspace Queries...\n');

  // 1. Applications query
  const { data: rawApps, error: appErr } = await adminClient
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
    .eq('edition_id', CURRENT_EDITION_ID)
    .in('status', ['jury_review', 'shortlisted', 'winner'])
    .order('created_at', { ascending: false });

  if (appErr) {
    console.error('FAILED: Applications query error:', appErr);
    return;
  }
  console.log('PASSED: Applications query fetched count:', rawApps.length);
  if (rawApps.length > 0) {
    console.log('Sample Application:');
    console.log(` - ID: ${rawApps[0].id}`);
    console.log(` - Nomination: ${rawApps[0].nomination_id}`);
    console.log(` - Project: ${rawApps[0].project_name}`);
    console.log(` - Applicant: ${rawApps[0].users?.full_name} (${rawApps[0].users?.email})`);
    console.log(` - Category: ${rawApps[0].categories?.name} (${rawApps[0].categories?.code})`);
  }

  const appIds = rawApps.map(a => a.id);

  // 2. Shortlists query
  const { data: shortlists, error: slErr } = await adminClient
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
    .in('application_id', appIds.length > 0 ? appIds : ['00000000-0000-0000-0000-000000000000']);

  if (slErr) {
    console.error('FAILED: Shortlists query error:', slErr);
    return;
  }
  console.log('PASSED: Shortlists query fetched count:', shortlists.length);

  // 3. Jury Assignments & Evaluations query
  const { data: assignments, error: asgnErr } = await adminClient
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
    .in('application_id', appIds.length > 0 ? appIds : ['00000000-0000-0000-0000-000000000000']);

  if (asgnErr) {
    console.error('FAILED: Jury assignments query error:', asgnErr);
    return;
  }
  console.log('PASSED: Jury assignments query fetched count:', assignments.length);

  // 4. Dossier query for test nomination KHA26-03-0002
  const targetId = 'e3a5f6e1-44ef-4dcf-b79f-48827b8bd58b';
  const { data: dossierApp, error: dosErr } = await adminClient
    .from('applications')
    .select(`
      id,
      nomination_id,
      project_name,
      category_id,
      applicant_id,
      project_city,
      project_state,
      built_up_area_sqft,
      project_completion_date,
      status,
      users:applicant_id(
        id,
        full_name,
        email,
        phone
      ),
      categories(
        id,
        name,
        code,
        slug
      )
    `)
    .eq('id', targetId)
    .single();

  if (dosErr) {
    console.error('FAILED: Dossier application query error:', dosErr);
    return;
  }
  console.log('PASSED: Deliberation dossier application query successful for:', dossierApp.nomination_id);

  console.log('\nALL QUERIES EXECUTED SUCCESSFULLY WITHOUT ANY SCHEMA CACHE OR FK ERRORS!');
}

testWorkspaceQueries();
