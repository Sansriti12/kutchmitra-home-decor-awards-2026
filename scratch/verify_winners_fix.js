const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach((line) => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let v = (m[2] || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
});

// ANON client == what an unauthenticated public visitor of /winners uses (RLS applies)
const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const EDITION = 'e2026000-0000-0000-0000-000000002026';

(async () => {
  let failed = 0;
  const check = (name, ok, detail) => { console.log(`${ok ? '[PASS]' : '[FAIL]'} ${name}: ${detail}`); if (!ok) failed++; };

  // Fixed list query shape (no categories embed)
  const list = await anon.from('winners')
    .select('id, category_id, award_title, winner_type, winner_title, project_name, entrant_name, organization_name, project_location, summary_description, citation, hero_image_url, is_featured, display_order')
    .eq('edition_id', EDITION).eq('is_published', true).eq('publication_status', 'published')
    .order('display_order', { ascending: true });
  check('/winners list query (anon)', !list.error, list.error ? `${list.error.code} ${list.error.message}` : `no PGRST200, rows=${list.data.length}`);

  // Fixed detail query shape
  const det = await anon.from('winners')
    .select('id, category_id, award_title, winner_type, winner_title, project_name, entrant_name, organization_name, project_location, summary_description, citation, project_story, hero_image_url, gallery_urls, is_featured, display_order, published_at')
    .eq('id', '00000000-0000-0000-0000-000000000000').eq('is_published', true).eq('publication_status', 'published').maybeSingle();
  check('/winners/[id] detail query (anon)', !det.error, det.error ? `${det.error.code} ${det.error.message}` : 'query valid (null for unknown id => notFound)');

  // Category lookup used by the fix: public categories (active only, per RLS)
  const cats = await anon.from('categories').select('id, name, code, slug, display_order').eq('is_active', true).order('display_order');
  check('Public categories list (anon)', !cats.error && cats.data.length === 12, cats.error ? cats.error.message : `${cats.data.length} active categories`);
  check('Category 03 hidden from public', !cats.error && !cats.data.some((c) => c.code === '03'), 'code 03 not returned to anon');

  // category_id -> category resolution works for every active category
  const first = cats.data[0];
  const one = await anon.from('categories').select('code, name, slug').eq('id', first.id).maybeSingle();
  check('Detail category lookup by id (anon)', !one.error && one.data && one.data.code === first.code, one.error ? one.error.message : `${one.data.code} ${one.data.name}`);

  // Admin-side join path (unchanged) still resolves
  const adm = await admin.from('winners').select('id, application_id, applications(id, nomination_id, categories(id, name, code))').limit(5);
  check('Admin winners -> applications -> categories join', !adm.error, adm.error ? adm.error.message : `ok rows=${adm.data.length}`);

  // Data preservation + Category 03 state (service role)
  const wc = await admin.from('winners').select('id', { count: 'exact', head: true });
  console.log(`[INFO] winners rows in DB (unchanged by this fix): ${wc.count}`);
  const c03 = await admin.from('categories').select('code, is_active').eq('code', '03').maybeSingle();
  check('Category 03 remains inactive', c03.data && c03.data.is_active === false, JSON.stringify(c03.data));

  console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL WINNERS FIX CHECKS PASSED');
  process.exit(failed ? 1 : 0);
})();
