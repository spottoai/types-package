import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const packageRoot = process.argv[2] ? resolve(process.argv[2]) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const api = require(resolve(packageRoot, 'dist/index.js'));
assert.equal(typeof api.isAzureReportCommitmentAssessmentBindingsV1, 'function');
assert.equal(typeof api.areAzureReportCommitmentAssessmentBindingsConsistentV1, 'function');
const empty = () => ({
  schemaVersion: 1,
  planningSubjectIndices: [],
  legacySingleSources: [],
  obsoleteCandidates: [],
  reallocationOpportunities: [],
  renewals: [],
  inventory: [],
});
const dependencies = api.createAzureBenefitAssessmentDependenciesV1([]);
const scope = { companyId: 'company', tenantId: 'tenant', subscriptionId: 'sub' };
const projection = binding => ({
  assessmentSourceBindings: binding,
  ...Object.fromEntries(
    ['obsoleteCandidates', 'reallocationOpportunities', 'renewals', 'inventory'].map(key => [
      key,
      {
        totalCount: binding[key].length,
        omittedCount: 0,
        rows: binding[key].map(row => ({
          id: row.id,
          ...(key === 'renewals' ? { commitmentId: binding.legacySingleSources[row.legacySingleSourceIndices[0]]?.id } : {}),
        })),
      },
    ])
  ),
});
const valid = binding => api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, projection(binding));
assert.ok(valid(empty()));
for (const change of [
  b => (b.schemaVersion = 2),
  b => (b.currentPermission = true),
  b => delete b.inventory,
  b => (b.planningSubjectIndices = [-1]),
  b => (b.planningSubjectIndices = [0, 0]),
  b => (b.inventory = [{ id: 'x', subjectIndices: [], legacySingleSourceIndices: [], extra: true }]),
  b => (b.inventory = [{ id: ' x', subjectIndices: [], legacySingleSourceIndices: [] }]),
  b => (b.inventory = [{ id: 'x\u200b', subjectIndices: [], legacySingleSourceIndices: [] }]),
  b => (b.inventory = [{ id: '\ud800', subjectIndices: [], legacySingleSourceIndices: [] }]),
]) {
  const binding = empty();
  change(binding);
  assert.equal(api.isAzureReportCommitmentAssessmentBindingsV1(binding), false);
}
const id = 'local : punctuation / é '.repeat(140) + 'end';
const local = empty();
local.legacySingleSources = [{ id, benefitType: 'reservation', scope: 'Single', subscriptionId: 'sub' }];
local.renewals = [{ id: `renewal:${id}`, subjectIndices: [], legacySingleSourceIndices: [0] }];
assert.ok(Buffer.byteLength(id) > 3000);
assert.ok(valid(local));
for (const change of [
  b => (b.legacySingleSources[0].subscriptionId = 'foreign'),
  b => (b.legacySingleSources[0].id = '/providers/Microsoft.Capacity/reservationOrders/incomplete'),
  b => (b.renewals[0].legacySingleSourceIndices = [1]),
  b => (b.renewals[0].subjectIndices = [0]),
  b => b.renewals.push({ ...b.renewals[0] }),
  b => b.legacySingleSources.push({ id: 'unused', benefitType: 'reservation', scope: 'Single' }),
]) {
  const binding = structuredClone(local);
  change(binding);
  assert.equal(valid(binding), false);
}
const wrong = projection(local);
wrong.renewals.rows[0].commitmentId = 'wrong';
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, wrong), false);
const counts = projection(local);
counts.renewals.totalCount++;
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, counts), false);
const authorityId = api.deriveAzureBenefitAssessmentAuthorityIdV1('https://synthetic.blob.core.windows.net', 'assessments');
const nativeId = index => `/providers/microsoft.capacity/reservationorders/order/reservations/benefit-${String(index).padStart(4, '0')}`;
const nativeDependencies = api.createAzureBenefitAssessmentDependenciesV1(
  [0, 1, 2].map(index => ({ kind: 'unclaimed-single', benefitId: nativeId(index), authorityId }))
);
const native = empty();
native.planningSubjectIndices = [1];
native.reallocationOpportunities = [{ id: 'benefits-reallocation-12345', subjectIndices: [1], legacySingleSourceIndices: [] }];
assert.ok(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(nativeDependencies, scope, projection(native)));
for (const change of [
  b => (b.planningSubjectIndices = [0]),
  b => (b.planningSubjectIndices = [1, 0]),
  b => (b.reallocationOpportunities[0].subjectIndices = [3]),
  b => (b.reallocationOpportunities[0].subjectIndices = [1, 1]),
  b => (b.reallocationOpportunities[0].subjectIndices = [1.5]),
  b => (b.reallocationOpportunities[0].subjectIndices = [Number.MAX_SAFE_INTEGER + 1]),
]) {
  const binding = structuredClone(native);
  change(binding);
  assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(nativeDependencies, scope, projection(binding)), false);
}
const action = empty();
action.inventory = [{ id: nativeId(1), subjectIndices: [], legacySingleSourceIndices: [] }];
const actionProjection = projection(action);
actionProjection.inventory.rows[0].doNotRenewAnnualImpact = {};
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, actionProjection), false);
const reordered = structuredClone(nativeDependencies);
reordered.subjects.reverse();
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(reordered, scope, projection(native)), false);
const duplicateRetained = projection(local);
duplicateRetained.renewals.rows.push({ ...duplicateRetained.renewals.rows[0] });
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, duplicateRetained), false);
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, {}), false);
const rows = empty();
rows.inventory = Array.from({ length: 4096 }, (_, i) => ({
  id: `raw-${String(i).padStart(4, '0')}`,
  subjectIndices: [],
  legacySingleSourceIndices: [],
}));
assert.ok(api.isAzureReportCommitmentAssessmentBindingsV1(rows));
rows.inventory.push({ id: 'raw-last', subjectIndices: [], legacySingleSourceIndices: [] });
assert.equal(api.isAzureReportCommitmentAssessmentBindingsV1(rows), false);
rows.inventory.pop();
const bounded = projection(rows);
bounded.inventory.rows = bounded.inventory.rows.slice(0, 50);
bounded.inventory.omittedCount = 4046;
assert.ok(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, bounded));
bounded.inventory.rows = [];
bounded.inventory.omittedCount = 4096;
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies, scope, bounded), false);
const byteBoundary = empty();
byteBoundary.inventory = [{ id: 'x', subjectIndices: [], legacySingleSourceIndices: [] }];
const overhead = Buffer.byteLength(JSON.stringify({ benefitAssessmentDependencies: dependencies, assessmentSourceBindings: byteBoundary }));
byteBoundary.inventory[0].id = 'x'.repeat(1024 * 1024 - overhead + 1);
assert.equal(Buffer.byteLength(JSON.stringify({ benefitAssessmentDependencies: dependencies, assessmentSourceBindings: byteBoundary })), 1024 * 1024);
assert.ok(valid(byteBoundary));
byteBoundary.inventory[0].id += 'x';
assert.equal(valid(byteBoundary), false);
const unicodeBoundary = empty();
unicodeBoundary.inventory = [{ id: 'é'.repeat(600000), subjectIndices: [], legacySingleSourceIndices: [] }];
assert.equal(api.isAzureReportCommitmentAssessmentBindingsV1(unicodeBoundary), false);
const sourceBoundary = empty();
sourceBoundary.planningSubjectIndices = Array.from({ length: 4096 }, (_, i) => i);
const allSources = api.createAzureBenefitAssessmentDependenciesV1(
  sourceBoundary.planningSubjectIndices.map(i => ({ kind: 'unclaimed-single', benefitId: nativeId(i), authorityId }))
);
assert.ok(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(allSources, scope, projection(sourceBoundary)));
sourceBoundary.legacySingleSources = [{ id: 'local', benefitType: 'reservation', scope: 'Single' }];
sourceBoundary.obsoleteCandidates = [{ id: 'underutilized:local', subjectIndices: [], legacySingleSourceIndices: [0] }];
assert.equal(api.areAzureReportCommitmentAssessmentBindingsConsistentV1(allSources, scope, projection(sourceBoundary)), false);
const large = empty();
large.inventory = [{ id: 'x'.repeat(1024 * 1024), subjectIndices: [], legacySingleSourceIndices: [] }];
assert.equal(api.isAzureReportCommitmentAssessmentBindingsV1(large), false);
for (const surface of [
  require(resolve(packageRoot, 'dist/azure/recommendations.js')),
  await import(pathToFileURL(resolve(packageRoot, 'dist/esm/entries/root.js'))),
  await import(pathToFileURL(resolve(packageRoot, 'dist/esm/entries/recommendations.js'))),
])
  assert.ok(surface.isAzureReportCommitmentAssessmentBindingsV1(empty()));
console.log('Report assessment binding contracts passed.');
