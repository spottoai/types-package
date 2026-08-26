"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFinancialScopeBaselineEnvelopeV2 = exports.canonicalizeFinancialScopeBaselineIdentityV2 = exports.isFinancialBaselinePeriodV2 = exports.isFinancialEvidenceBundleV1 = exports.canonicalizeFinancialEvidenceBundleIdentityV1 = exports.isFinancialEvidenceBundleIdentityPreimageV1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const sha256_1 = require("../common/sha256");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const financialScopeEvidence_1 = require("./financialScopeEvidence");
const financialScopeBaseline_1 = require("./financialScopeBaseline");
const financialScopeBaselineIdentity_1 = require("./financialScopeBaselineIdentity");
const MAX_EVIDENCE_REFERENCES = 64;
const MAX_SOURCE_KIND_LENGTH = 128;
const MAX_IDENTITY_LENGTH = 256;
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EVIDENCE_ROLES = new Set([
    'billing',
    'billing-currency-declaration',
    'estimate',
    'inventory-configuration',
    'retail-rate',
    'commitment-quote',
    'fx-conversion',
    'eligibility-rule',
    'recommendation-scenario-set',
    'recommendation-lifecycle',
]);
const INTRINSIC_TIME_KINDS = new Set(['observed-at', 'published-at', 'quoted-at']);
const DATE_BASES = new Set(['utc', 'billing-calendar', 'company-local']);
const SCOPE_KINDS = new Set([
    'canonical-resource-owner',
    'composite-resource',
    'commitment-instrument',
    'subscription-residual',
    'subscription-aggregate',
    'portfolio-currency-group',
]);
const OWNER_SCOPE_KINDS = new Set(['canonical-resource-owner', 'composite-resource', 'commitment-instrument', 'subscription-residual']);
const AGGREGATE_SCOPE_KINDS = new Set(['subscription-aggregate', 'portfolio-currency-group']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const WINDOW_KINDS = new Set(['rolling-30-days', 'calendar-month', 'provider-billing-period', 'stable-billing-window', 'daily']);
const SETTLEMENT_STATES = new Set(['settled', 'unsettled', 'mixed', 'unknown']);
const CHARGE_CLASSIFICATIONS = new Set(['usage', 'purchase', 'adjustment', 'tax', 'credit', 'refund', 'residual']);
const UNAVAILABLE_REASONS = new Set(financialScopeBaseline_1.FINANCIAL_SCOPE_BASELINE_UNAVAILABLE_REASONS_V2);
const CURRENCY = /^[A-Z]{3}$/;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
const isBoundedIdentity = (value) => typeof value === 'string' && value.length > 0 && value.length <= MAX_IDENTITY_LENGTH && value.trim() === value;
const isIsoInstant = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))
        return false;
    return Number.isFinite(Date.parse(value));
};
const isCalendarDate = (value) => {
    if (typeof value !== 'string' || !DATE.test(value))
        return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const isInterval = (value) => isRecord(value) &&
    hasExactFields(value, ['startDate', 'endDateExclusive', 'dateBasis'], ['timeZone']) &&
    isCalendarDate(value.startDate) &&
    isCalendarDate(value.endDateExclusive) &&
    value.startDate < value.endDateExclusive &&
    typeof value.dateBasis === 'string' &&
    DATE_BASES.has(value.dateBasis) &&
    (value.timeZone === undefined || isBoundedIdentity(value.timeZone));
const isEvidenceReference = (value) => {
    if (!isRecord(value) ||
        !hasExactFields(value, ['evidenceRefId', 'role', 'sourceKind', 'digestAlgorithm', 'evidenceDigest', 'intrinsicTime'], ['generationId', 'revisionId', 'effectivePeriod']) ||
        typeof value.evidenceRefId !== 'string' ||
        !SHA256_ID.test(value.evidenceRefId) ||
        typeof value.role !== 'string' ||
        !EVIDENCE_ROLES.has(value.role) ||
        typeof value.sourceKind !== 'string' ||
        value.sourceKind.length === 0 ||
        value.sourceKind.length > MAX_SOURCE_KIND_LENGTH ||
        value.sourceKind.trim() !== value.sourceKind ||
        value.digestAlgorithm !== 'sha256' ||
        typeof value.evidenceDigest !== 'string' ||
        !SHA256_ID.test(value.evidenceDigest) ||
        !isRecord(value.intrinsicTime) ||
        !hasExactFields(value.intrinsicTime, ['kind', 'at']) ||
        typeof value.intrinsicTime.kind !== 'string' ||
        !INTRINSIC_TIME_KINDS.has(value.intrinsicTime.kind) ||
        !isIsoInstant(value.intrinsicTime.at) ||
        (value.effectivePeriod !== undefined && !isInterval(value.effectivePeriod))) {
        return false;
    }
    const hasGeneration = value.generationId !== undefined;
    const hasRevision = value.revisionId !== undefined;
    return (hasGeneration !== hasRevision &&
        (value.generationId === undefined || isBoundedIdentity(value.generationId)) &&
        (value.revisionId === undefined || isBoundedIdentity(value.revisionId)));
};
const isFinancialEvidenceBundleIdentityPreimageV1 = (value) => isRecord(value) &&
    hasExactFields(value, ['schemaVersion', 'contractVersion', 'references']) &&
    value.schemaVersion === 1 &&
    value.contractVersion === financialScopeEvidence_1.FINANCIAL_EVIDENCE_BUNDLE_CONTRACT_VERSION_V1 &&
    Array.isArray(value.references) &&
    value.references.length > 0 &&
    value.references.length <= MAX_EVIDENCE_REFERENCES &&
    value.references.every(isEvidenceReference) &&
    new Set(value.references.map(reference => reference.evidenceRefId)).size === value.references.length;
exports.isFinancialEvidenceBundleIdentityPreimageV1 = isFinancialEvidenceBundleIdentityPreimageV1;
const canonicalizeFinancialEvidenceBundleIdentityV1 = (value) => {
    if (!(0, exports.isFinancialEvidenceBundleIdentityPreimageV1)(value)) {
        throw new TypeError('Invalid FinancialEvidenceBundleIdentityPreimageV1.');
    }
    return (0, financialScopeBaselineIdentity_1.canonicalizeValidatedFinancialEvidenceBundleIdentityV1)(value);
};
exports.canonicalizeFinancialEvidenceBundleIdentityV1 = canonicalizeFinancialEvidenceBundleIdentityV1;
const isFinancialEvidenceBundleV1 = (value) => {
    if (!isRecord(value) || !hasExactFields(value, ['schemaVersion', 'contractVersion', 'bundleId', 'references']))
        return false;
    const { bundleId, ...identity } = value;
    return (typeof bundleId === 'string' &&
        SHA256_ID.test(bundleId) &&
        (0, exports.isFinancialEvidenceBundleIdentityPreimageV1)(identity) &&
        bundleId === `sha256:${(0, sha256_1.sha256Utf8)((0, financialScopeBaselineIdentity_1.canonicalizeValidatedFinancialEvidenceBundleIdentityV1)(identity))}`);
};
exports.isFinancialEvidenceBundleV1 = isFinancialEvidenceBundleV1;
const isHashArray = (value, allowEmpty = false) => Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.length <= 20000 &&
    value.every(item => typeof item === 'string' && SHA256_ID.test(item)) &&
    new Set(value).size === value.length;
const isCoverage = (value) => isRecord(value) &&
    hasExactFields(value, ['coverageId', 'interval', 'settlementState', 'evidenceRefIds']) &&
    typeof value.coverageId === 'string' &&
    SHA256_ID.test(value.coverageId) &&
    isInterval(value.interval) &&
    typeof value.settlementState === 'string' &&
    SETTLEMENT_STATES.has(value.settlementState) &&
    isHashArray(value.evidenceRefIds);
const isFinancialBaselinePeriodV2 = (value) => {
    if (!isRecord(value) ||
        !hasExactFields(value, ['windowKind', 'requested', 'coverage', 'gaps'], ['observed', 'providerBillingPeriodId']) ||
        typeof value.windowKind !== 'string' ||
        !WINDOW_KINDS.has(value.windowKind) ||
        !isInterval(value.requested) ||
        (value.observed !== undefined && !isInterval(value.observed)) ||
        (value.providerBillingPeriodId !== undefined && !isBoundedIdentity(value.providerBillingPeriodId)) ||
        !Array.isArray(value.coverage) ||
        value.coverage.length > 20000 ||
        !value.coverage.every(isCoverage) ||
        new Set(value.coverage.map(item => item.coverageId)).size !== value.coverage.length ||
        !Array.isArray(value.gaps) ||
        value.gaps.length > 20000 ||
        !value.gaps.every(isInterval)) {
        return false;
    }
    const requested = value.requested;
    const sameCalendar = (interval, reference) => interval.dateBasis === reference.dateBasis && interval.timeZone === reference.timeZone;
    const requestedDays = (Date.parse(`${requested.endDateExclusive}T00:00:00.000Z`) - Date.parse(`${requested.startDate}T00:00:00.000Z`)) / 86400000;
    if (value.windowKind === 'daily' && requestedDays !== 1)
        return false;
    if (value.windowKind === 'rolling-30-days' && requestedDays !== 30)
        return false;
    if (value.windowKind === 'calendar-month') {
        const start = new Date(`${requested.startDate}T00:00:00.000Z`);
        const nextMonthStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
        if (!requested.startDate.endsWith('-01') || requested.endDateExclusive !== nextMonthStart)
            return false;
    }
    if ((value.windowKind === 'provider-billing-period') !== (value.providerBillingPeriodId !== undefined))
        return false;
    if (!value.gaps.every(gap => gap.startDate >= requested.startDate && gap.endDateExclusive <= requested.endDateExclusive && sameCalendar(gap, requested))) {
        return false;
    }
    if (value.observed === undefined)
        return value.coverage.length === 0;
    const observed = value.observed;
    if (observed.startDate < requested.startDate ||
        observed.endDateExclusive > requested.endDateExclusive ||
        !sameCalendar(observed, requested) ||
        !value.coverage.every(item => item.interval.startDate >= observed.startDate &&
            item.interval.endDateExclusive <= observed.endDateExclusive &&
            sameCalendar(item.interval, observed))) {
        return false;
    }
    const coversInterval = (startDate, endDateExclusive, intervals) => {
        const sorted = [...intervals].sort((left, right) => `${left.startDate}\u0000${left.endDateExclusive}`.localeCompare(`${right.startDate}\u0000${right.endDateExclusive}`));
        let cursor = startDate;
        for (const interval of sorted) {
            if (interval.startDate > cursor)
                return false;
            if (interval.endDateExclusive > cursor)
                cursor = interval.endDateExclusive;
        }
        return cursor === endDateExclusive;
    };
    const coverageIntervals = value.coverage.map(item => item.interval);
    return (coversInterval(observed.startDate, observed.endDateExclusive, coverageIntervals) ||
        coversInterval(requested.startDate, requested.endDateExclusive, [...coverageIntervals, ...value.gaps]));
};
exports.isFinancialBaselinePeriodV2 = isFinancialBaselinePeriodV2;
const isCommonBaseline = (value) => value.schemaVersion === financialScopeBaseline_1.FINANCIAL_SCOPE_BASELINE_SCHEMA_VERSION_V2 &&
    value.contractVersion === financialScopeBaseline_1.FINANCIAL_SCOPE_BASELINE_CONTRACT_VERSION_V2 &&
    value.provider === 'azure' &&
    Array.isArray(value.providerAccountRefs) &&
    value.providerAccountRefs.length > 0 &&
    value.providerAccountRefs.length <= MAX_EVIDENCE_REFERENCES &&
    value.providerAccountRefs.every(isBoundedIdentity) &&
    new Set(value.providerAccountRefs).size === value.providerAccountRefs.length &&
    typeof value.scopeKind === 'string' &&
    SCOPE_KINDS.has(value.scopeKind) &&
    isBoundedIdentity(value.scopeId) &&
    (0, exports.isFinancialBaselinePeriodV2)(value.period) &&
    typeof value.costBasis === 'string' &&
    COST_BASES.has(value.costBasis) &&
    typeof value.estimateLens === 'string' &&
    ESTIMATE_LENSES.has(value.estimateLens) &&
    (value.requestedCurrencyCode === undefined || (typeof value.requestedCurrencyCode === 'string' && CURRENCY.test(value.requestedCurrencyCode))) &&
    typeof value.assessmentId === 'string' &&
    SHA256_ID.test(value.assessmentId);
const isComponent = (value, scopeId, coverageIds, accountingCurrencyCode) => {
    if (!isRecord(value) ||
        !hasExactFields(value, ['componentId', 'billableIdentity', 'ownerScopeId', 'chargeClassification', 'amount', 'evidenceRefIds', 'coverageIds'], ['quantity', 'effectiveRate']) ||
        typeof value.componentId !== 'string' ||
        !SHA256_ID.test(value.componentId) ||
        !isBoundedIdentity(value.billableIdentity) ||
        value.ownerScopeId !== scopeId ||
        typeof value.chargeClassification !== 'string' ||
        !CHARGE_CLASSIFICATIONS.has(value.chargeClassification) ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.amount, currencyCode: 'AUD' }) ||
        !isHashArray(value.evidenceRefIds) ||
        !isHashArray(value.coverageIds) ||
        !value.coverageIds.every(id => coverageIds.has(id))) {
        return false;
    }
    const isQuantity = value.quantity === undefined ||
        (isRecord(value.quantity) &&
            hasExactFields(value.quantity, ['amount', 'unit']) &&
            (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.quantity.amount, currencyCode: 'AUD' }) &&
            isBoundedIdentity(value.quantity.unit));
    const isRate = (() => {
        if (value.effectiveRate === undefined)
            return true;
        if (!isRecord(value.quantity) ||
            !isRecord(value.effectiveRate) ||
            !hasExactFields(value.effectiveRate, ['amount', 'unit', 'currencyCode']) ||
            value.effectiveRate.currencyCode !== accountingCurrencyCode ||
            !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.effectiveRate.amount, currencyCode: accountingCurrencyCode }) ||
            value.effectiveRate.unit !== value.quantity.unit) {
            return false;
        }
        const quantity = (0, exactDecimal_1.parseCanonicalDecimal)(String(value.quantity.amount));
        const rate = (0, exactDecimal_1.parseCanonicalDecimal)(String(value.effectiveRate.amount));
        return (value.chargeClassification === 'usage' &&
            quantity.coefficient > 0n &&
            rate.coefficient >= 0n &&
            (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.multiplyExactDecimalValues)(quantity, rate)) === value.amount);
    })();
    return isQuantity && isRate;
};
const isIdentityPreimage = (value) => {
    if (!isRecord(value) || !isCommonBaseline(value))
        return false;
    const commonRequired = [
        'schemaVersion',
        'contractVersion',
        'provider',
        'providerAccountRefs',
        'scopeKind',
        'scopeId',
        'period',
        'costBasis',
        'estimateLens',
        'assessmentId',
        'baselineKind',
    ];
    const commonOptional = ['requestedCurrencyCode'];
    const period = value.period;
    if (period.observed === undefined || period.coverage.length === 0)
        return false;
    if (value.baselineKind === 'owner') {
        if (!OWNER_SCOPE_KINDS.has(String(value.scopeKind)) ||
            !hasExactFields(value, [...commonRequired, 'evidenceBundleId', 'accountingCurrency', 'chargeInclusionPolicyRef', 'components'], commonOptional) ||
            typeof value.evidenceBundleId !== 'string' ||
            !SHA256_ID.test(value.evidenceBundleId) ||
            !isRecord(value.accountingCurrency) ||
            !hasExactFields(value.accountingCurrency, ['currencyCode', 'sourceCurrencyCode', 'evidenceRefIds'], ['fxEvidenceRefId']) ||
            typeof value.accountingCurrency.currencyCode !== 'string' ||
            !CURRENCY.test(value.accountingCurrency.currencyCode) ||
            typeof value.accountingCurrency.sourceCurrencyCode !== 'string' ||
            !CURRENCY.test(value.accountingCurrency.sourceCurrencyCode) ||
            !isHashArray(value.accountingCurrency.evidenceRefIds) ||
            (value.accountingCurrency.fxEvidenceRefId !== undefined &&
                (typeof value.accountingCurrency.fxEvidenceRefId !== 'string' || !SHA256_ID.test(value.accountingCurrency.fxEvidenceRefId))) ||
            (value.accountingCurrency.currencyCode !== value.accountingCurrency.sourceCurrencyCode &&
                value.accountingCurrency.fxEvidenceRefId === undefined) ||
            (value.requestedCurrencyCode !== undefined && value.requestedCurrencyCode !== value.accountingCurrency.currencyCode) ||
            !isRecord(value.chargeInclusionPolicyRef) ||
            !hasExactFields(value.chargeInclusionPolicyRef, ['policyId', 'policyDigest']) ||
            !isBoundedIdentity(value.chargeInclusionPolicyRef.policyId) ||
            typeof value.chargeInclusionPolicyRef.policyDigest !== 'string' ||
            !SHA256_ID.test(value.chargeInclusionPolicyRef.policyDigest) ||
            !Array.isArray(value.components) ||
            value.components.length === 0 ||
            value.components.length > 20000) {
            return false;
        }
        const coverageIds = new Set(value.period.coverage.map(item => item.coverageId));
        return (value.components.every(component => isComponent(component, String(value.scopeId), coverageIds, String(value.accountingCurrency.currencyCode))) && new Set(value.components.map(component => component.componentId)).size === value.components.length);
    }
    return (value.baselineKind === 'aggregate' &&
        AGGREGATE_SCOPE_KINDS.has(String(value.scopeKind)) &&
        hasExactFields(value, [...commonRequired, 'accountingCurrencyCode', 'memberBaselineIds', 'compatibility'], commonOptional) &&
        typeof value.accountingCurrencyCode === 'string' &&
        CURRENCY.test(value.accountingCurrencyCode) &&
        (value.requestedCurrencyCode === undefined || value.requestedCurrencyCode === value.accountingCurrencyCode) &&
        isHashArray(value.memberBaselineIds) &&
        isRecord(value.compatibility) &&
        hasExactFields(value.compatibility, ['period', 'costBasis', 'estimateLens', 'accountingCurrency', 'membership']) &&
        value.compatibility.period === 'compatible' &&
        value.compatibility.costBasis === 'compatible' &&
        value.compatibility.estimateLens === 'compatible' &&
        value.compatibility.accountingCurrency === 'compatible' &&
        value.compatibility.membership === 'non-overlapping');
};
const canonicalizeFinancialScopeBaselineIdentityV2 = (value) => {
    if (!isIdentityPreimage(value))
        throw new TypeError('Invalid FinancialScopeBaselineIdentityPreimageV2.');
    return (0, financialScopeBaselineIdentity_1.canonicalizeValidatedFinancialScopeBaselineIdentityV2)(value);
};
exports.canonicalizeFinancialScopeBaselineIdentityV2 = canonicalizeFinancialScopeBaselineIdentityV2;
const exactSum = (values) => (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(values));
const isAvailableOwner = (value) => {
    if (!hasExactFields(value, [
        'schemaVersion',
        'contractVersion',
        'provider',
        'providerAccountRefs',
        'scopeKind',
        'scopeId',
        'period',
        'costBasis',
        'estimateLens',
        'assessmentId',
        'status',
        'baselineKind',
        'baselineId',
        'evidenceBundleId',
        'accountingCurrency',
        'chargeInclusionPolicyRef',
        'components',
        'total',
        'reconciliation',
    ], ['requestedCurrencyCode']) ||
        value.status !== 'available' ||
        value.baselineKind !== 'owner' ||
        typeof value.baselineId !== 'string' ||
        !SHA256_ID.test(value.baselineId) ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)(value.total) ||
        !isRecord(value.accountingCurrency) ||
        value.total.currencyCode !== value.accountingCurrency.currencyCode ||
        !isRecord(value.reconciliation) ||
        !hasExactFields(value.reconciliation, ['status', 'componentTotal', 'sourceTotal', 'withheldTotal', 'residualTotal', 'difference']) ||
        value.reconciliation.status !== 'reconciled' ||
        value.reconciliation.difference !== '0') {
        return false;
    }
    const { status: _status, baselineId: _baselineId, total: _total, reconciliation: _reconciliation, ...identity } = value;
    if (!isIdentityPreimage(identity))
        return false;
    const total = value.total;
    const reconciliation = value.reconciliation;
    const componentTotal = exactSum(value.components.map(component => component.amount));
    if (componentTotal !== total.amount ||
        componentTotal !== reconciliation.componentTotal ||
        ![reconciliation.sourceTotal, reconciliation.withheldTotal, reconciliation.residualTotal].every(amount => (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount, currencyCode: total.currencyCode })) ||
        exactSum([componentTotal, reconciliation.withheldTotal, reconciliation.residualTotal]) !== reconciliation.sourceTotal) {
        return false;
    }
    return value.baselineId === `sha256:${(0, sha256_1.sha256Utf8)((0, financialScopeBaselineIdentity_1.canonicalizeValidatedFinancialScopeBaselineIdentityV2)(identity))}`;
};
const isAvailableAggregate = (value) => {
    if (!hasExactFields(value, [
        'schemaVersion',
        'contractVersion',
        'provider',
        'providerAccountRefs',
        'scopeKind',
        'scopeId',
        'period',
        'costBasis',
        'estimateLens',
        'assessmentId',
        'status',
        'baselineKind',
        'baselineId',
        'accountingCurrencyCode',
        'memberBaselineIds',
        'compatibility',
        'total',
        'reconciliation',
    ], ['requestedCurrencyCode']) ||
        value.status !== 'available' ||
        value.baselineKind !== 'aggregate' ||
        typeof value.baselineId !== 'string' ||
        !SHA256_ID.test(value.baselineId) ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)(value.total) ||
        value.total.currencyCode !== value.accountingCurrencyCode ||
        !isRecord(value.reconciliation) ||
        !hasExactFields(value.reconciliation, ['status', 'memberTotal', 'residualTotal', 'difference']) ||
        value.reconciliation.status !== 'reconciled' ||
        value.reconciliation.difference !== '0' ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.reconciliation.memberTotal, currencyCode: value.total.currencyCode }) ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.reconciliation.residualTotal, currencyCode: value.total.currencyCode })) {
        return false;
    }
    const total = value.total;
    const reconciliation = value.reconciliation;
    if (exactSum([reconciliation.memberTotal, reconciliation.residualTotal]) !== total.amount)
        return false;
    const { status: _status, baselineId: _baselineId, total: _total, reconciliation: _reconciliation, ...identity } = value;
    return isIdentityPreimage(identity) && value.baselineId === `sha256:${(0, sha256_1.sha256Utf8)((0, financialScopeBaselineIdentity_1.canonicalizeValidatedFinancialScopeBaselineIdentityV2)(identity))}`;
};
const isUnavailable = (value) => hasExactFields(value, [
    'schemaVersion',
    'contractVersion',
    'provider',
    'providerAccountRefs',
    'scopeKind',
    'scopeId',
    'period',
    'costBasis',
    'estimateLens',
    'assessmentId',
    'status',
    'unavailableReason',
    'summary',
], ['requestedCurrencyCode']) &&
    value.status === 'unavailable' &&
    typeof value.unavailableReason === 'string' &&
    UNAVAILABLE_REASONS.has(value.unavailableReason) &&
    isRecord(value.summary) &&
    hasExactFields(value.summary, ['requestedRoleCount', 'producedRoleCount', 'matchedRoleCount']) &&
    [value.summary.requestedRoleCount, value.summary.producedRoleCount, value.summary.matchedRoleCount].every(count => Number.isSafeInteger(count) && Number(count) >= 0) &&
    Number(value.summary.matchedRoleCount) <= Number(value.summary.producedRoleCount) &&
    Number(value.summary.producedRoleCount) <= Number(value.summary.requestedRoleCount);
const isFinancialScopeBaselineEnvelopeV2 = (value) => isRecord(value) && isCommonBaseline(value) && (isAvailableOwner(value) || isAvailableAggregate(value) || isUnavailable(value));
exports.isFinancialScopeBaselineEnvelopeV2 = isFinancialScopeBaselineEnvelopeV2;
//# sourceMappingURL=financialScopeBaselineValidation.js.map