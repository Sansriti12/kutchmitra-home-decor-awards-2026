const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { categoriesConfig } = require('./generate_phase_b_seed');

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

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function generateSqlMigration() {
  let sql = `-- ==============================================================================
-- KUTCHMITRA HOME & DECOR AWARDS 2026
-- MIGRATION 03: SEED DYNAMIC CATEGORY QUESTIONS & UPLOAD REQUIREMENTS
-- File: 04_Database/migrations/03_seed_category_questions_and_upload_requirements.sql
-- ==============================================================================
--
-- IMPORTANT CLIENT & AUDIT NOTICE:
-- These category questions and upload requirements are an initial proposed baseline
-- created using publicly available industry references, including the TOI Home & Decor
-- Awards structure, and are subject to Kutchmitra client review and approval.
--
-- This script is strictly idempotent and safe to run multiple times without duplicating data.
-- ==============================================================================

BEGIN;

`;

  let totalQ = 0;
  let totalOpt = 0;
  let totalUp = 0;

  for (const cat of categoriesConfig) {
    sql += `-- ------------------------------------------------------------------------------\n`;
    sql += `-- CATEGORY #${cat.code}: ${cat.name} (${cat.id})\n`;
    sql += `-- ------------------------------------------------------------------------------\n\n`;

    // Questions
    for (const q of cat.questions) {
      totalQ++;
      sql += `INSERT INTO category_questions (
    category_id,
    question_key,
    question_text,
    help_text,
    placeholder,
    field_type,
    is_required,
    display_order,
    is_active
) VALUES (
    '${cat.id}'::uuid,
    ${escapeSql(q.key)},
    ${escapeSql(q.text)},
    ${escapeSql(q.help)},
    ${escapeSql(q.placeholder)},
    ${escapeSql(q.type)},
    ${q.required ? 'TRUE' : 'FALSE'},
    ${q.order},
    TRUE
)
ON CONFLICT (category_id, question_key) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    help_text = EXCLUDED.help_text,
    placeholder = EXCLUDED.placeholder,
    field_type = EXCLUDED.field_type,
    is_required = EXCLUDED.is_required,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;\n\n`;

      if (q.options && q.options.length > 0) {
        for (const opt of q.options) {
          totalOpt++;
          sql += `INSERT INTO question_options (
    question_id,
    label,
    value,
    display_order,
    is_active
) VALUES (
    (SELECT id FROM category_questions WHERE category_id = '${cat.id}'::uuid AND question_key = ${escapeSql(q.key)} LIMIT 1),
    ${escapeSql(opt.label)},
    ${escapeSql(opt.value)},
    ${opt.order || 1},
    TRUE
)
ON CONFLICT (question_id, value) DO UPDATE SET
    label = EXCLUDED.label,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;\n\n`;
        }
      }
    }

    // Upload requirements
    for (const u of cat.uploads) {
      totalUp++;
      const mimeArray = `ARRAY[${u.mime.map(m => escapeSql(m)).join(', ')}]`;
      sql += `INSERT INTO category_upload_requirements (
    category_id,
    upload_type,
    title,
    description,
    is_required,
    min_count,
    max_count,
    max_file_size_mb,
    allowed_mime_types,
    display_order,
    is_active
) VALUES (
    '${cat.id}'::uuid,
    ${escapeSql(u.type)},
    ${escapeSql(u.title)},
    ${escapeSql(u.description)},
    ${u.required ? 'TRUE' : 'FALSE'},
    ${u.min},
    ${u.max},
    ${u.maxSizeMb},
    ${mimeArray},
    ${u.order},
    TRUE
)
ON CONFLICT (category_id, upload_type) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_required = EXCLUDED.is_required,
    min_count = EXCLUDED.min_count,
    max_count = EXCLUDED.max_count,
    max_file_size_mb = EXCLUDED.max_file_size_mb,
    allowed_mime_types = EXCLUDED.allowed_mime_types,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;\n\n`;
    }
  }

  sql += `COMMIT;\n`;
  return { sql, totalQ, totalOpt, totalUp };
}

async function runSeed() {
  console.log('--- Generating SQL Migration ---');
  const { sql, totalQ, totalOpt, totalUp } = generateSqlMigration();
  const migrationPath = path.join(__dirname, '../04_Database/migrations/03_seed_category_questions_and_upload_requirements.sql');
  fs.writeFileSync(migrationPath, sql, 'utf8');
  console.log(`Saved migration: ${migrationPath}`);
  console.log(`Prepared ${totalQ} questions, ${totalOpt} options, ${totalUp} upload requirements across ${categoriesConfig.length} categories.`);

  console.log('\n--- Executing Idempotent Seed into Live Supabase Database ---');
  let qInserted = 0;
  let optInserted = 0;
  let upInserted = 0;

  for (const cat of categoriesConfig) {
    console.log(`\nProcessing Category #${cat.code}: ${cat.name}...`);

    for (const q of cat.questions) {
      // Upsert question
      const { data: qData, error: qErr } = await supabase
        .from('category_questions')
        .upsert(
          {
            category_id: cat.id,
            question_key: q.key,
            question_text: q.text,
            help_text: q.help,
            placeholder: q.placeholder,
            field_type: q.type,
            is_required: q.required,
            display_order: q.order,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'category_id, question_key' }
        )
        .select('id')
        .single();

      if (qErr) {
        console.error(`Error inserting question ${q.key}:`, qErr.message);
        continue;
      }
      qInserted++;

      if (q.options && q.options.length > 0 && qData) {
        for (let idx = 0; idx < q.options.length; idx++) {
          const opt = q.options[idx];
          const { error: optErr } = await supabase
            .from('question_options')
            .upsert(
              {
                question_id: qData.id,
                label: opt.label,
                value: opt.value,
                display_order: idx + 1,
                is_active: true,
              },
              { onConflict: 'question_id, value' }
            );
          if (optErr) {
            console.error(`Error inserting option ${opt.value}:`, optErr.message);
          } else {
            optInserted++;
          }
        }
      }
    }

    for (const u of cat.uploads) {
      const { error: uErr } = await supabase
        .from('category_upload_requirements')
        .upsert(
          {
            category_id: cat.id,
            upload_type: u.type,
            title: u.title,
            description: u.description,
            is_required: u.required,
            min_count: u.min,
            max_count: u.max,
            max_file_size_mb: u.maxSizeMb,
            allowed_mime_types: u.mime,
            display_order: u.order,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'category_id, upload_type' }
        );

      if (uErr) {
        console.error(`Error inserting upload req ${u.type}:`, uErr.message);
      } else {
        upInserted++;
      }
    }
  }

  console.log('\n--- VERIFICATION OF DATABASE RECORDS ---');
  const [qCountRes, optCountRes, upCountRes] = await Promise.all([
    supabase.from('category_questions').select('id, category_id', { count: 'exact' }),
    supabase.from('question_options').select('id', { count: 'exact' }),
    supabase.from('category_upload_requirements').select('id, category_id', { count: 'exact' }),
  ]);

  console.log(`Total category_questions in DB: ${qCountRes.count}`);
  console.log(`Total question_options in DB: ${optCountRes.count}`);
  console.log(`Total category_upload_requirements in DB: ${upCountRes.count}`);

  // Check each category has questions and upload requirements
  console.log('\nPer-Category Audit:');
  for (const cat of categoriesConfig) {
    const qForCat = (qCountRes.data || []).filter(q => q.category_id === cat.id).length;
    const upForCat = (upCountRes.data || []).filter(u => u.category_id === cat.id).length;
    console.log(`Cat #${cat.code} [${cat.name}]: ${qForCat} questions, ${upForCat} upload requirements -> ${qForCat > 0 && upForCat > 0 ? 'READY (PASS)' : 'FAIL'}`);
  }
}

runSeed().catch(console.error);
