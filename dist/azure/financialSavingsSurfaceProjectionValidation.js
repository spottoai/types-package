"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialSavingsSurfaceProjectionV1 = exports.createFinancialSavingsSurfaceProjectionIdV1 = exports.canonicalizeFinancialSavingsSurfaceProjectionIdentityV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialSavingsAuthorityValidationPrimitives_1 = require("./financialSavingsAuthorityValidationPrimitives");
const financialSavingsSurfaceProjection_1 = require("./financialSavingsSurfaceProjection");
const financialScopeBaselineValidation_1 = require("./financialScopeBaselineValidation");
const financialChargeCompositionValidation_1 = require("./financialChargeCompositionValidation");
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
    ...(value.lifecycleBindings === undefined
        ? {}
        : {
            lifecycleBindings: [...value.lifecycleBindings]
                .sort((left, right) => left.resourceId.localeCompare(right.resourceId) || left.recommendationId.localeCompare(right.recommendationId))
                .map(binding => ({ ...binding, allocationIds: [...binding.allocationIds].sort() })),
        }),
    scope: value.scope.kind === 'subscription-full'
        ? value.scope
        : value.scope.kind === 'recommendation-query'
            ? { ...value.scope, recommendationIds: [...value.scope.recommendationIds].sort() }
            : {
                ...value.scope,
                allocationIds: [...value.scope.allocationIds].sort(),
                recommendationIds: [...value.scope.recommendationIds].sort(),
            },
    coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate => coordinate.status === 'unavailable'
        ? coordinate
        : {
            ...coordinate,
            recommendationContributions: [...coordinate.recommendationContributions]
                .sort((left, right) => left.recommendationId.localeCompare(right.recommendationId))
                .map(contribution => ({
                ...contribution,
                allocationIds: [...contribution.allocationIds].sort(),
                ...(contribution.allocations === undefined
                    ? {}
                    : {
                        allocations: [...contribution.allocations].sort((left, right) => left.allocationId.localeCompare(right.allocationId)),
                    }),
            })),
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
    if (value.kind === 'recommendation-query' &&
        (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['kind', 'filterFingerprint', 'recommendationIds']) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.filterFingerprint) &&
        Array.isArray(value.recommendationIds) &&
        value.recommendationIds.length <= MAX_ALLOCATIONS &&
        value.recommendationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) &&
        new Set(value.recommendationIds).size === value.recommendationIds.length)
        return true;
    return (value.kind === 'resource-query' &&
        (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['kind', 'filterFingerprint', 'allocationIds', 'recommendationIds']) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.filterFingerprint) &&
        Array.isArray(value.allocationIds) &&
        value.allocationIds.length <= MAX_ALLOCATIONS &&
        value.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) &&
        new Set(value.allocationIds).size === value.allocationIds.length &&
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
    (0, financialChargeCompositionValidation_1.isFinancialChargeInclusionPolicyRefV1)(value.chargeInclusionPolicyRef) &&
    (value.requestedCurrencyCode === undefined || isCurrency(value.requestedCurrencyCode)) &&
    (value.currentAggregateBaselineId === undefined || (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.currentAggregateBaselineId));
const isLifecycleBinding = (value) => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['resourceId', 'recommendationId', 'allocationIds']) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.resourceId) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.recommendationId) &&
    Array.isArray(value.allocationIds) &&
    value.allocationIds.length > 0 &&
    value.allocationIds.length <= MAX_ALLOCATIONS &&
    value.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) &&
    new Set(value.allocationIds).size === value.allocationIds.length;
const isComposedCoordinate = (value, queryRecommendationIds, queryAllocationIds) => {
    const partial = value.status === 'partial';
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
        'status',
        'coordinateId',
        'periodRole',
        'period',
        'costBasis',
        'estimateLens',
        'chargeInclusionPolicyRef',
        'currentAggregateBaselineId',
        'currentAggregate',
        'accountingCurrencyCode',
        'minorUnitScale',
        'roundingMode',
        'recommendationContributions',
        'aggregate',
        ...(partial ? ['unavailableRecommendationIds'] : []),
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
    if (partial &&
        (!Array.isArray(value.unavailableRecommendationIds) ||
            value.unavailableRecommendationIds.length === 0 ||
            value.unavailableRecommendationIds.length > MAX_ALLOCATIONS ||
            !value.unavailableRecommendationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) ||
            new Set(value.unavailableRecommendationIds).size !== value.unavailableRecommendationIds.length ||
            (queryRecommendationIds !== undefined && value.unavailableRecommendationIds.some(id => !queryRecommendationIds.has(id)))))
        return false;
    const recommendationIds = new Set();
    const allocationIds = [];
    const contributionAmounts = [];
    for (const contribution of value.recommendationContributions) {
        if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(contribution) ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(contribution, ['recommendationId', 'allocationIds', 'savingsMinorUnits'], ['allocations']) ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(contribution.recommendationId) ||
            recommendationIds.has(contribution.recommendationId) ||
            (queryRecommendationIds !== undefined && !queryRecommendationIds.has(contribution.recommendationId)) ||
            !Array.isArray(contribution.allocationIds) ||
            contribution.allocationIds.length === 0 ||
            contribution.allocationIds.length > MAX_ALLOCATIONS ||
            !contribution.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) ||
            new Set(contribution.allocationIds).size !== contribution.allocationIds.length ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsMinorUnits)(contribution.savingsMinorUnits) ||
            (queryAllocationIds !== undefined && !Array.isArray(contribution.allocations)) ||
            (contribution.allocations !== undefined &&
                (!Array.isArray(contribution.allocations) || contribution.allocations.length !== contribution.allocationIds.length)))
            return false;
        const exactAllocations = contribution.allocations;
        if (exactAllocations === undefined) {
            recommendationIds.add(contribution.recommendationId);
            allocationIds.push(...contribution.allocationIds);
            contributionAmounts.push(contribution.savingsMinorUnits);
            continue;
        }
        const exactAllocationIds = [];
        const exactAllocationAmounts = [];
        for (const allocation of exactAllocations) {
            if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(allocation) ||
                !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(allocation, ['allocationId', 'savingsMinorUnits']) ||
                !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(allocation.allocationId) ||
                (queryAllocationIds !== undefined && !queryAllocationIds.has(allocation.allocationId)) ||
                !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsMinorUnits)(allocation.savingsMinorUnits))
                return false;
            exactAllocationIds.push(allocation.allocationId);
            exactAllocationAmounts.push(allocation.savingsMinorUnits);
        }
        if (new Set(exactAllocationIds).size !== exactAllocationIds.length ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(exactAllocationIds, contribution.allocationIds) ||
            (0, financialSavingsAuthorityValidationPrimitives_1.sumFinancialSavingsMinorUnits)(exactAllocationAmounts) !== contribution.savingsMinorUnits)
            return false;
        recommendationIds.add(contribution.recommendationId);
        allocationIds.push(...contribution.allocationIds);
        contributionAmounts.push(contribution.savingsMinorUnits);
    }
    return (new Set(allocationIds).size === allocationIds.length &&
        (0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(allocationIds, value.aggregate.allocationIds) &&
        (0, financialSavingsAuthorityValidationPrimitives_1.sumFinancialSavingsMinorUnits)(contributionAmounts) === value.aggregate.savingsMinorUnits);
};
const isUnavailableCoordinate = (value) => (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['status', 'coordinateId', 'periodRole', 'period', 'costBasis', 'estimateLens', 'chargeInclusionPolicyRef', 'unavailableReason'], ['requestedCurrencyCode', 'currentAggregateBaselineId']) &&
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
        ], ['lifecycleBindings']) ||
        value.schemaVersion !== financialSavingsSurfaceProjection_1.FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialSavingsSurfaceProjection_1.FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1 ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.projectionId) ||
        (value.surface !== 'recommendations' && value.surface !== 'resources' && value.surface !== 'dashboard') ||
        !isScope(value.scope) ||
        (value.surface === 'dashboard' && value.scope.kind !== 'subscription-full') ||
        (value.surface === 'recommendations' && value.scope.kind === 'resource-query') ||
        (value.surface === 'resources' && value.scope.kind === 'recommendation-query') ||
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
        (value.lifecycleBindings !== undefined &&
            (!Array.isArray(value.lifecycleBindings) ||
                value.lifecycleBindings.length === 0 ||
                value.lifecycleBindings.length > MAX_ALLOCATIONS ||
                !value.lifecycleBindings.every(isLifecycleBinding))) ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length === 0 ||
        value.coordinates.length > MAX_COORDINATES)
        return false;
    const projection = value;
    const queryRecommendationIds = projection.scope.kind === 'recommendation-query' || projection.scope.kind === 'resource-query'
        ? new Set(projection.scope.recommendationIds)
        : undefined;
    const queryAllocationIds = projection.scope.kind === 'resource-query' ? new Set(projection.scope.allocationIds) : undefined;
    if (!projection.coordinates.every(coordinate => {
        if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(coordinate))
            return false;
        return coordinate.status === 'available' || coordinate.status === 'partial'
            ? isComposedCoordinate(coordinate, queryRecommendationIds, queryAllocationIds)
            : coordinate.status === 'unavailable' && isUnavailableCoordinate(coordinate);
    }) ||
        new Set(projection.coordinates.map(coordinate => coordinate.coordinateId)).size !== projection.coordinates.length)
        return false;
    if (projection.lifecycleBindings !== undefined) {
        const lifecycleKeys = projection.lifecycleBindings.map(binding => `${binding.resourceId}\u0000${binding.recommendationId}`);
        const boundAllocationIds = projection.lifecycleBindings.flatMap(binding => binding.allocationIds);
        const projectedAllocationOwners = new Map();
        for (const coordinate of projection.coordinates) {
            if (coordinate.status === 'unavailable')
                continue;
            for (const contribution of coordinate.recommendationContributions) {
                for (const allocationId of contribution.allocationIds) {
                    if (projectedAllocationOwners.has(allocationId))
                        return false;
                    projectedAllocationOwners.set(allocationId, contribution.recommendationId);
                }
            }
        }
        if (new Set(lifecycleKeys).size !== lifecycleKeys.length ||
            new Set(boundAllocationIds).size !== boundAllocationIds.length ||
            boundAllocationIds.length !== projectedAllocationOwners.size ||
            projection.lifecycleBindings.some(binding => binding.allocationIds.some(allocationId => projectedAllocationOwners.get(allocationId) !== binding.recommendationId)))
            return false;
    }
    const { projectionId: _projectionId, ...identity } = projection;
    return projection.projectionId === (0, exports.createFinancialSavingsSurfaceProjectionIdV1)(identity);
};
exports.isFinancialSavingsSurfaceProjectionV1 = isFinancialSavingsSurfaceProjectionV1;
//# sourceMappingURL=financialSavingsSurfaceProjectionValidation.js.map