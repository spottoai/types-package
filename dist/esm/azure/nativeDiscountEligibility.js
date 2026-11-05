import { isAzureNativeDiscountEligibilityV1 } from './financialChargePolicy.js';
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
];
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const COST_FIELDS = ['cost', 'costAmortized'];
const ELIGIBLE_COST_FIELDS = ['azureNativeDiscountEligibleCost', 'azureNativeDiscountEligibleCostAmortized'];
const SPEND_FIELDS = new Set(AZURE_NATIVE_DISCOUNT_ELIGIBLE_SPEND_FIELDS_V1);
/**
 * Validates only the optional cost-eligibility extension and its base amounts, not the whole billing row.
 * Does not prove publisher/membership lineage. All-eligible native membership does not imply that an
 * all-charge row contains no Marketplace amounts, so eligible is not required to equal the row total.
 */
export const hasValidAzureNativeDiscountEligibleCostV1 = (value) => {
    if (!isRecord(value))
        return false;
    let present = false;
    for (const [index, key] of ELIGIBLE_COST_FIELDS.entries()) {
        const eligible = value[key];
        if (eligible === undefined)
            continue;
        present = true;
        if (!isFiniteNumber(eligible) || !isFiniteNumber(value[COST_FIELDS[index]]))
            return false;
        if (value.azureNativeDiscountEligibility === 'none-eligible' && eligible !== 0)
            return false;
    }
    if (value.azureNativeDiscountEligibility === undefined)
        return true;
    return (present &&
        isAzureNativeDiscountEligibilityV1(value.azureNativeDiscountEligibility) &&
        COST_FIELDS.every((key, index) => value[key] === undefined || (isFiniteNumber(value[key]) && value[ELIGIBLE_COST_FIELDS[index]] !== undefined)));
};
/** Exact nested map validator. An empty supplied map is not produced eligibility evidence. */
export const isAzureNativeDiscountEligibleSpendV1 = (value) => isRecord(value) && Object.keys(value).length > 0 && Object.entries(value).every(([key, amount]) => SPEND_FIELDS.has(key) && isFiniteNumber(amount));
/**
 * Validates the optional spend extension and binds each subset to its own finite base field.
 * Other enclosing fields remain governed by their owning DTO. Legacy omission stays valid.
 */
export const hasValidAzureNativeDiscountEligibleSpendProjectionV1 = (value) => {
    if (!isRecord(value))
        return false;
    const eligible = value.azureNativeDiscountEligible;
    const membership = value.azureNativeDiscountEligibility;
    if (eligible === undefined)
        return membership === undefined;
    if (!isAzureNativeDiscountEligibleSpendV1(eligible) || (membership !== undefined && !isAzureNativeDiscountEligibilityV1(membership)))
        return false;
    return Object.entries(eligible).every(([key, amount]) => isFiniteNumber(value[key]) && (membership !== 'none-eligible' || amount === 0));
};
