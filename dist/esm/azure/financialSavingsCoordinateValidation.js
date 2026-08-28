import { sha256Utf8 } from '../common/sha256.js';
import { canonicalizeFinancialSavingsJsonValue, hasExactFinancialSavingsFields, haveSameFinancialSavingsSet, isFinancialSavingsHash, isFinancialSavingsIdentity, isFinancialSavingsIsoInstant, isFinancialSavingsMinorUnits, isFinancialSavingsRecord, sumFinancialSavingsMinorUnits, } from './financialSavingsAuthorityValidationPrimitives.js';
const CURRENCY = /^[A-Z]{3}$/;
const UNAVAILABLE_REASONS = new Set([
    'scenario-coverage-unproven',
    'unmigrated-scenario-producer',
    'projection-unavailable',
    'activation-unavailable',
    'allocation-unavailable',
]);
const LIFECYCLE_STATES = new Set(['Active', 'Prioritized', 'Dismissed', 'Archived', 'Implementing', 'Implemented', 'Failed', 'Unrecognized']);
const ACTIVATION_REASONS = new Set([
    'active',
    'prioritized',
    'dismissal-expired',
    'implementing',
    'failed',
    'archived',
    'implemented',
    'dismissed-active',
    'lifecycle-stale',
    'lifecycle-unavailable',
    'lifecycle-conflict',
    'unrecognized-lifecycle',
    'generation-mismatch',
    'projection-unavailable',
    'eligibility-unavailable',
]);
const UNAVAILABLE_ACTIVATION_REASONS = new Set([
    'lifecycle-stale',
    'lifecycle-unavailable',
    'lifecycle-conflict',
    'generation-mismatch',
    'projection-unavailable',
    'eligibility-unavailable',
]);
export const canonicalizeFinancialSavingsDenominatorIdentityV1 = (value) => JSON.stringify(canonicalizeFinancialSavingsJsonValue({
    kind: value.kind,
    baselineId: value.baselineId,
    componentIds: [...value.componentIds].sort(),
    amount: value.amount,
    currencyCode: value.currencyCode,
}));
export const createFinancialSavingsDenominatorIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialSavingsDenominatorIdentityV1(value))}`;
export const canonicalizeFinancialSavingsActivationIdentityV1 = (value) => JSON.stringify(canonicalizeFinancialSavingsJsonValue({
    recommendationId: value.recommendationId,
    scenarioId: value.scenarioId,
    ...(value.projectionId === undefined ? {} : { projectionId: value.projectionId }),
    lifecycleState: value.lifecycleState,
    lifecycleVersion: value.lifecycleVersion,
    lifecycleEvidenceRefId: value.lifecycleEvidenceRefId,
    result: value.result,
    reason: value.reason,
    evaluatedAt: value.evaluatedAt,
    policyVersion: value.policyVersion,
}));
export const createFinancialSavingsActivationIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialSavingsActivationIdentityV1(value))}`;
export const canonicalizeFinancialSavingsAllocationIdentityV1 = (value) => JSON.stringify(canonicalizeFinancialSavingsJsonValue({
    ownerScopeId: value.ownerScopeId,
    billableComponentIds: [...value.billableComponentIds].sort(),
    recommendationId: value.recommendationId,
    scenarioId: value.scenarioId,
    baselineId: value.baselineId,
    projectionId: value.projectionId,
    denominatorId: value.denominatorId,
    eligibility: value.eligibility.kind !== 'mapped'
        ? value.eligibility
        : {
            ...value.eligibility,
            currentComponentIds: [...value.eligibility.currentComponentIds].sort(),
            eligibilityComponentIds: [...value.eligibility.eligibilityComponentIds].sort(),
        },
    activationId: value.activationId,
    savingsMinorUnits: value.savingsMinorUnits,
}));
export const createFinancialSavingsAllocationIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialSavingsAllocationIdentityV1(value))}`;
const decimalToMinorUnits = (value, scale) => {
    const match = /^([0-9]+)(?:\.([0-9]+))?$/.exec(value);
    if (!match)
        return undefined;
    const fraction = match[2] ?? '';
    const kept = fraction.slice(0, scale).padEnd(scale, '0');
    const discarded = fraction.slice(scale);
    let units = BigInt(match[1]) * 10n ** BigInt(scale) + BigInt(kept || '0');
    if (discarded[0] !== undefined && discarded[0] >= '5')
        units += 1n;
    return units <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(units) : undefined;
};
const isActivationDecision = (state, result, reason) => {
    if (typeof state !== 'string' || !LIFECYCLE_STATES.has(state) || typeof reason !== 'string' || !ACTIVATION_REASONS.has(reason)) {
        return false;
    }
    if (result === 'included') {
        return ((state === 'Active' && reason === 'active') ||
            (state === 'Prioritized' && reason === 'prioritized') ||
            (state === 'Dismissed' && reason === 'dismissal-expired') ||
            (state === 'Implementing' && reason === 'implementing') ||
            (state === 'Failed' && reason === 'failed'));
    }
    if (result === 'excluded') {
        return ((state === 'Archived' && reason === 'archived') ||
            (state === 'Implemented' && reason === 'implemented') ||
            (state === 'Dismissed' && reason === 'dismissed-active'));
    }
    if (result !== 'unavailable')
        return false;
    if (state === 'Unrecognized')
        return reason === 'unrecognized-lifecycle';
    return UNAVAILABLE_ACTIVATION_REASONS.has(reason);
};
const isEligibility = (value) => {
    if (!isFinancialSavingsRecord(value) || !['not-applicable', 'unavailable', 'mapped'].includes(String(value.kind)))
        return false;
    if (value.kind === 'not-applicable')
        return Object.keys(value).length === 1;
    if (value.kind === 'unavailable') {
        return (Object.keys(value).length === 2 &&
            typeof value.reason === 'string' &&
            [
                'rule-evidence-unavailable',
                'eligibility-baseline-unavailable',
                'eligible-components-unavailable',
                'denominator-unavailable',
                'current-baseline-mapping-unavailable',
                'currency-conflict',
                'reconciliation-failure',
            ].includes(value.reason));
    }
    return (Object.keys(value).length === 5 &&
        isFinancialSavingsHash(value.eligibilityId) &&
        isFinancialSavingsHash(value.eligibilityBaselineId) &&
        Array.isArray(value.currentComponentIds) &&
        value.currentComponentIds.length > 0 &&
        value.currentComponentIds.every(isFinancialSavingsIdentity) &&
        new Set(value.currentComponentIds).size === value.currentComponentIds.length &&
        Array.isArray(value.eligibilityComponentIds) &&
        value.eligibilityComponentIds.length > 0 &&
        value.eligibilityComponentIds.every(isFinancialSavingsIdentity) &&
        new Set(value.eligibilityComponentIds).size === value.eligibilityComponentIds.length);
};
const validateComposedCoordinate = (value, authorityCoordinate, eligibilityById, evidenceById, authorityGeneratedAt, authorityRunId) => {
    if (!hasExactFinancialSavingsFields(value, [
        'status',
        'coordinateId',
        'currentAggregateBaselineId',
        'accountingCurrencyCode',
        'minorUnitScale',
        'roundingMode',
        'scenarioCoverage',
        'activations',
        'allocations',
        'resourceContributions',
        'recommendationContributions',
        'aggregate',
    ]) ||
        !isFinancialSavingsHash(value.currentAggregateBaselineId) ||
        authorityCoordinate.aggregateBaseline.status !== 'available' ||
        value.currentAggregateBaselineId !== authorityCoordinate.aggregateBaseline.baselineId ||
        !CURRENCY.test(value.accountingCurrencyCode) ||
        value.accountingCurrencyCode !== authorityCoordinate.aggregateBaseline.total.currencyCode ||
        !Number.isSafeInteger(value.minorUnitScale) ||
        value.minorUnitScale < 0 ||
        value.minorUnitScale > 6 ||
        value.roundingMode !== 'half-away-from-zero' ||
        !isFinancialSavingsRecord(value.scenarioCoverage) ||
        !hasExactFinancialSavingsFields(value.scenarioCoverage, ['status', 'evidenceRefId', 'scenarioIds']) ||
        value.scenarioCoverage.status !== (value.status === 'available' ? 'complete' : 'partial') ||
        !isFinancialSavingsHash(value.scenarioCoverage.evidenceRefId) ||
        !Array.isArray(value.scenarioCoverage.scenarioIds) ||
        value.scenarioCoverage.scenarioIds.length > 20000 ||
        !value.scenarioCoverage.scenarioIds.every(isFinancialSavingsIdentity) ||
        new Set(value.scenarioCoverage.scenarioIds).size !== value.scenarioCoverage.scenarioIds.length ||
        !Array.isArray(value.activations) ||
        value.activations.length > 20000 ||
        !Array.isArray(value.allocations) ||
        value.allocations.length > 20000 ||
        !Array.isArray(value.resourceContributions) ||
        value.resourceContributions.length > 20000 ||
        !Array.isArray(value.recommendationContributions) ||
        value.recommendationContributions.length > 20000 ||
        !isFinancialSavingsRecord(value.aggregate) ||
        !hasExactFinancialSavingsFields(value.aggregate, ['allocationIds', 'savingsMinorUnits']) ||
        !Array.isArray(value.aggregate.allocationIds) ||
        value.aggregate.allocationIds.length > 20000 ||
        !isFinancialSavingsMinorUnits(value.aggregate.savingsMinorUnits))
        return false;
    const scenarioCoverageEvidence = evidenceById.get(value.scenarioCoverage.evidenceRefId);
    if (scenarioCoverageEvidence?.role !== 'recommendation-scenario-set' ||
        scenarioCoverageEvidence.generationId !== authorityRunId ||
        Date.parse(scenarioCoverageEvidence.intrinsicTime.at) > Date.parse(authorityGeneratedAt))
        return false;
    const projectionById = new Map(authorityCoordinate.projections.flatMap(projection => (projection.status === 'available' ? [[projection.projectionId, projection]] : [])));
    const availableProjectionScenarioIds = new Set(authorityCoordinate.projections.flatMap(projection => (projection.status === 'available' ? [projection.scenarioId] : [])));
    const unavailableEligibilityScenarioIds = new Set([...eligibilityById.values()].flatMap(assessment => (assessment.status === 'unavailable' ? [assessment.scenarioId] : [])));
    const activationById = new Map();
    const activationByScenarioId = new Map();
    for (const activation of value.activations) {
        const lifecycleEvidence = evidenceById.get(activation.lifecycleEvidenceRefId);
        if (!isFinancialSavingsRecord(activation) ||
            !hasExactFinancialSavingsFields(activation, [
                'activationId',
                'scenarioId',
                'recommendationId',
                'lifecycleState',
                'lifecycleVersion',
                'lifecycleEvidenceRefId',
                'result',
                'reason',
                'evaluatedAt',
                'policyVersion',
            ], ['projectionId']) ||
            !isFinancialSavingsHash(activation.activationId) ||
            activationById.has(activation.activationId) ||
            activationByScenarioId.has(activation.scenarioId) ||
            !isFinancialSavingsIdentity(activation.scenarioId) ||
            !isFinancialSavingsIdentity(activation.recommendationId) ||
            (activation.projectionId !== undefined && !isFinancialSavingsHash(activation.projectionId)) ||
            !isFinancialSavingsIdentity(activation.lifecycleVersion) ||
            !isFinancialSavingsHash(activation.lifecycleEvidenceRefId) ||
            !isActivationDecision(activation.lifecycleState, activation.result, activation.reason) ||
            !isFinancialSavingsIsoInstant(activation.evaluatedAt) ||
            Date.parse(activation.evaluatedAt) > Date.parse(authorityGeneratedAt) ||
            !isFinancialSavingsIdentity(activation.policyVersion) ||
            (activation.result === 'included' &&
                (activation.projectionId === undefined || projectionById.get(activation.projectionId)?.scenarioId !== activation.scenarioId)) ||
            (activation.result === 'excluded' &&
                activation.projectionId !== undefined &&
                projectionById.get(activation.projectionId)?.scenarioId !== activation.scenarioId) ||
            (activation.result === 'unavailable' &&
                (activation.projectionId !== undefined ||
                    (activation.reason === 'projection-unavailable' && availableProjectionScenarioIds.has(activation.scenarioId)) ||
                    (activation.reason === 'eligibility-unavailable' &&
                        !unavailableEligibilityScenarioIds.has(activation.scenarioId)))) ||
            lifecycleEvidence?.role !== 'recommendation-lifecycle' ||
            lifecycleEvidence.revisionId !== activation.lifecycleVersion ||
            Date.parse(lifecycleEvidence.intrinsicTime.at) > Date.parse(authorityGeneratedAt))
            return false;
        const { activationId: _activationId, ...activationIdentity } = activation;
        if (activation.activationId !== createFinancialSavingsActivationIdV1(activationIdentity))
            return false;
        activationById.set(activation.activationId, activation);
        activationByScenarioId.set(activation.scenarioId, activation);
    }
    const coveredScenarioIds = new Set(value.scenarioCoverage.scenarioIds);
    const activatedScenarioIds = new Set(value.activations.map(activation => activation.scenarioId));
    if (value.scenarioCoverage.scenarioIds.some(scenarioId => !activatedScenarioIds.has(scenarioId)) ||
        value.activations.some(activation => !coveredScenarioIds.has(activation.scenarioId)))
        return false;
    const hasUnavailableActivation = value.activations.some(activation => activation.result === 'unavailable');
    if ((value.status === 'available' && hasUnavailableActivation) || (value.status === 'partial' && !hasUnavailableActivation))
        return false;
    const allocationById = new Map();
    const allocatedBaselineComponents = new Set();
    for (const allocation of value.allocations) {
        const projection = projectionById.get(allocation.projectionId);
        const activation = activationById.get(allocation.activationId);
        const eligibility = allocation.eligibility.kind === 'mapped' ? eligibilityById.get(allocation.eligibility.eligibilityId) : undefined;
        const expectedDenominatorId = allocation.eligibility.kind === 'mapped' && eligibility?.status === 'available'
            ? eligibility.denominator.denominatorId
            : allocation.eligibility.kind === 'not-applicable' && projection
                ? createFinancialSavingsDenominatorIdV1({
                    kind: 'projection-affected-current',
                    baselineId: projection.baselineId,
                    componentIds: projection.affectedComponentIds,
                    amount: projection.current.affected,
                    currencyCode: projection.accountingCurrencyCode,
                })
                : undefined;
        if (!isFinancialSavingsRecord(allocation) ||
            !hasExactFinancialSavingsFields(allocation, [
                'allocationId',
                'ownerScopeId',
                'billableComponentIds',
                'scenarioId',
                'recommendationId',
                'baselineId',
                'projectionId',
                'denominatorId',
                'eligibility',
                'activationId',
                'savingsMinorUnits',
            ]) ||
            !isFinancialSavingsHash(allocation.allocationId) ||
            allocationById.has(allocation.allocationId) ||
            !isFinancialSavingsIdentity(allocation.ownerScopeId) ||
            !Array.isArray(allocation.billableComponentIds) ||
            allocation.billableComponentIds.length === 0 ||
            allocation.billableComponentIds.length > 20000 ||
            !allocation.billableComponentIds.every(isFinancialSavingsIdentity) ||
            new Set(allocation.billableComponentIds).size !== allocation.billableComponentIds.length ||
            !isFinancialSavingsIdentity(allocation.scenarioId) ||
            !isFinancialSavingsIdentity(allocation.recommendationId) ||
            !isFinancialSavingsHash(allocation.baselineId) ||
            !isFinancialSavingsHash(allocation.projectionId) ||
            !isFinancialSavingsHash(allocation.denominatorId) ||
            allocation.denominatorId !== expectedDenominatorId ||
            !isEligibility(allocation.eligibility) ||
            !isFinancialSavingsHash(allocation.activationId) ||
            !isFinancialSavingsMinorUnits(allocation.savingsMinorUnits) ||
            !projection ||
            projection.scopeId !== allocation.ownerScopeId ||
            projection.baselineId !== allocation.baselineId ||
            !haveSameFinancialSavingsSet(projection.affectedComponentIds, allocation.billableComponentIds) ||
            decimalToMinorUnits(projection.change.savings, value.minorUnitScale) !== allocation.savingsMinorUnits ||
            projection.scenarioId !== allocation.scenarioId ||
            !activation ||
            activation.result !== 'included' ||
            activation.scenarioId !== allocation.scenarioId ||
            activation.recommendationId !== allocation.recommendationId ||
            activation.projectionId !== allocation.projectionId ||
            (allocation.eligibility.kind === 'mapped' &&
                (!eligibility ||
                    eligibility.status !== 'available' ||
                    eligibility.scopeId !== allocation.ownerScopeId ||
                    eligibility.scenarioId !== allocation.scenarioId ||
                    eligibility.eligibilityBaselineId !== allocation.eligibility.eligibilityBaselineId ||
                    eligibility.denominator.denominatorId !== allocation.denominatorId ||
                    eligibility.currentBaselineMapping.currentBaselineId !== allocation.baselineId ||
                    !haveSameFinancialSavingsSet(allocation.eligibility.currentComponentIds, allocation.billableComponentIds) ||
                    !haveSameFinancialSavingsSet(allocation.eligibility.currentComponentIds, eligibility.currentBaselineMapping.mappings.map(mapping => mapping.currentComponentId)) ||
                    !haveSameFinancialSavingsSet(allocation.eligibility.eligibilityComponentIds, eligibility.eligibleComponentIds))))
            return false;
        const { allocationId: _allocationId, ...allocationIdentity } = allocation;
        if (allocation.allocationId !== createFinancialSavingsAllocationIdV1(allocationIdentity))
            return false;
        for (const componentId of allocation.billableComponentIds) {
            const componentKey = `${allocation.baselineId}\u0000${componentId}`;
            if (allocatedBaselineComponents.has(componentKey))
                return false;
            allocatedBaselineComponents.add(componentKey);
        }
        allocationById.set(allocation.allocationId, allocation);
    }
    const contributedAllocationIds = [];
    const ownerScopeIds = new Set();
    for (const contribution of value.resourceContributions) {
        if (!isFinancialSavingsRecord(contribution) ||
            !hasExactFinancialSavingsFields(contribution, ['ownerScopeId', 'allocationIds', 'savingsMinorUnits']) ||
            !isFinancialSavingsIdentity(contribution.ownerScopeId) ||
            ownerScopeIds.has(contribution.ownerScopeId) ||
            !Array.isArray(contribution.allocationIds) ||
            contribution.allocationIds.length === 0 ||
            contribution.allocationIds.length > 20000 ||
            !contribution.allocationIds.every(isFinancialSavingsHash) ||
            new Set(contribution.allocationIds).size !== contribution.allocationIds.length ||
            !isFinancialSavingsMinorUnits(contribution.savingsMinorUnits))
            return false;
        const allocations = contribution.allocationIds.map(id => allocationById.get(id));
        if (allocations.some(allocation => !allocation || allocation.ownerScopeId !== contribution.ownerScopeId) ||
            sumFinancialSavingsMinorUnits(allocations.map(allocation => allocation.savingsMinorUnits)) !== contribution.savingsMinorUnits)
            return false;
        ownerScopeIds.add(contribution.ownerScopeId);
        contributedAllocationIds.push(...contribution.allocationIds);
    }
    const allocationIds = [...allocationById.keys()];
    const recommendationContributionAllocationIds = [];
    const recommendationContributionKeys = new Set();
    for (const contribution of value.recommendationContributions) {
        if (!isFinancialSavingsRecord(contribution) ||
            !hasExactFinancialSavingsFields(contribution, [
                'ownerScopeId',
                'recommendationId',
                'allocationIds',
                'savingsMinorUnits',
            ]) ||
            !isFinancialSavingsIdentity(contribution.ownerScopeId) ||
            !isFinancialSavingsIdentity(contribution.recommendationId) ||
            !Array.isArray(contribution.allocationIds) ||
            contribution.allocationIds.length === 0 ||
            contribution.allocationIds.length > 20000 ||
            !contribution.allocationIds.every(isFinancialSavingsHash) ||
            new Set(contribution.allocationIds).size !== contribution.allocationIds.length ||
            !isFinancialSavingsMinorUnits(contribution.savingsMinorUnits))
            return false;
        const contributionKey = `${contribution.ownerScopeId}\u0000${contribution.recommendationId}`;
        if (recommendationContributionKeys.has(contributionKey))
            return false;
        const allocations = contribution.allocationIds.map(id => allocationById.get(id));
        if (allocations.some(allocation => !allocation ||
            allocation.ownerScopeId !== contribution.ownerScopeId ||
            allocation.recommendationId !== contribution.recommendationId) ||
            sumFinancialSavingsMinorUnits(allocations.map(allocation => allocation.savingsMinorUnits)) !== contribution.savingsMinorUnits)
            return false;
        recommendationContributionKeys.add(contributionKey);
        recommendationContributionAllocationIds.push(...contribution.allocationIds);
    }
    return (haveSameFinancialSavingsSet(contributedAllocationIds, allocationIds) &&
        new Set(contributedAllocationIds).size === contributedAllocationIds.length &&
        haveSameFinancialSavingsSet(recommendationContributionAllocationIds, allocationIds) &&
        new Set(recommendationContributionAllocationIds).size === recommendationContributionAllocationIds.length &&
        haveSameFinancialSavingsSet(value.aggregate.allocationIds, allocationIds) &&
        new Set(value.aggregate.allocationIds).size === value.aggregate.allocationIds.length &&
        value.aggregate.savingsMinorUnits === sumFinancialSavingsMinorUnits(value.allocations.map(allocation => allocation.savingsMinorUnits)));
};
export const validateFinancialSavingsCoordinateEnvelopeV1 = (value, authorityCoordinate, eligibilityById, evidenceById, authorityGeneratedAt, authorityRunId) => {
    if (!isFinancialSavingsRecord(value) || value.coordinateId !== authorityCoordinate.coordinateId)
        return false;
    if (value.status === 'unavailable') {
        return (hasExactFinancialSavingsFields(value, ['status', 'coordinateId', 'unavailableReason'], ['currentAggregateBaselineId']) &&
            typeof value.unavailableReason === 'string' &&
            UNAVAILABLE_REASONS.has(value.unavailableReason) &&
            (authorityCoordinate.aggregateBaseline.status === 'available'
                ? value.currentAggregateBaselineId === authorityCoordinate.aggregateBaseline.baselineId
                : value.currentAggregateBaselineId === undefined));
    }
    return ((value.status === 'available' || value.status === 'partial') &&
        validateComposedCoordinate(value, authorityCoordinate, eligibilityById, evidenceById, authorityGeneratedAt, authorityRunId));
};
