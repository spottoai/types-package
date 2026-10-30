import type { AssessmentAccess, AssessmentAccessSummary, EvidenceObservation, ScopeScanManifest } from './contracts';
/** The native scope id the access evidence is bound to. */
export declare const assessmentAccessScopeId: (access: AssessmentAccess) => string;
/** The capability that reports provider initialisation (credentials, region discovery) for each provider. */
export declare const ASSESSMENT_PROVIDER_CAPABILITY: Readonly<{
    readonly azure: "azure-provider";
    readonly aws: "aws-provider";
}>;
export declare const parseAssessmentAccessSummary: (value: unknown) => AssessmentAccessSummary;
/** Bounded public evidence: arbitrary sidecar strings and storage locators are rejected. */
export declare const parseAssessmentAccess: (value: unknown) => AssessmentAccess;
export declare const validateScopeScanAccess: (manifest: ScopeScanManifest, observations: readonly EvidenceObservation[]) => Pick<AssessmentAccess, "diagnosticsComplete" | "checks">;
//# sourceMappingURL=accessValidation.d.ts.map