"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRegulatoryComplianceScoreboardSubscription = isRegulatoryComplianceScoreboardSubscription;
exports.isRegulatoryComplianceScoreboardHistory = isRegulatoryComplianceScoreboardHistory;
exports.isRegulatoryReportComparisonIdentities = isRegulatoryReportComparisonIdentities;
const validationHelpers_1 = require("../common/validationHelpers");
const regulatoryComplianceScoreboard_1 = require("./regulatoryComplianceScoreboard");
const regulatoryComplianceScoreboardMerge_1 = require("./regulatoryComplianceScoreboardMerge");
const guid = (value) => (0, validationHelpers_1.isString)(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const key = (value) => (0, validationHelpers_1.isString)(value) && value.length <= 512 && /^\S+$/u.test(value);
const uniqueKeys = (value, limit = regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.controlsPerStandard) => Array.isArray(value) && value.length <= limit && value.every(key) && new Set(value).size === value.length;
const basis = (value) => (0, validationHelpers_1.isString)(value) && /^[a-f0-9]{64}$/u.test(value);
const source = (value) => regulatoryComplianceScoreboard_1.REGULATORY_SCORE_SOURCES.includes(value);
const outcome = (value) => regulatoryComplianceScoreboard_1.REGULATORY_CONTROL_OUTCOMES.includes(value);
const counts = (value) => (0, validationHelpers_1.isRecord)(value) && ['passed', 'failed', 'notAssessed', 'assessed', 'total'].every(field => (0, validationHelpers_1.isCount)(value[field])) && value.assessed === Number(value.passed) + Number(value.failed) && value.total === Number(value.assessed) + Number(value.notAssessed);
function resourceCounts(value) {
    return ['failingResourceCount', 'exemptResourceCount', 'activeExemptionCount'].every(field => (value[field] === undefined || (0, validationHelpers_1.isCount)(value[field])) &&
        (value[`${field}IsMinimum`] === undefined || (value[`${field}IsMinimum`] === true && (0, validationHelpers_1.isCount)(value[field]))));
}
function coverage(value) {
    return (0, validationHelpers_1.isRecord)(value) && ['complete', 'partial', 'unavailable', 'stale', 'notCollected'].includes(String(value.state)) &&
        Array.isArray(value.sources) && value.sources.every(item => ['resourceGraph', 'arm', 'policyInsights', 'derived'].includes(String(item))) &&
        (value.observedAt === undefined || (0, validationHelpers_1.isDateTime)(value.observedAt)) && (0, validationHelpers_1.isOptionalString)(value.message) &&
        (value.requiredPermissions === undefined || (Array.isArray(value.requiredPermissions) && value.requiredPermissions.every(validationHelpers_1.isString))) &&
        (value.diagnostics === undefined || (Array.isArray(value.diagnostics) && value.diagnostics.every(item => (0, validationHelpers_1.isRecord)(item) && (0, validationHelpers_1.isString)(item.code) && (0, validationHelpers_1.isString)(item.message))));
}
function control(value, assignments) {
    if (!(0, validationHelpers_1.isRecord)(value) || !key(value.controlKey) || !(0, validationHelpers_1.isString)(value.displayName) || !(0, validationHelpers_1.isOptionalString)(value.domain) || !outcome(value.outcome) || !resourceCounts(value))
        return false;
    if (value.notAssessedReason !== undefined && (value.outcome !== 'notAssessed' || !regulatoryComplianceScoreboard_1.REGULATORY_NOT_ASSESSED_REASONS.includes(value.notAssessedReason)))
        return false;
    if (!Array.isArray(value.policyEvidence) || value.policyEvidence.length > 2000)
        return false;
    const seen = new Set();
    return value.policyEvidence.every(row => {
        if (!(0, validationHelpers_1.isRecord)(row) || !key(row.assignmentKey) || !assignments.has(row.assignmentKey) || !(0, validationHelpers_1.isString)(row.policyControlKey) || row.policyControlKey.trim().length === 0 || row.policyControlKey.length > 512 || !outcome(row.outcome) || !resourceCounts(row))
            return false;
        const identity = JSON.stringify([row.assignmentKey, row.policyControlKey]);
        if (seen.has(identity))
            return false;
        seen.add(identity);
        return true;
    });
}
function standard(value) {
    if (!(0, validationHelpers_1.isRecord)(value) || !key(value.standardKey) || !key(value.standardFamilyKey) || !(0, validationHelpers_1.isString)(value.displayName) || !(0, validationHelpers_1.isOptionalString)(value.definitionId) || !source(value.source) || !basis(value.assessmentBasisKey) || !resourceCounts(value))
        return false;
    if (!Array.isArray(value.assignments) || value.assignments.length > 2000)
        return false;
    const assignments = new Set();
    for (const row of value.assignments) {
        if (!(0, validationHelpers_1.isRecord)(row) || !key(row.assignmentKey) || assignments.has(row.assignmentKey) || !(0, validationHelpers_1.isString)(row.assignmentId) || !(0, validationHelpers_1.isString)(row.assignmentScope) || typeof row.inherited !== 'boolean')
            return false;
        assignments.add(row.assignmentKey);
    }
    if (!Array.isArray(value.controls) || !value.controls.length || value.controls.length > regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.controlsPerStandard || !value.controls.every(row => control(row, assignments)))
        return false;
    if (new Set(value.controls.map(row => row.controlKey)).size !== value.controls.length || !counts(value.counts))
        return false;
    const expected = (0, regulatoryComplianceScoreboardMerge_1.deriveControlOutcomeCounts)(value.controls);
    return Object.entries(expected).every(([field, count]) => value.counts[field] === count) && (value.policyCounts === undefined || counts(value.policyCounts));
}
function isRegulatoryComplianceScoreboardSubscription(value) {
    if (!(0, validationHelpers_1.isRecord)(value) || value.schemaVersion !== regulatoryComplianceScoreboard_1.REGULATORY_COMPLIANCE_SCOREBOARD_SCHEMA_VERSION || !guid(value.subscriptionId) || !(0, validationHelpers_1.isOptionalString)(value.tenantId) || !(0, validationHelpers_1.isDateTime)(value.generatedAt) || !(0, validationHelpers_1.isDateTime)(value.observedAt))
        return false;
    if (!Array.isArray(value.managementGroupPath) || value.managementGroupPath.length > regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.managementGroupPathEntries || !value.managementGroupPath.every(row => (0, validationHelpers_1.isRecord)(row) && (0, validationHelpers_1.isString)(row.id) && (0, validationHelpers_1.isString)(row.displayName)))
        return false;
    if (!(0, validationHelpers_1.isRecord)(value.coverage) || !coverage(value.coverage.policy) || !coverage(value.coverage.defender))
        return false;
    if (!uniqueKeys(value.omittedStandardKeys, regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.standards) || !Array.isArray(value.standards) || value.standards.length > regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.standards || !value.standards.every(standard))
        return false;
    const keys = value.standards.map(row => row.standardKey);
    return new Set(keys).size === keys.length && !value.omittedStandardKeys.some(item => keys.includes(item)) &&
        (!value.omittedStandardKeys.length || value.coverage.policy.state !== 'complete' || value.coverage.defender.state !== 'complete');
}
function isRegulatoryComplianceScoreboardHistory(value) {
    if (!(0, validationHelpers_1.isRecord)(value) || value.schemaVersion !== regulatoryComplianceScoreboard_1.REGULATORY_COMPLIANCE_SCOREBOARD_HISTORY_SCHEMA_VERSION || !guid(value.subscriptionId) || !(0, validationHelpers_1.isString)(value.month) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value.month) || !Array.isArray(value.days) || value.days.length > 31)
        return false;
    let previous = '';
    for (const day of value.days) {
        if (!(0, validationHelpers_1.isRecord)(day) || !(0, validationHelpers_1.isString)(day.date) || !(0, regulatoryComplianceScoreboardMerge_1.isRegulatoryScoreboardDate)(day.date) || !day.date.startsWith(value.month) || day.date <= previous || !(0, validationHelpers_1.isDateTime)(day.observedAt) || !['complete', 'partial', 'unavailable'].includes(String(day.evidenceState)))
            return false;
        if (!uniqueKeys(day.omittedStandardKeys, regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.standards) || !Array.isArray(day.standards) || day.standards.length > regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.standards || (day.evidenceState === 'unavailable' && day.standards.length > 0) || (day.evidenceState === 'complete' && day.omittedStandardKeys.length > 0))
            return false;
        const seen = new Set();
        for (const row of day.standards) {
            if (!(0, validationHelpers_1.isRecord)(row) || !key(row.standardKey) || seen.has(row.standardKey) || day.omittedStandardKeys.includes(row.standardKey) || !source(row.source) || !basis(row.assessmentBasisKey) || !uniqueKeys(row.passedControlKeys) || !uniqueKeys(row.failedControlKeys) || !uniqueKeys(row.notAssessedControlKeys))
                return false;
            const all = [...row.passedControlKeys, ...row.failedControlKeys, ...row.notAssessedControlKeys];
            if (all.length > regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.controlsPerStandard || new Set(all).size !== all.length)
                return false;
            seen.add(row.standardKey);
        }
        previous = day.date;
    }
    return true;
}
/** New report history fields are atomic: capped/incomplete baselines must be absent. */
function isRegulatoryReportComparisonIdentities(value) {
    const identities = value.regulatoryFailingControlKeys;
    const comparison = value.regulatoryComparisonBasis;
    if (identities === undefined && comparison === undefined)
        return true;
    if (!(0, validationHelpers_1.isRecord)(identities) || !uniqueKeys(identities.rows) || !identities.rows.every(item => /^\S+:\S+$/u.test(item)) || identities.omittedCount !== 0 || identities.totalCount !== identities.rows.length)
        return false;
    if (!(0, validationHelpers_1.isRecord)(comparison) || comparison.evidenceComplete !== true || !Array.isArray(comparison.standards) || comparison.standards.length > regulatoryComplianceScoreboard_1.REGULATORY_SCOREBOARD_LIMITS.standards)
        return false;
    const seen = new Set();
    const standards = comparison.standards;
    return standards.every(row => {
        if (!(0, validationHelpers_1.isRecord)(row) || !key(row.standardKey) || seen.has(row.standardKey) || !source(row.source) || !basis(row.assessmentBasisKey))
            return false;
        seen.add(row.standardKey);
        return true;
    }) && identities.rows.every(identity => standards.some(row => identity.startsWith(`${row.standardKey}:`)));
}
//# sourceMappingURL=regulatoryComplianceScoreboardValidation.js.map