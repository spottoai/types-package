import type { AzureResourcesView } from './views';
import { type FinancialSavingsSurfaceProjectionV1, type FinancialSavingsSurfaceV1 } from './financialSavingsSurfaceProjection';
export declare class FinancialSavingsSurfaceProjectionError extends Error {
    constructor(message: string);
}
export declare const projectFinancialSavingsSurfaceQueryV1: (source: FinancialSavingsSurfaceProjectionV1, recommendationIds: readonly string[], filterFingerprint: string) => FinancialSavingsSurfaceProjectionV1;
export declare const projectFinancialSavingsSurfaceResourceQueryV1: (source: FinancialSavingsSurfaceProjectionV1, allocationIds: readonly string[], recommendationIds: readonly string[], filterFingerprint: string) => FinancialSavingsSurfaceProjectionV1;
/**
 * Projects a validated Resources authority into a compact, immutable surface.
 * It partitions canonical allocation amounts for display and never recalculates
 * scenario economics from legacy recommendation or resource fields.
 */
export declare const buildFinancialSavingsSurfaceProjectionV1: (resourcesView: AzureResourcesView, surface: FinancialSavingsSurfaceV1) => FinancialSavingsSurfaceProjectionV1;
//# sourceMappingURL=financialSavingsSurfaceProjectionKernel.d.ts.map