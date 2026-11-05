"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT = void 0;
exports.isMicrosoft365LicenseSummaryPricing = isMicrosoft365LicenseSummaryPricing;
exports.isMicrosoft365LicenseSummaryView = isMicrosoft365LicenseSummaryView;
exports.isMicrosoft365LicenseAccountsView = isMicrosoft365LicenseAccountsView;
const microsoft365PricingFacts_1 = require("./microsoft365PricingFacts");
const microsoft365AccountReview_1 = require("./microsoft365AccountReview");
const microsoft365PricingOverrides_1 = require("./microsoft365PricingOverrides");
const microsoft365Licenses_1 = require("./microsoft365Licenses");
const microsoft365Capabilities_1 = require("./microsoft365Capabilities");
const microsoft365Usage_1 = require("./microsoft365Usage");
exports.MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT = 5000;
const record = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length > 0 && value.length <= 512;
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const exact = (value, keys) => record(value) && Object.keys(value).every(key => keys.includes(key));
const optional = (value, check) => value === undefined || check(value);
const list = (value, limit, check) => Array.isArray(value) && value.length <= limit && value.every(check);
const ids = (value, limit) => list(value, limit, text) && new Set(value).size === value.length;
const currency = (value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value);
function identity(value) {
    return text(value.tenantId) && text(value.tenantSyncRunId) && text(value.generatedAt) && Number.isFinite(Date.parse(value.generatedAt));
}
function accountDetails(value) {
    return (exact(value, ['observedRowCount', 'returnedRowCount', 'omittedRowCount']) &&
        count(value.observedRowCount) &&
        count(value.returnedRowCount) &&
        count(value.omittedRowCount) &&
        value.returnedRowCount <= exports.MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT &&
        value.observedRowCount === value.returnedRowCount + value.omittedRowCount);
}
const COVERAGE_KEYS = [
    'requiredPermissions',
    'state',
    'reason',
    'httpStatus',
    'attemptedAt',
    'observedAt',
    'period',
    'recovery',
    'observedRowCount',
    'omittedRowCount',
    'notes',
];
const SUMMARY_KEYS = [
    'productCount',
    'licensedAccountCount',
    'disabledLicensedAccountCount',
    'observedLicensedAccountCount',
    'observedDisabledLicensedAccountCount',
    'accountsWithUnknownAssignments',
];
const LICENSE_KEYS = [
    'usage',
    'capabilities',
    'skuId',
    'skuPartNumber',
    'productName',
    'appliesTo',
    'capabilityStatus',
    'enabledUnits',
    'consumedUnits',
    'unallocatedUnits',
    'warningUnits',
    'suspendedUnits',
    'renewals',
];
const PRICING_KEYS = [
    'nonSavingDowngradeEdges',
    'projection',
    'breakdownsUnavailableReason',
    'breakdowns',
    'basis',
    'priceListVersion',
    'currency',
    'currencyFallback',
    'term',
    'products',
    'summary',
];
const PRODUCT_PRICE_KEYS = [
    'referenceUnitPriceMonthly',
    'priceOverride',
    'skuId',
    'skuPartNumber',
    'productName',
    'family',
    'category',
    'priceConfidence',
    'priceDerivation',
    'priceCheckedAt',
    'priceSource',
    'unitPriceMonthly',
    'purchasedUnits',
    'assignedUnits',
    'unassignedUnits',
    'disabledAccountUnits',
    'inactiveAccountUnits',
    'monthlyCost',
    'unassignedMonthlyCost',
    'disabledMonthlyCost',
    'inactiveMonthlyCost',
    'noOfficeActivityMonthlyCost',
    'overlapAccountUnits',
    'overlapMonthlyCost',
    'downgradeAccountUnits',
    'downgradeMonthlySaving',
];
const PRICE_SUMMARY_KEYS = [
    'paidProductCount',
    'unpricedProductCount',
    'purchasedPaidUnits',
    'assignedPaidUnits',
    'unassignedPaidUnits',
    'pricedPaidProductCount',
    'pricedPaidUnits',
    'pricesComplete',
    'monthlyCost',
    'unassignedMonthlyCost',
    'disabledAccountCount',
    'disabledMonthlyCost',
    'inactiveAccountCount',
    'inactiveMonthlyCost',
    'noOfficeActivityAccountCount',
    'noOfficeActivityMonthlyCost',
    'overlapMonthlyCost',
    'downgradeMonthlySaving',
    'accountsComplete',
    'disabledAccountsComplete',
];
const INSIGHTS_KEYS = [
    'observedFindingCount',
    'rulesVersion',
    'overlapAssignmentCount',
    'overlapAccountCount',
    'downgradeCandidateCount',
    'downgradeBlockedCount',
    'downgradeEvidence',
    'patterns',
];
function productCapabilitiesPrivacy(value) {
    if (!exact(value, ['state', 'plans', 'omittedPlanCount', 'comparison']) ||
        !list(value.plans, 128, plan => exact(plan, ['servicePlanId', 'name', 'capabilityId', 'provisioningStatus', 'appliesTo'])))
        return false;
    return optional(value.comparison, comparison => {
        if (!exact(comparison, [
            'priceListVersion',
            'priceEvidenceByCurrency',
            'targetSkuId',
            'targetProductName',
            'source',
            'addedCapabilityIds',
            'lostCapabilityIds',
            'unverifiedPlanCount',
            'monthlyRetailDifferenceByCurrency',
        ]))
            return false;
        return optional(comparison.priceEvidenceByCurrency, evidence => record(evidence) &&
            Object.values(evidence).every(pair => exact(pair, ['current', 'target']) &&
                ['current', 'target'].every(key => exact(pair[key], ['unitPriceMonthly', 'confidence', 'source', 'checkedAt']))));
    });
}
/** Strict aggregate pricing boundary; omitted person-price properties must be absent even when empty. */
function isMicrosoft365LicenseSummaryPricing(value) {
    return (exact(value, PRICING_KEYS) &&
        exact(value.summary, PRICE_SUMMARY_KEYS) &&
        list(value.products, 2000, product => exact(product, PRODUCT_PRICE_KEYS)) &&
        (0, microsoft365Licenses_1.isMicrosoft365LicensePricing)({ ...value, accountMonthlyCosts: {} }));
}
const STEP_UP_KEYS = [
    'id',
    'fromSkuId',
    'fromProductName',
    'toSkuId',
    'toProductName',
    'targetSource',
    'accountCount',
    'inactiveAccountCount',
    'accountsComplete',
    'addedCapabilityIds',
    'lostCapabilityIds',
    'unverifiedPlanCount',
    'capabilityGains',
    'replacedProducts',
    'priceListVersion',
    'monthlyByCurrency',
    'segments',
];
const STEP_UP_MONEY_KEYS = [
    'priceBasis',
    'fromUnitPriceMonthly',
    'toUnitPriceMonthly',
    'toPriceConfidence',
    'perAccountDifference',
    'grossDifference',
    'replacedMonthly',
    'unpricedReplacedProductCount',
    'netDifference',
];
/** Aggregate privacy boundary: step-ups carry counts and prices, never account identifiers. */
function stepUpPrivacy(value) {
    return (exact(value, STEP_UP_KEYS) &&
        list(value.capabilityGains, 128, gain => exact(gain, ['capabilityId', 'gainingAccountCount', 'alreadyEnabledAccountCount'])) &&
        list(value.replacedProducts, 32, product => exact(product, ['skuId', 'skuPartNumber', 'productName', 'accountCount', 'basis', 'unitPriceMonthlyByCurrency'])) &&
        record(value.monthlyByCurrency) &&
        Object.values(value.monthlyByCurrency).every(money => exact(money, STEP_UP_MONEY_KEYS)) &&
        optional(value.segments, groups => list(groups, 32, group => exact(group, ['replacedSkuIds', 'accountCount', 'inactiveAccountCount', 'monthlyByCurrency']) &&
            record(group.monthlyByCurrency) &&
            Object.values(group.monthlyByCurrency).every(money => exact(money, ['priceBasis', 'currentPerAccount', 'targetPerAccount', 'differencePerAccount', 'differenceTotal'])))));
}
function summaryCapabilities(value) {
    return (exact(value, ['catalogueVersion', 'definitions', 'accountsComplete', 'summary', 'observedNoticeCount', 'stepUps']) &&
        optional(value.stepUps, stepUps => list(stepUps, 16, stepUpPrivacy)) &&
        list(value.definitions, 128, definition => exact(definition, ['id', 'name', 'group'])) &&
        list(value.summary, 128, row => exact(row, ['capabilityId', 'includedProductCount', 'includedSkuIds', 'enabledAccountCount', 'observedEnabledAccountCount'])) &&
        (0, microsoft365Capabilities_1.isMicrosoft365CapabilityProjection)({ ...value, notices: [], omittedNoticeCount: value.observedNoticeCount }));
}
function summaryInsights(value) {
    if (!exact(value, INSIGHTS_KEYS) || !optional(value.observedFindingCount, count) || !(0, microsoft365Licenses_1.isMicrosoft365LicenseInsights)({ ...value, findings: [] }))
        return false;
    if (!list(value.patterns, 2000, row => exact(row, ['kind', 'ruleId', 'skuId', 'targetSkuId', 'targetSkuPartNumber', 'targetProductName', 'coveredBySkuIds', 'count']) &&
        (row.kind === 'overlap' || row.kind === 'downgrade') &&
        text(row.ruleId) &&
        text(row.skuId) &&
        (row.targetSkuId === null || text(row.targetSkuId)) &&
        (row.targetSkuPartNumber === null || text(row.targetSkuPartNumber)) &&
        optional(row.targetProductName, name => name === null || text(name)) &&
        ids(row.coveredBySkuIds, 16) &&
        count(row.count) &&
        row.count > 0))
        return false;
    const keys = value.patterns.map(row => {
        const pattern = row;
        return JSON.stringify([
            pattern.kind,
            pattern.ruleId,
            pattern.skuId,
            pattern.targetSkuId,
            pattern.targetSkuPartNumber,
            [...pattern.coveredBySkuIds].sort(),
        ]);
    });
    return new Set(keys).size === keys.length;
}
function anonymousWorkloads(value) {
    return (exact(value, ['basis', 'reportRefreshDate', 'windowDays', 'observedRowCount', 'workloads']) &&
        value.basis === 'report_rows' &&
        value.windowDays === 30 &&
        count(value.observedRowCount) &&
        (value.reportRefreshDate === null || (0, microsoft365Usage_1.isMicrosoft365UsageDate)(value.reportRefreshDate)) &&
        exact(value.workloads, ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage']) &&
        ['exchange', 'oneDrive', 'sharePoint', 'teams', 'vivaEngage'].every(key => {
            const row = value.workloads[key];
            return (exact(row, ['active', 'inactive', 'noRecordedActivity', 'unknown']) &&
                ['active', 'inactive', 'noRecordedActivity', 'unknown'].every(field => count(row[field])) &&
                Number(row.active) + Number(row.inactive) + Number(row.noRecordedActivity) + Number(row.unknown) === value.observedRowCount);
        }));
}
/** Validates the summary privacy boundary independently of the legacy view's 2,000-row limit. */
function isMicrosoft365LicenseSummaryView(value) {
    if (!exact(value, [
        'schemaVersion',
        'marketCurrency',
        'tenantId',
        'generatedAt',
        'tenantSyncRunId',
        'coverage',
        'reportIdentity',
        'summary',
        'licenses',
        'pricingByCurrency',
        'pricing',
        'insights',
        'organization',
        'capabilities',
        'usage',
        'accountDetails',
        'accountReview',
        'pricingFacts',
        'pricingRevision',
    ]) ||
        value.schemaVersion !== 'microsoft-365-license-summary/v1' ||
        !identity(value) ||
        !accountDetails(value.accountDetails) ||
        !optional(value.accountReview, microsoft365AccountReview_1.isMicrosoft365AccountReview) ||
        (value.accountReview !== undefined &&
            ['observedRowCount', 'returnedRowCount', 'omittedRowCount'].some(key => value.accountReview.coverage[key] !==
                value.accountDetails[key])) ||
        !exact(value.reportIdentity, ['concealment', 'correlation']) ||
        !exact(value.summary, SUMMARY_KEYS) ||
        !exact(value.coverage, microsoft365Licenses_1.MICROSOFT_365_LICENSE_SOURCES) ||
        !Object.values(value.coverage).every(source => exact(source, COVERAGE_KEYS) && exact(source.recovery, ['action', 'optional'])) ||
        !list(value.licenses, 2000, row => exact(row, LICENSE_KEYS) &&
            optional(row.capabilities, productCapabilitiesPrivacy) &&
            optional(row.renewals, renewals => list(renewals, 32, renewal => exact(renewal, ['status', 'isTrial', 'totalLicenses', 'nextLifecycleDateTime'])))) ||
        !optional(value.organization, organization => exact(organization, ['displayName', 'defaultDomain'])) ||
        !optional(value.pricingFacts, microsoft365PricingFacts_1.isMicrosoft365PricingFacts) ||
        !optional(value.pricingRevision, microsoft365PricingOverrides_1.isMicrosoft365PricingRevision) ||
        !optional(value.pricing, isMicrosoft365LicenseSummaryPricing) ||
        !optional(value.insights, summaryInsights) ||
        !optional(value.capabilities, summaryCapabilities))
        return false;
    if (value.pricingByCurrency !== undefined &&
        (!record(value.pricingByCurrency) ||
            Object.keys(value.pricingByCurrency).length > 16 ||
            !Object.entries(value.pricingByCurrency).every(([code, pricing]) => currency(code) && isMicrosoft365LicenseSummaryPricing(pricing) && pricing.currency === code)))
        return false;
    let usage;
    if (value.usage !== undefined) {
        if (!record(value.usage))
            return false;
        const { anonymousWorkloads: anonymous, ...aggregate } = value.usage;
        if (!(0, microsoft365Usage_1.isMicrosoft365UsageSummary)(aggregate) ||
            !optional(anonymous, anonymousWorkloads) ||
            (anonymous !== undefined && aggregate.evidence !== 'identities_concealed'))
            return false;
        usage = aggregate;
    }
    // Reuse the existing aggregate validators without changing the legacy envelope or its limits.
    if (!(0, microsoft365Licenses_1.isMicrosoft365LicenseView)({
        ...value,
        schemaVersion: 'microsoft-365-license-view/v1',
        accounts: [],
        reports: { officeActiveUsers: [], officeAppUsage: [], copilotUsage: [] },
        pricing: undefined,
        pricingByCurrency: undefined,
        insights: undefined,
        capabilities: undefined,
        usage,
    }))
        return false;
    if (value.capabilities !== undefined) {
        const capabilities = value.capabilities;
        const skuIds = new Set(value.licenses.map(row => row.skuId));
        const definitions = new Set(capabilities.definitions.map(row => row.id));
        if (!capabilities.summary.every(row => (row.includedSkuIds ?? []).every(id => skuIds.has(id))) ||
            !value.licenses.every(row => (row.capabilities?.plans ?? []).every(plan => plan.capabilityId === null || definitions.has(plan.capabilityId)) &&
                (!row.capabilities?.comparison ||
                    [...row.capabilities.comparison.addedCapabilityIds, ...row.capabilities.comparison.lostCapabilityIds].every(id => definitions.has(id)))) ||
            // A step-up compares a held source product and replaces only held products; the target may come from the publisher catalogue.
            !(capabilities.stepUps ?? []).every(stepUp => skuIds.has(stepUp.fromSkuId) && stepUp.replacedProducts.every(product => skuIds.has(product.skuId))))
            return false;
    }
    return true;
}
/** Validates up to 5,000 people and keeps findings/notices/prices within the returned account set. */
function isMicrosoft365LicenseAccountsView(value) {
    if (record(value) && !optional(value.pricingRevision, microsoft365PricingOverrides_1.isMicrosoft365PricingRevision))
        return false;
    if (!exact(value, [
        'schemaVersion',
        'tenantId',
        'generatedAt',
        'tenantSyncRunId',
        'accountDetails',
        'pricingRevision',
        'accounts',
        'insights',
        'capabilities',
        'pricing',
    ]) ||
        value.schemaVersion !== 'microsoft-365-license-accounts/v1' ||
        !identity(value) ||
        !accountDetails(value.accountDetails) ||
        !list(value.accounts, exports.MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT, microsoft365Licenses_1.isMicrosoft365LicensedAccountRow) ||
        value.accounts.length !== value.accountDetails.returnedRowCount)
        return false;
    const accountIds = new Set(value.accounts.map(row => row.id));
    if (accountIds.size !== value.accounts.length)
        return false;
    if (!optional(value.insights, insights => exact(insights, ['rulesVersion', 'findings']) &&
        text(insights.rulesVersion) &&
        list(insights.findings, 50000, finding => (0, microsoft365Licenses_1.isMicrosoft365LicenseInsight)(finding) && accountIds.has(finding.accountId))))
        return false;
    if (!optional(value.capabilities, capabilities => exact(capabilities, ['catalogueVersion', 'notices', 'observedNoticeCount', 'omittedNoticeCount']) &&
        text(capabilities.catalogueVersion) &&
        count(capabilities.observedNoticeCount) &&
        count(capabilities.omittedNoticeCount) &&
        list(capabilities.notices, 50000, notice => (0, microsoft365Capabilities_1.isMicrosoft365CapabilityNotice)(notice) && (notice.accountId === undefined || accountIds.has(notice.accountId))) &&
        capabilities.observedNoticeCount === capabilities.notices.length + capabilities.omittedNoticeCount))
        return false;
    return optional(value.pricing, pricing => exact(pricing, ['currency', 'accountMonthlyCosts', 'paidAccountIds', 'partialAccountPriceIds', 'basis', 'projection']) &&
        optional(pricing.basis, basis => typeof basis === 'string' && ['list_price_estimate', 'customer_price_estimate', 'mixed_price_estimate'].includes(basis)) &&
        optional(pricing.projection, microsoft365PricingOverrides_1.isMicrosoft365PricingProjection) &&
        currency(pricing.currency) &&
        record(pricing.accountMonthlyCosts) &&
        Object.keys(pricing.accountMonthlyCosts).length <= exports.MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT &&
        Object.entries(pricing.accountMonthlyCosts).every(([id, amount]) => accountIds.has(id) && typeof amount === 'number' && Number.isFinite(amount) && amount >= 0) &&
        ['paidAccountIds', 'partialAccountPriceIds'].every(key => optional(pricing[key], rows => ids(rows, exports.MICROSOFT_365_LICENSE_ACCOUNT_ROW_LIMIT) && rows.every(id => accountIds.has(id)))));
}
//# sourceMappingURL=microsoft365LicensePortal.js.map