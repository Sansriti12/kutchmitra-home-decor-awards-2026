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
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CURRENT_EDITION_ID = "e2026000-0000-0000-0000-000000002026";

async function runTests() {
  console.log('================================================================');
  console.log('PHASE F: NOTIFICATIONS & EMAIL COMMUNICATION VERIFICATION TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST GROUP 1: Schema & Columns Verification
    // ----------------------------------------------------
    console.log('--- TEST GROUP 1: Schema & Table Columns Verification ---');
    
    // Fetch a user to use as recipient in tests
    const { data: users, error: userErr } = await adminClient
      .from('users')
      .select('id, email, full_name')
      .limit(2);

    assert(!userErr && users && users.length > 0, 'Fetched valid existing user for test dispatch', users ? users[0].email : '');
    const testUser = users[0];

    // Check notifications table select with all new columns
    const { data: sampleRows, error: colErr } = await adminClient
      .from('notifications')
      .select('id, recipient_user_id, channel, event_type, nomination_id, provider, provider_message_id, idempotency_key, is_read, read_at, delivered_at, failed_at, status, error_message')
      .limit(1);

    assert(!colErr, 'Phase F notification columns exist and are queryable', colErr ? colErr.message : 'Columns verified');

    // ----------------------------------------------------
    // TEST GROUP 2: PostgREST Foreign Key Relationship
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 2: Foreign Key & Relationship Query ---');
    const { data: fkCheck, error: fkErr } = await adminClient
      .from('notifications')
      .select(`
        id,
        recipient_user_id,
        recipient_address,
        users:recipient_user_id(id, full_name, email)
      `)
      .limit(1);

    assert(!fkErr, 'PostgREST join between notifications and users succeeds', fkErr ? fkErr.message : 'FK join OK');

    // ----------------------------------------------------
    // TEST GROUP 3: Notification Creation & Delivery Logging
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 3: Notification Dispatch & In-App Creation ---');
    const testIdempotencyKey = `test_phase_f_${Date.now()}`;
    const testNominationId = 'KHA26-TEST-9999';

    const { data: createdEmailNotif, error: createEmailErr } = await adminClient
      .from('notifications')
      .insert({
        recipient_user_id: testUser.id,
        edition_id: CURRENT_EDITION_ID,
        channel: 'email',
        event_type: 'clarification_requested',
        notification_type: 'clarification_requested',
        recipient_address: testUser.email,
        subject: '[ACTION REQUIRED] Additional Details Needed - Kutchmitra Awards 2026',
        body: 'Please provide high-resolution photographs of the completed living room.',
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        idempotency_key: `${testIdempotencyKey}:email`,
        nomination_id: testNominationId,
        provider: 'resend',
        provider_message_id: 'mock_msg_test_123',
        metadata: { test: true },
      })
      .select()
      .single();

    assert(!createEmailErr && createdEmailNotif, 'Created transactional email notification record', createdEmailNotif?.id);

    const { data: createdInAppNotif, error: createInAppErr } = await adminClient
      .from('notifications')
      .insert({
        recipient_user_id: testUser.id,
        edition_id: CURRENT_EDITION_ID,
        channel: 'in_app',
        event_type: 'clarification_requested',
        notification_type: 'clarification_requested',
        recipient_address: testUser.email,
        subject: 'Clarification Requested: KHA26-TEST-9999',
        body: 'The verification team has requested additional clarification.',
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        idempotency_key: `${testIdempotencyKey}:in_app`,
        nomination_id: testNominationId,
        is_read: false,
        metadata: { test: true },
      })
      .select()
      .single();

    assert(!createInAppErr && createdInAppNotif, 'Created in-app notification record with unread state', createdInAppNotif?.id);

    // ----------------------------------------------------
    // TEST GROUP 4: Idempotency Enforcement (Duplicate Prevention)
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 4: Idempotency Duplicate Prevention ---');
    const { data: dupData, error: dupErr } = await adminClient
      .from('notifications')
      .insert({
        recipient_user_id: testUser.id,
        edition_id: CURRENT_EDITION_ID,
        channel: 'email',
        event_type: 'clarification_requested',
        notification_type: 'clarification_requested',
        recipient_address: testUser.email,
        subject: 'DUPLICATE ATTEMPT',
        body: 'This duplicate must fail.',
        status: 'delivered',
        idempotency_key: `${testIdempotencyKey}:email`, // Exact duplicate
      });

    assert(dupErr && (dupErr.code === '23505' || dupErr.message.includes('unique')), 'Idempotency constraint successfully rejects duplicate insertion', dupErr ? dupErr.code : 'No error');

    // ----------------------------------------------------
    // TEST GROUP 5: Read Status & In-App Lifecycle
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 5: In-App Notification Read State ---');
    const { error: readErr } = await adminClient
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', createdInAppNotif.id);

    assert(!readErr, 'Successfully marked in-app notification as read', readErr ? readErr.message : '');

    const { data: verifyRead } = await adminClient
      .from('notifications')
      .select('is_read, read_at')
      .eq('id', createdInAppNotif.id)
      .single();

    assert(verifyRead && verifyRead.is_read === true && verifyRead.read_at !== null, 'Verified notification is_read is true and read_at timestamp is persisted');

    // ----------------------------------------------------
    // TEST GROUP 6: Diagnostic Log Aggregation & Querying
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 6: Diagnostic Audit Log Querying & Stats ---');
    const [totalRes, sentRes, deliveredRes, failedRes, unreadRes] = await Promise.all([
      adminClient.from('notifications').select('id', { count: 'exact', head: true }),
      adminClient.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
      adminClient.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'delivered'),
      adminClient.from('notifications').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
      adminClient.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ]);

    assert(typeof totalRes.count === 'number' && totalRes.count >= 2, 'Total notifications aggregate count query succeeded', `Total: ${totalRes.count}`);
    assert(typeof deliveredRes.count === 'number' && deliveredRes.count >= 2, 'Delivered notifications aggregate count query succeeded', `Delivered: ${deliveredRes.count}`);

    // Test filtered search query
    const { data: searchResults, error: searchErr } = await adminClient
      .from('notifications')
      .select('id, subject, nomination_id, status')
      .eq('nomination_id', testNominationId);

    assert(!searchErr && searchResults && searchResults.length === 2, 'Filtered query by nomination_id returns exact matching records', `Found: ${searchResults ? searchResults.length : 0}`);

    // ----------------------------------------------------
    // TEST GROUP 7: Failed Notification Logging & Retry
    // ----------------------------------------------------
    console.log('\n--- TEST GROUP 7: Failure Isolation & Retry Mechanism ---');
    const { data: failedNotif, error: failInsertErr } = await adminClient
      .from('notifications')
      .insert({
        recipient_user_id: testUser.id,
        edition_id: CURRENT_EDITION_ID,
        channel: 'email',
        event_type: 'nomination_eligible',
        notification_type: 'nomination_eligible',
        recipient_address: testUser.email,
        subject: 'Nomination Verified as Eligible',
        body: 'Your nomination has been verified as eligible.',
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: 'Simulated downstream network timeout (504 Gateway)',
        idempotency_key: `${testIdempotencyKey}:failed_test`,
        nomination_id: testNominationId,
        metadata: { test: true },
      })
      .select()
      .single();

    assert(!failInsertErr && failedNotif, 'Created failed notification audit record with error details', failedNotif?.id);

    // Simulate retry transition
    const { data: retriedNotif, error: retryUpdateErr } = await adminClient
      .from('notifications')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        error_message: null,
        provider: 'resend',
        provider_message_id: 'retry_mock_resend_456',
      })
      .eq('id', failedNotif.id)
      .select()
      .single();

    assert(!retryUpdateErr && retriedNotif && retriedNotif.status === 'delivered', 'Retry update transitions status to delivered and clears error message');

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('\n--- Cleaning up test records ---');
    const { error: cleanErr } = await adminClient
      .from('notifications')
      .delete()
      .eq('nomination_id', testNominationId);

    assert(!cleanErr, 'Test notification records safely cleaned up');

  } catch (err) {
    console.error('Unhandled exception during verification tests:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
