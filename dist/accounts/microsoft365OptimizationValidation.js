"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMicrosoft365CommercialSubscription = isMicrosoft365CommercialSubscription;
exports.isMicrosoft365ObservedCommercialSubscription = isMicrosoft365ObservedCommercialSubscription;
exports.isMicrosoft365OptimizationEvidence = isMicrosoft365OptimizationEvidence;
exports.isMicrosoft365OptimizationCohortEvidence = isMicrosoft365OptimizationCohortEvidence;
exports.isMicrosoft365OptimizationSummary = isMicrosoft365OptimizationSummary;
exports.isMicrosoft365OptimizationAccountDetail = isMicrosoft365OptimizationAccountDetail;
const microsoft365PricingOverrides_1 = require("./microsoft365PricingOverrides");
const microsoft365OptimizationValidationShared_1 = require("./microsoft365OptimizationValidationShared");
const qualification = (value) => (0, microsoft365OptimizationValidationShared_1.codes)(value.blockedBy) &&
    (value.qualification === 'eligible'
        ? value.blockedBy.length === 0
        : (0, microsoft365OptimizationValidationShared_1.choice)(value.qualification, ['conditional', 'blocked']) && value.blockedBy.length > 0);
const snapshotKeys = ['schemaVersion', 'tenantId', 'generatedAt', 'tenantSyncRunId'];
const snapshot = (value) => (0, microsoft365OptimizationValidationShared_1.guid)(value.tenantId) && (0, microsoft365OptimizationValidationShared_1.timestamp)(value.generatedAt) && (0, microsoft365OptimizationValidationShared_1.token)(value.tenantSyncRunId);
const projectionKeys = [
    ...snapshotKeys,
    'companyId',
    'pricingRevision',
    'contextRevision',
    'catalogueVersion',
    'projectedAt',
    'currency',
    'coverage',
];
const projection = (value) => snapshot(value) &&
    (0, microsoft365OptimizationValidationShared_1.token)(value.companyId) &&
    (0, microsoft365OptimizationValidationShared_1.text)(value.pricingRevision) &&
    value.pricingRevision.length <= 256 &&
    (0, microsoft365OptimizationValidationShared_1.text)(value.contextRevision) &&
    value.contextRevision.length <= 256 &&
    (0, microsoft365OptimizationValidationShared_1.token)(value.catalogueVersion) &&
    (0, microsoft365OptimizationValidationShared_1.timestamp)(value.projectedAt) &&
    Date.parse(value.projectedAt) >= Date.parse(String(value.generatedAt)) &&
    (value.currency === null || (typeof value.currency === 'string' && /^[A-Z]{3}$/.test(value.currency))) &&
    (0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage);
const timing = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, ['date', 'source', 'confirmed']) &&
    (value.date === null || (0, microsoft365OptimizationValidationShared_1.date)(value.date)) &&
    (0, microsoft365OptimizationValidationShared_1.choice)(value.source, ['recorded', 'billing', 'lifecycle', 'unknown']) &&
    typeof value.confirmed === 'boolean' &&
    (value.date === null ? value.source === 'unknown' && !value.confirmed : value.source !== 'unknown') &&
    (!value.confirmed || (0, microsoft365OptimizationValidationShared_1.choice)(value.source, ['recorded', 'billing']));
const term = (value) => (0, microsoft365OptimizationValidationShared_1.choice)(value, ['monthly', 'annual', 'three_year']);
const frequency = (value) => (0, microsoft365OptimizationValidationShared_1.choice)(value, ['monthly', 'annual', 'upfront', 'unknown']);
/** Shape/provenance guard only. Applications prove source identity, authenticity, RBAC, source joins and commercial rules. */
function isMicrosoft365CommercialSubscription(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [
            'subscriptionId',
            'skuId',
            'quantity',
            'term',
            'billingFrequency',
            'termSource',
            'observedAt',
            'nextLifecycleAt',
            'reductionTiming',
            'inference',
            'conflicts',
            'autoRenew',
        ]) ||
        !(0, microsoft365OptimizationValidationShared_1.token)(value.subscriptionId) ||
        !(0, microsoft365OptimizationValidationShared_1.guid)(value.skuId) ||
        !(0, microsoft365OptimizationValidationShared_1.nullableCount)(value.quantity) ||
        !(term(value.term) || value.term === 'unknown') ||
        !frequency(value.billingFrequency) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.termSource, ['recorded', 'billing', 'inferred', 'unknown']) ||
        (value.term === 'unknown') !== (value.termSource === 'unknown') ||
        !(0, microsoft365OptimizationValidationShared_1.timestamp)(value.observedAt) ||
        !(value.nextLifecycleAt === null || (0, microsoft365OptimizationValidationShared_1.timestamp)(value.nextLifecycleAt)) ||
        !timing(value.reductionTiming) ||
        !(value.autoRenew === null || typeof value.autoRenew === 'boolean') ||
        (value.term === 'monthly' && value.billingFrequency === 'annual') ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.conflicts, 3, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['source', 'term', 'billingFrequency']) &&
            (0, microsoft365OptimizationValidationShared_1.choice)(item.source, ['recorded', 'billing', 'inferred']) &&
            term(item.term) &&
            frequency(item.billingFrequency) &&
            !(item.term === 'monthly' && item.billingFrequency === 'annual')) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.conflicts, item => item.source))
        return false;
    if (value.termSource !== 'inferred')
        return value.inference === null;
    const inference = value.inference;
    return ((0, microsoft365OptimizationValidationShared_1.row)(inference) &&
        (0, microsoft365OptimizationValidationShared_1.keys)(inference, ['method', 'confidence', 'observationMonths']) &&
        inference.method === 'renewal_history' &&
        inference.confidence === 'inferred' &&
        (0, microsoft365OptimizationValidationShared_1.identifiers)(inference.observationMonths, 13, microsoft365OptimizationValidationShared_1.month) &&
        inference.observationMonths.length >= 2 &&
        inference.observationMonths.every((item, index) => item <= String(value.observedAt).slice(0, 7) && (index === 0 || item > inference.observationMonths[index - 1])));
}
function isMicrosoft365ObservedCommercialSubscription(value) {
    return (isMicrosoft365CommercialSubscription(value) &&
        value.termSource !== 'recorded' &&
        value.reductionTiming.source !== 'recorded' &&
        value.conflicts.every(conflict => conflict.source !== 'recorded'));
}
const action = (value) => (0, microsoft365OptimizationValidationShared_1.choice)(value.mode, ['replace', 'add_on']) &&
    (0, microsoft365OptimizationValidationShared_1.identifiers)(value.fromSkuIds, 32) &&
    (0, microsoft365OptimizationValidationShared_1.identifiers)(value.toSkuIds, 32) &&
    value.toSkuIds.length > 0 &&
    (value.mode === 'add_on' ? value.fromSkuIds.length === 0 : value.fromSkuIds.length > 0) &&
    value.fromSkuIds.every(id => !value.toSkuIds.some(target => target.toLowerCase() === id.toLowerCase())) &&
    qualification(value) &&
    (0, microsoft365OptimizationValidationShared_1.codes)(value.requiredCapabilityIds) &&
    (0, microsoft365OptimizationValidationShared_1.codes)(value.gainedCapabilityIds) &&
    (0, microsoft365OptimizationValidationShared_1.identifiers)(value.lostServicePlanIds) &&
    (0, microsoft365OptimizationValidationShared_1.identifiers)(value.unverifiedServicePlanIds) &&
    (value.qualification !== 'eligible' || (value.lostServicePlanIds.length === 0 && value.unverifiedServicePlanIds.length === 0));
const candidate = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, [
        'id',
        'kind',
        'mode',
        'fromSkuIds',
        'toSkuIds',
        'qualification',
        'blockedBy',
        'requiredCapabilityIds',
        'gainedCapabilityIds',
        'lostServicePlanIds',
        'unverifiedServicePlanIds',
    ]) &&
    (0, microsoft365OptimizationValidationShared_1.token)(value.id) &&
    action(value) &&
    (value.kind === 'add_protection' || (value.kind === 'combine_licenses' && value.mode === 'replace' && value.fromSkuIds.length >= 2));
const subjectEvidence = (value, identity) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [
            ...(identity === 'account' ? ['accountId', 'cohortId'] : ['id', 'accountCount']),
            'heldSkuIds',
            'reviewDisposition',
            'privilege',
            'mfaRegistration',
            'coverage',
            'protection',
            'candidates',
            'omittedCandidateCount',
        ]) ||
        (identity === 'account'
            ? !(0, microsoft365OptimizationValidationShared_1.guid)(value.accountId) || !(0, microsoft365OptimizationValidationShared_1.token)(value.cohortId)
            : !(0, microsoft365OptimizationValidationShared_1.token)(value.id) || !(0, microsoft365OptimizationValidationShared_1.count)(value.accountCount) || value.accountCount === 0) ||
        !(0, microsoft365OptimizationValidationShared_1.identifiers)(value.heldSkuIds) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.reviewDisposition, ['retained', 'review_first']) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.privilege, ['observed', 'not_observed', 'unknown']) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.mfaRegistration, ['capable', 'not_capable', 'unknown']) ||
        !(0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedCandidateCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.protection, 128, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['capabilityId', 'rights', 'deployment']) &&
            (0, microsoft365OptimizationValidationShared_1.code)(item.capabilityId) &&
            (0, microsoft365OptimizationValidationShared_1.choice)(item.rights, ['included', 'missing', 'unknown']) &&
            (0, microsoft365OptimizationValidationShared_1.choice)(item.deployment, ['observed', 'not_observed', 'unknown'])) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.protection, item => item.capabilityId) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.candidates, 16, candidate) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.candidates, item => item.id))
        return false;
    if (value.omittedCandidateCount > 0 && value.coverage.state === 'complete')
        return false;
    const held = new Set(value.heldSkuIds.map(id => id.toLowerCase()));
    return value.candidates.every(item => {
        const current = item;
        return (current.fromSkuIds.every(id => held.has(id.toLowerCase())) &&
            current.toSkuIds.every(id => !held.has(id.toLowerCase())) &&
            (value.reviewDisposition === 'retained' || current.qualification !== 'eligible'));
    });
};
const demand = (value, generatedAt) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, ['skuId', 'basis', 'coverage', 'currentAssignedSeats', 'observations']) ||
        !(0, microsoft365OptimizationValidationShared_1.guid)(value.skuId) ||
        value.basis !== 'monthly_observations' ||
        !(0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) ||
        !(0, microsoft365OptimizationValidationShared_1.nullableCount)(value.currentAssignedSeats) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.observations, 6, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['month', 'assignedSeats', 'complete']) &&
            (0, microsoft365OptimizationValidationShared_1.month)(item.month) &&
            item.month < generatedAt.slice(0, 7) &&
            (0, microsoft365OptimizationValidationShared_1.nullableCount)(item.assignedSeats) &&
            typeof item.complete === 'boolean' &&
            (!item.complete || (0, microsoft365OptimizationValidationShared_1.count)(item.assignedSeats))) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.observations, item => item.month))
        return false;
    const observations = value.observations;
    return (observations.every((item, index) => index === 0 || String(observations[index - 1].month) < String(item.month)) &&
        (value.coverage.state !== 'complete' ||
            ((0, microsoft365OptimizationValidationShared_1.count)(value.currentAssignedSeats) &&
                (0, microsoft365OptimizationValidationShared_1.currentHistory)(observations.map(item => item.month), generatedAt) &&
                observations.every(item => item.complete))));
};
/** Private page guard. Other published pages are not omissions; byte limits and cross-page authorization remain application duties. */
function isMicrosoft365OptimizationEvidence(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [
            ...snapshotKeys,
            'catalogueVersion',
            'coverage',
            'coverageByKind',
            'pageIndex',
            'pageCount',
            'pageAccountCounts',
            'observedAccountCount',
            'accounts',
            'omittedAccountCount',
            'subscriptions',
            'omittedSubscriptionCount',
            'demandBySku',
        ]) ||
        value.schemaVersion !== 'microsoft-365-optimization-evidence/v1' ||
        !snapshot(value) ||
        !(0, microsoft365OptimizationValidationShared_1.token)(value.catalogueVersion) ||
        !(0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) ||
        !(0, microsoft365OptimizationValidationShared_1.byKind)(value.coverageByKind) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.pageIndex) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.pageCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.pageAccountCounts, 2000, item => (0, microsoft365OptimizationValidationShared_1.count)(item) && item <= 5000) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.observedAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.accounts, 5000, item => subjectEvidence(item, 'account')) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.accounts, item => String(item.accountId).toLowerCase()) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedSubscriptionCount) ||
        value.omittedAccountCount > value.observedAccountCount ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.subscriptions, 1000, isMicrosoft365ObservedCommercialSubscription) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.subscriptions, item => String(item.subscriptionId).toLowerCase()) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.demandBySku, 1000, item => demand(item, String(value.generatedAt))) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.demandBySku, item => String(item.skuId).toLowerCase()))
        return false;
    const published = value.observedAccountCount - value.omittedAccountCount;
    if (value.pageCount < 1 ||
        value.pageCount !== value.pageAccountCounts.length ||
        value.pageAccountCounts.reduce((sum, item) => sum + item, 0) !== published ||
        (published > 0 && value.pageAccountCounts.some(item => item === 0)) ||
        (published === 0 && value.pageCount !== 1) ||
        value.pageIndex >= value.pageCount ||
        value.accounts.length !== value.pageAccountCounts[value.pageIndex])
        return false;
    return (0, microsoft365OptimizationValidationShared_1.consistentCoverage)(value.coverage, value.coverageByKind, value.omittedAccountCount > 0 || value.omittedSubscriptionCount > 0);
}
/** Anonymous internal weights let API project full populations without reading every private person page. */
function isMicrosoft365OptimizationCohortEvidence(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [...snapshotKeys, 'catalogueVersion', 'coverage', 'coverageByKind', 'observedAccountCount', 'omittedAccountCount', 'cohorts']) ||
        value.schemaVersion !== 'microsoft-365-optimization-cohorts/v1' ||
        !snapshot(value) ||
        !(0, microsoft365OptimizationValidationShared_1.token)(value.catalogueVersion) ||
        !(0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) ||
        !(0, microsoft365OptimizationValidationShared_1.byKind)(value.coverageByKind) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.observedAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.cohorts, 1000, item => subjectEvidence(item, 'cohort')) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.cohorts, item => item.id))
        return false;
    const population = value.cohorts.reduce((total, item) => total + Number(item.accountCount), value.omittedAccountCount);
    return (Number.isSafeInteger(population) &&
        population === value.observedAccountCount &&
        (0, microsoft365OptimizationValidationShared_1.consistentCoverage)(value.coverage, value.coverageByKind, value.omittedAccountCount > 0));
}
const priceReceipt = (value, source) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, ['offerId', 'countryCode', 'confidence', 'channel', 'monthlyPremiumAssumptionAllowed']) ||
        typeof value.monthlyPremiumAssumptionAllowed !== 'boolean' ||
        !(value.countryCode === null || (typeof value.countryCode === 'string' && /^[A-Z]{2}$/.test(value.countryCode))) ||
        !(value.channel === null || (0, microsoft365OptimizationValidationShared_1.choice)(value.channel, microsoft365PricingOverrides_1.MICROSOFT365_AGREEMENT_CHANNELS)))
        return false;
    if (source === 'unavailable')
        return (value.offerId === null &&
            value.countryCode === null &&
            value.confidence === 'unknown' &&
            value.channel === null &&
            !value.monthlyPremiumAssumptionAllowed);
    if (source === 'agreed')
        return value.offerId === null && value.confidence === 'customer' && !value.monthlyPremiumAssumptionAllowed;
    return (source === 'list' &&
        (0, microsoft365OptimizationValidationShared_1.token)(value.offerId) &&
        value.countryCode !== null &&
        value.channel !== null &&
        (0, microsoft365OptimizationValidationShared_1.choice)(value.confidence, ['verified', 'reference']) &&
        (!value.monthlyPremiumAssumptionAllowed || (value.confidence === 'verified' && (0, microsoft365OptimizationValidationShared_1.choice)(value.channel, ['mca', 'csp']))));
};
const pricedOption = (value) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [
            'id',
            'mode',
            'fromSkuIds',
            'toSkuIds',
            'qualification',
            'blockedBy',
            'requiredCapabilityIds',
            'gainedCapabilityIds',
            'lostServicePlanIds',
            'unverifiedServicePlanIds',
            'priceBasis',
            'monthlyCostChange',
            'unitPrices',
        ]) ||
        !(0, microsoft365OptimizationValidationShared_1.token)(value.id) ||
        !action(value) ||
        !(value.monthlyCostChange === null || (0, microsoft365OptimizationValidationShared_1.amount)(value.monthlyCostChange)) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.unitPrices, 64, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['skuId', 'unitPriceMonthly', 'source', 'receipt']) &&
            (0, microsoft365OptimizationValidationShared_1.guid)(item.skuId) &&
            (0, microsoft365OptimizationValidationShared_1.unitPrice)(item.unitPriceMonthly) &&
            (0, microsoft365OptimizationValidationShared_1.choice)(item.source, ['list', 'agreed', 'unavailable']) &&
            priceReceipt(item.receipt, item.source) &&
            (item.unitPriceMonthly === null) === (item.source === 'unavailable')) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.unitPrices, item => String(item.skuId).toLowerCase()))
        return false;
    const prices = value.unitPrices, skus = new Set([...value.fromSkuIds, ...value.toSkuIds].map(id => id.toLowerCase()));
    if (prices.length !== skus.size || !prices.every(item => skus.has(String(item.skuId).toLowerCase())))
        return false;
    if (prices.some(item => item.unitPriceMonthly === null))
        return value.priceBasis === 'unavailable' && value.monthlyCostChange === null;
    const sources = new Set(prices.map(item => item.source));
    return value.priceBasis === (sources.size === 2 ? 'mixed' : sources.has('agreed') ? 'agreed' : 'list');
};
const findingKeys = ['id', 'kind', 'population', 'qualification', 'blockedBy', 'timing'];
const findingBase = (value) => (0, microsoft365OptimizationValidationShared_1.token)(value.id) &&
    qualification(value) &&
    timing(value.timing) &&
    (0, microsoft365OptimizationValidationShared_1.row)(value.population) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value.population, ['unit', 'exactCount', 'observedCount']) &&
    (0, microsoft365OptimizationValidationShared_1.choice)(value.population.unit, ['accounts', 'seats']) &&
    (0, microsoft365OptimizationValidationShared_1.nullableCount)(value.population.exactCount) &&
    (0, microsoft365OptimizationValidationShared_1.count)(value.population.observedCount) &&
    (value.population.exactCount === null || value.population.exactCount === value.population.observedCount);
const selected = (value) => value.options.find(item => item.id === value.selectedOptionId);
const options = (value) => {
    if (!(0, microsoft365OptimizationValidationShared_1.list)(value.options, 16, pricedOption) || !(0, microsoft365OptimizationValidationShared_1.unique)(value.options, item => item.id) || !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedOptionCount))
        return false;
    if (value.selectedOptionId === null)
        return true;
    if (!(0, microsoft365OptimizationValidationShared_1.token)(value.selectedOptionId) || value.qualification !== 'eligible' || value.omittedOptionCount > 0)
        return false;
    const chosen = selected(value), eligible = value.options.filter(item => item.qualification === 'eligible');
    return (!!chosen &&
        chosen.qualification === 'eligible' &&
        (0, microsoft365OptimizationValidationShared_1.amount)(chosen.monthlyCostChange) &&
        eligible.every(item => (0, microsoft365OptimizationValidationShared_1.amount)(item.monthlyCostChange) && Number(chosen.monthlyCostChange) <= item.monthlyCostChange));
};
const contribution = (value) => (0, microsoft365OptimizationValidationShared_1.money)(value.scenarioMonthlySaving) &&
    (0, microsoft365OptimizationValidationShared_1.money)(value.portfolioMonthlySaving) &&
    (value.portfolioMonthlySaving === null ||
        ((0, microsoft365OptimizationValidationShared_1.amount)(value.scenarioMonthlySaving) && Number(value.portfolioMonthlySaving) <= value.scenarioMonthlySaving)) &&
    (value.qualification === 'eligible' || (value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null));
const skuSet = (value) => value
    .map(id => id.toLowerCase())
    .sort()
    .join('|');
const knownNonSavingCohort = (value) => {
    const eligible = value.options.filter(item => item.qualification === 'eligible');
    return (value.qualification === 'eligible' &&
        value.omittedOptionCount === 0 &&
        eligible.length > 0 &&
        eligible.every(item => (0, microsoft365OptimizationValidationShared_1.amount)(item.monthlyCostChange) && item.monthlyCostChange >= 0));
};
const combineFinding = (value) => (0, microsoft365OptimizationValidationShared_1.keys)(value, [...findingKeys, 'options', 'omittedOptionCount', 'selectedOptionId', 'scenarioMonthlySaving', 'portfolioMonthlySaving']) &&
    options(value) &&
    !knownNonSavingCohort(value) &&
    contribution(value) &&
    value.options.every((item, index, all) => item.mode === 'replace' && item.fromSkuIds.length >= 2 && (index === 0 || skuSet(item.fromSkuIds) === skuSet(all[0].fromSkuIds))) &&
    (value.selectedOptionId === null
        ? value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null
        : Number(selected(value)?.monthlyCostChange) < 0 && (0, microsoft365OptimizationValidationShared_1.minorUnits)(value.scenarioMonthlySaving) === -(0, microsoft365OptimizationValidationShared_1.minorUnits)(selected(value)?.monthlyCostChange));
const protectionFinding = (value, projectedAt) => {
    if (!(0, microsoft365OptimizationValidationShared_1.keys)(value, [
        ...findingKeys,
        'options',
        'omittedOptionCount',
        'selectedOptionId',
        'missingCapabilityIds',
        'configurationReviewCapabilityIds',
        'thirdPartyCoverage',
        'privilegedAccountCount',
        'mfaGapAccountCount',
        'monthlyInvestment',
    ]) ||
        !options(value) ||
        !(0, microsoft365OptimizationValidationShared_1.codes)(value.missingCapabilityIds) ||
        !(0, microsoft365OptimizationValidationShared_1.codes)(value.configurationReviewCapabilityIds) ||
        value.missingCapabilityIds.some(id => value.configurationReviewCapabilityIds.includes(id)) ||
        (value.missingCapabilityIds.length === 0 && value.configurationReviewCapabilityIds.length === 0) ||
        !(0, microsoft365OptimizationValidationShared_1.money)(value.monthlyInvestment) ||
        !(0, microsoft365OptimizationValidationShared_1.nullableCount)(value.privilegedAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.nullableCount)(value.mfaGapAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.thirdPartyCoverage, 128, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['capabilityId', 'providerId', 'scopeReference', 'unit', 'coveredCount', 'observedAt', 'validUntil']) &&
            (0, microsoft365OptimizationValidationShared_1.code)(item.capabilityId) &&
            (0, microsoft365OptimizationValidationShared_1.code)(item.providerId) &&
            (0, microsoft365OptimizationValidationShared_1.token)(item.scopeReference) &&
            (0, microsoft365OptimizationValidationShared_1.choice)(item.unit, ['accounts', 'devices']) &&
            (0, microsoft365OptimizationValidationShared_1.count)(item.coveredCount) &&
            (0, microsoft365OptimizationValidationShared_1.timestamp)(item.observedAt) &&
            Date.parse(item.observedAt) <= Date.parse(projectedAt) &&
            (item.validUntil === null ||
                ((0, microsoft365OptimizationValidationShared_1.timestamp)(item.validUntil) &&
                    Date.parse(item.validUntil) > Date.parse(projectedAt) &&
                    Date.parse(item.validUntil) > Date.parse(item.observedAt))) &&
            !value.missingCapabilityIds.includes(String(item.capabilityId)) &&
            !value.configurationReviewCapabilityIds.includes(String(item.capabilityId))) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.thirdPartyCoverage, item => `${item.capabilityId}|${item.providerId}|${item.scopeReference}`))
        return false;
    const observed = Number(value.population.observedCount);
    if ([
        value.privilegedAccountCount,
        value.mfaGapAccountCount,
        ...value.thirdPartyCoverage.filter(item => item.unit === 'accounts').map(item => item.coveredCount),
    ].some(item => (0, microsoft365OptimizationValidationShared_1.count)(item) && item > observed))
        return false;
    return value.selectedOptionId === null
        ? value.monthlyInvestment === null || (value.monthlyInvestment === 0 && value.missingCapabilityIds.length === 0)
        : value.missingCapabilityIds.every(id => selected(value).gainedCapabilityIds.includes(id)) &&
            (0, microsoft365OptimizationValidationShared_1.minorUnits)(value.monthlyInvestment) === Math.max(0, (0, microsoft365OptimizationValidationShared_1.minorUnits)(selected(value)?.monthlyCostChange));
};
const termPrice = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, ['term', 'billingFrequency', 'unitPriceMonthly', 'source', 'receipt']) &&
    term(value.term) &&
    frequency(value.billingFrequency) &&
    !(value.term === 'monthly' && value.billingFrequency === 'annual') &&
    (0, microsoft365OptimizationValidationShared_1.unitPrice)(value.unitPriceMonthly) &&
    (0, microsoft365OptimizationValidationShared_1.choice)(value.source, ['list', 'agreed', 'unavailable']) &&
    priceReceipt(value.receipt, value.source) &&
    (value.unitPriceMonthly === null) === (value.source === 'unavailable') &&
    (value.unitPriceMonthly === null || value.billingFrequency !== 'unknown');
const termFinding = (value, generatedAt) => {
    if (!(0, microsoft365OptimizationValidationShared_1.keys)(value, [
        ...findingKeys,
        'skuId',
        'subscriptions',
        'omittedSubscriptionCount',
        'monthlySeats',
        'committedSeats',
        'stableSeats',
        'convertibleSeats',
        'historyMonths',
        'priceMethod',
        'sourcePrice',
        'targetPrice',
        'scenarioMonthlySaving',
        'portfolioMonthlySaving',
    ]) ||
        !(0, microsoft365OptimizationValidationShared_1.guid)(value.skuId) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.subscriptions, 1000, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['subscriptionId', 'termSource', 'term', 'quantity', 'hasConflict']) &&
            (0, microsoft365OptimizationValidationShared_1.token)(item.subscriptionId) &&
            (0, microsoft365OptimizationValidationShared_1.choice)(item.termSource, ['recorded', 'billing', 'inferred', 'unknown']) &&
            (term(item.term) || item.term === 'unknown') &&
            (item.term === 'unknown') === (item.termSource === 'unknown') &&
            (0, microsoft365OptimizationValidationShared_1.nullableCount)(item.quantity) &&
            typeof item.hasConflict === 'boolean') ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.subscriptions, item => String(item.subscriptionId).toLowerCase()) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedSubscriptionCount) ||
        ![value.monthlySeats, value.committedSeats, value.stableSeats, value.convertibleSeats].every(microsoft365OptimizationValidationShared_1.nullableCount) ||
        !(0, microsoft365OptimizationValidationShared_1.identifiers)(value.historyMonths, 6, microsoft365OptimizationValidationShared_1.month) ||
        !value.historyMonths.every(item => item < generatedAt.slice(0, 7)) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.priceMethod, ['matched_offers', 'assumed_20_percent', 'unavailable']) ||
        !termPrice(value.sourcePrice) ||
        !termPrice(value.targetPrice) ||
        value.sourcePrice.term !== 'monthly' ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.targetPrice.term, ['annual', 'three_year']) ||
        !contribution(value))
        return false;
    if (value.priceMethod === 'matched_offers' && (value.sourcePrice.unitPriceMonthly === null || value.targetPrice.unitPriceMonthly === null))
        return false;
    if (value.priceMethod === 'assumed_20_percent' &&
        (value.sourcePrice.unitPriceMonthly !== null ||
            value.targetPrice.unitPriceMonthly === null ||
            value.targetPrice.term !== 'annual' ||
            value.targetPrice.receipt.confidence !== 'verified' ||
            !value.targetPrice.receipt.monthlyPremiumAssumptionAllowed))
        return false;
    if (value.priceMethod === 'unavailable' && (value.scenarioMonthlySaving !== null || value.portfolioMonthlySaving !== null))
        return false;
    if (value.qualification !== 'eligible')
        return true;
    if (value.omittedSubscriptionCount > 0)
        return false;
    if (value.scenarioMonthlySaving !== null && Number(value.scenarioMonthlySaving) <= 0)
        return false;
    if (value.priceMethod === 'matched_offers' && Number(value.targetPrice.unitPriceMonthly) >= Number(value.sourcePrice.unitPriceMonthly))
        return false;
    if (value.priceMethod === 'assumed_20_percent' && Number(value.targetPrice.unitPriceMonthly) <= 0)
        return false;
    // Six monthly observations qualify the annual-target model only; longer commitments remain conditional.
    if (value.targetPrice.term !== 'annual')
        return false;
    const subscriptions = value.subscriptions;
    if (!subscriptions.length ||
        !subscriptions.every(item => (0, microsoft365OptimizationValidationShared_1.choice)(item.termSource, ['recorded', 'billing']) && !item.hasConflict && (0, microsoft365OptimizationValidationShared_1.count)(item.quantity)) ||
        !(0, microsoft365OptimizationValidationShared_1.currentHistory)(value.historyMonths, generatedAt) ||
        ![value.monthlySeats, value.committedSeats, value.stableSeats, value.convertibleSeats].every(microsoft365OptimizationValidationShared_1.count))
        return false;
    const monthly = subscriptions.filter(item => item.term === 'monthly').reduce((total, item) => total + Number(item.quantity), 0);
    const committed = subscriptions
        .filter(item => item.term === 'annual' || item.term === 'three_year')
        .reduce((total, item) => total + Number(item.quantity), 0);
    return (value.monthlySeats === monthly &&
        value.committedSeats === committed &&
        Number(value.convertibleSeats) > 0 &&
        Number(value.convertibleSeats) <= monthly &&
        Number(value.convertibleSeats) <= Math.max(0, Number(value.stableSeats) - committed) &&
        value.population.exactCount === value.convertibleSeats);
};
const finding = (value, generatedAt, projectedAt) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) || !findingBase(value) || value.population.unit !== (value.kind === 'change_term' ? 'seats' : 'accounts'))
        return false;
    const valid = value.kind === 'combine_licenses'
        ? combineFinding(value)
        : value.kind === 'add_protection'
            ? protectionFinding(value, projectedAt)
            : value.kind === 'change_term' && termFinding(value, generatedAt);
    return (!!valid &&
        (value.population.exactCount !== null ||
            (value.kind === 'add_protection'
                ? value.monthlyInvestment === null
                : value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null)));
};
const moneyFreeFinding = (value) => (value.kind === 'add_protection'
    ? value.monthlyInvestment === null
    : value.scenarioMonthlySaving === null && value.portfolioMonthlySaving === null) &&
    (value.kind === 'change_term'
        ? value.sourcePrice.unitPriceMonthly === null && value.targetPrice.unitPriceMonthly === null
        : value.options.every(item => item.monthlyCostChange === null && item.unitPrices.every(price => price.unitPriceMonthly === null)));
const aggregate = (value, contributions, complete) => {
    if (value === null)
        return true;
    if (!complete || contributions.some(item => item === null))
        return false;
    const sum = contributions.reduce((total, item) => total + (0, microsoft365OptimizationValidationShared_1.minorUnits)(item), 0);
    return Number.isSafeInteger(sum) && (0, microsoft365OptimizationValidationShared_1.minorUnits)(value) === sum;
};
/** Anonymous wire guard. Price multiplication, compatible portfolio allocation, catalogue and provider authenticity remain consumer duties. */
function isMicrosoft365OptimizationSummary(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [...projectionKeys, 'coverageByKind', 'groups', 'omittedGroupCount', 'portfolioMonthlySaving', 'protectionMonthlyInvestment']) ||
        value.schemaVersion !== 'microsoft-365-optimization-summary/v1' ||
        !projection(value) ||
        !(0, microsoft365OptimizationValidationShared_1.byKind)(value.coverageByKind) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.groups, 256, item => finding(item, String(value.generatedAt), String(value.projectedAt))) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.groups, item => item.id) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedGroupCount) ||
        !(0, microsoft365OptimizationValidationShared_1.money)(value.portfolioMonthlySaving) ||
        !(0, microsoft365OptimizationValidationShared_1.money)(value.protectionMonthlyInvestment))
        return false;
    if (!(0, microsoft365OptimizationValidationShared_1.consistentCoverage)(value.coverage, value.coverageByKind, value.omittedGroupCount > 0))
        return false;
    const groups = value.groups, kinds = value.coverageByKind;
    const sourceComplete = (name) => kinds[name].state === 'complete';
    const publishing = value.omittedGroupCount === 0 && value.coverage.state !== 'unavailable';
    if (!aggregate(value.portfolioMonthlySaving, groups.filter(item => item.kind !== 'add_protection' && item.qualification === 'eligible').map(item => item.portfolioMonthlySaving), publishing && sourceComplete('combineLicenses') && sourceComplete('changeTerm')) ||
        !aggregate(value.protectionMonthlyInvestment, groups.filter(item => item.kind === 'add_protection').map(item => item.monthlyInvestment), publishing && sourceComplete('addProtection')))
        return false;
    if (!groups.every(item => kinds[item.kind === 'combine_licenses' ? 'combineLicenses' : item.kind === 'add_protection' ? 'addProtection' : 'changeTerm']
        .state !== 'unavailable' || item.qualification !== 'eligible'))
        return false;
    return (value.currency !== null || (value.portfolioMonthlySaving === null && value.protectionMonthlyInvestment === null && groups.every(moneyFreeFinding)));
}
/** One-account detail with finding-local option identities and disjoint selected products across financial and protection actions. */
function isMicrosoft365OptimizationAccountDetail(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [...projectionKeys, 'accountId', 'reviewDisposition', 'privilege', 'mfaRegistration', 'findings']) ||
        value.schemaVersion !== 'microsoft-365-optimization-account/v1' ||
        !projection(value) ||
        !(0, microsoft365OptimizationValidationShared_1.guid)(value.accountId) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.reviewDisposition, ['retained', 'review_first', 'kept']) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.privilege, ['observed', 'not_observed', 'unknown']) ||
        !(0, microsoft365OptimizationValidationShared_1.choice)(value.mfaRegistration, ['capable', 'not_capable', 'unknown']) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.findings, 128, item => finding(item, String(value.generatedAt), String(value.projectedAt)) &&
            item.kind !== 'change_term' &&
            item.population.exactCount === 1) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.findings, item => item.id))
        return false;
    const findings = value.findings, removed = new Set(), acquired = new Set();
    if (value.coverage.state === 'unavailable' &&
        findings.some(item => item.qualification === 'eligible' || item.selectedOptionId !== null || !moneyFreeFinding(item)))
        return false;
    for (const current of findings) {
        if (value.reviewDisposition !== 'retained' && (current.selectedOptionId !== null || current.qualification === 'eligible'))
            return false;
        if (current.selectedOptionId === null)
            continue;
        const chosen = selected(current);
        for (const id of chosen.fromSkuIds) {
            const normalized = id.toLowerCase();
            if (removed.has(normalized) || acquired.has(normalized))
                return false;
            removed.add(normalized);
        }
        for (const id of chosen.toSkuIds) {
            const normalized = id.toLowerCase();
            if (acquired.has(normalized) || removed.has(normalized))
                return false;
            acquired.add(normalized);
        }
    }
    return value.currency !== null || findings.every(moneyFreeFinding);
}
//# sourceMappingURL=microsoft365OptimizationValidation.js.map