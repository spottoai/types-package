import type { ArtifactGeneration } from '../common/artifactGeneration.js';
import type { ProviderName } from '../common/provider.js';
import type { AwsCommitmentShape, AwsCommitmentsSourceMetadata, CommitmentRecommendationAction, CommitmentsCommitmentFamily, CommitmentsConfidenceLevel, CommitmentsExpirySummary, CommitmentsFreshnessStatus, CommitmentsFreshnessSummary, CommitmentsInventoryStatus, CommitmentsMoneyAmount, CommitmentsPricingContext, CommitmentsRiskLevel, CommitmentsSourceMetadata, CommitmentsUtilizationSummary } from '../azure/commitmentsPlanning.js';
import type { BenefitScope, BenefitType, IBenefitUtilization } from '../azure/benefits.js';
import type { AwsForbiddenCredentialFields } from './requests.js';
export declare const AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION: 1;
export declare const AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES: readonly ["account-inventory", "payer-analytics", "payer-recommendations", "materialization", "publication"];
export declare const AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES: readonly ["not-started", "pending", "processing", "fresh", "partial", "failed"];
export declare const AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES: readonly ["pending", "processing", "fresh", "partial", "failed", "skipped"];
export declare const AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS: readonly ["estate-disabled", "estate-not-ready", "management-account-missing", "commitments-permission-missing", "not-authorized", "unknown"];
export declare const AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS: readonly ["not-collected", "not-proved", "source-unavailable"];
export declare const AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES: readonly ["estate-disabled", "manifest-revision-mismatch", "organization-identity-invalid", "management-account-unavailable", "commitments-permission-missing", "account-inventory-partial", "payer-analytics-unavailable", "payer-recommendations-unavailable", "source-refresh-failed", "materialization-failed", "publication-failed", "refresh-cooldown", "unknown"];
export declare const AWS_ORGANIZATION_COMMITMENTS_SESSION_ID_PREFIX: "aws-org-commitments:";
export type AwsOrganizationCommitmentsSchemaVersion = typeof AWS_ORGANIZATION_COMMITMENTS_SCHEMA_VERSION;
export type AwsOrganizationCommitmentsRefreshStageId = (typeof AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGES)[number];
export type AwsOrganizationCommitmentsRefreshState = (typeof AWS_ORGANIZATION_COMMITMENTS_REFRESH_STATES)[number];
export type AwsOrganizationCommitmentsRefreshStageStatus = (typeof AWS_ORGANIZATION_COMMITMENTS_REFRESH_STAGE_STATUSES)[number];
export type AwsOrganizationCommitmentsScopeUnavailableReason = (typeof AWS_ORGANIZATION_COMMITMENTS_SCOPE_UNAVAILABLE_REASONS)[number];
export type AwsOrganizationCommitmentsAttributionUnavailableReason = (typeof AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS)[number];
export type AwsOrganizationCommitmentsIssueCode = (typeof AWS_ORGANIZATION_COMMITMENTS_ISSUE_CODES)[number];
/** Builds the bounded Service Bus session identity shared by API and engine. */
export declare function buildAwsOrganizationCommitmentsSessionId(companyId: string, estateId: string): string;
type AwsOrganizationCommitmentsForbiddenFields = AwsForbiddenCredentialFields & {
    externalId?: never;
    roleArn?: never;
    secretArn?: never;
    secretReference?: never;
    credentialReference?: never;
    connectionString?: never;
    sasToken?: never;
    storagePath?: never;
    blobPath?: never;
    checkpoint?: never;
    saga?: never;
};
export interface AwsAccountCommitmentsPlanningReadScope<AccountId extends string = string> extends AwsOrganizationCommitmentsForbiddenFields {
    provider: 'AWS';
    scopeType: 'account';
    accountId: AccountId;
    companyId?: never;
    estateId?: never;
    organizationId?: never;
    managementAccountId?: never;
}
export interface AwsOrganizationCommitmentsPlanningReadScope<CompanyId extends string = string, EstateId extends string = string, OrganizationId extends string = string, ManagementAccountId extends string = string> extends AwsOrganizationCommitmentsForbiddenFields {
    provider: 'AWS';
    scopeType: 'organization';
    companyId: CompanyId;
    estateId: EstateId;
    organizationId: OrganizationId;
    managementAccountId: ManagementAccountId;
    accountId?: never;
}
export type AwsCommitmentsPlanningReadScope = AwsAccountCommitmentsPlanningReadScope | AwsOrganizationCommitmentsPlanningReadScope;
export interface AwsOrganizationCommitmentsScopeSummary extends AwsOrganizationCommitmentsForbiddenFields {
    scopeType: 'organization';
    estateId: string;
    name: string;
    organizationId: string;
    managementAccountId: string;
    accountCount: number;
    availability: 'available' | 'unavailable';
    canView: boolean;
    canRefresh: boolean;
    reason?: AwsOrganizationCommitmentsScopeUnavailableReason;
}
export interface AwsOrganizationCommitmentsScopeListResponse extends AwsOrganizationCommitmentsForbiddenFields {
    schemaVersion: AwsOrganizationCommitmentsSchemaVersion;
    provider: 'AWS';
    companyId: string;
    organizations: AwsOrganizationCommitmentsScopeSummary[];
}
interface AwsOrganizationCommitmentsRefreshAcceptedResponseBase extends AwsOrganizationCommitmentsPlanningReadScope {
    schemaVersion: AwsOrganizationCommitmentsSchemaVersion;
    requestId: string;
    correlationId: string;
    manifestRevision: string;
    acceptedAt: string;
}
export type AwsOrganizationCommitmentsRefreshAcceptedResponse = AwsOrganizationCommitmentsRefreshAcceptedResponseBase & ({
    disposition: 'accepted' | 'already-running';
    nextEligibleAt?: never;
} | {
    disposition: 'cooldown';
    nextEligibleAt: string;
});
export interface AwsOrganizationCommitmentsRefreshStage {
    id: AwsOrganizationCommitmentsRefreshStageId;
    status: AwsOrganizationCommitmentsRefreshStageStatus;
    completedCount?: number;
    totalCount?: number;
    failureCode?: AwsOrganizationCommitmentsIssueCode;
    retryable?: boolean;
    updatedAt: string;
}
export interface AwsOrganizationCommitmentsLatestArtifact {
    state: 'available' | 'stale' | 'unavailable';
    generatedAt?: string;
    artifactGeneration?: ArtifactGeneration;
}
/** Sanitized public projection of organization refresh state, never the engine saga. */
export interface AwsOrganizationCommitmentsRefreshStatusResponse extends AwsOrganizationCommitmentsPlanningReadScope {
    schemaVersion: AwsOrganizationCommitmentsSchemaVersion;
    targetManifestRevision: string;
    state: AwsOrganizationCommitmentsRefreshState;
    requestId?: string;
    correlationId?: string;
    requestedAt?: string;
    updatedAt: string;
    stages: AwsOrganizationCommitmentsRefreshStage[];
    failureCode?: AwsOrganizationCommitmentsIssueCode;
    retryable?: boolean;
    nextEligibleAt?: string;
    latestArtifact?: AwsOrganizationCommitmentsLatestArtifact;
}
export interface AwsOrganizationCommitmentsPlanningProviderScope<CompanyId extends string = string, EstateId extends string = string, OrganizationId extends string = string, ManagementAccountId extends string = string> extends AwsOrganizationCommitmentsForbiddenFields {
    providerName: ProviderName.Aws;
    providerScopeId: OrganizationId;
    scopeType: 'organization';
    companyId: CompanyId;
    estateId: EstateId;
    organizationId: OrganizationId;
    managementAccountId: ManagementAccountId;
    accountId?: never;
    cloudAccountId?: never;
    status?: never;
}
export interface AwsOrganizationCommitmentsAccount<AccountId extends string = string> {
    accountId: AccountId;
    displayName?: string;
    role: 'management' | 'member';
    inventoryStatus: CommitmentsFreshnessStatus;
    lastSuccessfulRefreshAt?: string;
}
export interface AwsOrganizationCommitmentsInventoryItem<AccountId extends string = string> {
    id: string;
    benefitType: BenefitType;
    commitmentFamily?: CommitmentsCommitmentFamily;
    sourceKind: 'aws-native';
    sourceId?: string;
    provider: ProviderName.Aws;
    ownerAccountId: AccountId;
    shape?: AwsCommitmentShape;
    scope: BenefitScope;
    type: string;
    displayName?: string;
    status: CommitmentsInventoryStatus;
    purchaseDate?: string;
    expiryDate?: string;
    daysToExpiry?: number;
    commitmentAmount?: number;
    commitmentCurrencyCode?: string;
    commitmentGrain?: string;
    commitmentUnit?: string;
    skuName?: string;
    location?: string;
    term?: string;
    termMonths?: number;
    billingPlan?: string;
    utilization?: IBenefitUtilization;
}
export interface AwsOrganizationCommitmentsPayerAggregate<AccountId extends string = string> {
    benefitType: BenefitType;
    commitmentFamily: CommitmentsCommitmentFamily;
    payerAccountId: AccountId;
    windowStart: string;
    windowEnd: string;
    eligibleCost?: CommitmentsMoneyAmount;
    coveredCost?: CommitmentsMoneyAmount;
    uncoveredCost?: CommitmentsMoneyAmount;
    coveragePercent?: number;
    utilization?: IBenefitUtilization;
    source: AwsCommitmentsSourceMetadata;
}
/** Phase-one sharing posture until an authoritative organization source is persisted. */
export interface AwsOrganizationCommitmentsSharingPosture {
    status: 'unknown';
    reason: 'not-collected';
}
export interface AwsOrganizationCommitmentsPurchaseRecommendation<AccountId extends string = string> {
    id: string;
    groupKey: string;
    commitmentFamily: CommitmentsCommitmentFamily;
    action: CommitmentRecommendationAction;
    purchaseScope: 'payer';
    payerAccountId: AccountId;
    recommendedAccountId?: AccountId;
    source: AwsCommitmentsSourceMetadata;
    targetShape: AwsCommitmentShape;
    title?: string;
    description?: string;
    confidence?: CommitmentsConfidenceLevel;
    riskLevel?: CommitmentsRiskLevel;
    termMonths?: number;
    quantity?: number;
    estimatedAnnualSavings?: CommitmentsMoneyAmount;
    estimatedAnnualCost?: CommitmentsMoneyAmount;
    estimatedTermSavings?: CommitmentsMoneyAmount;
    estimatedTermCost?: CommitmentsMoneyAmount;
    notes?: string[];
}
export interface AwsOrganizationCommitmentsAllocationRecord<AccountId extends string = string> {
    beneficiaryAccountId: AccountId;
    ownerAccountId?: AccountId;
    commitmentId?: string;
    benefitType: BenefitType;
    commitmentFamily: CommitmentsCommitmentFamily;
    windowStart: string;
    windowEnd: string;
    eligibleCost?: CommitmentsMoneyAmount;
    coveredCost?: CommitmentsMoneyAmount;
    uncoveredCost?: CommitmentsMoneyAmount;
}
export interface AwsOrganizationCommitmentsResourceAttributionRecord<AccountId extends string = string> {
    accountId: AccountId;
    resourceId: string;
    resourceName?: string;
    resourceType?: string;
    benefitIds: string[];
    windowStart: string;
    windowEnd: string;
    coveredCost?: CommitmentsMoneyAmount;
}
export interface AwsOrganizationCommitmentsUnavailableEvidence {
    status: 'unavailable';
    reason: AwsOrganizationCommitmentsAttributionUnavailableReason;
    source?: never;
    records?: never;
}
export type AwsOrganizationCommitmentsAttributionSource = Omit<CommitmentsSourceMetadata, 'sourceKind'> & {
    sourceKind: 'aws-native' | 'spotto-derived';
};
export interface AwsOrganizationCommitmentsAvailableEvidence<RecordType> {
    status: 'available';
    source: AwsOrganizationCommitmentsAttributionSource;
    records: RecordType[];
    reason?: never;
}
export type AwsOrganizationCommitmentsAllocationEvidence<AccountId extends string = string> = AwsOrganizationCommitmentsUnavailableEvidence | AwsOrganizationCommitmentsAvailableEvidence<AwsOrganizationCommitmentsAllocationRecord<AccountId>>;
export type AwsOrganizationCommitmentsResourceAttributionEvidence<AccountId extends string = string> = AwsOrganizationCommitmentsUnavailableEvidence | AwsOrganizationCommitmentsAvailableEvidence<AwsOrganizationCommitmentsResourceAttributionRecord<AccountId>>;
export interface AwsOrganizationCommitmentsPlanningView<CompanyId extends string = string, EstateId extends string = string, OrganizationId extends string = string, AccountId extends string = string> extends AwsOrganizationCommitmentsForbiddenFields {
    version: '1.0';
    generatedAt: string;
    month?: string;
    manifestRevision: string;
    providerScope: AwsOrganizationCommitmentsPlanningProviderScope<CompanyId, EstateId, OrganizationId, AccountId>;
    accounts: AwsOrganizationCommitmentsAccount<AccountId>[];
    utilizationSummary: CommitmentsUtilizationSummary;
    expirySummary: CommitmentsExpirySummary;
    inventory: AwsOrganizationCommitmentsInventoryItem<AccountId>[];
    payerAggregates: AwsOrganizationCommitmentsPayerAggregate<AccountId>[];
    sharingPosture: AwsOrganizationCommitmentsSharingPosture;
    pricingContext: CommitmentsPricingContext;
    freshness?: CommitmentsFreshnessSummary;
    purchaseRecommendations?: AwsOrganizationCommitmentsPurchaseRecommendation<AccountId>[];
    allocation: AwsOrganizationCommitmentsAllocationEvidence<AccountId>;
    resourceAttribution: AwsOrganizationCommitmentsResourceAttributionEvidence<AccountId>;
}
export {};
//# sourceMappingURL=organizationCommitments.d.ts.map