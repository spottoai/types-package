import { validateAwsCommitmentsPlanningViewIdentity } from './commitmentsPlanningValidation.js';
import { AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME, } from './portalCommitmentsPlanningPublicArtifacts.js';
import { asRecord, assertExactKeys, assertPublicJson, assertValue, validatePortalEnvelope } from './portalPublicArtifactValidationCommon.js';
const TOP_LEVEL_KEYS = [
    'schemaVersion',
    'portalSchemaVersion',
    'provider',
    'accountId',
    'artifactType',
    'artifactGeneration',
    'logicalName',
    'version',
    'generatedAt',
    'month',
    'providerScope',
    'utilizationSummary',
    'expirySummary',
    'inventory',
    'resourceCoverage',
    'obsoleteCandidates',
    'reallocationOpportunities',
    'pricingContext',
    'termStrategy',
    'freshness',
    'vendorRecommendations',
    'purchaseRecommendations',
    'diagnostics',
    'coverage',
    'renewals',
    'risk',
    'retirementImpact',
    'phasedOptions',
];
/** Validates one untrusted immutable AWS Commitments Planning Portal artifact. */
export function validateAwsPortalCommitmentsPlanningArtifact(value) {
    const artifact = asRecord(value, 'artifact');
    const { accountId } = validatePortalEnvelope(artifact, 'commitments-planning', TOP_LEVEL_KEYS);
    assertValue(artifact.logicalName, AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME, 'artifact.logicalName');
    validateAwsCommitmentsPlanningViewIdentity(artifact, accountId);
    validateBody(artifact);
    assertPublicJson(artifact, 'artifact');
    return value;
}
function validateBody(artifact) {
    exact(artifact.providerScope, ['providerName', 'providerScopeId'], 'artifact.providerScope');
    validateUtilizationSummary(artifact.utilizationSummary, 'artifact.utilizationSummary');
    exact(artifact.expirySummary, ['expired', 'expiring30d', 'expiring60d', 'expiring90d', 'expiring180d'], 'artifact.expirySummary');
    records(artifact.inventory, 'artifact.inventory', validateInventory);
    records(artifact.resourceCoverage, 'artifact.resourceCoverage', validateResourceCoverage);
    records(artifact.obsoleteCandidates, 'artifact.obsoleteCandidates', validateObsoleteCandidate);
    optionalRecords(artifact.reallocationOpportunities, 'artifact.reallocationOpportunities', validateReallocation);
    validatePricingContext(artifact.pricingContext, 'artifact.pricingContext');
    records(artifact.termStrategy, 'artifact.termStrategy', validateTermStrategy);
    optionalRecord(artifact.freshness, 'artifact.freshness', validateFreshness);
    optionalRecords(artifact.vendorRecommendations, 'artifact.vendorRecommendations', validateVendorRecommendation);
    optionalRecords(artifact.purchaseRecommendations, 'artifact.purchaseRecommendations', validatePurchaseRecommendation);
    optionalRecord(artifact.diagnostics, 'artifact.diagnostics', validateDiagnostics);
    optionalRecords(artifact.coverage, 'artifact.coverage', validateCoverage);
    optionalRecords(artifact.renewals, 'artifact.renewals', validateRenewal);
    optionalRecord(artifact.risk, 'artifact.risk', validateRisk);
    optionalRecords(artifact.retirementImpact, 'artifact.retirementImpact', validateRetirementImpact);
    optionalRecords(artifact.phasedOptions, 'artifact.phasedOptions', validatePhasedOption);
}
function validateUtilizationSummary(value, field) {
    const summary = exact(value, ['total', 'withData', 'sevenDayAverage', 'thirtyDayAverage', 'sevenDayAggregates', 'thirtyDayAggregates', 'byBenefitType'], field);
    optionalRecords(summary.sevenDayAggregates, `${field}.sevenDayAggregates`, validateWeightedAggregate);
    optionalRecords(summary.thirtyDayAggregates, `${field}.thirtyDayAggregates`, validateWeightedAggregate);
    records(summary.byBenefitType, `${field}.byBenefitType`, (entry, itemField) => {
        const item = exact(entry, ['benefitType', 'total', 'withData', 'sevenDayAverage', 'thirtyDayAverage', 'sevenDayAggregates', 'thirtyDayAggregates'], itemField);
        optionalRecords(item.sevenDayAggregates, `${itemField}.sevenDayAggregates`, validateWeightedAggregate);
        optionalRecords(item.thirtyDayAggregates, `${itemField}.thirtyDayAggregates`, validateWeightedAggregate);
    });
}
function validateWeightedAggregate(value, field) {
    exact(value, ['used', 'reserved', 'percentage', 'sampleCount', 'unit', 'currency'], field);
}
function validateInventory(value, field) {
    const item = exact(value, [
        'id',
        'benefitType',
        'commitmentFamily',
        'sourceKind',
        'sourceId',
        'provider',
        'shape',
        'scope',
        'appliedScopeType',
        'appliedScopeProperties',
        'type',
        'displayName',
        'status',
        'purchaseDate',
        'expiryDate',
        'daysToExpiry',
        'reservedQuantity',
        'commitmentAmount',
        'commitmentCurrencyCode',
        'commitmentGrain',
        'commitmentUnit',
        'skuName',
        'skuDescription',
        'location',
        'term',
        'termMonths',
        'billingPlan',
        'appliedScopeDisplayName',
        'provisioningState',
        'renew',
        'purchasedQuantity',
        'usedQuantity',
        'remainingQuantity',
        'totalReservedQuantity',
        'reservedHours',
        'usedHours',
        'utilization',
        'coveragePercent',
        'annualCommittedCost',
        'optimizationImpact',
        'doNotRenewAnnualImpact',
        'riskLevel',
        'confidence',
        'linkedRecommendationIds',
        'renewalDecisionIds',
        'retirementImpactIds',
    ], field);
    optionalRecord(item.shape, `${field}.shape`, validateShape);
    validateAppliedScope(item.appliedScopeProperties, `${field}.appliedScopeProperties`);
    optionalRecord(item.utilization, `${field}.utilization`, (entry, itemField) => exact(entry, ['trend', 'oneDay', 'sevenDay', 'thirtyDay', 'source'], itemField));
    optionalMoney(item.annualCommittedCost, `${field}.annualCommittedCost`);
    optionalMoney(item.optimizationImpact, `${field}.optimizationImpact`);
    optionalMoney(item.doNotRenewAnnualImpact, `${field}.doNotRenewAnnualImpact`);
}
function validateResourceCoverage(value, field) {
    const item = exact(value, [
        'resourceId',
        'resourceName',
        'resourceType',
        'month',
        'windowStart',
        'windowEnd',
        'currency',
        'benefitIds',
        'benefitNames',
        'basis',
        'coveredQuantity',
        'eligibleQuantity',
        'coveredCost',
        'eligibleCost',
        'uncoveredCost',
        'coveragePercent',
        'recommendationIds',
        'recommendationType',
        'recommendedAction',
        'eligibility',
        'recommendationImpact',
        'source',
        'benefitBreakdown',
    ], field);
    optionalRecord(item.eligibility, `${field}.eligibility`, validateEligibility);
    optionalRecord(item.recommendationImpact, `${field}.recommendationImpact`, (entry, itemField) => exact(entry, ['amount', 'currency', 'source'], itemField));
    optionalRecord(item.source, `${field}.source`, validateSource);
    optionalRecords(item.benefitBreakdown, `${field}.benefitBreakdown`, (entry, itemField) => exact(entry, ['benefitId', 'benefitName', 'coveredQuantity', 'coveredCost'], itemField));
}
function validateObsoleteCandidate(value, field) {
    const item = exact(value, ['id', 'candidateType', 'reasonCodes', 'suggestedAction', 'confidence', 'impactEstimate', 'relatedBenefitIds'], field);
    optionalRecord(item.impactEstimate, `${field}.impactEstimate`, (entry, itemField) => exact(entry, ['amount', 'currency', 'currencySymbol', 'source', 'notes', 'windowStart', 'windowEnd', 'flags'], itemField));
}
function validateReallocation(value, field) {
    const item = exact(value, [
        'id',
        'fromResource',
        'toResource',
        'estimatedNetSavings',
        'currency',
        'source',
        'confidence',
        'assumptions',
        'benefitIds',
        'benefitNames',
        'recommendationIds',
        'obsoleteCandidateIds',
    ], field);
    validateReallocationResource(item.fromResource, `${field}.fromResource`);
    validateReallocationResource(item.toResource, `${field}.toResource`);
}
function validateReallocationResource(value, field) {
    exact(value, ['resourceId', 'resourceName', 'resourceType'], field);
}
function validatePurchaseRecommendation(value, field) {
    const item = exact(value, [
        'id',
        'groupKey',
        'commitmentFamily',
        'action',
        'eligibility',
        'currentShape',
        'targetShape',
        'blockers',
        'unlockActions',
        'purchaseScope',
        'appliedScopeProperties',
        'source',
        'title',
        'description',
        'confidence',
        'riskLevel',
        'location',
        'skuName',
        'normalizedSkuName',
        'resourceType',
        'vmSizeFlexibilityGroup',
        'termMonths',
        'quantity',
        'coverageState',
        'estimatedAnnualSavings',
        'estimatedAnnualCost',
        'estimatedTermSavings',
        'estimatedTermCost',
        'termOptions',
        'impactedResources',
        'sourceRecommendationIds',
        'linkedCommitmentIds',
        'notes',
    ], field);
    optionalRecord(item.eligibility, `${field}.eligibility`, validateEligibility);
    optionalRecord(item.currentShape, `${field}.currentShape`, validateShape);
    validateShape(item.targetShape, `${field}.targetShape`);
    optionalRecords(item.blockers, `${field}.blockers`, validateBlocker);
    optionalRecords(item.unlockActions, `${field}.unlockActions`, validateUnlockAction);
    validateAppliedScope(item.appliedScopeProperties, `${field}.appliedScopeProperties`);
    validateSource(item.source, `${field}.source`);
    optionalMoney(item.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`);
    optionalMoney(item.estimatedAnnualCost, `${field}.estimatedAnnualCost`);
    optionalMoney(item.estimatedTermSavings, `${field}.estimatedTermSavings`);
    optionalMoney(item.estimatedTermCost, `${field}.estimatedTermCost`);
    optionalRecords(item.termOptions, `${field}.termOptions`, validateTermOption);
    optionalRecords(item.impactedResources, `${field}.impactedResources`, validateResourceReference);
}
function validateEligibility(value, field) {
    const eligibility = exact(value, [
        'status',
        'action',
        'currentShape',
        'targetShape',
        'targetSelectionStrategy',
        'targetSelectionReason',
        'blockers',
        'unlockActions',
        'source',
        'confidence',
    ], field);
    optionalRecord(eligibility.currentShape, `${field}.currentShape`, validateShape);
    optionalRecord(eligibility.targetShape, `${field}.targetShape`, validateShape);
    optionalRecords(eligibility.blockers, `${field}.blockers`, validateBlocker);
    optionalRecords(eligibility.unlockActions, `${field}.unlockActions`, validateUnlockAction);
    optionalRecord(eligibility.source, `${field}.source`, validateSource);
}
function validateShape(value, field) {
    const shape = exact(value, [
        'provider',
        'resourceType',
        'commitmentFamily',
        'skuName',
        'normalizedSkuName',
        'location',
        'region',
        'availabilityZone',
        'platform',
        'reservationProductName',
        'reservedResourceType',
        'meterCategory',
        'meterSubCategory',
        'meterName',
        'unit',
        'attributes',
    ], field);
    if (shape.attributes !== undefined)
        asRecord(shape.attributes, `${field}.attributes`);
}
function validateAppliedScope(value, field) {
    exact(value, ['accountId', 'region', 'availabilityZone'], field);
}
function validateSource(value, field) {
    exact(value, ['sourceKind', 'sourceId', 'sourceName', 'generatedAt', 'observedAt', 'notes'], field);
}
function validateBlocker(value, field) {
    exact(value, ['code', 'message', 'source', 'sourceUrl', 'severity'], field);
}
function validateUnlockAction(value, field) {
    exact(value, ['id', 'label', 'description', 'actionType', 'order', 'source'], field);
}
function validateTermOption(value, field) {
    const option = exact(value, [
        'termMonths',
        'currentMonthly',
        'targetMonthly',
        'potentialMonthlySavings',
        'estimatedAnnualSavings',
        'estimatedAnnualCost',
        'estimatedTermSavings',
        'estimatedTermCost',
    ], field);
    optionalMoney(option.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`);
    optionalMoney(option.estimatedAnnualCost, `${field}.estimatedAnnualCost`);
    optionalMoney(option.estimatedTermSavings, `${field}.estimatedTermSavings`);
    optionalMoney(option.estimatedTermCost, `${field}.estimatedTermCost`);
}
function validateVendorRecommendation(value, field) {
    const item = exact(value, [
        'id',
        'commitmentFamily',
        'source',
        'action',
        'title',
        'description',
        'confidence',
        'riskLevel',
        'estimatedAnnualSavings',
        'estimatedAnnualCost',
        'impactedResources',
        'linkedCommitmentIds',
    ], field);
    validateSource(item.source, `${field}.source`);
    optionalMoney(item.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`);
    optionalMoney(item.estimatedAnnualCost, `${field}.estimatedAnnualCost`);
    optionalRecords(item.impactedResources, `${field}.impactedResources`, validateResourceReference);
}
function validateDiagnostics(value, field) {
    const diagnostics = exact(value, ['purchaseRecommendations'], field);
    optionalRecord(diagnostics.purchaseRecommendations, `${field}.purchaseRecommendations`, (entry, itemField) => {
        const recommendation = exact(entry, ['generatedAt', 'inputCounts', 'outputCounts', 'suppressedCounts', 'notes'], itemField);
        optionalOpenRecord(recommendation.inputCounts, `${itemField}.inputCounts`);
        optionalOpenRecord(recommendation.suppressedCounts, `${itemField}.suppressedCounts`);
        optionalRecord(recommendation.outputCounts, `${itemField}.outputCounts`, (output, outputField) => {
            const counts = exact(output, ['total', 'byAction', 'byStatus', 'bySourceKind', 'unattributed'], outputField);
            optionalOpenRecord(counts.byAction, `${outputField}.byAction`);
            optionalOpenRecord(counts.byStatus, `${outputField}.byStatus`);
            optionalOpenRecord(counts.bySourceKind, `${outputField}.bySourceKind`);
        });
    });
}
function validateCoverage(value, field) {
    const item = exact(value, [
        'commitmentFamily',
        'basis',
        'windowStart',
        'windowEnd',
        'eligibleCost',
        'coveredCost',
        'uncoveredCost',
        'coveragePercent',
        'impactedResources',
        'source',
    ], field);
    optionalMoney(item.eligibleCost, `${field}.eligibleCost`);
    optionalMoney(item.coveredCost, `${field}.coveredCost`);
    optionalMoney(item.uncoveredCost, `${field}.uncoveredCost`);
    optionalRecords(item.impactedResources, `${field}.impactedResources`, validateResourceReference);
    optionalRecord(item.source, `${field}.source`, validateSource);
}
function validateRenewal(value, field) {
    const item = exact(value, [
        'id',
        'commitmentId',
        'commitmentFamily',
        'action',
        'title',
        'expiryDate',
        'daysToExpiry',
        'confidence',
        'riskLevel',
        'estimatedAnnualSavings',
        'estimatedAnnualCostDelta',
        'modernizationTarget',
        'impactedResources',
        'recommendationsToReview',
        'source',
    ], field);
    optionalMoney(item.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`);
    optionalMoney(item.estimatedAnnualCostDelta, `${field}.estimatedAnnualCostDelta`);
    optionalRecord(item.modernizationTarget, `${field}.modernizationTarget`, (entry, itemField) => exact(entry, ['currentSku', 'targetSku', 'currentFamily', 'targetFamily', 'reasonCodes'], itemField));
    optionalRecords(item.impactedResources, `${field}.impactedResources`, validateResourceReference);
    optionalRecords(item.recommendationsToReview, `${field}.recommendationsToReview`, validateReviewSummary);
    optionalRecord(item.source, `${field}.source`, validateSource);
}
function validateReviewSummary(value, field) {
    const item = exact(value, [
        'id',
        'name',
        'category',
        'subCategory',
        'impact',
        'effort',
        'risk',
        'priorityTier',
        'headline',
        'plainSummary',
        'normalizedScore',
        'finalScore',
        'estimatedSavings',
        'resourceIds',
        'reasons',
    ], field);
    optionalMoney(item.estimatedSavings, `${field}.estimatedSavings`);
}
function validateRisk(value, field) {
    exact(value, ['overallRisk', 'overcommitmentRisk', 'undercoverageRisk', 'staleDataRisk', 'currency', 'expectedWaste', 'expectedUncoveredCost', 'notes'], field);
}
function validateRetirementImpact(value, field) {
    const item = exact(value, [
        'id',
        'commitmentId',
        'commitmentFamily',
        'scenario',
        'title',
        'effectiveDate',
        'incrementalMonthlyCost',
        'incrementalAnnualCost',
        'impactedResources',
        'linkedRetirementIds',
        'confidence',
        'riskLevel',
        'source',
    ], field);
    optionalMoney(item.incrementalMonthlyCost, `${field}.incrementalMonthlyCost`);
    optionalMoney(item.incrementalAnnualCost, `${field}.incrementalAnnualCost`);
    optionalRecords(item.impactedResources, `${field}.impactedResources`, validateResourceReference);
    optionalRecord(item.source, `${field}.source`, validateSource);
}
function validatePhasedOption(value, field) {
    const item = exact(value, [
        'id',
        'label',
        'commitmentFamily',
        'action',
        'termMonths',
        'quantity',
        'hourlyCommitmentAmount',
        'annualCommitmentCost',
        'estimatedAnnualSavings',
        'expectedCoveragePercent',
        'expectedWastePercent',
        'confidence',
        'riskLevel',
        'impactedResources',
        'source',
    ], field);
    optionalMoney(item.hourlyCommitmentAmount, `${field}.hourlyCommitmentAmount`);
    optionalMoney(item.annualCommitmentCost, `${field}.annualCommitmentCost`);
    optionalMoney(item.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`);
    optionalRecords(item.impactedResources, `${field}.impactedResources`, validateResourceReference);
    optionalRecord(item.source, `${field}.source`, validateSource);
}
function validateFreshness(value, field) {
    const freshness = exact(value, ['status', 'generatedAt', 'entries', 'warnings'], field);
    records(freshness.entries, `${field}.entries`, (entry, itemField) => exact(entry, ['section', 'status', 'generatedAt', 'observedAt', 'lastSuccessfulSyncAt', 'reason', 'sourceKind'], itemField));
}
function validatePricingContext(value, field) {
    exact(value, ['source', 'currency', 'assumptions', 'confidenceNotes', 'calculatorDeepLink'], field);
}
function validateTermStrategy(value, field) {
    const scenario = exact(value, [
        'scenarioId',
        'termMonths',
        'breakMonth',
        'policyInputs',
        'projectedGrossSavings',
        'projectedBreakCost',
        'projectedNetSavings',
        'annualizedProjectedNetSavings',
        'breakEvenMonth',
        'recommended',
        'currency',
        'notes',
    ], field);
    exact(scenario.policyInputs, ['earlyTerminationFeePercent', 'rollingCancellationCap', 'exchangeAllowed', 'policyVersion'], `${field}.policyInputs`);
}
function validateMoney(value, field) {
    exact(value, ['amount', 'currency', 'source', 'windowStart', 'windowEnd', 'flags'], field);
}
function validateResourceReference(value, field) {
    exact(value, ['resourceId', 'resourceName', 'resourceType', 'location'], field);
}
function exact(value, allowed, field) {
    const record = asRecord(value, field);
    assertExactKeys(record, allowed, field);
    return record;
}
function records(value, field, validate) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    value.forEach((entry, index) => validate(entry, `${field}[${index}]`));
}
function optionalRecords(value, field, validate) {
    if (value !== undefined)
        records(value, field, validate);
}
function optionalRecord(value, field, validate) {
    if (value !== undefined)
        validate(value, field);
}
function optionalOpenRecord(value, field) {
    if (value !== undefined)
        asRecord(value, field);
}
function optionalMoney(value, field) {
    if (value !== undefined)
        validateMoney(value, field);
}
