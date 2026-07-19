import type { AssessmentScope, AssessmentStorageReference } from './common';
import type { AssessmentProviderName, AssessmentType } from './status';

export const ASSESSMENT_QUEUE_ENTITY = 'assessment' as const;
export const ASSESSMENT_GENERATE_ACTION = 'generate-assessment' as const;

export type AssessmentQueueEntity = typeof ASSESSMENT_QUEUE_ENTITY;
export type AssessmentGenerateAction = typeof ASSESSMENT_GENERATE_ACTION;

export interface AssessmentGenerateQueueMessage extends AssessmentScope {
  entity: AssessmentQueueEntity;
  action: AssessmentGenerateAction;
  assessmentRunId: string;
  assessmentType: AssessmentType;
  companyId: string;
  providerName: AssessmentProviderName;
  requestedByUserId?: string;
  correlationId: string;
  contextPackReference?: AssessmentStorageReference;
  sourceVersion?: string;
  generationAttemptId?: string;
}
