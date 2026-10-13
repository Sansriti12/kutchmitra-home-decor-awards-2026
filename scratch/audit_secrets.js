const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk('src');
const hits = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const isClient = content.includes('"use client"') || content.includes("'use client'");

  if (content.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')) {
    hits.push({ file: f, match: 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY' });
  }
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY') && isClient) {
    hits.push({ file: f, match: 'SUPABASE_SERVICE_ROLE_KEY in client component' });
  }
  if (content.includes('RESEND_API_KEY') && isClient) {
    hits.push({ file: f, match: 'RESEND_API_KEY in client component' });
  }
  if (content.includes('createAdminClient') && isClient) {
    hits.push({ file: f, match: 'createAdminClient in client component' });
  }
}

console.log('Secrets audit completed across ' + files.length + ' files in src/.');
console.log('Violations found: ' + hits.length);
if (hits.length > 0) {
  console.log(JSON.stringify(hits, null, 2));
} else {
  console.log('SUCCESS: ZERO leaked private credentials or service role clients found in client components.');
}
