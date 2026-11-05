const path = require('path');
const { matchApprovedJuryProfile, APPROVED_JURY_PROFILES } = require(path.join(process.cwd(), 'src/lib/data/jury-profiles.ts'));

console.log('=== TEST 1: APPROVED PROFILE MATCHER ===');
const testCases = [
  {
    input: { fullName: 'ID. Hasmukh Shah', organization: 'ADL Group', email: 'hs.adlgroup@gmail.com' },
    expectedId: 'hasmukh-shah',
    label: 'ID. Hasmukh Shah'
  },
  {
    input: { fullName: 'Ar. Parul Zaveri', organization: 'Abhikram', email: 'kanineeka@gmail.com' },
    expectedId: 'parul-zaveri',
    label: 'Ar. Parul Zaveri'
  },
  {
    input: { fullName: 'Ar. Hiren Patel', organization: 'HPAD', email: 'hiren@hpad.co.in' },
    expectedId: 'hiren-patel',
    label: 'Ar. Hiren Patel'
  },
  {
    input: { fullName: 'Ar. Sarosh Wadia', organization: 'Azmi & Sarosh Wadia', email: 'ar.saroshazmi@gmail.com' },
    expectedId: 'sarosh-wadia',
    label: 'Ar. Sarosh Wadia'
  },
  {
    input: { fullName: 'Ar. Kirit Mehta', organization: 'Kutch School of Vernacular Design', email: 'juror.phase.d.test@kutchmitra.com' },
    expectedId: null,
    label: 'Ar. Kirit Mehta (Dummy/Test Juror)'
  },
  {
    input: { fullName: 'sansritidubey49+admin', organization: 'Grand Jury Panel', email: 'sansritidubey49+admin@gmail.com' },
    expectedId: null,
    label: 'Admin test account'
  },
  {
    input: { fullName: 'Phase D Test Juror', organization: 'Kutchmitra Phase D Testing', email: 'jury.test.2026@kutchmitra.com' },
    expectedId: null,
    label: 'Phase D Test Juror'
  }
];

let allPassed = true;
testCases.forEach(tc => {
  const matched = matchApprovedJuryProfile(tc.input);
  const matchedId = matched ? matched.id : null;
  const passed = matchedId === tc.expectedId;
  if (!passed) allPassed = false;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.label} -> Matched ID: ${matchedId} (Expected: ${tc.expectedId})`);
  if (matched) {
    console.log(`       Photo: ${matched.image}, City: ${matched.city}`);
  }
});

console.log('\n=== TEST 2: STATISTIC CALCULATION RULES ===');
const mockAssignments = [
  // 1. Pending (not started, no draft, not recused)
  { id: '1', status: 'assigned', conflictDeclared: false, evaluation: null },
  // 2. In Progress (draft saved, not locked, not recused)
  { id: '2', status: 'assigned', conflictDeclared: false, evaluation: { status: 'draft', isLocked: false } },
  // 3. Completed & Locked
  { id: '3', status: 'completed', conflictDeclared: false, evaluation: { status: 'submitted', isLocked: true } },
  // 4. Recused / Conflict declared
  { id: '4', status: 'assigned', conflictDeclared: true, evaluation: null },
  // 5. In Progress draft 2
  { id: '5', status: 'assigned', conflictDeclared: false, evaluation: { status: 'draft', isLocked: false } },
];

const totalAssigned = mockAssignments.length;
const completedCount = mockAssignments.filter(
  (a) => !a.conflictDeclared && (a.status === 'completed' || Boolean(a.evaluation?.isLocked))
).length;
const conflictCount = mockAssignments.filter((a) => a.conflictDeclared).length;
const inProgressCount = mockAssignments.filter(
  (a) =>
    !a.conflictDeclared &&
    !a.evaluation?.isLocked &&
    a.status !== 'completed' &&
    a.evaluation?.status === 'draft'
).length;
const pendingCount = mockAssignments.filter(
  (a) =>
    !a.conflictDeclared &&
    a.status !== 'completed' &&
    !a.evaluation?.isLocked &&
    a.evaluation?.status !== 'draft'
).length;

console.log('Total assigned:', totalAssigned);
console.log('Pending count:', pendingCount, '(Expected: 1)');
console.log('In-progress count:', inProgressCount, '(Expected: 2)');
console.log('Completed count:', completedCount, '(Expected: 1)');
console.log('Conflict count:', conflictCount, '(Expected: 1)');

const sumAll = pendingCount + inProgressCount + completedCount + conflictCount;
console.log('Sum of all categories:', sumAll, 'Matches total:', sumAll === totalAssigned);

if (!allPassed || sumAll !== totalAssigned || pendingCount !== 1 || inProgressCount !== 2 || completedCount !== 1 || conflictCount !== 1) {
  console.error('FAILED TEST CHECKS');
  process.exit(1);
} else {
  console.log('\nALL VERIFICATION CHECKS PASSED PERFECTLY!');
}
