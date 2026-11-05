"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORY_LIMITS = exports.STORY_ROW_RECOMMENDATION_STATUSES = exports.STORY_KEYS = void 0;
exports.STORY_KEYS = [
    'oversized-resources',
    'right-sku',
    'schedule-candidates',
    'resilience-recovery',
    'hybrid-benefit',
    'commitments',
];
exports.STORY_ROW_RECOMMENDATION_STATUSES = [
    'Prioritized',
    'Dismissed',
    'Archived',
    'Implementing',
    'Implemented',
    'Failed',
];
exports.STORY_LIMITS = {
    sectionRows: 1000,
    sampleRows: 50,
    windowDays: 30,
    weeklyGridDays: 7,
    weeklyGridHours: 24,
    /** Story fingerprints retained per monthly history period (all stories together). */
    historyFingerprints: 2000,
};
//# sourceMappingURL=utilizationStories.js.map