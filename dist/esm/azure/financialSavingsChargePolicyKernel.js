import { resolveFinancialChargeInclusionPolicyV1 } from './financialChargeComposition.js';
/**
 * Classifies a savings allocation against one registered charge policy without
 * splitting its money. A mixed or unknown affected-component set is
 * unavailable because the allocation carries one reconciled delta, not a
 * per-component delta that a consumer could apportion safely.
 */
export const classifyFinancialSavingsAllocationForPolicyV1 = (chargeCompositionByBaselineId, allocation, policyRef) => {
    const policy = resolveFinancialChargeInclusionPolicyV1(policyRef);
    if (!policy || allocation.billableComponentIds.length === 0)
        return 'unavailable';
    const composition = chargeCompositionByBaselineId.get(allocation.baselineId);
    if (!composition)
        return 'unavailable';
    const sourceByComponentId = new Map(composition.buckets.flatMap(bucket => bucket.componentIds.map(componentId => [componentId, bucket.chargeSource])));
    const dispositions = new Set();
    for (const componentId of allocation.billableComponentIds) {
        const source = sourceByComponentId.get(componentId);
        if (!source || policy.withholdSources.includes(source))
            return 'unavailable';
        if (policy.includeSources.includes(source))
            dispositions.add('included');
        else if (policy.excludeSources.includes(source))
            dispositions.add('excluded');
        else
            return 'unavailable';
    }
    return dispositions.size === 1 ? [...dispositions][0] : 'unavailable';
};
