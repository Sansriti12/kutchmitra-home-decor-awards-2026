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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testSql() {
  console.log("Checking RPCs or SQL execution methods...");
  
  // Try common rpc names
  const rpcs = ['exec_sql', 'execute_sql', 'sql', 'run_sql', 'query'];
  for (const r of rpcs) {
    try {
      const res = await supabase.rpc(r, { query: 'SELECT 1;' });
      console.log(`RPC ${r}:`, res.error ? res.error.message : 'SUCCESS!');
    } catch (e) {
      console.log(`RPC ${r} thrown:`, e.message);
    }
  }

  // Check if pg npm package is installed or resolvable
  try {
    const pg = require('pg');
    console.log("pg package is installed!");
  } catch (e) {
    console.log("pg package is NOT installed:", e.message);
  }
}

testSql();
