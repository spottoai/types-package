import type { JsonValue } from '../common/artifactGeneration';
export interface TagRuleSet {
    version: '1.0';
    rules: TagRule[];
    strategy?: TagDisplayStrategy;
}
export type TagDeleteSource = 'azure' | 'spotto' | 'both';
export type TagDeleteMatch = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'glob';
export interface TagDeleteRule {
    source?: TagDeleteSource;
    key?: string;
    keyMatch?: TagDeleteMatch;
    value?: string;
    valueMatch?: TagDeleteMatch;
    caseSensitive?: boolean;
}
export interface TagRule {
    name?: string;
    notes?: string;
    priority?: number;
    enabled?: boolean;
    where: string;
    scope?: RuleScope;
    tags: Record<string, string | null>;
    tagDeletes?: TagDeleteRule[];
}
export type RuleScope = 'self' | 'children' | 'descendants' | 'self-and-descendants';
export declare enum TagFlags {
    Required = 1,// 1
    Inherited = 2
}
export interface Tag {
    v: string;
    a: number;
}
export interface Tags {
    [key: string]: Tag;
}
export type TagStrategyScope = 'all' | 'resources' | 'cost-tree' | 'recommendations';
export type TagImportance = 'optional' | 'mandatory';
export interface TagCatalogEntry {
    key: string;
    importance: TagImportance;
    description?: string;
    possibleValues: string[];
}
export interface TagStrategyScopeConfig {
    allowList: string[];
    denyList: string[];
}
export interface TagDisplayStrategy {
    catalog: TagCatalogEntry[];
    scopes: Record<TagStrategyScope, TagStrategyScopeConfig>;
}
export type TagConfigChangeSource = 'ui' | 'ask-spotto' | 'system' | 'unknown';
export type TagConfigChangeType = 'tags-save' | 'tags-delete' | 'tags-restore';
export type JsonPatchOperation = {
    op: 'add';
    path: string;
    value: JsonValue;
} | {
    op: 'remove';
    path: string;
} | {
    op: 'replace';
    path: string;
    value: JsonValue;
};
export interface TagConfigHistoryActor {
    type: 'user' | 'api-key' | 'system' | 'unknown';
    userId?: string;
}
export interface TagConfigHistoryEntry {
    id: string;
    companyId: string;
    sequence: number;
    createdAt: string;
    actor: TagConfigHistoryActor;
    source: TagConfigChangeSource;
    changeType: TagConfigChangeType;
    summary: string;
    beforeConfigHash: string;
    afterConfigHash: string;
    forwardDiff: JsonPatchOperation[];
    reverseDiff: JsonPatchOperation[];
}
export interface TagConfigHistoryResponse {
    version: '1.0' | string;
    retentionDays: number;
    entries: TagConfigHistoryEntry[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    search?: string;
}
export interface TagRefreshHint {
    strategyScopes: TagStrategyScope[];
    pageIds: string[];
    resourceIds: string[];
    subscriptionIds: string[];
    queryFamilies: string[];
    reason: string;
}
export interface TagQuickOption {
    key: string;
    importance: TagImportance;
    possibleValues: string[];
    missingMandatory: boolean;
    allowedByScope: boolean;
    source: 'mandatory' | 'optional' | 'catalog';
}
export interface TagStrategySummary {
    strategy: TagDisplayStrategy;
    scope: TagStrategyScope;
    catalogCount: number;
    mandatoryCount: number;
    optionalCount: number;
    scopedMandatoryCount: number;
    scopedOptionalCount: number;
    hasMeaningfulStrategy: boolean;
    setupRequired: boolean;
}
export type GuidedTagFilterField = 'resourceId' | 'subscriptionId' | 'resourceGroup' | 'provider' | 'resourceType' | 'fullType' | 'location' | 'name' | 'tag';
export type GuidedTagFilterOperator = 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'exists' | 'not_exists';
export type GuidedTagFilterTagSource = 'azure' | 'spotto' | 'any';
export interface GuidedTagRuleFilter {
    field: GuidedTagFilterField;
    operator: GuidedTagFilterOperator;
    value: string | string[];
    tagKey?: string;
    tagSource?: GuidedTagFilterTagSource;
}
export interface GuidedTagRuleProposal {
    proposalId?: string;
    ruleName: string;
    notes?: string;
    strategyScope: TagStrategyScope;
    pageId?: string;
    filters: GuidedTagRuleFilter[];
    setTags: Record<string, string>;
    deleteTags?: string[];
}
export interface GuidedTagPreviewResource {
    resourceId: string;
    name?: string;
    subscriptionId?: string;
    resourceGroup?: string;
    fullType?: string;
    location?: string;
    beforeSpottoTags: Record<string, string>;
    afterSpottoTags: Record<string, string>;
    changedTags: Record<string, string | null>;
}
export interface GuidedTagRulePreviewRequest {
    companyId?: string;
    proposal: GuidedTagRuleProposal;
    subscriptionIds?: string[];
    resourceIds?: string[];
    sampleLimit?: number;
}
export interface GuidedTagRulePreviewResponse {
    proposalId: string;
    baseConfigHash: string;
    previewHash: string;
    proposal: GuidedTagRuleProposal;
    proposedRule: TagRule;
    matchCount: number;
    sampleResources: GuidedTagPreviewResource[];
    warnings: string[];
    conflicts: string[];
    refreshHints: TagRefreshHint;
}
export interface GuidedTagRuleApplyRequest {
    companyId?: string;
    preview: GuidedTagRulePreviewResponse;
    confirmed?: boolean;
}
export interface GuidedTagRuleApplyResponse {
    success: boolean;
    tags: TagRuleSet;
    baseConfigHash: string;
    currentConfigHash: string;
    appliedRuleName: string;
    matchCount: number;
    refreshHints: TagRefreshHint;
}
export interface TagHistoryRestorePreviewRequest {
    companyId?: string;
    historyId: string;
    pageId?: string;
    strategyScope?: TagStrategyScope;
}
export interface TagHistoryRestorePreviewResponse {
    historyId: string;
    restoreHash: string;
    restorable: boolean;
    expectedCurrentConfigHash: string;
    currentConfigHash: string;
    summary: string;
    source: TagConfigChangeSource;
    actor: TagConfigHistoryActor;
    conflictReason?: string;
    refreshHints: TagRefreshHint;
}
export interface TagHistoryRestoreRequest extends TagHistoryRestorePreviewRequest {
    preview?: TagHistoryRestorePreviewResponse;
    confirmed?: boolean;
}
export interface TagHistoryRestoreResponse {
    success: boolean;
    tags: TagRuleSet;
    historyId: string;
    currentConfigHash: string;
    refreshHints: TagRefreshHint;
}
//# sourceMappingURL=tags.d.ts.map