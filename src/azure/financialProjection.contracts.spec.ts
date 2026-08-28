import type { AvailableFinancialProjectionV1, FinancialProjectionEnvelopeV1, UnavailableFinancialProjectionV1 } from '../index.js';

const common = {
  schemaVersion: 1,
  contractVersion: 'financial-projection/v1',
  provider: 'azure',
  providerAccountRefs: ['azure-subscription:sub-1'] as [string],
  scopeId: '/subscriptions/sub-1/resourcegroups/rg/providers/microsoft.compute/virtualmachines/vm-1',
  scenarioId: 'vm-alternative:d2as-v5',
  operationKind: 'replace-rate',
  baselineCostBasis: 'billed',
  baselineEstimateLens: 'actual-only',
  targetCostBasis: 'billed',
  targetProvenance: 'retail-derived',
  targetPeriodConvention: 'same-observed-quantity',
  affectedComponentIds: [`sha256:${'1'.repeat(64)}`] as [string],
  accountingCurrencyCode: 'AUD',
  targetEvidenceBundleId: `sha256:${'2'.repeat(64)}`,
  targetAssessmentId: `sha256:${'3'.repeat(64)}`,
} as const;

const available: AvailableFinancialProjectionV1 = {
  ...common,
  status: 'available',
  baselineId: `sha256:${'4'.repeat(64)}`,
  appliedComponentTargets: [
    {
      componentId: common.affectedComponentIds[0],
      targetAmount: '50',
      targetConfigurationId: 'azure-vm-sku:standard-d2as-v5',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`] as [string],
      sourceQuantity: { amount: '100', unit: 'hour' },
      targetRate: { amount: '0.5', currencyCode: 'AUD', quantityUnit: 'hour' },
    },
  ],
  projectionId: `sha256:${'5'.repeat(64)}`,
  current: { total: '100', affected: '80', unchanged: '20' },
  target: { total: '70', affected: '50', unchanged: '20' },
  change: { delta: '-30', savings: '30', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};

const unavailable: UnavailableFinancialProjectionV1 = {
  ...common,
  status: 'unavailable',
  unavailableReason: 'quantity-unavailable',
};

const commitment: AvailableFinancialProjectionV1 = {
  ...common,
  scenarioId: 'reservation:one-year:d11-v2',
  operationKind: 'commitment-coverage',
  targetProvenance: 'provider-quote-derived',
  targetPeriodConvention: 'normalized-average-month',
  targetPeriodProfile: {
    kind: 'normalized-average-month',
    annualDayCount: 365,
    monthDivisor: 12,
    hoursPerDay: 24,
    normalizedHours: '730',
  },
  status: 'available',
  baselineId: `sha256:${'4'.repeat(64)}`,
  appliedComponentTargets: [
    {
      componentId: common.affectedComponentIds[0],
      targetAmount: '492',
      targetConfigurationId: 'azure-reservation:d11-v2:one-year',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`] as [string],
      commitmentCoverage: {
        instrumentKind: 'reservation',
        productId: 'azure-reservation:d11-v2:one-year',
        quote: { kind: 'whole-term', amount: '2400', currencyCode: 'AUD', termMonths: 12, termDayCount: 365 },
        purchaseQuantity: '1',
        eligibleQuantity: { amount: '1460', unit: 'hour' },
        existingCoveredQuantity: { amount: '0', unit: 'hour' },
        coveredQuantity: { amount: '730', unit: 'hour' },
        commitmentCharge: { amount: '200', currencyCode: 'AUD' },
        uncoveredQuantity: { amount: '730', unit: 'hour' },
        uncoveredRate: { amount: '0.4', currencyCode: 'AUD', quantityUnit: 'hour' },
        uncoveredRemainderRule: 'billing-derived-effective-rate',
        effectivePeriod: { startDate: '2026-04-01', endDateExclusive: '2027-04-01', dateBasis: 'billing-calendar' },
      },
    },
  ],
  projectionId: `sha256:${'7'.repeat(64)}`,
  current: { total: '584', affected: '584', unchanged: '0' },
  target: { total: '492', affected: '492', unchanged: '0' },
  change: { delta: '-92', savings: '92', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};

const configurationRemoval: AvailableFinancialProjectionV1 = {
  ...common,
  scenarioId: 'licence:remove-windows',
  operationKind: 'remove-component',
  targetProvenance: 'configuration-derived',
  status: 'available',
  baselineId: `sha256:${'4'.repeat(64)}`,
  appliedComponentTargets: [
    {
      componentId: common.affectedComponentIds[0],
      targetAmount: '0',
      targetConfigurationId: 'azure-vm-os:linux',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`] as [string],
      configurationTransformation: {
        kind: 'remove-component',
        targetQuantity: { amount: '0', unit: 'hour' },
        ruleEvidenceRefId: `sha256:${'6'.repeat(64)}`,
      },
    },
  ],
  projectionId: `sha256:${'8'.repeat(64)}`,
  current: { total: '40', affected: '40', unchanged: '0' },
  target: { total: '0', affected: '0', unchanged: '0' },
  change: { delta: '-40', savings: '40', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};

const quantityAndRate: AvailableFinancialProjectionV1 = {
  ...common,
  scenarioId: 'storage:cool-tier',
  operationKind: 'replace-quantity-and-rate',
  status: 'available',
  baselineId: `sha256:${'4'.repeat(64)}`,
  appliedComponentTargets: [
    {
      componentId: common.affectedComponentIds[0],
      targetAmount: '36',
      targetConfigurationId: 'azure-storage-tier:cool',
      targetEvidenceRefIds: [`sha256:${'6'.repeat(64)}`] as [string],
      targetQuantity: { amount: '120', unit: 'gb-month' },
      targetRate: { amount: '0.3', currencyCode: 'AUD', quantityUnit: 'gb-month' },
    },
  ],
  projectionId: `sha256:${'9'.repeat(64)}`,
  current: { total: '60', affected: '60', unchanged: '0' },
  target: { total: '36', affected: '36', unchanged: '0' },
  change: { delta: '-24', savings: '24', increase: '0' },
  reconciliation: { status: 'reconciled', difference: '0' },
};

const invalidUnavailable: UnavailableFinancialProjectionV1 = {
  ...unavailable,
  // @ts-expect-error unavailable projection cannot publish partial money.
  change: { delta: '0', savings: '0', increase: '0' },
};

const invalidUnavailableTargetVector: UnavailableFinancialProjectionV1 = {
  ...unavailable,
  // @ts-expect-error unavailable projection cannot publish a partial applied target vector.
  appliedComponentTargets: available.appliedComponentTargets,
};

const envelopes: FinancialProjectionEnvelopeV1[] = [available, unavailable, commitment, configurationRemoval, quantityAndRate];
void invalidUnavailable;
void invalidUnavailableTargetVector;
void envelopes;
