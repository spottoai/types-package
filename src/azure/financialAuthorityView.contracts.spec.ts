import type {
  FinancialAuthorityComponentDescriptorV1,
  FinancialAuthorityCoordinateV1,
  FinancialAuthorityResourceProjectionV1,
  FinancialAuthorityViewV1,
  FinancialDisplayRollupV1,
  FinancialEvidenceAssessmentV1,
  FinancialEvidenceBundleV1,
  FinancialScopeBaselineEnvelopeV2,
} from '../index.js';

declare const bundle: FinancialEvidenceBundleV1;
declare const assessment: FinancialEvidenceAssessmentV1;
declare const owner: FinancialScopeBaselineEnvelopeV2;
declare const residual: FinancialScopeBaselineEnvelopeV2;
declare const aggregate: FinancialScopeBaselineEnvelopeV2;

const componentDescriptor: FinancialAuthorityComponentDescriptorV1 = {
  baselineId: `sha256:${'5'.repeat(64)}`,
  componentId: `sha256:${'6'.repeat(64)}`,
  displayLabel: 'D11 v2',
  displayLabelSource: 'meter-name',
  serviceName: 'Virtual Machines',
  meterName: 'D11 v2',
  productName: 'Virtual Machines Dv2 Series',
  unitOfMeasure: '1 Hour',
  evidenceRefIds: [`sha256:${'3'.repeat(64)}`],
};

const displayRollup: FinancialDisplayRollupV1 = {
  displayRollupId: `sha256:${'7'.repeat(64)}`,
  displayScopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
  purpose: 'cost-composition',
  additivity: 'non-additive',
  displayLabel: 'Virtual Machines',
  displayLabelSource: 'service-name',
  members: [{ baselineId: componentDescriptor.baselineId, componentId: componentDescriptor.componentId }],
};

const coordinate: FinancialAuthorityCoordinateV1 = {
  coordinateId: `sha256:${'1'.repeat(64)}`,
  periodRole: 'current',
  period: {
    windowKind: 'rolling-30-days',
    requested: { startDate: '2026-07-24', endDateExclusive: '2026-08-23', dateBasis: 'utc' },
    observed: { startDate: '2026-07-24', endDateExclusive: '2026-08-23', dateBasis: 'utc' },
    coverage: [
      {
        coverageId: `sha256:${'2'.repeat(64)}`,
        interval: { startDate: '2026-07-24', endDateExclusive: '2026-08-23', dateBasis: 'utc' },
        settlementState: 'settled',
        evidenceRefIds: [`sha256:${'3'.repeat(64)}`],
      },
    ],
    gaps: [],
  },
  costBasis: 'billed',
  estimateLens: 'actual-only',
  requestedCurrencyCode: 'AUD',
  ownerBaselines: [owner],
  residualBaseline: residual,
  aggregateBaseline: aggregate,
  chargeCompositions: [],
  componentDescriptors: [componentDescriptor],
  displayRollups: [displayRollup],
  projections: [],
};

const authority: FinancialAuthorityViewV1 = {
  schemaVersion: 1,
  contractVersion: 'financial-authority-view/v1',
  authorityId: `sha256:${'4'.repeat(64)}`,
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'],
  artifactGeneration: { runId: 'portal-run-1', generatedAt: '2026-08-23T01:00:00.000Z' },
  billingGenerationId: 'billing-run-1',
  scopeCoverage: [
    {
      resourceType: 'microsoft.compute/virtualmachines',
      financialRole: 'owner',
      scopeIds: ['/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1'],
    },
  ],
  evidenceBundles: [bundle],
  evidenceAssessments: [assessment],
  coordinates: [coordinate],
};

const resourceProjection: FinancialAuthorityResourceProjectionV1 = {
  contractVersion: 'financial-authority-resource-projection/v1',
  authorityId: authority.authorityId,
  provider: 'azure',
  providerAccountRefs: authority.providerAccountRefs,
  artifactGeneration: authority.artifactGeneration,
  billingGenerationId: authority.billingGenerationId,
  resourceType: 'microsoft.future/widgets',
  financialRole: 'unclassified',
  scopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.future/widgets/widget-1',
  evidenceBundles: [bundle],
  evidenceAssessments: [assessment],
  coordinates: [
    {
      coordinateId: coordinate.coordinateId,
      periodRole: coordinate.periodRole,
      period: coordinate.period,
      costBasis: coordinate.costBasis,
      estimateLens: coordinate.estimateLens,
      requestedCurrencyCode: coordinate.requestedCurrencyCode,
      ownerBaseline: owner,
      componentDescriptors: coordinate.componentDescriptors,
      displayRollups: coordinate.displayRollups,
      projections: coordinate.projections,
    },
  ],
};

const managedServiceAuthority: FinancialAuthorityViewV1 = {
  ...authority,
  scopeCoverage: [
    {
      resourceType: 'microsoft.kusto/clusters',
      financialRole: 'owner',
      scopeIds: ['/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.kusto/clusters/adx-1'],
    },
  ],
};

const unclassifiedAuthority: FinancialAuthorityViewV1 = {
  ...authority,
  scopeCoverage: [
    {
      resourceType: 'microsoft.future/widgets',
      financialRole: 'unclassified',
      scopeIds: ['/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.future/widgets/widget-1'],
    },
  ],
};

const invalidAuthority: FinancialAuthorityViewV1 = {
  ...authority,
  scopeCoverage: [
    {
      // @ts-expect-error Resource types are normalized Azure resource-type strings.
      resourceType: 123,
      financialRole: 'owner',
      scopeIds: ['/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1'],
    },
  ],
};

void authority;
void resourceProjection;
void managedServiceAuthority;
void unclassifiedAuthority;
void invalidAuthority;
