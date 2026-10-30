const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length > 0 && value.length <= 512;
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const ids = (value) => Array.isArray(value) && value.length <= 128 && value.every(text) && new Set(value).size === value.length;
const state = (value) => typeof value === 'string' && ['complete', 'partial', 'unknown'].includes(value);
const optional = (value, check) => value === undefined || check(value);
const url = (value) => {
    return text(value) && /^https:\/\/(?:learn\.microsoft\.com|support\.microsoft\.com|techcommunity\.microsoft\.com)\/[^\s]*$/.test(value);
};
const priceEvidence = (value) => record(value) &&
    (value.unitPriceMonthly === null ||
        (typeof value.unitPriceMonthly === 'number' && Number.isFinite(value.unitPriceMonthly) && value.unitPriceMonthly >= 0)) &&
    (value.confidence === null || (typeof value.confidence === 'string' && ['verified', 'reference'].includes(value.confidence))) &&
    (value.source === null || (text(value.source) && /^https:\/\/(?:www|learn|support)\.microsoft\.com\/[^\s]*$/.test(value.source))) &&
    (value.checkedAt === null ||
        (text(value.checkedAt) && /^\d{4}-\d{2}-\d{2}$/.test(value.checkedAt) && Number.isFinite(Date.parse(value.checkedAt))));
const amount = (value) => typeof value === 'number' && Number.isFinite(value);
const nullableAmount = (value) => value === null || amount(value);
const nullablePrice = (value) => value === null || (amount(value) && value >= 0);
const byCurrency = (value, check) => record(value) && Object.keys(value).length <= 16 && Object.entries(value).every(([currency, item]) => /^[A-Z]{3}$/.test(currency) && check(item));
/** Validates one aggregate step-up money row; gross and net are unknown together with the per-account difference. */
export function isMicrosoft365StepUpMoney(value) {
    return (record(value) &&
        optional(value.priceBasis, basis => typeof basis === 'string' && ['list', 'agreed', 'mixed'].includes(basis)) &&
        nullablePrice(value.fromUnitPriceMonthly) &&
        nullablePrice(value.toUnitPriceMonthly) &&
        (value.toPriceConfidence === null ||
            (typeof value.toPriceConfidence === 'string' && ['verified', 'reference'].includes(value.toPriceConfidence))) &&
        nullableAmount(value.perAccountDifference) &&
        nullableAmount(value.grossDifference) &&
        nullableAmount(value.netDifference) &&
        (value.perAccountDifference === null) === (value.grossDifference === null) &&
        (value.grossDifference === null) === (value.netDifference === null) &&
        amount(value.replacedMonthly) &&
        value.replacedMonthly >= 0 &&
        count(value.unpricedReplacedProductCount));
}
const priceBasis = (value) => value === undefined || (typeof value === 'string' && ['list', 'agreed', 'mixed'].includes(value));
/** Validates one group's money: the difference is unknown exactly when either price is, and the total follows the difference. */
export function isMicrosoft365StepUpSegmentMoney(value) {
    return (record(value) &&
        priceBasis(value.priceBasis) &&
        nullablePrice(value.currentPerAccount) &&
        nullablePrice(value.targetPerAccount) &&
        nullableAmount(value.differencePerAccount) &&
        nullableAmount(value.differenceTotal) &&
        (value.differencePerAccount === null) === (value.currentPerAccount === null || value.targetPerAccount === null) &&
        (value.differenceTotal === null) === (value.differencePerAccount === null));
}
const segments = (value, accounts, replaced) => {
    if (!Array.isArray(value) || value.length > 32)
        return false;
    const keys = new Set();
    let total = 0;
    for (const segment of value) {
        if (!record(segment) ||
            !Array.isArray(segment.replacedSkuIds) ||
            segment.replacedSkuIds.length > 32 ||
            !segment.replacedSkuIds.every(id => text(id) && replaced.has(id)) ||
            new Set(segment.replacedSkuIds).size !== segment.replacedSkuIds.length ||
            [...segment.replacedSkuIds].sort().join('|') !== segment.replacedSkuIds.join('|') ||
            !count(segment.accountCount) ||
            segment.accountCount === 0 ||
            !count(segment.inactiveAccountCount) ||
            segment.inactiveAccountCount > segment.accountCount ||
            !byCurrency(segment.monthlyByCurrency, isMicrosoft365StepUpSegmentMoney))
            return false;
        const key = segment.replacedSkuIds.join('|');
        if (keys.has(key))
            return false;
        keys.add(key);
        total += segment.accountCount;
    }
    return total <= accounts;
};
/** Validates one step-up and its internal arithmetic counts. Capability IDs are checked against definitions by the projection. */
export function isMicrosoft365StepUpComparison(value) {
    if (!record(value) ||
        !text(value.fromSkuId) ||
        !text(value.toSkuId) ||
        value.id !== `${value.fromSkuId}:${value.toSkuId}` ||
        value.fromSkuId === value.toSkuId ||
        !text(value.fromProductName) ||
        !text(value.toProductName) ||
        typeof value.targetSource !== 'string' ||
        !['tenant', 'publisher'].includes(value.targetSource) ||
        !count(value.accountCount) ||
        !count(value.inactiveAccountCount) ||
        value.inactiveAccountCount > value.accountCount ||
        typeof value.accountsComplete !== 'boolean' ||
        !ids(value.addedCapabilityIds) ||
        !ids(value.lostCapabilityIds) ||
        !count(value.unverifiedPlanCount) ||
        !text(value.priceListVersion) ||
        !byCurrency(value.monthlyByCurrency, isMicrosoft365StepUpMoney))
        return false;
    const accounts = value.accountCount;
    const added = new Set(value.addedCapabilityIds);
    return (Array.isArray(value.capabilityGains) &&
        value.capabilityGains.length <= 128 &&
        new Set(value.capabilityGains.map(gain => (record(gain) ? gain.capabilityId : null))).size === value.capabilityGains.length &&
        value.capabilityGains.every(gain => record(gain) &&
            text(gain.capabilityId) &&
            added.has(gain.capabilityId) &&
            count(gain.gainingAccountCount) &&
            count(gain.alreadyEnabledAccountCount) &&
            gain.gainingAccountCount + gain.alreadyEnabledAccountCount === accounts) &&
        Array.isArray(value.replacedProducts) &&
        value.replacedProducts.length <= 32 &&
        new Set(value.replacedProducts.map(product => (record(product) ? product.skuId : null))).size === value.replacedProducts.length &&
        value.replacedProducts.every(product => record(product) &&
            text(product.skuId) &&
            product.skuId !== value.fromSkuId &&
            product.skuId !== value.toSkuId &&
            text(product.skuPartNumber) &&
            text(product.productName) &&
            count(product.accountCount) &&
            product.accountCount > 0 &&
            product.accountCount <= accounts &&
            typeof product.basis === 'string' &&
            ['rule', 'service_plans'].includes(product.basis) &&
            byCurrency(product.unitPriceMonthlyByCurrency, nullablePrice)) &&
        optional(value.segments, list => segments(list, accounts, new Set(value.replacedProducts.map(product => (record(product) ? product.skuId : null))))));
}
export function isMicrosoft365ProductCapabilities(value) {
    if (!record(value) ||
        !state(value.state) ||
        !count(value.omittedPlanCount) ||
        !Array.isArray(value.plans) ||
        value.plans.length > 128 ||
        !value.plans.every(plan => record(plan) &&
            text(plan.servicePlanId) &&
            text(plan.name) &&
            (plan.capabilityId === null || text(plan.capabilityId)) &&
            (plan.provisioningStatus === null || text(plan.provisioningStatus)) &&
            (plan.appliesTo === null || text(plan.appliesTo))) ||
        new Set(value.plans.map(plan => plan.servicePlanId)).size !== value.plans.length)
        return false;
    const comparison = value.comparison;
    return (comparison === undefined ||
        (record(comparison) &&
            text(comparison.targetSkuId) &&
            text(comparison.targetProductName) &&
            typeof comparison.source === 'string' &&
            ['tenant', 'publisher'].includes(comparison.source) &&
            ids(comparison.addedCapabilityIds) &&
            ids(comparison.lostCapabilityIds) &&
            count(comparison.unverifiedPlanCount) &&
            record(comparison.monthlyRetailDifferenceByCurrency) &&
            optional(comparison.priceListVersion, text) &&
            optional(comparison.priceEvidenceByCurrency, evidence => record(evidence) &&
                Object.keys(evidence).length <= 16 &&
                Object.entries(evidence).every(([currency, constituents]) => /^[A-Z]{3}$/.test(currency) && record(constituents) && priceEvidence(constituents.current) && priceEvidence(constituents.target))) &&
            Object.keys(comparison.monthlyRetailDifferenceByCurrency).length <= 16 &&
            Object.entries(comparison.monthlyRetailDifferenceByCurrency).every(([currency, amount]) => /^[A-Z]{3}$/.test(currency) && (amount === null || (typeof amount === 'number' && Number.isFinite(amount))))));
}
export function isMicrosoft365AccountCapabilities(value) {
    if (!record(value) || !state(value.state))
        return false;
    const fields = ['enabledIds', 'disabledIds', 'unknownIds', 'errorIds', 'unavailableIds'];
    if (!fields.every(field => ids(value[field])))
        return false;
    const flattened = fields.flatMap(field => value[field]);
    return new Set(flattened).size === flattened.length;
}
export function isMicrosoft365CapabilityProjection(value) {
    if (!record(value) ||
        !text(value.catalogueVersion) ||
        typeof value.accountsComplete !== 'boolean' ||
        !Array.isArray(value.definitions) ||
        value.definitions.length > 128 ||
        !value.definitions.every(definition => record(definition) && text(definition.id) && text(definition.name) && text(definition.group)) ||
        !Array.isArray(value.summary) ||
        value.summary.length > 128 ||
        !count(value.observedNoticeCount) ||
        !count(value.omittedNoticeCount) ||
        !Array.isArray(value.notices) ||
        value.notices.length > 2000)
        return false;
    const definitions = new Set(value.definitions.map(definition => definition.id));
    if (definitions.size !== value.definitions.length ||
        new Set(value.summary.map(row => (record(row) ? row.capabilityId : null))).size !== value.summary.length)
        return false;
    if (!value.summary.every(row => record(row) &&
        definitions.has(row.capabilityId) &&
        count(row.includedProductCount) &&
        optional(row.includedSkuIds, ids) &&
        (!Array.isArray(row.includedSkuIds) || row.includedSkuIds.length <= Number(row.includedProductCount)) &&
        count(row.observedEnabledAccountCount) &&
        (row.enabledAccountCount === null || (count(row.enabledAccountCount) && row.enabledAccountCount === row.observedEnabledAccountCount)) &&
        (value.accountsComplete || row.enabledAccountCount === null)))
        return false;
    if (value.observedNoticeCount !== value.notices.length + value.omittedNoticeCount)
        return false;
    if (!optional(value.stepUps, stepUps => Array.isArray(stepUps) &&
        stepUps.length <= 16 &&
        stepUps.every(isMicrosoft365StepUpComparison) &&
        new Set(stepUps.map(stepUp => stepUp.id)).size === stepUps.length &&
        stepUps.every(stepUp => [...stepUp.addedCapabilityIds, ...stepUp.lostCapabilityIds].every(id => definitions.has(id)))))
        return false;
    return value.notices.every(isMicrosoft365CapabilityNotice);
}
/** Validates one informational capability notice independently of an account-detail cap. */
export function isMicrosoft365CapabilityNotice(notice) {
    return (record(notice) &&
        typeof notice.kind === 'string' &&
        ['assignment_error', 'retired_service', 'redundant_addon', 'suspended_subscription'].includes(notice.kind) &&
        text(notice.skuId) &&
        text(notice.title) &&
        text(notice.detail) &&
        optional(notice.accountId, text) &&
        optional(notice.assignedByGroup, group => group === null || text(group)) &&
        optional(notice.code, text) &&
        optional(notice.sourceUrl, url) &&
        optional(notice.retiredAt, date => text(date) && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date))) &&
        optional(notice.coveredBySkuIds, ids) &&
        (notice.kind === 'retired_service' || text(notice.accountId)) &&
        (notice.kind !== 'retired_service' || (url(notice.sourceUrl) && text(notice.retiredAt))) &&
        (notice.kind !== 'redundant_addon' || (ids(notice.coveredBySkuIds) && notice.coveredBySkuIds.length > 0)));
}
