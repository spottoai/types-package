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
export const COMPANY_NOTES_AI_MODES = [
  'general-note',
  'template-draft',
  'section-draft',
  'coach-selection',
  'company-research',
] as const;
export const COMPANY_NOTES_AI_SOURCE_MODES = ['spotto-only', 'public-research'] as const;

export type CompanyNoteSchemaVersion = typeof COMPANY_NOTE_SCHEMA_VERSION;
export type CompanyNotesFeatureKey = typeof COMPANY_NOTES_FEATURE_KEY;
export type CompanyNotesPermissionKey = (typeof COMPANY_NOTES_PERMISSION_KEYS)[number];
export type CompanyNoteContentFormat = 'tiptap-json' | 'structured-context-v1';
export type CompanyNoteCategory = (typeof COMPANY_NOTE_CATEGORIES)[number];
export type CompanyNoteOrdinaryCategory = (typeof COMPANY_NOTE_ORDINARY_CATEGORIES)[number];
export type CompanyNoteContextCategory = (typeof COMPANY_NOTE_CONTEXT_CATEGORIES)[number];
export type CompanyNoteTemplateCategory = Exclude<CompanyNoteCategory, 'general'>;
export type CompanyNoteMeetingTemplateKey = typeof COMPANY_NOTE_MEETING_TEMPLATE_KEY;
export type CompanyNoteContextTemplateKey = (typeof COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS)[number];
export type CompanyNoteTemplateKey = (typeof COMPANY_NOTE_TEMPLATE_KEYS)[number];
export type CompanyNotesAIMode = (typeof COMPANY_NOTES_AI_MODES)[number];
export type CompanyNotesAISourceMode = (typeof COMPANY_NOTES_AI_SOURCE_MODES)[number];
export type CompanyNoteContextQuestionId = string;
export type CompanyNoteContextQuestionType = 'text' | 'textarea' | 'rich-text' | 'select' | 'multi-select' | 'sortable-list';

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

export interface CompanyNoteTipTapContent {
  format: 'tiptap-json';
  document: CompanyNoteRichTextNode;
  plainText?: string;
}

export interface CompanyNoteRichTextAnswerValue {
  format: 'tiptap-json';
  doc: CompanyNoteRichTextNode;
  plainText?: string;
}

export type CompanyNoteContextAnswerValue = string | string[] | CompanyNoteRichTextAnswerValue;

export interface CompanyNoteContextQuestionOption {
  value: string;
  label: string;
  description?: string;
  help?: string;
  rationale?: string;
}

export interface CompanyNoteContextQuestion {
  questionId: CompanyNoteContextQuestionId;
  type: CompanyNoteContextQuestionType;
  label: string;
  question: string;
  description?: string;
  help?: string;
  rationale?: string;
  placeholder?: string;
  options?: CompanyNoteContextQuestionOption[];
  maxSelections?: number;
  required?: boolean;
}

export interface CompanyNoteContextQuestionResponse {
  questionId: CompanyNoteContextQuestionId;
  value: CompanyNoteContextAnswerValue;
}

export interface CompanyNoteStructuredContextContent {
  format: 'structured-context-v1';
  responses: CompanyNoteContextQuestionResponse[];
  plainText?: string;
}

export type CompanyNoteContent = CompanyNoteTipTapContent | CompanyNoteStructuredContextContent;

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

export interface CompanyNoteDocumentBase extends CompanyNoteBase {
  schemaVersion: CompanyNoteSchemaVersion;
}

export type CompanyNoteOrdinaryDocument = Omit<CompanyNoteDocumentBase, 'category' | 'templateKey'> & {
  category: CompanyNoteOrdinaryCategory;
  templateKey?: CompanyNoteMeetingTemplateKey;
  content: CompanyNoteTipTapContent;
};

export type CompanyNoteContextDocument = Omit<CompanyNoteDocumentBase, 'category' | 'templateKey' | 'templateVersion'> & {
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  content: CompanyNoteStructuredContextContent;
};

export type CompanyNoteDocument = CompanyNoteOrdinaryDocument | CompanyNoteContextDocument;

export interface CompanyNoteSectionTemplate {
  sectionId: string;
  heading: string;
  helperText?: string;
  aiPromptHint?: string;
}

export interface CompanyNoteMeetingTemplateDefinition {
  category: 'meeting';
  templateKey: CompanyNoteMeetingTemplateKey;
  templateVersion: number;
  title: string;
  sections: CompanyNoteSectionTemplate[];
  questions?: never;
}

export interface CompanyNoteContextTemplateDefinition {
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  title: string;
  questions: CompanyNoteContextQuestion[];
  sections?: never;
}

export type CompanyNoteTemplateDefinition = CompanyNoteMeetingTemplateDefinition | CompanyNoteContextTemplateDefinition;

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

export type CompanyNoteSavedByCategoryResponse = Omit<CompanyNoteContextDocument, 'category' | 'templateKey' | 'templateVersion'> & {
  kind: 'context-slot';
  saved: true;
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  template?: CompanyNoteContextTemplateDefinition;
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
  content: CompanyNoteStructuredContextContent;
  template: CompanyNoteContextTemplateDefinition;
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

export interface SaveCompanyNoteRequestBase {
  title: string;
  noteDate: string;
  expectedRevision?: number;
}

export type SaveCompanyNoteRequest =
  | (SaveCompanyNoteRequestBase & {
      category?: CompanyNoteOrdinaryCategory;
      templateKey?: CompanyNoteMeetingTemplateKey;
      templateVersion?: number;
      content: CompanyNoteTipTapContent;
    })
  | (SaveCompanyNoteRequestBase & {
      category: CompanyNoteContextCategory;
      templateKey: CompanyNoteContextTemplateKey;
      templateVersion: number;
      content: CompanyNoteStructuredContextContent;
    });

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
  selectedQuestionId?: CompanyNoteContextQuestionId;
  content?: CompanyNoteContent;
  sourceMode?: CompanyNotesAISourceMode;
  allowPublicWebSearch?: boolean;
}

export interface CompanyNotesAISectionProposal {
  sectionId: string;
  heading: string;
  content: string;
  rationale?: string;
}

export interface CompanyNotesAIAnswerProposal {
  questionId: CompanyNoteContextQuestionId;
  value: CompanyNoteContextAnswerValue;
  rationale?: string;
}

export interface CompanyNotesAISource {
  title: string;
  url?: string;
  retrievedAt: string;
  sectionId?: string;
  questionId?: CompanyNoteContextQuestionId;
  sourceType: 'web' | 'spotto';
}

export interface CompanyNotesAIGeneralResponse {
  mode?: 'general-note' | 'coach-selection';
  message: string;
  proposedPlainText: string;
}

export interface CompanyNotesAITemplateResponseBase {
  mode: 'template-draft' | 'section-draft' | 'company-research';
  message: string;
  advisorSummary?: string;
  proposedPlainText?: string;
  sources?: CompanyNotesAISource[];
}

export type CompanyNotesAITemplateResponse =
  | (CompanyNotesAITemplateResponseBase & {
      proposedSections: CompanyNotesAISectionProposal[];
      proposedAnswers?: CompanyNotesAIAnswerProposal[];
    })
  | (CompanyNotesAITemplateResponseBase & {
      proposedAnswers: CompanyNotesAIAnswerProposal[];
      proposedSections?: CompanyNotesAISectionProposal[];
    });

export type CompanyNotesAIResponse = CompanyNotesAIGeneralResponse | CompanyNotesAITemplateResponse;
