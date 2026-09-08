"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPublicCostCompositionEstimateLensV1 = exports.projectPublicCostCompositionsV1 = exports.projectPublicCostCompositionV1 = exports.isPublicCostComposition = exports.PUBLIC_COST_COMPOSITION_PROJECTION_CONTRACT_V1 = exports.toLegacyEstimateLensV1 = exports.toCanonicalEstimateLensV1 = void 0;
const CANONICAL_ESTIMATE_LENS_BY_LEGACY = {
    'actual-only': 'billing-only',
    'actual-plus-estimated': 'include-estimates',
    'estimates-only': 'estimates-only',
};
const LEGACY_ESTIMATE_LENS_BY_CANONICAL = {
    'billing-only': 'actual-only',
    'include-estimates': 'actual-plus-estimated',
    'estimates-only': 'estimates-only',
};
const toCanonicalEstimateLensV1 = (value) => CANONICAL_ESTIMATE_LENS_BY_LEGACY[value];
exports.toCanonicalEstimateLensV1 = toCanonicalEstimateLensV1;
const toLegacyEstimateLensV1 = (value) => LEGACY_ESTIMATE_LENS_BY_CANONICAL[value];
exports.toLegacyEstimateLensV1 = toLegacyEstimateLensV1;
/** Declares that a published artifact contains public, rather than authority, cost compositions. */
exports.PUBLIC_COST_COMPOSITION_PROJECTION_CONTRACT_V1 = 'public-cost-composition/v1';
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
const isCostCompositionProjectionSource = (value) => {
    if (!isRecord(value))
        return false;
    return (value.schemaVersion === 1 &&
        typeof value.compositionId === 'string' &&
        isRecord(value.coverageIdentity) &&
        typeof value.coverageCompletenessRef === 'string' &&
        typeof value.allocationRef === 'string' &&
        isRecord(value.billed) &&
        value.billed.basis === 'billed' &&
        isRecord(value.amortized) &&
        value.amortized.basis === 'amortized');
};
const projectPublicAvailability = (availability) => availability.status === 'available'
    ? {
        status: 'available',
        component: {
            amount: availability.component.amount,
            currencyCode: availability.component.currencyCode,
        },
    }
    : { status: 'unavailable' };
const projectPublicComponentState = (state) => ({
    support: state.support,
    availability: projectPublicAvailability(state.availability),
});
const projectPublicBasis = (basis, lens) => {
    const combined = lens === 'actual-only' ? basis.actual.availability : lens === 'estimates-only' ? basis.estimated.availability : basis.combined;
    return {
        basis: basis.basis,
        actual: projectPublicComponentState(basis.actual),
        estimated: projectPublicComponentState(basis.estimated),
        combined: projectPublicAvailability(combined),
        status: basis.status,
        ...(basis.estimateConfidence === undefined ? {} : { estimateConfidence: basis.estimateConfidence }),
    };
};
/** Projects one authority composition to its exact customer-safe representation. */
const projectPublicCostCompositionV1 = (composition, lens = composition.selectedLens) => ({
    schemaVersion: 1,
    selectedLens: lens,
    billed: projectPublicBasis(composition.billed, lens),
    amortized: projectPublicBasis(composition.amortized, lens),
});
exports.projectPublicCostCompositionV1 = projectPublicCostCompositionV1;
const visitPublicCostCompositions = (value, lens) => {
    if (isCostCompositionProjectionSource(value))
        return (0, exports.projectPublicCostCompositionV1)(value, lens ?? value.selectedLens);
    if ((0, exports.isPublicCostComposition)(value)) {
        return lens === undefined || lens === value.selectedLens ? value : (0, exports.projectPublicCostCompositionV1)(value, lens);
    }
    if (Array.isArray(value)) {
        let changed = false;
        const projected = value.map(item => {
            const next = visitPublicCostCompositions(item, lens);
            changed || (changed = next !== item);
            return next;
        });
        return changed ? projected : value;
    }
    if (!isRecord(value))
        return value;
    let changed = false;
    const projected = Object.fromEntries(Object.entries(value).map(([key, item]) => {
        const next = visitPublicCostCompositions(item, lens);
        changed || (changed = next !== item);
        return [key, next];
    }));
    return changed ? projected : value;
};
/** Recursively removes authority/evidence fields from every cost composition in a JSON document. */
const projectPublicCostCompositionsV1 = (document) => visitPublicCostCompositions(document);
exports.projectPublicCostCompositionsV1 = projectPublicCostCompositionsV1;
/** Applies a display lens to authority or already-public compositions without reconstructing money. */
const applyPublicCostCompositionEstimateLensV1 = (document, lens) => {
    const projected = visitPublicCostCompositions(document, lens);
    if (!isRecord(projected))
        return projected;
    return { ...projected, selectedLens: lens };
};
exports.applyPublicCostCompositionEstimateLensV1 = applyPublicCostCompositionEstimateLensV1;
//# sourceMappingURL=costComposition.js.map