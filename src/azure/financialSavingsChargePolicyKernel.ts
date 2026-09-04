import { resolveFinancialChargeInclusionPolicyV1, type FinancialChargeCompositionV1 } from './financialChargeComposition';
import type { FinancialSavingsAllocationV1 } from './financialSavingsAuthority';
import type { FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';

export type FinancialSavingsPolicyAllocationDispositionV1 = 'included' | 'excluded' | 'unavailable';

/**
 * Classifies a savings allocation against one registered charge policy without
 * splitting its money. A mixed or unknown affected-component set is
 * unavailable because the allocation carries one reconciled delta, not a
 * per-component delta that a consumer could apportion safely.
 */
export const classifyFinancialSavingsAllocationForPolicyV1 = (
  chargeCompositionByBaselineId: ReadonlyMap<string, FinancialChargeCompositionV1>,
  allocation: Pick<FinancialSavingsAllocationV1, 'baselineId' | 'billableComponentIds'>,
  policyRef: FinancialChargeInclusionPolicyRefV2
): FinancialSavingsPolicyAllocationDispositionV1 => {
  const policy = resolveFinancialChargeInclusionPolicyV1(policyRef);
  if (!policy || allocation.billableComponentIds.length === 0) return 'unavailable';
  const composition = chargeCompositionByBaselineId.get(allocation.baselineId);
  if (!composition) return 'unavailable';
  const sourceByComponentId = new Map(
    composition.buckets.flatMap(bucket => bucket.componentIds.map(componentId => [componentId, bucket.chargeSource] as const))
  );
  const dispositions = new Set<FinancialSavingsPolicyAllocationDispositionV1>();
  for (const componentId of allocation.billableComponentIds) {
    const source = sourceByComponentId.get(componentId);
    if (!source || policy.withholdSources.includes(source)) return 'unavailable';
    if (policy.includeSources.includes(source)) dispositions.add('included');
    else if (policy.excludeSources.includes(source)) dispositions.add('excluded');
    else return 'unavailable';
  }
  return dispositions.size === 1 ? [...dispositions][0] : 'unavailable';
};
