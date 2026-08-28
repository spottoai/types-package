import { sha256Utf8 } from '../common/sha256.js';
import { FINANCIAL_AUTHORITY_VIEW_CONTRACT_VERSION_V1, FINANCIAL_AUTHORITY_VIEW_SCHEMA_VERSION_V1, } from './financialAuthorityView.js';
import { isFinancialProjectionEnvelopeV1 } from './financialProjectionValidation.js';
import { isFinancialEvidenceAssessmentV1 } from './financialEvidenceAssessmentValidation.js';
import { formatExactDecimalValue, multiplyExactDecimalValues, parseCanonicalDecimal, sumCanonicalDecimals } from '../common/exactDecimal.js';
import { isFinancialBaselinePeriodV2, isFinancialEvidenceBundleV1, isFinancialScopeBaselineEnvelopeV2 } from './financialScopeBaselineValidation.js';
import { isFinancialAuthorityComponentDescriptorV1, isFinancialDisplayRollupV1 } from './financialDisplayRollupValidation.js';
import { AZURE_BILLED_ALL_CHARGES_POLICY_V1 } from './financialChargeComposition.js';
import { isFinancialChargeCompositionV1 } from './financialChargeCompositionValidation.js';
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const CURRENCY = /^[A-Z]{3}$/;
const AZURE_RESOURCE_TYPE = /^[a-z0-9.-]+\/[a-z0-9._/-]+$/;
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
const isIdentity = (value) => typeof value === 'string' && value.length > 0 && value.length <= 2048 && value.trim() === value;
const isHash = (value) => typeof value === 'string' && SHA256_ID.test(value);
const isIsoInstant = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const normalizeScopeId = (value) => value.trim().toLowerCase().replace(/\/+$/, '');
const intervalDayCount = (startDate, endDateExclusive) => {
    const start = Date.parse(`${startDate}T00:00:00.000Z`);
    const end = Date.parse(`${endDateExclusive}T00:00:00.000Z`);
    const dayCount = (end - start) / 86400000;
    return Number.isSafeInteger(dayCount) && dayCount > 0 ? dayCount : undefined;
};
const canonicalJsonValue = (value) => {
    if (Array.isArray(value))
        return value.map(canonicalJsonValue);
    if (!isRecord(value))
        return value;
    return Object.fromEntries(Object.keys(value)
        .sort()
        .map(key => [key, canonicalJsonValue(value[key])]));
};
const canonicalText = (value) => JSON.stringify(canonicalJsonValue(value));
const periodText = (period) => canonicalText(period);
const baselineAmount = (baseline) => baseline.status === 'available' ? baseline.total.amount : undefined;
const exactSumEquals = (left, right, expected) => {
    try {
        return formatExactDecimalValue(sumCanonicalDecimals([left, right])) === formatExactDecimalValue(sumCanonicalDecimals([expected]));
    }
    catch {
        return false;
    }
};
const canonicalCoordinatePreimage = (value) => ({
    periodRole: value.periodRole,
    period: value.period,
    costBasis: value.costBasis,
    estimateLens: value.estimateLens,
    ...(value.requestedCurrencyCode === undefined ? {} : { requestedCurrencyCode: value.requestedCurrencyCode }),
    ownerBaselines: [...value.ownerBaselines].sort((left, right) => left.scopeId.localeCompare(right.scopeId)),
    residualBaseline: value.residualBaseline,
    aggregateBaseline: value.aggregateBaseline,
    chargeCompositions: [...value.chargeCompositions].sort((left, right) => left.baselineId.localeCompare(right.baselineId)),
    componentDescriptors: [...value.componentDescriptors].sort((left, right) => `${left.baselineId}\u0000${left.componentId}`.localeCompare(`${right.baselineId}\u0000${right.componentId}`)),
    displayRollups: [...value.displayRollups].sort((left, right) => left.displayRollupId.localeCompare(right.displayRollupId)),
    projections: [...value.projections].sort((left, right) => left.scenarioId.localeCompare(right.scenarioId)),
});
export const canonicalizeFinancialAuthorityCoordinateIdentityV1 = (value) => canonicalText(canonicalCoordinatePreimage(value));
export const createFinancialAuthorityCoordinateIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialAuthorityCoordinateIdentityV1(value))}`;
const canonicalAuthorityPreimage = (value) => ({
    schemaVersion: value.schemaVersion,
    contractVersion: value.contractVersion,
    provider: value.provider,
    providerAccountRefs: [...value.providerAccountRefs].sort(),
    artifactGeneration: value.artifactGeneration,
    billingGenerationId: value.billingGenerationId,
    scopeCoverage: [...value.scopeCoverage]
        .sort((left, right) => left.resourceType.localeCompare(right.resourceType) || left.financialRole.localeCompare(right.financialRole))
        .map(entry => ({ resourceType: entry.resourceType, financialRole: entry.financialRole, scopeIds: [...entry.scopeIds].sort() })),
    evidenceBundles: [...value.evidenceBundles].sort((left, right) => left.bundleId.localeCompare(right.bundleId)),
    evidenceAssessments: [...value.evidenceAssessments].sort((left, right) => left.assessmentId.localeCompare(right.assessmentId)),
    coordinates: [...value.coordinates].sort((left, right) => left.coordinateId.localeCompare(right.coordinateId)),
});
export const canonicalizeFinancialAuthorityViewIdentityV1 = (value) => canonicalText(canonicalAuthorityPreimage(value));
export const createFinancialAuthorityViewIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialAuthorityViewIdentityV1(value))}`;
const isSameStringSet = (left, right) => {
    if (left.length !== right.length)
        return false;
    const sortedLeft = [...left].sort();
    const sortedRight = [...right].sort();
    return sortedLeft.every((item, index) => item === sortedRight[index]);
};
const isCoordinate = (value, coveredScopeIds, financialRoleByScope, providerAccountRefs, assessmentById, bundleIds, bundleById) => {
    if (!isRecord(value) ||
        !hasExactFields(value, [
            'coordinateId',
            'periodRole',
            'period',
            'costBasis',
            'estimateLens',
            'ownerBaselines',
            'residualBaseline',
            'aggregateBaseline',
            'chargeCompositions',
            'componentDescriptors',
            'displayRollups',
            'projections',
        ], ['requestedCurrencyCode']) ||
        !isHash(value.coordinateId) ||
        (value.periodRole !== 'current' && value.periodRole !== 'previous') ||
        !isFinancialBaselinePeriodV2(value.period) ||
        typeof value.costBasis !== 'string' ||
        !COST_BASES.has(value.costBasis) ||
        typeof value.estimateLens !== 'string' ||
        !ESTIMATE_LENSES.has(value.estimateLens) ||
        (value.requestedCurrencyCode !== undefined && (typeof value.requestedCurrencyCode !== 'string' || !CURRENCY.test(value.requestedCurrencyCode))) ||
        !Array.isArray(value.ownerBaselines) ||
        value.ownerBaselines.length === 0 ||
        value.ownerBaselines.length > 20000 ||
        !value.ownerBaselines.every(isFinancialScopeBaselineEnvelopeV2) ||
        !isFinancialScopeBaselineEnvelopeV2(value.residualBaseline) ||
        !isFinancialScopeBaselineEnvelopeV2(value.aggregateBaseline) ||
        !Array.isArray(value.chargeCompositions) ||
        value.chargeCompositions.length > 20001 ||
        !value.chargeCompositions.every(isFinancialChargeCompositionV1) ||
        !Array.isArray(value.componentDescriptors) ||
        value.componentDescriptors.length > 20000 ||
        !value.componentDescriptors.every(isFinancialAuthorityComponentDescriptorV1) ||
        !Array.isArray(value.displayRollups) ||
        value.displayRollups.length > 20000 ||
        !value.displayRollups.every(isFinancialDisplayRollupV1) ||
        !Array.isArray(value.projections) ||
        value.projections.length > 20000 ||
        !value.projections.every(isFinancialProjectionEnvelopeV1))
        return false;
    const coordinate = value;
    const ownerScopeIds = coordinate.ownerBaselines.map(baseline => baseline.scopeId);
    if (!isSameStringSet(ownerScopeIds, coveredScopeIds) || new Set(ownerScopeIds).size !== ownerScopeIds.length)
        return false;
    const allBaselines = [...coordinate.ownerBaselines, coordinate.residualBaseline, coordinate.aggregateBaseline];
    if (allBaselines.some(baseline => baseline.costBasis !== coordinate.costBasis ||
        baseline.estimateLens !== coordinate.estimateLens ||
        periodText(baseline.period) !== periodText(coordinate.period) ||
        !isSameStringSet([...baseline.providerAccountRefs], providerAccountRefs) ||
        baseline.requestedCurrencyCode !== coordinate.requestedCurrencyCode ||
        !assessmentById.has(baseline.assessmentId)) ||
        coordinate.residualBaseline.scopeKind !== 'subscription-residual' ||
        coordinate.aggregateBaseline.scopeKind !== 'subscription-aggregate')
        return false;
    for (const baseline of allBaselines) {
        const assessment = assessmentById.get(baseline.assessmentId);
        if (!assessment ||
            assessment.request.scopeId !== baseline.scopeId ||
            assessment.request.scopeKind !== baseline.scopeKind ||
            !isSameStringSet([...assessment.request.providerAccountRefs], providerAccountRefs) ||
            assessment.result !== baseline.status ||
            (baseline.status === 'available' && baseline.baselineKind === 'owner' && assessment.evidenceBundleId !== baseline.evidenceBundleId))
            return false;
        if (baseline.status === 'available' && baseline.baselineKind === 'owner') {
            const evidenceBundle = bundleById.get(baseline.evidenceBundleId);
            if (!evidenceBundle)
                return false;
            const evidenceById = new Map(evidenceBundle.references.map(reference => [reference.evidenceRefId, reference]));
            const currencyReferences = baseline.accountingCurrency.evidenceRefIds.map(evidenceRefId => evidenceById.get(evidenceRefId));
            if (currencyReferences.some(reference => reference === undefined) ||
                !currencyReferences.some(reference => reference?.role === 'billing' || reference?.role === 'estimate' || reference?.role === 'billing-currency-declaration'))
                return false;
            if (baseline.accountingCurrency.fxEvidenceRefId !== undefined &&
                evidenceById.get(baseline.accountingCurrency.fxEvidenceRefId)?.role !== 'fx-conversion')
                return false;
        }
    }
    for (const baseline of coordinate.ownerBaselines) {
        if (baseline.scopeKind !== 'canonical-resource-owner' && baseline.scopeKind !== 'composite-resource')
            return false;
        const financialRole = financialRoleByScope.get(baseline.scopeId);
        if (financialRole === undefined ||
            (financialRole === 'display-only' && (baseline.status !== 'unavailable' || baseline.unavailableReason !== 'unsupported-scope')) ||
            (financialRole === 'unclassified' && (baseline.status !== 'unavailable' || baseline.unavailableReason !== 'ownership-unresolved')))
            return false;
        if (baseline.status === 'available' && !bundleIds.has(baseline.evidenceBundleId))
            return false;
    }
    if (coordinate.residualBaseline.status === 'available' && !bundleIds.has(coordinate.residualBaseline.evidenceBundleId))
        return false;
    const composableBaselines = [...coordinate.ownerBaselines, coordinate.residualBaseline].filter((baseline) => baseline.status === 'available' && baseline.baselineKind === 'owner');
    const chargeCompositionByBaselineId = new Map(coordinate.chargeCompositions.map(composition => [composition.baselineId, composition]));
    if (chargeCompositionByBaselineId.size !== coordinate.chargeCompositions.length ||
        coordinate.chargeCompositions.length !== composableBaselines.length)
        return false;
    for (const baseline of composableBaselines) {
        const composition = chargeCompositionByBaselineId.get(baseline.baselineId);
        if (composition === undefined ||
            canonicalText(baseline.chargeInclusionPolicyRef) !== canonicalText(AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef) ||
            composition.ownerScopeId !== baseline.scopeId ||
            periodText(composition.period) !== periodText(baseline.period) ||
            composition.costBasis !== baseline.costBasis ||
            composition.estimateLens !== baseline.estimateLens ||
            composition.accountingCurrencyCode !== baseline.total.currencyCode ||
            composition.reconciliation.sourceTotal !== baseline.total.amount)
            return false;
        const baselineComponentById = new Map(baseline.components.map(component => [component.componentId, component]));
        const partitionedComponentIds = composition.buckets.flatMap(bucket => bucket.componentIds);
        if (partitionedComponentIds.length !== baseline.components.length ||
            new Set(partitionedComponentIds).size !== partitionedComponentIds.length ||
            partitionedComponentIds.some(componentId => !baselineComponentById.has(componentId)))
            return false;
        for (const bucket of composition.buckets) {
            try {
                if (formatExactDecimalValue(sumCanonicalDecimals(bucket.componentIds.map(componentId => baselineComponentById.get(componentId).amount))) !== bucket.amount)
                    return false;
            }
            catch {
                return false;
            }
        }
    }
    const financialOwnerBaselines = coordinate.ownerBaselines.filter(baseline => financialRoleByScope.get(baseline.scopeId) === 'owner');
    const availableMembers = [...financialOwnerBaselines, coordinate.residualBaseline]
        .filter(baseline => baseline.status === 'available')
        .map(baseline => baseline.baselineId);
    const everyMemberAvailable = availableMembers.length === financialOwnerBaselines.length + 1;
    if (coordinate.aggregateBaseline.status === 'available') {
        if (!everyMemberAvailable || !isSameStringSet([...coordinate.aggregateBaseline.memberBaselineIds], availableMembers))
            return false;
    }
    else if (everyMemberAvailable) {
        return false;
    }
    const ownerByScope = new Map(coordinate.ownerBaselines.map(baseline => [baseline.scopeId, baseline]));
    const componentKey = (baselineId, componentId) => `${baselineId}\u0000${componentId}`;
    const componentByKey = new Map();
    for (const baseline of coordinate.ownerBaselines) {
        if (baseline.status !== 'available' || baseline.baselineKind !== 'owner')
            continue;
        for (const component of baseline.components) {
            const key = componentKey(baseline.baselineId, component.componentId);
            if (componentByKey.has(key))
                return false;
            componentByKey.set(key, { baseline, component });
        }
    }
    const descriptorByKey = new Map();
    for (const descriptor of coordinate.componentDescriptors) {
        const key = componentKey(descriptor.baselineId, descriptor.componentId);
        const owned = componentByKey.get(key);
        if (!owned ||
            descriptorByKey.has(key) ||
            !isSameStringSet([...descriptor.evidenceRefIds], [...owned.component.evidenceRefIds]) ||
            (descriptor.displayLabelSource === 'charge-classification' &&
                descriptor.displayLabel !== `${owned.component.chargeClassification.charAt(0).toUpperCase()}${owned.component.chargeClassification.slice(1)}`))
            return false;
        descriptorByKey.set(key, descriptor);
    }
    if (descriptorByKey.size !== componentByKey.size)
        return false;
    const rollupIds = new Set();
    const scopedMemberships = new Set();
    const primaryMembershipCounts = new Map();
    for (const rollup of coordinate.displayRollups) {
        if (rollupIds.has(rollup.displayRollupId))
            return false;
        rollupIds.add(rollup.displayRollupId);
        for (const member of rollup.members) {
            const key = componentKey(member.baselineId, member.componentId);
            const owned = componentByKey.get(key);
            const descriptor = descriptorByKey.get(key);
            if (!owned || !descriptor)
                return false;
            const scopedKey = `${normalizeScopeId(rollup.displayScopeId)}\u0000${rollup.purpose}\u0000${key}`;
            if (scopedMemberships.has(scopedKey))
                return false;
            scopedMemberships.add(scopedKey);
            if ((rollup.displayLabelSource === 'service-name' && descriptor.serviceName !== rollup.displayLabel) ||
                (rollup.displayLabelSource === 'meter-category' && descriptor.meterCategory !== rollup.displayLabel) ||
                (rollup.displayLabelSource === 'charge-classification' &&
                    rollup.displayLabel !== `${owned.component.chargeClassification.charAt(0).toUpperCase()}${owned.component.chargeClassification.slice(1)}`))
                return false;
            if (normalizeScopeId(rollup.displayScopeId) === normalizeScopeId(owned.baseline.scopeId)) {
                primaryMembershipCounts.set(key, (primaryMembershipCounts.get(key) ?? 0) + 1);
            }
        }
    }
    if ([...componentByKey.keys()].some(key => primaryMembershipCounts.get(key) !== 1))
        return false;
    const scenarios = new Set();
    for (const projection of coordinate.projections) {
        const scenarioKey = `${projection.scopeId}|${projection.scenarioId}`;
        if (scenarios.has(scenarioKey) || !ownerByScope.has(projection.scopeId) || financialRoleByScope.get(projection.scopeId) !== 'owner')
            return false;
        scenarios.add(scenarioKey);
        const owner = ownerByScope.get(projection.scopeId);
        const targetAssessment = projection.targetAssessmentId === undefined ? undefined : assessmentById.get(projection.targetAssessmentId);
        if (projection.accountingCurrencyCode !== coordinate.requestedCurrencyCode ||
            projection.baselineCostBasis !== coordinate.costBasis ||
            projection.baselineEstimateLens !== coordinate.estimateLens ||
            (projection.targetAssessmentId !== undefined && targetAssessment === undefined) ||
            (projection.targetEvidenceBundleId !== undefined && !bundleIds.has(projection.targetEvidenceBundleId)) ||
            (targetAssessment !== undefined &&
                (targetAssessment.request.scopeId !== projection.scopeId ||
                    (projection.status === 'available' && targetAssessment.result !== 'available') ||
                    targetAssessment.evidenceBundleId !== projection.targetEvidenceBundleId)) ||
            (projection.baselineId !== undefined && (owner.status !== 'available' || projection.baselineId !== owner.baselineId)) ||
            (projection.status === 'available' && owner.status !== 'available'))
            return false;
        if (projection.status === 'available' && owner.status === 'available' && owner.baselineKind === 'owner') {
            // Current authority coordinates are observed baselines. A normalized-average-month
            // target cannot reuse their money until a separate, replayable current-period
            // normalization contract is bound to the projection.
            if (projection.targetPeriodConvention === 'normalized-average-month')
                return false;
            if (projection.operationKind === 'commitment-coverage') {
                const profile = projection.targetPeriodProfile;
                const dayCount = intervalDayCount(owner.period.requested.startDate, owner.period.requested.endDateExclusive);
                if (profile?.kind !== 'observed-period' ||
                    dayCount === undefined ||
                    profile.dayCount !== dayCount ||
                    profile.hourCount !== String(dayCount * 24))
                    return false;
            }
            const targetBundle = bundleById.get(projection.targetEvidenceBundleId);
            if (!targetBundle)
                return false;
            const targetEvidenceRefIds = new Set(targetBundle.references.map(reference => reference.evidenceRefId));
            const affectedComponentIds = new Set(projection.affectedComponentIds);
            if (projection.affectedComponentIds.some(componentId => !owner.components.some(component => component.componentId === componentId))) {
                return false;
            }
            try {
                const affectedAmount = formatExactDecimalValue(sumCanonicalDecimals(owner.components.filter(component => affectedComponentIds.has(component.componentId)).map(component => component.amount)));
                const unchangedAmount = formatExactDecimalValue(sumCanonicalDecimals(owner.components.filter(component => !affectedComponentIds.has(component.componentId)).map(component => component.amount)));
                if (projection.current.total !== owner.total.amount ||
                    projection.current.affected !== affectedAmount ||
                    projection.current.unchanged !== unchangedAmount ||
                    projection.target.unchanged !== unchangedAmount)
                    return false;
                const componentById = new Map(owner.components.map(component => [component.componentId, component]));
                for (const applied of projection.appliedComponentTargets) {
                    const component = componentById.get(applied.componentId);
                    if (!component || applied.targetEvidenceRefIds.some(evidenceRefId => !targetEvidenceRefIds.has(evidenceRefId)))
                        return false;
                    if (projection.operationKind === 'commitment-coverage') {
                        if (!('commitmentCoverage' in applied) || component.quantity === undefined || component.effectiveRate === undefined)
                            return false;
                        const commitment = applied.commitmentCoverage;
                        if (commitment.eligibleQuantity.amount !== component.quantity.amount ||
                            commitment.eligibleQuantity.unit !== component.quantity.unit ||
                            commitment.uncoveredQuantity.unit !== component.quantity.unit ||
                            commitment.uncoveredRate.amount !== component.effectiveRate.amount ||
                            commitment.uncoveredRate.quantityUnit !== component.effectiveRate.unit ||
                            commitment.uncoveredRate.currencyCode !== component.effectiveRate.currencyCode ||
                            commitment.uncoveredRate.currencyCode !== projection.accountingCurrencyCode ||
                            !applied.targetEvidenceRefIds.some(evidenceRefId => targetBundle.references.find(reference => reference.evidenceRefId === evidenceRefId)?.role === 'commitment-quote'))
                            return false;
                        continue;
                    }
                    if (projection.operationKind === 'remove-component') {
                        if (applied.targetAmount !== '0')
                            return false;
                        continue;
                    }
                    if (projection.operationKind === 'replace-rate') {
                        if (!('sourceQuantity' in applied) || !('targetRate' in applied) || component.quantity === undefined)
                            return false;
                        if (applied.sourceQuantity.amount !== component.quantity.amount ||
                            applied.sourceQuantity.unit !== component.quantity.unit ||
                            applied.targetRate.quantityUnit !== component.quantity.unit ||
                            applied.targetRate.currencyCode !== projection.accountingCurrencyCode ||
                            formatExactDecimalValue(multiplyExactDecimalValues(parseCanonicalDecimal(applied.sourceQuantity.amount), parseCanonicalDecimal(applied.targetRate.amount))) !== applied.targetAmount)
                            return false;
                        continue;
                    }
                    if (projection.operationKind === 'replace-quantity-and-rate') {
                        if (!('targetQuantity' in applied) || !('targetRate' in applied))
                            return false;
                        if (applied.targetQuantity.unit !== applied.targetRate.quantityUnit ||
                            applied.targetRate.currencyCode !== projection.accountingCurrencyCode ||
                            formatExactDecimalValue(multiplyExactDecimalValues(parseCanonicalDecimal(applied.targetQuantity.amount), parseCanonicalDecimal(applied.targetRate.amount))) !== applied.targetAmount)
                            return false;
                        continue;
                    }
                    if (!('sourceRate' in applied) || !('targetQuantity' in applied) || component.effectiveRate === undefined)
                        return false;
                    if (applied.sourceRate.amount !== component.effectiveRate.amount ||
                        applied.sourceRate.unit !== component.effectiveRate.unit ||
                        applied.sourceRate.currencyCode !== component.effectiveRate.currencyCode ||
                        applied.targetQuantity.unit !== component.effectiveRate.unit ||
                        applied.sourceRate.currencyCode !== projection.accountingCurrencyCode ||
                        formatExactDecimalValue(multiplyExactDecimalValues(parseCanonicalDecimal(applied.sourceRate.amount), parseCanonicalDecimal(applied.targetQuantity.amount))) !== applied.targetAmount)
                        return false;
                }
            }
            catch {
                return false;
            }
        }
    }
    const { coordinateId: _coordinateId, ...identity } = coordinate;
    return coordinate.coordinateId === createFinancialAuthorityCoordinateIdV1(identity);
};
const hasReconciledEstimateLensGroups = (coordinates) => {
    const groups = new Map();
    for (const coordinate of coordinates) {
        const key = canonicalText({
            windowKind: coordinate.period.windowKind,
            requestedPeriod: coordinate.period.requested,
            periodRole: coordinate.periodRole,
            costBasis: coordinate.costBasis,
            requestedCurrencyCode: coordinate.requestedCurrencyCode,
        });
        const group = groups.get(key) ?? new Map();
        if (group.has(coordinate.estimateLens))
            return false;
        group.set(coordinate.estimateLens, coordinate);
        groups.set(key, group);
    }
    for (const group of groups.values()) {
        const actual = group.get('actual-only');
        const combined = group.get('actual-plus-estimated');
        const estimated = group.get('estimates-only');
        if (!actual || !combined || !estimated || group.size !== 3)
            return false;
        const baselineSets = [
            ...combined.ownerBaselines.map((baseline, index) => [actual.ownerBaselines[index], baseline, estimated.ownerBaselines[index]]),
            [actual.residualBaseline, combined.residualBaseline, estimated.residualBaseline],
            [actual.aggregateBaseline, combined.aggregateBaseline, estimated.aggregateBaseline],
        ];
        for (const [actualBaseline, combinedBaseline, estimatedBaseline] of baselineSets) {
            const actualAmount = baselineAmount(actualBaseline);
            const combinedAmount = baselineAmount(combinedBaseline);
            const estimatedAmount = baselineAmount(estimatedBaseline);
            if (actualAmount !== undefined && combinedAmount !== undefined && estimatedAmount !== undefined) {
                if (!exactSumEquals(actualAmount, estimatedAmount, combinedAmount))
                    return false;
            }
            if (actualBaseline.status === 'available' &&
                actualBaseline.baselineKind === 'owner' &&
                combinedBaseline.status === 'available' &&
                combinedBaseline.baselineKind === 'owner' &&
                estimatedBaseline.status === 'available' &&
                estimatedBaseline.baselineKind === 'owner') {
                const actualByIdentity = new Map(actualBaseline.components.map(component => [component.billableIdentity, component.amount]));
                const combinedByIdentity = new Map(combinedBaseline.components.map(component => [component.billableIdentity, component.amount]));
                const estimatedByIdentity = new Map(estimatedBaseline.components.map(component => [component.billableIdentity, component.amount]));
                const identities = new Set([...actualByIdentity.keys(), ...combinedByIdentity.keys(), ...estimatedByIdentity.keys()]);
                for (const identity of identities) {
                    if (!exactSumEquals(actualByIdentity.get(identity) ?? '0', estimatedByIdentity.get(identity) ?? '0', combinedByIdentity.get(identity) ?? '0')) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
};
export const isFinancialAuthorityViewV1 = (value) => {
    if (!isRecord(value) ||
        !hasExactFields(value, [
            'schemaVersion',
            'contractVersion',
            'authorityId',
            'provider',
            'providerAccountRefs',
            'artifactGeneration',
            'billingGenerationId',
            'scopeCoverage',
            'evidenceBundles',
            'evidenceAssessments',
            'coordinates',
        ]) ||
        value.schemaVersion !== FINANCIAL_AUTHORITY_VIEW_SCHEMA_VERSION_V1 ||
        value.contractVersion !== FINANCIAL_AUTHORITY_VIEW_CONTRACT_VERSION_V1 ||
        !isHash(value.authorityId) ||
        value.provider !== 'azure' ||
        !Array.isArray(value.providerAccountRefs) ||
        value.providerAccountRefs.length === 0 ||
        value.providerAccountRefs.length > 64 ||
        !value.providerAccountRefs.every(isIdentity) ||
        new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
        !isRecord(value.artifactGeneration) ||
        !hasExactFields(value.artifactGeneration, ['runId', 'generatedAt']) ||
        !isIdentity(value.artifactGeneration.runId) ||
        !isIsoInstant(value.artifactGeneration.generatedAt) ||
        !isIdentity(value.billingGenerationId) ||
        !Array.isArray(value.scopeCoverage) ||
        value.scopeCoverage.length === 0 ||
        value.scopeCoverage.length > 1024 ||
        !Array.isArray(value.evidenceBundles) ||
        value.evidenceBundles.length > 20000 ||
        !value.evidenceBundles.every(isFinancialEvidenceBundleV1) ||
        !Array.isArray(value.evidenceAssessments) ||
        value.evidenceAssessments.length === 0 ||
        value.evidenceAssessments.length > 20000 ||
        !value.evidenceAssessments.every(isFinancialEvidenceAssessmentV1) ||
        !Array.isArray(value.coordinates) ||
        value.coordinates.length === 0 ||
        value.coordinates.length > 128)
        return false;
    const authority = value;
    const coveredScopeIds = [];
    const financialRoleByScope = new Map();
    const coverageGroups = new Set();
    for (const coverage of authority.scopeCoverage) {
        if (!isRecord(coverage) ||
            !hasExactFields(coverage, ['resourceType', 'financialRole', 'scopeIds']) ||
            typeof coverage.resourceType !== 'string' ||
            !AZURE_RESOURCE_TYPE.test(coverage.resourceType) ||
            coverage.resourceType !== normalizeScopeId(coverage.resourceType) ||
            (coverage.financialRole !== 'owner' && coverage.financialRole !== 'display-only' && coverage.financialRole !== 'unclassified') ||
            coverageGroups.has(`${coverage.resourceType}\u0000${coverage.financialRole}`) ||
            !Array.isArray(coverage.scopeIds) ||
            coverage.scopeIds.length === 0 ||
            coverage.scopeIds.length > 20000 ||
            !coverage.scopeIds.every(scopeId => isIdentity(scopeId) && scopeId === normalizeScopeId(scopeId)) ||
            new Set(coverage.scopeIds).size !== coverage.scopeIds.length)
            return false;
        coverageGroups.add(`${coverage.resourceType}\u0000${coverage.financialRole}`);
        coveredScopeIds.push(...coverage.scopeIds);
        coverage.scopeIds.forEach(scopeId => financialRoleByScope.set(scopeId, coverage.financialRole));
    }
    if (new Set(coveredScopeIds).size !== coveredScopeIds.length)
        return false;
    const bundleIds = new Set(authority.evidenceBundles.map(bundle => bundle.bundleId));
    const bundleById = new Map(authority.evidenceBundles.map(bundle => [bundle.bundleId, bundle]));
    const assessmentById = new Map(authority.evidenceAssessments.map(assessment => [assessment.assessmentId, assessment]));
    if (bundleIds.size !== authority.evidenceBundles.length || assessmentById.size !== authority.evidenceAssessments.length)
        return false;
    const evidenceById = new Map();
    for (const reference of authority.evidenceBundles.flatMap(bundle => bundle.references)) {
        if (Date.parse(reference.intrinsicTime.at) > Date.parse(authority.artifactGeneration.generatedAt))
            return false;
        const referenceText = canonicalText(reference);
        const existing = evidenceById.get(reference.evidenceRefId);
        if (existing !== undefined && existing !== referenceText)
            return false;
        evidenceById.set(reference.evidenceRefId, referenceText);
    }
    if (authority.evidenceAssessments.some(assessment => assessment.evidenceBundleId !== undefined && !bundleIds.has(assessment.evidenceBundleId)) ||
        !authority.coordinates.every(coordinate => isCoordinate(coordinate, coveredScopeIds, financialRoleByScope, [...authority.providerAccountRefs], assessmentById, bundleIds, bundleById)) ||
        !hasReconciledEstimateLensGroups(authority.coordinates) ||
        new Set(authority.coordinates.map(coordinate => coordinate.coordinateId)).size !== authority.coordinates.length)
        return false;
    const { authorityId: _authorityId, ...identity } = authority;
    return authority.authorityId === createFinancialAuthorityViewIdV1(identity);
};
export const isFinancialAuthorityViewBoundToArtifactGenerationV1 = (value, expected) => isFinancialAuthorityViewV1(value) &&
    value.artifactGeneration.runId === expected.runId &&
    value.artifactGeneration.generatedAt === expected.generatedAt;
