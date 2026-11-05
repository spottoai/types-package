import { type AzureNativeDiscountEligibilityV1 } from './financialChargePolicy.js';
/**
 * Optional eligibility on an existing billing/display row; amounts use the same major units as cost/costAmortized.
 * Eligible means proven Azure-native, excluding known Reservation/SavingsPlan PricingModel charges (including
 * purchases/usage/refunds). Marketplace/unknown-source charges are excluded. Missing native models keep legacy
 * membership, not an inferred OnDemand classification. Source/subject/generation/period/currency inherit the
 * owning unadjusted row/artifact. Aggregate membership must come from its input rows, never a synthetic model.
 */
export interface AzureNativeDiscountEligibleCostV1 {
    /** Signed eligible subset of this row's billed cost. Absence is unavailable, not zero. */
    azureNativeDiscountEligibleCost?: number;
    /** Independent signed amortized subset; never substitute billed evidence. */
    azureNativeDiscountEligibleCostAmortized?: number;
    /** Gross membership of native input rows, including zero-cost and cancelling commitment rows. */
    azureNativeDiscountEligibility?: AzureNativeDiscountEligibilityV1;
}
/** Existing display-spend coordinates. Each key retains its enclosing field's period, basis and provenance. */
export declare const AZURE_NATIVE_DISCOUNT_ELIGIBLE_SPEND_FIELDS_V1: readonly ["spendBilling", "spendBillingAmortized", "spendPreviousBilling", "spendPreviousBillingAmortized", "spend30Days", "spend30DaysAmortized", "spendPrevious30Days", "spendPrevious30DaysAmortized", "spend7Days", "spend7DaysAmortized", "spendPrevious7Days", "spendPrevious7DaysAmortized", "spend30DaysActual", "spend30DaysAmortizedActual", "spend30DaysBillingBacked", "spend30DaysAmortizedBillingBacked", "spend30DaysEstimated", "spend30DaysAmortizedEstimated"];
export type AzureNativeDiscountEligibleSpendFieldV1 = (typeof AZURE_NATIVE_DISCOUNT_ELIGIBLE_SPEND_FIELDS_V1)[number];
/**
 * Unadjusted major-unit eligible subsets keyed by the corresponding existing spend field.
 * Each present key requires that base field on the enclosing object. Missing keys are unavailable;
 * zero and signed refunds are valid, including subsets larger than the signed all-charge total.
 * Membership follows AzureNativeDiscountEligibleCostV1's native-source/known-commitment rule.
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
/**
 * Validates only the optional cost-eligibility extension and its base amounts, not the whole billing row.
 * Does not prove publisher/membership lineage. All-eligible native membership does not imply that an
 * all-charge row contains no Marketplace amounts, so eligible is not required to equal the row total.
 */
export declare const hasValidAzureNativeDiscountEligibleCostV1: (value: unknown) => boolean;
/** Exact nested map validator. An empty supplied map is not produced eligibility evidence. */
export declare const isAzureNativeDiscountEligibleSpendV1: (value: unknown) => value is AzureNativeDiscountEligibleSpendV1;
/**
 * Validates the optional spend extension and binds each subset to its own finite base field.
 * Other enclosing fields remain governed by their owning DTO. Legacy omission stays valid.
 */
export declare const hasValidAzureNativeDiscountEligibleSpendProjectionV1: (value: unknown) => boolean;
//# sourceMappingURL=nativeDiscountEligibility.d.ts.map