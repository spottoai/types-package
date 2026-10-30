import { type EnvironmentLogicalResourceReferenceV1, type EnvironmentMoneyValueV1 } from './contracts.js';
/** @internal Exact content keys shared by the provider-specific envelope guards. */
export declare const ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1: readonly ["estateSummary", "costSummary", "serviceFamilyRollups", "estateCostRollups", "costDrivers", "pillars", "findings", "recommendations", "changes", "warnings", "sourceReferences"];
export declare const ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1: readonly ["commitments", "budgets", "idleResources", "publicIpExposure", "secretStoreCoverage", "tagCoverage", "changeSignals", "healthEvents", "dataProtection", "secureScore"];
/** @internal Provider policies preserve the shared content invariants without accepting foreign evidence. */
export interface EnvironmentProjectionValidationPolicyV1 {
    isEvidenceReference(value: unknown): boolean;
    isResourceReference(value: unknown): value is EnvironmentLogicalResourceReferenceV1;
    isResourceTypeArray(value: unknown): value is string[];
    resourceTypesMatchReferences(types: readonly string[], references: readonly unknown[]): boolean;
    isPortalRoute(value: unknown): value is string;
    isMoneyValue(value: unknown): value is EnvironmentMoneyValueV1<string>;
}
/** @internal Builds the common bounded-content guard for one provider/scope policy. */
export declare const createEnvironmentProjectionContentValidatorV1: (policy: EnvironmentProjectionValidationPolicyV1) => (value: Record<string, unknown>) => boolean;
//# sourceMappingURL=projectionValidation.d.ts.map