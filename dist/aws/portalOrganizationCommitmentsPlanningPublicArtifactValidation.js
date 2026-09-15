"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsOrganizationCommitmentsPlanningView = validateAwsOrganizationCommitmentsPlanningView;
exports.validateAwsPortalOrganizationCommitmentsPlanningArtifact = validateAwsPortalOrganizationCommitmentsPlanningArtifact;
const organizationCommitments_js_1 = require("./organizationCommitments.js");
const organizationCommitmentsValidation_js_1 = require("./organizationCommitmentsValidation.js");
const portalOrganizationCommitmentsPlanningPublicArtifacts_js_1 = require("./portalOrganizationCommitmentsPlanningPublicArtifacts.js");
const portalPublicArtifacts_js_1 = require("./portalPublicArtifacts.js");
const portalPublicArtifactValidationCommon_js_1 = require("./portalPublicArtifactValidationCommon.js");
const TOP_LEVEL_KEYS = [
    'schemaVersion',
    'portalSchemaVersion',
    'provider',
    'artifactType',
    'artifactGeneration',
    'logicalName',
    'manifestRevision',
    'version',
    'generatedAt',
    'month',
    'providerScope',
    'accounts',
    'utilizationSummary',
    'expirySummary',
    'inventory',
    'payerAggregates',
    'sharingPosture',
    'pricingContext',
    'freshness',
    'purchaseRecommendations',
    'allocation',
    'resourceAttribution',
];
/** Validates one untrusted organization Commitments Planning view without its Portal envelope. */
function validateAwsOrganizationCommitmentsPlanningView(value, expected) {
    (0, organizationCommitmentsValidation_js_1.validateAwsOrganizationCommitmentsPlanningViewIdentity)(value, expected);
    validateBody(value);
    (0, portalPublicArtifactValidationCommon_js_1.assertPublicJson)(value, 'organizationCommitmentsPlanning');
    return value;
}
/** Validates one untrusted immutable AWS organization Commitments Planning artifact. */
function validateAwsPortalOrganizationCommitmentsPlanningArtifact(value, expected) {
    const artifact = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, 'artifact');
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(artifact, TOP_LEVEL_KEYS, 'artifact');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(artifact.schemaVersion, portalOrganizationCommitmentsPlanningPublicArtifacts_js_1.AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.schemaVersion');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(artifact.portalSchemaVersion, portalPublicArtifacts_js_1.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.portalSchemaVersion');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(artifact.provider, 'aws', 'artifact.provider');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(artifact.artifactType, 'organization-commitments-planning', 'artifact.artifactType');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(artifact.logicalName, portalOrganizationCommitmentsPlanningPublicArtifacts_js_1.AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME, 'artifact.logicalName');
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(artifact.manifestRevision, 'artifact.manifestRevision');
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(artifact.version, '1.0', 'artifact.version');
    const generation = (0, portalPublicArtifactValidationCommon_js_1.validateGeneration)(artifact.artifactGeneration, 'artifact.artifactGeneration');
    const generatedAt = (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(artifact.generatedAt, 'artifact.generatedAt');
    if (Date.parse(generatedAt) > Date.parse(generation.generatedAt)) {
        throw new Error('artifact.generatedAt must not be newer than the Portal generation.');
    }
    if (artifact.month !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.requiredString)(artifact.month, 'artifact.month');
    validateAwsOrganizationCommitmentsPlanningView(artifact, expected);
    (0, portalPublicArtifactValidationCommon_js_1.assertPublicJson)(artifact, 'artifact');
    return value;
}
function validateBody(view) {
    records(view.accounts, 'artifact.accounts', validateAccount);
    validateUtilizationSummary(view.utilizationSummary, 'artifact.utilizationSummary');
    exact(view.expirySummary, ['expired', 'expiring30d', 'expiring60d', 'expiring90d', 'expiring180d'], 'artifact.expirySummary');
    records(view.inventory, 'artifact.inventory', validateInventory);
    records(view.payerAggregates, 'artifact.payerAggregates', validatePayerAggregate);
    validateSharingPosture(view.sharingPosture, 'artifact.sharingPosture');
    validatePricingContext(view.pricingContext, 'artifact.pricingContext');
    optionalRecord(view.freshness, 'artifact.freshness', validateFreshness);
    optionalRecords(view.purchaseRecommendations, 'artifact.purchaseRecommendations', validatePurchaseRecommendation);
    validateAttribution(view.allocation, 'artifact.allocation', validateAllocationRecord);
    validateAttribution(view.resourceAttribution, 'artifact.resourceAttribution', validateResourceAttributionRecord);
}
function validateSharingPosture(value, field) {
    const posture = exact(value, ['status', 'reason'], field);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(posture.status, 'unknown', `${field}.status`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(posture.reason, 'not-collected', `${field}.reason`);
}
function validateAccount(value, field) {
    const account = exact(value, ['accountId', 'displayName', 'role', 'inventoryStatus', 'lastSuccessfulRefreshAt'], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(account.accountId, `${field}.accountId`);
    optionalString(account.displayName, `${field}.displayName`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(account.role, ['management', 'member'], `${field}.role`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(account.inventoryStatus, ['current', 'stale', 'partial', 'unavailable'], `${field}.inventoryStatus`);
    optionalTimestamp(account.lastSuccessfulRefreshAt, `${field}.lastSuccessfulRefreshAt`);
}
function validateUtilizationSummary(value, field) {
    const summary = exact(value, ['total', 'withData', 'sevenDayAverage', 'thirtyDayAverage', 'sevenDayAggregates', 'thirtyDayAggregates', 'byBenefitType'], field);
    nonNegative(summary.total, `${field}.total`);
    nonNegative(summary.withData, `${field}.withData`);
    optionalNumber(summary.sevenDayAverage, `${field}.sevenDayAverage`);
    optionalNumber(summary.thirtyDayAverage, `${field}.thirtyDayAverage`);
    optionalRecords(summary.sevenDayAggregates, `${field}.sevenDayAggregates`, validateWeightedAggregate);
    optionalRecords(summary.thirtyDayAggregates, `${field}.thirtyDayAggregates`, validateWeightedAggregate);
    records(summary.byBenefitType, `${field}.byBenefitType`, (entry, itemField) => {
        const item = exact(entry, ['benefitType', 'total', 'withData', 'sevenDayAverage', 'thirtyDayAverage', 'sevenDayAggregates', 'thirtyDayAggregates'], itemField);
        (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(item.benefitType, ['reservation', 'savings-plan'], `${itemField}.benefitType`);
        nonNegative(item.total, `${itemField}.total`);
        nonNegative(item.withData, `${itemField}.withData`);
        optionalNumber(item.sevenDayAverage, `${itemField}.sevenDayAverage`);
        optionalNumber(item.thirtyDayAverage, `${itemField}.thirtyDayAverage`);
        optionalRecords(item.sevenDayAggregates, `${itemField}.sevenDayAggregates`, validateWeightedAggregate);
        optionalRecords(item.thirtyDayAggregates, `${itemField}.thirtyDayAggregates`, validateWeightedAggregate);
    });
}
function validateWeightedAggregate(value, field) {
    const aggregate = exact(value, ['used', 'reserved', 'percentage', 'sampleCount', 'unit', 'currency'], field);
    (0, portalPublicArtifactValidationCommon_js_1.finiteNumber)(aggregate.used, `${field}.used`);
    (0, portalPublicArtifactValidationCommon_js_1.finiteNumber)(aggregate.reserved, `${field}.reserved`);
    optionalNumber(aggregate.percentage, `${field}.percentage`);
    if (aggregate.sampleCount !== undefined)
        nonNegative(aggregate.sampleCount, `${field}.sampleCount`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(aggregate.unit, ['hours', 'quantity', 'currency'], `${field}.unit`);
    optionalString(aggregate.currency, `${field}.currency`);
}
function validateInventory(value, field) {
    const item = exact(value, [
        'id',
        'benefitType',
        'commitmentFamily',
        'sourceKind',
        'sourceId',
        'provider',
        'ownerAccountId',
        'shape',
        'scope',
        'type',
        'displayName',
        'status',
        'purchaseDate',
        'expiryDate',
        'daysToExpiry',
        'commitmentAmount',
        'commitmentCurrencyCode',
        'commitmentGrain',
        'commitmentUnit',
        'skuName',
        'location',
        'term',
        'termMonths',
        'billingPlan',
        'utilization',
    ], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(item.id, `${field}.id`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(item.benefitType, ['reservation', 'savings-plan'], `${field}.benefitType`);
    optionalString(item.commitmentFamily, `${field}.commitmentFamily`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(item.sourceKind, 'aws-native', `${field}.sourceKind`);
    optionalString(item.sourceId, `${field}.sourceId`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(item.provider, 'aws', `${field}.provider`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(item.ownerAccountId, `${field}.ownerAccountId`);
    optionalRecord(item.shape, `${field}.shape`, validateShape);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(item.scope, ['Shared', 'Single', 'ManagementGroup', 'Unknown'], `${field}.scope`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(item.type, `${field}.type`);
    optionalString(item.displayName, `${field}.displayName`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(item.status, `${field}.status`);
    optionalString(item.purchaseDate, `${field}.purchaseDate`);
    optionalString(item.expiryDate, `${field}.expiryDate`);
    optionalNumber(item.daysToExpiry, `${field}.daysToExpiry`);
    optionalNumber(item.commitmentAmount, `${field}.commitmentAmount`);
    optionalString(item.commitmentCurrencyCode, `${field}.commitmentCurrencyCode`);
    optionalString(item.commitmentGrain, `${field}.commitmentGrain`);
    optionalString(item.commitmentUnit, `${field}.commitmentUnit`);
    optionalString(item.skuName, `${field}.skuName`);
    optionalString(item.location, `${field}.location`);
    optionalString(item.term, `${field}.term`);
    optionalNumber(item.termMonths, `${field}.termMonths`);
    optionalString(item.billingPlan, `${field}.billingPlan`);
    optionalRecord(item.utilization, `${field}.utilization`, validateUtilization);
}
function validatePayerAggregate(value, field) {
    const aggregate = exact(value, [
        'benefitType',
        'commitmentFamily',
        'payerAccountId',
        'windowStart',
        'windowEnd',
        'eligibleCost',
        'coveredCost',
        'uncoveredCost',
        'coveragePercent',
        'utilization',
        'source',
    ], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(aggregate.benefitType, ['reservation', 'savings-plan'], `${field}.benefitType`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(aggregate.commitmentFamily, `${field}.commitmentFamily`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(aggregate.payerAccountId, `${field}.payerAccountId`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(aggregate.windowStart, `${field}.windowStart`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(aggregate.windowEnd, `${field}.windowEnd`);
    optionalRecord(aggregate.eligibleCost, `${field}.eligibleCost`, validateMoney);
    optionalRecord(aggregate.coveredCost, `${field}.coveredCost`, validateMoney);
    optionalRecord(aggregate.uncoveredCost, `${field}.uncoveredCost`, validateMoney);
    optionalNumber(aggregate.coveragePercent, `${field}.coveragePercent`);
    optionalRecord(aggregate.utilization, `${field}.utilization`, validateUtilization);
    validateSource(aggregate.source, `${field}.source`, false);
}
function validatePurchaseRecommendation(value, field) {
    const recommendation = exact(value, [
        'id',
        'groupKey',
        'commitmentFamily',
        'action',
        'purchaseScope',
        'payerAccountId',
        'recommendedAccountId',
        'source',
        'targetShape',
        'title',
        'description',
        'confidence',
        'riskLevel',
        'termMonths',
        'quantity',
        'estimatedAnnualSavings',
        'estimatedAnnualCost',
        'estimatedTermSavings',
        'estimatedTermCost',
        'notes',
    ], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(recommendation.id, `${field}.id`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(recommendation.groupKey, `${field}.groupKey`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(recommendation.commitmentFamily, `${field}.commitmentFamily`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(recommendation.action, ['buy', 'unlock', 'savings-plan', 'none'], `${field}.action`);
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(recommendation.purchaseScope, 'payer', `${field}.purchaseScope`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(recommendation.payerAccountId, `${field}.payerAccountId`);
    optionalString(recommendation.recommendedAccountId, `${field}.recommendedAccountId`);
    validateSource(recommendation.source, `${field}.source`, false);
    validateShape(recommendation.targetShape, `${field}.targetShape`);
    optionalString(recommendation.title, `${field}.title`);
    optionalString(recommendation.description, `${field}.description`);
    optionalString(recommendation.confidence, `${field}.confidence`);
    optionalString(recommendation.riskLevel, `${field}.riskLevel`);
    optionalNumber(recommendation.termMonths, `${field}.termMonths`);
    optionalNumber(recommendation.quantity, `${field}.quantity`);
    optionalRecord(recommendation.estimatedAnnualSavings, `${field}.estimatedAnnualSavings`, validateMoney);
    optionalRecord(recommendation.estimatedAnnualCost, `${field}.estimatedAnnualCost`, validateMoney);
    optionalRecord(recommendation.estimatedTermSavings, `${field}.estimatedTermSavings`, validateMoney);
    optionalRecord(recommendation.estimatedTermCost, `${field}.estimatedTermCost`, validateMoney);
    optionalStrings(recommendation.notes, `${field}.notes`);
}
function validateAttribution(value, field, validateRecord) {
    const evidence = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, field);
    if (evidence.status === 'unavailable') {
        (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(evidence, ['status', 'reason'], field);
        (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(evidence.reason, organizationCommitments_js_1.AWS_ORGANIZATION_COMMITMENTS_ATTRIBUTION_UNAVAILABLE_REASONS, `${field}.reason`);
        return;
    }
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(evidence.status, 'available', `${field}.status`);
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(evidence, ['status', 'source', 'records'], field);
    validateSource(evidence.source, `${field}.source`, true);
    records(evidence.records, `${field}.records`, validateRecord, true);
}
function validateAllocationRecord(value, field) {
    const record = exact(value, [
        'beneficiaryAccountId',
        'ownerAccountId',
        'commitmentId',
        'benefitType',
        'commitmentFamily',
        'windowStart',
        'windowEnd',
        'eligibleCost',
        'coveredCost',
        'uncoveredCost',
    ], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.beneficiaryAccountId, `${field}.beneficiaryAccountId`);
    optionalString(record.ownerAccountId, `${field}.ownerAccountId`);
    optionalString(record.commitmentId, `${field}.commitmentId`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(record.benefitType, ['reservation', 'savings-plan'], `${field}.benefitType`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.commitmentFamily, `${field}.commitmentFamily`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.windowStart, `${field}.windowStart`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.windowEnd, `${field}.windowEnd`);
    optionalRecord(record.eligibleCost, `${field}.eligibleCost`, validateMoney);
    optionalRecord(record.coveredCost, `${field}.coveredCost`, validateMoney);
    optionalRecord(record.uncoveredCost, `${field}.uncoveredCost`, validateMoney);
}
function validateResourceAttributionRecord(value, field) {
    const record = exact(value, ['accountId', 'resourceId', 'resourceName', 'resourceType', 'benefitIds', 'windowStart', 'windowEnd', 'coveredCost'], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.accountId, `${field}.accountId`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.resourceId, `${field}.resourceId`);
    optionalString(record.resourceName, `${field}.resourceName`);
    optionalString(record.resourceType, `${field}.resourceType`);
    strings(record.benefitIds, `${field}.benefitIds`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.windowStart, `${field}.windowStart`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(record.windowEnd, `${field}.windowEnd`);
    optionalRecord(record.coveredCost, `${field}.coveredCost`, validateMoney);
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
    (0, portalPublicArtifactValidationCommon_js_1.assertValue)(shape.provider, 'aws', `${field}.provider`);
    if (shape.attributes !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.asRecord)(shape.attributes, `${field}.attributes`);
}
function validateSource(value, field, allowDerived) {
    const source = exact(value, ['sourceKind', 'sourceId', 'sourceName', 'generatedAt', 'observedAt', 'notes'], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(source.sourceKind, allowDerived ? ['aws-native', 'spotto-derived'] : ['aws-native'], `${field}.sourceKind`);
    optionalString(source.sourceId, `${field}.sourceId`);
    optionalString(source.sourceName, `${field}.sourceName`);
    optionalTimestamp(source.generatedAt, `${field}.generatedAt`);
    optionalTimestamp(source.observedAt, `${field}.observedAt`);
    optionalStrings(source.notes, `${field}.notes`);
}
function validateMoney(value, field) {
    const money = exact(value, ['amount', 'currency', 'source', 'windowStart', 'windowEnd', 'flags'], field);
    (0, portalPublicArtifactValidationCommon_js_1.finiteNumber)(money.amount, `${field}.amount`);
    (0, portalPublicArtifactValidationCommon_js_1.requiredString)(money.currency, `${field}.currency`);
    optionalString(money.source, `${field}.source`);
    optionalString(money.windowStart, `${field}.windowStart`);
    optionalString(money.windowEnd, `${field}.windowEnd`);
    optionalStrings(money.flags, `${field}.flags`);
}
function validateUtilization(value, field) {
    const utilization = exact(value, ['trend', 'oneDay', 'sevenDay', 'thirtyDay', 'source'], field);
    optionalString(utilization.trend, `${field}.trend`);
    optionalNumber(utilization.oneDay, `${field}.oneDay`);
    optionalNumber(utilization.sevenDay, `${field}.sevenDay`);
    optionalNumber(utilization.thirtyDay, `${field}.thirtyDay`);
    optionalString(utilization.source, `${field}.source`);
}
function validatePricingContext(value, field) {
    const pricing = exact(value, ['source', 'currency', 'assumptions', 'confidenceNotes', 'calculatorDeepLink'], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(pricing.source, ['retail', 'negotiated', 'unknown', 'recommendation-apis'], `${field}.source`);
    optionalString(pricing.currency, `${field}.currency`);
    optionalStrings(pricing.assumptions, `${field}.assumptions`);
    optionalString(pricing.confidenceNotes, `${field}.confidenceNotes`);
    optionalString(pricing.calculatorDeepLink, `${field}.calculatorDeepLink`);
}
function validateFreshness(value, field) {
    const freshness = exact(value, ['status', 'generatedAt', 'entries', 'warnings'], field);
    (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(freshness.status, ['current', 'stale', 'partial', 'unavailable'], `${field}.status`);
    (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(freshness.generatedAt, `${field}.generatedAt`);
    records(freshness.entries, `${field}.entries`, (entry, itemField) => {
        const item = exact(entry, ['section', 'status', 'generatedAt', 'observedAt', 'lastSuccessfulSyncAt', 'reason', 'sourceKind'], itemField);
        (0, portalPublicArtifactValidationCommon_js_1.requiredString)(item.section, `${itemField}.section`);
        (0, portalPublicArtifactValidationCommon_js_1.requiredEnum)(item.status, ['current', 'stale', 'partial', 'unavailable'], `${itemField}.status`);
        optionalTimestamp(item.generatedAt, `${itemField}.generatedAt`);
        optionalTimestamp(item.observedAt, `${itemField}.observedAt`);
        optionalTimestamp(item.lastSuccessfulSyncAt, `${itemField}.lastSuccessfulSyncAt`);
        optionalString(item.reason, `${itemField}.reason`);
        optionalString(item.sourceKind, `${itemField}.sourceKind`);
    });
    optionalStrings(freshness.warnings, `${field}.warnings`);
}
function exact(value, allowed, field) {
    const record = (0, portalPublicArtifactValidationCommon_js_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_js_1.assertExactKeys)(record, allowed, field);
    return record;
}
function records(value, field, validate, nonEmpty = false) {
    if (!Array.isArray(value) || (nonEmpty && value.length === 0)) {
        throw new Error(`${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array.`);
    }
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
function strings(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    value.forEach((entry, index) => (0, portalPublicArtifactValidationCommon_js_1.requiredString)(entry, `${field}[${index}]`));
}
function optionalStrings(value, field) {
    if (value !== undefined)
        strings(value, field);
}
function optionalString(value, field) {
    if (value !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.requiredString)(value, field);
}
function optionalTimestamp(value, field) {
    if (value !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.isoTimestamp)(value, field);
}
function optionalNumber(value, field) {
    if (value !== undefined)
        (0, portalPublicArtifactValidationCommon_js_1.finiteNumber)(value, field);
}
function nonNegative(value, field) {
    const number = (0, portalPublicArtifactValidationCommon_js_1.finiteNumber)(value, field);
    if (number < 0)
        throw new Error(`${field} must not be negative.`);
}
//# sourceMappingURL=portalOrganizationCommitmentsPlanningPublicArtifactValidation.js.map