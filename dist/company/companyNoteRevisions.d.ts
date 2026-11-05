import type { CompanyContextActor } from './companyContext';
import type { CompanyNoteDocument, SaveCompanyNoteRequest } from './companyNotes';
import type { CompanyMeetingNoteDocument } from './companyMeetings';
export interface CompanyNoteRevisionSummary {
    companyId: string;
    noteId: string;
    revisionId: string;
    sequence: number;
    contentHash: string;
    createdAt: string;
    actor: CompanyContextActor;
    operation: 'create' | 'update' | 'autosave' | 'ai-apply' | 'restore' | 'delete' | 'import';
    parentRevisionId?: string;
    restoredFromRevisionId?: string;
}
export interface CompanyNoteRevisionSnapshot {
    revision: CompanyNoteRevisionSummary;
    /** Complete immutable content; a delete snapshot explicitly marks the tombstone. */
    document: CompanyNoteDocument | CompanyMeetingNoteDocument;
    deleted: boolean;
}
export interface CompanyNoteRevisionListResponse {
    companyId: string;
    noteId: string;
    revisions: CompanyNoteRevisionSummary[];
    nextCursor?: string;
}
/** Separate from legacy numeric expectedRevision writes; both concurrency schemes cannot be mixed. */
export type CompanyNoteRevisionUpdateRequest = SaveCompanyNoteRequest & {
    expectedRevision?: never;
    baseRevisionId: string;
    idempotencyKey: string;
};
export type CompanyNoteRevisionCreateRequest = SaveCompanyNoteRequest & {
    expectedRevision?: never;
    baseRevisionId?: never;
    idempotencyKey: string;
};
export interface CompanyNoteRevisionRestoreRequest {
    baseRevisionId: string;
    restoreRevisionId: string;
    idempotencyKey: string;
}
export interface CompanyNoteRevisionDeleteRequest {
    baseRevisionId: string;
    idempotencyKey: string;
}
export type CompanyNoteRevisionMutationResult = {
    status: 'committed';
    revision: CompanyNoteRevisionSummary;
} | {
    status: 'conflict';
    currentRevisionId: string;
    reasonCode: string;
};
export interface CompanyNoteRevisionCompareRequest {
    companyId: string;
    noteId: string;
    fromRevisionId: string;
    toRevisionId: string;
}
/** Consumers compare structured responses by question ID, not by array position. */
export interface CompanyNoteRevisionCompareResponse {
    from: CompanyNoteRevisionSnapshot;
    to: CompanyNoteRevisionSnapshot;
}
//# sourceMappingURL=companyNoteRevisions.d.ts.map