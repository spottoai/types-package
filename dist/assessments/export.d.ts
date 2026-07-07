import type { AssessmentStorageReference } from './common';
import type { AssessmentExportFormat, AssessmentExportStatus } from './status';
export interface ExportAssessmentRequest {
    format: AssessmentExportFormat;
    templateId?: string;
    fileName?: string;
}
export interface AssessmentExportDocument {
    documentId: string;
    assessmentRunId: string;
    format: AssessmentExportFormat;
    status: AssessmentExportStatus;
    fileName: string;
    createdAt: string;
    createdByUserId?: string;
    documentReference?: AssessmentStorageReference;
    downloadUrl?: string;
    failureMessage?: string;
}
export interface ExportAssessmentResponse {
    document: AssessmentExportDocument;
}
export interface AssessmentExportIndex {
    version: 1;
    documents: AssessmentExportDocument[];
}
//# sourceMappingURL=export.d.ts.map