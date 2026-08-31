import type { ArtifactGeneration } from '../common/artifactGeneration';
import { type FinancialAuthorityCoordinateIdentityPreimageV1, type FinancialAuthorityResourceProjectionV1, type FinancialAuthorityViewIdentityPreimageV1, type FinancialAuthorityViewV1 } from './financialAuthorityView';
export declare const canonicalizeFinancialAuthorityCoordinateIdentityV1: (value: FinancialAuthorityCoordinateIdentityPreimageV1) => string;
export declare const createFinancialAuthorityCoordinateIdV1: (value: FinancialAuthorityCoordinateIdentityPreimageV1) => string;
export declare const canonicalizeFinancialAuthorityViewIdentityV1: (value: FinancialAuthorityViewIdentityPreimageV1) => string;
export declare const createFinancialAuthorityViewIdV1: (value: FinancialAuthorityViewIdentityPreimageV1) => string;
export declare const isFinancialAuthorityViewV1: (value: unknown) => value is FinancialAuthorityViewV1;
export declare const isFinancialAuthorityViewBoundToArtifactGenerationV1: (value: unknown, expected: ArtifactGeneration) => value is FinancialAuthorityViewV1;
/** Strictly validates one bounded, non-additive resource projection without requiring the full authority ledger. */
export declare const isFinancialAuthorityResourceProjectionV1: (value: unknown) => value is FinancialAuthorityResourceProjectionV1;
//# sourceMappingURL=financialAuthorityViewValidation.d.ts.map