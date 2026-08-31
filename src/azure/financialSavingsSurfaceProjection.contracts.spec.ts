import type { FinancialSavingsSurfaceProjectionIdentityPreimageV1, FinancialSavingsSurfaceProjectionV1 } from './financialSavingsSurfaceProjection';
import { createFinancialSavingsSurfaceProjectionIdV1, isFinancialSavingsSurfaceProjectionV1 } from './financialSavingsSurfaceProjectionValidation';
import { AZURE_BILLED_ALL_CHARGES_POLICY_V1 } from './financialChargeComposition';

const availableProjectionIdentity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
  schemaVersion: 1,
  contractVersion: 'financial-savings-surface-projection/v1',
  surface: 'recommendations',
  scope: { kind: 'subscription-full' },
  provider: 'azure',
  providerAccountRefs: ['sub-1'],
  artifactGeneration: { runId: 'run-1', generatedAt: '2026-08-25T00:00:00.000Z' },
  financialAuthorityId: `sha256:${'1'.repeat(64)}`,
  savingsAuthorityId: `sha256:${'2'.repeat(64)}`,
  coordinates: [
    {
      status: 'available',
      coordinateId: `sha256:${'3'.repeat(64)}`,
      periodRole: 'current',
      period: {
        windowKind: 'rolling-30-days',
        requested: { startDate: '2026-07-26', endDateExclusive: '2026-08-25', dateBasis: 'utc' },
        observed: { startDate: '2026-07-26', endDateExclusive: '2026-08-25', dateBasis: 'utc' },
        coverage: [
          {
            coverageId: `sha256:${'4'.repeat(64)}`,
            interval: { startDate: '2026-07-26', endDateExclusive: '2026-08-25', dateBasis: 'utc' },
            settlementState: 'settled',
            evidenceRefIds: [`sha256:${'5'.repeat(64)}`],
          },
        ],
        gaps: [],
      },
      costBasis: 'billed',
      estimateLens: 'actual-plus-estimated',
      chargeInclusionPolicyRef: AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef,
      requestedCurrencyCode: 'AUD',
      currentAggregateBaselineId: `sha256:${'6'.repeat(64)}`,
      currentAggregate: { amount: '100', currencyCode: 'AUD' },
      accountingCurrencyCode: 'AUD',
      minorUnitScale: 2,
      roundingMode: 'half-away-from-zero',
      recommendationContributions: [
        {
          recommendationId: 'rec-1',
          allocationIds: [`sha256:${'7'.repeat(64)}`],
          savingsMinorUnits: 1234,
          allocations: [{ allocationId: `sha256:${'7'.repeat(64)}`, savingsMinorUnits: 1234 }],
        },
      ],
      aggregate: { allocationIds: [`sha256:${'7'.repeat(64)}`], savingsMinorUnits: 1234 },
    },
  ],
};

const availableProjection: FinancialSavingsSurfaceProjectionV1 = {
  ...availableProjectionIdentity,
  projectionId: createFinancialSavingsSurfaceProjectionIdV1(availableProjectionIdentity),
};

const partialProjectionIdentity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
  ...availableProjectionIdentity,
  coordinates: availableProjectionIdentity.coordinates.map(coordinate =>
    coordinate.status === 'available'
      ? { ...coordinate, status: 'partial' as const, unavailableRecommendationIds: ['rec-without-evidence'] }
      : coordinate
  ) as FinancialSavingsSurfaceProjectionIdentityPreimageV1['coordinates'],
};

const partialProjection: FinancialSavingsSurfaceProjectionV1 = {
  ...partialProjectionIdentity,
  projectionId: createFinancialSavingsSurfaceProjectionIdV1(partialProjectionIdentity),
};

const filteredProjectionIdentity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
  ...availableProjectionIdentity,
  scope: {
    kind: 'recommendation-query',
    filterFingerprint: `sha256:${'8'.repeat(64)}`,
    recommendationIds: ['rec-1'],
  },
};

const unavailableProjectionIdentity: FinancialSavingsSurfaceProjectionIdentityPreimageV1 = {
  ...availableProjectionIdentity,
  surface: 'dashboard',
  coordinates: [
    {
      status: 'unavailable',
      coordinateId: `sha256:${'3'.repeat(64)}`,
      periodRole: 'current',
      period: availableProjectionIdentity.coordinates[0].period,
      costBasis: 'billed',
      estimateLens: 'actual-plus-estimated',
      chargeInclusionPolicyRef: availableProjectionIdentity.coordinates[0].chargeInclusionPolicyRef,
      requestedCurrencyCode: 'AUD',
      currentAggregateBaselineId: `sha256:${'6'.repeat(64)}`,
      unavailableReason: 'projection-unavailable',
    },
  ],
};

void filteredProjectionIdentity;
void unavailableProjectionIdentity;
void isFinancialSavingsSurfaceProjectionV1(availableProjection);
void isFinancialSavingsSurfaceProjectionV1(partialProjection);
