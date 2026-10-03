import { RecommendationCategory } from '../index.js';
import type {
  CanonicalSavingsAllocationV2,
  CanonicalSavingsLedgerV2,
  PortfolioSavingsContributionV2,
  RecommendationSavingsUnavailableReason,
  RecommendationWithResources,
  SavingsAggregateSetV2,
  SavingsAggregateV2,
  ScenarioSavingsPotentialV2,
} from '../index.js';

const scenario: ScenarioSavingsPotentialV2 = {
  semantics: 'standalone-scenario',
  combinationPolicy: 'exclusive',
  combinationGroupId: 'mysql-rightsize',
  range: {
    currency: 'NZD',
    minorUnitScale: 2,
    currentMonthlyMinorUnits: 6534,
    minSavingsMinorUnits: 582,
    maxSavingsMinorUnits: 582,
  },
};

const allocation: CanonicalSavingsAllocationV2 = {
  allocationId: 'owner-component:app-service-plan-1:compute',
  aggregationPolicy: 'owner-component',
  ownerResourceId: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Web/serverfarms/plan-1',
  billableComponentKey: 'compute',
  attributedRecommendationId: 'app-service-plan-rightsize',
  scenarioRecommendationIds: ['app-service-plan-rightsize', 'mysql-rightsize'],
  range: {
    currency: 'NZD',
    minorUnitScale: 2,
    currentMonthlyMinorUnits: 1746,
    minSavingsMinorUnits: 1746,
    maxSavingsMinorUnits: 1746,
  },
  provenance: {
    source: 'recommendation-savings-manager',
    evidenceIds: ['billing-fingerprint-1'],
    stableSavingsBasis: true,
    spendBasis: 'billed',
    usageWindow: { startDateInclusive: '2026-09-03', endDateInclusive: '2026-10-02', dayCount: 30 },
  },
};

const contribution: PortfolioSavingsContributionV2 = {
  semantics: 'portfolio-contribution',
  allocationIds: [allocation.allocationId],
  range: allocation.range,
};

const aggregate: SavingsAggregateV2 = {
  contractVersion: 'savings/v2',
  generationId: 'sub-1:run-1',
  scopeKey: 'azure:sub-1:subscription-full:all',
  scope: {
    kind: 'subscription-full',
    providerName: 'azure',
    providerScopeId: 'sub-1',
    filterFingerprint: 'all',
  },
  allocationCount: 1,
  totals: allocation.range,
};

const ledger: CanonicalSavingsLedgerV2 = {
  contractVersion: 'savings/v2',
  generationId: aggregate.generationId,
  generatedAt: '2026-08-19T00:00:00.000Z',
  providerName: 'azure',
  providerScopeId: 'sub-1',
  allocations: [allocation],
  aggregate,
};

const aggregateSet: SavingsAggregateSetV2 = {
  contractVersion: 'savings/v2',
  aggregates: [
    aggregate,
    {
      ...aggregate,
      generationId: 'sub-2:run-1',
      scopeKey: 'azure:sub-2:resource-query:production',
      scope: {
        kind: 'resource-query',
        providerName: 'azure',
        providerScopeId: 'sub-2',
        filterFingerprint: 'production',
      },
      totals: { ...aggregate.totals, currency: 'USD' },
    },
  ],
};

const invalidContribution: PortfolioSavingsContributionV2 = {
  // @ts-expect-error Standalone scenarios cannot be substituted for additive contributions.
  semantics: scenario.semantics,
  allocationIds: [],
  range: scenario.range,
};

const invalidScope: SavingsAggregateV2 = {
  ...aggregate,
  scope: {
    ...aggregate.scope,
    // @ts-expect-error Aggregates support only the declared complete scope kinds.
    kind: 'visible-page',
  },
};

const missingGeneration: SavingsAggregateV2 = {
  // @ts-expect-error Producer generation identity is mandatory.
  generationId: undefined,
  contractVersion: 'savings/v2',
  scopeKey: aggregate.scopeKey,
  scope: aggregate.scope,
  allocationCount: 0,
  totals: aggregate.totals,
};

/** AWS producers use the same shape; the scope key keeps the provider-prefixed format. */
const awsAggregate: SavingsAggregateV2 = {
  ...aggregate,
  generationId: '123456789012:run-1',
  scopeKey: 'aws:123456789012:subscription-full:all',
  scope: { kind: 'subscription-full', providerName: 'aws', providerScopeId: '123456789012', filterFingerprint: 'all' },
};
const awsLedger: CanonicalSavingsLedgerV2 = { ...ledger, providerName: 'aws', providerScopeId: '123456789012', aggregate: awsAggregate };
const unknownProvider: SavingsAggregateV2 = {
  ...aggregate,
  scope: {
    ...aggregate.scope,
    // @ts-expect-error Only declared providers can own a savings scope.
    providerName: 'gcp',
  },
};

void awsLedger;
void unknownProvider;
void contribution;
void aggregateSet;
void ledger;
void invalidContribution;
void invalidScope;
void missingGeneration;

const withheldRecommendation: RecommendationWithResources = {
  recommendation: { id: 'aws-snapshot-review', name: 'Review snapshot retention', category: RecommendationCategory.Cost, impact: 'Low' },
  resources: [],
  savingsUnavailableReason: 'below-minimum-spend',
};
// @ts-expect-error Absence reasons are declared producer states, not arbitrary text.
const invalidAbsenceReason: RecommendationSavingsUnavailableReason = 'assume-zero';
void withheldRecommendation;
void invalidAbsenceReason;

const incompatibleBasisReason: RecommendationSavingsUnavailableReason = 'incompatible-cost-basis';
const invalidSpendBasis: CanonicalSavingsAllocationV2['provenance'] = {
  source: 'aws-native-recommendation',
  stableSavingsBasis: false,
  // @ts-expect-error The captured owner cap must name its billing basis, not a pricing authority.
  spendBasis: 'source-native',
};
void incompatibleBasisReason;
void invalidSpendBasis;
