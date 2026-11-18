"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMicrosoft365OptimizationConfigurationInput = isMicrosoft365OptimizationConfigurationInput;
exports.isMicrosoft365PricingConfigurationDocument = isMicrosoft365PricingConfigurationDocument;
exports.isMicrosoft365OptimizationConfigurationWriteRequest = isMicrosoft365OptimizationConfigurationWriteRequest;
exports.isMicrosoft365OptimizationCatalogue = isMicrosoft365OptimizationCatalogue;
exports.isMicrosoft365OptimizationManagementResponse = isMicrosoft365OptimizationManagementResponse;
exports.isMicrosoft365OptimizationConfigurationPreview = isMicrosoft365OptimizationConfigurationPreview;
exports.isMicrosoft365OptimizationHistorySnapshot = isMicrosoft365OptimizationHistorySnapshot;
exports.isMicrosoft365OptimizationProjectionBinding = isMicrosoft365OptimizationProjectionBinding;
exports.isMicrosoft365OptimizationAccountReadRequest = isMicrosoft365OptimizationAccountReadRequest;
exports.isMicrosoft365OptimizationAccountListRequest = isMicrosoft365OptimizationAccountListRequest;
exports.isMicrosoft365OptimizationSummaryResponse = isMicrosoft365OptimizationSummaryResponse;
exports.isMicrosoft365OptimizationAccountResponse = isMicrosoft365OptimizationAccountResponse;
exports.isMicrosoft365OptimizationAccountListResponse = isMicrosoft365OptimizationAccountListResponse;
const microsoft365OptimizationManagement_1 = require("./microsoft365OptimizationManagement");
const microsoft365PricingOverrides_1 = require("./microsoft365PricingOverrides");
const microsoft365OptimizationValidation_1 = require("./microsoft365OptimizationValidation");
const microsoft365OptimizationValidationShared_1 = require("./microsoft365OptimizationValidationShared");
const currency = (value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
const scope = (value) => (0, microsoft365OptimizationValidationShared_1.token)(value.companyId) && (0, microsoft365OptimizationValidationShared_1.guid)(value.tenantId);
const snap = (value) => (0, microsoft365OptimizationValidationShared_1.guid)(value.tenantId) && (0, microsoft365OptimizationValidationShared_1.token)(value.tenantSyncRunId) && (0, microsoft365OptimizationValidationShared_1.timestamp)(value.generatedAt);
const frequencies = ['monthly', 'annual', 'upfront', 'unknown'];
const terms = ['monthly', 'annual', 'three_year', 'unknown'];
const frequencyPair = (value) => (0, microsoft365OptimizationValidationShared_1.choice)(value.term, terms) && (0, microsoft365OptimizationValidationShared_1.choice)(value.billingFrequency, frequencies) && !(value.term === 'monthly' && value.billingFrequency === 'annual');
const revision = (value) => (0, microsoft365OptimizationValidationShared_1.text)(value) && value.length <= 256;
const boundedBytes = (value, limit = microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.configurationBytes) => {
    try {
        let bytes = 0;
        for (const character of JSON.stringify(value)) {
            const point = character.codePointAt(0);
            bytes += point < 0x80 ? 1 : point < 0x800 ? 2 : point < 0x10000 ? 3 : 4;
            if (bytes > limit)
                return false;
        }
        return true;
    }
    catch {
        return false;
    }
};
const recordedTerms = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, ['subscriptionId', 'skuId', 'term', 'billingFrequency', 'reductionOn', 'autoRenew']) &&
    (0, microsoft365OptimizationValidationShared_1.token)(value.subscriptionId) &&
    (0, microsoft365OptimizationValidationShared_1.guid)(value.skuId) &&
    frequencyPair(value) &&
    (value.reductionOn === null || (0, microsoft365OptimizationValidationShared_1.date)(value.reductionOn)) &&
    (value.autoRenew === null || typeof value.autoRenew === 'boolean');
const legacyPrice = (value) => ({
    skuId: value.skuId,
    currency: value.currency,
    unitPriceMonthly: value.unitPriceMonthly,
    effectiveFrom: value.effectiveFrom,
    effectiveTo: value.effectiveTo,
    source: value.source,
});
const termPrice = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, ['skuId', 'currency', 'unitPriceMonthly', 'effectiveFrom', 'effectiveTo', 'source', 'subscriptionId', 'term', 'billingFrequency']) &&
    (0, microsoft365OptimizationValidationShared_1.guid)(value.skuId) &&
    (value.subscriptionId === null || (0, microsoft365OptimizationValidationShared_1.token)(value.subscriptionId)) &&
    frequencyPair(value) &&
    value.term !== 'unknown' &&
    value.billingFrequency !== 'unknown' &&
    (value.source === '' || (0, microsoft365OptimizationValidationShared_1.text)(value.source)) &&
    (0, microsoft365PricingOverrides_1.isMicrosoft365PricingOverride)(legacyPrice(value));
const coverageScope = (value) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value))
        return false;
    if (value.kind === 'tenant')
        return (0, microsoft365OptimizationValidationShared_1.keys)(value, ['kind', 'unit']) && (0, microsoft365OptimizationValidationShared_1.choice)(value.unit, ['accounts', 'devices']);
    if (value.kind === 'accounts')
        return (0, microsoft365OptimizationValidationShared_1.keys)(value, ['kind', 'accountIds']) && (0, microsoft365OptimizationValidationShared_1.identifiers)(value.accountIds, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.scopeIdentities) && value.accountIds.length > 0;
    return (value.kind === 'devices' &&
        (0, microsoft365OptimizationValidationShared_1.keys)(value, ['kind', 'identitySource', 'deviceIds']) &&
        (0, microsoft365OptimizationValidationShared_1.choice)(value.identitySource, ['entra', 'intune', 'customer']) &&
        (0, microsoft365OptimizationValidationShared_1.identifiers)(value.deviceIds, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.scopeIdentities, value.identitySource === 'customer' ? microsoft365OptimizationValidationShared_1.token : microsoft365OptimizationValidationShared_1.guid) &&
        value.deviceIds.length > 0);
};
const protection = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, ['id', 'providerId', 'capabilityIds', 'scope', 'basis', 'observedAt', 'validUntil', 'sourceReference']) &&
    (0, microsoft365OptimizationValidationShared_1.guid)(value.id) &&
    (0, microsoft365OptimizationValidationShared_1.code)(value.providerId) &&
    (0, microsoft365OptimizationValidationShared_1.codes)(value.capabilityIds) &&
    value.capabilityIds.length > 0 &&
    coverageScope(value.scope) &&
    value.basis === 'customer_confirmed' &&
    (0, microsoft365OptimizationValidationShared_1.timestamp)(value.observedAt) &&
    (value.validUntil === null || ((0, microsoft365OptimizationValidationShared_1.timestamp)(value.validUntil) && Date.parse(value.validUntil) > Date.parse(value.observedAt))) &&
    (value.sourceReference === null || (0, microsoft365OptimizationValidationShared_1.token)(value.sourceReference));
/** Authenticated API validates inventory membership, source ownership and activation dates; this guard checks bounded authored input. */
function isMicrosoft365OptimizationConfigurationInput(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, ['subscriptionTerms', 'termPrices', 'protectionCoverage']) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.subscriptionTerms, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.subscriptionTerms, recordedTerms) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.subscriptionTerms, item => String(item.subscriptionId).toLowerCase()) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.termPrices, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.termPrices, termPrice) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.protectionCoverage, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.protectionCoverage, protection) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.protectionCoverage, item => String(item.id).toLowerCase()))
        return false;
    const groups = new Map();
    const subscriptionSkus = new Map(value.subscriptionTerms.map(item => [String(item.subscriptionId).toLowerCase(), String(item.skuId).toLowerCase()]));
    for (const item of value.termPrices) {
        const key = `${String(item.subscriptionId ?? '').toLowerCase()}|${item.term}|${item.billingFrequency}`;
        const group = groups.get(key) ?? [];
        group.push(legacyPrice(item));
        groups.set(key, group);
        if (item.subscriptionId !== null) {
            const id = String(item.subscriptionId).toLowerCase(), sku = String(item.skuId).toLowerCase();
            if (subscriptionSkus.has(id) && subscriptionSkus.get(id) !== sku)
                return false;
            subscriptionSkus.set(id, sku);
        }
    }
    return [...groups.values()].every(microsoft365PricingOverrides_1.isMicrosoft365PricingOverrides) && boundedBytes(value);
}
/** Both versions are readable; existing v1 guard/allowlist stays unchanged. Reader adoption must precede the first v2 write. */
function isMicrosoft365PricingConfigurationDocument(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value))
        return false;
    if (value.schemaVersion === 'microsoft-365-pricing-overrides/v1')
        return (0, microsoft365PricingOverrides_1.isMicrosoft365PricingOverridesConfiguration)(value) && boundedBytes(value);
    if (!(0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'companyId', 'tenantId', 'revision', 'overrides', 'updatedAt', 'updatedBy', 'agreementTerms', 'optimization']) ||
        value.schemaVersion !== 'microsoft-365-pricing-overrides/v2' ||
        !scope(value) ||
        !isMicrosoft365OptimizationConfigurationInput(value.optimization) ||
        !(value.updatedAt === null || (0, microsoft365OptimizationValidationShared_1.timestamp)(value.updatedAt)) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.overrides, 1000, microsoft365OptimizationValidationShared_1.row))
        return false;
    const legacy = {
        schemaVersion: 'microsoft-365-pricing-overrides/v1',
        tenantId: value.tenantId,
        revision: value.revision,
        overrides: value.overrides,
        updatedAt: value.updatedAt,
        ...(value.updatedBy === undefined ? {} : { updatedBy: value.updatedBy }),
        ...(value.agreementTerms === undefined ? {} : { agreementTerms: value.agreementTerms }),
    };
    return (0, microsoft365PricingOverrides_1.isMicrosoft365PricingOverridesConfiguration)(legacy) && boundedBytes(value);
}
function isMicrosoft365OptimizationConfigurationWriteRequest(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'overrides', 'agreementTerms', 'optimization']) &&
        value.schemaVersion === 'microsoft-365-pricing-write/v2' &&
        (0, microsoft365OptimizationValidationShared_1.list)(value.overrides, 1000, microsoft365OptimizationValidationShared_1.row) &&
        (0, microsoft365PricingOverrides_1.isMicrosoft365PricingOverrides)(value.overrides) &&
        (value.agreementTerms === undefined ||
            value.agreementTerms === null ||
            ((0, microsoft365OptimizationValidationShared_1.row)(value.agreementTerms) && (0, microsoft365PricingOverrides_1.isMicrosoft365AgreementTerms)(value.agreementTerms))) &&
        isMicrosoft365OptimizationConfigurationInput(value.optimization) &&
        boundedBytes(value));
}
const publisherUrl = (value) => {
    if (!(0, microsoft365OptimizationValidationShared_1.text)(value))
        return false;
    return /^https:\/\/(?:[a-z0-9-]+\.)*microsoft\.com(?:\/[^\s]*)?$/i.test(value);
};
const referenceOffer = (value) => (0, microsoft365OptimizationValidationShared_1.row)(value) &&
    (0, microsoft365OptimizationValidationShared_1.keys)(value, [
        'id',
        'skuId',
        'countryCode',
        'currency',
        'term',
        'billingFrequency',
        'channel',
        'effectiveFrom',
        'effectiveTo',
        'monthlyPremiumAssumptionAllowed',
        'unitPriceMonthly',
        'confidence',
        'sourceUrl',
        'checkedAt',
    ]) &&
    (0, microsoft365OptimizationValidationShared_1.token)(value.id) &&
    (0, microsoft365OptimizationValidationShared_1.guid)(value.skuId) &&
    typeof value.countryCode === 'string' &&
    /^[A-Z]{2}$/.test(value.countryCode) &&
    currency(value.currency) &&
    frequencyPair(value) &&
    (0, microsoft365OptimizationValidationShared_1.choice)(value.channel, microsoft365PricingOverrides_1.MICROSOFT365_AGREEMENT_CHANNELS) &&
    (value.effectiveFrom === null || (0, microsoft365OptimizationValidationShared_1.date)(value.effectiveFrom)) &&
    (value.effectiveTo === null || ((0, microsoft365OptimizationValidationShared_1.date)(value.effectiveTo) && (value.effectiveFrom === null || value.effectiveTo > value.effectiveFrom))) &&
    typeof value.monthlyPremiumAssumptionAllowed === 'boolean' &&
    (!value.monthlyPremiumAssumptionAllowed || (value.term === 'annual' && value.confidence === 'verified' && (0, microsoft365OptimizationValidationShared_1.choice)(value.channel, ['mca', 'csp']))) &&
    (0, microsoft365OptimizationValidationShared_1.unitPrice)(value.unitPriceMonthly) &&
    (0, microsoft365OptimizationValidationShared_1.choice)(value.confidence, ['verified', 'reference', 'unknown']) &&
    (value.checkedAt === null || (0, microsoft365OptimizationValidationShared_1.timestamp)(value.checkedAt)) &&
    (value.sourceUrl === null || publisherUrl(value.sourceUrl)) &&
    (value.unitPriceMonthly === null
        ? value.confidence === 'unknown'
        : value.confidence !== 'unknown' && value.sourceUrl !== null && value.checkedAt !== null);
function isMicrosoft365OptimizationCatalogue(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [
            'schemaVersion',
            'catalogueVersion',
            'coverage',
            'products',
            'capabilities',
            'servicePlans',
            'providers',
            'referenceOffers',
            'omittedProductCount',
            'omittedOfferCount',
        ]) ||
        value.schemaVersion !== 'microsoft-365-optimization-catalogue/v1' ||
        !(0, microsoft365OptimizationValidationShared_1.token)(value.catalogueVersion) ||
        !(0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedProductCount) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.omittedOfferCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.products, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.catalogueProducts, item => (0, microsoft365OptimizationValidationShared_1.row)(item) && (0, microsoft365OptimizationValidationShared_1.keys)(item, ['skuId', 'skuPartNumber', 'productName']) && (0, microsoft365OptimizationValidationShared_1.guid)(item.skuId) && (0, microsoft365OptimizationValidationShared_1.text)(item.skuPartNumber) && (0, microsoft365OptimizationValidationShared_1.text)(item.productName)) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.products, item => String(item.skuId).toLowerCase()) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.capabilities, 128, item => (0, microsoft365OptimizationValidationShared_1.row)(item) && (0, microsoft365OptimizationValidationShared_1.keys)(item, ['id', 'name', 'group']) && (0, microsoft365OptimizationValidationShared_1.code)(item.id) && (0, microsoft365OptimizationValidationShared_1.text)(item.name) && (0, microsoft365OptimizationValidationShared_1.text)(item.group)) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.capabilities, item => item.id) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.servicePlans, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.catalogueServicePlans, item => (0, microsoft365OptimizationValidationShared_1.row)(item) && (0, microsoft365OptimizationValidationShared_1.keys)(item, ['servicePlanId', 'name']) && (0, microsoft365OptimizationValidationShared_1.guid)(item.servicePlanId) && (0, microsoft365OptimizationValidationShared_1.text)(item.name)) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.servicePlans, item => String(item.servicePlanId).toLowerCase()) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.providers, 128, item => (0, microsoft365OptimizationValidationShared_1.row)(item) && (0, microsoft365OptimizationValidationShared_1.keys)(item, ['id', 'name', 'capabilityIds']) && (0, microsoft365OptimizationValidationShared_1.code)(item.id) && (0, microsoft365OptimizationValidationShared_1.text)(item.name) && (0, microsoft365OptimizationValidationShared_1.codes)(item.capabilityIds)) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.providers, item => item.id) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.referenceOffers, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.catalogueOffers, referenceOffer) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.referenceOffers, item => item.id))
        return false;
    const products = new Set(value.products.map(item => String(item.skuId).toLowerCase()));
    const capabilities = new Set(value.capabilities.map(item => item.id));
    const intervals = new Map();
    for (const offer of value.referenceOffers) {
        const key = [String(offer.skuId).toLowerCase(), offer.countryCode, offer.currency, offer.term, offer.billingFrequency, offer.channel].join('|');
        const group = intervals.get(key) ?? [];
        group.push(offer);
        intervals.set(key, group);
    }
    for (const group of intervals.values()) {
        group.sort((a, b) => String(a.effectiveFrom ?? '').localeCompare(String(b.effectiveFrom ?? '')));
        if (group.some((offer, index) => index > 0 &&
            (group[index - 1].effectiveTo === null ||
                offer.effectiveFrom === null ||
                String(group[index - 1].effectiveTo) > String(offer.effectiveFrom))))
            return false;
    }
    return (boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.catalogueBytes) &&
        value.referenceOffers.every(item => products.has(String(item.skuId).toLowerCase())) &&
        value.providers.every(item => item.capabilityIds.every(id => capabilities.has(id))) &&
        (value.coverage.state !== 'complete' || (value.omittedProductCount === 0 && value.omittedOfferCount === 0)));
}
function isMicrosoft365OptimizationManagementResponse(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (0, microsoft365OptimizationValidationShared_1.keys)(value, [
            'schemaVersion',
            'companyId',
            'tenantId',
            'configuration',
            'catalogue',
            'subscriptions',
            'coverage',
            'omittedSubscriptionCount',
            'unavailableReason',
        ]) &&
        value.schemaVersion === 'microsoft-365-optimization-management/v1' &&
        scope(value) &&
        (value.unavailableReason === undefined || value.unavailableReason === 'invalid_configuration') &&
        isMicrosoft365PricingConfigurationDocument(value.configuration) &&
        value.configuration.tenantId === value.tenantId &&
        (!('companyId' in value.configuration) || value.configuration.companyId === value.companyId) &&
        isMicrosoft365OptimizationCatalogue(value.catalogue) &&
        (0, microsoft365OptimizationValidationShared_1.list)(value.subscriptions, 1000, microsoft365OptimizationValidation_1.isMicrosoft365ObservedCommercialSubscription) &&
        (0, microsoft365OptimizationValidationShared_1.unique)(value.subscriptions, item => String(item.subscriptionId).toLowerCase()) &&
        (0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) &&
        (0, microsoft365OptimizationValidationShared_1.count)(value.omittedSubscriptionCount) &&
        boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.managementResponseBytes) &&
        (value.coverage.state !== 'complete' || value.omittedSubscriptionCount === 0) &&
        (value.unavailableReason === undefined ||
            (value.configuration.schemaVersion === 'microsoft-365-pricing-overrides/v1' &&
                value.configuration.overrides.length === 0 &&
                value.configuration.updatedAt === null &&
                value.configuration.agreementTerms === undefined &&
                value.configuration.updatedBy == null)));
}
function isMicrosoft365OptimizationConfigurationPreview(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'companyId', 'tenantId', 'revision', 'canSave', 'normalized', 'errors', 'warnings', 'summary']) ||
        value.schemaVersion !== 'microsoft-365-optimization-preview/v1' ||
        !scope(value) ||
        !revision(value.revision) ||
        !boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.previewBytes) ||
        typeof value.canSave !== 'boolean' ||
        !(value.normalized === null || isMicrosoft365OptimizationConfigurationWriteRequest(value.normalized)) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.errors, 1000, item => (0, microsoft365OptimizationValidationShared_1.row)(item) && (0, microsoft365OptimizationValidationShared_1.keys)(item, ['path', 'code', 'message']) && (0, microsoft365OptimizationValidationShared_1.text)(item.path) && (0, microsoft365OptimizationValidationShared_1.code)(item.code) && (0, microsoft365OptimizationValidationShared_1.text)(item.message)) ||
        !(0, microsoft365OptimizationValidationShared_1.codes)(value.warnings) ||
        !(value.summary === null ||
            ((0, microsoft365OptimizationValidation_1.isMicrosoft365OptimizationSummary)(value.summary) && value.summary.companyId === value.companyId && value.summary.tenantId === value.tenantId)))
        return false;
    return value.canSave ? value.errors.length === 0 && value.normalized !== null : value.errors.length > 0 && value.summary === null;
}
/** Captures one scan's monthly observation. Only later completed months can become stable-demand history. */
function isMicrosoft365OptimizationHistorySnapshot(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (0, microsoft365OptimizationValidationShared_1.keys)(value, [
            'schemaVersion',
            'tenantId',
            'generatedAt',
            'tenantSyncRunId',
            'month',
            'catalogueVersion',
            'ruleVersion',
            'coverage',
            'subscriptions',
            'omittedSubscriptionCount',
            'quantities',
            'omittedProductCount',
        ]) &&
        value.schemaVersion === 'microsoft-365-optimization-history/v1' &&
        snap(value) &&
        (0, microsoft365OptimizationValidationShared_1.month)(value.month) &&
        (0, microsoft365OptimizationValidationShared_1.token)(value.catalogueVersion) &&
        (0, microsoft365OptimizationValidationShared_1.token)(value.ruleVersion) &&
        value.month === String(value.generatedAt).slice(0, 7) &&
        (0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) &&
        (0, microsoft365OptimizationValidationShared_1.count)(value.omittedSubscriptionCount) &&
        (0, microsoft365OptimizationValidationShared_1.count)(value.omittedProductCount) &&
        (0, microsoft365OptimizationValidationShared_1.list)(value.subscriptions, 1000, microsoft365OptimizationValidation_1.isMicrosoft365ObservedCommercialSubscription) &&
        value.subscriptions.every(item => String(item.observedAt).slice(0, 7) === value.month && Date.parse(String(item.observedAt)) <= Date.parse(String(value.generatedAt))) &&
        (0, microsoft365OptimizationValidationShared_1.unique)(value.subscriptions, item => String(item.subscriptionId).toLowerCase()) &&
        (0, microsoft365OptimizationValidationShared_1.list)(value.quantities, 1000, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['skuId', 'assignedSeats', 'coverage']) &&
            (0, microsoft365OptimizationValidationShared_1.guid)(item.skuId) &&
            (0, microsoft365OptimizationValidationShared_1.nullableCount)(item.assignedSeats) &&
            (0, microsoft365OptimizationValidationShared_1.coverage)(item.coverage) &&
            (item.coverage.state !== 'complete' || (0, microsoft365OptimizationValidationShared_1.count)(item.assignedSeats))) &&
        (0, microsoft365OptimizationValidationShared_1.unique)(value.quantities, item => String(item.skuId).toLowerCase()) &&
        boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.historyBytes) &&
        (value.coverage.state !== 'complete' ||
            (value.omittedSubscriptionCount === 0 &&
                value.omittedProductCount === 0 &&
                value.quantities.every(item => item.coverage.state === 'complete'))));
}
const bindingKeys = ['companyId', 'tenantId', 'generatedAt', 'tenantSyncRunId', 'currency', 'pricingRevision', 'contextRevision', 'catalogueVersion'];
function isMicrosoft365OptimizationProjectionBinding(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (0, microsoft365OptimizationValidationShared_1.keys)(value, bindingKeys) &&
        scope(value) &&
        snap(value) &&
        (value.currency === null || currency(value.currency)) &&
        revision(value.pricingRevision) &&
        revision(value.contextRevision) &&
        (0, microsoft365OptimizationValidationShared_1.token)(value.catalogueVersion));
}
function isMicrosoft365OptimizationAccountReadRequest(value) {
    return (0, microsoft365OptimizationValidationShared_1.row)(value) && (0, microsoft365OptimizationValidationShared_1.keys)(value, ['accountId', 'expected']) && (0, microsoft365OptimizationValidationShared_1.guid)(value.accountId) && isMicrosoft365OptimizationProjectionBinding(value.expected);
}
function isMicrosoft365OptimizationAccountListRequest(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (0, microsoft365OptimizationValidationShared_1.keys)(value, ['findingId', 'pageIndex', 'expected']) &&
        (value.findingId === null || (0, microsoft365OptimizationValidationShared_1.token)(value.findingId)) &&
        (0, microsoft365OptimizationValidationShared_1.count)(value.pageIndex) &&
        value.pageIndex < microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.accountPages &&
        isMicrosoft365OptimizationProjectionBinding(value.expected));
}
const listPage = (value) => {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value) ||
        !(0, microsoft365OptimizationValidationShared_1.keys)(value, [
            ...bindingKeys,
            'schemaVersion',
            'coverage',
            'pageIndex',
            'pageCount',
            'pageAccountCounts',
            'observedAccountCount',
            'exactAccountCount',
            'findingId',
            'accounts',
        ]) ||
        value.schemaVersion !== 'microsoft-365-optimization-account-list/v1' ||
        !isMicrosoft365OptimizationProjectionBinding(Object.fromEntries(bindingKeys.map(key => [key, value[key]]))) ||
        !(0, microsoft365OptimizationValidationShared_1.coverage)(value.coverage) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.pageIndex) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.pageCount) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.pageAccountCounts, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.accountPages, item => (0, microsoft365OptimizationValidationShared_1.count)(item) && item <= microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.accountPageSize) ||
        !(0, microsoft365OptimizationValidationShared_1.count)(value.observedAccountCount) ||
        !(0, microsoft365OptimizationValidationShared_1.nullableCount)(value.exactAccountCount) ||
        (value.findingId !== null && !(0, microsoft365OptimizationValidationShared_1.token)(value.findingId)) ||
        !(0, microsoft365OptimizationValidationShared_1.list)(value.accounts, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.accountPageSize, item => (0, microsoft365OptimizationValidationShared_1.row)(item) &&
            (0, microsoft365OptimizationValidationShared_1.keys)(item, ['accountId', 'findings']) &&
            (0, microsoft365OptimizationValidationShared_1.guid)(item.accountId) &&
            (0, microsoft365OptimizationValidationShared_1.list)(item.findings, 128, ref => (0, microsoft365OptimizationValidationShared_1.row)(ref) &&
                (0, microsoft365OptimizationValidationShared_1.keys)(ref, ['findingId', 'kind', 'qualification']) &&
                (0, microsoft365OptimizationValidationShared_1.token)(ref.findingId) &&
                (0, microsoft365OptimizationValidationShared_1.choice)(ref.kind, ['combine_licenses', 'add_protection']) &&
                (0, microsoft365OptimizationValidationShared_1.choice)(ref.qualification, ['eligible', 'conditional', 'blocked'])) &&
            item.findings.length > 0 &&
            (0, microsoft365OptimizationValidationShared_1.unique)(item.findings, ref => ref.findingId) &&
            (value.findingId === null || item.findings.some(ref => ref.findingId === value.findingId))) ||
        !(0, microsoft365OptimizationValidationShared_1.unique)(value.accounts, item => String(item.accountId).toLowerCase()))
        return false;
    return (boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.accountListBytes) &&
        value.pageCount > 0 &&
        value.pageCount === value.pageAccountCounts.length &&
        value.pageIndex < value.pageCount &&
        value.accounts.length === value.pageAccountCounts[value.pageIndex] &&
        value.pageAccountCounts.reduce((sum, count) => sum + count, 0) === value.observedAccountCount &&
        (value.exactAccountCount === null || value.exactAccountCount === value.observedAccountCount) &&
        (value.coverage.state !== 'complete' || value.exactAccountCount !== null) &&
        (value.observedAccountCount > 0 ? value.pageAccountCounts.every(count => count > 0) : value.pageCount === 1));
};
const notReady = (value, version) => (0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'state', 'companyId', 'tenantId', 'reasonCodes', 'current']) &&
    value.schemaVersion === version &&
    (0, microsoft365OptimizationValidationShared_1.choice)(value.state, ['not_collected', 'stale', 'unavailable']) &&
    scope(value) &&
    (0, microsoft365OptimizationValidationShared_1.codes)(value.reasonCodes) &&
    value.reasonCodes.length > 0 &&
    (value.current === null ||
        (isMicrosoft365OptimizationProjectionBinding(value.current) &&
            value.current.companyId === value.companyId &&
            value.current.tenantId === value.tenantId));
function isMicrosoft365OptimizationSummaryResponse(value) {
    if (!(0, microsoft365OptimizationValidationShared_1.row)(value))
        return false;
    if (value.state !== 'ready')
        return notReady(value, 'microsoft-365-optimization-summary-response/v1');
    return ((0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'state', 'summary', 'catalogue']) &&
        value.schemaVersion === 'microsoft-365-optimization-summary-response/v1' &&
        (0, microsoft365OptimizationValidation_1.isMicrosoft365OptimizationSummary)(value.summary) &&
        isMicrosoft365OptimizationCatalogue(value.catalogue) &&
        value.summary.catalogueVersion === value.catalogue.catalogueVersion &&
        boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.summaryResponseBytes));
}
function isMicrosoft365OptimizationAccountResponse(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (value.state === 'ready'
            ? (0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'state', 'account']) &&
                value.schemaVersion === 'microsoft-365-optimization-account-response/v1' &&
                boundedBytes(value, microsoft365OptimizationManagement_1.MICROSOFT365_OPTIMIZATION_MANAGEMENT_LIMITS.accountResponseBytes) &&
                (0, microsoft365OptimizationValidation_1.isMicrosoft365OptimizationAccountDetail)(value.account)
            : notReady(value, 'microsoft-365-optimization-account-response/v1')));
}
function isMicrosoft365OptimizationAccountListResponse(value) {
    return ((0, microsoft365OptimizationValidationShared_1.row)(value) &&
        (value.state === 'ready'
            ? (0, microsoft365OptimizationValidationShared_1.keys)(value, ['schemaVersion', 'state', 'page']) &&
                value.schemaVersion === 'microsoft-365-optimization-account-list-response/v1' &&
                listPage(value.page)
            : notReady(value, 'microsoft-365-optimization-account-list-response/v1')));
}
//# sourceMappingURL=microsoft365OptimizationManagementValidation.js.map