import { sha256Utf8 } from '../common/sha256';
import { isFinancialChargeInclusionPolicyRefV1 } from './financialChargeCompositionValidation';
import type {
  FinancialCurrentSpendSurfaceProjectionIdentityPreimageV1,
  FinancialCurrentSpendSurfaceProjectionV1,
  FinancialSurfaceCoordinateDefinitionV1,
  FinancialSurfaceCoordinateIdentityPreimageV1,
  FinancialSurfaceMoneyV1,
  FinancialSurfacePeriodV1,
} from './financialCurrentSpendSurfaceProjection';
import {
  FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_CONTRACT_VERSION_V1,
  FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_SCHEMA_VERSION_V1,
} from './financialCurrentSpendSurfaceProjection';
import {
  canonicalizeFinancialSavingsJsonValue,
  hasExactFinancialSavingsFields,
  isFinancialSavingsHash,
  isFinancialSavingsIdentity,
  isFinancialSavingsIsoInstant,
  isFinancialSavingsRecord,
} from './financialSavingsAuthorityValidationPrimitives';
import { isCanonicalExactMoney } from './financialValidationPrimitives';

const CURRENCIES = /^[A-Z]{3}$/;
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WINDOW_KINDS = new Set([
  'rolling-30-days',
  'calendar-month',
  'provider-billing-period',
  'stable-billing-window',
  'analytics-history',
  'daily',
]);
const PERIOD_ROLES = new Set(['current-spend', 'comparison', 'analytics-input', 'projection-target']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['billing-only', 'include-estimates', 'estimates-only']);
const SCOPE_KINDS = new Set(['subscription', 'resource-group', 'tag-scope', 'multi-subscription']);
const MAX_COORDINATES = 128;
const MAX_REASONS = 64;

const isCurrency = (value: unknown): value is string => typeof value === 'string' && CURRENCIES.test(value);

const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !CALENDAR_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isInterval = (value: unknown): boolean =>
  isFinancialSavingsRecord(value) &&
  hasExactFinancialSavingsFields(value, ['startDate', 'endDateExclusive', 'dateBasis'], ['timeZone']) &&
  isCalendarDate(value.startDate) &&
  isCalendarDate(value.endDateExclusive) &&
  value.startDate < value.endDateExclusive &&
  (value.dateBasis === 'utc' || value.dateBasis === 'billing-calendar' || value.dateBasis === 'company-local') &&
  (value.timeZone === undefined || isFinancialSavingsIdentity(value.timeZone));

export const isFinancialSurfacePeriodV1 = (value: unknown): value is FinancialSurfacePeriodV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(value, ['windowKind', 'requested'], ['observed', 'providerBillingPeriodId']) ||
    typeof value.windowKind !== 'string' ||
    !WINDOW_KINDS.has(value.windowKind) ||
    !isInterval(value.requested) ||
    (value.observed !== undefined && !isInterval(value.observed)) ||
    (value.providerBillingPeriodId !== undefined && !isFinancialSavingsIdentity(value.providerBillingPeriodId))
  )
    return false;
  if (value.observed === undefined) return true;
  const requested = value.requested as { startDate: string; endDateExclusive: string };
  const observed = value.observed as { startDate: string; endDateExclusive: string };
  return observed.startDate >= requested.startDate && observed.endDateExclusive <= requested.endDateExclusive;
};

export const canonicalizeFinancialSurfaceCoordinateIdentityV1 = (
  value: FinancialSurfaceCoordinateIdentityPreimageV1
): string => JSON.stringify(canonicalizeFinancialSavingsJsonValue(value));

export const createFinancialSurfaceCoordinateIdV1 = (
  value: FinancialSurfaceCoordinateIdentityPreimageV1
): string => `sha256:${sha256Utf8(canonicalizeFinancialSurfaceCoordinateIdentityV1(value))}`;

export const isFinancialSurfaceCoordinateDefinitionV1 = (value: unknown): value is FinancialSurfaceCoordinateDefinitionV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(
      value,
      ['coordinateId', 'periodRole', 'period', 'costBasis', 'estimateLens', 'chargeInclusionPolicyRef'],
      ['requestedCurrencyCode']
    ) ||
    !isFinancialSavingsHash(value.coordinateId) ||
    typeof value.periodRole !== 'string' ||
    !PERIOD_ROLES.has(value.periodRole) ||
    !isFinancialSurfacePeriodV1(value.period) ||
    typeof value.costBasis !== 'string' ||
    !COST_BASES.has(value.costBasis) ||
    typeof value.estimateLens !== 'string' ||
    !ESTIMATE_LENSES.has(value.estimateLens) ||
    !isFinancialChargeInclusionPolicyRefV1(value.chargeInclusionPolicyRef) ||
    (value.requestedCurrencyCode !== undefined && !isCurrency(value.requestedCurrencyCode))
  )
    return false;
  const coordinate = value as unknown as FinancialSurfaceCoordinateDefinitionV1;
  const { coordinateId: _coordinateId, ...identity } = coordinate;
  return coordinate.coordinateId === createFinancialSurfaceCoordinateIdV1(identity);
};

const isReasonCodes = (value: unknown): value is [string, ...string[]] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= MAX_REASONS &&
  value.every(isFinancialSavingsIdentity) &&
  new Set(value).size === value.length;

const isExactAmount = (amount: unknown, currencyCode: unknown): boolean =>
  isCurrency(currencyCode) && isCanonicalExactMoney({ amount, currencyCode });

const isNonNegativeExactAmount = (amount: unknown, currencyCode: unknown): boolean =>
  isExactAmount(amount, currencyCode) && typeof amount === 'string' && !amount.startsWith('-');

export const isFinancialSurfaceMoneyV1 = (value: unknown, requestedCurrencyCode?: string): value is FinancialSurfaceMoneyV1 => {
  if (!isFinancialSavingsRecord(value)) return false;
  if (value.status === 'available') {
    return (
      hasExactFinancialSavingsFields(value, [
        'status',
        'amount',
        'currencyCode',
        'completeness',
        'excludedAmount',
        'withheldAmount',
      ]) &&
      value.completeness === 'complete' &&
      isExactAmount(value.amount, value.currencyCode) &&
      isNonNegativeExactAmount(value.excludedAmount, value.currencyCode) &&
      isNonNegativeExactAmount(value.withheldAmount, value.currencyCode) &&
      (requestedCurrencyCode === undefined || value.currencyCode === requestedCurrencyCode)
    );
  }
  if (value.status === 'partial') {
    return (
      hasExactFinancialSavingsFields(value, [
        'status',
        'knownAmount',
        'currencyCode',
        'completeness',
        'excludedAmount',
        'withheldAmount',
        'reasonCodes',
      ]) &&
      value.completeness === 'partial' &&
      isExactAmount(value.knownAmount, value.currencyCode) &&
      isNonNegativeExactAmount(value.excludedAmount, value.currencyCode) &&
      isNonNegativeExactAmount(value.withheldAmount, value.currencyCode) &&
      isReasonCodes(value.reasonCodes) &&
      (requestedCurrencyCode === undefined || value.currencyCode === requestedCurrencyCode)
    );
  }
  return (
    value.status === 'unavailable' &&
    hasExactFinancialSavingsFields(value, ['status', 'completeness', 'reasonCodes']) &&
    value.completeness === 'unavailable' &&
    isReasonCodes(value.reasonCodes)
  );
};

const canonicalizeMoney = (value: FinancialSurfaceMoneyV1): FinancialSurfaceMoneyV1 =>
  value.status === 'available' ? value : { ...value, reasonCodes: [...value.reasonCodes].sort() as [string, ...string[]] };

export const canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1 = (
  value: FinancialCurrentSpendSurfaceProjectionIdentityPreimageV1
): string =>
  JSON.stringify(
    canonicalizeFinancialSavingsJsonValue({
      ...value,
      providerAccountRefs: [...value.providerAccountRefs].sort(),
      coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate => ({ ...coordinate, value: canonicalizeMoney(coordinate.value) })),
    })
  );

export const createFinancialCurrentSpendSurfaceProjectionIdV1 = (
  value: FinancialCurrentSpendSurfaceProjectionIdentityPreimageV1
): string => `sha256:${sha256Utf8(canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1(value))}`;

export const isFinancialCurrentSpendSurfaceProjectionV1 = (value: unknown): value is FinancialCurrentSpendSurfaceProjectionV1 => {
  if (
    !isFinancialSavingsRecord(value) ||
    !hasExactFinancialSavingsFields(value, [
      'schemaVersion',
      'contractVersion',
      'projectionId',
      'provider',
      'providerAccountRefs',
      'artifactGeneration',
      'financialAuthorityId',
      'scope',
      'coordinates',
    ]) ||
    value.schemaVersion !== FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_SCHEMA_VERSION_V1 ||
    value.contractVersion !== FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_CONTRACT_VERSION_V1 ||
    !isFinancialSavingsHash(value.projectionId) ||
    value.provider !== 'azure' ||
    !Array.isArray(value.providerAccountRefs) ||
    value.providerAccountRefs.length === 0 ||
    value.providerAccountRefs.length > 64 ||
    !value.providerAccountRefs.every(isFinancialSavingsIdentity) ||
    new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
    !isFinancialSavingsRecord(value.artifactGeneration) ||
    !hasExactFinancialSavingsFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
    !isFinancialSavingsIdentity(value.artifactGeneration.runId) ||
    !isFinancialSavingsIsoInstant(value.artifactGeneration.generatedAt) ||
    !isFinancialSavingsHash(value.financialAuthorityId) ||
    !isFinancialSavingsRecord(value.scope) ||
    !hasExactFinancialSavingsFields(value.scope, ['kind', 'scopeId', 'scopeFingerprint']) ||
    typeof value.scope.kind !== 'string' ||
    !SCOPE_KINDS.has(value.scope.kind) ||
    !isFinancialSavingsIdentity(value.scope.scopeId) ||
    !isFinancialSavingsHash(value.scope.scopeFingerprint) ||
    !Array.isArray(value.coordinates) ||
    value.coordinates.length === 0 ||
    value.coordinates.length > MAX_COORDINATES
  )
    return false;

  const coordinates = value.coordinates as unknown[];
  if (
    !coordinates.every(
      coordinate =>
        isFinancialSavingsRecord(coordinate) &&
        hasExactFinancialSavingsFields(
          coordinate,
          [
            'coordinateId',
            'periodRole',
            'period',
            'costBasis',
            'estimateLens',
            'chargeInclusionPolicyRef',
            'currentSpendCompositionId',
            'value',
          ],
          ['requestedCurrencyCode']
        ) &&
        isFinancialSavingsHash(coordinate.currentSpendCompositionId) &&
        isFinancialSurfaceCoordinateDefinitionV1(
          Object.fromEntries(
            Object.entries(coordinate).filter(([key]) => key !== 'value' && key !== 'currentSpendCompositionId')
          )
        ) &&
        isFinancialSurfaceMoneyV1(coordinate.value, coordinate.requestedCurrencyCode as string | undefined)
    ) ||
    new Set(coordinates.map(coordinate => (coordinate as Record<string, unknown>).coordinateId)).size !== coordinates.length
  )
    return false;

  const projection = value as unknown as FinancialCurrentSpendSurfaceProjectionV1;
  const { projectionId: _projectionId, ...identity } = projection;
  return projection.projectionId === createFinancialCurrentSpendSurfaceProjectionIdV1(identity);
};
