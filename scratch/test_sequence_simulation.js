const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('c:/projects/Kutchmitra-Home-Decor-Awards-2026/.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(l => {
  const idx = l.indexOf('=');
  if (idx > 0) {
    let val = l.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[l.substring(0, idx).trim()] = val;
  }
});

const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function simulateSequenceLogic(categoryCode, categoryId, editionId) {
  const prefix = `KHA26-${categoryCode}-`;

  const { data: existingApps } = await adminClient
    .from("applications")
    .select("nomination_id")
    .eq("edition_id", editionId)
    .eq("category_id", categoryId);

  let maxSequence = 0;
  if (existingApps && existingApps.length > 0) {
    for (const app of existingApps) {
      if (app.nomination_id && app.nomination_id.startsWith(prefix)) {
        const numPart = app.nomination_id.substring(prefix.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxSequence) {
          maxSequence = parsed;
        }
      }
    }
  }

  let sequence = maxSequence + 1;
  const candidateId = `${prefix}${String(sequence).padStart(4, "0")}`;

  // Check if candidateId exists in DB
  const { data: existsInDB } = await adminClient
    .from("applications")
    .select("id")
    .eq("nomination_id", candidateId)
    .maybeSingle();

  return {
    categoryCode,
    existingCount: existingApps ? existingApps.length : 0,
    maxSequence,
    nextGeneratedId: candidateId,
    alreadyTakenInDB: Boolean(existsInDB)
  };
}

async function runVerification() {
  console.log('================================================================');
  console.log('NOMINATION ID SEQUENCE VERIFICATION');
  console.log('================================================================');

  const { data: categories } = await adminClient
    .from('categories')
    .select('id, code, edition_id, name')
    .order('code');

  for (const cat of categories) {
    const result = await simulateSequenceLogic(cat.code, cat.id, cat.edition_id);
    console.log(
      `Category ${result.categoryCode} (${cat.name}): ` +
      `Existing=${result.existingCount}, MaxSeq=${result.maxSequence} -> ` +
      `Next Generated ID: ${result.nextGeneratedId} ` +
      `[Unique in DB: ${!result.alreadyTakenInDB ? 'YES' : 'COLLISION!'}]`
    );
  }

  console.log('\nVerifying total rows in applications table (ensuring no data was changed)...');
  const { count } = await adminClient
    .from('applications')
    .select('id', { count: 'exact', head: true });
  console.log(`Total applications currently in DB: ${count} (Expected: 7)`);
}

runVerification();
