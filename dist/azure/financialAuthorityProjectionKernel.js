"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectFinancialSavingsResourceV1 = exports.projectFinancialAuthorityResourceV1 = void 0;
const financialAuthorityView_1 = require("./financialAuthorityView");
const financialSavingsAuthority_1 = require("./financialSavingsAuthority");
const financialChargeComposition_1 = require("./financialChargeComposition");
const financialSavingsChargePolicyKernel_1 = require("./financialSavingsChargePolicyKernel");
const normalize = (value) => value.trim().toLowerCase().replace(/\/+$/, '');
/** Derives one compact, non-additive resource view from a validated canonical authority. */
const projectFinancialAuthorityResourceV1 = (authority, resourceType, scopeId) => {
    const normalizedType = normalize(resourceType);
    const normalizedScopeId = normalize(scopeId);
    const coverage = authority.scopeCoverage.find(entry => normalize(entry.resourceType) === normalizedType && entry.scopeIds.some(candidate => normalize(candidate) === normalizedScopeId));
    if (!coverage)
        return undefined;
    const coordinates = authority.coordinates.map(coordinate => {
        const owners = coordinate.ownerBaselines.filter(baseline => normalize(baseline.scopeId) === normalizedScopeId);
        const ownerBaseline = owners[0];
        if (owners.length !== 1 || !ownerBaseline)
            throw new TypeError('Financial authority resource owner is missing or ambiguous.');
        const chargeComposition = ownerBaseline.status === 'available' && ownerBaseline.baselineKind === 'owner'
            ? coordinate.chargeCompositions.find(composition => composition.baselineId === ownerBaseline.baselineId)
            : undefined;
        if (ownerBaseline.status === 'available' && ownerBaseline.baselineKind === 'owner' && !chargeComposition) {
            throw new TypeError('Financial authority resource charge composition is missing.');
        }
        const displayRollups = (coordinate.displayRollups ?? []).filter(rollup => normalize(rollup.displayScopeId) === normalizedScopeId);
        const displayMemberBaselineIds = new Set(displayRollups.flatMap(rollup => rollup.members.map(member => member.baselineId)).filter(baselineId => baselineId !== ownerBaseline.baselineId));
        const displayMemberBaselines = coordinate.ownerBaselines.filter(baseline => baseline.status === 'available' &&
            baseline.baselineKind === 'owner' &&
            displayMemberBaselineIds.has(baseline.baselineId));
        if (displayMemberBaselines.length !== displayMemberBaselineIds.size) {
            throw new TypeError('Financial authority resource display member baseline is missing.');
        }
        const displayMemberChargeCompositions = (coordinate.chargeCompositions ?? []).filter(composition => displayMemberBaselineIds.has(composition.baselineId));
        if (displayMemberBaselines.some(baseline => baseline.status === 'available' &&
            baseline.baselineKind === 'owner' &&
            !displayMemberChargeCompositions.some(composition => composition.baselineId === baseline.baselineId))) {
            throw new TypeError('Financial authority resource display member charge composition is missing.');
        }
        const displayMemberships = new Set(displayRollups.flatMap(rollup => rollup.members.map(member => `${member.baselineId}\u0000${member.componentId}`)));
        return {
            coordinateId: coordinate.coordinateId,
            periodRole: coordinate.periodRole,
            period: coordinate.period,
            costBasis: coordinate.costBasis,
            estimateLens: coordinate.estimateLens,
            ...(coordinate.requestedCurrencyCode === undefined ? {} : { requestedCurrencyCode: coordinate.requestedCurrencyCode }),
            ownerBaseline,
            ...(displayMemberBaselines.length === 0 ? {} : { displayMemberBaselines }),
            ...(chargeComposition === undefined ? {} : { chargeComposition }),
            ...(displayMemberChargeCompositions.length === 0 ? {} : { displayMemberChargeCompositions }),
            componentDescriptors: (coordinate.componentDescriptors ?? []).filter(descriptor => displayMemberships.has(`${descriptor.baselineId}\u0000${descriptor.componentId}`)),
            displayRollups,
            projections: coordinate.projections.filter(projection => normalize(projection.scopeId) === normalizedScopeId),
        };
    });
    const firstCoordinate = coordinates[0];
    if (!firstCoordinate)
        throw new TypeError('Financial authority resource projection has no coordinates.');
    const assessmentIds = new Set();
    const bundleIds = new Set();
    coordinates.forEach(coordinate => {
        assessmentIds.add(coordinate.ownerBaseline.assessmentId);
        if (coordinate.ownerBaseline.status === 'available' && coordinate.ownerBaseline.baselineKind === 'owner') {
            bundleIds.add(coordinate.ownerBaseline.evidenceBundleId);
        }
        for (const baseline of coordinate.displayMemberBaselines ?? []) {
            assessmentIds.add(baseline.assessmentId);
            if (baseline.status === 'available' && baseline.baselineKind === 'owner')
                bundleIds.add(baseline.evidenceBundleId);
        }
        coordinate.projections.forEach(projection => {
            if (projection.targetAssessmentId)
                assessmentIds.add(projection.targetAssessmentId);
            if (projection.targetEvidenceBundleId)
                bundleIds.add(projection.targetEvidenceBundleId);
        });
    });
    const evidenceAssessments = authority.evidenceAssessments.filter(assessment => assessmentIds.has(assessment.assessmentId));
    evidenceAssessments.forEach(assessment => {
        if (assessment.evidenceBundleId)
            bundleIds.add(assessment.evidenceBundleId);
    });
    return {
        contractVersion: financialAuthorityView_1.FINANCIAL_AUTHORITY_RESOURCE_PROJECTION_CONTRACT_VERSION_V1,
        authorityId: authority.authorityId,
        provider: authority.provider,
        providerAccountRefs: authority.providerAccountRefs,
        artifactGeneration: authority.artifactGeneration,
        billingGenerationId: authority.billingGenerationId,
        resourceType: coverage.resourceType,
        financialRole: coverage.financialRole,
        scopeId: normalizedScopeId,
        evidenceBundles: authority.evidenceBundles.filter(bundle => bundleIds.has(bundle.bundleId)),
        evidenceAssessments,
        coordinates: [firstCoordinate, ...coordinates.slice(1)],
    };
};
exports.projectFinancialAuthorityResourceV1 = projectFinancialAuthorityResourceV1;
/** Derives the matching compact savings view for one canonical resource owner. */
const projectFinancialSavingsResourceV1 = (savingsAuthority, financialProjection, financialAuthority, chargeInclusionPolicyRef = financialChargeComposition_1.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef) => {
    if (savingsAuthority.financialAuthorityId !== financialProjection.authorityId ||
        savingsAuthority.artifactGeneration.runId !== financialProjection.artifactGeneration.runId ||
        savingsAuthority.artifactGeneration.generatedAt !== financialProjection.artifactGeneration.generatedAt) {
        throw new TypeError('Financial savings authority is not bound to the resource Financial Authority projection.');
    }
    if (!(0, financialChargeComposition_1.resolveFinancialChargeInclusionPolicyV1)(chargeInclusionPolicyRef)) {
        throw new TypeError('Financial savings resource charge-inclusion policy is not registered.');
    }
    if (financialAuthority !== undefined &&
        (financialAuthority.authorityId !== financialProjection.authorityId ||
            financialAuthority.artifactGeneration.runId !== financialProjection.artifactGeneration.runId ||
            financialAuthority.artifactGeneration.generatedAt !== financialProjection.artifactGeneration.generatedAt)) {
        throw new TypeError('Full Financial Authority is not bound to the resource projection.');
    }
    const normalizedScopeId = normalize(financialProjection.scopeId);
    const financialCoordinateIds = new Set(financialProjection.coordinates.map(coordinate => coordinate.coordinateId));
    const savingsByCoordinateId = new Map(savingsAuthority.coordinates.map(coordinate => [coordinate.coordinateId, coordinate]));
    if (financialCoordinateIds.size !== financialProjection.coordinates.length ||
        savingsAuthority.coordinates.length !== financialProjection.coordinates.length ||
        savingsAuthority.coordinates.some(coordinate => !financialCoordinateIds.has(coordinate.coordinateId))) {
        throw new TypeError('Financial savings coordinates do not match the resource Financial Authority projection.');
    }
    const coordinates = financialProjection.coordinates.map(financialCoordinate => {
        const coordinate = savingsByCoordinateId.get(financialCoordinate.coordinateId);
        if (!coordinate)
            throw new TypeError('Financial savings coordinate is missing.');
        if (coordinate.status === 'unavailable')
            return { ...coordinate, chargeInclusionPolicyRef };
        const displayOwnerScopeIds = new Set((financialCoordinate.displayMemberBaselines ?? []).map(baseline => normalize(baseline.scopeId)));
        displayOwnerScopeIds.delete(normalizedScopeId);
        const selectedOwnerScopeIds = new Set([normalizedScopeId, ...displayOwnerScopeIds]);
        const resourceAllocations = coordinate.allocations.filter(allocation => selectedOwnerScopeIds.has(normalize(allocation.ownerScopeId)));
        const sourceResourceContributions = coordinate.resourceContributions.filter(contribution => selectedOwnerScopeIds.has(normalize(contribution.ownerScopeId)));
        const sourceResourceContributionByOwner = new Map();
        for (const contribution of sourceResourceContributions) {
            const ownerScopeId = normalize(contribution.ownerScopeId);
            if (sourceResourceContributionByOwner.has(ownerScopeId)) {
                throw new TypeError('Financial savings resource contribution is ambiguous.');
            }
            sourceResourceContributionByOwner.set(ownerScopeId, contribution);
        }
        for (const ownerScopeId of selectedOwnerScopeIds) {
            const sourceRecommendationSavings = coordinate.recommendationContributions
                .filter(contribution => normalize(contribution.ownerScopeId) === ownerScopeId)
                .reduce((total, contribution) => {
                const next = total + contribution.savingsMinorUnits;
                if (!Number.isSafeInteger(next)) {
                    throw new TypeError('Financial savings recommendation contribution overflows safe minor units.');
                }
                return next;
            }, 0);
            if ((sourceResourceContributionByOwner.get(ownerScopeId)?.savingsMinorUnits ?? 0) !== sourceRecommendationSavings) {
                throw new TypeError('Financial savings recommendation contributions do not reconcile to the resource contribution.');
            }
        }
        const policyUnavailableScenarioIds = new Set();
        const chargeCompositionByBaselineId = new Map([
            ...(financialCoordinate.chargeComposition ? [financialCoordinate.chargeComposition] : []),
            ...(financialCoordinate.displayMemberChargeCompositions ?? []),
        ].map(composition => [composition.baselineId, composition]));
        const selectedAllocations = resourceAllocations.filter(allocation => {
            if (chargeInclusionPolicyRef.policyId === financialChargeComposition_1.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef.policyId &&
                chargeInclusionPolicyRef.policyDigest === financialChargeComposition_1.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef.policyDigest)
                return true;
            const disposition = (0, financialSavingsChargePolicyKernel_1.classifyFinancialSavingsAllocationForPolicyV1)(chargeCompositionByBaselineId, allocation, chargeInclusionPolicyRef);
            if (disposition === 'unavailable')
                policyUnavailableScenarioIds.add(allocation.scenarioId);
            return disposition === 'included';
        });
        const allocationsByRecommendation = new Map();
        for (const allocation of selectedAllocations) {
            const key = `${normalize(allocation.ownerScopeId)}\u0000${allocation.recommendationId}`;
            const current = allocationsByRecommendation.get(key) ?? [];
            current.push(allocation);
            allocationsByRecommendation.set(key, current);
        }
        const allRecommendationContributions = [...allocationsByRecommendation.entries()]
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([, allocations]) => {
            const firstAllocation = allocations[0];
            if (!firstAllocation)
                throw new TypeError('Financial savings recommendation contribution has no allocation.');
            const savingsMinorUnits = allocations.reduce((total, allocation) => {
                const next = total + allocation.savingsMinorUnits;
                if (!Number.isSafeInteger(next)) {
                    throw new TypeError('Financial savings recommendation contribution overflows safe minor units.');
                }
                return next;
            }, 0);
            return {
                ownerScopeId: normalize(firstAllocation.ownerScopeId),
                recommendationId: firstAllocation.recommendationId,
                allocationIds: allocations.map(allocation => allocation.allocationId),
                savingsMinorUnits,
            };
        });
        const recommendationContributions = allRecommendationContributions.filter(contribution => normalize(contribution.ownerScopeId) === normalizedScopeId);
        const displayMemberRecommendationContributions = allRecommendationContributions.filter(contribution => displayOwnerScopeIds.has(normalize(contribution.ownerScopeId)));
        const buildResourceContribution = (ownerScopeId) => {
            const allocations = selectedAllocations.filter(allocation => normalize(allocation.ownerScopeId) === ownerScopeId);
            if (allocations.length === 0)
                return undefined;
            const savingsMinorUnits = allocations.reduce((total, allocation) => {
                const next = total + allocation.savingsMinorUnits;
                if (!Number.isSafeInteger(next))
                    throw new TypeError('Financial savings resource contribution overflows safe minor units.');
                return next;
            }, 0);
            return {
                ownerScopeId,
                allocationIds: allocations.map(allocation => allocation.allocationId),
                savingsMinorUnits,
            };
        };
        const resourceContribution = buildResourceContribution(normalizedScopeId);
        const displayMemberResourceContributions = [...displayOwnerScopeIds]
            .sort()
            .map(buildResourceContribution)
            .filter((contribution) => contribution !== undefined);
        const unavailableActivationIds = new Set(coordinate.status === 'partial'
            ? coordinate.activations.filter(activation => activation.result === 'unavailable').map(activation => activation.scenarioId)
            : []);
        const authorityCoordinate = financialAuthority?.coordinates.find(candidate => candidate.coordinateId === financialCoordinate.coordinateId);
        if (financialAuthority !== undefined && !authorityCoordinate) {
            throw new TypeError('Full Financial Authority coordinate is missing for the resource projection.');
        }
        const unavailableScenarioIds = [...new Set([...unavailableActivationIds, ...policyUnavailableScenarioIds])]
            .filter(scenarioId => {
            if (!authorityCoordinate) {
                // Without the full authority there is no proof that an absent target
                // projection belongs elsewhere. Preserve the gap on this resource.
                return true;
            }
            const scenarioProjections = authorityCoordinate.projections.filter(projection => projection.scenarioId === scenarioId);
            return scenarioProjections.length === 0 || scenarioProjections.some(projection => selectedOwnerScopeIds.has(normalize(projection.scopeId)));
        })
            .sort();
        const composed = {
            coordinateId: coordinate.coordinateId,
            chargeInclusionPolicyRef,
            currentAggregateBaselineId: coordinate.currentAggregateBaselineId,
            accountingCurrencyCode: coordinate.accountingCurrencyCode,
            minorUnitScale: coordinate.minorUnitScale,
            roundingMode: coordinate.roundingMode,
            ...(resourceContribution === undefined ? {} : { resourceContribution }),
            recommendationContributions,
            ...(displayMemberResourceContributions.length === 0 ? {} : { displayMemberResourceContributions }),
            ...(displayMemberRecommendationContributions.length === 0 ? {} : { displayMemberRecommendationContributions }),
        };
        return unavailableScenarioIds.length > 0
            ? { ...composed, status: 'partial', unavailableScenarioIds: unavailableScenarioIds }
            : { ...composed, status: 'available' };
    });
    const firstCoordinate = coordinates[0];
    if (!firstCoordinate)
        throw new TypeError('Financial savings resource projection has no coordinates.');
    return {
        contractVersion: financialSavingsAuthority_1.FINANCIAL_SAVINGS_RESOURCE_PROJECTION_CONTRACT_VERSION_V1,
        savingsAuthorityId: savingsAuthority.savingsAuthorityId,
        financialAuthorityId: savingsAuthority.financialAuthorityId,
        artifactGeneration: savingsAuthority.artifactGeneration,
        scopeId: normalizedScopeId,
        coordinates: [firstCoordinate, ...coordinates.slice(1)],
    };
};
exports.projectFinancialSavingsResourceV1 = projectFinancialSavingsResourceV1;
//# sourceMappingURL=financialAuthorityProjectionKernel.js.map