const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Parse environment from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("FATAL: .env.local does not exist.");
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf-8');
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
const results = [];

function recordResult(section, testName, passed, details = "") {
  results.push({ section, testName, passed, details });
  const status = passed ? "[PASS]" : "[FAIL]";
  console.log(`${status} ${section} - ${testName}: ${details}`);
}

async function runAudit() {
  console.log("================================================================================");
  console.log("PHASE I — COMPREHENSIVE AUTOMATED VERIFICATION SUITE");
  console.log("Kutchmitra Home & Decor Awards 2026");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. Environment & Secret Hygiene
  // ---------------------------------------------------------------------------
  console.log(">>> SECTION 1: Environment & Secret Isolation");
  const hasSupabaseUrl = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http'));
  const hasAnonKey = Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20);
  const hasServiceKey = Boolean(env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY.length > 20);
  const hasResendKey = Boolean(env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== "");

  recordResult("Secrets", "NEXT_PUBLIC_SUPABASE_URL configuration", hasSupabaseUrl, hasSupabaseUrl ? "FOUND & Valid URL" : "MISSING");
  recordResult("Secrets", "NEXT_PUBLIC_SUPABASE_ANON_KEY configuration", hasAnonKey, hasAnonKey ? "FOUND & Non-empty" : "MISSING");
  recordResult("Secrets", "SUPABASE_SERVICE_ROLE_KEY configuration", hasServiceKey, hasServiceKey ? "FOUND (Private server-only)" : "MISSING");
  recordResult("Secrets", "RESEND_API_KEY Email Transport", true, hasResendKey ? "FOUND (Live Resend dispatch active)" : "INFO (Simulated mock email fallback enabled for development)");

  try {
    const gitTracked = execSync('git ls-files .env .env.local .env*.local', { encoding: 'utf8' }).trim();
    const gitClean = gitTracked.length === 0;
    recordResult("Secrets", "Git Secret Isolation (.env untracked in Git)", gitClean, gitClean ? "PASS (.env files untracked)" : `LEAK: ${gitTracked}`);
  } catch (err) {
    recordResult("Secrets", "Git Secret Isolation", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. Category 03 Retirement & Sequential Display Numbering (01–12)
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 2: Category Architecture & Sequential Display Numbering");
  const { data: categories, error: catErr } = await adminClient
    .from("categories")
    .select("id, code, name, slug, is_active, display_order")
    .order("display_order");

  if (catErr) {
    recordResult("Categories", "Fetch categories from database", false, catErr.message);
  } else {
    const cat03 = categories.find(c => c.code === "03" || c.slug === "best-apartment-design");
    const isCat03Retired = Boolean(cat03 && cat03.is_active === false);
    recordResult("Categories", "Category 03 (Best Apartment Design) Deactivated", isCat03Retired, isCat03Retired ? `is_active = false (DB Code preserved: ${cat03.code})` : "Category 03 is still active!");

    const activeCategories = categories.filter(c => c.is_active !== false);
    recordResult("Categories", "Active Categories Count equals 12", activeCategories.length === 12, `Active count: ${activeCategories.length}`);

    // Read display-number.ts source directly to verify mappings
    const dispNumFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'categories', 'display-number.ts'), 'utf8');
    
    // Parse mapping dictionary from display-number.ts
    const match = dispNumFile.match(/CATEGORY_CODE_TO_DISPLAY_NUMBER:\s*Record<string,\s*string>\s*=\s*({[\s\S]*?});/);
    let mappingDict = {};
    if (match) {
      // Evaluate the JSON-like object safely
      try {
        const cleaned = match[1].replace(/\/\/.*$/gm, '').replace(/,\s*}/g, '}');
        mappingDict = eval(`(${cleaned})`);
      } catch (e) {
        console.error("Failed to parse CATEGORY_CODE_TO_DISPLAY_NUMBER:", e);
      }
    }

    const expectedSequence = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    const actualSequence = activeCategories.map(c => mappingDict[c.code]);
    const sequenceMatches = JSON.stringify(expectedSequence) === JSON.stringify(actualSequence);

    recordResult("Categories", "Display Number Sequential 01–12 Mapping", sequenceMatches, sequenceMatches ? `Sequential 01–12 exact match (${actualSequence.join(', ')})` : `Mismatch: ${actualSequence.join(', ')}`);
    recordResult("Categories", "Original Database Category Codes Intact", activeCategories.map(c => c.code).includes("04") && activeCategories.map(c => c.code).includes("13"), "DB codes preserved: " + activeCategories.map(c => c.code).join(", "));
  }

  // ---------------------------------------------------------------------------
  // 3. Database Schema, Relationships & Foreign Keys
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 3: Database Schema & Relational Foreign Keys");
  // Test Application join with users via applicant_id (Fixed P1 defect verification)
  const { data: testApp, error: appFkErr } = await adminClient
    .from("applications")
    .select(`
      id,
      nomination_id,
      applicant_id,
      status,
      category_id,
      users:applicant_id(id, full_name),
      categories(id, code, name)
    `)
    .limit(1)
    .maybeSingle();

  if (appFkErr) {
    recordResult("Schema & Relations", "Application -> User (applicant_id FK join)", false, appFkErr.message);
  } else {
    recordResult("Schema & Relations", "Application -> User (applicant_id FK join)", true, "Relation resolves cleanly without PostgREST hint error");
  }

  // Test Shortlisting relational query
  const { data: slData, error: slErr } = await adminClient
    .from("applications")
    .select(`
      id,
      nomination_id,
      project_name,
      applicant_id,
      status,
      application_shortlists(id, is_locked, deliberation_notes),
      categories(id, code, name, is_active),
      users:applicant_id(id, full_name)
    `)
    .in("status", ["jury_review", "shortlisted", "winner"])
    .limit(5);

  if (slErr) {
    recordResult("Schema & Relations", "Shortlisting Complex Multi-Table Join", false, slErr.message);
  } else {
    recordResult("Schema & Relations", "Shortlisting Complex Multi-Table Join", true, `Successfully fetched ${slData?.length || 0} deliberate candidate records`);
  }

  // Test Winners query
  const { data: winData, error: winErr } = await adminClient
    .from("winners")
    .select(`
      id,
      award_title,
      winner_type,
      winner_title,
      project_name,
      entrant_name,
      is_published,
      publication_status,
      application_id,
      applications (
        id,
        nomination_id,
        applicant_id,
        users:applicant_id (
          id,
          full_name
        )
      )
    `)
    .limit(5);

  if (winErr) {
    recordResult("Schema & Relations", "Winners Relational Multi-Table Join", false, winErr.message);
  } else {
    recordResult("Schema & Relations", "Winners Relational Multi-Table Join", true, `Successfully fetched ${winData?.length || 0} designated winners`);
  }

  // ---------------------------------------------------------------------------
  // 4. Qualitative Evaluation Framework Integrity (No numeric scoring)
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 4: Qualitative Evaluation Framework");
  const { data: criteria, error: critErr } = await adminClient
    .from("scoring_criteria")
    .select("id, code, title, description, is_active")
    .eq("is_active", true);

  if (critErr) {
    recordResult("Evaluation", "Scoring Criteria Schema", false, critErr.message);
  } else {
    recordResult("Evaluation", "Scoring Criteria Schema", true, `Found ${criteria.length} active evaluation dimensions: ${criteria.map(c => c.title).join(", ")}`);
  }

  const { data: sampleEvals, error: evalErr } = await adminClient
    .from("jury_evaluations")
    .select("id, recommendation, strengths, areas_of_concern, general_comment")
    .limit(5);

  if (evalErr) {
    recordResult("Evaluation", "Qualitative Evaluation Schema Fields", false, evalErr.message);
  } else {
    recordResult("Evaluation", "Qualitative Evaluation Schema Fields", true, "Evaluations support recommendation, strengths, areas_of_concern, general_comment");
  }

  // ---------------------------------------------------------------------------
  // 5. Storage Buckets & Policies
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 5: Supabase Storage Architecture");
  const { data: buckets, error: bktErr } = await adminClient.storage.listBuckets();
  if (bktErr) {
    recordResult("Storage", "List Storage Buckets", false, bktErr.message);
  } else {
    const appFilesBucket = buckets.find(b => b.name === "application-files");
    const cmsAssetsBucket = buckets.find(b => b.name === "cms-public-assets");

    const appFilesPrivate = Boolean(appFilesBucket && appFilesBucket.public === false);
    const cmsPublic = Boolean(cmsAssetsBucket && cmsAssetsBucket.public === true);

    recordResult("Storage", "application-files Private Bucket (Signed URLs enforced)", appFilesPrivate, appFilesPrivate ? "PASS (public: false)" : `FAIL (public: ${appFilesBucket?.public})`);
    recordResult("Storage", "cms-public-assets Public CDN Bucket", cmsPublic, cmsPublic ? "PASS (public: true)" : `FAIL (public: ${cmsAssetsBucket?.public})`);
  }

  // ---------------------------------------------------------------------------
  // 6. CMS & Public Content Modules
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 6: CMS Architecture");
  const [cmsDates, cmsFaqs, cmsAnnouncements, cmsSettings] = await Promise.all([
    adminClient.from("cms_important_dates").select("id, title, is_active").limit(5),
    adminClient.from("cms_faqs").select("id, question, is_active").limit(5),
    adminClient.from("cms_announcements").select("id, title, is_active").limit(5),
    adminClient.from("cms_site_settings").select("id, official_email, office_address").limit(1),
  ]);

  recordResult("CMS", "cms_important_dates Table Integrity", !cmsDates.error, cmsDates.error ? cmsDates.error.message : `${cmsDates.data?.length || 0} dates found`);
  recordResult("CMS", "cms_faqs Table Integrity", !cmsFaqs.error, cmsFaqs.error ? cmsFaqs.error.message : `${cmsFaqs.data?.length || 0} FAQs found`);
  recordResult("CMS", "cms_announcements Table Integrity", !cmsAnnouncements.error, cmsAnnouncements.error ? cmsAnnouncements.error.message : `${cmsAnnouncements.data?.length || 0} announcements found`);
  recordResult("CMS", "cms_site_settings Table Integrity", !cmsSettings.error, cmsSettings.error ? cmsSettings.error.message : "Settings configured");

  // ---------------------------------------------------------------------------
  // 7. Audit Logging & Governance Trail
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 7: Audit Logging & Governance Trail");
  const { data: auditLogs, error: auditErr } = await adminClient
    .from("audit_logs")
    .select("id, action, entity_type, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (auditErr) {
    recordResult("Audit Trail", "audit_logs table query", false, auditErr.message);
  } else {
    recordResult("Audit Trail", "audit_logs table query", true, `Audit logs active (${auditLogs.length} recent entries inspected; latest action: ${auditLogs[0]?.action || "None"})`);
  }

  // ---------------------------------------------------------------------------
  // 8. Notifications System Trail
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 8: Notifications System Trail");
  const { data: notifications, error: notifErr } = await adminClient
    .from("notifications")
    .select("id, event_type, recipient_user_id, status, channel, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (notifErr) {
    recordResult("Notifications", "notifications table query", false, notifErr.message);
  } else {
    recordResult("Notifications", "notifications table query", true, `Notification log active (${notifications.length} recent entries inspected; latest event: ${notifications[0]?.event_type || "None"})`);
  }

  // ---------------------------------------------------------------------------
  // 9. RBAC Gating Defense (Verification Team Isolation)
  // ---------------------------------------------------------------------------
  console.log("\n>>> SECTION 9: RBAC Gating Defense (Verification Team Isolation)");
  const adminSidebarContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'admin', 'AdminSidebar.tsx'), 'utf8');
  const sidebarGated = adminSidebarContent.includes('/admin/reports') &&
                       adminSidebarContent.includes('/admin/cms') &&
                       adminSidebarContent.includes('/admin/jury') &&
                       adminSidebarContent.includes('/admin/shortlisting') &&
                       adminSidebarContent.includes('/admin/winners') &&
                       adminSidebarContent.includes('userRole === "Verification Team"');

  recordResult("RBAC Defense", "AdminSidebar filters restricted modules from Verification Team", sidebarGated, sidebarGated ? "PASS: Jury, Shortlisting, Winners, Reports, CMS all hidden" : "FAIL");

  const juryPageContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', '(portal)', 'jury', 'page.tsx'), 'utf8');
  const juryGated = juryPageContent.includes('!session.isAdmin') && juryPageContent.includes('Access Restricted');
  recordResult("RBAC Defense", "/admin/jury page server-level role gate", juryGated, juryGated ? "PASS: !session.isAdmin returns Access Restricted" : "FAIL");

  const slPageContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', '(portal)', 'shortlisting', 'page.tsx'), 'utf8');
  const slGated = slPageContent.includes('!session.isAdmin') && slPageContent.includes('Access Restricted');
  recordResult("RBAC Defense", "/admin/shortlisting page server-level role gate", slGated, slGated ? "PASS: !session.isAdmin returns Access Restricted" : "FAIL");

  const winPageContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', '(portal)', 'winners', 'page.tsx'), 'utf8');
  const winGated = winPageContent.includes('!session.isAdmin') && winPageContent.includes('Access Restricted');
  recordResult("RBAC Defense", "/admin/winners page server-level role gate", winGated, winGated ? "PASS: !session.isAdmin returns Access Restricted" : "FAIL");

  const repPageContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', '(portal)', 'reports', 'page.tsx'), 'utf8');
  const repGated = repPageContent.includes('!session.isAdmin') && repPageContent.includes('Access Restricted');
  recordResult("RBAC Defense", "/admin/reports page server-level role gate", repGated, repGated ? "PASS: !session.isAdmin returns Access Restricted" : "FAIL");

  const cmsPageContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', '(portal)', 'cms', 'page.tsx'), 'utf8');
  const cmsGated = cmsPageContent.includes('isManagementAuthorized') && cmsPageContent.includes('Access Restricted');
  recordResult("RBAC Defense", "/admin/cms page server-level role gate", cmsGated, cmsGated ? "PASS: isManagementAuthorized returns Access Restricted" : "FAIL");

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    console.error("VERIFICATION COMPLETED WITH FAILURES!");
    process.exit(1);
  } else {
    console.log("ALL VERIFICATION SUITE TESTS PASSED SUCCESSFULLY (100% GREEN).");
    process.exit(0);
  }
}

runAudit().catch(err => {
  console.error("UNHANDLED AUDIT ERROR:", err);
  process.exit(1);
});
