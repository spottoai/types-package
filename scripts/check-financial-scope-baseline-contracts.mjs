import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import {
  canonicalizeFinancialEvidenceBundleIdentityV1,
  canonicalizeFinancialEvidenceAssessmentIdentityV1,
  canonicalizeFinancialScopeBaselineIdentityV2,
  isFinancialEvidenceAssessmentV1,
  isFinancialEvidenceBundleV1,
  isFinancialScopeBaselineEnvelopeV2,
} from '../dist/index.js';
import { isFinancialScopeBaselineEnvelopeV2 as isFinancialScopeBaselineEnvelopeFromAzureEntry } from '../dist/azure/financialScope.js';
import { canonicalizeValidatedFinancialScopeBaselineIdentityV2 } from '../dist/azure/financialScopeBaselineIdentity.js';

const reference = {
  evidenceRefId: `sha256:${'1'.repeat(64)}`,
  role: 'billing',
  sourceKind: 'azure-cost-details-v1',
  generationId: 'billing-generation-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: `sha256:${'2'.repeat(64)}`,
  intrinsicTime: { kind: 'observed-at', at: '2026-08-23T00:00:00.000Z' },
  effectivePeriod: { startDate: '2026-07-24', endDateExclusive: '2026-08-23', dateBasis: 'utc' },
};

const identity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  references: [reference],
};
const bundle = {
  ...identity,
  bundleId: `sha256:${createHash('sha256').update(canonicalizeFinancialEvidenceBundleIdentityV1(identity)).digest('hex')}`,
};

assert.equal(isFinancialEvidenceBundleV1(bundle), true);

const billingCurrencyReference = {
  evidenceRefId: `sha256:${'8'.repeat(64)}`,
  role: 'billing-currency-declaration',
  sourceKind: 'azure-subscription-billing-profile/v1',
  revisionId: 'billing-profile-revision-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: `sha256:${'9'.repeat(64)}`,
  intrinsicTime: { kind: 'published-at', at: '2026-08-01T00:00:00.000Z' },
  effectivePeriod: reference.effectivePeriod,
};
const currencyBundleIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  references: [billingCurrencyReference],
};
const currencyBundle = {
  ...currencyBundleIdentity,
  bundleId: `sha256:${createHash('sha256').update(canonicalizeFinancialEvidenceBundleIdentityV1(currencyBundleIdentity)).digest('hex')}`,
};
assert.equal(isFinancialEvidenceBundleV1(currencyBundle), true, 'Billing-currency declarations are a distinct evidence role.');

const assessmentIdentity = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-assessment/v1',
  policyVersion: 'financial-current-cost/v1',
  evaluatedAt: '2026-08-23T01:00:00.000Z',
  request: {
    provider: 'azure',
    providerAccountRefs: ['azure-subscription:sub-1'],
    scopeKind: 'canonical-resource-owner',
    scopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
    requestedEvidenceRoles: ['billing'],
  },
  roleAssessments: [
    {
      role: 'billing',
      support: 'supported',
      requestState: 'requested',
      productionState: 'produced',
      matchState: 'matched',
      evidenceRefId: reference.evidenceRefId,
    },
  ],
  completeness: 'complete',
  reconciliation: 'reconciled',
  freshness: 'current',
  result: 'available',
  primaryReason: 'evidence-accepted',
  supportingReasons: [],
  evidenceBundleId: bundle.bundleId,
  summary: { requestedRoleCount: 1, producedRoleCount: 1, matchedRoleCount: 1 },
};
const assessment = {
  ...assessmentIdentity,
  assessmentId: `sha256:${createHash('sha256').update(canonicalizeFinancialEvidenceAssessmentIdentityV1(assessmentIdentity)).digest('hex')}`,
};
assert.equal(isFinancialEvidenceAssessmentV1(assessment), true);

const coverageId = `sha256:${'5'.repeat(64)}`;
const ownerIdentity = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scopeKind: 'canonical-resource-owner',
  scopeId: assessment.request.scopeId,
  period: {
    windowKind: 'rolling-30-days',
    requested: reference.effectivePeriod,
    observed: reference.effectivePeriod,
    coverage: [
      {
        coverageId,
        interval: reference.effectivePeriod,
        settlementState: 'settled',
        evidenceRefIds: [reference.evidenceRefId],
      },
    ],
    gaps: [],
  },
  costBasis: 'billed',
  estimateLens: 'actual-only',
  assessmentId: assessment.assessmentId,
  baselineKind: 'owner',
  evidenceBundleId: bundle.bundleId,
  accountingCurrency: {
    currencyCode: 'AUD',
    sourceCurrencyCode: 'AUD',
    evidenceRefIds: [reference.evidenceRefId],
  },
  chargeInclusionPolicyRef: {
    policyId: 'azure-current-cost/v1',
    policyDigest: `sha256:${'7'.repeat(64)}`,
  },
  components: [
    {
      componentId: `sha256:${'8'.repeat(64)}`,
      billableIdentity: 'azure:compute:vm:payg',
      ownerScopeId: assessment.request.scopeId,
      chargeClassification: 'usage',
      amount: '600.85',
      evidenceRefIds: [reference.evidenceRefId],
      coverageIds: [coverageId],
      quantity: { amount: '5', unit: '1 Hour' },
      effectiveRate: { amount: '120.17', unit: '1 Hour', currencyCode: 'AUD' },
    },
  ],
};
const owner = {
  ...ownerIdentity,
  status: 'available',
  baselineId: `sha256:${createHash('sha256').update(canonicalizeFinancialScopeBaselineIdentityV2(ownerIdentity)).digest('hex')}`,
  total: { amount: '600.85', currencyCode: 'AUD' },
  reconciliation: {
    status: 'reconciled',
    componentTotal: '600.85',
    sourceTotal: '600.85',
    withheldTotal: '0',
    residualTotal: '0',
    difference: '0',
  },
};
assert.equal(isFinancialScopeBaselineEnvelopeV2(owner), true);
assert.equal(isFinancialScopeBaselineEnvelopeFromAzureEntry(owner), true);

const aggregateIdentity = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scopeKind: 'subscription-aggregate',
  scopeId: 'azure-subscription:sub-1',
  period: owner.period,
  costBasis: 'billed',
  estimateLens: 'actual-only',
  assessmentId: assessment.assessmentId,
  baselineKind: 'aggregate',
  accountingCurrencyCode: 'AUD',
  memberBaselineIds: [owner.baselineId],
  compatibility: {
    period: 'compatible',
    costBasis: 'compatible',
    estimateLens: 'compatible',
    accountingCurrency: 'compatible',
    membership: 'non-overlapping',
  },
};
const aggregate = {
  ...aggregateIdentity,
  status: 'available',
  baselineId: `sha256:${createHash('sha256').update(canonicalizeFinancialScopeBaselineIdentityV2(aggregateIdentity)).digest('hex')}`,
  total: { amount: '600.85', currencyCode: 'AUD' },
  reconciliation: { status: 'reconciled', memberTotal: '600.85', residualTotal: '0', difference: '0' },
};
assert.equal(isFinancialScopeBaselineEnvelopeV2(aggregate), true);

const unavailable = {
  schemaVersion: 2,
  contractVersion: 'financial-scope-baseline/v2',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  scopeKind: 'canonical-resource-owner',
  scopeId: assessment.request.scopeId,
  period: owner.period,
  costBasis: 'amortized',
  estimateLens: 'actual-only',
  assessmentId: assessment.assessmentId,
  status: 'unavailable',
  unavailableReason: 'basis-unavailable',
  summary: { requestedRoleCount: 1, producedRoleCount: 1, matchedRoleCount: 1 },
};
assert.equal(isFinancialScopeBaselineEnvelopeV2(unavailable), true);

const unavailableWithoutProducedEvidence = {
  ...unavailable,
  period: {
    windowKind: 'rolling-30-days',
    requested: reference.effectivePeriod,
    coverage: [],
    gaps: [reference.effectivePeriod],
  },
  unavailableReason: 'evidence-not-produced',
  summary: { requestedRoleCount: 1, producedRoleCount: 0, matchedRoleCount: 0 },
};
assert.equal(
  isFinancialScopeBaselineEnvelopeV2(unavailableWithoutProducedEvidence),
  true,
  'Unavailable baseline can represent a requested period for which no evidence was produced.'
);

const reordered = structuredClone(identity);
reordered.references.push({ ...reference, evidenceRefId: `sha256:${'3'.repeat(64)}`, generationId: 'billing-generation-2' });
const reversed = structuredClone(reordered);
reversed.references.reverse();
assert.equal(
  canonicalizeFinancialEvidenceBundleIdentityV1(reordered),
  canonicalizeFinancialEvidenceBundleIdentityV1(reversed),
  'Evidence bundle identity must not depend on input order.'
);

const reject = (mutate, label) => {
  const candidate = structuredClone(bundle);
  mutate(candidate);
  assert.equal(isFinancialEvidenceBundleV1(candidate), false, label);
};

reject(value => {
  value.bundleId = `sha256:${'f'.repeat(64)}`;
}, 'A forged bundle ID must fail closed.');
reject(value => {
  value.references.push(structuredClone(value.references[0]));
}, 'Duplicate evidence identities must fail closed.');
reject(value => {
  delete value.references[0].generationId;
}, 'Evidence without a generation or revision must fail closed.');
reject(value => {
  value.references[0].revisionId = 'revision-1';
}, 'Evidence cannot declare both generation and revision identities.');
reject(value => {
  value.references[0].evidenceDigest = 'not-a-digest';
}, 'Malformed evidence digests must fail closed.');
reject(value => {
  value.references[0].effectivePeriod.endDateExclusive = value.references[0].effectivePeriod.startDate;
}, 'Empty evidence periods must fail closed.');
reject(value => {
  value.internalPath = '/azure-raw/customer/file.json';
}, 'Undeclared physical path fields must fail closed.');

const rejectAssessment = (mutate, label) => {
  const candidate = structuredClone(assessment);
  mutate(candidate);
  assert.equal(isFinancialEvidenceAssessmentV1(candidate), false, label);
};
rejectAssessment(value => {
  value.assessmentId = `sha256:${'f'.repeat(64)}`;
}, 'A forged assessment ID must fail closed.');
rejectAssessment(value => {
  value.roleAssessments[0].productionState = 'not-produced';
}, 'Not-produced evidence cannot retain a reference or available assessment.');
rejectAssessment(value => {
  delete value.evidenceBundleId;
}, 'An available assessment requires its consumed evidence bundle.');
rejectAssessment(value => {
  value.internalPath = '/azure-raw/customer/file.json';
}, 'Undeclared assessment fields must fail closed.');

const rejectOwner = (mutate, label) => {
  const candidate = structuredClone(owner);
  mutate(candidate);
  assert.equal(isFinancialScopeBaselineEnvelopeV2(candidate), false, label);
};
const resignOwnerIdentity = value => {
  const { status: _status, baselineId: _baselineId, total: _total, reconciliation: _reconciliation, ...identity } = value;
  value.baselineId = `sha256:${createHash('sha256').update(canonicalizeValidatedFinancialScopeBaselineIdentityV2(identity)).digest('hex')}`;
};
rejectOwner(value => {
  value.baselineId = `sha256:${'f'.repeat(64)}`;
}, 'A forged owner baseline ID must fail closed.');
rejectOwner(value => {
  value.components[0].ownerScopeId = '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-2';
}, 'A component cannot be owned by another scope.');
rejectOwner(value => {
  value.components[0].coverageIds[0] = `sha256:${'a'.repeat(64)}`;
}, 'Every component coverage reference must resolve inside the baseline period.');
rejectOwner(value => {
  value.total.amount = '999';
}, 'Owner total must equal the exact component sum.');
rejectOwner(value => {
  value.accountingCurrency.currencyCode = 'USD';
}, 'Accounting currency must match all canonical money.');
rejectOwner(value => {
  value.components[0].effectiveRate.amount = '120.18';
  resignOwnerIdentity(value);
}, 'Effective rate must exactly replay the accepted component amount from quantity.');
rejectOwner(value => {
  value.components[0].effectiveRate.unit = 'GB';
  resignOwnerIdentity(value);
}, 'Effective rate and quantity units must match.');
rejectOwner(value => {
  value.components[0].effectiveRate.currencyCode = 'USD';
  resignOwnerIdentity(value);
}, 'Effective rate currency must match the baseline accounting currency.');
rejectOwner(value => {
  delete value.components[0].quantity;
  resignOwnerIdentity(value);
}, 'Effective rate cannot exist without its exact source quantity.');
rejectOwner(value => {
  value.components[0].chargeClassification = 'credit';
  resignOwnerIdentity(value);
}, 'Credit quantities cannot masquerade as a reusable usage effective rate.');
rejectOwner(value => {
  value.savings = '10';
}, 'Undeclared scenario money is forbidden in a current-cost baseline.');

const rejectAggregate = (mutate, label) => {
  const candidate = structuredClone(aggregate);
  mutate(candidate);
  assert.equal(isFinancialScopeBaselineEnvelopeV2(candidate), false, label);
};
rejectAggregate(value => {
  value.memberBaselineIds.push(value.memberBaselineIds[0]);
}, 'Aggregate membership must be distinct.');
rejectAggregate(value => {
  value.total.amount = '0';
}, 'Aggregate total must reconcile to the declared member total and residual.');

const unavailableWithMoney = { ...structuredClone(unavailable), total: { amount: '0', currencyCode: 'AUD' } };
assert.equal(isFinancialScopeBaselineEnvelopeV2(unavailableWithMoney), false, 'Unavailable baseline cannot carry money.');

console.log('Financial scope baseline evidence contracts passed.');
