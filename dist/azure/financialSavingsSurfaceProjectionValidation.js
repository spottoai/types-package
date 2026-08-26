"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialSavingsSurfaceProjectionV1 = exports.createFinancialSavingsSurfaceProjectionIdV1 = exports.canonicalizeFinancialSavingsSurfaceProjectionIdentityV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialSavingsAuthorityValidationPrimitives_1 = require("./financialSavingsAuthorityValidationPrimitives");
const financialSavingsSurfaceProjection_1 = require("./financialSavingsSurfaceProjection");
const financialScopeBaselineValidation_1 = require("./financialScopeBaselineValidation");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const UNAVAILABLE_REASONS = new Set([
    'scenario-coverage-unproven',
    'unmigrated-scenario-producer',
    'projection-unavailable',
    'activation-unavailable',
    'allocation-unavailable',
]);
const CURRENCY = /^[A-Z]{3}$/;
const MAX_COORDINATES = 128;
const MAX_ALLOCATIONS = 20000;
const canonicalizeFinancialSavingsSurfaceProjectionIdentityV1 = (value) => JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)({
    ...value,
    providerAccountRefs: [...value.providerAccountRefs].sort(),
    scope: value.scope.kind === 'subscription-full' ? value.scope : { ...value.scope, recommendationIds: [...value.scope.recommendationIds].sort() },
    coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate => coordinate.status === 'unavailable'
        ? coordinate
        : {
            ...coordinate,
            recommendationContributions: [...coordinate.recommendationContributions]
                .sort((left, right) => left.recommendationId.localeCompare(right.recommendationId))
                .map(contribution => ({ ...contribution, allocationIds: [...contribution.allocationIds].sort() })),
            aggregate: { ...coordinate.aggregate, allocationIds: [...coordinate.aggregate.allocationIds].sort() },
        }),
}));
exports.canonicalizeFinancialSavingsSurfaceProjectionIdentityV1 = canonicalizeFinancialSavingsSurfaceProjectionIdentityV1;
const createFinancialSavingsSurfaceProjectionIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialSavingsSurfaceProjectionIdentityV1)(value))}`;
exports.createFinancialSavingsSurfaceProjectionIdV1 = createFinancialSavingsSurfaceProjectionIdV1;
const isCurrency = (value) => typeof value === 'string' && CURRENCY.test(value);
const isScope = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value))
        return false;
    if (value.kind === 'subscription-full')
        return (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['kind']);
    return (value.kind === 'recommendation-query' &&
        (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['kind', 'filterFingerprint', 'recommendationIds']) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.filterFingerprint) &&
        Array.isArray(value.recommendationIds) &&
        value.recommendationIds.length <= MAX_ALLOCATIONS &&
        value.recommendationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) &&
        new Set(value.recommendationIds).size === value.recommendationIds.length);
};
const isCoordinateCommon = (value) => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.coordinateId) &&
    (value.periodRole === 'current' || value.periodRole === 'previous') &&
    (0, financialScopeBaselineValidation_1.isFinancialBaselinePeriodV2)(value.period) &&
    typeof value.costBasis === 'string' &&
    COST_BASES.has(value.costBasis) &&
    typeof value.estimateLens === 'string' &&
    ESTIMATE_LENSES.has(value.estimateLens) &&
    (value.requestedCurrencyCode === undefined || isCurrency(value.requestedCurrencyCode)) &&
    (value.currentAggregateBaselineId === undefined || (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.currentAggregateBaselineId));
const isAvailableCoordinate = (value, queryRecommendationIds) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
        'status',
        'coordinateId',
        'periodRole',
        'period',
        'costBasis',
        'estimateLens',
        'currentAggregateBaselineId',
        'currentAggregate',
        'accountingCurrencyCode',
        'minorUnitScale',
        'roundingMode',
        'recommendationContributions',
        'aggregate',
    ], ['requestedCurrencyCode']) ||
        !isCoordinateCommon(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.currentAggregateBaselineId) ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)(value.currentAggregate) ||
        !isCurrency(value.accountingCurrencyCode) ||
        value.currentAggregate.currencyCode !== value.accountingCurrencyCode ||
        !Number.isSafeInteger(value.minorUnitScale) ||
        Number(value.minorUnitScale) < 0 ||
        Number(value.minorUnitScale) > 6 ||
        value.roundingMode !== 'half-away-from-zero' ||
        !Array.isArray(value.recommendationContributions) ||
        value.recommendationContributions.length > MAX_ALLOCATIONS ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.aggregate) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.aggregate, ['allocationIds', 'savingsMinorUnits']) ||
        !Array.isArray(value.aggregate.allocationIds) ||
        value.aggregate.allocationIds.length > MAX_ALLOCATIONS ||
        !value.aggregate.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
        new Set(value.aggregate.allocationIds).size !== value.aggregate.allocationIds.length ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsMinorUnits)(value.aggregate.savingsMinorUnits))
        return false;
    const recommendationIds = new Set();
    const allocationIds = [];
    const contributionAmounts = [];
    for (const contribution of value.recommendationContributions) {
        if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(contribution) ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(contribution, ['recommendationId', 'allocationIds', 'savingsMinorUnits']) ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(contribution.recommendationId) ||
            recommendationIds.has(contribution.recommendationId) ||
            (queryRecommendationIds !== undefined && !queryRecommendationIds.has(contribution.recommendationId)) ||
            !Array.isArray(contribution.allocationIds) ||
            contribution.allocationIds.length === 0 ||
            contribution.allocationIds.length > MAX_ALLOCATIONS ||
            !contribution.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
            new Set(contribution.allocationIds).size !== contribution.allocationIds.length ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsMinorUnits)(contribution.savingsMinorUnits))
            return false;
        recommendationIds.add(contribution.recommendationId);
        allocationIds.push(...contribution.allocationIds);
        contributionAmounts.push(contribution.savingsMinorUnits);
    }
    return (new Set(allocationIds).size === allocationIds.length &&
        (0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(allocationIds, value.aggregate.allocationIds) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.sumFinancialSavingsMinorUnits)(contributionAmounts) === value.aggregate.savingsMinorUnits);
};
const isUnavailableCoordinate = (value) => (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['status', 'coordinateId', 'periodRole', 'period', 'costBasis', 'estimateLens', 'unavailableReason'], ['requestedCurrencyCode', 'currentAggregateBaselineId']) &&
    isCoordinateCommon(value) &&
    typeof value.unavailableReason === 'string' &&
    UNAVAILABLE_REASONS.has(value.unavailableReason);
const isFinancialSavingsSurfaceProjectionV1 = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
            'schemaVersion',
            'contractVersion',
            'projectionId',
            'surface',
            'scope',
            'provider',
            'providerAccountRefs',
            'artifactGeneration',
            'financialAuthorityId',
            'savingsAuthorityId',
            'coordinates',
        ]) ||
        value.schemaVersion !== financialSavingsSurfaceProjection_1.FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialSavingsSurfaceProjection_1.FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1 ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.projectionId) ||
        (value.surface !== 'recommendations' && value.surface !== 'dashboard') ||
        !isScope(value.scope) ||
        (value.surface === 'dashboard' && value.scope.kind !== 'subscription-full') ||
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
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.savingsAuthorityId) ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length === 0 ||
        value.coordinates.length > MAX_COORDINATES)
        return false;
    const projection = value;
    const queryRecommendationIds = projection.scope.kind === 'recommendation-query' ? new Set(projection.scope.recommendationIds) : undefined;
    if (!projection.coordinates.every(coordinate => {
        if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(coordinate))
            return false;
        return coordinate.status === 'available'
            ? isAvailableCoordinate(coordinate, queryRecommendationIds)
            : coordinate.status === 'unavailable' && isUnavailableCoordinate(coordinate);
    }) ||
        new Set(projection.coordinates.map(coordinate => coordinate.coordinateId)).size !== projection.coordinates.length)
        return false;
    const { projectionId: _projectionId, ...identity } = projection;
    return projection.projectionId === (0, exports.createFinancialSavingsSurfaceProjectionIdV1)(identity);
};
exports.isFinancialSavingsSurfaceProjectionV1 = isFinancialSavingsSurfaceProjectionV1;
//# sourceMappingURL=financialSavingsSurfaceProjectionValidation.js.map