import type {
  AzurePolicyEvaluationState,
  ComplianceExpectationResponse,
  ComplianceExpectationRecord,
  CreateRegulatoryComplianceNoteRequest,
  CreatePolicyExemptionQueuedResponse,
  CreatePolicyExemptionRequest,
  EffectiveComplianceExpectation,
  RegulatoryComplianceAssignmentDetail,
  RegulatoryComplianceAssignmentGap,
  RegulatoryComplianceCoverage,
  RegulatoryComplianceCoverageSection,
  RegulatoryComplianceReport,
  RegulatoryComplianceNote,
  RegulatoryComplianceNoteListResponse,
  RegulatoryComplianceNoteTargetType,
  RegulatoryComplianceView,
  RegulatoryComplianceWriteCapability,
  RegulatoryControlDetail,
  RegulatoryControlMetadataResponse,
  RegulatoryControlSummary,
  RegulatoryExemptionSummary,
  RegulatoryPolicyEvaluationSummary,
  RegulatoryResourceEvaluation,
  RegulatoryResourceEvaluationPage,
  RegulatoryStandardCatalogEntry,
  RegulatoryStandardRecommendation,
  RegulatoryStandardSummary,
  RegulatoryStateCounts,
  UpsertComplianceExpectationRequest,
} from './regulatoryCompliance';
import {
  POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION,
  REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_DIRECTORY,
  REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_SCHEMA_VERSION,
  REGULATORY_COMPLIANCE_PORTAL_FILE,
  REGULATORY_COMPLIANCE_REPORT_SCHEMA_VERSION,
} from './regulatoryCompliance';

const generatedAt = '2026-07-29T00:00:00.000Z';
const subscriptionId = 'sub-1';
const assignmentId = '/providers/microsoft.management/managementgroups/root/providers/microsoft.authorization/policyassignments/iso-27001';
const assignmentKey = 'a'.repeat(64);
const definitionId = '/providers/microsoft.authorization/policysetdefinitions/iso-27001-2022';
const policyDefinitionId = '/providers/microsoft.authorization/policydefinitions/storage-public-access';
const policyDefinitionReferenceId = 'storagePublicAccess';
const resourceId = '/subscriptions/sub-1/resourcegroups/production/providers/microsoft.storage/storageaccounts/storage1';

const reportSchemaVersion: '2026-07-29.regulatory-compliance-v1' = REGULATORY_COMPLIANCE_REPORT_SCHEMA_VERSION;
const assignmentDetailSchemaVersion: '2026-07-29.regulatory-compliance-assignment-v1' = REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_SCHEMA_VERSION;
const policyExemptionCommandSchemaVersion: '2026-07-29.policy-exemption-command-v1' = POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION;
const portalFile: 'regulatory-compliance.json.gz' = REGULATORY_COMPLIANCE_PORTAL_FILE;
const assignmentDetailDirectory: 'regulatory-compliance/assignments' = REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_DIRECTORY;

const documentedEvaluationStates: AzurePolicyEvaluationState[] = [
  'compliant',
  'nonCompliant',
  'exempt',
  'error',
  'conflicting',
  'unknown',
  'protected',
  'notStarted',
  'notRegistered',
];

const stateCounts: RegulatoryStateCounts = {
  compliant: 10,
  nonCompliant: 1,
  exempt: 1,
  error: 0,
  conflicting: 0,
  unknown: 0,
  protected: 0,
  notStarted: 0,
  notRegistered: 0,
};

const completeCoverageSection: RegulatoryComplianceCoverageSection = {
  state: 'complete',
  sources: ['resourceGraph', 'arm'],
  observedAt: generatedAt,
};

const coverage: RegulatoryComplianceCoverage = {
  state: 'complete',
  catalog: completeCoverageSection,
  assignments: completeCoverageSection,
  evaluations: {
    state: 'complete',
    sources: ['resourceGraph', 'policyInsights'],
    observedAt: generatedAt,
  },
  exemptions: completeCoverageSection,
  metadata: completeCoverageSection,
};

const partialCoverage: RegulatoryComplianceCoverage = {
  ...coverage,
  state: 'partial',
  evaluations: {
    state: 'unavailable',
    sources: ['policyInsights'],
    observedAt: generatedAt,
    message: 'Policy state evidence could not be read.',
    requiredPermissions: ['Microsoft.PolicyInsights/policyStates/queryResults/action'],
    diagnostics: [{ code: 'AuthorizationFailed', message: 'Policy Insights access was denied.' }],
  },
};

const catalogEntry: RegulatoryStandardCatalogEntry = {
  standardKey: 'azure-policy:iso-27001-2022',
  standardFamilyKey: 'iso-27001',
  definitionId,
  definitionName: 'iso-27001-2022',
  displayName: 'ISO/IEC 27001:2022',
  version: '1.0.0',
  category: 'Regulatory Compliance',
  policyType: 'BuiltIn',
  isBuiltIn: true,
  isPreview: false,
  isDeprecated: false,
  popularityRank: 1,
  documentationUrl: 'https://learn.microsoft.com/azure/compliance/offerings/offering-iso-27001',
};

const controlSummary: RegulatoryControlSummary = {
  controlKey: 'a.8.20',
  name: 'A.8.20',
  displayName: 'Network security',
  domain: 'Technological controls',
  responsibility: 'customer',
  policyMetadataId: '/providers/Microsoft.PolicyInsights/policyMetadata/ISO_IEC_27001_2022_A.8.20',
  evaluationState: 'nonCompliant',
  counts: stateCounts,
  policyCount: 1,
  affectedResourceCount: 1,
  policyDefinitionReferenceIds: [policyDefinitionReferenceId],
};

const controlMetadata: RegulatoryControlMetadataResponse = {
  policyMetadataId: controlSummary.policyMetadataId!,
  name: 'ISO_IEC_27001_2022_A.8.20',
  displayName: 'Network security',
  domain: 'Technological controls',
  responsibility: 'customer',
  description: 'Networks and network devices should be secured, managed, and controlled.',
  requirements: 'Define and operate controls that protect information in systems and applications.',
  additionalContentUrl: 'https://www.iso.org/standard/27001',
};

const invalidControlMetadataResponsibility: RegulatoryControlMetadataResponse = {
  ...controlMetadata,
  // @ts-expect-error Metadata responsibility uses the normalized closed vocabulary.
  responsibility: 'organisation',
};

const metadataWithInternalCachePath: RegulatoryControlMetadataResponse = {
  ...controlMetadata,
  // @ts-expect-error Internal cache locations are not part of the public metadata response.
  cachePath: 'policies/initiatives/iso/controls/a.8.20.json.gz',
};

const standardSummary: RegulatoryStandardSummary = {
  standardKey: catalogEntry.standardKey,
  standardFamilyKey: catalogEntry.standardFamilyKey,
  definitionId,
  definitionName: catalogEntry.definitionName,
  displayName: catalogEntry.displayName,
  version: catalogEntry.version,
  assignmentKey,
  assignmentId,
  assignmentName: 'iso-27001',
  assignmentDisplayName: 'ISO/IEC 27001 production',
  assignmentScope: '/providers/microsoft.management/managementgroups/root',
  effectiveScope: `/subscriptions/${subscriptionId}`,
  inherited: true,
  assignmentCreatedAt: '2026-07-01T00:00:00.000Z',
  evaluationState: 'nonCompliant',
  evaluationGeneratedAt: generatedAt,
  counts: stateCounts,
  evaluatedResourceCompliancePercentage: 91.67,
  percentageNumerator: 11,
  percentageDenominator: 12,
  controlCount: 1,
  controls: [controlSummary],
};

const directStandardSummary: RegulatoryStandardSummary = {
  ...standardSummary,
  assignmentScope: `/subscriptions/${subscriptionId}`,
  inherited: false,
};

const activeExemption: RegulatoryExemptionSummary = {
  exemptionKey: 'exemption-1',
  id: `${resourceId}/providers/microsoft.authorization/policyexemptions/exemption-1`,
  name: 'exemption-1',
  displayName: 'Temporary public access waiver',
  description: 'Public access is temporarily accepted while the private endpoint migration completes.',
  category: 'Waiver',
  scope: resourceId,
  policyAssignmentId: assignmentId,
  policyDefinitionReferenceIds: [policyDefinitionReferenceId],
  lifecycleState: 'active',
  expiresOn: '2026-09-01T00:00:00.000Z',
  daysUntilExpiry: 34,
  metadata: {
    requestedBy: 'Platform team',
    approvedBy: 'Security',
    approvedOn: '2026-07-28T00:00:00.000Z',
    ticketRef: 'SEC-123',
  },
  createdAt: '2026-07-28T00:00:00.000Z',
};

const report: RegulatoryComplianceReport = {
  schemaVersion: REGULATORY_COMPLIANCE_REPORT_SCHEMA_VERSION,
  generatedAt,
  tenantId: 'tenant-1',
  subscriptionId,
  coverage,
  catalog: [catalogEntry],
  standards: [standardSummary],
  exemptions: [activeExemption],
  sourceMetadata: {
    queryFiles: ['graphqueries/policyresources-regulatory-compliance.json', 'graphqueries/policyresources-regulatory-metadata.json'],
  },
};

const successfulEmptyReport: RegulatoryComplianceReport = {
  ...report,
  catalog: [],
  standards: [],
  exemptions: [],
};

const policySummary: RegulatoryPolicyEvaluationSummary = {
  policyDefinitionId,
  policyDefinitionReferenceId,
  displayName: 'Storage accounts should disable public network access',
  effect: 'Audit',
  evaluationState: 'nonCompliant',
  counts: stateCounts,
  affectedResourceCount: 1,
};

const resourceEvaluation: RegulatoryResourceEvaluation = {
  resourceId,
  resourceName: 'storage1',
  resourceType: 'microsoft.storage/storageaccounts',
  resourceGroupName: 'production',
  location: 'australiaeast',
  evaluationState: 'nonCompliant',
  evaluatedAt: generatedAt,
  policyAssignmentId: assignmentId,
  policyDefinitionId,
  policyDefinitionReferenceId,
};

const controlDetail: RegulatoryControlDetail = {
  ...controlSummary,
  description: 'Protect information in networks and supporting information processing facilities.',
  requirements: 'Network security mechanisms should be established and monitored.',
  additionalContentUrl: 'https://learn.microsoft.com/azure/governance/policy/concepts/regulatory-compliance',
  policies: [policySummary],
  resources: [resourceEvaluation],
};

const assignmentDetail: RegulatoryComplianceAssignmentDetail = {
  schemaVersion: REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_SCHEMA_VERSION,
  generatedAt,
  tenantId: 'tenant-1',
  subscriptionId,
  assignmentKey,
  standard: standardSummary,
  coverage,
  controls: [controlDetail],
  exemptions: [activeExemption],
  sourceMetadata: report.sourceMetadata,
};

const resourceEvaluationPage: RegulatoryResourceEvaluationPage = {
  generatedAt,
  subscriptionId,
  assignmentKey,
  controlKey: controlDetail.controlKey,
  page: 1,
  pageSize: 25,
  totalItems: 1,
  totalPages: 1,
  resources: [resourceEvaluation],
};

const expectationRecord: ComplianceExpectationRecord = {
  expectationId: 'azure|subscription|sub-1|iso-27001',
  companyId: 'company-1',
  provider: 'azure',
  scopeType: 'subscription',
  scopeId: subscriptionId,
  standardFamilyKey: 'iso-27001',
  preferredDefinitionId: definitionId,
  expectation: 'expected',
  reason: 'Production environment is in the ISO 27001 ISMS scope.',
  source: 'manual',
  createdAt: generatedAt,
  createdBy: 'user-1',
  updatedAt: generatedAt,
  updatedBy: 'user-1',
};

const effectiveExpectation: EffectiveComplianceExpectation = {
  standardFamilyKey: 'iso-27001',
  preferredDefinitionId: definitionId,
  expectation: 'expected',
  source: 'manual',
  sourceScopeType: 'subscription',
  sourceScopeId: subscriptionId,
  inherited: false,
  reason: expectationRecord.reason,
};

const surveyExpectation: EffectiveComplianceExpectation = {
  standardFamilyKey: 'soc-2',
  expectation: 'expected',
  source: 'survey',
  sourceScopeType: 'company',
  sourceScopeId: 'company-1',
  inherited: true,
};

const explicitExpectationOverride: EffectiveComplianceExpectation = {
  ...surveyExpectation,
  expectation: 'notExpected',
  source: 'manual',
  sourceScopeType: 'subscription',
  sourceScopeId: subscriptionId,
  inherited: false,
  reason: 'This subscription is outside the SOC 2 system boundary.',
};

const catalogRecommendation: RegulatoryStandardRecommendation = {
  standard: catalogEntry,
  reason: 'popular',
};

const assignmentGap: RegulatoryComplianceAssignmentGap = {
  expectation: effectiveExpectation,
  reason: 'noEffectiveAssignment',
  matchingDefinitionIds: [definitionId],
};

const writeCapability: RegulatoryComplianceWriteCapability = {
  state: 'partial',
  checkedAt: generatedAt,
  targetScope: {
    state: 'available',
    scope: `/subscriptions/${subscriptionId}`,
    requiredActions: ['Microsoft.Authorization/policyExemptions/write'],
    missingActions: [],
  },
  assignmentScope: {
    state: 'unavailable',
    scope: '/providers/microsoft.management/managementgroups/root',
    requiredActions: ['Microsoft.Authorization/policyAssignments/exempt/action'],
    missingActions: ['Microsoft.Authorization/policyAssignments/exempt/action'],
    message: 'Grant assignment-scope exemption access at the inherited management group.',
  },
  setupUrl: '/company/company-1/settings/cloud-accounts',
};

const view: RegulatoryComplianceView = {
  report,
  expectations: [effectiveExpectation, surveyExpectation],
  recommendations: [catalogRecommendation],
  assignmentGaps: [assignmentGap],
  writeCapability,
};

const upsertExpectationRequest: UpsertComplianceExpectationRequest = {
  provider: 'azure',
  scopeType: 'subscription',
  scopeId: subscriptionId,
  standardFamilyKey: 'iso-27001',
  preferredDefinitionId: definitionId,
  expectation: 'expected',
  reason: expectationRecord.reason,
};

const expectationResponse: ComplianceExpectationResponse = {
  explicit: expectationRecord,
  effective: effectiveExpectation,
};

const createExemptionRequest: CreatePolicyExemptionRequest = {
  requestId: 'request-1',
  targetScope: resourceId,
  policyAssignmentId: assignmentId,
  policyDefinitionReferenceIds: [policyDefinitionReferenceId],
  category: 'Waiver',
  displayName: 'Temporary public access waiver',
  description: 'Public access is temporarily accepted while the private endpoint migration completes.',
  expiresOn: '2026-09-01T00:00:00.000Z',
  metadata: {
    ticketRef: 'SEC-123',
    requestedBy: 'Platform team',
    approvedBy: 'Security',
  },
};

const queuedResponse: CreatePolicyExemptionQueuedResponse = {
  eventId: 'policy-exemption-event-1',
  requestId: createExemptionRequest.requestId,
  state: 'queued',
};

const noteTargetType: RegulatoryComplianceNoteTargetType = 'policy';
const regulatoryNote: RegulatoryComplianceNote = {
  noteId: 'note-1',
  subscriptionId,
  assignmentKey,
  targetType: noteTargetType,
  targetKey: policyDefinitionReferenceId,
  targetLabel: 'Storage accounts should prevent public access',
  content: 'Confirm the migration owner and planned completion date.',
  createdAt: generatedAt,
  createdByUserId: 'user-1',
  createdByDisplayName: 'Alex Example',
};
const regulatoryNoteList: RegulatoryComplianceNoteListResponse = { notes: [regulatoryNote] };
const createRegulatoryNoteRequest: CreateRegulatoryComplianceNoteRequest = {
  targetType: 'control',
  targetKey: controlDetail.controlKey,
  content: 'Validate the compensating control with the security team.',
};

// @ts-expect-error Azure Policy resources are not regulatory note targets in this iteration.
const invalidRegulatoryNoteTarget: RegulatoryComplianceNoteTargetType = 'resource';

const impersonatedRegulatoryNoteRequest: CreateRegulatoryComplianceNoteRequest = {
  ...createRegulatoryNoteRequest,
  // @ts-expect-error Actor identity is server-owned and cannot be supplied by a create request.
  createdByUserId: 'another-user',
};

// @ts-expect-error Azure Policy has no normalized "passed" evaluation state.
const invalidEvaluationState: AzurePolicyEvaluationState = 'passed';

const { assignmentKey: _removedAssignmentKey, ...standardWithoutAssignmentKey } = standardSummary;
// @ts-expect-error RegulatoryStandardSummary.assignmentKey is required.
const missingAssignmentKey: RegulatoryStandardSummary = standardWithoutAssignmentKey;

const { policyDefinitionReferenceIds: _removedReferenceIds, ...requestWithoutReferenceIds } = createExemptionRequest;
// @ts-expect-error CreatePolicyExemptionRequest.policyDefinitionReferenceIds is required.
const missingReferenceIds: CreatePolicyExemptionRequest = requestWithoutReferenceIds;

// @ts-expect-error EffectiveComplianceExpectation.source cannot be inferred from free text.
const invalidExpectationSource: EffectiveComplianceExpectation = { ...effectiveExpectation, source: 'parsedText' };

void documentedEvaluationStates;
void reportSchemaVersion;
void assignmentDetailSchemaVersion;
void policyExemptionCommandSchemaVersion;
void portalFile;
void assignmentDetailDirectory;
void partialCoverage;
void directStandardSummary;
void controlMetadata;
void invalidControlMetadataResponsibility;
void metadataWithInternalCachePath;
void successfulEmptyReport;
void explicitExpectationOverride;
void assignmentDetail;
void resourceEvaluationPage;
void view;
void upsertExpectationRequest;
void expectationResponse;
void queuedResponse;
void regulatoryNoteList;
void createRegulatoryNoteRequest;
void invalidRegulatoryNoteTarget;
void impersonatedRegulatoryNoteRequest;
void invalidEvaluationState;
void missingAssignmentKey;
void missingReferenceIds;
void invalidExpectationSource;
void POLICY_EXEMPTION_COMMAND_SCHEMA_VERSION;
void REGULATORY_COMPLIANCE_PORTAL_FILE;
void REGULATORY_COMPLIANCE_ASSIGNMENT_DETAIL_DIRECTORY;
