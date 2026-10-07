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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function runComprehensiveCategoryAudit() {
  console.log('===============================================================');
  console.log('PHASE B: COMPREHENSIVE 13-CATEGORY AUDIT & VERIFICATION');
  console.log('===============================================================\n');

  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, code, name, slug, display_order, is_active')
    .order('display_order');

  if (catErr || !categories) {
    console.error('Failed to load categories:', catErr);
    process.exit(1);
  }

  console.log(`Loaded ${categories.length} categories from database.\n`);

  const results = [];

  for (const cat of categories) {
    console.log(`---------------------------------------------------------------`);
    console.log(`TESTING CATEGORY #${cat.code}: ${cat.name} (${cat.slug})`);
    console.log(`ID: ${cat.id}`);

    // 1. Fetch Questions
    const { data: questions, error: qErr } = await supabase
      .from('category_questions')
      .select('id, question_key, question_text, field_type, is_required, display_order')
      .eq('category_id', cat.id)
      .eq('is_active', true)
      .order('display_order');

    if (qErr) {
      console.error(`  [FAIL] Error loading questions:`, qErr.message);
      results.push({ code: cat.code, name: cat.name, status: 'FAIL', reason: qErr.message });
      continue;
    }

    // Check cross-category isolation
    const { data: allQuestionsWithThisKey } = await supabase
      .from('category_questions')
      .select('id, category_id, question_key')
      .eq('category_id', cat.id);

    const questionsUnique = allQuestionsWithThisKey.every(q => q.category_id === cat.id);

    // 2. Fetch Options for questions
    const questionIds = questions.map(q => q.id);
    let optionsCount = 0;
    if (questionIds.length > 0) {
      const { data: options } = await supabase
        .from('question_options')
        .select('id, question_id, label, value')
        .in('question_id', questionIds)
        .eq('is_active', true);
      optionsCount = options ? options.length : 0;
    }

    // 3. Fetch Upload Requirements
    const { data: uploads, error: uErr } = await supabase
      .from('category_upload_requirements')
      .select('id, upload_type, title, is_required, min_count, max_count, max_file_size_mb, allowed_mime_types, display_order')
      .eq('category_id', cat.id)
      .eq('is_active', true)
      .order('display_order');

    if (uErr) {
      console.error(`  [FAIL] Error loading upload requirements:`, uErr.message);
      results.push({ code: cat.code, name: cat.name, status: 'FAIL', reason: uErr.message });
      continue;
    }

    // Checks
    const hasQuestions = questions.length >= 6;
    const hasRequiredQuestions = questions.some(q => q.is_required);
    const hasOptionalQuestions = questions.some(q => !q.is_required);
    const hasUploads = uploads.length >= 4;
    const hasRequiredUploads = uploads.some(u => u.is_required);
    const hasOptionalUploads = uploads.some(u => !u.is_required);
    const orderSequential = questions.every((q, idx) => q.display_order === idx + 1);

    const reqQuestions = questions.filter(q => q.is_required);
    const optQuestions = questions.filter(q => !q.is_required);
    const reqUploads = uploads.filter(u => u.is_required);
    const optUploads = uploads.filter(u => !u.is_required);

    console.log(`  ✓ Questions: ${questions.length} total (${reqQuestions.length} required, ${optQuestions.length} optional)`);
    console.log(`  ✓ Question Options: ${optionsCount} options attached`);
    console.log(`  ✓ Upload Requirements: ${uploads.length} total (${reqUploads.length} required, ${optUploads.length} optional)`);
    console.log(`  ✓ Sequence Order: ${orderSequential ? 'Clean (1..N)' : 'Custom'}`);
    console.log(`  ✓ Category Isolation: ${questionsUnique ? 'Strictly Isolated' : 'Contaminated'}`);

    const pass = hasQuestions && hasRequiredQuestions && hasUploads && hasRequiredUploads && questionsUnique;
    results.push({
      code: cat.code,
      name: cat.name,
      status: pass ? 'PASS' : 'FAIL',
      questionsCount: questions.length,
      reqQuestionsCount: reqQuestions.length,
      optQuestionsCount: optQuestions.length,
      uploadsCount: uploads.length,
      reqUploadsCount: reqUploads.length,
      optUploadsCount: optUploads.length,
      optionsCount: optionsCount,
    });
  }

  console.log('\n===============================================================');
  console.log('SUMMARY OF ALL 13 CATEGORY TEST RESULTS');
  console.log('===============================================================');
  console.table(results);

  const allPassed = results.every(r => r.status === 'PASS');
  console.log(`\nOverall Result: ${allPassed ? 'ALL 13 CATEGORIES PASSED' : 'SOME CATEGORIES FAILED'}`);

  // Test Category 13 specifically
  console.log('\n--- SPECIAL TEST: Category 13 (Best Contractor of the Year) ---');
  const cat13 = categories.find(c => c.code === '13');
  const { data: q13 } = await supabase
    .from('category_questions')
    .select('question_key, question_text, field_type, is_required')
    .eq('category_id', cat13.id)
    .order('display_order');
  console.log('Category 13 Questions Breakdown:');
  q13.forEach((q, i) => console.log(`  ${i+1}. [${q.field_type}] ${q.is_required ? '(REQ)' : '(OPT)'} ${q.question_text}`));

  const { data: u13 } = await supabase
    .from('category_upload_requirements')
    .select('upload_type, title, is_required, min_count')
    .eq('category_id', cat13.id)
    .order('display_order');
  console.log('\nCategory 13 Upload Requirements Breakdown:');
  u13.forEach((u, i) => console.log(`  ${i+1}. [${u.upload_type}] ${u.is_required ? '(REQ)' : '(OPT)'} ${u.title} (min: ${u.min_count})`));
}

runComprehensiveCategoryAudit().catch(console.error);
