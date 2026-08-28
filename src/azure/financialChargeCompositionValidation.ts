import { formatExactDecimalValue, sumCanonicalDecimals } from '../common/exactDecimal';
import { sha256Utf8 } from '../common/sha256';
import {
  FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1,
  FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1,
  resolveFinancialChargeInclusionPolicyV1,
  type FinancialChargeCompositionBucketV1,
  type FinancialChargeCompositionIdentityPreimageV1,
  type FinancialChargeCompositionV1,
  type FinancialChargeInclusionPolicyV1,
  type FinancialChargeSelectionV1,
} from './financialChargeComposition';
import {
  canonicalizeFinancialDataflowJsonV1,
  hasFinancialDataflowExactFieldsV1,
  isFinancialDataflowCurrencyV1,
  isFinancialDataflowHashV1,
  isFinancialDataflowIdentityV1,
  isFinancialDataflowRecordV1,
  isFinancialDataflowValueWithinLimitsV1,
} from './financialDataflowValidation';
import { isFinancialBaselinePeriodV2 } from './financialScopeBaselineValidation';
import { isCanonicalExactMoney } from './financialValidationPrimitives';
import type { FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';

const SOURCES = new Set(['azure-native', 'marketplace', 'unknown']);
const RECURRENCES = new Set(['one-time', 'recurring', 'usage-based', 'unknown']);
const CLASSIFICATIONS = new Set(['usage', 'purchase', 'adjustment', 'tax', 'credit', 'refund', 'residual']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);

const isSortedUniqueHashes = (value: unknown): value is [string, ...string[]] =>
  Array.isArray(value) && value.length > 0 && value.length <= 20_000 && value.every(isFinancialDataflowHashV1) &&
  value.every((entry, index) => index === 0 || value[index - 1] < entry);

const isBucket = (value: unknown): value is FinancialChargeCompositionBucketV1 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(value, [
    'chargeSource',
    'chargeRecurrence',
    'chargeClassification',
    'amount',
    'componentIds',
    'evidenceRefIds',
  ]) &&
  SOURCES.has(value.chargeSource as string) &&
  RECURRENCES.has(value.chargeRecurrence as string) &&
  CLASSIFICATIONS.has(value.chargeClassification as string) &&
  isCanonicalExactMoney({ amount: value.amount, currencyCode: 'AUD' }) &&
  isSortedUniqueHashes(value.componentIds) &&
  isSortedUniqueHashes(value.evidenceRefIds);

const isIdentity = (value: unknown): value is FinancialChargeCompositionIdentityPreimageV1 => {
  if (
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(value, [
      'schemaVersion',
      'contractVersion',
      'baselineId',
      'ownerScopeId',
      'period',
      'costBasis',
      'estimateLens',
      'accountingCurrencyCode',
      'buckets',
      'reconciliation',
      'algorithmVersion',
    ]) ||
    value.schemaVersion !== FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1 ||
    value.contractVersion !== FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1 ||
    !isFinancialDataflowHashV1(value.baselineId) ||
    !isFinancialDataflowIdentityV1(value.ownerScopeId) ||
    !isFinancialBaselinePeriodV2(value.period) ||
    !COST_BASES.has(value.costBasis as string) ||
    !ESTIMATE_LENSES.has(value.estimateLens as string) ||
    !isFinancialDataflowCurrencyV1(value.accountingCurrencyCode) ||
    !Array.isArray(value.buckets) ||
    value.buckets.length === 0 ||
    value.buckets.length > 20_000 ||
    !value.buckets.every(isBucket) ||
    !isFinancialDataflowIdentityV1(value.algorithmVersion) ||
    !isFinancialDataflowRecordV1(value.reconciliation) ||
    !hasFinancialDataflowExactFieldsV1(value.reconciliation, ['status', 'bucketTotal', 'sourceTotal', 'difference']) ||
    value.reconciliation.status !== 'reconciled' ||
    value.reconciliation.difference !== '0' ||
    !isCanonicalExactMoney({ amount: value.reconciliation.bucketTotal, currencyCode: value.accountingCurrencyCode }) ||
    !isCanonicalExactMoney({ amount: value.reconciliation.sourceTotal, currencyCode: value.accountingCurrencyCode })
  ) return false;
  const componentIds = value.buckets.flatMap(bucket => bucket.componentIds);
  if (new Set(componentIds).size !== componentIds.length) return false;
  const keys = value.buckets.map(bucket => `${bucket.chargeSource}\u0000${bucket.chargeRecurrence}\u0000${bucket.chargeClassification}`);
  if (!keys.every((key, index) => index === 0 || keys[index - 1] < key)) return false;
  try {
    const bucketTotal = formatExactDecimalValue(sumCanonicalDecimals(value.buckets.map(bucket => bucket.amount)));
    return bucketTotal === value.reconciliation.bucketTotal && bucketTotal === value.reconciliation.sourceTotal;
  } catch {
    return false;
  }
};

export const canonicalizeFinancialChargeCompositionIdentityV1 = (
  value: FinancialChargeCompositionIdentityPreimageV1
): string => {
  if (!isFinancialDataflowValueWithinLimitsV1(value) || !isIdentity(value)) {
    throw new TypeError('Invalid FinancialChargeCompositionIdentityPreimageV1.');
  }
  return canonicalizeFinancialDataflowJsonV1(value);
};

export const createFinancialChargeCompositionIdV1 = (value: FinancialChargeCompositionIdentityPreimageV1): string =>
  `sha256:${sha256Utf8(canonicalizeFinancialChargeCompositionIdentityV1(value))}`;

export const isFinancialChargeCompositionV1 = (value: unknown): value is FinancialChargeCompositionV1 => {
  if (
    !isFinancialDataflowValueWithinLimitsV1(value) ||
    !isFinancialDataflowRecordV1(value) ||
    !hasFinancialDataflowExactFieldsV1(value, [
      'chargeCompositionId',
      'schemaVersion',
      'contractVersion',
      'baselineId',
      'ownerScopeId',
      'period',
      'costBasis',
      'estimateLens',
      'accountingCurrencyCode',
      'buckets',
      'reconciliation',
      'algorithmVersion',
    ])
  ) return false;
  const { chargeCompositionId, ...identity } = value;
  return isFinancialDataflowHashV1(chargeCompositionId) && isIdentity(identity) &&
    chargeCompositionId === createFinancialChargeCompositionIdV1(identity);
};

export const isFinancialChargeInclusionPolicyRefV1 = (value: unknown): value is FinancialChargeInclusionPolicyRefV2 =>
  isFinancialDataflowRecordV1(value) &&
  hasFinancialDataflowExactFieldsV1(value, ['policyId', 'policyDigest']) &&
  isFinancialDataflowIdentityV1(value.policyId) &&
  isFinancialDataflowHashV1(value.policyDigest) &&
  resolveFinancialChargeInclusionPolicyV1(value as unknown as FinancialChargeInclusionPolicyRefV2) !== undefined;

const sumBuckets = (buckets: readonly FinancialChargeCompositionBucketV1[]): string =>
  formatExactDecimalValue(sumCanonicalDecimals(buckets.map(bucket => bucket.amount)));

const sourcesFor = (policy: FinancialChargeInclusionPolicyV1, role: 'include' | 'exclude' | 'withhold'): readonly string[] =>
  role === 'include' ? policy.includeSources : role === 'exclude' ? policy.excludeSources : policy.withholdSources;

export const selectFinancialChargesV1 = (
  composition: FinancialChargeCompositionV1,
  policyRef: FinancialChargeInclusionPolicyRefV2
): FinancialChargeSelectionV1 => {
  if (!isFinancialChargeCompositionV1(composition)) throw new TypeError('Invalid financial charge composition.');
  const policy = resolveFinancialChargeInclusionPolicyV1(policyRef);
  if (!policy) throw new TypeError('Unregistered financial charge-inclusion policy.');
  const partition = (role: 'include' | 'exclude' | 'withhold') =>
    composition.buckets.filter(bucket => sourcesFor(policy, role).includes(bucket.chargeSource));
  const included = partition('include');
  const excluded = partition('exclude');
  const withheld = partition('withhold');
  if (included.length + excluded.length + withheld.length !== composition.buckets.length) {
    throw new TypeError('Financial charge-inclusion policy does not partition every charge source.');
  }
  const includedAmount = sumBuckets(included);
  const excludedAmount = sumBuckets(excluded);
  const withheldAmount = sumBuckets(withheld);
  const forecastEligibleAmount = sumBuckets(included.filter(bucket => bucket.chargeRecurrence === 'recurring' || bucket.chargeRecurrence === 'usage-based'));
  const oneTimeAmount = sumBuckets(included.filter(bucket => bucket.chargeRecurrence === 'one-time'));
  const unknownRecurrenceAmount = sumBuckets(included.filter(bucket => bucket.chargeRecurrence === 'unknown'));
  const reasonCodes: string[] = [];
  if (withheldAmount !== '0') reasonCodes.push('charge-source-unknown');
  const forecastReasonCodes: string[] = [...reasonCodes];
  if (unknownRecurrenceAmount !== '0') forecastReasonCodes.push('charge-recurrence-unknown');
  const result: FinancialChargeSelectionV1 = {
    status: withheldAmount === '0' ? 'available' : 'partial',
    includedAmount,
    excludedAmount,
    withheldAmount,
    forecastEligibleAmount,
    oneTimeAmount,
    unknownRecurrenceAmount,
    forecastStatus: withheldAmount === '0' && unknownRecurrenceAmount === '0' ? 'available' : 'partial',
    currencyCode: composition.accountingCurrencyCode,
    ...(reasonCodes.length === 0 ? {} : { reasonCodes: reasonCodes as [string, ...string[]] }),
    ...(forecastReasonCodes.length === 0
      ? {}
      : { forecastReasonCodes: forecastReasonCodes as [string, ...string[]] }),
  };
  return result;
};
