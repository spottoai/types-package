import type {
  AzureResourceNotes,
  AzureResourceNotesField,
  AzureResourceNotesFields,
  GetAzureResourceNotesQuery,
  SaveAzureResourceNotesRequest,
} from './resources';

const allNoteFields: AzureResourceNotesFields = {
  knownIssues: 'Connection pool exhaustion after slot swaps.',
  troubleshooting: 'Recycle the worker and verify SQL transient faults in App Insights.',
  performance: 'Memory spikes during daily report generation around 02:00 UTC.',
  maintenance: 'Apply changes during the weekly Sunday maintenance window.',
  migration: 'Move to AKS after the current shared hosting contract ends.',
  dependencies: 'Depends on shared Redis cache and the central billing database.',
  securityCompliance: 'Production access requires PIM approval and audit logging.',
};

const validReadQuery: GetAzureResourceNotesQuery = {
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Web/sites/site-1',
};

const validWriteRequest: SaveAzureResourceNotesRequest = {
  resourceId: validReadQuery.resourceId,
  notes: allNoteFields,
};

const validResourceNotes: AzureResourceNotes = {
  resourceId: validReadQuery.resourceId,
  subscriptionId: 'sub-123',
  notes: allNoteFields,
  updatedAt: '2026-03-30T10:15:00.000Z',
  updatedByUserId: 'user-123',
  updatedByDisplayName: 'Taylor Admin',
};

const validFieldName: AzureResourceNotesField = 'securityCompliance';

void allNoteFields;
void validReadQuery;
void validWriteRequest;
void validResourceNotes;
void validFieldName;

const invalidFieldValue: AzureResourceNotesFields = {
  // @ts-expect-error notes fields must be strings when provided.
  performance: 42,
};

// @ts-expect-error read query requires resourceId.
const invalidReadQuery: GetAzureResourceNotesQuery = {};

const invalidWriteRequest: SaveAzureResourceNotesRequest = {
  resourceId: validReadQuery.resourceId,
  // @ts-expect-error notes must be an object keyed by the supported note fields.
  notes: 'free-form string',
};

// @ts-expect-error field union only includes the supported resource note keys.
const invalidFieldName: AzureResourceNotesField = 'security';

void invalidFieldValue;
void invalidReadQuery;
void invalidWriteRequest;
void invalidFieldName;
