import type { AssessmentFailureMetadata, AssessmentScope, AssessmentStorageReference } from './common';
import type { AssessmentProviderName, AssessmentRunStatus, AssessmentType } from './status';

export interface AssessmentRunTimestamps {
  createdAt: string;
  queuedAt?: string;
  startedAt?: string;
  generatedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  failedAt?: string;
}

export interface AssessmentRunSummary extends AssessmentRunTimestamps {
  assessmentRunId: string;
  companyId: string;
  assessmentType: AssessmentType;
  providerName: AssessmentProviderName;
  scope: AssessmentScope;
  status: AssessmentRunStatus;
  createdByUserId?: string;
  reviewedByUserId?: string;
  approvedByUserId?: string;
  sourceVersion?: string;
  artifactPath?: string;
  documentPath?: string;
  failure?: AssessmentFailureMetadata;
}

export interface AssessmentRun extends AssessmentRunSummary {
  schemaVersion: 1;
  contextPackReference?: AssessmentStorageReference;
  evidencePackReference?: AssessmentStorageReference;
  artifactReference?: AssessmentStorageReference;
  reviewReference?: AssessmentStorageReference;
  exportIndexReference?: AssessmentStorageReference;
  generationAttemptId?: string;
  correlationId?: string;
}

export interface CreateAssessmentRunRequest {
  assessmentType: AssessmentType;
  providerName: AssessmentProviderName;
  cloudAccountIds: string[];
  subscriptionIds: string[];
}

export interface CreateAssessmentRunResponse {
  assessmentRun: AssessmentRun;
  queued: true;
}

export interface ListAssessmentRunsQuery {
  status?: AssessmentRunStatus;
  assessmentType?: AssessmentType;
  records?: number;
  continuationToken?: string;
}

export interface ListAssessmentRunsResponse {
  runs: AssessmentRunSummary[];
  continuationToken?: string;
}

export interface AssessmentRunIndex {
  version: 1;
  runs: AssessmentRunSummary[];
}
