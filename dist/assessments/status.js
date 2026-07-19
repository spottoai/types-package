"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSESSMENT_PILLARS = exports.ASSESSMENT_IMPACT_LEVELS = exports.ASSESSMENT_EFFORT_BANDS = exports.ASSESSMENT_PRIORITY_LEVELS = exports.ASSESSMENT_EVIDENCE_CONFIDENCE_LEVELS = exports.ASSESSMENT_EVIDENCE_SOURCE_TYPES = exports.ASSESSMENT_EXPORT_STATUSES = exports.ASSESSMENT_EXPORT_FORMATS = exports.ASSESSMENT_RUN_STATUSES = exports.ASSESSMENT_RELEASE_STAGES = exports.ASSESSMENT_PROVIDER_NAMES = exports.ASSESSMENT_TYPES = exports.ARCHITECTURE_ASSESSMENT_TYPE = void 0;
exports.ARCHITECTURE_ASSESSMENT_TYPE = 'architecture';
exports.ASSESSMENT_TYPES = [exports.ARCHITECTURE_ASSESSMENT_TYPE];
exports.ASSESSMENT_PROVIDER_NAMES = ['azure'];
exports.ASSESSMENT_RELEASE_STAGES = ['preview', 'ga'];
exports.ASSESSMENT_RUN_STATUSES = ['draft', 'queued', 'running', 'needs_review', 'approved', 'published', 'failed'];
exports.ASSESSMENT_EXPORT_FORMATS = ['docx'];
exports.ASSESSMENT_EXPORT_STATUSES = ['requested', 'completed', 'failed'];
exports.ASSESSMENT_EVIDENCE_SOURCE_TYPES = [
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
exports.ASSESSMENT_EVIDENCE_CONFIDENCE_LEVELS = ['confirmed', 'customer_supplied', 'derived', 'inferred', 'gap'];
exports.ASSESSMENT_PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low', 'informational'];
exports.ASSESSMENT_EFFORT_BANDS = ['low', 'medium', 'high', 'unknown'];
exports.ASSESSMENT_IMPACT_LEVELS = ['low', 'medium', 'high', 'unknown'];
exports.ASSESSMENT_PILLARS = ['architecture', 'security', 'reliability', 'performance', 'operations', 'finops', 'roadmap'];
//# sourceMappingURL=status.js.map