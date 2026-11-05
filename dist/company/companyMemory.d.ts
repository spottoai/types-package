import type { CompanyContextActor, CompanyContextFacets, CompanyContextScope, CompanyContextSource, CompanyContextCoverage } from './companyContext';
export declare const COMPANY_MEMORY_SCHEMA_VERSION: 1;
export declare const COMPANY_MEMORY_FEATURE_KEY: "company_memory";
export declare const COMPANY_MEMORY_PERMISSION_KEYS: readonly ["company_memory.view", "company_memory.manage"];
export type CompanyMemoryPermissionKey = (typeof COMPANY_MEMORY_PERMISSION_KEYS)[number];
export type CompanyMemorySources = [CompanyContextSource, ...CompanyContextSource[]];
export type CompanyMemoryAssignee = {
    kind: 'person';
    personId: string;
} | {
    kind: 'team';
    teamId: string;
} | {
    kind: 'unknown';
    reason: string;
};
export interface CompanyMemoryResponsibility {
    relationship: 'business-owner' | 'technical-owner' | 'approver' | 'support-team';
    areaId: string;
    assignee: CompanyMemoryAssignee;
    effectiveFrom?: string;
    effectiveUntil?: string;
}
export type CompanyMemoryContent = {
    statement: string;
    facets: CompanyContextFacets;
    scope?: CompanyContextScope;
    effectiveFrom?: string;
    expiresAt?: string;
    reviewAt?: string;
} & ({
    kind: 'fact' | 'objective' | 'constraint' | 'decision';
    responsibility?: never;
} | {
    kind: 'responsibility';
    responsibility: CompanyMemoryResponsibility;
});
export interface CompanyMemoryProvenance {
    kind: 'company-authored' | 'reported' | 'model-interpretation' | 'spotto-derived';
    confidence: 'low' | 'medium' | 'high';
    uncertainty?: string;
}
export interface CompanyMemoryRevisionReference {
    memoryId: string;
    revisionId: string;
}
export interface CompanyMemoryRecordBase extends CompanyMemoryRevisionReference {
    schemaVersion: typeof COMPANY_MEMORY_SCHEMA_VERSION;
    companyId: string;
    contentHash: string;
    content: CompanyMemoryContent;
    sources: CompanyMemorySources;
    provenance: CompanyMemoryProvenance;
    createdAt: string;
    updatedAt: string;
    createdBy: CompanyContextActor;
    supersedes?: CompanyMemoryRevisionReference[];
    contradicts?: CompanyMemoryRevisionReference[];
}
/** Proposals are review material and cannot be used as approved shared context. */
export interface CompanyMemoryProposal extends CompanyMemoryRecordBase {
    review: {
        state: 'proposed';
        reviewedAt?: never;
        reviewedBy?: never;
    };
    eligibility?: never;
}
export type CompanyMemoryReview = {
    state: 'active' | 'disputed' | 'rejected' | 'superseded' | 'forgotten';
    reviewedAt: string;
    reviewedBy: CompanyContextActor;
    reason?: string;
};
/** API-assessed source and temporal eligibility; review alone cannot make a source accessible. */
export type CompanyMemoryEligibility = {
    status: 'eligible';
} | {
    status: 'expired' | 'source-ineligible' | 'needs-review';
    reasonCode: string;
};
/** A management/history projection; callers must also check review state and current eligibility before AI use. */
export interface CompanyMemoryEntry extends CompanyMemoryRecordBase {
    review: CompanyMemoryReview;
    eligibility: CompanyMemoryEligibility;
}
export type CompanyMemoryRecord = CompanyMemoryProposal | CompanyMemoryEntry;
export interface CompanyMemoryIdentity {
    companyId: string;
    identityId: string;
    kind: 'area' | 'person' | 'team';
    displayName: string;
    aliases: string[];
    revisionId: string;
    description?: string;
    /** Explicit validated associations; matching names never establish these links. */
    associations?: ({
        kind: 'spotto-user';
        userId: string;
    } | {
        kind: 'resource';
        resourceId: string;
    } | {
        kind: 'ownership-record';
        recordId: string;
    })[];
}
export type CompanyMemoryIdentityWriteRequest = {
    companyId: string;
    idempotencyKey: string;
    identity: Omit<CompanyMemoryIdentity, 'companyId' | 'identityId' | 'revisionId'>;
} & ({
    operation: 'create';
    identityId?: never;
    baseRevisionId?: never;
} | {
    operation: 'update';
    identityId: string;
    baseRevisionId: string;
});
export interface CompanyMemoryIdentityMergeRequest {
    companyId: string;
    idempotencyKey: string;
    sourceIdentityId: string;
    sourceBaseRevisionId: string;
    targetIdentityId: string;
    targetBaseRevisionId: string;
}
export interface CompanyMemoryMutationBase {
    companyId: string;
    idempotencyKey: string;
}
export interface CompanyMemoryExistingMutationBase extends CompanyMemoryMutationBase {
    memoryId: string;
    baseRevisionId: string;
}
/** Server derives actors/provenance. New manual statements get a company-owned source snapshot. */
export type CompanyMemoryMutationRequest = (CompanyMemoryMutationBase & {
    operation: 'create';
    content: CompanyMemoryContent;
}) | (CompanyMemoryExistingMutationBase & {
    operation: 'edit-proposal' | 'correct';
    content: CompanyMemoryContent;
    reason?: string;
}) | (CompanyMemoryExistingMutationBase & {
    operation: 'approve' | 'restore';
    reviewedContentHash: string;
    reviewedSources: CompanyMemorySources;
}) | (CompanyMemoryExistingMutationBase & {
    operation: 'reject' | 'forget' | 'dispute';
    reason?: string;
});
/** The server stores suppression locators privately; this safe receipt carries no forgotten statement. */
export interface CompanyMemoryExclusionReceipt extends CompanyMemoryRevisionReference {
    reason: 'corrected' | 'forgotten' | 'superseded';
    replacement?: CompanyMemoryRevisionReference;
}
export type CompanyMemoryMutationResult = {
    companyId: string;
    memoryId: string;
} & ({
    status: 'committed';
    revisionId: string;
    contextVersion: string;
    exclusion?: CompanyMemoryExclusionReceipt;
} | {
    status: 'conflict';
    currentRevisionId: string;
    reasonCode: string;
} | {
    status: 'failed';
    reasonCode: string;
    retryable: boolean;
});
export interface CompanyMemoryBatchReviewRequest {
    companyId: string;
    items: Extract<CompanyMemoryMutationRequest, {
        operation: 'approve' | 'restore';
    } | {
        operation: 'reject' | 'forget' | 'dispute';
    }>[];
}
/** Per-item outcomes are authoritative; a batch never implies all entries were committed. */
export interface CompanyMemoryBatchReviewResponse {
    companyId: string;
    results: CompanyMemoryMutationResult[];
}
export interface CompanyMemoryListRequest {
    companyId: string;
    query?: string;
    reviewStates?: (CompanyMemoryReview['state'] | 'proposed')[];
    facets?: Partial<CompanyContextFacets>;
    cursor?: string;
    limit?: number;
}
export interface CompanyMemoryListResponse {
    companyId: string;
    contextVersion: string;
    records: CompanyMemoryRecord[];
    coverage: CompanyContextCoverage;
    nextCursor?: string;
}
/** Explicitly inspected immutable history; never an automatic extraction or retrieval source. */
export interface CompanyMemoryHistoryResponse {
    companyId: string;
    memoryId: string;
    revisions: CompanyMemoryRecord[];
    nextCursor?: string;
}
/** Private input, authorized against the requesting conversation owner; never emitted as a shared source. */
export interface CompanyMemoryPromotionPreviewRequest {
    companyId: string;
    conversationId: string;
    messageIds: [string, ...string[]];
    content: CompanyMemoryContent;
}
export interface CompanyMemoryPromotionPreview {
    companyId: string;
    previewId: string;
    revisionId: string;
    contentHash: string;
    content: CompanyMemoryContent;
    visibility: 'company-memory-viewers';
    originalConversationShared: false;
    retainedAfterConversationDeletion: true;
}
/** Server reauthorizes the original source and binds the preview's exact shared wording before writing. */
export interface CompanyMemoryPromotionCommitRequest extends CompanyMemoryMutationBase {
    previewId: string;
    baseRevisionId: string;
    reviewedContentHash: string;
}
//# sourceMappingURL=companyMemory.d.ts.map