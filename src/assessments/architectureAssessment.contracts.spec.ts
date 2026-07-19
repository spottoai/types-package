import type {
  ArchitectureAssessmentArtifact,
  AssessmentCatalogueEntry,
  AssessmentExportFormat,
  AssessmentGenerateQueueMessage,
  AssessmentReadinessRequest,
  AssessmentReviewOverlay,
  AssessmentRun,
  AssessmentRunStatus,
  AssessmentSowDraftSource,
  AssessmentType,
  CreateAssessmentRunRequest,
  CreateAssessmentSowHandoffRequest,
  ExportAssessmentRequest,
  ReportingTemplateReportType,
} from '../index';
import {
  ARCHITECTURE_ASSESSMENT_OPTIONAL_CONTEXT_CATEGORIES,
  ARCHITECTURE_ASSESSMENT_REQUIRED_CONTEXT_CATEGORIES,
  ASSESSMENT_GENERATE_ACTION,
  ASSESSMENT_QUEUE_ENTITY,
} from '../index';

const assessmentCatalogueEntry: AssessmentCatalogueEntry = {
  id: 'architecture',
  name: 'Architecture Assessment',
  description: 'Evidence-backed architecture assessment for selected Azure subscriptions.',
  requiredContextCategories: [...ARCHITECTURE_ASSESSMENT_REQUIRED_CONTEXT_CATEGORIES],
  optionalContextCategories: [...ARCHITECTURE_ASSESSMENT_OPTIONAL_CONTEXT_CATEGORIES],
  supportedProviderNames: ['azure'],
  outputFormats: ['docx'],
  releaseStage: 'preview',
};

const createRunRequest: CreateAssessmentRunRequest = {
  assessmentType: 'architecture',
  providerName: 'azure',
  cloudAccountIds: ['cloud-1'],
  subscriptionIds: ['sub-1'],
};

const readinessRequest: AssessmentReadinessRequest = {
  ...createRunRequest,
};

const assessmentRun: AssessmentRun = {
  schemaVersion: 1,
  assessmentRunId: 'asmt-1',
  companyId: 'company-1',
  assessmentType: 'architecture',
  providerName: 'azure',
  scope: {
    cloudAccountIds: ['cloud-1'],
    subscriptionIds: ['sub-1'],
    tenantId: 'tenant-1',
  },
  status: 'needs_review',
  createdAt: '2026-07-05T00:00:00.000Z',
  createdByUserId: 'user-1',
  queuedAt: '2026-07-05T00:01:00.000Z',
  startedAt: '2026-07-05T00:02:00.000Z',
  generatedAt: '2026-07-05T00:10:00.000Z',
  contextPackReference: {
    storageArea: 'accounts-data',
    path: 'companies/company-1/assessments/runs/asmt-1/context-pack.json',
    etag: 'etag-context',
  },
  evidencePackReference: {
    storageArea: 'accounts-data',
    path: 'companies/company-1/assessments/runs/asmt-1/evidence-pack.json',
  },
  artifactReference: {
    storageArea: 'accounts-data',
    path: 'companies/company-1/assessments/runs/asmt-1/artifact.json',
  },
  correlationId: 'company-1:asmt-1:generate-assessment',
};

const queueMessage: AssessmentGenerateQueueMessage = {
  entity: ASSESSMENT_QUEUE_ENTITY,
  action: ASSESSMENT_GENERATE_ACTION,
  assessmentRunId: assessmentRun.assessmentRunId,
  assessmentType: assessmentRun.assessmentType,
  companyId: assessmentRun.companyId,
  providerName: assessmentRun.providerName,
  cloudAccountIds: assessmentRun.scope.cloudAccountIds,
  subscriptionIds: assessmentRun.scope.subscriptionIds,
  tenantId: assessmentRun.scope.tenantId,
  requestedByUserId: assessmentRun.createdByUserId,
  correlationId: assessmentRun.correlationId ?? 'company-1:asmt-1:generate-assessment',
  contextPackReference: assessmentRun.contextPackReference,
};

const architectureArtifact: ArchitectureAssessmentArtifact = {
  schemaVersion: 1,
  assessmentRunId: assessmentRun.assessmentRunId,
  companyId: assessmentRun.companyId,
  assessmentType: 'architecture',
  providerName: 'azure',
  scope: assessmentRun.scope,
  contextPack: {
    schemaVersion: 1,
    assessmentRunId: assessmentRun.assessmentRunId,
    companyId: assessmentRun.companyId,
    generatedAt: '2026-07-05T00:03:00.000Z',
    categories: [
      {
        category: 'architecture',
        saved: true,
        title: 'Architecture',
        templateKey: 'architecture-v1',
        templateVersion: 1,
        noteDate: '2026-07-05',
        updatedAt: '2026-07-05T00:00:00.000Z',
        answers: [
          {
            evidenceId: 'ctx-architecture-overview',
            sourceType: 'company_context_note',
            category: 'architecture',
            templateKey: 'architecture-v1',
            templateVersion: 1,
            questionId: 'architecture.architecture-overview',
            label: 'Architecture overview',
            plainText: 'The customer operates a hub-and-spoke Azure landing zone with shared connectivity.',
            noteDate: '2026-07-05',
            updatedAt: '2026-07-05T00:00:00.000Z',
            saved: true,
            confidence: 'customer_supplied',
          },
        ],
      },
    ],
  },
  sourceCoverage: [
    {
      sourceType: 'subscription_report_evidence_pack',
      sourcePath: 'azure-portal/subscriptions/sub-1/reporting/report-evidence-pack.json',
      subscriptionId: 'sub-1',
      available: true,
      itemCount: 12,
      lastModifiedAt: '2026-07-05T00:00:00.000Z',
    },
  ],
  evidence: [
    {
      evidenceId: 'ctx-architecture-overview',
      sourceType: 'company_context_note',
      category: 'architecture',
      templateKey: 'architecture-v1',
      templateVersion: 1,
      questionId: 'architecture.architecture-overview',
      label: 'Architecture overview',
      plainText: 'The customer operates a hub-and-spoke Azure landing zone with shared connectivity.',
      noteDate: '2026-07-05',
      updatedAt: '2026-07-05T00:00:00.000Z',
      saved: true,
      confidence: 'customer_supplied',
    },
    {
      evidenceId: 'cloud-resource-summary',
      sourceType: 'subscription_report_evidence_pack',
      sourcePath: 'azure-portal/subscriptions/sub-1/reporting/report-evidence-pack.json',
      subscriptionId: 'sub-1',
      title: 'Resource summary',
      summary: 'The subscription has production compute, data, and network resources.',
      observedAt: '2026-07-05T00:00:00.000Z',
      confidence: 'confirmed',
    },
  ],
  currentState: {
    summary: 'Production Azure estate with shared networking and several modernization opportunities.',
    scopeSummary: 'One Azure cloud account and one selected subscription.',
    topologySummary: 'Hub-and-spoke landing zone pattern.',
  },
  findings: [
    {
      findingId: 'finding-network-dependency',
      pillar: 'architecture',
      title: 'Shared connectivity is a critical dependency',
      summary: 'Multiple workloads depend on shared network services.',
      rationale: 'Customer context and cloud evidence both reference shared connectivity.',
      priority: 'high',
      evidenceIds: ['ctx-architecture-overview', 'cloud-resource-summary'],
      affectedResourceIds: ['/subscriptions/sub-1/resourceGroups/rg-network'],
    },
  ],
  recommendations: [
    {
      recommendationId: 'rec-document-connectivity',
      pillar: 'architecture',
      title: 'Document and validate shared connectivity dependencies',
      summary: 'Create a dependency map and failure-mode review for shared networking.',
      priority: 'high',
      effort: 'medium',
      impact: 'high',
      status: 'new',
      evidenceIds: ['ctx-architecture-overview'],
      findingIds: ['finding-network-dependency'],
    },
  ],
  actionItems: [
    {
      actionItemId: 'action-connectivity-review',
      title: 'Run a connectivity dependency workshop',
      description: 'Review shared network dependencies with application and platform owners.',
      priority: 'high',
      effort: 'medium',
      effortHours: 12,
      benefit: 'Reduces outage blast-radius uncertainty and creates follow-up design work.',
      dependencies: ['Application owner availability'],
      assumptions: ['Current network topology evidence is complete for the selected subscription.'],
      suggestedDeliveryPackage: 'Architecture dependency review',
      sequence: 1,
      evidenceIds: ['ctx-architecture-overview'],
      findingIds: ['finding-network-dependency'],
      recommendationIds: ['rec-document-connectivity'],
    },
  ],
  narrative: {
    executiveSummary: 'The selected Azure scope is suitable for an architecture review focused on shared dependencies.',
    scopeAndCoverage: 'Assessment covers one selected Azure subscription and available customer context.',
    currentState: 'The current state uses shared connectivity and production resource groups.',
    targetStateThemes: 'Improve dependency documentation and operational confidence.',
    openQuestions: ['Confirm business criticality for workloads in the selected subscription.'],
  },
  gaps: [
    {
      gapId: 'gap-reliability-context',
      sourceType: 'evidence_gap',
      category: 'reliability',
      title: 'Reliability objectives missing',
      description: 'RTO/RPO and service criticality were not recorded in Customer Context.',
      required: true,
      confidence: 'gap',
    },
  ],
  generation: {
    generatedAt: '2026-07-05T00:10:00.000Z',
    generatedBy: 'cloud-engine',
    correlationId: 'company-1:asmt-1:generate-assessment',
    sourceVersion: '2026-07-05.architecture-assessment-v1',
    narrativeOwner: 'cloud-engine',
    narrativeModel: 'assessment-model',
    promptVersion: 'architecture-assessment-v1',
  },
};

const reviewOverlay: AssessmentReviewOverlay = {
  assessmentRunId: assessmentRun.assessmentRunId,
  revision: 1,
  updatedAt: '2026-07-05T01:00:00.000Z',
  updatedByUserId: 'reviewer-1',
  narrativeOverrides: {
    executiveSummary: 'Reviewed architecture summary for customer presentation.',
  },
  actionItemOverrides: {
    'action-connectivity-review': {
      effortHours: 16,
      benefit: 'Improves shared-services resilience and creates a prioritized remediation roadmap.',
    },
  },
  hiddenFindingIds: [],
  hiddenRecommendationIds: [],
  hiddenActionItemIds: [],
};

const exportRequest: ExportAssessmentRequest = {
  format: 'docx',
  fileName: 'architecture-assessment.docx',
};

const architectureAssessmentReportType: ReportingTemplateReportType = 'architecture-assessment';

const sowHandoffRequest: CreateAssessmentSowHandoffRequest = {
  actionItemIds: ['action-connectivity-review'],
  title: 'Architecture Assessment Follow-up',
};

const sowDraftSource: AssessmentSowDraftSource = {
  source: 'assessment',
  assessmentRunId: assessmentRun.assessmentRunId,
  companyId: assessmentRun.companyId,
  title: 'Architecture Assessment Follow-up',
  actionItems: [
    {
      actionItemId: 'action-connectivity-review',
      title: 'Run a connectivity dependency workshop',
      description: 'Review shared network dependencies with application and platform owners.',
      benefit: 'Reduces outage blast-radius uncertainty and creates follow-up design work.',
      effortHours: 12,
      evidenceIds: ['ctx-architecture-overview'],
      findingIds: ['finding-network-dependency'],
      recommendationIds: ['rec-document-connectivity'],
    },
  ],
};

// @ts-expect-error v1 supports Architecture Assessment only.
const invalidAssessmentType: AssessmentType = 'security';

// @ts-expect-error invalid run status must not compile.
const invalidRunStatus: AssessmentRunStatus = 'completed';

// @ts-expect-error v1 supports DOCX export only.
const invalidExportFormat: AssessmentExportFormat = 'pdf';

// @ts-expect-error queue messages require the action discriminator.
const missingQueueAction: AssessmentGenerateQueueMessage = {
  entity: ASSESSMENT_QUEUE_ENTITY,
  assessmentRunId: assessmentRun.assessmentRunId,
  assessmentType: assessmentRun.assessmentType,
  companyId: assessmentRun.companyId,
  providerName: assessmentRun.providerName,
  cloudAccountIds: assessmentRun.scope.cloudAccountIds,
  subscriptionIds: assessmentRun.scope.subscriptionIds,
  correlationId: 'company-1:asmt-1:generate-assessment',
};

const queueMessageWithForbiddenEvidence: AssessmentGenerateQueueMessage = {
  ...queueMessage,
  // @ts-expect-error queue messages must not carry full evidence arrays.
  evidence: architectureArtifact.evidence,
};

const invalidSowHandoffRequest: CreateAssessmentSowHandoffRequest = {
  // @ts-expect-error selected action item IDs must be non-empty.
  actionItemIds: [],
};

void assessmentCatalogueEntry;
void readinessRequest;
void queueMessage;
void architectureArtifact;
void reviewOverlay;
void exportRequest;
void architectureAssessmentReportType;
void sowHandoffRequest;
void sowDraftSource;
void invalidAssessmentType;
void invalidRunStatus;
void invalidExportFormat;
void missingQueueAction;
void queueMessageWithForbiddenEvidence;
void invalidSowHandoffRequest;
