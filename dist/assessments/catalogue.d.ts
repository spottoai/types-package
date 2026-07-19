import type { CompanyNoteContextCategory } from '../company/companyNotes';
import type { AssessmentExportFormat, AssessmentProviderName, AssessmentReleaseStage, AssessmentType } from './status';
export declare const ARCHITECTURE_ASSESSMENT_REQUIRED_CONTEXT_CATEGORIES: readonly ["company-profile", "architecture", "operations", "reliability", "roadmap"];
export declare const ARCHITECTURE_ASSESSMENT_OPTIONAL_CONTEXT_CATEGORIES: readonly ["security", "performance", "finops"];
export interface AssessmentCatalogueEntry {
    id: AssessmentType;
    name: string;
    description: string;
    requiredContextCategories: CompanyNoteContextCategory[];
    optionalContextCategories: CompanyNoteContextCategory[];
    supportedProviderNames: AssessmentProviderName[];
    outputFormats: AssessmentExportFormat[];
    releaseStage: AssessmentReleaseStage;
}
export interface AssessmentCatalogueResponse {
    assessments: AssessmentCatalogueEntry[];
}
export interface AssessmentContextCategoryReadiness {
    category: CompanyNoteContextCategory;
    required: boolean;
    saved: boolean;
    stale?: boolean;
    title?: string;
    noteDate?: string;
    updatedAt?: string;
    missingQuestionIds?: string[];
}
export interface AssessmentEvidenceReadiness {
    sourceType: string;
    ready: boolean;
    subscriptionId?: string;
    lastUpdatedAt?: string;
    gapCode?: string;
    message?: string;
}
export interface AssessmentReadinessRequest {
    assessmentType: AssessmentType;
    providerName: AssessmentProviderName;
    cloudAccountIds: string[];
    subscriptionIds: string[];
}
export interface AssessmentReadinessResponse {
    assessmentType: AssessmentType;
    providerName: AssessmentProviderName;
    companyId: string;
    cloudAccountIds: string[];
    subscriptionIds: string[];
    ready: boolean;
    context: AssessmentContextCategoryReadiness[];
    evidence: AssessmentEvidenceReadiness[];
    checkedAt: string;
}
//# sourceMappingURL=catalogue.d.ts.map