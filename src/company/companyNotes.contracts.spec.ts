import type {
  CompanyNoteByCategoryResponse,
  CompanyNoteCategory,
  CompanyNoteContent,
  CompanyNoteContextQuestion,
  CompanyNoteContextQuestionResponse,
  CompanyNoteStructuredContextContent,
  CompanyNoteContextCategory,
  CompanyNoteContextTemplateKey,
  CompanyNoteDocument,
  CompanyNoteListItem,
  CompanyNoteListResponse,
  CompanyNoteOrdinaryCategory,
  CompanyNoteRichTextAnswerValue,
  CompanyNoteSummary,
  CompanyNoteTemplateDefinition,
  CompanyNoteTemplateKey,
  CompanyNotesAIRequest,
  CompanyNotesAIAnswerProposal,
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

const richTextAnswerValue: CompanyNoteRichTextAnswerValue = {
  format: 'tiptap-json',
  doc: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Identity posture and public exposure require follow-up review.',
          },
        ],
      },
    ],
  },
  plainText: 'Identity posture and public exposure require follow-up review.',
};

const structuredSecurityContent: CompanyNoteStructuredContextContent = {
  format: 'structured-context-v1',
  responses: [
    {
      questionId: 'security.current-posture',
      value: richTextAnswerValue,
    },
    {
      questionId: 'security.priority-controls',
      value: ['identity', 'backup'],
    },
  ],
  plainText: 'Current Security Posture: Identity posture and public exposure require follow-up review.\nPriority Controls: Identity, Backup',
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
  category: 'general',
  templateKey: undefined,
  schemaVersion: COMPANY_NOTE_SCHEMA_VERSION,
  content: noteContent,
};

const securityQuestion: CompanyNoteContextQuestion = {
  questionId: 'security.current-posture',
  type: 'rich-text',
  label: 'Current Security Posture',
  question: 'What is the customer security posture today?',
  description: 'Capture identity, exposure, and control posture that matters to this customer.',
  help: 'Use durable customer context rather than one-off incident notes.',
  rationale: 'This answer gives advisors enough context to tailor future security recommendations.',
  placeholder: 'Summarize identity posture, exposed assets, controls, and known gaps.',
  required: true,
};

const securityTemplate: CompanyNoteTemplateDefinition = {
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  questions: [
    securityQuestion,
    {
      questionId: 'security.priority-controls',
      type: 'multi-select',
      label: 'Priority Controls',
      question: 'Which control areas should receive the most attention?',
      description: 'Select the security control themes that are most relevant to future advice.',
      help: 'Use the top recurring areas rather than every possible control.',
      rationale: 'A bounded list keeps future recommendations focused on the customer context.',
      options: [
        {
          value: 'identity',
          label: 'Identity',
          description: 'Conditional access, MFA, privileged roles, and identity hygiene.',
        },
        {
          value: 'backup',
          label: 'Backup',
          description: 'Backup coverage, recovery testing, and retention posture.',
        },
      ],
      maxSelections: 3,
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
  content: structuredSecurityContent,
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
  content: structuredSecurityContent,
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
  content: structuredSecurityContent,
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
  selectedQuestionId: 'security.current-posture',
  content: structuredSecurityContent,
  sourceMode: 'spotto-only',
};

const sectionAIRequest: CompanyNotesAIRequest = {
  companyId: 'company-123',
  noteId: 'note-security',
  mode: 'section-draft',
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  noteDate: '2026-06-26',
  plainText: 'Current Security Posture',
  userPrompt: 'Draft only the current posture section.',
  selectedQuestionId: 'security.current-posture',
  content: structuredSecurityContent,
  sourceMode: 'spotto-only',
};

const companyResearchAIRequest: CompanyNotesAIRequest = {
  companyId: 'company-123',
  mode: 'company-research',
  category: 'company-profile',
  templateKey: 'company-profile-v1',
  templateVersion: 1,
  title: 'Company Profile',
  noteDate: '2026-06-26',
  plainText: 'Company Profile',
  userPrompt: 'Research this company profile.',
  selectedQuestionId: 'company-profile.products-and-services',
  sourceMode: 'public-research',
  allowPublicWebSearch: true,
};

const aiResponse: CompanyNotesAIResponse = {
  message: 'Prepared an updated note with clearer follow-up actions.',
  proposedPlainText: 'Reviewed Azure cost actions and backup posture.\n\nFollow up on the Azure cost actions and validate backup posture.',
};

const templateAIResponse: CompanyNotesAIResponse = {
  mode: 'template-draft',
  message: 'Prepared answer proposals for review.',
  advisorSummary: 'Security priorities appear concentrated around identity posture and public exposure.',
  proposedAnswers: [
    {
      questionId: 'security.current-posture',
      value: richTextAnswerValue,
      rationale: 'Based on current Defender and exposure signals.',
    },
  ],
};

const sectionDraftAIResponse: CompanyNotesAIResponse = {
  mode: 'section-draft',
  message: 'Prepared a section proposal for review.',
  proposedAnswers: [
    {
      questionId: 'security.current-posture',
      value: richTextAnswerValue,
    },
  ],
};

const companyResearchAIResponse: CompanyNotesAIResponse = {
  mode: 'company-research',
  message: 'Prepared sourced company profile proposals for review.',
  proposedAnswers: [
    {
      questionId: 'company-profile.public-research-and-sources',
      value: richTextAnswerValue,
    },
  ],
  sources: [
    {
      title: 'Company website',
      url: 'https://example.com',
      retrievedAt: '2026-06-26T11:00:00.000Z',
      questionId: 'company-profile.public-research-and-sources',
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
void richTextAnswerValue;
void structuredSecurityContent;
void noteSummary;
void noteDocument;
void securityQuestion;
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
void sectionAIRequest;
void companyResearchAIRequest;
void aiResponse;
void templateAIResponse;
void sectionDraftAIResponse;
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
  // @ts-expect-error Company Notes content format must be one of the published formats.
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

// @ts-expect-error context note saves must use structured context content.
const invalidContextCreateRequest: CreateCompanyNoteRequest = {
  title: 'Security',
  noteDate: '2026-06-26',
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  content: noteContent,
};

// @ts-expect-error context templates expose questions rather than TipTap sections.
const invalidContextTemplate: CompanyNoteTemplateDefinition = {
  category: 'security',
  templateKey: 'security-v1',
  templateVersion: 1,
  title: 'Security',
  sections: [
    {
      sectionId: 'current-security-posture',
      heading: 'Current Security Posture',
    },
  ],
};

// @ts-expect-error AI answer proposals must target a stable question ID.
const invalidAnswerProposal: CompanyNotesAIAnswerProposal = {
  value: 'Identity posture requires review.',
};

const invalidStructuredResponseLabel: CompanyNoteContextQuestionResponse = {
  questionId: 'security.current-posture',
  value: 'Identity posture requires review.',
  // @ts-expect-error persisted structured responses must not store question labels.
  label: 'Current Security Posture',
};

const invalidStructuredResponseCommentary: CompanyNoteContextQuestionResponse = {
  questionId: 'security.current-posture',
  value: 'Identity posture requires review.',
  // @ts-expect-error persisted structured responses must not store commentary fields.
  commentary: 'Confirm conditional access exclusions with the customer.',
};

// @ts-expect-error rich-text answer values must include a TipTap document.
const invalidRichTextAnswerValue: CompanyNoteRichTextAnswerValue = {
  format: 'tiptap-json',
  plainText: 'Missing TipTap document.',
};

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
void invalidContextCreateRequest;
void invalidContextTemplate;
void invalidAnswerProposal;
void invalidStructuredResponseLabel;
void invalidStructuredResponseCommentary;
void invalidRichTextAnswerValue;
void invalidUnsavedContextSlot;
void invalidOrdinaryListItem;
void invalidTemplateAIResponse;
