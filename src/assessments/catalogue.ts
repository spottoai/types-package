import type { CompanyNoteContextCategory } from '../company/companyNotes';
import type { AssessmentExportFormat, AssessmentProviderName, AssessmentReleaseStage, AssessmentType } from './status';

export const ARCHITECTURE_ASSESSMENT_REQUIRED_CONTEXT_CATEGORIES = [
  'company-profile',
  'architecture',
  'operations',
  'reliability',
  'roadmap',
] as const satisfies readonly CompanyNoteContextCategory[];

export const ARCHITECTURE_ASSESSMENT_OPTIONAL_CONTEXT_CATEGORIES = [
  'security',
  'performance',
  'finops',
] as const satisfies readonly CompanyNoteContextCategory[];

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
