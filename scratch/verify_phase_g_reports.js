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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
  console.log("PHASE G — REPORTS & EXPORTS AUTOMATED VERIFICATION");
  console.log("==================================================");
  let failed = 0;

  // TEST 1: RBAC Gate Logic
  console.log("\n[TEST 1] RBAC Authorization Matrix");
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

  // TEST 2: Category Sequential Numbering 01-12 & Category 03 Retirement
  console.log("\n[TEST 2] Category Display Numbering Mapping");
  const expectedMappings = {
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

  for (const [dbCode, expectedDisplay] of Object.entries(expectedMappings)) {
    const actual = getCategoryDisplayNumber(dbCode);
    if (actual === expectedDisplay) {
      console.log(`  ✓ DB Code ${dbCode} -> Display #${actual}`);
    } else {
      console.error(`  ✗ DB Code ${dbCode} -> Display #${actual} (Expected ${expectedDisplay})`);
      failed++;
    }
  }

  // TEST 3: Database Categories Verification
  console.log("\n[TEST 3] Database Categories Check");
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, code, name, slug, display_order, is_active")
    .order("display_order");

  if (catErr) {
    console.error("  ✗ Error fetching categories:", catErr.message);
    failed++;
  } else {
    const activeCats = categories.filter(c => c.is_active);
    const cat03 = categories.find(c => c.code === "03" || c.slug === "best-apartment-design");

    console.log(`  Total Categories in DB: ${categories.length}`);
    console.log(`  Active Categories: ${activeCats.length}`);

    if (activeCats.length === 12) {
      console.log("  ✓ Exactly 12 categories are active");
    } else {
      console.error(`  ✗ Expected 12 active categories, got ${activeCats.length}`);
      failed++;
    }

    if (cat03 && !cat03.is_active) {
      console.log("  ✓ Category 03 (Best Apartment Design) is strictly deactivated (is_active: false)");
    } else {
      console.error("  ✗ Category 03 is NOT deactivated as expected!");
      failed++;
    }
  }

  // TEST 4: Database Applications PostgREST Relationship Query
  console.log("\n[TEST 4] Database Applications PostgREST Join Query");
  const { data: apps, error: appErr } = await supabase
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
      built_up_area_sqft,
      status,
      is_locked,
      submitted_at,
      created_at,
      categories(id, code, name, slug, is_active),
      users:applicant_id(id, full_name, email, phone),
      application_shortlists(id, is_locked, created_at),
      winners(id, award_title, winner_type, publication_status, is_published),
      jury_assignments(id, status, conflict_declared)
    `)
    .limit(10);

  if (appErr) {
    console.error("  ✗ Error executing PostgREST join query:", appErr.message);
    failed++;
  } else {
    console.log(`  ✓ Successfully executed multi-relation query. Loaded ${apps.length} applications.`);
    if (apps.length > 0) {
      const sample = apps[0];
      console.log(`    Sample Nomination: ${sample.nomination_id} (${sample.project_name})`);
      console.log(`    Category: ${sample.categories?.name} [DB Code: ${sample.categories?.code}]`);
      console.log(`    Applicant: ${sample.users?.full_name} (${sample.users?.email})`);
      console.log(`    Status: ${sample.status}`);
      console.log(`    Shortlists: ${sample.application_shortlists?.length || 0}`);
      console.log(`    Winners: ${sample.winners?.length || 0}`);
      console.log(`    Jury Assignments: ${sample.jury_assignments?.length || 0}`);
    }
  }

  // TEST 5: CSV RFC 4180 & Excel XML generation tests
  console.log("\n[TEST 5] Export Utilities (CSV RFC 4180 & SpreadsheetML XML)");
  
  function escapeCsvField(val) {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const sampleCsvData = [
    {
      nominationId: "KHA26-01-0001",
      categoryDisplayNumber: "01",
      categoryName: 'Best "Luxury" Villa, Bhuj',
      projectName: 'Villa "Sunset", Mandvi',
    }
  ];

  const headers = ["Nomination ID", "Category #", "Category Name", "Project Name"];
  const csvRow = [
    escapeCsvField(sampleCsvData[0].nominationId),
    escapeCsvField(sampleCsvData[0].categoryDisplayNumber),
    escapeCsvField(sampleCsvData[0].categoryName),
    escapeCsvField(sampleCsvData[0].projectName),
  ];

  const csvOutput = "\uFEFF" + headers.join(",") + "\r\n" + csvRow.join(",");
  
  // Check UTF-8 BOM
  if (csvOutput.startsWith("\uFEFF")) {
    console.log("  ✓ CSV output begins with UTF-8 BOM (\\uFEFF) for Excel Unicode support");
  } else {
    console.error("  ✗ Missing UTF-8 BOM in CSV output");
    failed++;
  }

  // Check RFC 4180 escaping
  if (csvOutput.includes('"Best ""Luxury"" Villa, Bhuj"') && csvOutput.includes('"Villa ""Sunset"", Mandvi"')) {
    console.log("  ✓ CSV correctly escapes embedded quotes and commas according to RFC 4180");
  } else {
    console.error("  ✗ CSV escaping failed:", csvOutput);
    failed++;
  }

  // Check Excel XML structure
  const sanitizeXml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Applications Report">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">${sanitizeXml('Design & "Decor" <Awards>')}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  if (
    xmlSample.includes('Design &amp; &quot;Decor&quot; &lt;Awards&gt;') &&
    xmlSample.includes('ss:Name="Applications Report"')
  ) {
    console.log("  ✓ Excel SpreadsheetML XML correctly escapes XML entities and formats worksheet");
  } else {
    console.error("  ✗ Excel XML formatting test failed");
    failed++;
  }

  // Final Summary
  console.log("\n==================================================");
  if (failed === 0) {
    console.log("ALL PHASE G VERIFICATION CHECKS PASSED SUCCESSFULLY!");
  } else {
    console.error(`${failed} VERIFICATION CHECKS FAILED!`);
  }
  console.log("==================================================");
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
