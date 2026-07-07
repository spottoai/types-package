import type { AssessmentScope, AssessmentStorageReference } from './common';
import type { AssessmentProviderName, AssessmentType } from './status';
export declare const ASSESSMENT_QUEUE_ENTITY: "assessment";
export declare const ASSESSMENT_GENERATE_ACTION: "generate-assessment";
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
//# sourceMappingURL=queue.d.ts.map