"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialCurrentSpendSurfaceProjectionV1 = exports.createFinancialCurrentSpendSurfaceProjectionIdV1 = exports.canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1 = exports.isFinancialSurfaceMoneyV1 = exports.isFinancialSurfaceCoordinateDefinitionV1 = exports.createFinancialSurfaceCoordinateIdV1 = exports.canonicalizeFinancialSurfaceCoordinateIdentityV1 = exports.isFinancialSurfacePeriodV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialChargeCompositionValidation_1 = require("./financialChargeCompositionValidation");
const financialCurrentSpendSurfaceProjection_1 = require("./financialCurrentSpendSurfaceProjection");
const financialSavingsAuthorityValidationPrimitives_1 = require("./financialSavingsAuthorityValidationPrimitives");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const CURRENCIES = /^[A-Z]{3}$/;
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WINDOW_KINDS = new Set([
    'rolling-30-days',
    'calendar-month',
    'provider-billing-period',
    'stable-billing-window',
    'analytics-history',
    'daily',
]);
const PERIOD_ROLES = new Set(['current-spend', 'comparison', 'analytics-input', 'projection-target']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['billing-only', 'include-estimates', 'estimates-only']);
const SCOPE_KINDS = new Set(['subscription', 'resource-group', 'tag-scope', 'multi-subscription']);
const MAX_COORDINATES = 128;
const MAX_REASONS = 64;
const isCurrency = (value) => typeof value === 'string' && CURRENCIES.test(value);
const isCalendarDate = (value) => {
    if (typeof value !== 'string' || !CALENDAR_DATE.test(value))
        return false;
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const isInterval = (value) => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['startDate', 'endDateExclusive', 'dateBasis'], ['timeZone']) &&
    isCalendarDate(value.startDate) &&
    isCalendarDate(value.endDateExclusive) &&
    value.startDate < value.endDateExclusive &&
    (value.dateBasis === 'utc' || value.dateBasis === 'billing-calendar' || value.dateBasis === 'company-local') &&
    (value.timeZone === undefined || (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.timeZone));
const isFinancialSurfacePeriodV1 = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['windowKind', 'requested'], ['observed', 'providerBillingPeriodId']) ||
        typeof value.windowKind !== 'string' ||
        !WINDOW_KINDS.has(value.windowKind) ||
        !isInterval(value.requested) ||
        (value.observed !== undefined && !isInterval(value.observed)) ||
        (value.providerBillingPeriodId !== undefined && !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.providerBillingPeriodId)))
        return false;
    if (value.observed === undefined)
        return true;
    const requested = value.requested;
    const observed = value.observed;
    return observed.startDate >= requested.startDate && observed.endDateExclusive <= requested.endDateExclusive;
};
exports.isFinancialSurfacePeriodV1 = isFinancialSurfacePeriodV1;
const canonicalizeFinancialSurfaceCoordinateIdentityV1 = (value) => JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)(value));
exports.canonicalizeFinancialSurfaceCoordinateIdentityV1 = canonicalizeFinancialSurfaceCoordinateIdentityV1;
const createFinancialSurfaceCoordinateIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialSurfaceCoordinateIdentityV1)(value))}`;
exports.createFinancialSurfaceCoordinateIdV1 = createFinancialSurfaceCoordinateIdV1;
const isFinancialSurfaceCoordinateDefinitionV1 = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['coordinateId', 'periodRole', 'period', 'costBasis', 'estimateLens', 'chargeInclusionPolicyRef'], ['requestedCurrencyCode']) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.coordinateId) ||
        typeof value.periodRole !== 'string' ||
        !PERIOD_ROLES.has(value.periodRole) ||
        !(0, exports.isFinancialSurfacePeriodV1)(value.period) ||
        typeof value.costBasis !== 'string' ||
        !COST_BASES.has(value.costBasis) ||
        typeof value.estimateLens !== 'string' ||
        !ESTIMATE_LENSES.has(value.estimateLens) ||
        !(0, financialChargeCompositionValidation_1.isFinancialChargeInclusionPolicyRefV1)(value.chargeInclusionPolicyRef) ||
        (value.requestedCurrencyCode !== undefined && !isCurrency(value.requestedCurrencyCode)))
        return false;
    const coordinate = value;
    const { coordinateId: _coordinateId, ...identity } = coordinate;
    return coordinate.coordinateId === (0, exports.createFinancialSurfaceCoordinateIdV1)(identity);
};
exports.isFinancialSurfaceCoordinateDefinitionV1 = isFinancialSurfaceCoordinateDefinitionV1;
const isReasonCodes = (value) => Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_REASONS &&
    value.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) &&
    new Set(value).size === value.length;
const isExactAmount = (amount, currencyCode) => isCurrency(currencyCode) && (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount, currencyCode });
const isNonNegativeExactAmount = (amount, currencyCode) => isExactAmount(amount, currencyCode) && typeof amount === 'string' && !amount.startsWith('-');
const isFinancialSurfaceMoneyV1 = (value, requestedCurrencyCode) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value))
        return false;
    if (value.status === 'available') {
        return ((0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
            'status',
            'amount',
            'currencyCode',
            'completeness',
            'excludedAmount',
            'withheldAmount',
        ]) &&
            value.completeness === 'complete' &&
            isExactAmount(value.amount, value.currencyCode) &&
            isNonNegativeExactAmount(value.excludedAmount, value.currencyCode) &&
            isNonNegativeExactAmount(value.withheldAmount, value.currencyCode) &&
            (requestedCurrencyCode === undefined || value.currencyCode === requestedCurrencyCode));
    }
    if (value.status === 'partial') {
        return ((0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
            'status',
            'knownAmount',
            'currencyCode',
            'completeness',
            'excludedAmount',
            'withheldAmount',
            'reasonCodes',
        ]) &&
            value.completeness === 'partial' &&
            isExactAmount(value.knownAmount, value.currencyCode) &&
            isNonNegativeExactAmount(value.excludedAmount, value.currencyCode) &&
            isNonNegativeExactAmount(value.withheldAmount, value.currencyCode) &&
            isReasonCodes(value.reasonCodes) &&
            (requestedCurrencyCode === undefined || value.currencyCode === requestedCurrencyCode));
    }
    return (value.status === 'unavailable' &&
        (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['status', 'completeness', 'reasonCodes']) &&
        value.completeness === 'unavailable' &&
        isReasonCodes(value.reasonCodes));
};
exports.isFinancialSurfaceMoneyV1 = isFinancialSurfaceMoneyV1;
const canonicalizeMoney = (value) => value.status === 'available' ? value : { ...value, reasonCodes: [...value.reasonCodes].sort() };
const canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1 = (value) => JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)({
    ...value,
    providerAccountRefs: [...value.providerAccountRefs].sort(),
    coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate => ({ ...coordinate, value: canonicalizeMoney(coordinate.value) })),
}));
exports.canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1 = canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1;
const createFinancialCurrentSpendSurfaceProjectionIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialCurrentSpendSurfaceProjectionIdentityV1)(value))}`;
exports.createFinancialCurrentSpendSurfaceProjectionIdV1 = createFinancialCurrentSpendSurfaceProjectionIdV1;
const isFinancialCurrentSpendSurfaceProjectionV1 = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
            'schemaVersion',
            'contractVersion',
            'projectionId',
            'provider',
            'providerAccountRefs',
            'artifactGeneration',
            'financialAuthorityId',
            'scope',
            'coordinates',
        ]) ||
        value.schemaVersion !== financialCurrentSpendSurfaceProjection_1.FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialCurrentSpendSurfaceProjection_1.FINANCIAL_CURRENT_SPEND_SURFACE_PROJECTION_CONTRACT_VERSION_V1 ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.projectionId) ||
        value.provider !== 'azure' ||
        !Array.isArray(value.providerAccountRefs) ||
        value.providerAccountRefs.length === 0 ||
        value.providerAccountRefs.length > 64 ||
        !value.providerAccountRefs.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) ||
        new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.artifactGeneration) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.artifactGeneration, ['runId', 'generatedAt']) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.artifactGeneration.runId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.artifactGeneration.generatedAt) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.financialAuthorityId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.scope) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.scope, ['kind', 'scopeId', 'scopeFingerprint']) ||
        typeof value.scope.kind !== 'string' ||
        !SCOPE_KINDS.has(value.scope.kind) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.scope.scopeId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.scope.scopeFingerprint) ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length === 0 ||
        value.coordinates.length > MAX_COORDINATES)
        return false;
    const coordinates = value.coordinates;
    if (!coordinates.every(coordinate => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(coordinate) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(coordinate, [
            'coordinateId',
            'periodRole',
            'period',
            'costBasis',
            'estimateLens',
            'chargeInclusionPolicyRef',
            'currentSpendCompositionId',
            'value',
        ], ['requestedCurrencyCode']) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(coordinate.currentSpendCompositionId) &&
        (0, exports.isFinancialSurfaceCoordinateDefinitionV1)(Object.fromEntries(Object.entries(coordinate).filter(([key]) => key !== 'value' && key !== 'currentSpendCompositionId'))) &&
        (0, exports.isFinancialSurfaceMoneyV1)(coordinate.value, coordinate.requestedCurrencyCode)) ||
        new Set(coordinates.map(coordinate => coordinate.coordinateId)).size !== coordinates.length)
        return false;
    const projection = value;
    const { projectionId: _projectionId, ...identity } = projection;
    return projection.projectionId === (0, exports.createFinancialCurrentSpendSurfaceProjectionIdV1)(identity);
};
exports.isFinancialCurrentSpendSurfaceProjectionV1 = isFinancialCurrentSpendSurfaceProjectionV1;
//# sourceMappingURL=financialCurrentSpendSurfaceProjectionValidation.js.map