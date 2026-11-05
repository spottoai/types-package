import { hasValidAzureNativeDiscountEligibleSpendProjectionV1, } from './nativeDiscountEligibility.js';
import { isAzureProviderScopeFinancialChargeSpendBreakdownV1, } from './financialChargePolicy.js';
const AZURE_NATIVE_STATS_OPTIONAL_MONEY_FIELDS = [
    'spend30Days',
    'spend30DaysAmortized',
    'spendPrevious30Days',
    'spendPrevious30DaysAmortized',
    'spend7Days',
    'spend7DaysAmortized',
    'spendPrevious7Days',
    'spendPrevious7DaysAmortized',
    'spend30DaysBillingBacked',
    'spend30DaysAmortizedBillingBacked',
    'spend30DaysEstimated',
    'spend30DaysAmortizedEstimated',
];
const isFinancialStatsRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
/** These holders are native-only; all-eligible covered fields must equal their native base. */
const hasValidNativeStatsEligibility = (value) => hasValidAzureNativeDiscountEligibleSpendProjectionV1(value) &&
    (value.azureNativeDiscountEligibility !== 'all-eligible' ||
        Object.entries(value.azureNativeDiscountEligible).every(([key, amount]) => amount === value[key]));
/** Exact top-level validator for the dashboard Azure-native display projection. */
export const isAzureNativeSubscriptionFinancialStatsV1 = (value) => {
    if (!isFinancialStatsRecord(value))
        return false;
    const required = ['contractVersion', 'policyRef', 'status', 'resourcesByLocation', 'resourcesByType'];
    const allowed = new Set([
        ...required,
        'financialChargeSpend',
        'azureNativeDiscountEligible',
        'azureNativeDiscountEligibility',
        ...AZURE_NATIVE_STATS_OPTIONAL_MONEY_FIELDS,
    ]);
    if (!required.every(field => Object.prototype.hasOwnProperty.call(value, field)) || !Object.keys(value).every(field => allowed.has(field))) {
        return false;
    }
    return (value.contractVersion === 'azure-native-subscription-financial-stats/v1' &&
        value.policyRef === 'azure-cloud-services-excluding-marketplace/v1' &&
        (value.status === 'complete' || value.status === 'partial') &&
        (value.financialChargeSpend === undefined || isAzureProviderScopeFinancialChargeSpendBreakdownV1(value.financialChargeSpend)) &&
        Array.isArray(value.resourcesByLocation) &&
        Array.isArray(value.resourcesByType) &&
        hasValidNativeStatsEligibility(value) &&
        [...value.resourcesByLocation, ...value.resourcesByType].every(group => !isFinancialStatsRecord(group) ||
            (group.azureNativeDiscountEligible === undefined && group.azureNativeDiscountEligibility === undefined) ||
            hasValidNativeStatsEligibility(group)) &&
        AZURE_NATIVE_STATS_OPTIONAL_MONEY_FIELDS.every(field => value[field] === undefined || (typeof value[field] === 'number' && Number.isFinite(value[field]))));
};
