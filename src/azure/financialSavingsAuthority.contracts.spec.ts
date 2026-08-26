import type { FinancialSavingsAuthorityV1, FinancialSavingsDenominatorIdentityPreimageV1 } from '../index.js';

const unavailableAuthority: FinancialSavingsAuthorityV1 = {
  schemaVersion: 1,
  contractVersion: 'financial-savings-authority/v1',
  savingsAuthorityId: `sha256:${'1'.repeat(64)}`,
  financialAuthorityId: `sha256:${'2'.repeat(64)}`,
  artifactGeneration: { runId: 'portal-run-1', generatedAt: '2026-08-24T00:00:00.000Z' },
  eligibilityBaselines: [],
  eligibilityAssessments: [],
  coordinates: [
    {
      status: 'unavailable',
      coordinateId: `sha256:${'3'.repeat(64)}`,
      currentAggregateBaselineId: `sha256:${'4'.repeat(64)}`,
      unavailableReason: 'unmigrated-scenario-producer',
    },
  ],
};

const availableAuthority: FinancialSavingsAuthorityV1 = {
  ...unavailableAuthority,
  coordinates: [
    {
      status: 'available',
      coordinateId: `sha256:${'3'.repeat(64)}`,
      currentAggregateBaselineId: `sha256:${'4'.repeat(64)}`,
      accountingCurrencyCode: 'AUD',
      minorUnitScale: 2,
      roundingMode: 'half-away-from-zero',
      scenarioCoverage: {
        status: 'complete',
        evidenceRefId: `sha256:${'a'.repeat(64)}`,
        scenarioIds: ['recommendation-1'],
      },
      activations: [
        {
          activationId: `sha256:${'5'.repeat(64)}`,
          recommendationId: 'recommendation-1',
          projectionId: `sha256:${'6'.repeat(64)}`,
          lifecycleState: 'Active',
          lifecycleVersion: '2026-08-24T00:00:00.000Z',
          lifecycleEvidenceRefId: `sha256:${'b'.repeat(64)}`,
          result: 'included',
          reason: 'active',
          evaluatedAt: '2026-08-24T00:00:00.000Z',
          policyVersion: 'financial-savings-activation/v1',
        },
      ],
      allocations: [
        {
          allocationId: `sha256:${'7'.repeat(64)}`,
          ownerScopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
          billableComponentIds: [`sha256:${'8'.repeat(64)}`],
          recommendationId: 'recommendation-1',
          baselineId: `sha256:${'9'.repeat(64)}`,
          projectionId: `sha256:${'6'.repeat(64)}`,
          denominatorId: `sha256:${'c'.repeat(64)}`,
          eligibility: { kind: 'not-applicable' },
          activationId: `sha256:${'5'.repeat(64)}`,
          savingsMinorUnits: 1234,
        },
      ],
      resourceContributions: [
        {
          ownerScopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
          allocationIds: [`sha256:${'7'.repeat(64)}`],
          savingsMinorUnits: 1234,
        },
      ],
      aggregate: { allocationIds: [`sha256:${'7'.repeat(64)}`], savingsMinorUnits: 1234 },
    },
  ],
};

const invalidAuthority: FinancialSavingsAuthorityV1 = {
  ...unavailableAuthority,
  coordinates: [
    {
      status: 'unavailable',
      coordinateId: `sha256:${'3'.repeat(64)}`,
      // @ts-expect-error unavailable savings cannot manufacture an amount.
      savingsMinorUnits: 0,
      unavailableReason: 'unmigrated-scenario-producer',
    },
  ],
};

void unavailableAuthority;
void availableAuthority;
void invalidAuthority;

const denominatorIdentity: FinancialSavingsDenominatorIdentityPreimageV1 = {
  kind: 'projection-affected-current',
  baselineId: `sha256:${'9'.repeat(64)}`,
  componentIds: [`sha256:${'8'.repeat(64)}`],
  amount: '12.34',
  currencyCode: 'AUD',
};
void denominatorIdentity;
