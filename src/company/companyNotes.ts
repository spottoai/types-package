export const COMPANY_NOTE_SCHEMA_VERSION = 1 as const;
export const COMPANY_NOTES_FEATURE_KEY = 'company_notes' as const;
export const COMPANY_NOTES_VIEW_PERMISSION_KEY = 'company_notes.view' as const;
export const COMPANY_NOTES_MANAGE_PERMISSION_KEY = 'company_notes.manage' as const;
export const COMPANY_NOTES_PERMISSION_KEYS = [COMPANY_NOTES_VIEW_PERMISSION_KEY, COMPANY_NOTES_MANAGE_PERMISSION_KEY] as const;
export const COMPANY_NOTE_ORDINARY_CATEGORIES = ['general', 'meeting'] as const;
export const COMPANY_NOTE_CONTEXT_CATEGORIES = [
  'company-profile',
  'security',
  'architecture',
  'operations',
  'finops',
  'performance',
  'reliability',
  'roadmap',
] as const;
export const COMPANY_NOTE_CONTEXT_CATEGORY_ORDER = COMPANY_NOTE_CONTEXT_CATEGORIES;
export const COMPANY_NOTE_CATEGORIES = [...COMPANY_NOTE_ORDINARY_CATEGORIES, ...COMPANY_NOTE_CONTEXT_CATEGORIES] as const;
export const COMPANY_NOTE_MEETING_TEMPLATE_KEY = 'meeting-v1' as const;
export const COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS = [
  'company-profile-v1',
  'security-v1',
  'architecture-v1',
  'operations-v1',
  'finops-v1',
  'performance-v1',
  'reliability-v1',
  'roadmap-v1',
] as const;
export const COMPANY_NOTE_TEMPLATE_KEYS = [COMPANY_NOTE_MEETING_TEMPLATE_KEY, ...COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS] as const;
export const COMPANY_NOTES_AI_MODES = ['general-note', 'template-draft', 'coach-selection', 'company-research'] as const;
export const COMPANY_NOTES_AI_SOURCE_MODES = ['spotto-only', 'public-research'] as const;

export type CompanyNoteSchemaVersion = typeof COMPANY_NOTE_SCHEMA_VERSION;
export type CompanyNotesFeatureKey = typeof COMPANY_NOTES_FEATURE_KEY;
export type CompanyNotesPermissionKey = (typeof COMPANY_NOTES_PERMISSION_KEYS)[number];
export type CompanyNoteContentFormat = 'tiptap-json';
export type CompanyNoteCategory = (typeof COMPANY_NOTE_CATEGORIES)[number];
export type CompanyNoteOrdinaryCategory = (typeof COMPANY_NOTE_ORDINARY_CATEGORIES)[number];
export type CompanyNoteContextCategory = (typeof COMPANY_NOTE_CONTEXT_CATEGORIES)[number];
export type CompanyNoteTemplateCategory = Exclude<CompanyNoteCategory, 'general'>;
export type CompanyNoteMeetingTemplateKey = typeof COMPANY_NOTE_MEETING_TEMPLATE_KEY;
export type CompanyNoteContextTemplateKey = (typeof COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS)[number];
export type CompanyNoteTemplateKey = (typeof COMPANY_NOTE_TEMPLATE_KEYS)[number];
export type CompanyNotesAIMode = (typeof COMPANY_NOTES_AI_MODES)[number];
export type CompanyNotesAISourceMode = (typeof COMPANY_NOTES_AI_SOURCE_MODES)[number];

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
  category: CompanyNoteCategory;
  templateKey?: CompanyNoteTemplateKey;
  templateVersion?: number;
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

export interface CompanyNoteSectionTemplate {
  sectionId: string;
  heading: string;
  helperText?: string;
  aiPromptHint?: string;
}

export interface CompanyNoteTemplateDefinition {
  category: CompanyNoteTemplateCategory;
  templateKey: CompanyNoteTemplateKey;
  templateVersion: number;
  title: string;
  sections: CompanyNoteSectionTemplate[];
}

export type CompanyNoteSavedContextSlotListItem = Omit<CompanyNoteSummary, 'category' | 'templateKey' | 'templateVersion'> & {
  kind: 'context-slot';
  saved: true;
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
};

export interface CompanyNoteUnsavedContextSlotListItem {
  kind: 'context-slot';
  saved: false;
  companyId: string;
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  title: string;
}

export type CompanyNoteOrdinaryListItem = Omit<CompanyNoteSummary, 'category'> & {
  kind: 'note';
  saved: true;
  category: CompanyNoteOrdinaryCategory;
};

export type CompanyNoteListItem = CompanyNoteSavedContextSlotListItem | CompanyNoteUnsavedContextSlotListItem | CompanyNoteOrdinaryListItem;

export type CompanyNoteSavedByCategoryResponse = Omit<CompanyNoteDocument, 'category' | 'templateKey' | 'templateVersion'> & {
  kind: 'context-slot';
  saved: true;
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  template?: CompanyNoteTemplateDefinition;
};

export interface CompanyNoteVirtualByCategoryResponse {
  kind: 'context-slot';
  saved: false;
  companyId: string;
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  schemaVersion: CompanyNoteSchemaVersion;
  title: string;
  /** Date-only value in yyyy-mm-dd format. */
  noteDate: string;
  content: CompanyNoteContent;
  template: CompanyNoteTemplateDefinition;
}

export type CompanyNoteByCategoryResponse = CompanyNoteSavedByCategoryResponse | CompanyNoteVirtualByCategoryResponse;

export interface ListCompanyNotesQuery {
  records?: number;
  nextPartitionKey?: string;
  nextRowKey?: string;
  category?: CompanyNoteCategory;
  search?: string;
  fromDate?: string;
  toDate?: string;
  includeDeleted?: boolean;
}

export interface CompanyNoteListResponse {
  results: CompanyNoteListItem[];
  continuation?: {
    nextPartitionKey?: string;
    nextRowKey?: string;
  };
}

export interface SaveCompanyNoteRequest {
  title: string;
  noteDate: string;
  content: CompanyNoteContent;
  category?: CompanyNoteCategory;
  templateKey?: CompanyNoteTemplateKey;
  templateVersion?: number;
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

export interface CompanyNotesAIRequest {
  companyId: string;
  noteId?: string;
  mode?: CompanyNotesAIMode;
  category?: CompanyNoteCategory;
  templateKey?: CompanyNoteTemplateKey;
  templateVersion?: number;
  title: string;
  noteDate: string;
  plainText: string;
  userPrompt: string;
  selectedPlainText?: string;
  selectedSectionId?: string;
  sourceMode?: CompanyNotesAISourceMode;
}

export interface CompanyNotesAISectionProposal {
  sectionId: string;
  heading: string;
  content: string;
  rationale?: string;
}

export interface CompanyNotesAISource {
  title: string;
  url?: string;
  retrievedAt: string;
  sectionId?: string;
  sourceType: 'web' | 'spotto';
}

export interface CompanyNotesAIGeneralResponse {
  mode?: 'general-note' | 'coach-selection';
  message: string;
  proposedPlainText: string;
}

export interface CompanyNotesAITemplateResponse {
  mode: 'template-draft' | 'company-research';
  message: string;
  advisorSummary?: string;
  proposedSections: CompanyNotesAISectionProposal[];
  proposedPlainText?: string;
  sources?: CompanyNotesAISource[];
}

export type CompanyNotesAIResponse = CompanyNotesAIGeneralResponse | CompanyNotesAITemplateResponse;
