"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPANY_NOTES_AI_SOURCE_MODES = exports.COMPANY_NOTES_AI_MODES = exports.COMPANY_NOTE_TEMPLATE_KEYS = exports.COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS = exports.COMPANY_NOTE_MEETING_TEMPLATE_KEY = exports.COMPANY_NOTE_CATEGORIES = exports.COMPANY_NOTE_CONTEXT_CATEGORY_ORDER = exports.COMPANY_NOTE_CONTEXT_CATEGORIES = exports.COMPANY_NOTE_ORDINARY_CATEGORIES = exports.COMPANY_NOTES_PERMISSION_KEYS = exports.COMPANY_NOTES_MANAGE_PERMISSION_KEY = exports.COMPANY_NOTES_VIEW_PERMISSION_KEY = exports.COMPANY_NOTES_FEATURE_KEY = exports.COMPANY_NOTE_SCHEMA_VERSION = void 0;
exports.COMPANY_NOTE_SCHEMA_VERSION = 1;
exports.COMPANY_NOTES_FEATURE_KEY = 'company_notes';
exports.COMPANY_NOTES_VIEW_PERMISSION_KEY = 'company_notes.view';
exports.COMPANY_NOTES_MANAGE_PERMISSION_KEY = 'company_notes.manage';
exports.COMPANY_NOTES_PERMISSION_KEYS = [exports.COMPANY_NOTES_VIEW_PERMISSION_KEY, exports.COMPANY_NOTES_MANAGE_PERMISSION_KEY];
exports.COMPANY_NOTE_ORDINARY_CATEGORIES = ['general', 'meeting'];
exports.COMPANY_NOTE_CONTEXT_CATEGORIES = [
    'company-profile',
    'security',
    'architecture',
    'operations',
    'finops',
    'performance',
    'reliability',
    'roadmap',
];
exports.COMPANY_NOTE_CONTEXT_CATEGORY_ORDER = exports.COMPANY_NOTE_CONTEXT_CATEGORIES;
exports.COMPANY_NOTE_CATEGORIES = [...exports.COMPANY_NOTE_ORDINARY_CATEGORIES, ...exports.COMPANY_NOTE_CONTEXT_CATEGORIES];
exports.COMPANY_NOTE_MEETING_TEMPLATE_KEY = 'meeting-v1';
exports.COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS = [
    'company-profile-v1',
    'security-v1',
    'architecture-v1',
    'operations-v1',
    'finops-v1',
    'performance-v1',
    'reliability-v1',
    'roadmap-v1',
];
exports.COMPANY_NOTE_TEMPLATE_KEYS = [exports.COMPANY_NOTE_MEETING_TEMPLATE_KEY, ...exports.COMPANY_NOTE_CONTEXT_TEMPLATE_KEYS];
exports.COMPANY_NOTES_AI_MODES = [
    'general-note',
    'template-draft',
    'section-draft',
    'coach-selection',
    'company-research',
];
exports.COMPANY_NOTES_AI_SOURCE_MODES = ['spotto-only', 'public-research'];
//# sourceMappingURL=companyNotes.js.map