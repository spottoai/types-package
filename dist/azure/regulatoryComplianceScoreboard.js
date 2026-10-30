"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGULATORY_SCORE_SOURCES = exports.REGULATORY_NOT_ASSESSED_REASONS = exports.REGULATORY_CONTROL_OUTCOMES = exports.REGULATORY_SCOREBOARD_LIMITS = exports.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_RETENTION_MONTHS = exports.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_PATTERN = exports.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION = exports.REGULATORY_COMPLIANCE_SCOREBOARD_PORTAL_FILE = exports.REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION = void 0;
// ---------- Versions, files, limits ----------
exports.REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION = '2026-10-03.regulatory-compliance-scoreboard-v1';
/** Portal file per subscription (written with savePortalResource, like REGULATORY_COMPLIANCE_PORTAL_FILE). */
exports.REGULATORY_COMPLIANCE_SCOREBOARD_PORTAL_FILE = 'regulatory-compliance-scoreboard.json.gz';
exports.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION = '2026-10-03.regulatory-compliance-scoreboard-history-v1';
/**
 * Monthly history file, relative to the subscription's raw prefix in `azure-raw`
 * (`subscriptions/{subscriptionId}/`), same placeholder style as cloud-engine SUBSCRIPTION_HISTORY_PATTERN.
 */
exports.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_PATTERN = 'history/regulatory-compliance/month_{year}-{month}.json.gz';
exports.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_RETENTION_MONTHS = 13;
exports.REGULATORY_SCOREBOARD_LIMITS = Object.freeze({
    standards: 200,
    controlsPerStandard: 2000,
    /** Azure allows six management group levels below the root. */
    managementGroupPathEntries: 7,
    subscriptionIdsPerRequest: 500,
    defaultTrendDays: 30,
    trendCarryForwardDays: 3,
    /** Expired exemptions returned by the standard detail when they expired within this many days. */
    expiredExemptionLookbackDays: 90,
});
// ---------- Enumerations ----------
exports.REGULATORY_CONTROL_OUTCOMES = ['passed', 'failed', 'notAssessed'];
/** Array order is the merge tie-break order. */
exports.REGULATORY_NOT_ASSESSED_REASONS = [
    'noPolicies',
    'manual',
    'microsoftResponsibility',
    'notEvaluated',
    'evaluationError',
    'skipped',
    'unsupported',
];
exports.REGULATORY_SCORE_SOURCES = ['defenderForCloud', 'azurePolicy'];
//# sourceMappingURL=regulatoryComplianceScoreboard.js.map