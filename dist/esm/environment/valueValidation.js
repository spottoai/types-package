import { ENVIRONMENT_PILLARS_V1 } from './contracts.js';
import { hasExactKeys, isCanonicalUtcTimestamp, isCustomerString, isNonNegativeInteger, isRecord, isSafeLabel } from './internal.js';
const PILLARS = new Set(ENVIRONMENT_PILLARS_V1);
/** Validates one admitted environment pillar. */
export const isEnvironmentPillarV1 = (value) => typeof value === 'string' && PILLARS.has(value);
/** Validates the closed coverage-state union and state-specific freshness rules. */
export const isEnvironmentCoverageStateV1 = (value) => {
    if (!isRecord(value) || typeof value.status !== 'string')
        return false;
    const hasValidFreshness = (value.observedAt === undefined || isCanonicalUtcTimestamp(value.observedAt)) &&
        (value.completeThrough === undefined || isCanonicalUtcTimestamp(value.completeThrough)) &&
        (value.observedAt === undefined ||
            value.completeThrough === undefined ||
            Date.parse(value.completeThrough) <= Date.parse(value.observedAt));
    if (value.status === 'complete') {
        return hasExactKeys(value, ['status'], ['observedAt', 'completeThrough']) && hasValidFreshness;
    }
    if (value.status === 'partial') {
        return (hasExactKeys(value, ['status', 'reason'], ['observedAt', 'completeThrough']) &&
            isCustomerString(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'stale') {
        return (hasExactKeys(value, ['status', 'reason', 'observedAt'], ['completeThrough']) &&
            isCustomerString(value.reason) &&
            value.reason.length > 0 &&
            hasValidFreshness);
    }
    if (value.status === 'unavailable' || value.status === 'not-collected') {
        return hasExactKeys(value, ['status', 'reason']) && isCustomerString(value.reason) && value.reason.length > 0;
    }
    return false;
};
/** Validates exact, lower-bound, and unavailable count evidence without ambiguous totals. */
export const isEnvironmentCardinalityV1 = (value) => {
    if (!isRecord(value) || typeof value.basis !== 'string')
        return false;
    if (value.basis === 'exact') {
        return hasExactKeys(value, ['basis', 'value']) && isNonNegativeInteger(value.value);
    }
    if (value.basis === 'lower-bound') {
        return hasExactKeys(value, ['basis', 'value', 'reason']) && isNonNegativeInteger(value.value) && isSafeLabel(value.reason);
    }
    if (value.basis === 'unavailable') {
        return hasExactKeys(value, ['basis', 'reason']) && isSafeLabel(value.reason);
    }
    return false;
};
