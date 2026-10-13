const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testFix() {
  const { data: app, error: appErr } = await adminClient
    .from("applications")
    .select(`
      id,
      nomination_id,
      edition_id,
      category_id,
      applicant_id,
      project_name,
      project_city,
      project_state,
      status,
      users:applicant_id(id, full_name)
    `)
    .limit(1)
    .single();

  if (appErr) {
    console.error("Query Error:", appErr.message);
  } else {
    console.log("App query success:", app.nomination_id);
    const userObj = Array.isArray(app.users) ? app.users[0] : app.users;
    console.log("User:", userObj?.full_name);

    if (app.applicant_id) {
      const { data: prof } = await adminClient
        .from("applicant_profiles")
        .select("organization_name")
        .eq("user_id", app.applicant_id)
        .maybeSingle();
      console.log("Profile org:", prof?.organization_name);
    }
  }
}

testFix();
