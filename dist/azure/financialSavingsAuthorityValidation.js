"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialSavingsAuthorityBoundToFinancialAuthorityV1 = exports.createFinancialSavingsAuthorityIdV1 = exports.canonicalizeFinancialSavingsAuthorityIdentityV1 = exports.createFinancialSavingsDenominatorIdV1 = exports.createFinancialSavingsAllocationIdV1 = exports.createFinancialSavingsActivationIdV1 = exports.canonicalizeFinancialSavingsDenominatorIdentityV1 = exports.canonicalizeFinancialSavingsAllocationIdentityV1 = exports.canonicalizeFinancialSavingsActivationIdentityV1 = exports.createFinancialEligibilityAssessmentIdV1 = exports.canonicalizeFinancialEligibilityAssessmentIdentityV1 = void 0;
const sha256_1 = require("../common/sha256");
const financialSavingsAuthority_1 = require("./financialSavingsAuthority");
const financialEligibilityAssessmentValidation_1 = require("./financialEligibilityAssessmentValidation");
const financialSavingsCoordinateValidation_1 = require("./financialSavingsCoordinateValidation");
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
                eligibility: allocation.eligibility.kind === 'not-applicable'
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
//# sourceMappingURL=financialSavingsAuthorityValidation.js.map