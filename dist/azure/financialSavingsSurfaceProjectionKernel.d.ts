import type { AzureResourcesView } from './views';
import type { FinancialAuthorityViewV1 } from './financialAuthorityView';
import type { FinancialSavingsAuthorityV1 } from './financialSavingsAuthority';
import type { FinancialChargeInclusionPolicyRefV2 } from './financialScopeBaseline';
import { type FinancialSavingsSurfaceProjectionV1, type FinancialSavingsSurfaceV1 } from './financialSavingsSurfaceProjection';
export declare class FinancialSavingsSurfaceProjectionError extends Error {
    constructor(message: string);
}
/**
 * Private projection input used while a producer still holds the full authority
 * in memory. Full authorities are deliberately not part of persisted Resources
 * views; only the bounded surface projection crosses the artifact boundary.
 */
export type FinancialSavingsSurfaceProjectionSourceV1 = Pick<AzureResourcesView, 'artifactGeneration'> & {
    financialAuthority: FinancialAuthorityViewV1;
    financialSavingsAuthority: FinancialSavingsAuthorityV1;
};
export declare const projectFinancialSavingsSurfaceQueryV1: (source: FinancialSavingsSurfaceProjectionV1, recommendationIds: readonly string[], filterFingerprint: string) => FinancialSavingsSurfaceProjectionV1;
export declare const projectFinancialSavingsSurfaceResourceQueryV1: (source: FinancialSavingsSurfaceProjectionV1, allocationIds: readonly string[], recommendationIds: readonly string[], filterFingerprint: string) => FinancialSavingsSurfaceProjectionV1;
/**
 * Projects a validated Resources authority into a compact, immutable surface.
 * It partitions canonical allocation amounts for display and never recalculates
 * scenario economics from legacy recommendation or resource fields.
 */
export declare const buildFinancialSavingsSurfaceProjectionV1: (resourcesView: FinancialSavingsSurfaceProjectionSourceV1, surface: FinancialSavingsSurfaceV1, chargeInclusionPolicyRef?: FinancialChargeInclusionPolicyRefV2) => FinancialSavingsSurfaceProjectionV1;
//# sourceMappingURL=financialSavingsSurfaceProjectionKernel.d.ts.map