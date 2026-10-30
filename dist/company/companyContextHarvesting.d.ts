import type { CompanyContextCoverage, CompanyContextNoteSource, CompanyContextSource, CompanyContextSourceLocator } from './companyContext';
import type { CompanyMemoryContent, CompanyMemoryRevisionReference } from './companyMemory';
import type { CompanyNoteContextAnswerValue, CompanyNoteContextCategory } from './companyNotes';
export declare const COMPANY_CONTEXT_HARVEST_SCHEMA_VERSION: 1;
/** Admission supplies identity only. The API resolves source versions, authority and execution budgets. */
export type CompanyContextHarvestSource = {
    kind: 'conversation';
    conversationId: string;
    noteId?: never;
} | {
    kind: 'company-note';
    noteId: string;
    conversationId?: never;
};
export interface CompanyContextHarvestRequest {
    companyId: string;
    idempotencyKey: string;
    source: CompanyContextHarvestSource;
}
/** Restricted evidence, never a CompanyContextSource or a company-visible promotion source. */
export interface CompanyContextPrivateConversationSource {
    kind: 'conversation';
    conversationId: string;
    version: {
        kind: 'content-hash';
        contentHash: string;
    };
    locator: CompanyContextSourceLocator;
    messageIds?: [string, ...string[]];
}
export type CompanyContextHarvestSourceReference = CompanyContextSource | CompanyContextPrivateConversationSource;
export type CompanyContextHarvestRunStatus = 'queued' | 'extracting' | 'comparing' | 'ready-for-review' | 'no-output' | 'superseded' | 'cancelled' | 'failed' | 'unavailable';
/** A conversation run is owner-only, including its status, existence and source version. */
export interface CompanyContextHarvestRun {
    schemaVersion: typeof COMPANY_CONTEXT_HARVEST_SCHEMA_VERSION;
    companyId: string;
    runId: string;
    revisionId: string;
    source: CompanyContextHarvestSource;
    /** Server-attributed immutable snapshot identity; callers cannot select it at admission. */
    sourceVersion: string;
    status: CompanyContextHarvestRunStatus;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    coverage: CompanyContextCoverage;
    batchId?: string;
    reasonCode?: string;
    attemptCount?: number;
}
export type CompanyContextChangeItemStatus = 'proposed' | 'approved' | 'rejected' | 'conflict';
export type CompanyContextChangeBatchStatus = 'awaiting-review' | 'partially-reviewed' | 'reviewed' | 'expired' | 'superseded';
export interface CompanyContextMemoryChangeTarget {
    memoryId: string;
    baseRevisionId: string;
}
/** An unsaved context slot has neither note identity nor base revision. */
export type CompanyContextNoteChangeTarget = {
    category: CompanyNoteContextCategory;
    questionId: string;
} & ({
    noteId: string;
    baseRevisionId: string;
} | {
    noteId?: never;
    baseRevisionId?: never;
});
export interface CompanyContextChangeItemBase<Source extends CompanyContextHarvestSourceReference = CompanyContextHarvestSourceReference> {
    itemId: string;
    revisionId: string;
    /** Binds exact operation, content, target/base, current value and ordered source vector. */
    changeHash: string;
    status: CompanyContextChangeItemStatus;
    sources: [Source, ...Source[]];
    rationale?: string;
    sourceTitle?: string;
    excerpt?: string;
}
export type CompanyContextMemoryChange<Source extends CompanyContextHarvestSourceReference = CompanyContextHarvestSourceReference> = CompanyContextChangeItemBase<Source> & {
    kind: 'memory';
} & ({
    operation: 'add';
    content: CompanyMemoryContent;
    target?: never;
    currentContent?: never;
} | {
    operation: 'correct';
    target: CompanyContextMemoryChangeTarget;
    content: CompanyMemoryContent;
    currentContent?: CompanyMemoryContent;
} | {
    operation: 'forget';
    target: CompanyContextMemoryChangeTarget;
    currentContent: CompanyMemoryContent;
    content?: never;
});
export type CompanyContextNoteChange<Source extends CompanyContextHarvestSourceReference = CompanyContextHarvestSourceReference> = CompanyContextChangeItemBase<Source> & {
    kind: 'context-note';
    target: CompanyContextNoteChangeTarget;
    /** Server-resolved template labels for review presentation, never caller-selected patch paths. */
    questionLabel?: string;
    targetTitle?: string;
    /** Null means there is no saved answer; it is distinct from an empty answer. */
    currentValue: CompanyNoteContextAnswerValue | null;
    proposedValue: CompanyNoteContextAnswerValue;
};
export type CompanyContextChangeItem<Source extends CompanyContextHarvestSourceReference = CompanyContextHarvestSourceReference> = CompanyContextMemoryChange<Source> | CompanyContextNoteChange<Source>;
export interface CompanyContextChangeBatchBase<Source extends CompanyContextHarvestSourceReference = CompanyContextHarvestSourceReference> {
    schemaVersion: typeof COMPANY_CONTEXT_HARVEST_SCHEMA_VERSION;
    companyId: string;
    runId: string;
    batchId: string;
    revisionId: string;
    status: CompanyContextChangeBatchStatus;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    coverage: CompanyContextCoverage;
    items: CompanyContextChangeItem<Source>[];
}
/** Only the current conversation owner can discover this batch or its review count. */
export type CompanyContextPrivateChangeBatch = CompanyContextChangeBatchBase & {
    visibility: 'owner-only';
    ownerUserId: string;
    source: CompanyContextPrivateConversationSource;
};
/** Shared-source review still requires current source authority. Private references cannot occur in its items. */
export type CompanyContextSharedChangeBatch = CompanyContextChangeBatchBase<CompanyContextSource> & {
    visibility: 'source-authorized';
    source: CompanyContextNoteSource;
    ownerUserId?: never;
};
export type CompanyContextChangeBatch = CompanyContextPrivateChangeBatch | CompanyContextSharedChangeBatch;
export interface CompanyContextChangeBatchListRequest {
    companyId: string;
    /** Filters only the authenticated owner's conversation drafts. */
    conversationId?: string;
    cursor?: string;
    limit?: number;
}
export interface CompanyContextChangeBatchListResponse {
    companyId: string;
    batches: CompanyContextChangeBatch[];
    /** Authorized run discovery follows the same private-owner/source access rules as batches. */
    runs?: CompanyContextHarvestRun[];
    nextCursor?: string;
}
/** The API validates the item kind. Editing never changes source, operation or target. */
export type CompanyContextChangeEditRequest = {
    companyId: string;
    batchId: string;
    baseRevisionId: string;
    itemId: string;
    baseItemRevisionId: string;
    idempotencyKey: string;
} & ({
    content: CompanyMemoryContent;
    proposedValue?: never;
} | {
    proposedValue: CompanyNoteContextAnswerValue;
    content?: never;
});
export interface CompanyContextChangeReviewItem {
    itemId: string;
    baseRevisionId: string;
    reviewedChangeHash: string;
    decision: 'approve' | 'reject';
}
/** Review binds a freshly read/edited batch and each selected item's exact immutable change. */
export interface CompanyContextChangeReviewRequest {
    companyId: string;
    batchId: string;
    baseRevisionId: string;
    idempotencyKey: string;
    /** Required by the API for any approved private-source change; sharing retains only the reviewed wording. */
    confirmedCompanyVisibility?: true;
    items: [CompanyContextChangeReviewItem, ...CompanyContextChangeReviewItem[]];
}
/** Independent owning-service receipts; one committed item does not imply an atomic batch save. */
export type CompanyContextChangeReviewResult = {
    itemId: string;
} & ({
    status: 'committed';
    revisionId: string;
    contextVersion?: string;
    memory?: CompanyMemoryRevisionReference;
    noteId?: string;
} | {
    status: 'rejected';
} | {
    status: 'conflict';
    currentRevisionId?: string;
    reasonCode: string;
} | {
    status: 'failed';
    reasonCode: string;
    retryable: boolean;
});
export interface CompanyContextChangeReviewResponse {
    companyId: string;
    batchId: string;
    revisionId: string;
    results: CompanyContextChangeReviewResult[];
}
//# sourceMappingURL=companyContextHarvesting.d.ts.map