import type { FinancialResourceSurfaceProjectionIdentityPreimageV1, FinancialResourceSurfaceProjectionV1 } from './financialResourceSurfaceProjection';
export declare const canonicalizeFinancialResourceSurfaceProjectionIdentityV1: (value: FinancialResourceSurfaceProjectionIdentityPreimageV1) => string;
export declare const createFinancialResourceSurfaceProjectionIdV1: (value: FinancialResourceSurfaceProjectionIdentityPreimageV1) => string;
/**
 * Selects one resource member without copying unrelated members or coordinates.
 * The returned projection remains independently content-addressed and valid.
 */
export declare const projectFinancialResourceSurfaceMemberV1: (source: FinancialResourceSurfaceProjectionV1, resourceId: string) => FinancialResourceSurfaceProjectionV1 | undefined;
/**
 * Removes mutable recommendation scenarios while preserving authoritative
 * current-spend values. Used when lifecycle state is newer than the immutable
 * financial artifact.
 */
export declare const projectFinancialResourceSurfaceWithoutScenariosV1: (source: FinancialResourceSurfaceProjectionV1) => FinancialResourceSurfaceProjectionV1;
export declare const isFinancialResourceSurfaceProjectionV1: (value: unknown) => value is FinancialResourceSurfaceProjectionV1;
//# sourceMappingURL=financialResourceSurfaceProjectionValidation.d.ts.map