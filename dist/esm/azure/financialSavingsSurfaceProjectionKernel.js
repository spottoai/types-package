import { AZURE_BILLED_ALL_CHARGES_POLICY_V1, resolveFinancialChargeInclusionPolicyV1, } from './financialChargeComposition.js';
import { selectFinancialChargesV1 } from './financialChargeCompositionValidation.js';
import { formatExactDecimalValue, sumCanonicalDecimals } from '../common/exactDecimal.js';
import { classifyFinancialSavingsAllocationForPolicyV1 } from './financialSavingsChargePolicyKernel.js';
import { FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1, FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1, } from './financialSavingsSurfaceProjection.js';
import { createFinancialSavingsSurfaceProjectionIdV1, isFinancialSavingsSurfaceProjectionV1, } from './financialSavingsSurfaceProjectionValidation.js';
export class FinancialSavingsSurfaceProjectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FinancialSavingsSurfaceProjectionError';
    }
}
const sameGeneration = (left, right) => Boolean(left && right && left.runId === right.runId && left.generatedAt === right.generatedAt);
const exactMinorUnitSum = (values) => {
    const sum = values.reduce((total, value) => total + BigInt(value), 0n);
    if (sum > BigInt(Number.MAX_SAFE_INTEGER) || sum < BigInt(Number.MIN_SAFE_INTEGER)) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings surface contribution exceeds the safe integer boundary');
    }
    return Number(sum);
};
const samePolicy = (left, right) => left.policyId === right.policyId && left.policyDigest === right.policyDigest;
const selectAggregateForPolicy = (financialCoordinate, policyRef, chargeCompositionByBaselineId) => {
    if (financialCoordinate.aggregateBaseline.status !== 'available')
        return undefined;
    if (samePolicy(policyRef, AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef)) {
        return financialCoordinate.aggregateBaseline.total.amount;
    }
    if (financialCoordinate.aggregateBaseline.baselineKind !== 'aggregate')
        return undefined;
    const memberIds = new Set(financialCoordinate.aggregateBaseline.memberBaselineIds);
    const compositions = [...memberIds]
        .map(memberId => chargeCompositionByBaselineId.get(memberId))
        .filter((composition) => composition !== undefined);
    if (compositions.length !== memberIds.size)
        return undefined;
    const selections = compositions.map(composition => selectFinancialChargesV1(composition, policyRef));
    if (selections.some(selection => selection.status !== 'available'))
        return undefined;
    return formatExactDecimalValue(sumCanonicalDecimals(selections.map(selection => selection.includedAmount)));
};
const projectLifecycleBindings = (allocations) => {
    const byLifecycleIdentity = new Map();
    for (const allocation of allocations) {
        const key = `${allocation.ownerScopeId}\u0000${allocation.recommendationId}`;
        const existing = byLifecycleIdentity.get(key);
        if (existing) {
            existing.allocationIds.push(allocation.allocationId);
            continue;
        }
        byLifecycleIdentity.set(key, {
            resourceId: allocation.ownerScopeId,
            recommendationId: allocation.recommendationId,
            allocationIds: [allocation.allocationId],
        });
    }
    return [...byLifecycleIdentity.values()]
        .map(binding => ({ ...binding, allocationIds: [...binding.allocationIds].sort() }))
        .sort((left, right) => left.resourceId.localeCompare(right.resourceId) || left.recommendationId.localeCompare(right.recommendationId));
};
export const projectFinancialSavingsSurfaceQueryV1 = (source, recommendationIds, filterFingerprint) => {
    if (!isFinancialSavingsSurfaceProjectionV1(source) || source.surface !== 'recommendations') {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings source projection is invalid for recommendation filtering');
    }
    const uniqueRecommendationIds = [...new Set(recommendationIds)];
    if (uniqueRecommendationIds.length !== recommendationIds.length ||
        uniqueRecommendationIds.some(id => !id.trim()) ||
        !filterFingerprint.trim()) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings query identity is invalid');
    }
    const scope = {
        kind: 'recommendation-query',
        filterFingerprint,
        recommendationIds: uniqueRecommendationIds,
    };
    const includedRecommendationIds = new Set(uniqueRecommendationIds);
    const lifecycleBindings = source.lifecycleBindings
        ?.filter(binding => includedRecommendationIds.has(binding.recommendationId))
        .map(binding => ({ ...binding, allocationIds: [...binding.allocationIds] }));
    const coordinates = source.coordinates.map((coordinate) => {
        if (coordinate.status === 'unavailable')
            return coordinate;
        const recommendationContributions = coordinate.recommendationContributions.filter(contribution => includedRecommendationIds.has(contribution.recommendationId));
        const filteredAmounts = {
            recommendationContributions,
            aggregate: {
                allocationIds: recommendationContributions.flatMap(contribution => contribution.allocationIds),
                savingsMinorUnits: exactMinorUnitSum(recommendationContributions.map(contribution => contribution.savingsMinorUnits)),
            },
        };
        if (coordinate.status === 'available')
            return { ...coordinate, ...filteredAmounts };
        const { unavailableRecommendationIds: _sourceUnavailableRecommendationIds, ...common } = coordinate;
        void _sourceUnavailableRecommendationIds;
        const unavailableRecommendationIds = coordinate.unavailableRecommendationIds.filter(recommendationId => includedRecommendationIds.has(recommendationId));
        return unavailableRecommendationIds.length > 0
            ? {
                ...common,
                ...filteredAmounts,
                status: 'partial',
                unavailableRecommendationIds: unavailableRecommendationIds,
            }
            : { ...common, ...filteredAmounts, status: 'available' };
    });
    const identity = {
        schemaVersion: source.schemaVersion,
        contractVersion: source.contractVersion,
        surface: source.surface,
        scope,
        provider: source.provider,
        providerAccountRefs: source.providerAccountRefs,
        artifactGeneration: source.artifactGeneration,
        financialAuthorityId: source.financialAuthorityId,
        savingsAuthorityId: source.savingsAuthorityId,
        ...(lifecycleBindings?.length ? { lifecycleBindings: lifecycleBindings } : {}),
        coordinates,
    };
    const projection = {
        ...identity,
        projectionId: createFinancialSavingsSurfaceProjectionIdV1(identity),
    };
    if (!isFinancialSavingsSurfaceProjectionV1(projection)) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings query projection failed validation');
    }
    return projection;
};
const projectRecommendationContributions = (allocations) => {
    const byRecommendation = new Map();
    for (const allocation of allocations) {
        const existing = byRecommendation.get(allocation.recommendationId) ?? {
            allocationIds: [],
            savingsMinorUnits: [],
            allocations: [],
        };
        existing.allocationIds.push(allocation.allocationId);
        existing.savingsMinorUnits.push(allocation.savingsMinorUnits);
        existing.allocations.push({ allocationId: allocation.allocationId, savingsMinorUnits: allocation.savingsMinorUnits });
        byRecommendation.set(allocation.recommendationId, existing);
    }
    return Array.from(byRecommendation.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([recommendationId, contribution]) => ({
        recommendationId,
        allocationIds: [...contribution.allocationIds].sort(),
        savingsMinorUnits: exactMinorUnitSum(contribution.savingsMinorUnits),
        allocations: contribution.allocations
            .sort((left, right) => left.allocationId.localeCompare(right.allocationId)),
    }));
};
export const projectFinancialSavingsSurfaceResourceQueryV1 = (source, allocationIds, recommendationIds, filterFingerprint) => {
    if (!isFinancialSavingsSurfaceProjectionV1(source) || source.surface !== 'resources') {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings source projection is invalid for resource filtering');
    }
    const uniqueAllocationIds = [...new Set(allocationIds)];
    const uniqueRecommendationIds = [...new Set(recommendationIds)];
    if (uniqueAllocationIds.length !== allocationIds.length ||
        uniqueRecommendationIds.length !== recommendationIds.length ||
        uniqueAllocationIds.some(id => !id.trim()) ||
        uniqueRecommendationIds.some(id => !id.trim()) ||
        !filterFingerprint.trim()) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings resource query identity is invalid');
    }
    const includedAllocationIds = new Set(uniqueAllocationIds);
    const includedRecommendationIds = new Set(uniqueRecommendationIds);
    const lifecycleBindings = source.lifecycleBindings
        ?.map(binding => {
        const filteredAllocationIds = binding.allocationIds.filter(allocationId => includedAllocationIds.has(allocationId));
        return filteredAllocationIds.length
            ? {
                ...binding,
                allocationIds: filteredAllocationIds,
            }
            : undefined;
    })
        .filter((binding) => binding !== undefined);
    const scope = {
        kind: 'resource-query',
        filterFingerprint,
        allocationIds: uniqueAllocationIds,
        recommendationIds: uniqueRecommendationIds,
    };
    const coordinates = source.coordinates.map((coordinate) => {
        if (coordinate.status === 'unavailable')
            return coordinate;
        const recommendationContributions = coordinate.recommendationContributions
            .map(contribution => {
            if (contribution.allocations === undefined) {
                throw new FinancialSavingsSurfaceProjectionError('Financial savings resource query requires exact allocation contribution evidence');
            }
            const allocations = contribution.allocations.filter(allocation => includedAllocationIds.has(allocation.allocationId));
            if (allocations.length === 0)
                return undefined;
            return {
                recommendationId: contribution.recommendationId,
                allocationIds: allocations.map(allocation => allocation.allocationId),
                allocations: allocations,
                savingsMinorUnits: exactMinorUnitSum(allocations.map(allocation => allocation.savingsMinorUnits)),
            };
        })
            .filter((contribution) => contribution !== undefined);
        const filteredAmounts = {
            recommendationContributions,
            aggregate: {
                allocationIds: recommendationContributions.flatMap(contribution => contribution.allocationIds),
                savingsMinorUnits: exactMinorUnitSum(recommendationContributions.map(contribution => contribution.savingsMinorUnits)),
            },
        };
        if (coordinate.status === 'available')
            return { ...coordinate, ...filteredAmounts };
        const { unavailableRecommendationIds: _sourceUnavailableRecommendationIds, ...common } = coordinate;
        void _sourceUnavailableRecommendationIds;
        const unavailableRecommendationIds = coordinate.unavailableRecommendationIds.filter(id => includedRecommendationIds.has(id));
        return unavailableRecommendationIds.length > 0
            ? {
                ...common,
                ...filteredAmounts,
                status: 'partial',
                unavailableRecommendationIds: unavailableRecommendationIds,
            }
            : { ...common, ...filteredAmounts, status: 'available' };
    });
    const identity = {
        schemaVersion: source.schemaVersion,
        contractVersion: source.contractVersion,
        surface: source.surface,
        scope,
        provider: source.provider,
        providerAccountRefs: source.providerAccountRefs,
        artifactGeneration: source.artifactGeneration,
        financialAuthorityId: source.financialAuthorityId,
        savingsAuthorityId: source.savingsAuthorityId,
        ...(lifecycleBindings?.length ? { lifecycleBindings: lifecycleBindings } : {}),
        coordinates,
    };
    const projection = { ...identity, projectionId: createFinancialSavingsSurfaceProjectionIdV1(identity) };
    if (!isFinancialSavingsSurfaceProjectionV1(projection)) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings resource query projection failed validation');
    }
    return projection;
};
/**
 * Projects a validated Resources authority into a compact, immutable surface.
 * It partitions canonical allocation amounts for display and never recalculates
 * scenario economics from legacy recommendation or resource fields.
 */
export const buildFinancialSavingsSurfaceProjectionV1 = (resourcesView, surface, chargeInclusionPolicyRef = AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef) => {
    const authority = resourcesView.financialAuthority;
    const savingsAuthority = resourcesView.financialSavingsAuthority;
    if (authority.authorityId !== savingsAuthority.financialAuthorityId ||
        !sameGeneration(resourcesView.artifactGeneration, authority.artifactGeneration) ||
        !sameGeneration(authority.artifactGeneration, savingsAuthority.artifactGeneration)) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings authority generation or identity binding is invalid');
    }
    if (!resolveFinancialChargeInclusionPolicyV1(chargeInclusionPolicyRef)) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings charge-inclusion policy is not registered');
    }
    const financialCoordinateById = new Map(authority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
    const savingsCoordinateById = new Map(savingsAuthority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
    if (financialCoordinateById.size !== authority.coordinates.length ||
        savingsCoordinateById.size !== savingsAuthority.coordinates.length ||
        financialCoordinateById.size !== savingsCoordinateById.size ||
        Array.from(financialCoordinateById.keys()).some(coordinateId => !savingsCoordinateById.has(coordinateId))) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings coordinates are not one-to-one with financial authority coordinates');
    }
    const projectedAllocations = [];
    const coordinates = authority.coordinates.map((financialCoordinate) => {
        const savingsCoordinate = savingsCoordinateById.get(financialCoordinate.coordinateId);
        if (!savingsCoordinate) {
            throw new FinancialSavingsSurfaceProjectionError(`Financial savings coordinate ${financialCoordinate.coordinateId} is missing`);
        }
        const common = {
            coordinateId: financialCoordinate.coordinateId,
            periodRole: financialCoordinate.periodRole,
            period: financialCoordinate.period,
            costBasis: financialCoordinate.costBasis,
            estimateLens: financialCoordinate.estimateLens,
            chargeInclusionPolicyRef,
            ...(financialCoordinate.requestedCurrencyCode === undefined
                ? {}
                : { requestedCurrencyCode: financialCoordinate.requestedCurrencyCode }),
            ...(savingsCoordinate.currentAggregateBaselineId === undefined
                ? {}
                : { currentAggregateBaselineId: savingsCoordinate.currentAggregateBaselineId }),
        };
        if (savingsCoordinate.status === 'unavailable') {
            return { ...common, status: 'unavailable', unavailableReason: savingsCoordinate.unavailableReason };
        }
        const currentAggregate = financialCoordinate.aggregateBaseline;
        const chargeCompositions = financialCoordinate.chargeCompositions ?? [];
        const chargeCompositionByBaselineId = new Map(chargeCompositions.map(composition => [composition.baselineId, composition]));
        const selectedCurrentAggregate = chargeCompositionByBaselineId.size === chargeCompositions.length
            ? selectAggregateForPolicy(financialCoordinate, chargeInclusionPolicyRef, chargeCompositionByBaselineId)
            : undefined;
        if (currentAggregate.status !== 'available' ||
            currentAggregate.baselineId !== savingsCoordinate.currentAggregateBaselineId ||
            currentAggregate.total.currencyCode !== savingsCoordinate.accountingCurrencyCode ||
            selectedCurrentAggregate === undefined) {
            return { ...common, status: 'unavailable', unavailableReason: 'allocation-unavailable' };
        }
        const sourceUnavailableRecommendationIds = savingsCoordinate.status === 'partial'
            ? Array.from(new Set(savingsCoordinate.activations
                .filter(activation => activation.result === 'unavailable')
                .map(activation => activation.recommendationId))).sort()
            : [];
        const policyUnavailableRecommendationIds = new Set();
        const selectedAllocations = samePolicy(chargeInclusionPolicyRef, AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef)
            ? savingsCoordinate.allocations
            : savingsCoordinate.allocations.filter(allocation => {
                const disposition = classifyFinancialSavingsAllocationForPolicyV1(chargeCompositionByBaselineId, allocation, chargeInclusionPolicyRef);
                if (disposition === 'unavailable')
                    policyUnavailableRecommendationIds.add(allocation.recommendationId);
                return disposition === 'included';
            });
        projectedAllocations.push(...selectedAllocations);
        const unavailableRecommendationIds = [
            ...new Set([...sourceUnavailableRecommendationIds, ...policyUnavailableRecommendationIds]),
        ].sort();
        const recommendationContributions = projectRecommendationContributions(selectedAllocations);
        const composed = {
            ...common,
            currentAggregateBaselineId: savingsCoordinate.currentAggregateBaselineId,
            currentAggregate: { amount: selectedCurrentAggregate, currencyCode: currentAggregate.total.currencyCode },
            accountingCurrencyCode: savingsCoordinate.accountingCurrencyCode,
            minorUnitScale: savingsCoordinate.minorUnitScale,
            roundingMode: savingsCoordinate.roundingMode,
            recommendationContributions,
            aggregate: {
                allocationIds: recommendationContributions.flatMap(contribution => contribution.allocationIds),
                savingsMinorUnits: exactMinorUnitSum(recommendationContributions.map(contribution => contribution.savingsMinorUnits)),
            },
        };
        return unavailableRecommendationIds.length > 0
            ? {
                ...composed,
                status: 'partial',
                unavailableRecommendationIds: unavailableRecommendationIds,
            }
            : { ...composed, status: 'available' };
    });
    const lifecycleBindings = projectLifecycleBindings(projectedAllocations);
    const identity = {
        schemaVersion: FINANCIAL_SAVINGS_SURFACE_PROJECTION_SCHEMA_VERSION_V1,
        contractVersion: FINANCIAL_SAVINGS_SURFACE_PROJECTION_CONTRACT_VERSION_V1,
        surface,
        scope: { kind: 'subscription-full' },
        provider: 'azure',
        providerAccountRefs: [...authority.providerAccountRefs],
        artifactGeneration: { ...authority.artifactGeneration },
        financialAuthorityId: authority.authorityId,
        savingsAuthorityId: savingsAuthority.savingsAuthorityId,
        ...(lifecycleBindings.length
            ? { lifecycleBindings: lifecycleBindings }
            : {}),
        coordinates,
    };
    const projection = {
        ...identity,
        projectionId: createFinancialSavingsSurfaceProjectionIdV1(identity),
    };
    if (!isFinancialSavingsSurfaceProjectionV1(projection)) {
        throw new FinancialSavingsSurfaceProjectionError('Financial savings surface projection failed validation');
    }
    return projection;
};
