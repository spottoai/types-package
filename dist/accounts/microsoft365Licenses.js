"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MICROSOFT_365_LATER_LICENSE_SOURCES = exports.MICROSOFT_365_LICENSE_SOURCES = void 0;
exports.isMicrosoft365LicensePricing = isMicrosoft365LicensePricing;
exports.isMicrosoft365LicenseInsight = isMicrosoft365LicenseInsight;
exports.isMicrosoft365LicenseInsights = isMicrosoft365LicenseInsights;
exports.isMicrosoft365LicensedAccountRow = isMicrosoft365LicensedAccountRow;
exports.isMicrosoft365LicenseView = isMicrosoft365LicenseView;
exports.withMicrosoft365AccountPricing = withMicrosoft365AccountPricing;
const microsoft365PricingOverrides_1 = require("./microsoft365PricingOverrides");
const microsoft365AccountReview_1 = require("./microsoft365AccountReview");
const microsoft365PricingFacts_1 = require("./microsoft365PricingFacts");
const microsoft365Capabilities_1 = require("./microsoft365Capabilities");
const microsoft365Usage_1 = require("./microsoft365Usage");
exports.MICROSOFT_365_LICENSE_SOURCES = [
    'subscribedSkus',
    'users',
    'signInActivity',
    'reportSettings',
    'officeActiveUsers',
    'officeAppUsage',
    'copilotUsage',
    'subscriptions',
    'organization',
    // Append only: engine collection checkpoints address sources by position.
    'mailboxUsage',
    'oneDriveUsage',
    'officeActiveUserCounts',
];
/** Sources added after the first release. Artifacts and views collected earlier do not have them. */
exports.MICROSOFT_365_LATER_LICENSE_SOURCES = [
    'subscriptions',
    'organization',
    'mailboxUsage',
    'oneDriveUsage',
    'officeActiveUserCounts',
];
const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.length <= 512;
const nullableText = (value) => value === null || text(value);
const count = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const nullableCount = (value) => value === null || count(value);
const nullableBoolean = (value) => value === null || typeof value === 'boolean';
const date = (value) => text(value) && Number.isFinite(Date.parse(value));
const rows = (value, predicate) => Array.isArray(value) && value.length <= 2000 && value.every(predicate);
const money = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nullableMoney = (value) => value === null || money(value);
const PRICING_SUMMARY_COUNTS = [
    'paidProductCount',
    'unpricedProductCount',
    'purchasedPaidUnits',
    'assignedPaidUnits',
    'unassignedPaidUnits',
    'disabledAccountCount',
    'inactiveAccountCount',
];
const PRICING_SUMMARY_MONEY = ['monthlyCost', 'unassignedMonthlyCost', 'disabledMonthlyCost', 'inactiveMonthlyCost'];
const OPTIONAL_SUMMARY_MONEY = ['overlapMonthlyCost', 'downgradeMonthlySaving', 'noOfficeActivityMonthlyCost'];
const OPTIONAL_PRODUCT_COUNTS = ['overlapAccountUnits', 'downgradeAccountUnits'];
const OPTIONAL_PRODUCT_MONEY = ['overlapMonthlyCost', 'downgradeMonthlySaving', 'noOfficeActivityMonthlyCost'];
const optional = (value, predicate) => value === undefined || predicate(value);
const PRODUCT_COUNTS = ['purchasedUnits', 'assignedUnits', 'unassignedUnits'];
const PRODUCT_MONEY = ['unitPriceMonthly', 'monthlyCost', 'unassignedMonthlyCost', 'disabledMonthlyCost', 'inactiveMonthlyCost'];
const PRODUCT_FAMILIES = [
    'microsoft365',
    'copilot',
    'exchange',
    'teams',
    'sharepoint',
    'powerBi',
    'powerPlatform',
    'visio',
    'project',
    'dynamics',
    'security',
    'windows',
    'other',
];
/** Validates one bounded list-price estimate (engine `pricingByCurrency` entry or API `pricing`). */
function isMicrosoft365LicensePricing(value) {
    if (!isRecord(value) ||
        typeof value.basis !== 'string' ||
        !['list_price_estimate', 'customer_price_estimate', 'mixed_price_estimate'].includes(value.basis) ||
        typeof value.term !== 'string' ||
        !['annual_commitment', 'customer_agreement', 'mixed'].includes(value.term) ||
        !text(value.priceListVersion) ||
        typeof value.currency !== 'string' ||
        !/^[A-Z]{3}$/.test(value.currency) ||
        typeof value.currencyFallback !== 'boolean' ||
        !isRecord(value.summary) ||
        !isRecord(value.accountMonthlyCosts))
        return false;
    const summary = value.summary;
    if (!PRICING_SUMMARY_COUNTS.every(key => nullableCount(summary[key])) ||
        !PRICING_SUMMARY_MONEY.every(key => nullableMoney(summary[key])) ||
        !OPTIONAL_SUMMARY_MONEY.every(key => optional(summary[key], nullableMoney)) ||
        !optional(summary.noOfficeActivityAccountCount, nullableCount) ||
        typeof summary.accountsComplete !== 'boolean' ||
        typeof summary.disabledAccountsComplete !== 'boolean')
        return false;
    if ((summary.pricedPaidProductCount !== undefined && !nullableCount(summary.pricedPaidProductCount)) ||
        (summary.pricedPaidUnits !== undefined && !nullableCount(summary.pricedPaidUnits)) ||
        (summary.pricesComplete !== undefined && typeof summary.pricesComplete !== 'boolean') ||
        (typeof summary.pricedPaidProductCount === 'number' &&
            typeof summary.paidProductCount === 'number' &&
            summary.pricedPaidProductCount > summary.paidProductCount) ||
        (typeof summary.pricedPaidUnits === 'number' &&
            typeof summary.purchasedPaidUnits === 'number' &&
            summary.pricedPaidUnits > summary.purchasedPaidUnits) ||
        ![value.paidAccountIds, value.partialAccountPriceIds].every(ids => ids === undefined || rows(ids, id => text(id) && !!id)))
        return false;
    const costs = Object.entries(value.accountMonthlyCosts);
    if (costs.length > 2000 || !costs.every(([key, cost]) => text(key) && !!key && money(cost)))
        return false;
    if (value.breakdowns !== undefined &&
        (!isRecord(value.breakdowns) ||
            !Object.keys(value.breakdowns).every(key => ['domain', 'department', 'country'].includes(key)) ||
            !['domain', 'department', 'country'].every(key => {
                const groups = value.breakdowns[key];
                // Up to 25 ordinary groups plus the always-retained Not Set and synthetic Other rows.
                return Array.isArray(groups) && groups.length <= 27 && groups.every(microsoft365Usage_1.isMicrosoft365LicenseBreakdownRow);
            })))
        return false;
    if (!optional(value.projection, microsoft365PricingOverrides_1.isMicrosoft365PricingProjection) || !optional(value.breakdownsUnavailableReason, text))
        return false;
    if (value.nonSavingDowngradeEdges !== undefined &&
        (!Array.isArray(value.nonSavingDowngradeEdges) ||
            value.nonSavingDowngradeEdges.length > 100000 ||
            !value.nonSavingDowngradeEdges.every(edge => isRecord(edge) &&
                text(edge.skuId) &&
                !!edge.skuId &&
                (edge.targetSkuId === undefined || edge.targetSkuId === null || text(edge.targetSkuId)) &&
                nullableText(edge.targetSkuPartNumber) &&
                count(edge.count) &&
                Object.keys(edge).every(key => ['skuId', 'targetSkuId', 'targetSkuPartNumber', 'count'].includes(key)))))
        return false;
    return rows(value.products, row => isRecord(row) &&
        text(row.skuId) &&
        !!row.skuId &&
        text(row.skuPartNumber) &&
        text(row.productName) &&
        PRODUCT_FAMILIES.includes(row.family) &&
        ['paid', 'free', 'capacity', 'unpriced'].includes(String(row.category)) &&
        (row.priceConfidence === null || row.priceConfidence === 'verified' || row.priceConfidence === 'reference') &&
        (row.priceCheckedAt === undefined || row.priceCheckedAt === null || date(row.priceCheckedAt)) &&
        (row.priceSource === undefined || nullableText(row.priceSource)) &&
        optional(row.referenceUnitPriceMonthly, nullableMoney) &&
        optional(row.priceOverride, microsoft365PricingOverrides_1.isMicrosoft365PricingOverride) &&
        (row.priceDerivation === undefined ||
            row.priceDerivation === null ||
            (typeof row.priceDerivation === 'string' &&
                ['usd_list', 'observed_local', 'market_factor', 'customer_override'].includes(row.priceDerivation))) &&
        PRODUCT_COUNTS.every(key => nullableCount(row[key])) &&
        nullableCount(row.disabledAccountUnits) &&
        nullableCount(row.inactiveAccountUnits) &&
        PRODUCT_MONEY.every(key => nullableMoney(row[key])) &&
        OPTIONAL_PRODUCT_COUNTS.every(key => optional(row[key], nullableCount)) &&
        OPTIONAL_PRODUCT_MONEY.every(key => optional(row[key], nullableMoney)));
}
/** Validates one person-level finding; collection limits belong to each envelope. */
function isMicrosoft365LicenseInsight(row) {
    return (isRecord(row) &&
        text(row.accountId) &&
        !!row.accountId &&
        text(row.skuId) &&
        !!row.skuId &&
        (row.kind === 'overlap' || row.kind === 'downgrade') &&
        text(row.ruleId) &&
        !!row.ruleId &&
        optional(row.coveredBySkuIds, ids => Array.isArray(ids) && ids.length <= 16 && ids.every(id => text(id) && !!id)) &&
        optional(row.targetSkuPartNumber, nullableText) &&
        optional(row.targetProductName, nullableText) &&
        optional(row.assignedByGroup, flag => typeof flag === 'boolean') &&
        optional(row.evidence, evidence => isRecord(evidence) &&
            ['windows', 'mac', 'web', 'mobile', 'mailboxHasArchive'].every(key => nullableBoolean(evidence[key])) &&
            nullableCount(evidence.mailboxUsedBytes) &&
            nullableCount(evidence.oneDriveUsedBytes) &&
            typeof evidence.storageChecked === 'boolean') &&
        optional(row.blockedBy, reasons => row.kind === 'downgrade' &&
            Array.isArray(reasons) &&
            reasons.length > 0 &&
            reasons.length <= 2 &&
            new Set(reasons).size === reasons.length &&
            reasons.every(reason => reason === 'mailbox_over_target_limit' || reason === 'onedrive_over_target_limit')));
}
/** Validates bounded duplicate and downgrade findings. */
function isMicrosoft365LicenseInsights(value) {
    return (isRecord(value) &&
        text(value.rulesVersion) &&
        !!value.rulesVersion &&
        nullableCount(value.overlapAssignmentCount) &&
        nullableCount(value.overlapAccountCount) &&
        nullableCount(value.downgradeCandidateCount) &&
        optional(value.downgradeBlockedCount, nullableCount) &&
        ['available', 'report_unavailable', 'identities_concealed'].includes(String(value.downgradeEvidence)) &&
        rows(value.findings, isMicrosoft365LicenseInsight));
}
/** Validates one licensed account; collection limits belong to each envelope. */
function isMicrosoft365LicensedAccountRow(row) {
    return (isRecord(row) &&
        optional(row.mainReviewReason, microsoft365AccountReview_1.isMicrosoft365AccountReviewReason) &&
        text(row.id) &&
        !!row.id &&
        nullableText(row.displayName) &&
        nullableText(row.userPrincipalName) &&
        nullableBoolean(row.accountEnabled) &&
        (row.lastSuccessfulSignInAt === null || date(row.lastSuccessfulSignInAt)) &&
        nullableBoolean(row.signInOlderThan90Days) &&
        optional(row.capabilities, microsoft365Capabilities_1.isMicrosoft365AccountCapabilities) &&
        optional(row.userType, type => type === null || type === 'Member' || type === 'Guest') &&
        optional(row.createdAt, created => created === null || date(created)) &&
        optional(row.signInStatus, status => typeof status === 'string' && ['recent', 'older_than_90_days', 'never_signed_in', 'new_account', 'unknown'].includes(status)) &&
        optional(row.profile, microsoft365Usage_1.isMicrosoft365AccountProfile) &&
        optional(row.usage, microsoft365Usage_1.isMicrosoft365AccountUsage) &&
        (row.skuIds === null || (Array.isArray(row.skuIds) && row.skuIds.length <= 128 && row.skuIds.every(text))));
}
/** Validates the bounded engine projection at API/storage boundaries. */
function isMicrosoft365LicenseView(value) {
    if (isRecord(value) &&
        (!optional(value.pricingFacts, microsoft365PricingFacts_1.isMicrosoft365PricingFacts) || !optional(value.pricingRevision, microsoft365PricingOverrides_1.isMicrosoft365PricingRevision)))
        return false;
    if (!isRecord(value) ||
        value.schemaVersion !== 'microsoft-365-license-view/v1' ||
        !text(value.tenantId) ||
        !value.tenantId ||
        !date(value.generatedAt) ||
        (value.tenantSyncRunId !== undefined && !text(value.tenantSyncRunId)) ||
        !optional(value.marketCurrency, currency => typeof currency === 'string' && /^[A-Z]{3}$/.test(currency)))
        return false;
    if (!isRecord(value.reportIdentity) ||
        !['concealed', 'identifiable', 'unknown'].includes(String(value.reportIdentity.concealment)) ||
        typeof value.reportIdentity.correlation !== 'string' ||
        !['not_performed', 'performed', 'identities_concealed'].includes(value.reportIdentity.correlation))
        return false;
    if (!isRecord(value.coverage) ||
        !exports.MICROSOFT_365_LICENSE_SOURCES.every(name => {
            const source = value.coverage[name];
            if (source === undefined && exports.MICROSOFT_365_LATER_LICENSE_SOURCES.includes(name))
                return true;
            return (isRecord(source) &&
                ['complete', 'partial', 'denied', 'unavailable', 'failed'].includes(String(source.state)) &&
                date(source.attemptedAt) &&
                (source.observedAt === null || date(source.observedAt)) &&
                Array.isArray(source.requiredPermissions) &&
                source.requiredPermissions.length <= 8 &&
                source.requiredPermissions.every(text) &&
                isRecord(source.recovery) &&
                ['none', 'review_access', 'retry_collection'].includes(String(source.recovery.action)) &&
                typeof source.recovery.optional === 'boolean' &&
                nullableCount(source.observedRowCount) &&
                count(source.omittedRowCount) &&
                (source.reason === undefined || text(source.reason)) &&
                (source.httpStatus === undefined ||
                    (typeof source.httpStatus === 'number' && Number.isInteger(source.httpStatus) && source.httpStatus >= 100 && source.httpStatus <= 599)) &&
                (source.period === undefined || source.period === 'D30' || source.period === 'D28' || source.period === 'D180') &&
                optional(source.notes, notes => Array.isArray(notes) && notes.length <= 1 && notes.every(note => note === 'workload_dates_omitted_for_size')));
        }))
        return false;
    if (!isRecord(value.summary) ||
        !['productCount', 'licensedAccountCount', 'disabledLicensedAccountCount', 'accountsWithUnknownAssignments'].every(key => nullableCount(value.summary[key])) ||
        !optional(value.summary.observedLicensedAccountCount, count) ||
        !optional(value.summary.observedDisabledLicensedAccountCount, count))
        return false;
    const summary = value.summary;
    for (const [exact, minimum] of [
        [summary.licensedAccountCount, summary.observedLicensedAccountCount],
        [summary.disabledLicensedAccountCount, summary.observedDisabledLicensedAccountCount],
    ]) {
        if (typeof exact === 'number' && typeof minimum === 'number' && minimum > exact)
            return false;
    }
    const licensed = summary.licensedAccountCount ?? summary.observedLicensedAccountCount;
    const disabled = summary.disabledLicensedAccountCount ?? summary.observedDisabledLicensedAccountCount;
    if (typeof licensed === 'number' && typeof disabled === 'number' && disabled > licensed)
        return false;
    if (!rows(value.licenses, row => isRecord(row) &&
        text(row.skuId) &&
        !!row.skuId &&
        text(row.skuPartNumber) &&
        nullableText(row.appliesTo) &&
        optional(row.productName, text) &&
        optional(row.capabilities, microsoft365Capabilities_1.isMicrosoft365ProductCapabilities) &&
        optional(row.usage, usage => usage === null || (0, microsoft365Usage_1.isMicrosoft365LicenseProductUsage)(usage)) &&
        nullableText(row.capabilityStatus) &&
        ['enabledUnits', 'consumedUnits', 'unallocatedUnits', 'warningUnits', 'suspendedUnits'].every(key => nullableCount(row[key])) &&
        optional(row.renewals, renewals => Array.isArray(renewals) &&
            renewals.length <= 32 &&
            renewals.every(renewal => isRecord(renewal) &&
                nullableText(renewal.status) &&
                nullableBoolean(renewal.isTrial) &&
                nullableCount(renewal.totalLicenses) &&
                (renewal.nextLifecycleDateTime === null || date(renewal.nextLifecycleDateTime))))))
        return false;
    if (!rows(value.accounts, isMicrosoft365LicensedAccountRow))
        return false;
    if (!isRecord(value.reports) ||
        !['officeActiveUsers', 'officeAppUsage', 'copilotUsage'].every(name => rows(value.reports[name], row => isRecord(row) &&
            text(row.key) &&
            nullableText(row.userPrincipalName) &&
            nullableText(row.displayName) &&
            nullableText(row.reportRefreshDate) &&
            nullableText(row.lastActivityDate) &&
            isRecord(row.fields) &&
            Object.keys(row.fields).length <= 100 &&
            Object.entries(row.fields).every(([key, field]) => text(key) && text(field)))))
        return false;
    if (value.pricing !== undefined && !isMicrosoft365LicensePricing(value.pricing))
        return false;
    if (value.insights !== undefined && !isMicrosoft365LicenseInsights(value.insights))
        return false;
    if (value.usage !== undefined && !(0, microsoft365Usage_1.isMicrosoft365UsageSummary)(value.usage))
        return false;
    if (value.capabilities !== undefined) {
        if (!(0, microsoft365Capabilities_1.isMicrosoft365CapabilityProjection)(value.capabilities))
            return false;
        const definitions = new Set(value.capabilities.definitions.map(definition => definition.id));
        const licenses = value.licenses;
        const accounts = value.accounts;
        const skuIds = new Set(licenses.map(row => row.skuId));
        const accountIds = new Set(accounts.map(row => row.id));
        if (!licenses.every(row => (row.capabilities?.plans ?? []).every(plan => plan.capabilityId === null || definitions.has(plan.capabilityId)) &&
            (!row.capabilities?.comparison ||
                [...row.capabilities.comparison.addedCapabilityIds, ...row.capabilities.comparison.lostCapabilityIds].every(id => definitions.has(id)))) ||
            !accounts.every(row => !row.capabilities ||
                [
                    row.capabilities.enabledIds,
                    row.capabilities.disabledIds,
                    row.capabilities.unknownIds,
                    row.capabilities.errorIds,
                    row.capabilities.unavailableIds,
                ]
                    .flat()
                    .every(id => definitions.has(id))) ||
            !value.capabilities.notices.every(notice => skuIds.has(notice.skuId) &&
                (notice.accountId === undefined || accountIds.has(notice.accountId)) &&
                (notice.coveredBySkuIds ?? []).every(id => skuIds.has(id))) ||
            !value.capabilities.summary.every(row => (row.includedSkuIds ?? []).every(id => skuIds.has(id))))
            return false;
    }
    if (value.organization !== undefined &&
        (!isRecord(value.organization) || !nullableText(value.organization.displayName) || !nullableText(value.organization.defaultDomain)))
        return false;
    if (value.pricingByCurrency !== undefined) {
        if (!isRecord(value.pricingByCurrency))
            return false;
        const estimates = Object.entries(value.pricingByCurrency);
        if (estimates.length > 16 || !estimates.every(([currency, estimate]) => isMicrosoft365LicensePricing(estimate) && estimate.currency === currency))
            return false;
    }
    return true;
}
/**
 * Adds the per-account list-price fields to one estimate, from the listed accounts and that estimate's product
 * prices. An account's cost is the sum of its priced paid products; any product without a known price (or an
 * unknown assignment list) makes its value partial. Paid account ids need complete inventory evidence.
 */
/** @deprecated Compatibility for older consumers; current valuation lives in @spottoai/platform/calc/licensing. */
function withMicrosoft365AccountPricing(pricing, view) {
    const products = new Map(pricing.products.map(product => [product.skuId, product]));
    // Graph supplies aggregate trial stock, but does not identify which accounts consume paid seats.
    // licenses is additive for older callers; a withheld assigned quantity also prevents false attribution.
    const ambiguousSkuIds = new Set(view.licenses
        ?.filter(license => license.renewals?.some(renewal => renewal.isTrial === true &&
        ['Enabled', 'Warning'].includes(renewal.status ?? '') &&
        (renewal.totalLicenses === null || renewal.totalLicenses > 0)))
        .map(license => license.skuId) ?? []);
    const inventoryKnown = view.coverage.subscribedSkus.state === 'complete' && view.coverage.subscribedSkus.omittedRowCount === 0;
    const accountMonthlyCosts = {};
    const paidAccountIds = [];
    let paidMembershipKnown = true;
    const partialAccountPriceIds = [];
    for (const account of view.accounts) {
        let cost = 0;
        let paid = false;
        let hasKnownPrice = false;
        let partial = account.skuIds === null;
        for (const skuId of account.skuIds ?? []) {
            const product = products.get(skuId);
            if (!product || product.category === 'unpriced')
                partial = true;
            if (product?.category !== 'paid')
                continue;
            if (ambiguousSkuIds.has(skuId) || product.assignedUnits === null) {
                partial = true;
                paidMembershipKnown = false;
                continue;
            }
            paid = true;
            if (product.unitPriceMonthly === null)
                partial = true;
            else {
                cost += product.unitPriceMonthly;
                hasKnownPrice = true;
            }
        }
        if (hasKnownPrice)
            accountMonthlyCosts[account.id] = Math.round(cost * 100) / 100;
        if (paid)
            paidAccountIds.push(account.id);
        if (partial)
            partialAccountPriceIds.push(account.id);
    }
    return {
        ...pricing,
        accountMonthlyCosts,
        paidAccountIds: inventoryKnown && paidMembershipKnown ? paidAccountIds : undefined,
        partialAccountPriceIds,
    };
}
//# sourceMappingURL=microsoft365Licenses.js.map