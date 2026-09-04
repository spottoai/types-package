import { type FinancialChargeCompositionV1 } from './financialChargeComposition';
import type { FinancialSavingsAllocationV1 } from './financialSavingsAuthority';
import type { FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';
export type FinancialSavingsPolicyAllocationDispositionV1 = 'included' | 'excluded' | 'unavailable';
/**
 * Classifies a savings allocation against one registered charge policy without
 * splitting its money. A mixed or unknown affected-component set is
 * unavailable because the allocation carries one reconciled delta, not a
 * per-component delta that a consumer could apportion safely.
 */
export declare const classifyFinancialSavingsAllocationForPolicyV1: (chargeCompositionByBaselineId: ReadonlyMap<string, FinancialChargeCompositionV1>, allocation: Pick<FinancialSavingsAllocationV1, "baselineId" | "billableComponentIds">, policyRef: FinancialChargeInclusionPolicyRefV2) => FinancialSavingsPolicyAllocationDispositionV1;
//# sourceMappingURL=financialSavingsChargePolicyKernel.d.ts.map