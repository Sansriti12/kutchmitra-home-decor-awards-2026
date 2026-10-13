const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Category display mapping test
const CATEGORY_CODE_TO_DISPLAY = {
  "01": "01",
  "02": "02",
  "04": "03",
  "05": "04",
  "06": "05",
  "07": "06",
  "08": "07",
  "09": "08",
  "10": "09",
  "11": "10",
  "12": "11",
  "13": "12",
};

function getCategoryDisplayNumber(code) {
  if (!code) return "";
  const normalized = String(code).padStart(2, "0");
  return CATEGORY_CODE_TO_DISPLAY[normalized] || normalized;
}

// RBAC authorization test
function isManagementAuthorized(session) {
  if (!session) return false;
  return session.role === "super_admin" || session.role === "admin";
}

async function runTests() {
  console.log("==================================================");
  console.log("PHASE H — CMS & CONTENT MANAGEMENT VERIFICATION");
  console.log("==================================================");
  let failed = 0;

  // TEST 1: RBAC Gate Logic
  console.log("\n[TEST 1] RBAC Authorization Gate Matrix");
  const testCases = [
    { session: { role: "super_admin" }, expected: true, label: "Super Admin" },
    { session: { role: "admin" }, expected: true, label: "Manager / Admin" },
    { session: { role: "verification_team" }, expected: false, label: "Verification Team" },
    { session: { role: "jury_member" }, expected: false, label: "Jury Member" },
    { session: { role: "applicant" }, expected: false, label: "Applicant" },
    { session: null, expected: false, label: "Unauthenticated" },
  ];

  for (const tc of testCases) {
    const res = isManagementAuthorized(tc.session);
    if (res === tc.expected) {
      console.log(`  ✓ ${tc.label}: ${res} (Expected ${tc.expected})`);
    } else {
      console.error(`  ✗ ${tc.label}: ${res} (Expected ${tc.expected})`);
      failed++;
    }
  }

  // TEST 2: CMS Important Dates Table & Data
  console.log("\n[TEST 2] CMS Important Dates Table");
  const { data: dates, error: dateErr } = await adminClient
    .from("cms_important_dates")
    .select("*")
    .order("display_order");

  if (dateErr) {
    console.error("  ✗ Error fetching cms_important_dates:", dateErr.message);
    failed++;
  } else {
    console.log(`  Total milestones in cms_important_dates: ${dates.length}`);
    if (dates.length >= 6) {
      console.log(`  ✓ Seeded with ${dates.length} milestone stages`);
      console.log(`    Stage 01: ${dates[0].title} (${dates[0].date_text})`);
      console.log(`    Stage 06: ${dates[5].title} (${dates[5].date_text})`);
    } else {
      console.error(`  ✗ Expected at least 6 milestones, got ${dates.length}`);
      failed++;
    }
  }

  // TEST 3: CMS FAQs Table & Data
  console.log("\n[TEST 3] CMS FAQs Table");
  const { data: faqs, error: faqErr } = await adminClient
    .from("cms_faqs")
    .select("*")
    .order("display_order");

  if (faqErr) {
    console.error("  ✗ Error fetching cms_faqs:", faqErr.message);
    failed++;
  } else {
    console.log(`  Total FAQs in cms_faqs: ${faqs.length}`);
    if (faqs.length >= 12) {
      console.log(`  ✓ Seeded with ${faqs.length} approved FAQs`);
      const homepageFeatured = faqs.filter(f => f.is_featured_homepage);
      console.log(`    Homepage Featured count: ${homepageFeatured.length}`);
    } else {
      console.error(`  ✗ Expected at least 12 FAQs, got ${faqs.length}`);
      failed++;
    }
  }

  // TEST 4: CMS Site Settings & Official Contact Info
  console.log("\n[TEST 4] CMS Site Settings & Official Contact Info");
  const { data: settings, error: setErr } = await adminClient
    .from("cms_site_settings")
    .select("*")
    .eq("id", "current")
    .maybeSingle();

  if (setErr || !settings) {
    console.error("  ✗ Error fetching cms_site_settings:", setErr?.message || "Record missing");
    failed++;
  } else {
    console.log("  ✓ cms_site_settings row exists with key 'current'");
    console.log(`    Office Address: ${settings.office_address.replace(/\n/g, ', ')}`);
    console.log(`    Official Email: ${settings.official_email}`);
    console.log(`    Helpline Phone: ${settings.helpline_phone}`);
    console.log(`    Homepage Notice Active: ${settings.homepage_banner_active}`);

    if (
      settings.official_email === "Kutchmitraweb@gmail.com" &&
      settings.helpline_phone === "+91 7211189211" &&
      settings.office_address.includes("Bhuj, Kutch – 370001")
    ) {
      console.log("  ✓ Official contact details match client specifications exactly");
    } else {
      console.error("  ✗ Contact details mismatch");
      failed++;
    }
  }

  // TEST 5: CMS Announcements Table
  console.log("\n[TEST 5] CMS Announcements Table");
  const { data: announcements, error: annErr } = await adminClient
    .from("cms_announcements")
    .select("*");

  if (annErr) {
    console.error("  ✗ Error fetching cms_announcements:", annErr.message);
    failed++;
  } else {
    console.log(`  Total announcements in cms_announcements: ${announcements.length}`);
    console.log(`  ✓ Announcements table queryable and operational`);
  }

  // TEST 6: Public Storage Bucket `cms-public-assets`
  console.log("\n[TEST 6] Supabase Storage Bucket `cms-public-assets`");
  const { data: buckets, error: bErr } = await adminClient.storage.listBuckets();
  if (bErr) {
    console.error("  ✗ Error listing storage buckets:", bErr.message);
    failed++;
  } else {
    const cmsBucket = buckets.find(b => b.id === "cms-public-assets");
    if (cmsBucket && cmsBucket.public) {
      console.log(`  ✓ Bucket 'cms-public-assets' exists and is public (public: ${cmsBucket.public})`);
    } else {
      console.error("  ✗ Bucket 'cms-public-assets' not found or not public");
      failed++;
    }
  }

  // TEST 7: Anonymous / Public Read Access under RLS
  console.log("\n[TEST 7] Public Anon RLS Read Access");
  const [anonDates, anonFaqs, anonAnn, anonSettings] = await Promise.all([
    anonClient.from("cms_important_dates").select("id, title, date_text").eq("status", "published"),
    anonClient.from("cms_faqs").select("id, question").eq("status", "published"),
    anonClient.from("cms_announcements").select("id, title").eq("status", "published"),
    anonClient.from("cms_site_settings").select("official_email, helpline_phone").eq("id", "current")
  ]);

  if (!anonDates.error && anonDates.data.length > 0) {
    console.log(`  ✓ Anon client successfully read ${anonDates.data.length} published dates`);
  } else {
    console.error("  ✗ Anon client failed to read published dates:", anonDates.error?.message);
    failed++;
  }

  if (!anonFaqs.error && anonFaqs.data.length > 0) {
    console.log(`  ✓ Anon client successfully read ${anonFaqs.data.length} published FAQs`);
  } else {
    console.error("  ✗ Anon client failed to read published FAQs:", anonFaqs.error?.message);
    failed++;
  }

  if (!anonSettings.error && anonSettings.data.length > 0) {
    console.log(`  ✓ Anon client successfully read site settings`);
  } else {
    console.error("  ✗ Anon client failed to read site settings:", anonSettings.error?.message);
    failed++;
  }

  // TEST 8: Category Safety & Numbering Invariants (Requirement 11 & 30)
  console.log("\n[TEST 8] Category Safety & Numbering Invariants");
  const { data: categories, error: catErr } = await adminClient
    .from("categories")
    .select("id, code, name, slug, is_active, display_order")
    .order("display_order");

  if (catErr) {
    console.error("  ✗ Error fetching categories:", catErr.message);
    failed++;
  } else {
    const activeCats = categories.filter(c => c.is_active);
    const cat03 = categories.find(c => c.code === "03" || c.slug === "best-apartment-design");

    if (activeCats.length === 12) {
      console.log(`  ✓ Exactly 12 categories are active in the database`);
    } else {
      console.error(`  ✗ Expected 12 active categories, got ${activeCats.length}`);
      failed++;
    }

    if (cat03 && !cat03.is_active) {
      console.log(`  ✓ Category 03 (Best Apartment Design) remains strictly inactive (is_active: false)`);
    } else {
      console.error(`  ✗ Category 03 is NOT deactivated!`);
      failed++;
    }

    // Verify sequential visible numbering 01–12
    const testCodes = [
      { code: "01", expected: "01", label: "Architect of the Year" },
      { code: "02", expected: "02", label: "Interior Designer of the Year" },
      { code: "04", expected: "03", label: "Best Renovation Project" },
      { code: "13", expected: "12", label: "Best Contractor of the Year" },
    ];

    for (const tc of testCodes) {
      const displayNum = getCategoryDisplayNumber(tc.code);
      if (displayNum === tc.expected) {
        console.log(`  ✓ DB Code ${tc.code} (${tc.label}) -> UI Display #${displayNum}`);
      } else {
        console.error(`  ✗ DB Code ${tc.code} -> UI Display #${displayNum} (Expected ${tc.expected})`);
        failed++;
      }
    }
  }

  // TEST 9: Audit Trail Logging
  console.log("\n[TEST 9] Audit Trail Logging for CMS Operations");
  const testAuditId = "00000000-0000-0000-0000-000000000001";
  const { error: auditInsertErr } = await adminClient.from("audit_logs").insert({
    actor_id: null,
    action: "cms_verification_test",
    entity_type: "cms_important_dates",
    entity_id: testAuditId,
    new_values: { test: "phase_h_verification", timestamp: new Date().toISOString() },
    created_at: new Date().toISOString(),
  });

  if (auditInsertErr) {
    console.error("  ✗ Error inserting audit record:", auditInsertErr.message);
    failed++;
  } else {
    console.log("  ✓ Successfully inserted test CMS audit trail record into audit_logs");
    // Clean up test audit record
    await adminClient.from("audit_logs").delete().eq("entity_id", testAuditId);
    console.log("  ✓ Cleaned up test audit record");
  }

  // SUMMARY
  console.log("\n==================================================");
  if (failed === 0) {
    console.log("ALL PHASE H CMS VERIFICATION CHECKS PASSED!");
  } else {
    console.error(`${failed} VERIFICATION CHECKS FAILED!`);
  }
  console.log("==================================================");
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
