import {
  buildAwsReviewChecklistManualDocument,
  buildAwsReviewChecklistResultPath,
  buildAwsReviewChecklistStatePath,
  normalizeAwsReviewChecklistScanCommand,
  normalizeAwsReviewChecklistScope,
  type AwsReviewChecklistDefinitionProjection,
  type AwsReviewChecklistDocument,
  type AwsReviewChecklistManualStateDocument,
  type AwsReviewChecklistScanCommand,
  type AwsReviewChecklistScope,
  type ReviewChecklistAssessmentEvidence,
  type ReviewChecklistCatalogueEntry,
  type ReviewChecklistDocument,
  type ReviewChecklistItemStateUpdateRequest,
} from '../src/index.js';

const scope: AwsReviewChecklistScope = {
  providerName: 'aws',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  providerScopeId: '123456789012',
};
const command: AwsReviewChecklistScanCommand = {
  ...scope,
  schemaVersion: 1,
  action: 'aws-checklist-review',
  checklistId: 'aws-s3',
  requestId: 'request-1',
  requestedAt: '2026-10-05T01:00:00.000Z',
  sourceVersion: 'a'.repeat(64),
};
const projection: AwsReviewChecklistDefinitionProjection = {
  checklistId: 'aws-s3',
  sourceVersion: command.sourceVersion,
  name: 'Amazon S3',
  state: 'Preview',
  timestamp: null,
  items: [{ guid: '3a26244c-7032-52a0-b0eb-1297cf7c88d6', text: 'Review encryption', assessmentMode: 'manual' }],
};
const manual: AwsReviewChecklistDocument = buildAwsReviewChecklistManualDocument(scope, projection, command.requestedAt);
const compatible: ReviewChecklistDocument = manual;
const receiptId: string | undefined = compatible.requestId;
const receiptRequestedAt: string | undefined = compatible.requestedAt;
const legacyAzureDocument: ReviewChecklistDocument = {
  checklistId: 'waf',
  tenantId: 'tenant-1',
  subscriptionId: 'subscription-1',
  name: 'Azure WAF',
  state: 'Preview',
  timestamp: null,
  scanStatus: 'NotRun',
  generatedAt: command.requestedAt,
  items: [],
};
const states: AwsReviewChecklistManualStateDocument = {
  ...scope,
  schemaVersion: 1,
  checklistId: projection.checklistId,
  items: {
    [projection.items[0].guid]: {
      guid: projection.items[0].guid,
      providerName: 'aws',
      checklistId: projection.checklistId,
      subscriptionId: scope.providerScopeId,
      status: 'Fulfilled',
      statusSource: 'user',
      sourceVersion: projection.sourceVersion,
    },
  },
};
const evidence: ReviewChecklistAssessmentEvidence = {
  source: 'security-hub-cspm',
  observedAt: command.requestedAt,
  controlIds: ['S3.8'],
  regions: ['ap-southeast-2'],
  resourceIds: ['arn:aws:s3:::example'],
  findingIds: ['finding-1'],
};
const observedAwsUpdate: ReviewChecklistItemStateUpdateRequest = {
  cloudAccountId: scope.cloudAccountId,
  sourceVersion: projection.sourceVersion,
  status: 'Fulfilled',
  comments: 'Reviewed the current definition.',
};
const legacyAzureCatalogue: ReviewChecklistCatalogueEntry = {
  id: 'waf',
  name: 'Well Architected Framework',
  serviceName: 'Azure',
  state: 'Preview',
  lastModified: '2026-10-05',
  star: false,
};

void compatible;
void receiptId;
void receiptRequestedAt;
void legacyAzureDocument;
void states;
void evidence;
void observedAwsUpdate;
void legacyAzureCatalogue;
void normalizeAwsReviewChecklistScope(scope);
void normalizeAwsReviewChecklistScanCommand(command);
void buildAwsReviewChecklistResultPath(scope, projection.checklistId);
void buildAwsReviewChecklistStatePath(scope, projection.checklistId);

// @ts-expect-error AWS commands require explicit company ownership.
const missingCompany: AwsReviewChecklistScope = { providerName: 'aws', cloudAccountId: 'cloud-1', providerScopeId: '123456789012' };
// @ts-expect-error AWS commands cannot carry an Azure scope discriminator.
const wrongProvider: AwsReviewChecklistScope = { ...scope, providerName: 'azure' };
const unversionedState: AwsReviewChecklistManualStateDocument = {
  ...states,
  // @ts-expect-error Source version is required on every persisted manual override.
  items: { item: { guid: 'item', checklistId: 'aws-s3', subscriptionId: scope.providerScopeId } },
};
// @ts-expect-error The frozen command action cannot target the legacy Azure consumer.
const wrongAction: AwsReviewChecklistScanCommand = { ...command, action: 'azure-checklist-review' };
void missingCompany;
void wrongProvider;
void unversionedState;
void wrongAction;
