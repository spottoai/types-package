/** Product bounds for a complete subject population; overflow withholds the affected assessment, never truncates it. */
export declare const AZURE_BENEFIT_ASSESSMENT_DEPENDENCY_LIMITS_V1: Readonly<{
    subjects: 4096;
    decodedBytes: number;
}>;
export interface AzureBenefitAssessmentOwnerV1 {
    companyId: string;
    tenantId: string;
    subscriptionId: string;
}
export interface AzureBenefitAssessmentAdmissionV1 {
    benefitId: string;
    authorityId: string;
    revision: number;
}
export type ScopedAzureBenefitAssessmentAdmissionV1 = AzureBenefitAssessmentAdmissionV1 & {
    owner: AzureBenefitAssessmentOwnerV1;
};
/** Unclaimed Single is an observed subject, not durable absence proof. Every current read must check authority again. */
export type AzureBenefitAssessmentDependencyV1 = (AzureBenefitAssessmentAdmissionV1 & {
    kind: 'admitted';
}) | {
    kind: 'unclaimed-single';
    benefitId: string;
    authorityId: string;
    revision?: never;
};
export type ScopedAzureBenefitAssessmentDependencyV1 = AzureBenefitAssessmentDependencyV1 & {
    owner: AzureBenefitAssessmentOwnerV1;
};
export interface AzureBenefitAssessmentDependenciesV1 {
    schemaVersion: 1;
    /** Complete, canonical sorted unique population, including initially unclaimed Single subjects. Empty differs from missing. */
    subjects: AzureBenefitAssessmentDependencyV1[];
}
/** Current assessment coverage only. Observation time comes from the enclosing generation/current read, never a new lifetime or TTL. */
export type AzureBenefitAssessmentCoverageV1 = {
    status: 'verified';
    reason?: never;
} | {
    status: 'pending';
    reason: 'authority-unavailable' | 'admission-unverified' | 'dependency-limit-exceeded';
};
/** Generic safe diagnostics; cannot carry foreign owners, claim paths or provider/storage errors. */
export declare const isAzureBenefitAssessmentCoverageV1: (value: unknown) => value is AzureBenefitAssessmentCoverageV1;
export interface ScopedAzureBenefitAssessmentDependenciesV1 {
    schemaVersion: 1;
    subjects: ScopedAzureBenefitAssessmentDependencyV1[];
}
/** Private storage reference. Never project this or a foreign owner into public pending output. */
export interface AzureBenefitAssessmentRetirementReferenceV1 {
    operationId: string;
    decisionPath: string;
    precedingRevision: number;
}
interface AzureBenefitAssessmentAuthorityBaseV2 extends AzureBenefitAssessmentAdmissionV1 {
    schemaVersion: 2;
    /** Private provenance of the trusted registration-store binding used for the positive owner join. */
    ownerRegistrationAuthorityId: string;
}
export type AzureBenefitAssessmentAuthorityV2 = AzureBenefitAssessmentAuthorityBaseV2 & ({
    state: 'active';
    owner: AzureBenefitAssessmentOwnerV1;
    lastOwner?: never;
    retirement?: AzureBenefitAssessmentRetirementReferenceV1;
} | {
    state: 'retired';
    lastOwner: AzureBenefitAssessmentOwnerV1;
    owner?: never;
    retirement: AzureBenefitAssessmentRetirementReferenceV1;
});
/** App-owned direct-read result. Absent means authenticated authoritative not-found at this exact binding; errors are unavailable. */
export type AzureBenefitAssessmentAuthorityReadV1 = {
    status: 'present';
    benefitId: string;
    authorityId: string;
    claim: AzureBenefitAssessmentAuthorityV2;
} | {
    status: 'absent' | 'unavailable';
    benefitId: string;
    authorityId: string;
    claim?: never;
};
export interface AzureBenefitAssessmentExpectedContextV1 {
    owner: AzureBenefitAssessmentOwnerV1;
    authorityId: string;
    /** Trusted app registration binding, never supplied by an artifact or native benefit. */
    ownerRegistrationAuthorityId: string;
}
export declare const isAzureBenefitAssessmentRevisionV1: (value: unknown) => value is number;
/** App-owned CAS transitions use this only after validating the exact predecessor; overflow never wraps or resets. */
export declare function nextAzureBenefitAssessmentRevisionV1(revision: number): number;
export declare const isAzureBenefitAssessmentOwnerV1: (value: unknown) => value is AzureBenefitAssessmentOwnerV1;
export declare function canonicalAzureBenefitAssessmentOwnerV1(value: AzureBenefitAssessmentOwnerV1): AzureBenefitAssessmentOwnerV1 | undefined;
export declare const equalAzureBenefitAssessmentOwnerV1: (left: unknown, right: unknown) => boolean;
export declare function canonicalAzureBenefitAssessmentBenefitIdV1(value: unknown): string | undefined;
export declare const isCanonicalAzureBenefitAssessmentBenefitIdV1: (value: unknown) => value is string;
/** The namespace and UTF-8 hash preimage deliberately match existing schema-1 claims. */
export declare function buildAzureBenefitAssessmentOwnerKeyV1(benefitId: string): string;
/** Call with the origin/container of the actual trusted configured Blob client; no regional fallback or caller labels. */
export declare function deriveAzureBenefitAssessmentAuthorityIdV1(storageServiceOrigin: string, container: string): string;
/** Registration tables are fixed by the owner-join contract; this identity binds their actual trusted Table service origin. */
export declare function deriveAzureBenefitAssessmentRegistrationAuthorityIdV1(storageServiceOrigin: string): string;
export declare const isAzureBenefitAssessmentAuthorityIdV1: (value: unknown) => value is string;
export declare const isAzureBenefitAssessmentRegistrationAuthorityIdV1: (value: unknown) => value is string;
export declare const isAzureBenefitAssessmentAdmissionV1: (value: unknown) => value is AzureBenefitAssessmentAdmissionV1;
export declare const isScopedAzureBenefitAssessmentAdmissionV1: (value: unknown) => value is ScopedAzureBenefitAssessmentAdmissionV1;
export declare const isAzureBenefitAssessmentDependencyV1: (value: unknown) => value is AzureBenefitAssessmentDependencyV1;
export declare const isScopedAzureBenefitAssessmentDependencyV1: (value: unknown) => value is ScopedAzureBenefitAssessmentDependencyV1;
/** Exact schema-2 private body. Legacy v1 and unknown/corrupt bodies remain unverified. */
export declare function isAzureBenefitAssessmentAuthorityV2(value: unknown): value is AzureBenefitAssessmentAuthorityV2;
export declare function isAzureBenefitAssessmentAuthorityReadV1(value: unknown): value is AzureBenefitAssessmentAuthorityReadV1;
/** Pure comparison only; does not authorize membership, create a claim or turn missing I/O into absence. No private data is returned. */
export declare function evaluateAzureBenefitAssessmentDependencyV1(dependency: unknown, expected: AzureBenefitAssessmentExpectedContextV1, read: unknown): 'admitted' | 'unclaimed-single' | 'pending';
export declare const isAzureBenefitAssessmentDependenciesV1: (value: unknown) => value is AzureBenefitAssessmentDependenciesV1;
export declare const isScopedAzureBenefitAssessmentDependenciesV1: (value: unknown) => value is ScopedAzureBenefitAssessmentDependenciesV1;
export declare const createAzureBenefitAssessmentDependenciesV1: (subjects: readonly AzureBenefitAssessmentDependencyV1[]) => AzureBenefitAssessmentDependenciesV1;
export declare const createScopedAzureBenefitAssessmentDependenciesV1: (subjects: readonly ScopedAzureBenefitAssessmentDependencyV1[]) => ScopedAzureBenefitAssessmentDependenciesV1;
/** Scoped derivatives bind both the recorded source owner and the app's independently validated expected context. */
export declare function evaluateScopedAzureBenefitAssessmentDependencyV1(dependency: unknown, expected: AzureBenefitAssessmentExpectedContextV1, read: unknown): 'admitted' | 'unclaimed-single' | 'pending';
export {};
//# sourceMappingURL=benefitAssessmentAdmission.d.ts.map