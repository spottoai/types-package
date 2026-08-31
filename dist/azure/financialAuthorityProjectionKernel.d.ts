import { type FinancialAuthorityResourceProjectionV1, type FinancialAuthorityViewV1 } from './financialAuthorityView';
import { type FinancialSavingsAuthorityV1, type FinancialSavingsResourceProjectionV1 } from './financialSavingsAuthority';
/** Derives one compact, non-additive resource view from a validated canonical authority. */
export declare const projectFinancialAuthorityResourceV1: (authority: FinancialAuthorityViewV1, resourceType: string, scopeId: string) => FinancialAuthorityResourceProjectionV1 | undefined;
/** Derives the matching compact savings view for one canonical resource owner. */
export declare const projectFinancialSavingsResourceV1: (savingsAuthority: FinancialSavingsAuthorityV1, financialProjection: FinancialAuthorityResourceProjectionV1, financialAuthority?: FinancialAuthorityViewV1) => FinancialSavingsResourceProjectionV1;
//# sourceMappingURL=financialAuthorityProjectionKernel.d.ts.map