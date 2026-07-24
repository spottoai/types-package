import type { ArtifactAccountBinding, ArtifactGeneration } from '../common/artifactGeneration';
import type { RelationshipSnapshotCostOverlay, RelationshipSnapshotEdge, RelationshipSnapshotEdgeKind, RelationshipSnapshotEdgeEvidence, RelationshipSnapshotNodeData, RelationshipSnapshotNodeKind, RelationshipSnapshotStats, UnresolvedRelationshipReference } from '../azure/relationships';
import type { Recommendation } from '../azure/recommendations';
import type { ServiceRetirementPortalResource } from '../azure/serviceRetirement';
import type { AzureDashboardView, AzureResourcePluginItemDetailed, AzureResourcePortalItem, AzureResourcesView } from '../azure/views';
import type { AwsRequestForbiddenCredentialFields } from './requests';
export declare const AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION: 1;
export declare const AWS_PUBLIC_ARTIFACT_TYPES: readonly ["resource-collection", "account-summary", "relationships", "lifecycle", "plugin-subscription", "plugin-resource"];
export type AwsPublicArtifactSchemaVersion = typeof AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION;
export type AwsPublicArtifactType = (typeof AWS_PUBLIC_ARTIFACT_TYPES)[number];
/** Public artifacts must not expose setup values or credential-store locators. */
export type AwsPublicArtifactForbiddenCredentialFields = AwsRequestForbiddenCredentialFields & {
    externalId?: never;
    roleArn?: never;
    secretArn?: never;
    secretReference?: never;
};
export type AwsPublicArtifactEnvelope<ArtifactType extends AwsPublicArtifactType = AwsPublicArtifactType, AccountId extends string = string, RunId extends string = string> = ArtifactAccountBinding<'aws', AccountId> & AwsPublicArtifactForbiddenCredentialFields & {
    schemaVersion: AwsPublicArtifactSchemaVersion;
    artifactType: ArtifactType;
    artifactGeneration: ArtifactGeneration<RunId>;
};
export type AwsPublicAccountReference<AccountId extends string = string> = ArtifactAccountBinding<'aws', AccountId> & AwsPublicArtifactForbiddenCredentialFields & {
    companyId?: string;
    displayName: string;
};
export type AwsPortalAccountSummaryBody<AccountId extends string = string> = Pick<AzureDashboardView, 'timestamp' | 'costStartDate' | 'costEndDate' | 'calendarSummary' | 'billingPeriodSummary' | 'summary' | 'dailySummary' | 'costSavingsSummary'> & {
    account: AwsPublicAccountReference<AccountId>;
};
export type AwsPortalAccountSummaryArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'account-summary', AccountId, RunId> & AwsPortalAccountSummaryBody<AccountId>;
export type AwsPortalResourceItem<AccountId extends string = string> = Omit<AzureResourcePortalItem, 'location' | 'resourceHealth' | 'vmPricePerformance'> & ArtifactAccountBinding<'aws', AccountId> & AwsPublicArtifactForbiddenCredentialFields & {
    arn?: string;
    region: string;
    location: string;
};
export type AwsPortalResourceCollectionArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'resource-collection', AccountId, RunId> & Omit<AzureResourcesView, 'schemaVersion' | 'artifactGeneration' | 'subscription' | 'resources'> & {
    account: AwsPublicAccountReference<AccountId>;
    resources: AwsPortalResourceItem<AccountId>[];
};
export type AwsPortalRelationshipNodeKind = Exclude<RelationshipSnapshotNodeKind, 'subscription' | 'resourceGroup' | 'managementGroup'> | 'account' | 'region';
export type AwsPortalRelationshipNodeData<AccountId extends string = string> = Omit<RelationshipSnapshotNodeData, 'resourceGroup' | 'properties'> & AwsPublicArtifactForbiddenCredentialFields & {
    accountId: AccountId;
    region?: string;
    resourceGroup?: never;
    properties?: never;
};
export interface AwsPortalRelationshipNode<AccountId extends string = string> {
    id: string;
    kind: AwsPortalRelationshipNodeKind;
    data: AwsPortalRelationshipNodeData<AccountId>;
    cost?: RelationshipSnapshotCostOverlay;
}
export type AwsPortalRelationshipEdgeKind = RelationshipSnapshotEdgeKind;
export type AwsPortalRelationshipEdgeEvidence = RelationshipSnapshotEdgeEvidence;
export type AwsPortalRelationshipEdge = RelationshipSnapshotEdge;
export type AwsPortalRelationshipArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'relationships', AccountId, RunId> & Omit<RelationshipSnapshotShape, 'schemaVersion' | 'nodes'> & {
    nodes: AwsPortalRelationshipNode<AccountId>[];
};
type RelationshipSnapshotShape = {
    schemaVersion: 1;
    generatedAt: string;
    currency?: string;
    currencySymbol?: string;
    nodes: AwsPortalRelationshipNode[];
    edges: AwsPortalRelationshipEdge[];
    unresolved: UnresolvedRelationshipReference[];
    stats: RelationshipSnapshotStats;
};
export type AwsPortalLifecycleResource<AccountId extends string = string> = ServiceRetirementPortalResource & ArtifactAccountBinding<'aws', AccountId> & AwsPublicArtifactForbiddenCredentialFields & {
    arn?: string;
    region?: string;
};
export type AwsPortalLifecycleClass = 'service-retirement' | 'credential-expiry' | 'commitment-expiry';
export type AwsPortalLifecycleSeverity = 'information' | 'warning' | 'critical';
export type AwsPortalLifecycleEntry<AccountId extends string = string> = AwsPublicArtifactForbiddenCredentialFields & {
    id: string;
    lifecycleClass: AwsPortalLifecycleClass;
    title: string;
    summary?: string;
    effectiveAt: string;
    severity: AwsPortalLifecycleSeverity;
    resources: AwsPortalLifecycleResource<AccountId>[];
};
export type AwsPortalLifecycleArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'lifecycle', AccountId, RunId> & {
    generatedAt: string;
    entries: AwsPortalLifecycleEntry<AccountId>[];
};
export type AwsPublicRecommendation = Pick<Recommendation, 'id' | 'name' | 'category' | 'subCategory' | 'aggregateDescription' | 'type' | 'description' | 'remediation' | 'impact' | 'impactReason' | 'links' | 'considerations' | 'currency' | 'potentialBenefits' | 'potentialMonthlySavings' | 'effort' | 'effortReason' | 'effortHours' | 'effortEstimates' | 'risk' | 'riskReason' | 'severity' | 'costImpact' | 'costImpactUnit' | 'costImpactReason' | 'performanceImpact' | 'performanceImpactReason' | 'confidencePercentage' | 'confidenceReason' | 'resourceIds' | 'resourcesCount' | 'resolved' | 'solution' | 'source' | 'service' | 'createdTime' | 'lastUpdatedTime' | 'title' | 'headline' | 'bottomLine' | 'plainSummary' | 'quickSteps' | 'businessOwner' | 'keyConstraint' | 'validationEvidence' | 'read' | 'technicalPlaybook' | 'baseScores' | 'overallBaseScore' | 'overallBaseReason' | 'priorityTier' | 'adjustedScore' | 'objectiveMultiplier' | 'finalScore' | 'normalizedScore'> & AwsPublicArtifactForbiddenCredentialFields & {
    resources?: never;
    securityImpactDetails?: never;
    linkingIds?: never;
    renderData?: never;
    action?: never;
};
/** @deprecated Use AwsPluginSubscriptionDetailArtifact for lossless plugin publication. */
export type AwsPluginSubscriptionArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'plugin-subscription', AccountId, RunId> & AwsPortalAccountSummaryBody<AccountId>;
/** @deprecated Use AwsPluginResourceDetailArtifact for lossless plugin publication. */
export type AwsPluginResourceArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<'plugin-resource', AccountId, RunId> & Omit<AzureResourcePluginItemDetailed, 'subscription' | 'resourceGroup' | 'properties' | 'recommendations' | 'vmPricePerformance' | 'computeAlternatives'> & {
    arn?: string;
    region: string;
    resourceGroup?: never;
    properties?: never;
    recommendations?: AwsPublicRecommendation[];
};
export {};
//# sourceMappingURL=publicArtifacts.d.ts.map