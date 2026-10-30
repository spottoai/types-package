import { type ActivityLogProviderName, type ActivityLogProviderScopeIdentity, type PortalActivityLogAnalysisScope } from './activityLogAnalysis';
type ValidationSurface = 'public' | 'conformed';
/** Checks identity fields on an already structurally validated envelope or scope. */
export declare const hasActivityLogProviderIdentity: (value: Record<string, unknown>, surface?: ValidationSurface) => value is Record<string, unknown> & ActivityLogProviderScopeIdentity;
/** An omitted discriminator is Azure only; an AWS-looking ID never selects AWS implicitly. */
export declare const activityLogProviderName: (value: ActivityLogProviderScopeIdentity) => ActivityLogProviderName;
/** A filter must stay in the declared account even when no matching evidence is returned. */
export declare const isActivityLogAnalysisResourceFilter: (value: ActivityLogProviderScopeIdentity & {
    resourceId?: unknown;
}) => boolean;
/** Shared native scope validation for classifications, conformed artifacts and public responses. */
export declare const isPortalActivityLogAnalysisScope: (value: unknown, surface?: ValidationSurface) => value is PortalActivityLogAnalysisScope;
/** Prevents mixed-provider nested evidence and Azure platform labels on AWS evidence. */
export declare const hasActivityLogProviderEvidence: (value: unknown, providerName: ActivityLogProviderName, surface?: ValidationSurface) => boolean;
/** Facets are validated structurally before this provider-specific vocabulary check. */
export declare const hasActivityLogProviderFacets: (facets: {
    tags: unknown;
    executionOrigins: unknown;
}, providerName: ActivityLogProviderName) => boolean;
export {};
//# sourceMappingURL=activityLogAnalysisScopeValidation.d.ts.map