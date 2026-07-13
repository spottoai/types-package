import type { Comment, CommentScope, RecommendationHistory } from './recommendationState';
import type { ProviderScope } from '../common/provider';
import { SecurityAssessmentStatus, SecurityImpact, SubscriptionSecurityStatus } from './security';
import { SubscriptionSummaryLite } from './subscriptions';
import type { CostSavingsAggregationPolicy, CostSavingsSummary, CurrencySavingsGroup, SavingsPotential, VmPricePerformanceInsights } from './views';
import type { HaloRoutingOverrides } from '../integrations/halo';
import type { AutotaskShareOverrides } from '../integrations/autotask';
import type { AzureDevOpsShareOverrides } from '../integrations/azureDevOps';
import type { GitHubShareOverrides } from '../integrations/github';
import type { Tags } from '../tags';
import type { AzurePortalVersionedArtifact } from './portalArtifacts';
import type { LicensingRecommendationRenderData } from './licensing';
export declare enum RecommendationCategory {
    Cost = "Cost",
    Performance = "Performance",
    Reliability = "Reliability",
    Security = "Security",
    Compliance = "Compliance",
    OperationalExcellence = "OperationalExcellence",
    OperationalExcellenceAlternative = "Operational Excellence"
}
export type RecommendationPriorityTier = 'must_do' | 'normal';
export type RecommendationCostImpactUnit = 'percent';
export type EffortEstimateProfileName = 'clickops' | 'devops' | 'enterprise';
export interface RecommendationBaseScores {
    cost_optimization: number;
    security: number;
    performance: number;
    reliability: number;
    compliance: number;
    operational_excellence: number;
}
export interface RecommendationEffortEstimateBreakdown {
    discovery: number;
    implementation: number;
    validation: number;
    rollbackPlanning: number;
    coordination: number;
}
export interface RecommendationEffortEstimateProfile {
    effortHours: number;
    breakdown: RecommendationEffortEstimateBreakdown;
    reason: string;
}
export interface RecommendationEffortEstimateProfiles {
    clickops: RecommendationEffortEstimateProfile;
    devops: RecommendationEffortEstimateProfile;
    enterprise: RecommendationEffortEstimateProfile;
}
export interface RecommendationBulkEffortEstimateProfile {
    setupHours: number;
    perResourceHours: number;
    validationHours: number;
}
export interface RecommendationBulkEffortEstimateProfiles {
    clickops: RecommendationBulkEffortEstimateProfile;
    devops: RecommendationBulkEffortEstimateProfile;
    enterprise: RecommendationBulkEffortEstimateProfile;
}
export interface RecommendationBulkEffortEstimates {
    supported: boolean;
    threshold: number;
    profiles: RecommendationBulkEffortEstimateProfiles;
}
export interface RecommendationEffortEstimates {
    profiles: RecommendationEffortEstimateProfiles;
    bulk: RecommendationBulkEffortEstimates;
    overridden?: boolean;
    lastUpdatedAt?: string;
    notes?: string;
}
export interface RecommendationActionImpactAssessment {
    downtime: string;
    dataLoss: string;
    accessImpact: string;
    dependencies: string;
}
export type RecommendationActionRiskLevel = 'low' | 'medium' | 'high';
export interface RecommendationActionRollback {
    supported: boolean;
    description: string;
    limitations: string[];
}
export interface RecommendationActionCheck {
    label: string;
    description: string;
}
export interface RecommendationActionLink {
    label: string;
    url: string;
}
export interface RecommendationActionPostValidation {
    label: string;
    description: string;
    expectedResult: string;
    links?: RecommendationActionLink[];
}
export type RecommendationActionPermissionProvider = 'azure-rbac';
export type RecommendationActionPermissionScope = 'targetResource' | 'resourceGroup' | 'subscription' | 'tenant';
export interface RecommendationActionPermissionRequirement {
    label: string;
    name: string;
    reason: string;
    links?: RecommendationActionLink[];
}
export interface RecommendationActionLeastPrivilegeRole {
    label: string;
    description: string;
}
export interface RecommendationActionSuggestedRole {
    label: string;
    roleName: string;
    roleDefinitionId?: string;
    reason: string;
}
export interface RecommendationActionRequiredPermissions {
    provider: RecommendationActionPermissionProvider;
    scope: RecommendationActionPermissionScope;
    actions: RecommendationActionPermissionRequirement[];
    dataActions: RecommendationActionPermissionRequirement[];
    leastPrivilegeRole?: RecommendationActionLeastPrivilegeRole;
    suggestedRoles?: RecommendationActionSuggestedRole[];
}
export interface RecommendationActionDefinition {
    verified: boolean;
    actionDefinitionId?: string;
    title: string;
    description: string;
    estimatedDuration: string;
    riskLevel: RecommendationActionRiskLevel;
    requiredPermissions?: RecommendationActionRequiredPermissions;
    impactAssessment: RecommendationActionImpactAssessment;
    rollback: RecommendationActionRollback;
    humanPreChecks: RecommendationActionCheck[];
    postValidation: RecommendationActionPostValidation[];
}
export type RecommendationActionMetadata = RecommendationActionDefinition;
export type RecommendationImplementActionImpactAssessment = RecommendationActionImpactAssessment;
export type RecommendationImplementAction = RecommendationActionMetadata;
export interface RecommendationResources {
    recommendation: CustomAzureRecommendation;
    resourceIds: string[];
}
export type HddSsdMigrationTargetTier = 'standardSsd' | 'premiumSsd';
export type HddDiskPricingRedundancy = 'LRS' | 'ZRS';
export interface HddOsRetirementCurrentDiskPricing {
    storageTier: 'standardHdd';
    skuName: string;
    pricingRedundancy?: HddDiskPricingRedundancy;
    sizeGiB: number;
    monthlyActual: number;
    monthlyRetail: number;
}
export interface HddOsRetirementTargetDiskPricing {
    storageTier: HddSsdMigrationTargetTier;
    skuName: string;
    pricingRedundancy?: HddDiskPricingRedundancy;
    sizeGiB: number;
    monthlyRetail: number;
}
export interface HddOsRetirementDiskRenderItem {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    /** Canonical location key used for pricing lookup, e.g. "westus". */
    pricingLocation?: string;
    current: HddOsRetirementCurrentDiskPricing;
    standardSsd: HddOsRetirementTargetDiskPricing & {
        storageTier: 'standardSsd';
    };
    premiumSsd: HddOsRetirementTargetDiskPricing & {
        storageTier: 'premiumSsd';
    };
    defaultSelection?: HddSsdMigrationTargetTier;
}
export interface HddOsRetirementRenderStrategyPayload {
    retirementDate: string;
    retirementLink: string;
    currencyCode?: string;
    currencySymbol?: string;
    defaultTargetTier?: HddSsdMigrationTargetTier;
    impactedDiskCount: number;
    currentMonthlyActual: number;
    currentMonthlyRetail: number;
    standardSsdMonthlyRetail: number;
    premiumSsdMonthlyRetail: number;
    standardSsdMonthlyDelta: number;
    premiumSsdMonthlyDelta: number;
    disks: HddOsRetirementDiskRenderItem[];
}
export type RecommendationKnownRenderData = HddOsRetirementRenderStrategyPayload | VmPricePerformanceInsights | LicensingRecommendationRenderData;
export type AnyRecommendationRenderData = Record<string, unknown>;
export type RecommendationDecisionRelationshipKind = 'review_first' | 'alternative' | 'trade_off' | 'follow_up' | 'unlocks' | 'conflicts_with';
export type RecommendationDecisionContextRole = 'primary' | 'alternative' | 'trade_off' | 'follow_up' | 'supporting';
export type RecommendationDecisionReviewPriority = 'review_first' | 'normal';
/**
 * Resource-specific relationship from one recommendation to another.
 * Used by UIs to explain alternatives and follow-ups without changing recommendation state.
 */
export interface RecommendationDecisionLink {
    recommendationId: string;
    kind: RecommendationDecisionRelationshipKind;
    label?: string;
    reason?: string;
    condition?: string;
}
/**
 * Resource-specific decision context for an existing recommendation.
 * The recommendation remains independently visible and actionable by recommendationId.
 */
export interface RecommendationDecisionContext {
    recommendationId: string;
    role?: RecommendationDecisionContextRole;
    reviewPriority?: RecommendationDecisionReviewPriority;
    groupId?: string;
    title?: string;
    explanation?: string;
    links: RecommendationDecisionLink[];
}
export interface Recommendation {
    /** Business identity of a recommendation record (routing/state/sharing/dedupe). */
    id: string;
    name: string;
    category: RecommendationCategory;
    subCategory?: string;
    aggregateDescription?: string;
    /** custom */
    type?: string;
    description?: string;
    remediation?: string;
    impact: string;
    impactReason?: string;
    links?: {
        name: string;
        url: string;
    }[];
    considerations?: string;
    currency?: string;
    potentialBenefits?: string;
    potentialMonthlySavings?: number;
    effort?: string;
    effortReason?: string;
    /** e.g. 10 hours */
    effortHours?: number;
    /** Detailed implementation estimates by delivery profile and bulk rollout mode. */
    effortEstimates?: RecommendationEffortEstimates;
    risk?: string;
    riskReason?: string;
    severity?: string;
    /** Relative cost percentage, e.g. -40 means a 40% reduction. Never a currency amount. */
    costImpact?: number;
    /** Explicit discriminator for new payloads while legacy percentage-only payloads remain readable. */
    costImpactUnit?: RecommendationCostImpactUnit;
    costImpactReason?: string;
    /*** costImpactDetails is deprecated **/
    performanceImpact?: number;
    performanceImpactReason?: string;
    confidencePercentage?: number;
    confidenceReason?: string;
    /** array of resources that have this recommendation */
    resources?: ResourceReference[];
    /** Compact resource references for resource-specific detail payloads. */
    resourceIds?: string[];
    /** Total affected resources when resourceIds is trimmed or sampled. */
    resourcesCount?: number;
    /** only for security recommendations */
    securityImpactDetails?: SecurityImpact;
    /** whether the recommendation has been resolved or not, eg, Security Assessment is "Healthy" should be true */
    resolved?: boolean;
    securityAssessmentStatuses?: SecurityAssessmentStatus[];
    /** Deprecated fields, kept for compatibility */
    solution?: string;
    source?: string;
    service?: string;
    /**
     * Stored as string to allow JSON persistence.
     * Uses a different name to avoid conflict with RecommendationWithState.createdAt.
     */
    createdTime?: string;
    /** Avoids conflict with RecommendationWithState.updatedAt */
    lastUpdatedTime?: string;
    /** Business story properties */
    title?: string;
    headline?: string;
    bottomLine?: string;
    plainSummary?: string;
    quickSteps?: string[];
    businessOwner?: string;
    keyConstraint?: string;
    validationEvidence?: string;
    read?: boolean;
    /** Technical playbook (only for multi-step implementations) */
    technicalPlaybook?: string;
    /** Static recommendation scoring metadata (library-level). */
    baseScores?: RecommendationBaseScores;
    overallBaseScore?: number;
    overallBaseReason?: string;
    priorityTier?: RecommendationPriorityTier;
    /** Runtime scoring metadata (per company/tenant). */
    adjustedScore?: number;
    objectiveMultiplier?: number;
    finalScore?: number;
    /** UI display-only normalized score (0-100). */
    normalizedScore?: number;
    /** Cross-feature linkage IDs used for deep links and related views. */
    linkingIds?: RecommendationLinkingIds;
    /** Optional UI render payload consumed by recommendation-specific components. */
    renderData?: RecommendationKnownRenderData | AnyRecommendationRenderData;
    /** Optional action definition for implement-capable recommendations. */
    action?: RecommendationActionMetadata;
}
export interface RecommendationLinkingIds {
    serviceRetirementIds?: string[];
}
/** Deprecated **/
export interface CostImpactDetails {
    /** e.g. "Saving Plan", "Reserved Instance", "Windows migration to Linux" */
    name: string;
    monthlySavings?: number;
    currentSpend?: number;
    /** e.g. 20 for 20% */
    savingPercentage?: number;
    minMonthlySavings?: number;
    maxMonthlySavings?: number;
}
export interface RecommendationSummary {
    category: RecommendationCategory;
    total: number;
    high: number;
    medium: number;
    low: number;
}
export interface RecommendationWithResources {
    recommendation: Recommendation;
    /** Total affected resources when the resources array is trimmed or sampled. */
    resourcesCount?: number;
    resources: RecommendationResource[];
    /** Homogeneous-currency savings only. Omit for mixed-currency projections. */
    savings?: SavingsPotential;
    /** Canonical monetary values when present; `savings` must not contain mixed-currency amounts. */
    savingsByCurrency?: CurrencySavingsGroup[];
    /** Canonical resource ID that owns this recommendation savings amount for aggregation */
    savingsOwnerResourceId?: string;
    /** Resource IDs that may display this recommendation savings amount as context */
    savingsDisplayResourceIds?: string[];
    /** Billable component key used with the owner ID to prevent double counting */
    billableComponentKey?: string;
    /** Aggregation rule for this recommendation savings amount */
    savingsAggregationPolicy?: CostSavingsAggregationPolicy;
}
/**
 * Contextual links from one recommendation row to other resources.
 * Used to model "this disk belongs to that VM" style associations
 * without changing which resource owns savings totals.
 */
export interface RecommendationResourceAssociation {
    id: string;
    name?: string;
    type?: string;
    relationship?: ResourceRelationship;
}
export interface RecommendationResource {
    id: string;
    name: string;
    type: string;
    resourceGroup?: string;
    location?: string;
    subscriptionId?: string;
    subscriptionName?: string;
    tags?: Record<string, string>;
    spottoTags?: Tags;
    createdTime?: string;
    typeInfo?: {
        name: string;
        icon: string;
        description: string;
        product: string;
        aliases?: string[];
    };
    spend: number;
    spendAmortized: number;
    savings?: SavingsPotential;
    /** Canonical resource ID that owns this resource savings amount for aggregation */
    savingsOwnerResourceId?: string;
    /** Resource IDs that may display this resource savings amount as context */
    savingsDisplayResourceIds?: string[];
    /** Billable component key used with the owner ID to prevent double counting */
    billableComponentKey?: string;
    /** Aggregation rule for this resource savings amount */
    savingsAggregationPolicy?: CostSavingsAggregationPolicy;
    currency?: string;
    currencySymbol?: string;
    relationship?: ResourceRelationship;
    associations?: RecommendationResourceAssociation[];
}
export interface RecommendationsView extends AzurePortalVersionedArtifact {
    recommendations: RecommendationWithResources[];
    securityImpactDetails?: SecurityImpact[];
    subscriptionSecurityStatus?: SubscriptionSecurityStatus;
    /** Homogeneous-currency savings only. Omit for mixed-currency projections. */
    savings?: SavingsPotential;
    /** Canonical monetary values when present; `savings` must not contain mixed-currency amounts. */
    savingsByCurrency?: CurrencySavingsGroup[];
    subscription: SubscriptionSummaryLite;
    costSavingsSummary?: CostSavingsSummary;
}
export interface ResourceId {
    id: string;
}
export interface ResourceReference {
    id: string;
    name: string;
    type?: string;
    subscriptionName?: string;
    savings?: SavingsPotential;
    currency?: string;
    currencySymbol?: string;
    relationship?: ResourceRelationship;
    associations?: RecommendationResourceAssociation[];
}
export type ResourceRelationship = {
    role?: 'primary' | 'related';
    type?: string;
    allocationId?: string;
    metadata?: Record<string, string>;
};
export interface ReliabilityRecommendation extends Recommendation {
    referenceID: string;
    resourceType: string;
    resourceTypeShortName: string;
    service: string;
}
export interface CustomAzureRecommendation extends Recommendation {
    service: string;
    source: string;
    fileName: string;
}
export interface RecommendationCollection {
    recommendation: CustomAzureRecommendation;
    results: ResourceId[];
}
export interface AzureRecommendationLite {
    /** e.g. Cost, Performance, Reliability, Security, Compliance, OperationalExcellence, Operational Excellence, HighAvailability */
    category: string;
    total: number;
    high: number;
    medium: number;
    low: number;
}
export interface RecommendationStats {
    /** total number of recommendations in the subscription */
    total: number;
    /** total number of high recommendations in the subscription */
    high: number;
    /** total number of medium recommendations in the subscription */
    medium: number;
    /** total number of low recommendations in the subscription */
    low: number;
}
/** Recommendation with state information, name "ExtendedRecommendation" in the portal at the moment */
export interface RecommendationWithState extends Recommendation {
    status?: 'Active' | 'Prioritized' | 'Postponed' | 'Dismissed' | 'Completed' | 'Archived' | 'Implementing' | 'Implemented' | 'Failed';
    read?: boolean;
    scheduledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    flagged?: boolean;
    comments?: Comment[];
    history?: RecommendationHistory[];
}
export interface DismissRecommendationRequest extends RecommendationActionRequest {
    dismissReason: string;
}
export interface ShareRecommendationRequest extends RecommendationActionRequest {
    shareType: 'email' | 'slack' | 'teams' | 'jira' | 'halo' | 'connectwise' | 'autotask' | 'azuredevops' | 'github';
    email?: string;
    halo?: HaloRoutingOverrides;
    connectwise?: ConnectWiseRoutingFields;
    autotask?: AutotaskShareOverrides;
    azuredevops?: AzureDevOpsShareOverrides;
    github?: GitHubShareOverrides;
}
export type RecommendationActionTargetSelection = 'selectedResources' | 'allAffectedResources';
export interface RecommendationActionRequest extends ProviderScope {
    /** `providerScope` maps to subscription identity for Azure providers. */
    scope?: CommentScope;
    /** Optional cloud-account identity enriched by trusted server-side callers before queue publish. */
    cloudAccountId?: string;
    /** Optional user-provided reason for queue-backed actions such as implement. */
    reason?: string;
    /** Optional action permission metadata passed into API preflight before queue publish. */
    requiredPermissions?: RecommendationActionRequiredPermissions;
    recommendationId: string;
    recommendationTitle?: string;
    resourceIds: string[];
    /** Whether resourceIds are the exact selected targets or a sampled display subset for an all-affected action. */
    targetSelection?: RecommendationActionTargetSelection;
    resourceGroupName?: string;
    companyId: string;
    byUserId?: string;
    byUserDisplayName?: string;
}
export interface RecommendationActionResponse {
    success: boolean;
    message?: string;
    affectedResources?: string[];
    eventId?: string;
}
export type RecommendationActionPermissionFailureStatus = 'missing' | 'unknown' | 'unsupported';
export interface RecommendationActionPermissionFailure {
    resourceId: string;
    azureScope: string;
    status: RecommendationActionPermissionFailureStatus;
    message: string;
    missingActions: string[];
    missingDataActions: string[];
}
export interface RecommendationActionPermissionErrorResponse {
    error: 'AzurePermissionMissing';
    message: string;
    action: 'implement';
    providerName: string;
    providerScopeId: string;
    failures: RecommendationActionPermissionFailure[];
}
export interface ServiceRetirementRecommendation {
    Id: string;
    ServiceName: string;
    RetiringFeature: string;
    RetirementDate: string;
    Link: string;
    effort: string;
    effortHours: number;
    effortReason: string;
    risk: string;
    riskReason: string;
    considerations: string;
    confidencePercentage: number;
    confidenceReason: string;
    lastProcessedAt: string;
    /** Related recommendation IDs for cross-navigation from retirement tracker. */
    linkedRecommendationIds?: string[];
}
export interface JiraShareDetails {
    projectKey?: string;
    epicKey?: string;
    label?: string;
}
export interface JiraIntegrationRequestBase {
    siteUrl: string;
    email: string;
    secret?: string;
    useStoredSecret?: boolean;
}
export interface JiraIntegrationTestPayload extends JiraIntegrationRequestBase {
    projectKey?: string;
}
export interface JiraIntegrationEpicsPayload extends JiraIntegrationRequestBase {
    projectKey: string;
    maxResults?: number;
}
export interface JiraIntegrationProjectsPayload extends JiraIntegrationRequestBase {
    maxResults?: number;
}
export interface JiraIntegrationLabelsPayload extends JiraIntegrationRequestBase {
    projectKey: string;
    maxResults?: number;
    searchQuery?: string;
}
export interface JiraEntity {
    id: string;
    key: string;
    name: string;
}
export interface JiraLabel {
    name: string;
}
export interface ConnectWiseIntegrationRequestBase {
    siteUrl: string;
    companyId: string;
    publicKey: string;
    secret?: string;
    useStoredSecret?: boolean;
    credentialOwnerCompanyId?: string;
}
export type ConnectWiseId = string | number;
export interface ConnectWiseRoutingFields {
    boardId?: ConnectWiseId;
    boardName?: string;
    statusId?: ConnectWiseId;
    statusName?: string;
    customerId?: ConnectWiseId;
    customerName?: string;
    projectId?: ConnectWiseId;
    projectName?: string;
    typeId?: ConnectWiseId;
    typeName?: string;
    subTypeId?: ConnectWiseId;
    subTypeName?: string;
    itemId?: ConnectWiseId;
    itemName?: string;
    priorityId?: ConnectWiseId;
    priorityName?: string;
    contactId?: ConnectWiseId;
    contactName?: string;
    agreementId?: ConnectWiseId;
    agreementName?: string;
    slaId?: ConnectWiseId;
    slaName?: string;
    source?: string;
}
export interface ConnectWiseIntegrationTestPayload extends ConnectWiseIntegrationRequestBase, ConnectWiseRoutingFields {
}
export type ConnectWiseBoardsPayload = ConnectWiseIntegrationRequestBase;
export type ConnectWiseCompaniesPayload = ConnectWiseIntegrationRequestBase;
export type ConnectWiseProjectsPayload = ConnectWiseIntegrationRequestBase;
export interface ConnectWiseStatusesPayload extends ConnectWiseIntegrationRequestBase {
    boardId?: string;
    boardName?: string;
}
export interface ConnectWiseTypesPayload extends ConnectWiseIntegrationRequestBase {
    boardId?: string;
    boardName?: string;
}
export interface ConnectWiseSubTypesPayload extends ConnectWiseIntegrationRequestBase {
    boardId?: string;
    boardName?: string;
    typeId?: string;
    typeName?: string;
}
export interface ConnectWiseItemsPayload extends ConnectWiseIntegrationRequestBase {
    boardId?: string;
    boardName?: string;
    typeId?: string;
    typeName?: string;
    subTypeId?: string;
    subTypeName?: string;
}
export interface ConnectWiseTypeSubTypeItemAssociationsPayload extends ConnectWiseIntegrationRequestBase {
    boardId?: string;
    boardName?: string;
}
export interface ConnectWisePrioritiesPayload extends ConnectWiseIntegrationRequestBase {
    boardId?: string;
    boardName?: string;
}
export interface ConnectWiseContactsPayload extends ConnectWiseIntegrationRequestBase {
    searchQuery?: string;
}
export type ConnectWiseSourcesPayload = ConnectWiseIntegrationRequestBase;
export type ConnectWiseAgreementsPayload = ConnectWiseIntegrationRequestBase;
export type ConnectWiseSlasPayload = ConnectWiseIntegrationRequestBase;
export interface ConnectWiseEntity {
    id: string | number;
    name: string;
}
export interface ConnectWiseTypeSubTypeItemAssociation {
    type?: ConnectWiseEntity;
    subType?: ConnectWiseEntity;
    item?: ConnectWiseEntity;
}
export interface ConnectWiseContact extends ConnectWiseEntity {
    email?: string;
}
export interface ConnectWiseTicketMetadata extends ConnectWiseRoutingFields {
    ticketId: ConnectWiseId;
    ticketUrl?: string;
}
//# sourceMappingURL=recommendations.d.ts.map