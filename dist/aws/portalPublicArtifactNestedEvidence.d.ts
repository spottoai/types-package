import type { AwsPortalBillingCostAggregate, AwsPortalRecommendationActionHealth, AwsPortalRecommendationSource, AwsPortalRecommendationSourceEvidence } from './portalPublicArtifacts';
export interface AwsPortalBillingCostView {
    currency: string;
    actualCostAmount: number;
    amortizedCostAmount?: number;
    amortizedExpenseCount?: number;
    amortizationCoverageState?: 'complete' | 'partial' | 'none' | 'unavailable';
    actualVsAmortizedDeltaAmount?: number;
    commitmentCoverageState: 'discounted' | 'no-amortized-cost' | 'no-delta' | 'amortized-exceeds-base' | 'partial-amortized-cost' | 'amortization-coverage-unavailable';
    showAmortizedCosts: boolean;
}
export interface AwsPortalBillingCommitmentSpend {
    expenseCountWithCommitmentEvidence: number;
    expenseCountWithoutCommitmentEvidence: number;
    totalsByCurrency: AwsPortalBillingCostAggregate[];
    costViewByCurrency: AwsPortalBillingCostView[];
    groupedByAmortizationSource: Array<{
        amortizationSource: 'reservation-effective-cost' | 'savings-plan-effective-cost';
        expenseCount: number;
        totalsByCurrency: AwsPortalBillingCostAggregate[];
        costViewByCurrency: AwsPortalBillingCostView[];
    }>;
}
export interface AwsPortalBillingBenefitCoverage {
    authority: 'persisted-billing-expense-amortization';
    status: 'available' | 'partial-persisted-evidence' | 'missing-persisted-evidence';
    matchedExpenseCount: number;
    coveredExpenseCount: number;
    unclassifiedExpenseCount: number;
    byBenefitType: Array<{
        benefitType: 'reserved-instance' | 'savings-plan';
        amortizationSource: 'reservation-effective-cost' | 'savings-plan-effective-cost';
        expenseCount: number;
        totalsByCurrency: AwsPortalBillingCostAggregate[];
        costViewByCurrency: AwsPortalBillingCostView[];
    }>;
}
export interface AwsPortalBillingBenefitCoverageWarning {
    code: 'ri-sp-coverage-evidence-missing' | 'ri-sp-coverage-evidence-partial';
    severity: 'warning';
    matchedExpenseCount: number;
    unclassifiedExpenseCount: number;
    message: string;
}
export interface AwsPortalRecommendationLatestActionExecution {
    status: 'accepted' | 'completed' | 'failed' | 'retryable-failure' | 'skipped';
    recordedAt: string;
    requestId: string;
    requestedAt: string;
    requestedBy: 'manual';
    actionType: 'DeleteDBInstance' | 'DeleteNatGateway' | 'ModifyVolume' | 'ModifyStorage' | 'Rightsize';
    providerAction: 'rds-modify-db-cluster-storage-type' | 'autoscaling-update-group-instance-refresh' | 'ec2-modify-volume' | 'ec2-stop-modify-start-instance-type' | 'ecs-register-task-definition-update-service' | 'ec2-delete-nat-gateway' | 'lambda-update-function-configuration' | 'rds-delete-db-instance' | 'rds-modify-db-instance';
    completionMode: 'provider-poll';
    acceptedAt?: string;
    completedAt?: string;
    failedAt?: string;
    providerRequestId?: string;
    currentResourceSummary?: string;
    recommendedResourceSummary?: string;
    sourceTitle?: string;
    estimatedMonthlySavings?: number;
    estimatedSavingsPercentage?: number;
    currencyCode?: string;
    message?: string;
    skipReason?: 'recommendation-state-not-found' | 'source-recommendation-missing' | 'source-recommendation-not-found' | 'published-version-immutable' | 'provider-preflight-conflict' | 'provider-preflight-unsupported' | 'unsupported-recommendation-shape' | 'no-effective-provider-change';
    implementationChanged?: boolean;
    implementationImplemented?: boolean;
    implementationPreviouslyImplemented?: boolean;
}
export interface AwsPortalRecommendationRefreshAttemptSummary {
    attemptedArtifactCount: number;
    failedAttemptCount: number;
    supersededAttemptCount: number;
    attemptReasons: string[];
    oldestAttemptedAt?: string;
    newestAttemptedAt?: string;
}
export interface AwsPortalRecommendationPendingRefreshSummary {
    pendingArtifactCount: number;
    pendingArtifactTypes: Array<'recommendations' | 'resource-recommendations' | 'resource-type-recommendations'>;
    oldestPendingRefreshUpdatedAt?: string;
    newestPendingRefreshUpdatedAt?: string;
    executionAttemptSummary?: AwsPortalRecommendationRefreshAttemptSummary;
}
export interface AwsPortalRecommendationSavingsVerification {
    verificationStatus: 'pending-post-action-refresh' | 'recommendation-absent-after-refresh' | 'recommendation-still-present-after-refresh' | 'post-action-evidence-truncated';
    artifactType: 'recommendations';
    actionRequestId: string;
    actionCompletedAt: string;
    postActionEvidenceStatus: 'qualified' | 'refresh-pending' | 'missing' | 'stale' | 'unqualified';
    postActionEvidenceReason: 'qualified-post-action-artifact' | 'canonical-refresh-row-pending' | 'canonical-refresh-row-missing' | 'artifact-generated-before-action-completion' | 'artifact-refresh-request-mismatch' | 'artifact-refresh-trigger-mismatch' | 'artifact-changed-key-missing' | 'artifact-type-mismatch';
    postActionArtifactGeneratedAt?: string;
    postActionRefreshRequestId?: string;
    postActionPendingRefreshRequestedAt?: string;
    postActionPendingRefreshUpdatedAt?: string;
    postActionPendingRefreshSummary?: AwsPortalRecommendationPendingRefreshSummary;
    postActionRetainedRefreshAttemptSummary?: AwsPortalRecommendationRefreshAttemptSummary;
    postActionSourcePresence?: 'current' | 'missing';
    actionEstimatedMonthlySavings?: number;
    actionEstimatedSavingsPercentage?: number;
    actionCurrencyCode?: string;
    currentEstimatedMonthlySavings?: number;
    currentEstimatedSavingsPercentage?: number;
    currentCurrencyCode?: string;
    currencyCodesMatch?: boolean;
}
export interface AwsPortalRecommendationTemplateProvenanceSource {
    recommendationCode: string;
    templateId: string;
    relativePath: string;
    source: 'internal' | 'external';
    format: 'canonical-v1' | 'external-catalog-v1';
    confidencePercentage?: number;
    confidenceReason?: string;
    primarySourceUrl?: string;
    firstPartyValidationSourceCount: number;
    communitySourceCount: number;
}
export interface AwsPortalAccountSummaryAiRecommendationPosture {
    sourceCount: number;
    sources: Array<{
        source: AwsPortalRecommendationSource;
        sourceEvidence?: AwsPortalRecommendationSourceEvidence;
        actionHealth?: AwsPortalRecommendationActionHealth;
    }>;
}
//# sourceMappingURL=portalPublicArtifactNestedEvidence.d.ts.map