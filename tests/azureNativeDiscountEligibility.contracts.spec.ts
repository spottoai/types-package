import type {
  AzureFinancialChargeCoverageV1,
  AzureFinancialChargeSpendBasisTotalsV1,
  AzureFinancialChargeSpendBreakdownV1,
  AzureFinancialChargeSpendSourceTotalsV1,
  DecompositionTreeFinancialChargeSourceCostsV1,
} from '../src/index.js';

const available = (billingBackedMinorUnits: number, estimatedMinorUnits = 0): AzureFinancialChargeSpendBasisTotalsV1 => ({
  status: 'available',
  totalMinorUnits: billingBackedMinorUnits + estimatedMinorUnits,
  billingBackedMinorUnits,
  estimatedMinorUnits,
});

// Legacy producers do not need to add eligibility evidence.
const legacy: AzureFinancialChargeSpendBreakdownV1 = {
  contractVersion: 'financial-charge-spend/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  generationId: 'generation-1',
  subject: { kind: 'provider-scope', providerScopeId: 'subscription-1' },
  period: { startDate: '2026-10-01', endDateExclusive: '2026-10-06' },
  currencyCode: 'NZD',
  minorUnitScale: 2,
  status: 'complete',
  allCharge: { billed: available(12_000), amortized: available(11_500) },
  azureNative: { billed: available(10_000), amortized: available(9_500) },
  marketplace: { billed: available(2_000), amortized: available(2_000) },
  unknown: { billed: available(0), amortized: available(0) },
  unknownMaterial: { nonZeroRowCount: 0, billedAbsoluteMinorUnits: 0, amortizedAbsoluteMinorUnits: 0 },
};

const eligible: AzureFinancialChargeSpendSourceTotalsV1 = {
  billed: available(7_500, 500),
  // Eligibility availability is independent; it cannot borrow billed values.
  amortized: { status: 'unavailable', reasonCode: 'not-produced' },
};
const enriched: AzureFinancialChargeSpendBreakdownV1 = { ...legacy, azureNativeDiscountEligible: eligible };
const zero: AzureFinancialChargeSpendSourceTotalsV1 = { billed: available(0), amortized: available(0) };
const credit: AzureFinancialChargeSpendSourceTotalsV1 = { billed: available(-125), amortized: available(-100) };

const tree: DecompositionTreeFinancialChargeSourceCostsV1 = {
  contractVersion: 'financial-charge-source-costs/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  minorUnitScale: 2,
  current: {
    billed: {
      allChargeMinorUnits: 12_000,
      azureNativeMinorUnits: 10_000,
      azureNativeDiscountEligibleMinorUnits: 8_000,
      marketplaceMinorUnits: 2_000,
      unknownMinorUnits: 0,
      unknownAbsoluteMinorUnits: 0,
      unknownNonZeroRowCount: 0,
      status: 'complete',
    },
    amortized: {
      allChargeMinorUnits: 11_500,
      azureNativeMinorUnits: 9_500,
      azureNativeDiscountEligibleMinorUnits: 7_000,
      marketplaceMinorUnits: 2_000,
      unknownMinorUnits: 0,
      unknownAbsoluteMinorUnits: 0,
      unknownNonZeroRowCount: 0,
      status: 'complete',
    },
  },
};

const coverage: AzureFinancialChargeCoverageV1 = {
  contractVersion: 'financial-charge-policy/v1',
  policyRef: 'azure-cloud-services-excluding-marketplace/v1',
  coordinate: {
    generationId: 'generation-1',
    providerName: 'azure',
    providerScopeId: 'subscription-1',
    basis: 'billed',
    period: legacy.period,
    currencyCode: 'NZD',
    minorUnitScale: 2,
  },
  status: 'complete',
  sourceTotals: {
    allChargeMinorUnits: 12_000,
    azureNativeMinorUnits: 10_000,
    azureNativeDiscountEligibleMinorUnits: 8_000,
    marketplaceMinorUnits: 2_000,
    unknownMinorUnits: 0,
    unknownAbsoluteMinorUnits: 0,
    rowCount: 4,
    azureNativeRowCount: 3,
    marketplaceRowCount: 1,
    unknownRowCount: 0,
    unknownNonZeroRowCount: 0,
  },
  unknownObjects: [],
};

// @ts-expect-error Both basis slots must be supplied when eligible evidence is produced.
const missingBasis: AzureFinancialChargeSpendSourceTotalsV1 = { billed: available(100) };
const invalidAmount: AzureFinancialChargeSpendSourceTotalsV1 = {
  billed: {
    status: 'available',
    // @ts-expect-error Eligible money is numeric minor units, not formatted text.
    totalMinorUnits: '100',
    billingBackedMinorUnits: 100,
    estimatedMinorUnits: 0,
  },
  amortized: available(100),
};

void enriched;
void zero;
void credit;
void tree;
void coverage;
void missingBasis;
void invalidAmount;
