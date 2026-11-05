"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvironmentCardinalityV1 = exports.isEnvironmentCoverageStateV1 = exports.isEnvironmentPillarV1 = void 0;
const contracts_js_1 = require("./contracts.js");
const internal_js_1 = require("./internal.js");
const PILLARS = new Set(contracts_js_1.ENVIRONMENT_PILLARS_V1);
/** Validates one admitted environment pillar. */
const isEnvironmentPillarV1 = (value) => typeof value === 'string' && PILLARS.has(value);
exports.isEnvironmentPillarV1 = isEnvironmentPillarV1;
/** Validates the closed coverage-state union and state-specific freshness rules. */
const isEnvironmentCoverageStateV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) || typeof value.status !== 'string')
        return false;
    const hasValidFreshness = (value.observedAt === undefined || (0, internal_js_1.isCanonicalUtcTimestamp)(value.observedAt)) &&
        (value.completeThrough === undefined || (0, internal_js_1.isCanonicalUtcTimestamp)(value.completeThrough)) &&
        (value.observedAt === undefined ||
            value.completeThrough === undefined ||
            Date.parse(value.completeThrough) <= Date.parse(value.observedAt));
    if (value.status === 'complete') {
        return (0, internal_js_1.hasExactKeys)(value, ['status'], ['observedAt', 'completeThrough']) && hasValidFreshness;
    }
    if (value.status === 'partial') {
        return ((0, internal_js_1.hasExactKeys)(value, ['status', 'reason'], ['observedAt', 'completeThrough']) &&
            (0, internal_js_1.isCustomerString)(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'stale') {
        return ((0, internal_js_1.hasExactKeys)(value, ['status', 'reason', 'observedAt'], ['completeThrough']) &&
            (0, internal_js_1.isCustomerString)(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'unavailable' || value.status === 'not-collected') {
        return (0, internal_js_1.hasExactKeys)(value, ['status', 'reason']) && (0, internal_js_1.isCustomerString)(value.reason) && value.reason.length > 0;
    }
    return false;
};
exports.isEnvironmentCoverageStateV1 = isEnvironmentCoverageStateV1;
/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
const isEnvironmentCardinalityV1 = (value) => {
    if (!(0, internal_js_1.isRecord)(value) || typeof value.basis !== 'string')
        return false;
    if (value.basis === 'exact') {
        return (0, internal_js_1.hasExactKeys)(value, ['basis', 'value']) && (0, internal_js_1.isNonNegativeInteger)(value.value);
    }
    if (value.basis === 'lower-bound') {
        return (0, internal_js_1.hasExactKeys)(value, ['basis', 'value', 'reason']) && (0, internal_js_1.isNonNegativeInteger)(value.value) && (0, internal_js_1.isSafeLabel)(value.reason);
    }
    if (value.basis === 'unavailable') {
        return (0, internal_js_1.hasExactKeys)(value, ['basis', 'reason']) && (0, internal_js_1.isSafeLabel)(value.reason);
    }
    return false;
};
exports.isEnvironmentCardinalityV1 = isEnvironmentCardinalityV1;
//# sourceMappingURL=valueValidation.js.map