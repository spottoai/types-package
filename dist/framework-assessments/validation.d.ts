import type { AssessmentNativeScope, AssessmentPageReference, FrameworkCatalogueDocument, FrameworkCatalogueIndexDocument, FrameworkCatalogueReference, FrameworkFinding, FrameworkControlAssessment, FrameworkAssessmentSource, FrameworkAssessmentDocument, FrameworkAssessmentSummaryDocument, FrameworkFindingPageDocument, FrameworkFindingStatusCounts } from './contracts';
export declare const requireFrameworkId: (value: unknown) => string;
export declare const requireSourceVersion: (value: unknown) => string;
export declare const requireAssessmentHash: (value: unknown) => string;
export declare const parseAssessmentNativeScope: (value: unknown) => AssessmentNativeScope;
export declare const parseAssessmentPageReference: (value: unknown) => AssessmentPageReference;
export declare const parseFrameworkCatalogueReference: (value: unknown) => FrameworkCatalogueReference;
export declare const parseFrameworkAssessmentSource: (value: unknown) => FrameworkAssessmentSource;
export declare const parseFrameworkFinding: (value: unknown) => FrameworkFinding;
export declare const parseFrameworkControlAssessment: (value: unknown) => FrameworkControlAssessment;
export declare const parseFrameworkFindingStatusCounts: (value: unknown) => FrameworkFindingStatusCounts;
export declare const parseFrameworkCatalogueDocument: (value: unknown) => FrameworkCatalogueDocument;
export declare const parseFrameworkCatalogueIndexDocument: (value: unknown) => FrameworkCatalogueIndexDocument;
export declare const parseFrameworkAssessmentDocument: (value: unknown) => FrameworkAssessmentDocument;
export declare const parseFrameworkAssessmentSummaryDocument: (value: unknown) => FrameworkAssessmentSummaryDocument;
export declare const parseFrameworkFindingPageDocument: (value: unknown) => FrameworkFindingPageDocument;
//# sourceMappingURL=validation.d.ts.map