import type { EnvironmentCoverageStateV1, EnvironmentLogicalArtifactReferenceV1, EnvironmentLogicalResourceReferenceV1, EnvironmentMoneyValueV1, EnvironmentProjectionContentV1, EnvironmentSubscriptionSummaryV1, EnvironmentCompiledGenerationPointerV1 } from './contracts.js';
export declare const ENVIRONMENT_AWS_ARTIFACT_KINDS_V1: readonly ["aws-account-summary", "aws-account-resources", "aws-account-recommendations", "aws-account-commitments", "aws-account-reliability", "aws-account-projection", "aws-account-security-posture", "aws-account-health", "aws-account-governance", "aws-account-service-retirements", "aws-account-data-protection", "aws-account-savings-ledger", "aws-account-public-ip-exposure"];
/** Logical direct-publication names, never caller-selected storage paths. */
export declare const ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1: readonly ["summary.json", "resources.json", "recommendations.json", "recommendation-filter-resources.json", "savings-ledgers.json", "serviceretirement.json", "serviceretirement-coverage.json", "commitments-planning.json", "relationships.json.gz", "data-protection.json.gz", "public-ip-addresses.json", "security-posture.json", "health-events.json", "health-availability-statuses.json", "governance.json.gz", "governance-access.json.gz"];
export interface EnvironmentAwsPublicationArtifactV1 {
    name: (typeof ENVIRONMENT_AWS_PUBLICATION_ARTIFACT_NAMES_V1)[number];
    /** Exact strong ETag returned by this publication's write, including quotes. */
    etag: string;
}
export type EnvironmentAwsArtifactKindV1 = (typeof ENVIRONMENT_AWS_ARTIFACT_KINDS_V1)[number];
export interface EnvironmentAwsAccountScopeV1 {
    kind: 'aws-account';
    companyId: string;
    /** Exactly twelve decimal digits; retain leading zeros. */
    accountId: string;
}
/** Receipt of one completed direct publication; readers revalidate every admitted source. */
export interface EnvironmentAwsAccountSourceBindingV1 {
    kind: 'aws-account-portal-publication';
    scope: EnvironmentAwsAccountScopeV1;
    /** Opaque source identity, never an environment storage path segment. */
    portalRunId: string;
    portalGeneratedAt: string;
    completedAt: string;
    /** Sorted unique write receipts; summary, resources and recommendations are required. */
    artifacts: EnvironmentAwsPublicationArtifactV1[];
}
export type EnvironmentAwsLogicalArtifactReferenceV1 = `spotto://artifact/v1/${EnvironmentAwsArtifactKindV1}/${string}`;
export type EnvironmentAwsLogicalResourceReferenceV1 = `spotto://resource/v1/aws/${string}`;
export type EnvironmentAwsLogicalEvidenceReferenceV1 = EnvironmentAwsLogicalArtifactReferenceV1 | EnvironmentAwsLogicalResourceReferenceV1;
export interface ParsedEnvironmentAwsLogicalArtifactReferenceV1 {
    kind: 'artifact';
    artifactKind: EnvironmentAwsArtifactKindV1;
    scope: EnvironmentAwsAccountScopeV1;
}
export interface ParsedEnvironmentAwsLogicalResourceReferenceV1 {
    kind: 'resource';
    scope: EnvironmentAwsAccountScopeV1;
    /** Canonical CloudFormation-style type supplied by the owning engine. */
    resourceType: string;
    /** Case-preserving ARN or scoped native identity. Consumer must prove ownership. */
    resourceId: string;
}
export type EnvironmentAwsMoneyProvenanceV1 = 'account-summary' | 'account-resources' | 'cost-savings-summary' | 'savings-aggregate' | 'recommendation';
export type EnvironmentAwsMoneyValueV1 = EnvironmentMoneyValueV1<EnvironmentAwsMoneyProvenanceV1>;
/** Reuse all bounded content while selecting AWS reference and money namespaces. */
type AwsContent<Value> = Value extends EnvironmentLogicalResourceReferenceV1 ? EnvironmentAwsLogicalResourceReferenceV1 : Value extends EnvironmentLogicalArtifactReferenceV1 ? EnvironmentAwsLogicalArtifactReferenceV1 : Value extends EnvironmentMoneyValueV1 ? EnvironmentAwsMoneyValueV1 : Value extends object ? {
    [Key in keyof Value]: AwsContent<Value[Key]>;
} : Value;
export interface EnvironmentAwsAccountSourceCoverageV1 {
    completedPortalPublication: EnvironmentCoverageStateV1;
    accountSummary: EnvironmentCoverageStateV1;
    resources: EnvironmentCoverageStateV1;
    recommendations: EnvironmentCoverageStateV1;
    commitments: EnvironmentCoverageStateV1;
    reliability: EnvironmentCoverageStateV1;
    securityPosture: EnvironmentCoverageStateV1;
    health: EnvironmentCoverageStateV1;
    governance: EnvironmentCoverageStateV1;
    serviceRetirement: EnvironmentCoverageStateV1;
    dataProtection: EnvironmentCoverageStateV1;
    savingsLedger: EnvironmentCoverageStateV1;
    publicIpExposure: EnvironmentCoverageStateV1;
}
export interface EnvironmentAwsAccountProjectionV1 extends AwsContent<Omit<EnvironmentProjectionContentV1, 'secretStoreCoverage'>> {
    schemaVersion: 1;
    scope: EnvironmentAwsAccountScopeV1;
    sourceBinding: EnvironmentAwsAccountSourceBindingV1;
    generatedAt: string;
    account: EnvironmentSubscriptionSummaryV1;
    sourceCoverage: EnvironmentAwsAccountSourceCoverageV1;
}
export interface EnvironmentAwsAccountCompiledGenerationPointerV1 extends Omit<EnvironmentCompiledGenerationPointerV1, 'scope' | 'sourceBinding'> {
    scope: EnvironmentAwsAccountScopeV1;
    sourceBinding: EnvironmentAwsAccountSourceBindingV1;
}
export {};
//# sourceMappingURL=awsContracts.d.ts.map