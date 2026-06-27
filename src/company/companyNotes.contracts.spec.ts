import type {
  CompanyNoteContent,
  CompanyNoteDocument,
  CompanyNoteListResponse,
  CompanyNoteSummary,
  CompanyNotesFeatureKey,
  CompanyNotesPermissionKey,
  CreateCompanyNoteRequest,
  DeleteCompanyNoteResponse,
  ListCompanyNotesQuery,
  UpdateCompanyNoteRequest,
} from '../index';
import { COMPANY_NOTE_SCHEMA_VERSION, COMPANY_NOTES_FEATURE_KEY, COMPANY_NOTES_MANAGE_PERMISSION_KEY } from '../index';

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

const listQuery: ListCompanyNotesQuery = {
  records: 25,
  search: 'backup',
  fromDate: '2026-06-01',
  toDate: '2026-06-30',
};

const listResponse: CompanyNoteListResponse = {
  results: [noteSummary],
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

const deleteResponse: DeleteCompanyNoteResponse = {
  noteId: 'note-123',
  deletedAt: '2026-06-26T11:00:00.000Z',
};

const featureKey: CompanyNotesFeatureKey = COMPANY_NOTES_FEATURE_KEY;
const permissionKey: CompanyNotesPermissionKey = COMPANY_NOTES_MANAGE_PERMISSION_KEY;

void noteContent;
void noteSummary;
void noteDocument;
void listQuery;
void listResponse;
void createRequest;
void updateRequest;
void deleteResponse;
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

void invalidContentFormat;
void invalidPermissionKey;
