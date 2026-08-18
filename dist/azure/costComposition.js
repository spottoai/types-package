"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPublicCostComposition = void 0;
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const SUPPORT_STATES = new Set(['supported', 'unsupported', 'unknown']);
const BASIS_STATUSES = new Set(['actual-only', 'actual-plus-estimated', 'estimated-only', 'unavailable']);
const ESTIMATE_CONFIDENCE_VALUES = new Set(['high', 'medium', 'low', 'unknown']);
const MONEY_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && Object.keys(value).every(field => allowed.has(field));
};
const isPublicMoneyComponent = (value) => isRecord(value) &&
    hasExactFields(value, ['amount', 'currencyCode']) &&
    typeof value.amount === 'string' &&
    MONEY_PATTERN.test(value.amount) &&
    typeof value.currencyCode === 'string' &&
    value.currencyCode.length > 0 &&
    value.currencyCode === value.currencyCode.trim();
const isPublicAvailability = (value) => {
    if (!isRecord(value))
        return false;
    if (value.status === 'unavailable')
        return hasExactFields(value, ['status']);
    return value.status === 'available' && hasExactFields(value, ['status', 'component']) && isPublicMoneyComponent(value.component);
};
const isPublicComponentState = (value) => isRecord(value) &&
    hasExactFields(value, ['support', 'availability']) &&
    typeof value.support === 'string' &&
    SUPPORT_STATES.has(value.support) &&
    isPublicAvailability(value.availability);
const isPublicBasis = (value, expectedBasis) => isRecord(value) &&
    hasExactFields(value, ['basis', 'actual', 'estimated', 'combined', 'status'], ['estimateConfidence']) &&
    value.basis === expectedBasis &&
    isPublicComponentState(value.actual) &&
    isPublicComponentState(value.estimated) &&
    isPublicAvailability(value.combined) &&
    typeof value.status === 'string' &&
    BASIS_STATUSES.has(value.status) &&
    (value.estimateConfidence === undefined ||
        (typeof value.estimateConfidence === 'string' && ESTIMATE_CONFIDENCE_VALUES.has(value.estimateConfidence)));
/** Exact dependency-free validator for the public cost-composition boundary. */
const isPublicCostComposition = (value) => isRecord(value) &&
    hasExactFields(value, ['schemaVersion', 'selectedLens', 'billed', 'amortized']) &&
    value.schemaVersion === 1 &&
    typeof value.selectedLens === 'string' &&
    ESTIMATE_LENSES.has(value.selectedLens) &&
    isPublicBasis(value.billed, 'billed') &&
    isPublicBasis(value.amortized, 'amortized');
exports.isPublicCostComposition = isPublicCostComposition;
//# sourceMappingURL=costComposition.js.map