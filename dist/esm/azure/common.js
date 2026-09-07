import { isAzureProviderScopeFinancialChargeSpendBreakdownV1, } from './financialChargePolicy.js';
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && Object.keys(value).every(field => allowed.has(field));
};
const isOptionalFiniteNumber = (value) => value === undefined || (typeof value === 'number' && Number.isFinite(value));
const isResourceCostType = (value) => isRecord(value) &&
    hasExactFields(value, ['name'], ['cost', 'costAmortized', 'costKind', 'commitmentPurchaseCost', 'commitmentPurchaseCostAmortized']) &&
    typeof value.name === 'string' &&
    value.name.length > 0 &&
    value.name === value.name.trim() &&
    isOptionalFiniteNumber(value.cost) &&
    isOptionalFiniteNumber(value.costAmortized) &&
    isOptionalFiniteNumber(value.commitmentPurchaseCost) &&
    isOptionalFiniteNumber(value.commitmentPurchaseCostAmortized) &&
    (value.costKind === undefined || value.costKind === 'usage' || value.costKind === 'commitment-purchase' || value.costKind === 'mixed');
/** Exact validator for one Azure-native daily/month display projection. */
export const isAzureNativeFinancialSummaryV1 = (value) => isRecord(value) &&
    hasExactFields(value, ['contractVersion', 'policyRef', 'status', 'resourceTypes'], ['cost', 'costAmortized', 'financialChargeSpend']) &&
    value.contractVersion === 'azure-native-financial-summary/v1' &&
    value.policyRef === 'azure-cloud-services-excluding-marketplace/v1' &&
    (value.status === 'complete' || value.status === 'partial') &&
    isOptionalFiniteNumber(value.cost) &&
    isOptionalFiniteNumber(value.costAmortized) &&
    (value.financialChargeSpend === undefined || isAzureProviderScopeFinancialChargeSpendBreakdownV1(value.financialChargeSpend)) &&
    Array.isArray(value.resourceTypes) &&
    value.resourceTypes.every(isResourceCostType);
