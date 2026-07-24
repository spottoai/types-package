import type { ArtifactAccountBinding, ArtifactDescriptor, ArtifactGeneration } from '../common/artifactGeneration';
import type { AwsPluginAccountSummaryEvidence, AwsPluginAiCostSummaryEvidence, AwsPluginCommitmentEvidence, AwsPluginDeclaredSectionEvidence, AwsPluginGovernanceEvidence, AwsPluginRelationshipEvidence, AwsPluginReliabilityEvidence, AwsPluginResourceItemEvidence, AwsPluginResourceLifecycleEvidence, AwsPluginResourceRecommendationsEvidence, AwsPluginResourceSummaryEvidence, AwsPluginSubscriptionRecommendationsEvidence, AwsPluginSubscriptionLifecycleEvidence } from './pluginPublicArtifactEvidence';
import type { AwsPublicArtifactForbiddenCredentialFields, AwsPublicArtifactSchemaVersion } from './publicArtifacts';
export declare const AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION: 1;
export declare const AWS_PLUGIN_SOURCE_ARTIFACT_TYPES: readonly ["account-summary", "resource-collection", "ai-cost-summary", "relationships", "lifecycle", "recommendations", "recommendation-actionability", "commitment-analysis", "reliability", "account-governance"];
export declare const AWS_PLUGIN_SUBSCRIPTION_SECTIONS: readonly ["account-summary", "resources", "ai-cost-summary", "service-retirement", "recommendations", "commitment-analysis", "reliability", "account-governance"];
export declare const AWS_PLUGIN_RESOURCE_SECTIONS: readonly ["resource", "relationships", "service-retirement", "recommendations"];
export type AwsPluginPublicArtifactSchemaVersion = typeof AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION;
export type AwsPluginSourceArtifactType = (typeof AWS_PLUGIN_SOURCE_ARTIFACT_TYPES)[number];
export type AwsPluginSubscriptionSection = (typeof AWS_PLUGIN_SUBSCRIPTION_SECTIONS)[number];
export type AwsPluginResourceSection = (typeof AWS_PLUGIN_RESOURCE_SECTIONS)[number];
export type AwsPluginSection = AwsPluginSubscriptionSection | AwsPluginResourceSection;
export type AwsPluginSha256 = string;
export type AwsPluginSubscriptionLogicalName = `plugin-subscription--${string}.json.gz`;
export type AwsPluginResourceLogicalName = `plugin-resource--${string}--${string}.json.gz`;
export type AwsPluginLogicalName = AwsPluginSubscriptionLogicalName | AwsPluginResourceLogicalName;
export type AwsPluginBillingScope = {
    source: 'cur';
    reportName: string;
    billingPeriod: AwsPluginBillingPeriod;
} | {
    source: 'cur-2.0-data-exports';
    exportName: string;
    billingPeriod: AwsPluginBillingPeriod;
};
export interface AwsPluginBillingPeriod {
    start: string;
    end: string;
}
export interface AwsPluginMetricTimeWindow {
    start: string;
    end: string;
}
export interface AwsPluginTagRuleScope {
    companyId: string;
}
export type AwsPluginResourceSelector = {
    kind: 'stable-key';
    stableKey: string;
} | {
    kind: 'resource-arn';
    resourceArn: string;
};
export interface AwsPluginRecommendationScope {
    source: 'custom' | 'compute-optimizer' | 'cost-optimization-hub' | 'resilience-hub' | 'security-hub' | 'trusted-advisor' | 'well-architected';
    scope: 'account';
    accountId: string;
    scopeDiscriminator?: string;
    computeOptimizerFamily?: string;
    resourceRegions: string[];
    targetKey: string;
    actionabilityTargetKey: string;
}
export interface AwsPluginSubscriptionTarget<AccountId extends string = string> extends ArtifactAccountBinding<'aws', AccountId> {
    kind: 'subscription-detail';
    targetKey: string;
    targetKeySha256: AwsPluginSha256;
    accountSummaryTargetKey: string;
    resourceCollectionTargetKey: string;
    recommendationsTargetKey: string;
    aiCostSummaryTargetKey?: string;
    serviceRetirementTargetKey: string;
    commitmentAnalysisTargetKey?: string;
    reliabilityTargetKey?: string;
    accountGovernanceTargetKey?: string;
    billing: AwsPluginBillingScope;
    resourceRegions: string[];
    metricTimeWindow: AwsPluginMetricTimeWindow;
    aiCostSummaryAudience?: 'portal' | 'plugin';
    serviceRetirementRegions: string[];
    recommendationScopes: AwsPluginRecommendationScope[];
    commitmentAnalysis?: {
        resourceRegions: string[];
        maxBenefitEntries: number;
    };
    reliability?: {
        includeTemplateContent?: true;
        includeScoring?: true;
        maxResultsPerSection: number;
        sectionScopeKeys: string[];
    };
    accountGovernance?: {
        apiRegion: string;
    };
}
export interface AwsPluginResourceTarget<AccountId extends string = string> extends ArtifactAccountBinding<'aws', AccountId> {
    kind: 'resource-detail';
    targetKey: string;
    targetKeySha256: AwsPluginSha256;
    resourceCollectionTargetKey: string;
    recommendationsTargetKey: string;
    billing: AwsPluginBillingScope;
    resourceRegions: string[];
    metricTimeWindow: AwsPluginMetricTimeWindow;
    tagRuleScope?: AwsPluginTagRuleScope;
    selector: AwsPluginResourceSelector;
    stableKey: string;
    stableKeySha256: AwsPluginSha256;
    relationshipTargetKey: string;
    serviceRetirementTargetKey: string;
    recommendationScopes: AwsPluginRecommendationScope[];
}
export type AwsPluginArtifactTarget<AccountId extends string = string> = AwsPluginSubscriptionTarget<AccountId> | AwsPluginResourceTarget<AccountId>;
export interface AwsPluginSectionSourceBinding<AccountId extends string = string> extends ArtifactAccountBinding<'aws', AccountId> {
    section: AwsPluginSection;
    sourceArtifactType: AwsPluginSourceArtifactType;
    generationId: string;
    generatedAt: string;
    targetKey: string;
    artifactSha256: AwsPluginSha256;
    billing: AwsPluginBillingScope;
    resourceRegions: string[];
    metricTimeWindow: AwsPluginMetricTimeWindow;
    selector?: AwsPluginResourceSelector;
    stableKey?: string;
    tagRuleScope?: AwsPluginTagRuleScope;
}
export type AwsPluginAvailableSection<Section extends AwsPluginSection = AwsPluginSection, AccountId extends string = string, Evidence extends AwsPluginDeclaredSectionEvidence = AwsPluginDeclaredSectionEvidence> = {
    status: 'available';
    section: Section;
    targetKey: string;
    generatedAt: string;
    sourceGeneration: AwsPluginSectionSourceBinding<AccountId>;
    additionalSourceGenerations?: AwsPluginSectionSourceBinding<AccountId>[];
    evidence: Evidence;
};
export type AwsPluginUnavailableSection<Section extends AwsPluginSection = AwsPluginSection> = {
    status: 'not-found';
    section: Section;
    targetKey: string;
};
export type AwsPluginBodySection<Section extends AwsPluginSection = AwsPluginSection, AccountId extends string = string, Evidence extends AwsPluginDeclaredSectionEvidence = AwsPluginDeclaredSectionEvidence> = AwsPluginAvailableSection<Section, AccountId, Evidence> | AwsPluginUnavailableSection<Section>;
export interface AwsPluginSubscriptionSections<AccountId extends string = string> {
    accountSummary: AwsPluginBodySection<'account-summary', AccountId, AwsPluginAccountSummaryEvidence>;
    resources: AwsPluginBodySection<'resources', AccountId, AwsPluginResourceSummaryEvidence>;
    aiCostSummary?: AwsPluginBodySection<'ai-cost-summary', AccountId, AwsPluginAiCostSummaryEvidence>;
    serviceRetirement: AwsPluginBodySection<'service-retirement', AccountId, AwsPluginSubscriptionLifecycleEvidence>;
    recommendations: AwsPluginBodySection<'recommendations', AccountId, AwsPluginSubscriptionRecommendationsEvidence>;
    commitmentAnalysis?: AwsPluginBodySection<'commitment-analysis', AccountId, AwsPluginCommitmentEvidence>;
    reliability?: AwsPluginBodySection<'reliability', AccountId, AwsPluginReliabilityEvidence>;
    accountGovernance?: AwsPluginBodySection<'account-governance', AccountId, AwsPluginGovernanceEvidence>;
}
export interface AwsPluginResourceSections<AccountId extends string = string> {
    resource: AwsPluginAvailableSection<'resource', AccountId, {
        item: AwsPluginResourceItemEvidence;
    }>;
    relationships: AwsPluginBodySection<'relationships', AccountId, AwsPluginRelationshipEvidence>;
    serviceRetirement: AwsPluginBodySection<'service-retirement', AccountId, AwsPluginResourceLifecycleEvidence>;
    recommendations: AwsPluginBodySection<'recommendations', AccountId, AwsPluginResourceRecommendationsEvidence>;
}
type AwsPluginArtifactEnvelope<ArtifactType extends 'plugin-subscription' | 'plugin-resource', AccountId extends string, RunId extends string> = ArtifactAccountBinding<'aws', AccountId> & AwsPublicArtifactForbiddenCredentialFields & {
    schemaVersion: AwsPublicArtifactSchemaVersion;
    pluginSchemaVersion: AwsPluginPublicArtifactSchemaVersion;
    artifactType: ArtifactType;
    artifactGeneration: ArtifactGeneration<RunId>;
    generatedAt: string;
    logicalName: AwsPluginLogicalName;
    target: AwsPluginArtifactTarget<AccountId>;
    storagePath?: never;
    chunk?: never;
    lease?: never;
    retry?: never;
    refreshState?: never;
    requestId?: never;
    requestedAt?: never;
    retiredAt?: never;
};
export type AwsPluginSubscriptionDetailArtifact<AccountId extends string = string, RunId extends string = string> = AwsPluginArtifactEnvelope<'plugin-subscription', AccountId, RunId> & {
    logicalName: AwsPluginSubscriptionLogicalName;
    target: AwsPluginSubscriptionTarget<AccountId>;
    sections: AwsPluginSubscriptionSections<AccountId>;
};
export type AwsPluginResourceDetailArtifact<AccountId extends string = string, RunId extends string = string> = AwsPluginArtifactEnvelope<'plugin-resource', AccountId, RunId> & {
    logicalName: AwsPluginResourceLogicalName;
    target: AwsPluginResourceTarget<AccountId>;
    selector: AwsPluginResourceSelector;
    stableKey: string;
    sections: AwsPluginResourceSections<AccountId>;
};
export interface AwsPluginPublicationRequestBinding {
    requestId: string;
    requestedAt: string;
}
export interface AwsPluginPriorActiveMember<AccountId extends string = string> extends ArtifactAccountBinding<'aws', AccountId> {
    logicalName: AwsPluginLogicalName;
    artifactType: 'plugin-subscription' | 'plugin-resource';
    targetKeySha256: AwsPluginSha256;
    stableKeySha256?: AwsPluginSha256;
    artifactSha256: AwsPluginSha256;
}
type AwsPluginActiveMemberBase<AccountId extends string> = ArtifactAccountBinding<'aws', AccountId> & {
    logicalName: AwsPluginLogicalName;
    artifactType: 'plugin-subscription' | 'plugin-resource';
    target: AwsPluginArtifactTarget<AccountId>;
};
export type AwsPluginActiveSetMember<AccountId extends string = string> = (AwsPluginActiveMemberBase<AccountId> & {
    state: 'active';
    publication: 'replaced' | 'carried-forward';
    artifact: ArtifactDescriptor;
    sourceGenerations: [AwsPluginSectionSourceBinding<AccountId>, ...AwsPluginSectionSourceBinding<AccountId>[]];
}) | (AwsPluginActiveMemberBase<AccountId> & {
    state: 'retired';
    publication: 'retired';
    priorArtifactSha256: AwsPluginSha256;
    retiredAt: string;
    artifact?: never;
    sourceGenerations?: never;
});
export type AwsPluginPublicationOperation<AccountId extends string = string> = {
    kind: 'full';
} | {
    kind: 'targeted-replacement';
    target: AwsPluginArtifactTarget<AccountId>;
} | {
    kind: 'targeted-retirement';
    target: AwsPluginArtifactTarget<AccountId>;
};
export interface AwsPluginActiveSetCounts {
    active: number;
    replaced: number;
    carriedForward: number;
    retired: number;
}
export type AwsPluginGenerationManifest<AccountId extends string = string, RunId extends string = string> = ArtifactAccountBinding<'aws', AccountId> & {
    schemaVersion: AwsPluginPublicArtifactSchemaVersion;
    status: 'completed';
    artifactGeneration: ArtifactGeneration<RunId>;
    requestBinding: AwsPluginPublicationRequestBinding;
    operation: AwsPluginPublicationOperation<AccountId>;
    previousGeneration?: {
        provider: 'aws';
        accountId: AccountId;
        runId: string;
        manifestSha256: AwsPluginSha256;
        members: AwsPluginPriorActiveMember<AccountId>[];
    };
    members: [AwsPluginActiveSetMember<AccountId>, ...AwsPluginActiveSetMember<AccountId>[]];
    counts: AwsPluginActiveSetCounts;
    completedAt: string;
    storagePath?: never;
    chunks?: never;
    lease?: never;
    retries?: never;
    refreshState?: never;
};
/** Builds the path-free subscription logical name from a target-key SHA-256. */
export declare function buildAwsPluginSubscriptionLogicalName(targetKeySha256: AwsPluginSha256): AwsPluginSubscriptionLogicalName;
/** Builds the path-free resource logical name from stable and target SHA-256 values. */
export declare function buildAwsPluginResourceLogicalName(stableKeySha256: AwsPluginSha256, targetKeySha256: AwsPluginSha256): AwsPluginResourceLogicalName;
/** Browser-safe SHA-256 used to bind stable and target identity to logical names. */
export declare function sha256AwsPluginIdentity(value: string): AwsPluginSha256;
export {};
//# sourceMappingURL=pluginPublicArtifacts.d.ts.map