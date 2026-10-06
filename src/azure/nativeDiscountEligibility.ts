import { isAzureNativeDiscountEligibilityV1, type AzureNativeDiscountEligibilityV1 } from './financialChargePolicy.js';

/** Optional eligibility on an existing billing/display row; amounts use the same major units as cost/costAmortized. */
export interface AzureNativeDiscountEligibleCostV1 {
  /** Signed eligible subset of this row's billed cost. Absence is unavailable, not zero. */
  azureNativeDiscountEligibleCost?: number;
  /** Independent signed amortized subset; never substitute billed evidence. */
  azureNativeDiscountEligibleCostAmortized?: number;
  /** Gross membership of native input rows, including zero-cost and cancelling commitment rows. */
  azureNativeDiscountEligibility?: AzureNativeDiscountEligibilityV1;
}

/** Existing display-spend coordinates. Each key retains its enclosing field's period, basis and provenance. */
export const AZURE_NATIVE_DISCOUNT_ELIGIBLE_SPEND_FIELDS_V1 = [
  'spendBilling',
  'spendBillingAmortized',
  'spendPreviousBilling',
  'spendPreviousBillingAmortized',
  'spend30Days',
  'spend30DaysAmortized',
  'spendPrevious30Days',
  'spendPrevious30DaysAmortized',
  'spend7Days',
  'spend7DaysAmortized',
  'spendPrevious7Days',
  'spendPrevious7DaysAmortized',
  'spend30DaysActual',
  'spend30DaysAmortizedActual',
  'spend30DaysBillingBacked',
  'spend30DaysAmortizedBillingBacked',
  'spend30DaysEstimated',
  'spend30DaysAmortizedEstimated',
] as const;

export type AzureNativeDiscountEligibleSpendFieldV1 = (typeof AZURE_NATIVE_DISCOUNT_ELIGIBLE_SPEND_FIELDS_V1)[number];

/**
 * Unadjusted major-unit eligible subsets keyed by the corresponding existing spend field.
 * Each present key requires that base field on the enclosing object. Missing keys are unavailable;
 * zero and signed refunds are valid, including subsets larger than the signed all-charge total.
 * Source/generation/subject/currency/period inherit the enclosing display object; this does not replace
 * formal financial evidence, add charges, or authorize a uniform rate on forecasts/unmapped fields.
 */
export type AzureNativeDiscountEligibleSpendV1 = Partial<Record<AzureNativeDiscountEligibleSpendFieldV1, number>>;

/** Optional evidence on an existing display breakdown or native stats object. No companion rows. */
export interface AzureNativeDiscountEligibleSpendProjectionV1 {
  azureNativeDiscountEligible?: AzureNativeDiscountEligibleSpendV1;
  /** Gross native membership for the covered coordinates only; cannot lend evidence to an unmapped amount. */
  azureNativeDiscountEligibility?: AzureNativeDiscountEligibilityV1;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const COST_FIELDS = ['cost', 'costAmortized'] as const;
const ELIGIBLE_COST_FIELDS = ['azureNativeDiscountEligibleCost', 'azureNativeDiscountEligibleCostAmortized'] as const;
const SPEND_FIELDS = new Set<string>(AZURE_NATIVE_DISCOUNT_ELIGIBLE_SPEND_FIELDS_V1);

/**
 * Validates only the optional cost-eligibility extension and its base amounts, not the whole billing row.
 * Does not prove publisher/membership lineage. All-eligible native membership does not imply that an
 * all-charge row contains no Marketplace amounts, so eligible is not required to equal the row total.
 */
export const hasValidAzureNativeDiscountEligibleCostV1 = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  let present = false;
  for (const [index, key] of ELIGIBLE_COST_FIELDS.entries()) {
    const eligible = value[key];
    if (eligible === undefined) continue;
    present = true;
    if (!isFiniteNumber(eligible) || !isFiniteNumber(value[COST_FIELDS[index]])) return false;
    if (value.azureNativeDiscountEligibility === 'none-eligible' && eligible !== 0) return false;
  }
  if (value.azureNativeDiscountEligibility === undefined) return true;
  return present && isAzureNativeDiscountEligibilityV1(value.azureNativeDiscountEligibility) && COST_FIELDS.every((key, index) =>
    value[key] === undefined || (isFiniteNumber(value[key]) && value[ELIGIBLE_COST_FIELDS[index]] !== undefined));
};

/** Exact nested map validator. An empty supplied map is not produced eligibility evidence. */
export const isAzureNativeDiscountEligibleSpendV1 = (value: unknown): value is AzureNativeDiscountEligibleSpendV1 =>
  isRecord(value) && Object.keys(value).length > 0 && Object.entries(value).every(([key, amount]) => SPEND_FIELDS.has(key) && isFiniteNumber(amount));

/**
 * Validates the optional spend extension and binds each subset to its own finite base field.
 * Other enclosing fields remain governed by their owning DTO. Legacy omission stays valid.
 */
export const hasValidAzureNativeDiscountEligibleSpendProjectionV1 = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  const eligible = value.azureNativeDiscountEligible;
  const membership = value.azureNativeDiscountEligibility;
  if (eligible === undefined) return membership === undefined;
  if (!isAzureNativeDiscountEligibleSpendV1(eligible) || (membership !== undefined && !isAzureNativeDiscountEligibilityV1(membership))) return false;
  return Object.entries(eligible).every(([key, amount]) => isFiniteNumber(value[key]) && (membership !== 'none-eligible' || amount === 0));
};
