"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCommitmentsFreshnessSummary = exports.isCommitmentsFreshnessEntry = exports.hasValidCommitmentsFreshnessDiagnostics = exports.isCommitmentsFreshnessAgeHours = exports.isCommitmentsFreshnessReasonCode = exports.isCommitmentsFreshnessStatus = void 0;
exports.assertCommitmentsFreshnessDiagnostics = assertCommitmentsFreshnessDiagnostics;
/** Dependency-free runtime guards for Azure commitments planning freshness evidence. */
const commitmentsPlanning_js_1 = require("./commitmentsPlanning.js");
const validationHelpers_js_1 = require("../common/validationHelpers.js");
const FRESHNESS_STATUSES = ['current', 'stale', 'partial', 'unavailable'];
const SOURCE_KINDS = ['azure-native', 'aws-native', 'spotto-derived', 'fallback-heuristic', 'manual', 'unknown'];
const isCommitmentsFreshnessStatus = (value) => typeof value === 'string' && FRESHNESS_STATUSES.includes(value);
exports.isCommitmentsFreshnessStatus = isCommitmentsFreshnessStatus;
const isCommitmentsFreshnessReasonCode = (value) => typeof value === 'string' && commitmentsPlanning_js_1.COMMITMENTS_FRESHNESS_REASON_CODES.includes(value);
exports.isCommitmentsFreshnessReasonCode = isCommitmentsFreshnessReasonCode;
/** Finite, non-negative and rounded to one decimal place. */
const isCommitmentsFreshnessAgeHours = (value) => (0, validationHelpers_js_1.isFiniteNumber)(value) && value >= 0 && Number(value.toFixed(1)) === value;
exports.isCommitmentsFreshnessAgeHours = isCommitmentsFreshnessAgeHours;
/**
 * Checks only the diagnostic fields shared by every commitments freshness producer:
 * `ageHours` requires `lastSuccessfulSyncAt` and is a non-negative one-decimal number;
 * `reasonCode` is a known code, and `collection-stale` appears only with status `stale`.
 */
const hasValidCommitmentsFreshnessDiagnostics = (entry) => (entry.ageHours === undefined || ((0, exports.isCommitmentsFreshnessAgeHours)(entry.ageHours) && entry.lastSuccessfulSyncAt !== undefined)) &&
    (entry.reasonCode === undefined ||
        ((0, exports.isCommitmentsFreshnessReasonCode)(entry.reasonCode) && (entry.reasonCode !== 'collection-stale' || entry.status === 'stale')));
exports.hasValidCommitmentsFreshnessDiagnostics = hasValidCommitmentsFreshnessDiagnostics;
/** Throwing form of `hasValidCommitmentsFreshnessDiagnostics` for exact public-artifact validators. */
function assertCommitmentsFreshnessDiagnostics(entry, field) {
    if (!(0, exports.hasValidCommitmentsFreshnessDiagnostics)(entry)) {
        throw new Error(`${field} ageHours must be a non-negative one-decimal number with lastSuccessfulSyncAt, and reasonCode must be a known code (collection-stale only with status stale).`);
    }
}
const isOptionalDateTime = (value) => value === undefined || (0, validationHelpers_js_1.isDateTime)(value);
const isCommitmentsFreshnessEntry = (value) => (0, validationHelpers_js_1.isRecord)(value) &&
    (0, validationHelpers_js_1.isString)(value.section) &&
    (0, exports.isCommitmentsFreshnessStatus)(value.status) &&
    isOptionalDateTime(value.generatedAt) &&
    isOptionalDateTime(value.observedAt) &&
    isOptionalDateTime(value.lastSuccessfulSyncAt) &&
    (0, validationHelpers_js_1.isOptionalString)(value.reason) &&
    (value.sourceKind === undefined || (typeof value.sourceKind === 'string' && SOURCE_KINDS.includes(value.sourceKind))) &&
    (0, exports.hasValidCommitmentsFreshnessDiagnostics)(value);
exports.isCommitmentsFreshnessEntry = isCommitmentsFreshnessEntry;
const isCommitmentsFreshnessSummary = (value) => (0, validationHelpers_js_1.isRecord)(value) &&
    (0, exports.isCommitmentsFreshnessStatus)(value.status) &&
    (0, validationHelpers_js_1.isDateTime)(value.generatedAt) &&
    Array.isArray(value.entries) &&
    value.entries.every(exports.isCommitmentsFreshnessEntry) &&
    (value.warnings === undefined || (0, validationHelpers_js_1.isStringArray)(value.warnings));
exports.isCommitmentsFreshnessSummary = isCommitmentsFreshnessSummary;
//# sourceMappingURL=commitmentsPlanningValidation.js.map