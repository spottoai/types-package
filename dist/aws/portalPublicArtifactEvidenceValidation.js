"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAwsPortalBillingBlock = validateAwsPortalBillingBlock;
exports.validateAwsPortalRecommendationCoverage = validateAwsPortalRecommendationCoverage;
exports.validateRecommendationSourceEvidence = validateRecommendationSourceEvidence;
exports.validateRecommendationActionHealth = validateRecommendationActionHealth;
const portalPublicArtifactValidationCommon_1 = require("./portalPublicArtifactValidationCommon");
function validateAwsPortalBillingBlock(value, field, outerBilling, accountId, accountBody) {
    const billing = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    const accountFields = [
        'costViewByCurrency',
        'groupedCosts',
        'commitmentSpend',
        'resourceAttribution',
        'calendarSummary',
        'periodSummary',
        'spendTrend',
        'comparison',
    ];
    const resourceFields = ['pricingReferenceEstimation', 'estimatedBillingAuthority'];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(billing, ['scope', 'freshness', 'summary', 'totalsByCurrency', ...(accountBody ? accountFields : resourceFields)], field);
    validateBillingEvidenceScope(billing.scope, outerBilling, accountId, `${field}.scope`);
    (0, portalPublicArtifactValidationCommon_1.validateFreshness)(billing.freshness, `${field}.freshness`, 'lastSuccessfulImportAt');
    validateBillingSummary(billing.summary, `${field}.summary`);
    validateBillingGroupedResult(billing.totalsByCurrency, `${field}.totalsByCurrency`);
    if (!accountBody) {
        if (billing.pricingReferenceEstimation !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(billing.pricingReferenceEstimation, `${field}.pricingReferenceEstimation`);
        if (billing.estimatedBillingAuthority !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(billing.estimatedBillingAuthority, `${field}.estimatedBillingAuthority`);
        return;
    }
    (0, portalPublicArtifactValidationCommon_1.validateJsonArray)(billing.costViewByCurrency, `${field}.costViewByCurrency`);
    const grouped = (0, portalPublicArtifactValidationCommon_1.asRecord)(billing.groupedCosts, `${field}.groupedCosts`);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(grouped, ['byChargeCategory', 'byServiceCode', 'byServiceCategory'], `${field}.groupedCosts`);
    validateBillingGroupedResult(grouped.byChargeCategory, `${field}.groupedCosts.byChargeCategory`, 'chargeCategory');
    validateBillingGroupedResult(grouped.byServiceCode, `${field}.groupedCosts.byServiceCode`, 'serviceCode');
    if (grouped.byServiceCategory !== undefined)
        validateBillingGroupedResult(grouped.byServiceCategory, `${field}.groupedCosts.byServiceCategory`, 'serviceCategory');
    ['commitmentSpend', 'resourceAttribution', 'calendarSummary', 'periodSummary', 'spendTrend', 'comparison'].forEach(key => {
        if (billing[key] !== undefined)
            (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(billing[key], `${field}.${key}`);
    });
}
function validateAwsPortalRecommendationCoverage(value, accountId, regions, field, sources, includeTrust) {
    const recommendations = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(recommendations, ['sources'], field);
    if (!Array.isArray(recommendations.sources))
        throw new Error(`${field}.sources must be an array.`);
    const seenSources = [];
    recommendations.sources.forEach((entry, index) => {
        const itemField = `${field}.sources[${index}]`;
        const source = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(source, includeTrust
            ? ['source', 'scope', 'summary', 'counts', 'savings', 'sourceEvidence', 'actionHealth']
            : ['source', 'scope', 'summary', 'counts', 'savings'], itemField);
        const sourceName = (0, portalPublicArtifactValidationCommon_1.requiredString)(source.source, `${itemField}.source`);
        if (!sources.includes(sourceName))
            throw new Error(`${itemField}.source is not declared.`);
        seenSources.push(sourceName);
        const scope = (0, portalPublicArtifactValidationCommon_1.asRecord)(source.scope, `${itemField}.scope`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(scope, ['provider', 'source', 'scope', 'accountId', 'resourceRegions'], `${itemField}.scope`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.provider, 'aws', `${itemField}.scope.provider`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.source, sourceName, `${itemField}.scope.source`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.scope, 'account', `${itemField}.scope.scope`);
        (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.accountId, accountId, `${itemField}.scope.accountId`);
        const nestedRegions = (0, portalPublicArtifactValidationCommon_1.stringArray)(scope.resourceRegions, `${itemField}.scope.resourceRegions`);
        if (JSON.stringify(nestedRegions) !== JSON.stringify(regions))
            throw new Error(`${itemField}.scope.resourceRegions must match artifact scope exactly.`);
        validateRecommendationSummary(source.summary, `${itemField}.summary`);
        validateRecommendationCounts(source.counts, `${itemField}.counts`);
        validateRecommendationSavings(source.savings, `${itemField}.savings`);
        if (source.sourceEvidence !== undefined)
            validateRecommendationSourceEvidence(source.sourceEvidence, `${itemField}.sourceEvidence`);
        if (source.actionHealth !== undefined)
            validateRecommendationActionHealth(source.actionHealth, `${itemField}.actionHealth`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(seenSources, `${field}.sources`);
}
function validateBillingEvidenceScope(value, outerBilling, accountId, field) {
    const scope = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(scope, ['provider', 'source', 'scope', 'accountId', 'reportName', 'billingPeriod'], field);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.provider, 'aws', `${field}.provider`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.source, outerBilling.source, `${field}.source`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.scope, 'account', `${field}.scope`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.accountId, accountId, `${field}.accountId`);
    (0, portalPublicArtifactValidationCommon_1.assertValue)(scope.reportName, outerBilling.source === 'cur' ? outerBilling.reportName : outerBilling.exportName, `${field}.reportName`);
    if (JSON.stringify(scope.billingPeriod) !== JSON.stringify(outerBilling.billingPeriod))
        throw new Error(`${field}.billingPeriod must match artifact scope exactly.`);
}
function validateBillingSummary(value, field) {
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, ['totalPersistedExpenseCount', 'emptyScope', 'metadataFound', 'metadataMatchesRequestedBillingPeriod'], field);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(summary.totalPersistedExpenseCount, `${field}.totalPersistedExpenseCount`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.emptyScope, `${field}.emptyScope`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.metadataFound, `${field}.metadataFound`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.metadataMatchesRequestedBillingPeriod, `${field}.metadataMatchesRequestedBillingPeriod`);
}
function validateBillingGroupedResult(value, field, label) {
    const result = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(result, ['totalGroupCount', 'returnedGroupCount', 'truncated', 'items'], field);
    const total = (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(result.totalGroupCount, `${field}.totalGroupCount`);
    const returned = (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(result.returnedGroupCount, `${field}.returnedGroupCount`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(result.truncated, `${field}.truncated`);
    if (returned > total)
        throw new Error(`${field}.returnedGroupCount must not exceed totalGroupCount.`);
    if (!Array.isArray(result.items) || result.items.length !== returned)
        throw new Error(`${field}.items length must equal returnedGroupCount.`);
    const identities = [];
    result.items.forEach((entry, index) => {
        const itemField = `${field}.items[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, [...(label ? [label] : []), 'currency', 'expenseCount', 'baseCostAmount', 'amortizedCostAmount', 'amortizedExpenseCount'], itemField);
        if (label)
            (0, portalPublicArtifactValidationCommon_1.requiredString)(item[label], `${itemField}.${label}`);
        const currency = (0, portalPublicArtifactValidationCommon_1.requiredString)(item.currency, `${itemField}.currency`);
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item.expenseCount, `${itemField}.expenseCount`);
        (0, portalPublicArtifactValidationCommon_1.finiteNumber)(item.baseCostAmount, `${itemField}.baseCostAmount`);
        if (item.amortizedCostAmount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.finiteNumber)(item.amortizedCostAmount, `${itemField}.amortizedCostAmount`);
        if (item.amortizedExpenseCount !== undefined)
            (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item.amortizedExpenseCount, `${itemField}.amortizedExpenseCount`);
        identities.push(`${label ? String(item[label]) : ''}|${currency}`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, `${field}.items`);
}
function validateRecommendationSummary(value, field) {
    const summary = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    const counts = [
        'totalStateCount',
        'currentStateCount',
        'missingStateCount',
        'snapshotBackedCount',
        'orphanSnapshotCount',
        'matchedStateCount',
        'filteredOutStateCount',
    ];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(summary, [...counts, 'emptyScope', 'emptyResult'], field);
    counts.forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(summary[key], `${field}.${key}`));
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.emptyScope, `${field}.emptyScope`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(summary.emptyResult, `${field}.emptyResult`);
}
function validateRecommendationCounts(value, field) {
    const counts = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    const groups = [
        ['byLifecycleStatus', 'lifecycleStatus'],
        ['bySourcePresence', 'sourcePresence'],
        ['byCategory', 'category'],
        ['byRegion', 'region'],
        ['bySourceService', 'sourceService'],
        ['byResourceType', 'resourceType'],
        ['byActionType', 'actionType'],
        ['byImplementationEffort', 'implementationEffort'],
    ];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(counts, groups.map(([group]) => group), field);
    groups.forEach(([group, label]) => validateCountGroup(counts[group], `${field}.${group}`, label));
}
function validateCountGroup(value, field, label) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    const identities = [];
    value.forEach((entry, index) => {
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, `${field}[${index}]`);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, [label, 'count'], `${field}[${index}]`);
        identities.push((0, portalPublicArtifactValidationCommon_1.requiredString)(item[label], `${field}[${index}].${label}`));
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item.count, `${field}[${index}].count`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(identities, field);
}
function validateRecommendationSavings(value, field) {
    const savings = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    const counts = [
        'snapshotBackedMatchedCount',
        'positiveEstimatedSavingsRecommendationCount',
        'nonPositiveEstimatedSavingsCount',
        'missingEstimatedSavingsCount',
        'missingCurrencyCodeCount',
    ];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(savings, [...counts, 'emptySavings', 'mixedCurrencies', 'byCurrency'], field);
    counts.forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(savings[key], `${field}.${key}`));
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(savings.emptySavings, `${field}.emptySavings`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(savings.mixedCurrencies, `${field}.mixedCurrencies`);
    if (!Array.isArray(savings.byCurrency))
        throw new Error(`${field}.byCurrency must be an array.`);
    const currencies = [];
    savings.byCurrency.forEach((entry, index) => {
        const itemField = `${field}.byCurrency[${index}]`;
        const item = (0, portalPublicArtifactValidationCommon_1.asRecord)(entry, itemField);
        (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(item, ['currencyCode', 'recommendationCount', 'totalEstimatedMonthlySavings'], itemField);
        currencies.push((0, portalPublicArtifactValidationCommon_1.requiredString)(item.currencyCode, `${itemField}.currencyCode`));
        (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(item.recommendationCount, `${itemField}.recommendationCount`);
        (0, portalPublicArtifactValidationCommon_1.finiteNumber)(item.totalEstimatedMonthlySavings, `${itemField}.totalEstimatedMonthlySavings`);
    });
    (0, portalPublicArtifactValidationCommon_1.assertUnique)(currencies, `${field}.byCurrency`);
}
function validateRecommendationSourceEvidence(value, field) {
    const evidence = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    const baseKeys = [
        'totalStateCount',
        'currentStateCount',
        'missingStateCount',
        'snapshotBackedCount',
        'orphanSnapshotCount',
        'matchedStateCount',
        'filteredOutStateCount',
        'emptyScope',
        'emptyResult',
    ];
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(evidence, [...baseKeys, 'partialSourceEvidence', 'oldestRecommendationSynchronizedAt', 'latestRecommendationSynchronizedAt', 'exactScopeCoverage'], field);
    baseKeys.filter(key => !['emptyScope', 'emptyResult'].includes(key)).forEach(key => (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(evidence[key], `${field}.${key}`));
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(evidence.emptyScope, `${field}.emptyScope`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(evidence.emptyResult, `${field}.emptyResult`);
    (0, portalPublicArtifactValidationCommon_1.requiredBoolean)(evidence.partialSourceEvidence, `${field}.partialSourceEvidence`);
    if (evidence.oldestRecommendationSynchronizedAt !== undefined)
        (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(evidence.oldestRecommendationSynchronizedAt, `${field}.oldestRecommendationSynchronizedAt`);
    if (evidence.latestRecommendationSynchronizedAt !== undefined)
        (0, portalPublicArtifactValidationCommon_1.isoTimestamp)(evidence.latestRecommendationSynchronizedAt, `${field}.latestRecommendationSynchronizedAt`);
    if (evidence.exactScopeCoverage !== undefined)
        (0, portalPublicArtifactValidationCommon_1.validateJsonObject)(evidence.exactScopeCoverage, `${field}.exactScopeCoverage`);
}
function validateRecommendationActionHealth(value, field) {
    const health = (0, portalPublicArtifactValidationCommon_1.asRecord)(value, field);
    (0, portalPublicArtifactValidationCommon_1.assertExactKeys)(health, ['latestActionCount', 'byLatestActionStatus'], field);
    (0, portalPublicArtifactValidationCommon_1.nonNegativeInteger)(health.latestActionCount, `${field}.latestActionCount`);
    validateCountGroup(health.byLatestActionStatus, `${field}.byLatestActionStatus`, 'status');
}
//# sourceMappingURL=portalPublicArtifactEvidenceValidation.js.map