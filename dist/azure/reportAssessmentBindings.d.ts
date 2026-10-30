/** Complete source relationships only; these never establish current authority or permission. */
export interface AzureReportLegacySingleSourceV1 {
    id: string;
    benefitType: 'reservation' | 'savings-plan';
    scope: 'Single';
    subscriptionId?: string;
}
export interface AzureReportAssessmentRowBindingV1 {
    id: string;
    subjectIndices: number[];
    legacySingleSourceIndices: number[];
}
export interface AzureReportCommitmentAssessmentBindingsV1 {
    schemaVersion: 1;
    planningSubjectIndices: number[];
    legacySingleSources: AzureReportLegacySingleSourceV1[];
    obsoleteCandidates: AzureReportAssessmentRowBindingV1[];
    reallocationOpportunities: AzureReportAssessmentRowBindingV1[];
    renewals: AzureReportAssessmentRowBindingV1[];
    inventory: AzureReportAssessmentRowBindingV1[];
}
export declare const AZURE_REPORT_ASSESSMENT_BINDING_LIMITS_V1: Readonly<{
    rows: 4096;
    sources: 4096;
    decodedBytes: number;
}>;
/** Opaque exact IDs have no token grammar or independent length ceiling below the combined wire budget. */
export declare function isAzureReportAssessmentIdV1(value: unknown): value is string;
export declare function isAzureReportLegacySingleSourceV1(value: unknown): value is AzureReportLegacySingleSourceV1;
/** Strict syntax and local relationships. Pack/root relationships require the consistency guard below. */
export declare function isAzureReportCommitmentAssessmentBindingsV1(value: unknown): value is AzureReportCommitmentAssessmentBindingsV1;
/** Pure enclosing-pack consistency, never an admission/current-read decision. Missing metadata returns false. */
export declare function areAzureReportCommitmentAssessmentBindingsConsistentV1(dependencies: unknown, scope: unknown, projection: unknown): boolean;
//# sourceMappingURL=reportAssessmentBindings.d.ts.map