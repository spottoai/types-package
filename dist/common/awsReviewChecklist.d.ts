import type { ReviewChecklistDocument, ReviewChecklistItem, ReviewChecklistItemState } from '../azure/reviewChecklist.js';
export interface AwsReviewChecklistScope {
    providerName: 'aws';
    companyId: string;
    cloudAccountId: string;
    /** Canonical AWS account ID, exactly twelve digits. */
    providerScopeId: string;
}
/** Credential-free, non-session queue command authorized by the API. */
export interface AwsReviewChecklistScanCommand extends AwsReviewChecklistScope {
    schemaVersion: 1;
    action: 'aws-checklist-review';
    checklistId: string;
    requestId: string;
    requestedAt: string;
    /** SHA-256 of the current generated definition, lowercase hexadecimal. */
    sourceVersion: string;
}
/** Generated API data; the engine retains source questions and risk rules. */
export interface AwsReviewChecklistDefinitionProjection {
    checklistId: string;
    sourceVersion: string;
    name: string;
    state: string | null;
    timestamp: string | null;
    items: ReviewChecklistItem[];
}
export interface AwsReviewChecklistDocument extends ReviewChecklistDocument {
    schemaVersion: 1;
    providerName: 'aws';
    companyId: string;
    cloudAccountId: string;
    providerScopeId: string;
    sourceVersion: string;
    requestId?: string;
    requestedAt?: string;
}
export interface AwsReviewChecklistManualStateDocument extends AwsReviewChecklistScope {
    schemaVersion: 1;
    checklistId: string;
    /** Status validity is bound per item; retain comments after definition changes. */
    items: Record<string, ReviewChecklistItemState & {
        sourceVersion: string;
    }>;
}
export declare function normalizeAwsReviewChecklistScope(value: unknown): AwsReviewChecklistScope;
export declare function normalizeAwsReviewChecklistScanCommand(value: unknown): AwsReviewChecklistScanCommand;
/** Full container-prefixed private result path; identities cannot contain path delimiters. */
export declare function buildAwsReviewChecklistResultPath(scope: AwsReviewChecklistScope, checklistId: string): string;
export declare function buildAwsReviewChecklistStatePath(scope: AwsReviewChecklistScope, checklistId: string): string;
/** The caller supplies its clock. No stored evidence or inferred pass is introduced. */
export declare function buildAwsReviewChecklistManualDocument(scope: AwsReviewChecklistScope, projection: AwsReviewChecklistDefinitionProjection, generatedAt: string): AwsReviewChecklistDocument;
//# sourceMappingURL=awsReviewChecklist.d.ts.map