import { FINANCIAL_AUTHORITY_RESOURCE_PROJECTION_CONTRACT_VERSION_V1, } from './financialAuthorityView.js';
import { FINANCIAL_SAVINGS_RESOURCE_PROJECTION_CONTRACT_VERSION_V1, } from './financialSavingsAuthority.js';
const normalize = (value) => value.trim().toLowerCase().replace(/\/+$/, '');
/** Derives one compact, non-additive resource view from a validated canonical authority. */
export const projectFinancialAuthorityResourceV1 = (authority, resourceType, scopeId) => {
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
        const displayRollups = coordinate.displayRollups.filter(rollup => normalize(rollup.displayScopeId) === normalizedScopeId);
        const displayMemberships = new Set(displayRollups.flatMap(rollup => rollup.members.map(member => `${member.baselineId}\u0000${member.componentId}`)));
        return {
            coordinateId: coordinate.coordinateId,
            periodRole: coordinate.periodRole,
            period: coordinate.period,
            costBasis: coordinate.costBasis,
            estimateLens: coordinate.estimateLens,
            ...(coordinate.requestedCurrencyCode === undefined ? {} : { requestedCurrencyCode: coordinate.requestedCurrencyCode }),
            ownerBaseline,
            ...(chargeComposition === undefined ? {} : { chargeComposition }),
            componentDescriptors: coordinate.componentDescriptors.filter(descriptor => displayMemberships.has(`${descriptor.baselineId}\u0000${descriptor.componentId}`)),
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
        contractVersion: FINANCIAL_AUTHORITY_RESOURCE_PROJECTION_CONTRACT_VERSION_V1,
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
/** Derives the matching compact savings view for one canonical resource owner. */
export const projectFinancialSavingsResourceV1 = (savingsAuthority, financialProjection, financialAuthority) => {
    if (savingsAuthority.financialAuthorityId !== financialProjection.authorityId ||
        savingsAuthority.artifactGeneration.runId !== financialProjection.artifactGeneration.runId ||
        savingsAuthority.artifactGeneration.generatedAt !== financialProjection.artifactGeneration.generatedAt) {
        throw new TypeError('Financial savings authority is not bound to the resource Financial Authority projection.');
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
            return { ...coordinate };
        const resourceContributions = coordinate.resourceContributions.filter(contribution => normalize(contribution.ownerScopeId) === normalizedScopeId);
        if (resourceContributions.length > 1)
            throw new TypeError('Financial savings resource contribution is ambiguous.');
        const recommendationContributions = coordinate.recommendationContributions.filter(contribution => normalize(contribution.ownerScopeId) === normalizedScopeId);
        const resourceContribution = resourceContributions[0];
        const recommendationSavings = recommendationContributions.reduce((total, contribution) => {
            const next = total + contribution.savingsMinorUnits;
            if (!Number.isSafeInteger(next))
                throw new TypeError('Financial savings recommendation contribution overflows safe minor units.');
            return next;
        }, 0);
        if ((resourceContribution?.savingsMinorUnits ?? 0) !== recommendationSavings) {
            throw new TypeError('Financial savings recommendation contributions do not reconcile to the resource contribution.');
        }
        const unavailableActivationIds = new Set(coordinate.status === 'partial'
            ? coordinate.activations.filter(activation => activation.result === 'unavailable').map(activation => activation.scenarioId)
            : []);
        const authorityCoordinate = financialAuthority?.coordinates.find(candidate => candidate.coordinateId === financialCoordinate.coordinateId);
        if (financialAuthority !== undefined && !authorityCoordinate) {
            throw new TypeError('Full Financial Authority coordinate is missing for the resource projection.');
        }
        const unavailableScenarioIds = [...unavailableActivationIds]
            .filter(scenarioId => {
            if (!authorityCoordinate) {
                // Without the full authority there is no proof that an absent target
                // projection belongs elsewhere. Preserve the gap on this resource.
                return true;
            }
            const scenarioProjections = authorityCoordinate.projections.filter(projection => projection.scenarioId === scenarioId);
            return (scenarioProjections.length === 0 ||
                scenarioProjections.some(projection => normalize(projection.scopeId) === normalizedScopeId));
        })
            .sort();
        const composed = {
            coordinateId: coordinate.coordinateId,
            currentAggregateBaselineId: coordinate.currentAggregateBaselineId,
            accountingCurrencyCode: coordinate.accountingCurrencyCode,
            minorUnitScale: coordinate.minorUnitScale,
            roundingMode: coordinate.roundingMode,
            ...(resourceContribution === undefined ? {} : { resourceContribution }),
            recommendationContributions,
        };
        return unavailableScenarioIds.length > 0
            ? { ...composed, status: 'partial', unavailableScenarioIds: unavailableScenarioIds }
            : { ...composed, status: 'available' };
    });
    const firstCoordinate = coordinates[0];
    if (!firstCoordinate)
        throw new TypeError('Financial savings resource projection has no coordinates.');
    return {
        contractVersion: FINANCIAL_SAVINGS_RESOURCE_PROJECTION_CONTRACT_VERSION_V1,
        savingsAuthorityId: savingsAuthority.savingsAuthorityId,
        financialAuthorityId: savingsAuthority.financialAuthorityId,
        artifactGeneration: savingsAuthority.artifactGeneration,
        scopeId: normalizedScopeId,
        coordinates: [firstCoordinate, ...coordinates.slice(1)],
    };
};
