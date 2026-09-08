"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialSavingsResourceProjectionBoundToFinancialProjectionV1 = exports.isFinancialSavingsResourceProjectionV1 = exports.isFinancialSavingsAuthorityBoundToFinancialAuthorityV1 = exports.createFinancialSavingsAuthorityIdV1 = exports.canonicalizeFinancialSavingsAuthorityIdentityV1 = exports.createFinancialSavingsDenominatorIdV1 = exports.createFinancialSavingsAllocationIdV1 = exports.createFinancialSavingsActivationIdV1 = exports.canonicalizeFinancialSavingsDenominatorIdentityV1 = exports.canonicalizeFinancialSavingsAllocationIdentityV1 = exports.canonicalizeFinancialSavingsActivationIdentityV1 = exports.createFinancialEligibilityAssessmentIdV1 = exports.canonicalizeFinancialEligibilityAssessmentIdentityV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialSavingsAuthority_1 = require("./financialSavingsAuthority");
const financialEligibilityAssessmentValidation_1 = require("./financialEligibilityAssessmentValidation");
const financialSavingsCoordinateValidation_1 = require("./financialSavingsCoordinateValidation");
const financialChargeCompositionValidation_1 = require("./financialChargeCompositionValidation");
const financialSavingsAuthorityValidationPrimitives_1 = require("./financialSavingsAuthorityValidationPrimitives");
var financialEligibilityAssessmentValidation_2 = require("./financialEligibilityAssessmentValidation");
Object.defineProperty(exports, "canonicalizeFinancialEligibilityAssessmentIdentityV1", { enumerable: true, get: function () { return financialEligibilityAssessmentValidation_2.canonicalizeFinancialEligibilityAssessmentIdentityV1; } });
Object.defineProperty(exports, "createFinancialEligibilityAssessmentIdV1", { enumerable: true, get: function () { return financialEligibilityAssessmentValidation_2.createFinancialEligibilityAssessmentIdV1; } });
var financialSavingsCoordinateValidation_2 = require("./financialSavingsCoordinateValidation");
Object.defineProperty(exports, "canonicalizeFinancialSavingsActivationIdentityV1", { enumerable: true, get: function () { return financialSavingsCoordinateValidation_2.canonicalizeFinancialSavingsActivationIdentityV1; } });
Object.defineProperty(exports, "canonicalizeFinancialSavingsAllocationIdentityV1", { enumerable: true, get: function () { return financialSavingsCoordinateValidation_2.canonicalizeFinancialSavingsAllocationIdentityV1; } });
Object.defineProperty(exports, "canonicalizeFinancialSavingsDenominatorIdentityV1", { enumerable: true, get: function () { return financialSavingsCoordinateValidation_2.canonicalizeFinancialSavingsDenominatorIdentityV1; } });
Object.defineProperty(exports, "createFinancialSavingsActivationIdV1", { enumerable: true, get: function () { return financialSavingsCoordinateValidation_2.createFinancialSavingsActivationIdV1; } });
Object.defineProperty(exports, "createFinancialSavingsAllocationIdV1", { enumerable: true, get: function () { return financialSavingsCoordinateValidation_2.createFinancialSavingsAllocationIdV1; } });
Object.defineProperty(exports, "createFinancialSavingsDenominatorIdV1", { enumerable: true, get: function () { return financialSavingsCoordinateValidation_2.createFinancialSavingsDenominatorIdV1; } });
const canonicalizeFinancialSavingsAuthorityIdentityV1 = (value) => JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)({
    schemaVersion: value.schemaVersion,
    contractVersion: value.contractVersion,
    financialAuthorityId: value.financialAuthorityId,
    artifactGeneration: value.artifactGeneration,
    eligibilityBaselines: [...value.eligibilityBaselines].sort((left, right) => left.baselineId.localeCompare(right.baselineId)),
    eligibilityAssessments: [...value.eligibilityAssessments].sort((left, right) => left.eligibilityId.localeCompare(right.eligibilityId)),
    coordinates: [...value.coordinates]
        .sort((left, right) => left.coordinateId.localeCompare(right.coordinateId))
        .map(coordinate => coordinate.status === 'unavailable'
        ? coordinate
        : {
            ...coordinate,
            scenarioCoverage: {
                ...coordinate.scenarioCoverage,
                scenarioIds: [...coordinate.scenarioCoverage.scenarioIds].sort(),
            },
            activations: [...coordinate.activations].sort((left, right) => left.activationId.localeCompare(right.activationId)),
            allocations: [...coordinate.allocations]
                .sort((left, right) => left.allocationId.localeCompare(right.allocationId))
                .map(allocation => ({
                ...allocation,
                billableComponentIds: [...allocation.billableComponentIds].sort(),
                eligibility: allocation.eligibility.kind !== 'mapped'
                    ? allocation.eligibility
                    : {
                        ...allocation.eligibility,
                        currentComponentIds: [...allocation.eligibility.currentComponentIds].sort(),
                        eligibilityComponentIds: [...allocation.eligibility.eligibilityComponentIds].sort(),
                    },
            })),
            resourceContributions: [...coordinate.resourceContributions]
                .sort((left, right) => left.ownerScopeId.localeCompare(right.ownerScopeId))
                .map(contribution => ({ ...contribution, allocationIds: [...contribution.allocationIds].sort() })),
            recommendationContributions: [...coordinate.recommendationContributions]
                .sort((left, right) => `${left.ownerScopeId}\u0000${left.recommendationId}`.localeCompare(`${right.ownerScopeId}\u0000${right.recommendationId}`))
                .map(contribution => ({ ...contribution, allocationIds: [...contribution.allocationIds].sort() })),
            aggregate: { ...coordinate.aggregate, allocationIds: [...coordinate.aggregate.allocationIds].sort() },
        }),
}));
exports.canonicalizeFinancialSavingsAuthorityIdentityV1 = canonicalizeFinancialSavingsAuthorityIdentityV1;
const createFinancialSavingsAuthorityIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialSavingsAuthorityIdentityV1)(value))}`;
exports.createFinancialSavingsAuthorityIdV1 = createFinancialSavingsAuthorityIdV1;
const buildEligibilityContext = (authority) => {
    const bundleById = new Map(authority.evidenceBundles.map(bundle => [bundle.bundleId, bundle]));
    const assessmentById = new Map(authority.evidenceAssessments.map(assessment => [assessment.assessmentId, assessment]));
    if (bundleById.size !== authority.evidenceBundles.length || assessmentById.size !== authority.evidenceAssessments.length)
        return undefined;
    const evidenceById = new Map();
    for (const reference of authority.evidenceBundles.flatMap(bundle => bundle.references)) {
        const existing = evidenceById.get(reference.evidenceRefId);
        if (existing &&
            JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)(existing)) !== JSON.stringify((0, financialSavingsAuthorityValidationPrimitives_1.canonicalizeFinancialSavingsJsonValue)(reference)))
            return undefined;
        evidenceById.set(reference.evidenceRefId, reference);
    }
    return { authority, bundleById, assessmentById, evidenceById };
};
const isFinancialSavingsAuthorityBoundToFinancialAuthorityV1 = (value, authority) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
            'schemaVersion',
            'contractVersion',
            'savingsAuthorityId',
            'financialAuthorityId',
            'artifactGeneration',
            'eligibilityBaselines',
            'eligibilityAssessments',
            'coordinates',
        ]) ||
        value.schemaVersion !== financialSavingsAuthority_1.FINANCIAL_SAVINGS_AUTHORITY_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialSavingsAuthority_1.FINANCIAL_SAVINGS_AUTHORITY_CONTRACT_VERSION_V1 ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.savingsAuthorityId) ||
        value.financialAuthorityId !== authority.authorityId ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.artifactGeneration) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.artifactGeneration, ['runId', 'generatedAt']) ||
        value.artifactGeneration.runId !== authority.artifactGeneration.runId ||
        value.artifactGeneration.generatedAt !== authority.artifactGeneration.generatedAt ||
        !Array.isArray(value.eligibilityBaselines) ||
        value.eligibilityBaselines.length > 20000 ||
        !Array.isArray(value.eligibilityAssessments) ||
        value.eligibilityAssessments.length > 20000 ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length !== authority.coordinates.length ||
        value.coordinates.length === 0 ||
        value.coordinates.length > 128)
        return false;
    const context = buildEligibilityContext(authority);
    if (!context)
        return false;
    const savingsAuthority = value;
    if (!savingsAuthority.eligibilityBaselines.every(baseline => (0, financialEligibilityAssessmentValidation_1.validateFinancialEligibilityBaselineV1)(baseline, context)))
        return false;
    const eligibilityBaselineById = new Map(savingsAuthority.eligibilityBaselines.map(baseline => [baseline.baselineId, baseline]));
    if (eligibilityBaselineById.size !== savingsAuthority.eligibilityBaselines.length)
        return false;
    if (!savingsAuthority.eligibilityAssessments.every(assessment => (0, financialEligibilityAssessmentValidation_1.validateFinancialEligibilityAssessmentV1)(assessment, context, eligibilityBaselineById)))
        return false;
    const eligibilityById = new Map(savingsAuthority.eligibilityAssessments.map(assessment => [assessment.eligibilityId, assessment]));
    if (eligibilityById.size !== savingsAuthority.eligibilityAssessments.length)
        return false;
    const authorityCoordinateById = new Map(authority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
    if (new Set(savingsAuthority.coordinates.map(coordinate => coordinate.coordinateId)).size !== savingsAuthority.coordinates.length ||
        !savingsAuthority.coordinates.every(coordinate => {
            const authorityCoordinate = authorityCoordinateById.get(coordinate.coordinateId);
            return (authorityCoordinate !== undefined &&
                (0, financialSavingsCoordinateValidation_1.validateFinancialSavingsCoordinateEnvelopeV1)(coordinate, authorityCoordinate, eligibilityById, context.evidenceById, authority.artifactGeneration.generatedAt, authority.artifactGeneration.runId));
        }))
        return false;
    const { savingsAuthorityId: _savingsAuthorityId, ...identity } = savingsAuthority;
    return savingsAuthority.savingsAuthorityId === (0, exports.createFinancialSavingsAuthorityIdV1)(identity);
};
exports.isFinancialSavingsAuthorityBoundToFinancialAuthorityV1 = isFinancialSavingsAuthorityBoundToFinancialAuthorityV1;
const RESOURCE_PROJECTION_UNAVAILABLE_REASONS = new Set([
    'scenario-coverage-unproven',
    'unmigrated-scenario-producer',
    'projection-unavailable',
    'activation-unavailable',
    'allocation-unavailable',
]);
const RESOURCE_PROJECTION_CURRENCY = /^[A-Z]{3}$/;
const normalizeResourceScope = (value) => value.trim().toLowerCase().replace(/\/+$/, '');
const isResourceContribution = (value, scopeId) => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['ownerScopeId', 'allocationIds', 'savingsMinorUnits']) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.ownerScopeId) &&
    normalizeResourceScope(value.ownerScopeId) === scopeId &&
    Array.isArray(value.allocationIds) &&
    value.allocationIds.length > 0 &&
    value.allocationIds.length <= 20000 &&
    value.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) &&
    new Set(value.allocationIds).size === value.allocationIds.length &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsMinorUnits)(value.savingsMinorUnits);
const isRecommendationContribution = (value, scopeId) => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['ownerScopeId', 'recommendationId', 'allocationIds', 'savingsMinorUnits']) &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.ownerScopeId) &&
    normalizeResourceScope(value.ownerScopeId) === scopeId &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.recommendationId) &&
    Array.isArray(value.allocationIds) &&
    value.allocationIds.length > 0 &&
    value.allocationIds.length <= 20000 &&
    value.allocationIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash) &&
    new Set(value.allocationIds).size === value.allocationIds.length &&
    (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsMinorUnits)(value.savingsMinorUnits);
const isSavingsResourceCoordinate = (value, scopeId) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) || !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.coordinateId))
        return false;
    if (value.status === 'unavailable') {
        return ((0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, ['status', 'coordinateId', 'unavailableReason'], ['currentAggregateBaselineId', 'chargeInclusionPolicyRef']) &&
            (value.currentAggregateBaselineId === undefined || (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.currentAggregateBaselineId)) &&
            (value.chargeInclusionPolicyRef === undefined || (0, financialChargeCompositionValidation_1.isFinancialChargeInclusionPolicyRefV1)(value.chargeInclusionPolicyRef)) &&
            typeof value.unavailableReason === 'string' &&
            RESOURCE_PROJECTION_UNAVAILABLE_REASONS.has(value.unavailableReason));
    }
    const partial = value.status === 'partial';
    if (value.status !== 'available' &&
        !partial)
        return false;
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
        'status',
        'coordinateId',
        'currentAggregateBaselineId',
        'accountingCurrencyCode',
        'minorUnitScale',
        'roundingMode',
        'recommendationContributions',
        ...(partial ? ['unavailableScenarioIds'] : []),
    ], [
        'resourceContribution',
        'chargeInclusionPolicyRef',
        'displayMemberResourceContributions',
        'displayMemberRecommendationContributions',
    ]) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.currentAggregateBaselineId) ||
        (value.chargeInclusionPolicyRef !== undefined && !(0, financialChargeCompositionValidation_1.isFinancialChargeInclusionPolicyRefV1)(value.chargeInclusionPolicyRef)) ||
        typeof value.accountingCurrencyCode !== 'string' ||
        !RESOURCE_PROJECTION_CURRENCY.test(value.accountingCurrencyCode) ||
        !Number.isSafeInteger(value.minorUnitScale) ||
        Number(value.minorUnitScale) < 0 ||
        Number(value.minorUnitScale) > 6 ||
        value.roundingMode !== 'half-away-from-zero' ||
        (value.resourceContribution !== undefined && !isResourceContribution(value.resourceContribution, scopeId)) ||
        !Array.isArray(value.recommendationContributions) ||
        value.recommendationContributions.length > 20000 ||
        !value.recommendationContributions.every(contribution => isRecommendationContribution(contribution, scopeId)) ||
        (value.displayMemberResourceContributions !== undefined &&
            (!Array.isArray(value.displayMemberResourceContributions) ||
                value.displayMemberResourceContributions.length === 0 ||
                value.displayMemberResourceContributions.length > 20000 ||
                !value.displayMemberResourceContributions.every(contribution => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(contribution) &&
                    isResourceContribution(contribution, normalizeResourceScope(String(contribution.ownerScopeId))) &&
                    normalizeResourceScope(String(contribution.ownerScopeId)) !== scopeId))) ||
        (value.displayMemberRecommendationContributions !== undefined &&
            (!Array.isArray(value.displayMemberRecommendationContributions) ||
                value.displayMemberRecommendationContributions.length === 0 ||
                value.displayMemberRecommendationContributions.length > 20000 ||
                !value.displayMemberRecommendationContributions.every(contribution => (0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(contribution) &&
                    isRecommendationContribution(contribution, normalizeResourceScope(String(contribution.ownerScopeId))) &&
                    normalizeResourceScope(String(contribution.ownerScopeId)) !== scopeId))) ||
        (partial &&
            (!Array.isArray(value.unavailableScenarioIds) ||
                value.unavailableScenarioIds.length === 0 ||
                value.unavailableScenarioIds.length > 20000 ||
                !value.unavailableScenarioIds.every(financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity) ||
                new Set(value.unavailableScenarioIds).size !== value.unavailableScenarioIds.length)))
        return false;
    const recommendationIds = value.recommendationContributions.map(contribution => contribution.recommendationId);
    const allocationIds = value.recommendationContributions.flatMap(contribution => contribution.allocationIds);
    const contributionSum = (0, financialSavingsAuthorityValidationPrimitives_1.sumFinancialSavingsMinorUnits)(value.recommendationContributions.map(contribution => contribution.savingsMinorUnits));
    const resourceContribution = value.resourceContribution;
    const primaryValid = new Set(recommendationIds).size === recommendationIds.length &&
        new Set(allocationIds).size === allocationIds.length &&
        contributionSum !== undefined &&
        (resourceContribution === undefined
            ? allocationIds.length === 0 && contributionSum === 0
            : (0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(allocationIds, resourceContribution.allocationIds) &&
                contributionSum === resourceContribution.savingsMinorUnits);
    if (!primaryValid)
        return false;
    const displayResourceContributions = (value.displayMemberResourceContributions ?? []);
    const displayRecommendationContributions = (value.displayMemberRecommendationContributions ?? []);
    const displayResourceByOwner = new Map(displayResourceContributions.map(contribution => [normalizeResourceScope(contribution.ownerScopeId), contribution]));
    if (displayResourceByOwner.size !== displayResourceContributions.length)
        return false;
    const displayRecommendationKeys = displayRecommendationContributions.map(contribution => `${normalizeResourceScope(contribution.ownerScopeId)}\u0000${contribution.recommendationId}`);
    if (new Set(displayRecommendationKeys).size !== displayRecommendationKeys.length)
        return false;
    const displayAllocationIds = displayRecommendationContributions.flatMap(contribution => contribution.allocationIds);
    if (new Set(displayAllocationIds).size !== displayAllocationIds.length ||
        displayAllocationIds.some(allocationId => allocationIds.includes(allocationId)))
        return false;
    for (const [ownerScopeId, contribution] of displayResourceByOwner) {
        const recommendations = displayRecommendationContributions.filter(candidate => normalizeResourceScope(candidate.ownerScopeId) === ownerScopeId);
        const recommendationAllocationIds = recommendations.flatMap(candidate => candidate.allocationIds);
        const recommendationSavings = (0, financialSavingsAuthorityValidationPrimitives_1.sumFinancialSavingsMinorUnits)(recommendations.map(candidate => candidate.savingsMinorUnits));
        if (recommendationSavings === undefined ||
            recommendationSavings !== contribution.savingsMinorUnits ||
            !(0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(recommendationAllocationIds, contribution.allocationIds))
            return false;
    }
    return displayRecommendationContributions.every(contribution => displayResourceByOwner.has(normalizeResourceScope(contribution.ownerScopeId)));
};
/** Strict structural and arithmetic validation for one bounded resource savings projection. */
const isFinancialSavingsResourceProjectionV1 = (value) => {
    if (!(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value, [
            'contractVersion',
            'savingsAuthorityId',
            'financialAuthorityId',
            'artifactGeneration',
            'scopeId',
            'coordinates',
        ]) ||
        value.contractVersion !== 'financial-savings-resource-projection/v1' ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.savingsAuthorityId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsHash)(value.financialAuthorityId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsRecord)(value.artifactGeneration) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.hasExactFinancialSavingsFields)(value.artifactGeneration, ['runId', 'generatedAt']) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.artifactGeneration.runId) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIsoInstant)(value.artifactGeneration.generatedAt) ||
        !(0, financialSavingsAuthorityValidationPrimitives_1.isFinancialSavingsIdentity)(value.scopeId) ||
        value.scopeId !== normalizeResourceScope(value.scopeId) ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length === 0 ||
        value.coordinates.length > 128)
        return false;
    const projection = value;
    return (projection.coordinates.every(coordinate => isSavingsResourceCoordinate(coordinate, projection.scopeId)) &&
        new Set(projection.coordinates.map(coordinate => coordinate.coordinateId)).size === projection.coordinates.length);
};
exports.isFinancialSavingsResourceProjectionV1 = isFinancialSavingsResourceProjectionV1;
/** Verifies that the bounded savings projection is the exact companion of one bounded Financial Authority projection. */
const isFinancialSavingsResourceProjectionBoundToFinancialProjectionV1 = (value, financialProjection) => {
    if (!(0, exports.isFinancialSavingsResourceProjectionV1)(value))
        return false;
    const financialCoordinateIds = financialProjection.coordinates.map(coordinate => coordinate.coordinateId);
    const displayOwnerScopeIdsByCoordinate = new Map(financialProjection.coordinates.map(coordinate => [
        coordinate.coordinateId,
        new Set((coordinate.displayMemberBaselines ?? []).map(baseline => normalizeResourceScope(baseline.scopeId))),
    ]));
    return (value.financialAuthorityId === financialProjection.authorityId &&
        normalizeResourceScope(value.scopeId) === normalizeResourceScope(financialProjection.scopeId) &&
        value.artifactGeneration.runId === financialProjection.artifactGeneration.runId &&
        value.artifactGeneration.generatedAt === financialProjection.artifactGeneration.generatedAt &&
        (0, financialSavingsAuthorityValidationPrimitives_1.haveSameFinancialSavingsSet)(value.coordinates.map(coordinate => coordinate.coordinateId), financialCoordinateIds) &&
        value.coordinates.every(coordinate => {
            if (coordinate.status === 'unavailable')
                return true;
            const allowedDisplayOwners = displayOwnerScopeIdsByCoordinate.get(coordinate.coordinateId);
            if (!allowedDisplayOwners)
                return false;
            return ((coordinate.displayMemberResourceContributions ?? []).every(contribution => allowedDisplayOwners.has(normalizeResourceScope(contribution.ownerScopeId))) &&
                (coordinate.displayMemberRecommendationContributions ?? []).every(contribution => allowedDisplayOwners.has(normalizeResourceScope(contribution.ownerScopeId))));
        }));
};
exports.isFinancialSavingsResourceProjectionBoundToFinancialProjectionV1 = isFinancialSavingsResourceProjectionBoundToFinancialProjectionV1;
//# sourceMappingURL=financialSavingsAuthorityValidation.js.map