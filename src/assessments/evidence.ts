import type { CompanyNoteContextCategory, CompanyNoteContextQuestionId, CompanyNoteContextTemplateKey } from '../company/companyNotes';
import type { AssessmentEvidenceConfidence, AssessmentEvidenceSourceType } from './status';

export interface AssessmentContextAnswerEvidence {
  evidenceId: string;
  sourceType: 'company_context_note';
  category: CompanyNoteContextCategory;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  questionId: CompanyNoteContextQuestionId;
  label: string;
  plainText: string;
  noteDate: string;
  updatedAt?: string;
  saved: boolean;
  confidence: 'customer_supplied' | 'gap';
}

export interface AssessmentCloudEvidence {
  evidenceId: string;
  sourceType: Exclude<AssessmentEvidenceSourceType, 'company_context_note' | 'ai_inference' | 'evidence_gap'>;
  sourcePath?: string;
  sourceField?: string;
  subscriptionId?: string;
  resourceId?: string;
  title: string;
  summary: string;
  observedAt?: string;
  lastModifiedAt?: string;
  confidence: Exclude<AssessmentEvidenceConfidence, 'customer_supplied'>;
  value?: unknown;
}

export interface AssessmentAiInferenceEvidence {
  evidenceId: string;
  sourceType: 'ai_inference';
  title: string;
  summary: string;
  derivedFromEvidenceIds: string[];
  generatedAt: string;
  confidence: 'inferred';
}

export type AssessmentEvidence = AssessmentContextAnswerEvidence | AssessmentCloudEvidence | AssessmentAiInferenceEvidence;

export interface AssessmentEvidenceGap {
  gapId: string;
  sourceType: 'evidence_gap';
  category?: CompanyNoteContextCategory;
  subscriptionId?: string;
  title: string;
  description: string;
  required: boolean;
  confidence: 'gap';
  relatedEvidenceIds?: string[];
}

export interface AssessmentSourceCoverage {
  sourceType: AssessmentEvidenceSourceType;
  sourcePath?: string;
  subscriptionId?: string;
  available: boolean;
  itemCount?: number;
  lastModifiedAt?: string;
  gapIds?: string[];
}

export interface AssessmentContextPackCategory {
  category: CompanyNoteContextCategory;
  saved: boolean;
  title: string;
  templateKey: CompanyNoteContextTemplateKey;
  templateVersion: number;
  noteDate: string;
  updatedAt?: string;
  answers: AssessmentContextAnswerEvidence[];
}

export interface AssessmentContextPack {
  schemaVersion: 1;
  assessmentRunId: string;
  companyId: string;
  generatedAt: string;
  categories: AssessmentContextPackCategory[];
}
