export const ARCHITECTURE_ASSESSMENT_TYPE = 'architecture';
export const ASSESSMENT_TYPES = [ARCHITECTURE_ASSESSMENT_TYPE];
export const ASSESSMENT_PROVIDER_NAMES = ['azure'];
export const ASSESSMENT_RELEASE_STAGES = ['preview', 'ga'];
export const ASSESSMENT_RUN_STATUSES = ['draft', 'queued', 'running', 'needs_review', 'approved', 'published', 'failed'];
export const ASSESSMENT_EXPORT_FORMATS = ['docx'];
export const ASSESSMENT_EXPORT_STATUSES = ['requested', 'completed', 'failed'];
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
];
export const ASSESSMENT_EVIDENCE_CONFIDENCE_LEVELS = ['confirmed', 'customer_supplied', 'derived', 'inferred', 'gap'];
export const ASSESSMENT_PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low', 'informational'];
export const ASSESSMENT_EFFORT_BANDS = ['low', 'medium', 'high', 'unknown'];
export const ASSESSMENT_IMPACT_LEVELS = ['low', 'medium', 'high', 'unknown'];
export const ASSESSMENT_PILLARS = ['architecture', 'security', 'reliability', 'performance', 'operations', 'finops', 'roadmap'];
