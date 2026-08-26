import {
  FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2,
  FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2,
  type AvailableAggregateFinancialScopeBaselineV2,
  type AvailableOwnerFinancialScopeBaselineV2,
  type FinancialEvidenceAssessmentV1,
  type FinancialEvidenceBundleV1,
  type FinancialScopeBaselineEnvelopeV2,
  type UnavailableFinancialScopeBaselineV2,
} from '../index.js';

const billingReference = {
  evidenceRefId: `sha256:${'1'.repeat(64)}`,
  role: 'billing',
  sourceKind: 'azure-cost-details-v1',
  generationId: 'billing-generation-1',
  digestAlgorithm: 'sha256',
  evidenceDigest: `sha256:${'2'.repeat(64)}`,
  intrinsicTime: { kind: 'observed-at', at: '2026-08-23T00:00:00.000Z' },
  effectivePeriod: {
    startDate: '2026-07-24',
    endDateExclusive: '2026-08-23',
    dateBasis: 'utc',
  },
} as const;

const evidenceBundle: FinancialEvidenceBundleV1 = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-bundle/v1',
  bundleId: `sha256:${'3'.repeat(64)}`,
  references: [billingReference],
};

const assessment: FinancialEvidenceAssessmentV1 = {
  schemaVersion: 1,
  contractVersion: 'financial-evidence-assessment/v1',
  assessmentId: `sha256:${'4'.repeat(64)}`,
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
      evidenceRefId: billingReference.evidenceRefId,
    },
  ],
  completeness: 'complete',
  reconciliation: 'reconciled',
  freshness: 'current',
  result: 'available',
  primaryReason: 'evidence-accepted',
  supportingReasons: [],
  evidenceBundleId: evidenceBundle.bundleId,
  summary: { requestedRoleCount: 1, producedRoleCount: 1, matchedRoleCount: 1 },
};

const requestIdentity = {
  schemaVersion: FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2,
  contractVersion: FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2,
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'] as [string],
  scopeKind: 'canonical-resource-owner',
  scopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
  period: {
    windowKind: 'rolling-30-days',
    requested: billingReference.effectivePeriod,
    observed: billingReference.effectivePeriod,
    coverage: [
      {
        coverageId: `sha256:${'5'.repeat(64)}`,
        interval: billingReference.effectivePeriod,
        settlementState: 'settled',
        evidenceRefIds: [billingReference.evidenceRefId] as [string],
      },
    ] as [
      {
        coverageId: string;
        interval: typeof billingReference.effectivePeriod;
        settlementState: 'settled';
        evidenceRefIds: [string];
      },
    ],
    gaps: [] as [],
  },
  costBasis: 'billed',
  estimateLens: 'actual-only',
  assessmentId: assessment.assessmentId,
} as const;

const owner: AvailableOwnerFinancialScopeBaselineV2 = {
  ...requestIdentity,
  status: 'available',
  baselineKind: 'owner',
  baselineId: `sha256:${'6'.repeat(64)}`,
  evidenceBundleId: evidenceBundle.bundleId,
  accountingCurrency: {
    currencyCode: 'AUD',
    sourceCurrencyCode: 'AUD',
    evidenceRefIds: [billingReference.evidenceRefId],
  },
  chargeInclusionPolicyRef: {
    policyId: 'azure-current-cost/v1',
    policyDigest: `sha256:${'7'.repeat(64)}`,
  },
  components: [
    {
      componentId: `sha256:${'8'.repeat(64)}`,
      billableIdentity: 'azure:compute:vm:payg',
      ownerScopeId: requestIdentity.scopeId,
      chargeClassification: 'usage',
      amount: '600.85',
      evidenceRefIds: [billingReference.evidenceRefId],
      coverageIds: [requestIdentity.period.coverage[0].coverageId],
    },
  ],
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

const aggregate: AvailableAggregateFinancialScopeBaselineV2 = {
  ...requestIdentity,
  scopeKind: 'subscription-aggregate',
  scopeId: 'azure-subscription:sub-1',
  status: 'available',
  baselineKind: 'aggregate',
  baselineId: `sha256:${'9'.repeat(64)}`,
  accountingCurrencyCode: 'AUD',
  memberBaselineIds: [owner.baselineId],
  compatibility: {
    period: 'compatible',
    costBasis: 'compatible',
    estimateLens: 'compatible',
    accountingCurrency: 'compatible',
    membership: 'non-overlapping',
  },
  total: { amount: '600.85', currencyCode: 'AUD' },
  reconciliation: { status: 'reconciled', memberTotal: '600.85', residualTotal: '0', difference: '0' },
};

const unavailable: UnavailableFinancialScopeBaselineV2 = {
  ...requestIdentity,
  status: 'unavailable',
  unavailableReason: 'basis-unavailable',
  summary: { requestedRoleCount: 1, producedRoleCount: 1, matchedRoleCount: 1 },
};

const unavailableWithoutProducedEvidence: UnavailableFinancialScopeBaselineV2 = {
  ...requestIdentity,
  period: {
    windowKind: 'rolling-30-days',
    requested: billingReference.effectivePeriod,
    coverage: [],
    gaps: [billingReference.effectivePeriod],
  },
  status: 'unavailable',
  unavailableReason: 'evidence-not-produced',
  summary: { requestedRoleCount: 1, producedRoleCount: 0, matchedRoleCount: 0 },
};

const unavailableWhileOwnershipIsUnresolved: UnavailableFinancialScopeBaselineV2 = {
  ...requestIdentity,
  status: 'unavailable',
  unavailableReason: 'ownership-unresolved',
  summary: { requestedRoleCount: 1, producedRoleCount: 0, matchedRoleCount: 0 },
};

const envelopes: FinancialScopeBaselineEnvelopeV2[] = [
  owner,
  aggregate,
  unavailable,
  unavailableWithoutProducedEvidence,
  unavailableWhileOwnershipIsUnresolved,
];

const unavailableWithMoney: UnavailableFinancialScopeBaselineV2 = {
  ...unavailable,
  // @ts-expect-error unavailable current-cost authority cannot carry money.
  total: { amount: '0', currencyCode: 'AUD' },
};

const aggregateWithComponents: AvailableAggregateFinancialScopeBaselineV2 = {
  ...aggregate,
  // @ts-expect-error aggregate baselines reference owners and cannot copy their components.
  components: owner.components,
};

void evidenceBundle;
void assessment;
void envelopes;
void unavailableWithMoney;
void aggregateWithComponents;
