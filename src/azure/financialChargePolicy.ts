import type { CostBasis } from './costComposition.js';
import type { MoneyUnavailableReason } from './costComposition.js';
import type { SavingsAggregateV2 } from './savings.js';

export const AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1 = 'azure-cloud-services-excluding-marketplace/v1' as const;

export type AzureFinancialChargePolicyRefV1 = typeof AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1;
export type AzureFinancialChargeSourceV1 = 'azure-native' | 'marketplace' | 'unknown';
export type AzureFinancialChargeSourceUnknownReasonV1 = 'publisher-type-missing' | 'publisher-type-unsupported' | 'publisher-type-unrecognized';

/** One rolling-spend basis split by billing-backed and estimated provenance. */
export type AzureFinancialChargeSpendBasisTotalsV1 =
  | {
      status: 'available';
      totalMinorUnits: number;
      billingBackedMinorUnits: number;
      estimatedMinorUnits: number;
    }
  | {
      status: 'unavailable';
      reasonCode: MoneyUnavailableReason;
    };

/** Billed and amortized projections for one financial charge source. */
export interface AzureFinancialChargeSpendSourceTotalsV1 {
  billed: AzureFinancialChargeSpendBasisTotalsV1;
  amortized: AzureFinancialChargeSpendBasisTotalsV1;
}

/** Subject whose rolling spend is represented by the breakdown. */
export type AzureFinancialChargeSpendSubjectV1 =
  | {
      kind: 'provider-scope';
      providerScopeId: string;
    }
  | {
      kind: 'resource';
      providerScopeId: string;
      resourceId: string;
    };

/** Evidence that keeps material unknown rows distinct from their signed net. */
export interface AzureFinancialChargeUnknownMaterialV1 {
  nonZeroRowCount: number;
  billedAbsoluteMinorUnits: number;
  amortizedAbsoluteMinorUnits: number;
}

/**
 * Rolling resource-page spend partition. This deliberately remains separate from
 * the fixed formal-report coordinate because its period follows the page's
 * rolling cost window.
 */
export interface AzureFinancialChargeSpendBreakdownV1<TSubject extends AzureFinancialChargeSpendSubjectV1 = AzureFinancialChargeSpendSubjectV1> {
  contractVersion: 'financial-charge-spend/v1';
  policyRef: AzureFinancialChargePolicyRefV1;
  generationId: string;
  subject: TSubject;
  period: {
    startDate: string;
    endDateExclusive: string;
  };
  currencyCode: string;
  minorUnitScale: number;
  status: 'complete' | 'partial';
  allCharge: AzureFinancialChargeSpendSourceTotalsV1;
  azureNative: AzureFinancialChargeSpendSourceTotalsV1;
  marketplace: AzureFinancialChargeSpendSourceTotalsV1;
  unknown: AzureFinancialChargeSpendSourceTotalsV1;
  unknownMaterial: AzureFinancialChargeUnknownMaterialV1;
}

export type AzureProviderScopeFinancialChargeSpendBreakdownV1 = AzureFinancialChargeSpendBreakdownV1<
  Extract<AzureFinancialChargeSpendSubjectV1, { kind: 'provider-scope' }>
>;

export type AzureResourceFinancialChargeSpendBreakdownV1 = AzureFinancialChargeSpendBreakdownV1<
  Extract<AzureFinancialChargeSpendSubjectV1, { kind: 'resource' }>
>;

/** Publisher evidence retained from the provider billing source before financial classification. */
export type AzurePublisherTypeEvidenceV1 =
  | {
      status: 'available';
      publisherType: string;
      publisherName?: string;
    }
  | {
      status: 'unavailable';
      reasonCode: Exclude<AzureFinancialChargeSourceUnknownReasonV1, 'publisher-type-unrecognized'>;
    };

/** Result of classifying one billing component. Display heuristics are not authoritative inputs. */
export type AzureFinancialChargeClassificationV1 =
  | {
      source: 'azure-native' | 'marketplace';
      publisherType: string;
      publisherName?: string;
    }
  | {
      source: 'unknown';
      reasonCode: AzureFinancialChargeSourceUnknownReasonV1;
      publisherType?: string;
      publisherName?: string;
    };

/** One immutable financial coordinate shared by cost coverage and savings authority. */
export interface AzureFinancialCoordinateV1 {
  generationId: string;
  providerName: 'azure';
  providerScopeId: string;
  basis: CostBasis;
  period: {
    startDate: string;
    endDateExclusive: string;
  };
  currencyCode: string;
  minorUnitScale: number;
}

/** Signed partition totals. All-charge must equal Azure-native + Marketplace + unknown. */
export interface AzureFinancialChargeSourceTotalsV1 {
  allChargeMinorUnits: number;
  azureNativeMinorUnits: number;
  marketplaceMinorUnits: number;
  unknownMinorUnits: number;
  /** Sum of absolute values for material unknown-source rows, even when their signed net is zero. */
  unknownAbsoluteMinorUnits: number;
  rowCount: number;
  azureNativeRowCount: number;
  marketplaceRowCount: number;
  unknownRowCount: number;
  unknownNonZeroRowCount: number;
}

/** Complete reportable identity and selected-basis cost for a material unknown-source object. */
export interface AzureUnknownFinancialChargeObjectV1 {
  objectKey: string;
  name: string;
  resourceType: string;
  resourceId?: string;
  billableComponentKey: string;
  signedCostMinorUnits: number;
  absoluteCostMinorUnits: number;
  rowCount: number;
  nonZeroRowCount: number;
  reasonCodes: AzureFinancialChargeSourceUnknownReasonV1[];
}

/** Coverage for the fixed Marketplace-excluding policy at one financial coordinate. */
export interface AzureFinancialChargeCoverageV1 {
  contractVersion: 'financial-charge-policy/v1';
  policyRef: AzureFinancialChargePolicyRefV1;
  coordinate: AzureFinancialCoordinateV1;
  status: 'complete' | 'partial';
  sourceTotals: AzureFinancialChargeSourceTotalsV1;
  /** Sorted by objectKey and complete for all material unknown-source rows. */
  unknownObjects: AzureUnknownFinancialChargeObjectV1[];
}

/** Canonical savings aggregate computed only from policy-eligible Azure-native billing components. */
export interface AzurePolicyBoundSavingsAggregateV1 {
  contractVersion: 'financial-charge-policy/v1';
  policyRef: AzureFinancialChargePolicyRefV1;
  coordinate: AzureFinancialCoordinateV1;
  coverage: AzureFinancialChargeCoverageV1;
  savingsAggregate: SavingsAggregateV2;
}

export type AzureChargeableSavingsUnavailableReasonV1 =
  | 'partial-source-coverage'
  | 'policy-mismatch'
  | 'generation-mismatch'
  | 'coordinate-mismatch'
  | 'mixed-currency'
  | 'source-unavailable'
  | 'reconciliation-failed';

/** Billing input. A partial result cannot carry a numeric customer-charge value. */
export type AzureChargeableSavingsV1 =
  | {
      contractVersion: 'financial-charge-policy/v1';
      policyRef: AzureFinancialChargePolicyRefV1;
      coordinate: AzureFinancialCoordinateV1;
      status: 'available';
      coverage: AzureFinancialChargeCoverageV1 & { status: 'complete' };
      savingsAggregate: SavingsAggregateV2;
      chargeableMaxSavingsMinorUnits: number;
    }
  | {
      contractVersion: 'financial-charge-policy/v1';
      policyRef: AzureFinancialChargePolicyRefV1;
      coordinate: AzureFinancialCoordinateV1;
      status: 'unavailable';
      coverage: AzureFinancialChargeCoverageV1;
      reasonCodes: AzureChargeableSavingsUnavailableReasonV1[];
    };

export type AzureCompanyChargeableSavingsUnavailableReasonV1 =
  | AzureChargeableSavingsUnavailableReasonV1
  | 'no-provider-scopes'
  | 'scope-unavailable'
  | 'mixed-minor-unit-scale';

export type AzureCompanyChargeableSavingsScopeResultV1 =
  | {
      providerScopeId: string;
      status: 'available';
      generationId: string;
      basis: CostBasis;
      period: AzureFinancialCoordinateV1['period'];
      currencyCode: string;
      minorUnitScale: number;
      chargeableMaxSavingsMinorUnits: number;
    }
  | {
      providerScopeId: string;
      status: 'unavailable';
      reasonCodes: AzureCompanyChargeableSavingsUnavailableReasonV1[];
    };

export type AzureCompanyChargeableSavingsTotalV1 =
  | {
      status: 'available';
      basis: CostBasis;
      period: AzureFinancialCoordinateV1['period'];
      currencyCode: string;
      minorUnitScale: number;
      chargeableMaxSavingsMinorUnits: number;
    }
  | {
      status: 'unavailable';
      reasonCodes: AzureCompanyChargeableSavingsUnavailableReasonV1[];
    };

/** Billing-facing company projection; every numeric value comes from producer-owned per-scope authority. */
export interface AzureCompanyChargeableSavingsResponseV1 {
  contractVersion: 'financial-charge-policy/v1';
  policyRef: AzureFinancialChargePolicyRefV1;
  companyId: string;
  scopeResults: AzureCompanyChargeableSavingsScopeResultV1[];
  companyTotal: AzureCompanyChargeableSavingsTotalV1;
}

const UNKNOWN_REASON_CODES = new Set<string>(['publisher-type-missing', 'publisher-type-unsupported', 'publisher-type-unrecognized']);
const CHARGEABLE_UNAVAILABLE_REASON_CODES = new Set<string>([
  'partial-source-coverage',
  'policy-mismatch',
  'generation-mismatch',
  'coordinate-mismatch',
  'mixed-currency',
  'source-unavailable',
  'reconciliation-failed',
]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const ISO_CURRENCY_PATTERN = /^[A-Z]{3}$/u;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactFields = (value: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean => {
  const allowed = new Set([...required, ...optional]);
  return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && Object.keys(value).every(field => allowed.has(field));
};

const isNonEmptyTrimmedString = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value === value.trim();

const isSafeInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value);
const isNonNegativeSafeInteger = (value: unknown): value is number => isSafeInteger(value) && value >= 0;

const isIsoDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === month && parsed.getUTCDate() === day;
};

const MONEY_UNAVAILABLE_REASONS = new Set<string>(['billing-unavailable', 'not-produced', 'currency-unresolved', 'coverage-unproven']);

const checkedSafeIntegerSum = (values: readonly number[]): number | undefined => {
  let total = 0;
  for (const value of values) {
    const nextTotal = total + value;
    if (!Number.isSafeInteger(nextTotal)) return undefined;
    total = nextTotal;
  }
  return total;
};

const isSpendBasisTotals = (value: unknown): value is AzureFinancialChargeSpendBasisTotalsV1 => {
  if (!isRecord(value)) return false;
  if (value.status === 'unavailable') {
    return hasExactFields(value, ['status', 'reasonCode']) && typeof value.reasonCode === 'string' && MONEY_UNAVAILABLE_REASONS.has(value.reasonCode);
  }
  if (
    value.status !== 'available' ||
    !hasExactFields(value, ['status', 'totalMinorUnits', 'billingBackedMinorUnits', 'estimatedMinorUnits']) ||
    !isSafeInteger(value.totalMinorUnits) ||
    !isSafeInteger(value.billingBackedMinorUnits) ||
    !isSafeInteger(value.estimatedMinorUnits)
  ) {
    return false;
  }
  return checkedSafeIntegerSum([value.billingBackedMinorUnits, value.estimatedMinorUnits]) === value.totalMinorUnits;
};

const isSpendSourceTotals = (value: unknown): value is AzureFinancialChargeSpendSourceTotalsV1 =>
  isRecord(value) && hasExactFields(value, ['billed', 'amortized']) && isSpendBasisTotals(value.billed) && isSpendBasisTotals(value.amortized);

const isSpendSubject = (value: unknown): value is AzureFinancialChargeSpendSubjectV1 => {
  if (!isRecord(value) || (value.kind !== 'provider-scope' && value.kind !== 'resource')) return false;
  if (value.kind === 'provider-scope') {
    return hasExactFields(value, ['kind', 'providerScopeId']) && isNonEmptyTrimmedString(value.providerScopeId);
  }
  return (
    hasExactFields(value, ['kind', 'providerScopeId', 'resourceId']) &&
    isNonEmptyTrimmedString(value.providerScopeId) &&
    isNonEmptyTrimmedString(value.resourceId)
  );
};

const isUnknownMaterial = (value: unknown): value is AzureFinancialChargeUnknownMaterialV1 =>
  isRecord(value) &&
  hasExactFields(value, ['nonZeroRowCount', 'billedAbsoluteMinorUnits', 'amortizedAbsoluteMinorUnits']) &&
  isNonNegativeSafeInteger(value.nonZeroRowCount) &&
  isNonNegativeSafeInteger(value.billedAbsoluteMinorUnits) &&
  isNonNegativeSafeInteger(value.amortizedAbsoluteMinorUnits);

/** Exact validator for one rolling all-charge/Azure-native/Marketplace/unknown partition. */
export const isAzureFinancialChargeSpendBreakdownV1 = (value: unknown): value is AzureFinancialChargeSpendBreakdownV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, [
      'contractVersion',
      'policyRef',
      'generationId',
      'subject',
      'period',
      'currencyCode',
      'minorUnitScale',
      'status',
      'allCharge',
      'azureNative',
      'marketplace',
      'unknown',
      'unknownMaterial',
    ]) ||
    value.contractVersion !== 'financial-charge-spend/v1' ||
    value.policyRef !== AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1 ||
    !isNonEmptyTrimmedString(value.generationId) ||
    !isSpendSubject(value.subject) ||
    !isRecord(value.period) ||
    !hasExactFields(value.period, ['startDate', 'endDateExclusive']) ||
    !isIsoDate(value.period.startDate) ||
    !isIsoDate(value.period.endDateExclusive) ||
    value.period.startDate >= value.period.endDateExclusive ||
    typeof value.currencyCode !== 'string' ||
    !ISO_CURRENCY_PATTERN.test(value.currencyCode) ||
    !isNonNegativeSafeInteger(value.minorUnitScale) ||
    value.minorUnitScale > 6 ||
    (value.status !== 'complete' && value.status !== 'partial') ||
    !isSpendSourceTotals(value.allCharge) ||
    !isSpendSourceTotals(value.azureNative) ||
    !isSpendSourceTotals(value.marketplace) ||
    !isSpendSourceTotals(value.unknown) ||
    !isUnknownMaterial(value.unknownMaterial)
  ) {
    return false;
  }

  const breakdown = value as unknown as AzureFinancialChargeSpendBreakdownV1;
  const sources = [breakdown.azureNative, breakdown.marketplace, breakdown.unknown];
  for (const basis of ['billed', 'amortized'] as const) {
    const partitions = [breakdown.allCharge[basis], ...sources.map(source => source[basis])];
    if (!partitions.every(partition => partition.status === partitions[0].status)) return false;
    if (partitions[0].status === 'unavailable') continue;
    for (const key of ['totalMinorUnits', 'billingBackedMinorUnits', 'estimatedMinorUnits'] as const) {
      const sourceValues = sources.map(source => {
        const sourceBasis = source[basis];
        return sourceBasis.status === 'available' ? sourceBasis[key] : undefined;
      });
      if (sourceValues.some(sourceValue => sourceValue === undefined)) return false;
      const sourceTotal = checkedSafeIntegerSum(sourceValues as number[]);
      const allChargeBasis = breakdown.allCharge[basis];
      if (sourceTotal === undefined || allChargeBasis.status !== 'available' || allChargeBasis[key] !== sourceTotal) return false;
    }
  }

  const materialUnknown = breakdown.unknownMaterial.nonZeroRowCount > 0;
  if (materialUnknown) {
    if (breakdown.status !== 'partial') return false;
    if (breakdown.unknownMaterial.billedAbsoluteMinorUnits === 0 && breakdown.unknownMaterial.amortizedAbsoluteMinorUnits === 0) return false;
  } else if (
    breakdown.status !== 'complete' ||
    breakdown.unknownMaterial.billedAbsoluteMinorUnits !== 0 ||
    breakdown.unknownMaterial.amortizedAbsoluteMinorUnits !== 0
  ) {
    return false;
  }

  const unknownAbsoluteByBasis = {
    billed: breakdown.unknownMaterial.billedAbsoluteMinorUnits,
    amortized: breakdown.unknownMaterial.amortizedAbsoluteMinorUnits,
  };
  return (['billed', 'amortized'] as const).every(basis => {
    const unknownBasis = breakdown.unknown[basis];
    return unknownBasis.status === 'unavailable' || Math.abs(unknownBasis.totalMinorUnits) <= unknownAbsoluteByBasis[basis];
  });
};

export const isAzureProviderScopeFinancialChargeSpendBreakdownV1 = (value: unknown): value is AzureProviderScopeFinancialChargeSpendBreakdownV1 =>
  isAzureFinancialChargeSpendBreakdownV1(value) && value.subject.kind === 'provider-scope';

export const isAzureResourceFinancialChargeSpendBreakdownV1 = (value: unknown): value is AzureResourceFinancialChargeSpendBreakdownV1 =>
  isAzureFinancialChargeSpendBreakdownV1(value) && value.subject.kind === 'resource';

/** Validates both the resource-level shape and its binding to the enclosing resource ID. */
export const isAzureResourceFinancialChargeSpendBreakdownForResourceV1 = (
  value: unknown,
  resourceId: string
): value is AzureResourceFinancialChargeSpendBreakdownV1 =>
  isNonEmptyTrimmedString(resourceId) &&
  isAzureResourceFinancialChargeSpendBreakdownV1(value) &&
  value.subject.resourceId.toLowerCase().replace(/\/+$/u, '') === resourceId.toLowerCase().replace(/\/+$/u, '');

const areStringArraysEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const isSortedUniqueStringArray = (value: unknown, allowedValues: Set<string>): value is string[] => {
  if (!Array.isArray(value) || value.length === 0 || !value.every(item => typeof item === 'string' && allowedValues.has(item))) return false;
  const canonical = [...new Set(value)].sort();
  return areStringArraysEqual(value, canonical);
};

/** Exact validator for publisher evidence retained from an Azure billing source. */
export const isAzurePublisherTypeEvidenceV1 = (value: unknown): value is AzurePublisherTypeEvidenceV1 => {
  if (!isRecord(value) || (value.status !== 'available' && value.status !== 'unavailable')) return false;
  if (value.status === 'available') {
    return (
      hasExactFields(value, ['status', 'publisherType'], ['publisherName']) &&
      isNonEmptyTrimmedString(value.publisherType) &&
      (value.publisherName === undefined || isNonEmptyTrimmedString(value.publisherName))
    );
  }
  return (
    hasExactFields(value, ['status', 'reasonCode']) &&
    (value.reasonCode === 'publisher-type-missing' || value.reasonCode === 'publisher-type-unsupported')
  );
};

/** Exact validator for the authoritative classification of one billing component. */
export const isAzureFinancialChargeClassificationV1 = (value: unknown): value is AzureFinancialChargeClassificationV1 => {
  if (!isRecord(value) || (value.source !== 'azure-native' && value.source !== 'marketplace' && value.source !== 'unknown')) return false;
  const publisherNameIsValid = value.publisherName === undefined || isNonEmptyTrimmedString(value.publisherName);
  if (!publisherNameIsValid) return false;

  if (value.source === 'azure-native' || value.source === 'marketplace') {
    if (!hasExactFields(value, ['source', 'publisherType'], ['publisherName']) || !isNonEmptyTrimmedString(value.publisherType)) {
      return false;
    }
    const publisherType = value.publisherType.toLowerCase();
    return value.source === 'marketplace' ? publisherType === 'marketplace' : publisherType === 'azure' || publisherType === 'microsoft';
  }

  if (
    !hasExactFields(value, ['source', 'reasonCode'], ['publisherType', 'publisherName']) ||
    typeof value.reasonCode !== 'string' ||
    !UNKNOWN_REASON_CODES.has(value.reasonCode)
  ) {
    return false;
  }
  if (value.reasonCode === 'publisher-type-unrecognized') {
    if (!isNonEmptyTrimmedString(value.publisherType)) return false;
    const publisherType = value.publisherType.toLowerCase();
    return publisherType !== 'azure' && publisherType !== 'microsoft' && publisherType !== 'marketplace';
  }
  return value.publisherType === undefined;
};

export const isAzureFinancialCoordinateV1 = (value: unknown): value is AzureFinancialCoordinateV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, ['generationId', 'providerName', 'providerScopeId', 'basis', 'period', 'currencyCode', 'minorUnitScale'])
  ) {
    return false;
  }
  if (
    !isNonEmptyTrimmedString(value.generationId) ||
    value.providerName !== 'azure' ||
    !isNonEmptyTrimmedString(value.providerScopeId) ||
    (value.basis !== 'billed' && value.basis !== 'amortized') ||
    typeof value.currencyCode !== 'string' ||
    !ISO_CURRENCY_PATTERN.test(value.currencyCode) ||
    !isNonNegativeSafeInteger(value.minorUnitScale) ||
    value.minorUnitScale > 6 ||
    !isRecord(value.period) ||
    !hasExactFields(value.period, ['startDate', 'endDateExclusive']) ||
    !isIsoDate(value.period.startDate) ||
    !isIsoDate(value.period.endDateExclusive)
  ) {
    return false;
  }
  return value.period.startDate < value.period.endDateExclusive;
};

const isSourceTotals = (value: unknown): value is AzureFinancialChargeSourceTotalsV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, [
      'allChargeMinorUnits',
      'azureNativeMinorUnits',
      'marketplaceMinorUnits',
      'unknownMinorUnits',
      'unknownAbsoluteMinorUnits',
      'rowCount',
      'azureNativeRowCount',
      'marketplaceRowCount',
      'unknownRowCount',
      'unknownNonZeroRowCount',
    ])
  ) {
    return false;
  }
  const signedValues = [value.allChargeMinorUnits, value.azureNativeMinorUnits, value.marketplaceMinorUnits, value.unknownMinorUnits];
  const countValues = [
    value.unknownAbsoluteMinorUnits,
    value.rowCount,
    value.azureNativeRowCount,
    value.marketplaceRowCount,
    value.unknownRowCount,
    value.unknownNonZeroRowCount,
  ];
  if (!signedValues.every(isSafeInteger) || !countValues.every(isNonNegativeSafeInteger)) return false;
  const totals = value as unknown as AzureFinancialChargeSourceTotalsV1;
  return (
    totals.unknownNonZeroRowCount <= totals.unknownRowCount &&
    totals.rowCount === totals.azureNativeRowCount + totals.marketplaceRowCount + totals.unknownRowCount &&
    totals.allChargeMinorUnits === totals.azureNativeMinorUnits + totals.marketplaceMinorUnits + totals.unknownMinorUnits
  );
};

const isUnknownObject = (value: unknown): value is AzureUnknownFinancialChargeObjectV1 =>
  isRecord(value) &&
  hasExactFields(
    value,
    [
      'objectKey',
      'name',
      'resourceType',
      'billableComponentKey',
      'signedCostMinorUnits',
      'absoluteCostMinorUnits',
      'rowCount',
      'nonZeroRowCount',
      'reasonCodes',
    ],
    ['resourceId']
  ) &&
  isNonEmptyTrimmedString(value.objectKey) &&
  isNonEmptyTrimmedString(value.name) &&
  isNonEmptyTrimmedString(value.resourceType) &&
  (value.resourceId === undefined || isNonEmptyTrimmedString(value.resourceId)) &&
  isNonEmptyTrimmedString(value.billableComponentKey) &&
  isSafeInteger(value.signedCostMinorUnits) &&
  isNonNegativeSafeInteger(value.absoluteCostMinorUnits) &&
  isNonNegativeSafeInteger(value.rowCount) &&
  value.rowCount > 0 &&
  isNonNegativeSafeInteger(value.nonZeroRowCount) &&
  value.nonZeroRowCount > 0 &&
  value.nonZeroRowCount <= value.rowCount &&
  isSortedUniqueStringArray(value.reasonCodes, UNKNOWN_REASON_CODES);

const coordinatesEqual = (left: AzureFinancialCoordinateV1, right: AzureFinancialCoordinateV1): boolean =>
  left.generationId === right.generationId &&
  left.providerName === right.providerName &&
  left.providerScopeId === right.providerScopeId &&
  left.basis === right.basis &&
  left.period.startDate === right.period.startDate &&
  left.period.endDateExclusive === right.period.endDateExclusive &&
  left.currencyCode === right.currencyCode &&
  left.minorUnitScale === right.minorUnitScale;

export const isAzureFinancialChargeCoverageV1 = (value: unknown): value is AzureFinancialChargeCoverageV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, ['contractVersion', 'policyRef', 'coordinate', 'status', 'sourceTotals', 'unknownObjects']) ||
    value.contractVersion !== 'financial-charge-policy/v1' ||
    value.policyRef !== AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1 ||
    !isAzureFinancialCoordinateV1(value.coordinate) ||
    (value.status !== 'complete' && value.status !== 'partial') ||
    !isSourceTotals(value.sourceTotals) ||
    !Array.isArray(value.unknownObjects) ||
    !value.unknownObjects.every(isUnknownObject)
  ) {
    return false;
  }

  const objectKeys = value.unknownObjects.map(item => item.objectKey);
  if (!areStringArraysEqual(objectKeys, [...new Set(objectKeys)].sort())) return false;

  const objectSignedTotal = value.unknownObjects.reduce((total, item) => total + item.signedCostMinorUnits, 0);
  const objectAbsoluteTotal = value.unknownObjects.reduce((total, item) => total + item.absoluteCostMinorUnits, 0);
  const objectNonZeroRows = value.unknownObjects.reduce((total, item) => total + item.nonZeroRowCount, 0);
  if (
    !Number.isSafeInteger(objectSignedTotal) ||
    !Number.isSafeInteger(objectAbsoluteTotal) ||
    !Number.isSafeInteger(objectNonZeroRows) ||
    objectSignedTotal !== value.sourceTotals.unknownMinorUnits ||
    objectAbsoluteTotal !== value.sourceTotals.unknownAbsoluteMinorUnits ||
    objectNonZeroRows !== value.sourceTotals.unknownNonZeroRowCount
  ) {
    return false;
  }

  const hasMaterialUnknown = value.sourceTotals.unknownNonZeroRowCount > 0;
  if (value.status === 'complete') {
    return !hasMaterialUnknown && value.sourceTotals.unknownAbsoluteMinorUnits === 0 && value.unknownObjects.length === 0;
  }
  return hasMaterialUnknown && value.unknownObjects.length > 0;
};

const isCanonicalSavingsAggregateV2 = (value: unknown, coordinate: AzureFinancialCoordinateV1): value is SavingsAggregateV2 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, ['contractVersion', 'generationId', 'scopeKey', 'scope', 'allocationCount', 'totals']) ||
    value.contractVersion !== 'savings/v2' ||
    value.generationId !== coordinate.generationId ||
    !isNonEmptyTrimmedString(value.scopeKey) ||
    !isNonNegativeSafeInteger(value.allocationCount) ||
    !isRecord(value.scope) ||
    !hasExactFields(value.scope, ['kind', 'providerName', 'providerScopeId', 'filterFingerprint']) ||
    value.scope.kind !== 'subscription-full' ||
    value.scope.providerName !== 'azure' ||
    value.scope.providerScopeId !== coordinate.providerScopeId ||
    !isNonEmptyTrimmedString(value.scope.filterFingerprint) ||
    !isRecord(value.totals) ||
    !hasExactFields(value.totals, ['currency', 'minorUnitScale', 'currentMonthlyMinorUnits', 'minSavingsMinorUnits', 'maxSavingsMinorUnits']) ||
    value.totals.currency !== coordinate.currencyCode ||
    value.totals.minorUnitScale !== coordinate.minorUnitScale ||
    !isNonNegativeSafeInteger(value.totals.currentMonthlyMinorUnits) ||
    !isNonNegativeSafeInteger(value.totals.minSavingsMinorUnits) ||
    !isNonNegativeSafeInteger(value.totals.maxSavingsMinorUnits)
  ) {
    return false;
  }
  return value.totals.minSavingsMinorUnits <= value.totals.maxSavingsMinorUnits;
};

export const isAzurePolicyBoundSavingsAggregateV1 = (value: unknown): value is AzurePolicyBoundSavingsAggregateV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, ['contractVersion', 'policyRef', 'coordinate', 'coverage', 'savingsAggregate']) ||
    value.contractVersion !== 'financial-charge-policy/v1' ||
    value.policyRef !== AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1 ||
    !isAzureFinancialCoordinateV1(value.coordinate) ||
    !isAzureFinancialChargeCoverageV1(value.coverage) ||
    !coordinatesEqual(value.coordinate, value.coverage.coordinate)
  ) {
    return false;
  }
  return isCanonicalSavingsAggregateV2(value.savingsAggregate, value.coordinate);
};

export const isAzureChargeableSavingsV1 = (value: unknown): value is AzureChargeableSavingsV1 => {
  if (
    !isRecord(value) ||
    value.contractVersion !== 'financial-charge-policy/v1' ||
    value.policyRef !== AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1 ||
    !isAzureFinancialCoordinateV1(value.coordinate) ||
    !isAzureFinancialChargeCoverageV1(value.coverage) ||
    !coordinatesEqual(value.coordinate, value.coverage.coordinate)
  ) {
    return false;
  }
  if (value.status === 'available') {
    return (
      hasExactFields(value, [
        'contractVersion',
        'policyRef',
        'coordinate',
        'status',
        'coverage',
        'savingsAggregate',
        'chargeableMaxSavingsMinorUnits',
      ]) &&
      value.coverage.status === 'complete' &&
      isCanonicalSavingsAggregateV2(value.savingsAggregate, value.coordinate) &&
      isNonNegativeSafeInteger(value.chargeableMaxSavingsMinorUnits) &&
      value.chargeableMaxSavingsMinorUnits === value.savingsAggregate.totals.maxSavingsMinorUnits
    );
  }
  return (
    value.status === 'unavailable' &&
    hasExactFields(value, ['contractVersion', 'policyRef', 'coordinate', 'status', 'coverage', 'reasonCodes']) &&
    isSortedUniqueStringArray(value.reasonCodes, CHARGEABLE_UNAVAILABLE_REASON_CODES)
  );
};

const COMPANY_CHARGEABLE_UNAVAILABLE_REASON_CODES = new Set<string>([
  ...CHARGEABLE_UNAVAILABLE_REASON_CODES,
  'no-provider-scopes',
  'scope-unavailable',
  'mixed-minor-unit-scale',
]);

/** Exact boundary validator for the company-level billing projection. */
export const isAzureCompanyChargeableSavingsResponseV1 = (value: unknown): value is AzureCompanyChargeableSavingsResponseV1 => {
  if (
    !isRecord(value) ||
    !hasExactFields(value, ['contractVersion', 'policyRef', 'companyId', 'scopeResults', 'companyTotal']) ||
    value.contractVersion !== 'financial-charge-policy/v1' ||
    value.policyRef !== AZURE_CLOUD_SERVICES_EXCLUDING_MARKETPLACE_POLICY_REF_V1 ||
    !isNonEmptyTrimmedString(value.companyId) ||
    !Array.isArray(value.scopeResults) ||
    !isRecord(value.companyTotal)
  ) {
    return false;
  }

  const providerScopeIds = new Set<string>();
  for (const scopeResult of value.scopeResults) {
    if (!isRecord(scopeResult) || !isNonEmptyTrimmedString(scopeResult.providerScopeId)) return false;
    const normalizedScopeId = scopeResult.providerScopeId.toLowerCase();
    if (providerScopeIds.has(normalizedScopeId)) return false;
    providerScopeIds.add(normalizedScopeId);
    if (scopeResult.status === 'available') {
      if (
        !hasExactFields(scopeResult, [
          'providerScopeId',
          'status',
          'generationId',
          'basis',
          'period',
          'currencyCode',
          'minorUnitScale',
          'chargeableMaxSavingsMinorUnits',
        ]) ||
        !isNonEmptyTrimmedString(scopeResult.generationId) ||
        (scopeResult.basis !== 'billed' && scopeResult.basis !== 'amortized') ||
        !isRecord(scopeResult.period) ||
        !hasExactFields(scopeResult.period, ['startDate', 'endDateExclusive']) ||
        !isIsoDate(scopeResult.period.startDate) ||
        !isIsoDate(scopeResult.period.endDateExclusive) ||
        scopeResult.period.startDate >= scopeResult.period.endDateExclusive ||
        typeof scopeResult.currencyCode !== 'string' ||
        !ISO_CURRENCY_PATTERN.test(scopeResult.currencyCode) ||
        !isNonNegativeSafeInteger(scopeResult.minorUnitScale) ||
        scopeResult.minorUnitScale > 6 ||
        !isNonNegativeSafeInteger(scopeResult.chargeableMaxSavingsMinorUnits)
      ) {
        return false;
      }
      continue;
    }
    if (
      scopeResult.status !== 'unavailable' ||
      !hasExactFields(scopeResult, ['providerScopeId', 'status', 'reasonCodes']) ||
      !isSortedUniqueStringArray(scopeResult.reasonCodes, COMPANY_CHARGEABLE_UNAVAILABLE_REASON_CODES)
    ) {
      return false;
    }
  }

  if (value.companyTotal.status === 'available') {
    if (
      !hasExactFields(value.companyTotal, ['status', 'basis', 'period', 'currencyCode', 'minorUnitScale', 'chargeableMaxSavingsMinorUnits']) ||
      (value.companyTotal.basis !== 'billed' && value.companyTotal.basis !== 'amortized') ||
      !isRecord(value.companyTotal.period) ||
      !hasExactFields(value.companyTotal.period, ['startDate', 'endDateExclusive']) ||
      !isIsoDate(value.companyTotal.period.startDate) ||
      !isIsoDate(value.companyTotal.period.endDateExclusive) ||
      value.companyTotal.period.startDate >= value.companyTotal.period.endDateExclusive ||
      typeof value.companyTotal.currencyCode !== 'string' ||
      !ISO_CURRENCY_PATTERN.test(value.companyTotal.currencyCode) ||
      !isNonNegativeSafeInteger(value.companyTotal.minorUnitScale) ||
      !isNonNegativeSafeInteger(value.companyTotal.chargeableMaxSavingsMinorUnits) ||
      value.scopeResults.some(scopeResult => scopeResult.status !== 'available')
    ) {
      return false;
    }
    const availableScopes = value.scopeResults.filter(
      (scopeResult): scopeResult is Extract<AzureCompanyChargeableSavingsScopeResultV1, { status: 'available' }> => scopeResult.status === 'available'
    );
    const companyTotal = value.companyTotal as unknown as Extract<AzureCompanyChargeableSavingsTotalV1, { status: 'available' }>;
    const total = availableScopes.reduce((sum, scopeResult) => sum + scopeResult.chargeableMaxSavingsMinorUnits, 0);
    return (
      Number.isSafeInteger(total) &&
      total === companyTotal.chargeableMaxSavingsMinorUnits &&
      availableScopes.every(
        scopeResult =>
          scopeResult.basis === companyTotal.basis &&
          scopeResult.period.startDate === companyTotal.period.startDate &&
          scopeResult.period.endDateExclusive === companyTotal.period.endDateExclusive &&
          scopeResult.currencyCode === companyTotal.currencyCode &&
          scopeResult.minorUnitScale === companyTotal.minorUnitScale
      )
    );
  }

  return (
    value.companyTotal.status === 'unavailable' &&
    hasExactFields(value.companyTotal, ['status', 'reasonCodes']) &&
    isSortedUniqueStringArray(value.companyTotal.reasonCodes, COMPANY_CHARGEABLE_UNAVAILABLE_REASON_CODES)
  );
};
