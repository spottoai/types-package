import type {
  CompanyNoteByCategoryResponse,
  CompanyNoteCategory,
  CompanyNoteContent,
  CompanyNoteContextCategory,
  CompanyNoteContextTemplateKey,
  CompanyNoteDocument,
  CompanyNoteListItem,
  CompanyNoteListResponse,
  CompanyNoteOrdinaryCategory,
  CompanyNoteSummary,
  CompanyNoteTemplateDefinition,
  CompanyNoteTemplateKey,
  CompanyNotesAIRequest,
  CompanyNotesAIResponse,
  CompanyNotesFeatureKey,
  CompanyNotesPermissionKey,
  CreateCompanyNoteRequest,
  DeleteCompanyNoteResponse,
  ListCompanyNotesQuery,
  UpdateCompanyNoteRequest,
} from '../index';
import {
  COMPANY_NOTE_CATEGORIES,
  COMPANY_NOTE_CONTEXT_CATEGORY_ORDER,
  COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS,
  COMPANY_NOTE_MEETING_TEMPLATE_KEY,
  COMPANY_NOTE_SCHEMA_VERSION,
  COMPANY_NOTE_TEMPLATE_KEYS,
  COMPANY_NOTES_AI_MODES,
  COMPANY_NOTES_FEATURE_KEY,
  COMPANY_NOTES_MANAGE_PERMISSION_KEY,
} from '../index';

const noteContent: CompanyNoteContent = {
  format: 'tiptap-json',
  document: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Reviewed Azure cost actions and backup posture.',
          },
        ],
      },
    ],
  },
  plainText: 'Reviewed Azure cost actions and backup posture.',
};

const noteSummary: CompanyNoteSummary = {
  noteId: 'note-123',
  companyId: 'company-123',
  category: 'general',
  title: 'Monthly service review',
  noteDate: '2026-06-26',
  plainTextPreview: 'Reviewed Azure cost actions and backup posture.',
  createdAt: '2026-06-26T10:00:00.000Z',
  createdByUserId: 'user-123',
  createdByDisplayName: 'Taylor Admin',
  updatedAt: '2026-06-26T10:15:00.000Z',
  updatedByUserId: 'user-123',
  updatedByDisplayName: 'Taylor Admin',
  revision: 1,
};

const noteDocument: CompanyNoteDocument = {
  ...noteSummary,
  schemaVersion: COMPANY_NOTE_SCHEMA_VERSION,
  content: noteContent,
};

const securityTemplate: CompanyNoteTemplateDefinition = {
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  sections: [
    {
      sectionId: 'current-security-posture',
      heading: 'Current Security Posture',
      helperText: 'Capture identity, exposure, and control posture that matters to this customer.',
      aiPromptHint: 'Summarize current security signals and risks.',
    },
  ],
};

const ordinaryListItem: CompanyNoteListItem = {
  ...noteSummary,
  kind: 'note',
  saved: true,
  category: 'general',
};

const savedContextSlotListItem: CompanyNoteListItem = {
  noteId: 'note-security',
  companyId: 'company-123',
  kind: 'context-slot',
  saved: true,
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  noteDate: '2026-06-26',
  plainTextPreview: 'Identity posture and perimeter exposure notes.',
  createdAt: '2026-06-26T10:00:00.000Z',
  updatedAt: '2026-06-26T10:15:00.000Z',
  revision: 1,
};

const unsavedContextSlotListItem: CompanyNoteListItem = {
  companyId: 'company-123',
  kind: 'context-slot',
  saved: false,
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
};

const savedByCategoryResponse: CompanyNoteByCategoryResponse = {
  ...noteDocument,
  kind: 'context-slot',
  saved: true,
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  template: securityTemplate,
};

const virtualByCategoryResponse: CompanyNoteByCategoryResponse = {
  companyId: 'company-123',
  kind: 'context-slot',
  saved: false,
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  schemaVersion: COMPANY_NOTE_SCHEMA_VERSION,
  title: 'Security',
  noteDate: '2026-06-26',
  content: noteContent,
  template: securityTemplate,
};

const listQuery: ListCompanyNotesQuery = {
  records: 25,
  category: 'security',
  search: 'backup',
  fromDate: '2026-06-01',
  toDate: '2026-06-30',
};

const listResponse: CompanyNoteListResponse = {
  results: [savedContextSlotListItem, unsavedContextSlotListItem, ordinaryListItem],
  continuation: {
    nextPartitionKey: 'company-123',
    nextRowKey: '2026-06-26T09:00:00.000Z|note-123',
  },
};

const createRequest: CreateCompanyNoteRequest = {
  title: 'Monthly service review',
  noteDate: '2026-06-26',
  content: noteContent,
};

const updateRequest: UpdateCompanyNoteRequest = {
  ...createRequest,
  expectedRevision: 1,
};

const meetingCreateRequest: CreateCompanyNoteRequest = {
  title: 'Meeting Notes',
  noteDate: '2026-06-26',
  category: 'meeting',
  templateKey: COMPANY_NOTE_MEETING_TEMPLATE_KEY,
  templateVersion: 1,
  content: noteContent,
};

const contextCreateRequest: CreateCompanyNoteRequest = {
  title: 'Security',
  noteDate: '2026-06-26',
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  content: noteContent,
};

const deleteResponse: DeleteCompanyNoteResponse = {
  noteId: 'note-123',
  deletedAt: '2026-06-26T11:00:00.000Z',
};

const aiRequest: CompanyNotesAIRequest = {
  companyId: 'company-123',
  noteId: 'note-123',
  title: 'Monthly service review',
  noteDate: '2026-06-26',
  plainText: 'Reviewed Azure cost actions and backup posture.',
  userPrompt: 'Summarize the follow-up actions.',
};

const templateAIRequest: CompanyNotesAIRequest = {
  companyId: 'company-123',
  noteId: 'note-security',
  mode: 'template-draft',
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  noteDate: '2026-06-26',
  plainText: 'Current Security Posture',
  userPrompt: 'Draft the security context from Spotto data.',
  sourceMode: 'spotto-only',
};

const aiResponse: CompanyNotesAIResponse = {
  message: 'Prepared an updated note with clearer follow-up actions.',
  proposedPlainText: 'Reviewed Azure cost actions and backup posture.\n\nFollow up on the Azure cost actions and validate backup posture.',
};

const templateAIResponse: CompanyNotesAIResponse = {
  mode: 'template-draft',
  message: 'Prepared section proposals for review.',
  advisorSummary: 'Security priorities appear concentrated around identity posture and public exposure.',
  proposedSections: [
    {
      sectionId: 'current-security-posture',
      heading: 'Current Security Posture',
      content: 'Identity posture and public exposure require follow-up review.',
      rationale: 'Based on current Defender and exposure signals.',
    },
  ],
};

const companyResearchAIResponse: CompanyNotesAIResponse = {
  mode: 'company-research',
  message: 'Prepared sourced company profile proposals for review.',
  proposedSections: [
    {
      sectionId: 'public-research-and-sources',
      heading: 'Public Research and Sources',
      content: 'Public profile research is ready for review.',
    },
  ],
  sources: [
    {
      title: 'Company website',
      url: 'https://example.com',
      retrievedAt: '2026-06-26T11:00:00.000Z',
      sectionId: 'public-research-and-sources',
      sourceType: 'web',
    },
  ],
};

const category: CompanyNoteCategory = COMPANY_NOTE_CATEGORIES[0];
const ordinaryCategory: CompanyNoteOrdinaryCategory = 'meeting';
const contextCategory: CompanyNoteContextCategory = COMPANY_NOTE_CONTEXT_CATEGORY_ORDER[1];
const templateKey: CompanyNoteTemplateKey = COMPANY_NOTE_TEMPLATE_KEYS[0];
const contextTemplateKey: CompanyNoteContextTemplateKey = COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS[1];
const featureKey: CompanyNotesFeatureKey = COMPANY_NOTES_FEATURE_KEY;
const permissionKey: CompanyNotesPermissionKey = COMPANY_NOTES_MANAGE_PERMISSION_KEY;

void noteContent;
void noteSummary;
void noteDocument;
void securityTemplate;
void ordinaryListItem;
void savedContextSlotListItem;
void unsavedContextSlotListItem;
void savedByCategoryResponse;
void virtualByCategoryResponse;
void listQuery;
void listResponse;
void createRequest;
void updateRequest;
void meetingCreateRequest;
void contextCreateRequest;
void deleteResponse;
void aiRequest;
void templateAIRequest;
void aiResponse;
void templateAIResponse;
void companyResearchAIResponse;
void category;
void ordinaryCategory;
void contextCategory;
void templateKey;
void contextTemplateKey;
void COMPANY_NOTES_AI_MODES;
void featureKey;
void permissionKey;

const invalidContentFormat: CompanyNoteContent = {
  // @ts-expect-error Company Notes content is stored as TipTap JSON.
  format: 'html',
  document: {
    type: 'doc',
  },
};

// @ts-expect-error permission key must be one of the Company Notes permission constants.
const invalidPermissionKey: CompanyNotesPermissionKey = 'company_notes.delete';

// @ts-expect-error category must be one of the published Company Notes categories.
const invalidCategory: CompanyNoteCategory = 'sales';

// @ts-expect-error template key must be one of the built-in v1 template keys.
const invalidTemplateKey: CompanyNoteTemplateKey = 'security-v2';

const invalidUnsavedContextSlot: CompanyNoteListItem = {
  kind: 'context-slot',
  saved: false,
  companyId: 'company-123',
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  // @ts-expect-error unsaved context slots do not expose note IDs.
  noteId: 'note-security',
};

// @ts-expect-error ordinary saved note list items are limited to general or meeting categories.
const invalidOrdinaryListItem: CompanyNoteListItem = {
  ...noteSummary,
  kind: 'note',
  saved: true,
  category: 'security',
};

// @ts-expect-error template AI responses must include section proposals.
const invalidTemplateAIResponse: CompanyNotesAIResponse = {
  mode: 'template-draft',
  message: 'Missing section proposals.',
};

void invalidContentFormat;
void invalidPermissionKey;
void invalidCategory;
void invalidTemplateKey;
void invalidUnsavedContextSlot;
void invalidOrdinaryListItem;
void invalidTemplateAIResponse;
