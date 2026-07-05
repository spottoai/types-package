export const ARCHITECTURE_ASSESSMENT_TYPE = 'architecture' as const;
export const ASSESSMENT_TYPES = [ARCHITECTURE_ASSESSMENT_TYPE] as const;
export type ArchitectureAssessmentType = typeof ARCHITECTURE_ASSESSMENT_TYPE;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_PROVIDER_NAMES = ['azure'] as const;
export type AssessmentProviderName = (typeof ASSESSMENT_PROVIDER_NAMES)[number];

export const ASSESSMENT_RELEASE_STAGES = ['preview', 'ga'] as const;
export type AssessmentReleaseStage = (typeof ASSESSMENT_RELEASE_STAGES)[number];

export const ASSESSMENT_RUN_STATUSES = ['draft', 'queued', 'running', 'needs_review', 'approved', 'published', 'failed'] as const;
export type AssessmentRunStatus = (typeof ASSESSMENT_RUN_STATUSES)[number];

export const ASSESSMENT_EXPORT_FORMATS = ['docx'] as const;
export type AssessmentExportFormat = (typeof ASSESSMENT_EXPORT_FORMATS)[number];

export const ASSESSMENT_EXPORT_STATUSES = ['requested', 'completed', 'failed'] as const;
export type AssessmentExportStatus = (typeof ASSESSMENT_EXPORT_STATUSES)[number];

export const ASSESSMENT_EVIDENCE_SOURCE_TYPES = [
  'company_context_note',
  'subscription_report_evidence_pack',
  'portal_artifact',
  'raw_artifact',
  'conformed_artifact',
  'review_checklist',
  'derived_summary',
  'ai_inference',
  'evidence_gap',
] as const;
export type AssessmentEvidenceSourceType = (typeof ASSESSMENT_EVIDENCE_SOURCE_TYPES)[number];

export const ASSESSMENT_EVIDENCE_CONFIDENCE_LEVELS = ['confirmed', 'customer_supplied', 'derived', 'inferred', 'gap'] as const;
export type AssessmentEvidenceConfidence = (typeof ASSESSMENT_EVIDENCE_CONFIDENCE_LEVELS)[number];

export const ASSESSMENT_PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low', 'informational'] as const;
export type AssessmentPriority = (typeof ASSESSMENT_PRIORITY_LEVELS)[number];

export const ASSESSMENT_EFFORT_BANDS = ['low', 'medium', 'high', 'unknown'] as const;
export type AssessmentEffortBand = (typeof ASSESSMENT_EFFORT_BANDS)[number];

export const ASSESSMENT_IMPACT_LEVELS = ['low', 'medium', 'high', 'unknown'] as const;
export type AssessmentImpactLevel = (typeof ASSESSMENT_IMPACT_LEVELS)[number];

export const ASSESSMENT_PILLARS = ['architecture', 'security', 'reliability', 'performance', 'operations', 'finops', 'roadmap'] as const;
export type AssessmentPillar = (typeof ASSESSMENT_PILLARS)[number];
