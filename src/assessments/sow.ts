import type { AssessmentTraceabilityReference } from './common';

export type AssessmentSelectedActionItemIds = [string, ...string[]];

export interface CreateAssessmentSowHandoffRequest {
  actionItemIds: AssessmentSelectedActionItemIds;
  title?: string;
}

export interface AssessmentSowDraftActionItem extends AssessmentTraceabilityReference {
  actionItemId: string;
  title: string;
  description: string;
  benefit: string;
  effortHours?: number;
  dependencies?: string[];
  assumptions?: string[];
  suggestedDeliveryPackage?: string;
}

export interface AssessmentSowDraftSource {
  source: 'assessment';
  assessmentRunId: string;
  companyId: string;
  title: string;
  actionItems: AssessmentSowDraftActionItem[];
}

export interface CreateAssessmentSowHandoffResponse {
  assessmentRunId: string;
  actionItemIds: string[];
  draftId?: string;
  draftSource: AssessmentSowDraftSource;
}
