export const COMPANY_NOTE_SCHEMA_VERSION = 1 as const;
export const COMPANY_NOTES_FEATURE_KEY = 'company_notes' as const;
export const COMPANY_NOTES_VIEW_PERMISSION_KEY = 'company_notes.view' as const;
export const COMPANY_NOTES_MANAGE_PERMISSION_KEY = 'company_notes.manage' as const;
export const COMPANY_NOTES_PERMISSION_KEYS = [COMPANY_NOTES_VIEW_PERMISSION_KEY, COMPANY_NOTES_MANAGE_PERMISSION_KEY] as const;

export type CompanyNoteSchemaVersion = typeof COMPANY_NOTE_SCHEMA_VERSION;
export type CompanyNotesFeatureKey = typeof COMPANY_NOTES_FEATURE_KEY;
export type CompanyNotesPermissionKey = (typeof COMPANY_NOTES_PERMISSION_KEYS)[number];
export type CompanyNoteContentFormat = 'tiptap-json';

export interface CompanyNoteRichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface CompanyNoteRichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: CompanyNoteRichTextNode[];
  marks?: CompanyNoteRichTextMark[];
  text?: string;
}

export interface CompanyNoteContent {
  format: CompanyNoteContentFormat;
  document: CompanyNoteRichTextNode;
  plainText?: string;
}

export interface CompanyNoteAuditFields {
  createdAt: string;
  createdByUserId?: string;
  createdByDisplayName?: string;
  updatedAt: string;
  updatedByUserId?: string;
  updatedByDisplayName?: string;
}

export interface CompanyNoteBase extends CompanyNoteAuditFields {
  noteId: string;
  companyId: string;
  title: string;
  /** Date-only value in yyyy-mm-dd format. */
  noteDate: string;
  revision?: number;
  deletedAt?: string;
  deletedByUserId?: string;
}

export interface CompanyNoteSummary extends CompanyNoteBase {
  plainTextPreview?: string;
}

export interface CompanyNoteDocument extends CompanyNoteBase {
  schemaVersion: CompanyNoteSchemaVersion;
  content: CompanyNoteContent;
}

export interface ListCompanyNotesQuery {
  records?: number;
  nextPartitionKey?: string;
  nextRowKey?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  includeDeleted?: boolean;
}

export interface CompanyNoteListResponse {
  results: CompanyNoteSummary[];
  continuation?: {
    nextPartitionKey?: string;
    nextRowKey?: string;
  };
}

export interface SaveCompanyNoteRequest {
  title: string;
  noteDate: string;
  content: CompanyNoteContent;
  expectedRevision?: number;
}

export type CreateCompanyNoteRequest = SaveCompanyNoteRequest;
export type UpdateCompanyNoteRequest = SaveCompanyNoteRequest;
export type CompanyNoteDetailResponse = CompanyNoteDocument;
export type CreateCompanyNoteResponse = CompanyNoteDocument;
export type UpdateCompanyNoteResponse = CompanyNoteDocument;

export interface DeleteCompanyNoteResponse {
  noteId: string;
  deletedAt: string;
}
