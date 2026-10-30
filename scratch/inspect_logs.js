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

async function inspectLogs() {
  const { data: logs, error: lErr } = await adminClient
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  console.log("Recent audit logs:", lErr ? lErr.message : logs);

  const { data: hist, error: hErr } = await adminClient
    .from('application_status_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log("Recent status history:", hErr ? hErr.message : hist);
}

inspectLogs().catch(console.error);
