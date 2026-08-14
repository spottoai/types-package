export const COMPANY_NOTE_SCHEMA_VERSION = 1;
export const COMPANY_NOTES_FEATURE_KEY = 'company_notes';
export const COMPANY_NOTES_VIEW_PERMISSION_KEY = 'company_notes.view';
export const COMPANY_NOTES_MANAGE_PERMISSION_KEY = 'company_notes.manage';
export const COMPANY_NOTES_PERMISSION_KEYS = [COMPANY_NOTES_VIEW_PERMISSION_KEY, COMPANY_NOTES_MANAGE_PERMISSION_KEY];
export const COMPANY_NOTE_ORDINARY_CATEGORIES = ['general', 'meeting'];
export const COMPANY_NOTE_CONTEXT_CATEGORIES = [
    'company-profile',
    'security',
    'architecture',
    'operations',
    'finops',
    'performance',
    'reliability',
    'roadmap',
];
export const COMPANY_NOTE_CONTEXT_CATEGORY_ORDER = COMPANY_NOTE_CONTEXT_CATEGORIES;
export const COMPANY_NOTE_CATEGORIES = [...COMPANY_NOTE_ORDINARY_CATEGORIES, ...COMPANY_NOTE_CONTEXT_CATEGORIES];
export const COMPANY_NOTE_MEETING_TEMPLATE_KEY = 'meeting-v1';
export const COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS = [
    'company-profile-v1',
    'security-v1',
    'architecture-v1',
    'operations-v1',
    'finops-v1',
    'performance-v1',
    'reliability-v1',
    'roadmap-v1',
];
export const COMPANY_NOTE_TEMPLATE_KEYS = [COMPANY_NOTE_MEETING_TEMPLATE_KEY, ...COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS];
export const COMPANY_NOTES_AI_MODES = [
    'general-note',
    'template-draft',
    'section-draft',
    'coach-selection',
    'company-research',
];
export const COMPANY_NOTES_AI_SOURCE_MODES = ['spotto-only', 'public-research'];
