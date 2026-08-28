"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFinancialChargesV1 = exports.isFinancialChargeInclusionPolicyRefV1 = exports.isFinancialChargeCompositionV1 = exports.createFinancialChargeCompositionIdV1 = exports.canonicalizeFinancialChargeCompositionIdentityV1 = void 0;
const exactDecimal_1 = require("../common/exactDecimal");
const sha256_1 = require("../common/sha256");
const financialChargeComposition_1 = require("./financialChargeComposition");
const financialDataflowValidation_1 = require("./financialDataflowValidation");
const financialScopeBaselineValidation_1 = require("./financialScopeBaselineValidation");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const SOURCES = new Set(['azure-native', 'marketplace', 'unknown']);
const RECURRENCES = new Set(['one-time', 'recurring', 'usage-based', 'unknown']);
const CLASSIFICATIONS = new Set(['usage', 'purchase', 'adjustment', 'tax', 'credit', 'refund', 'residual']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const isSortedUniqueHashes = (value) => Array.isArray(value) && value.length > 0 && value.length <= 20000 && value.every(financialDataflowValidation_1.isFinancialDataflowHashV1) &&
    value.every((entry, index) => index === 0 || value[index - 1] < entry);
const isBucket = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
        'chargeSource',
        'chargeRecurrence',
        'chargeClassification',
        'amount',
        'componentIds',
        'evidenceRefIds',
    ]) &&
    SOURCES.has(value.chargeSource) &&
    RECURRENCES.has(value.chargeRecurrence) &&
    CLASSIFICATIONS.has(value.chargeClassification) &&
    (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.amount, currencyCode: 'AUD' }) &&
    isSortedUniqueHashes(value.componentIds) &&
    isSortedUniqueHashes(value.evidenceRefIds);
const isIdentity = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'schemaVersion',
            'contractVersion',
            'baselineId',
            'ownerScopeId',
            'period',
            'costBasis',
            'estimateLens',
            'accountingCurrencyCode',
            'buckets',
            'reconciliation',
            'algorithmVersion',
        ]) ||
        value.schemaVersion !== financialChargeComposition_1.FINANCIAL_CHARGE_COMPOSITION_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialChargeComposition_1.FINANCIAL_CHARGE_COMPOSITION_CONTRACT_VERSION_V1 ||
        !(0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.baselineId) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.ownerScopeId) ||
        !(0, financialScopeBaselineValidation_1.isFinancialBaselinePeriodV2)(value.period) ||
        !COST_BASES.has(value.costBasis) ||
        !ESTIMATE_LENSES.has(value.estimateLens) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowCurrencyV1)(value.accountingCurrencyCode) ||
        !Array.isArray(value.buckets) ||
        value.buckets.length === 0 ||
        value.buckets.length > 20000 ||
        !value.buckets.every(isBucket) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.algorithmVersion) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value.reconciliation) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value.reconciliation, ['status', 'bucketTotal', 'sourceTotal', 'difference']) ||
        value.reconciliation.status !== 'reconciled' ||
        value.reconciliation.difference !== '0' ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.reconciliation.bucketTotal, currencyCode: value.accountingCurrencyCode }) ||
        !(0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.reconciliation.sourceTotal, currencyCode: value.accountingCurrencyCode }))
        return false;
    const componentIds = value.buckets.flatMap(bucket => bucket.componentIds);
    if (new Set(componentIds).size !== componentIds.length)
        return false;
    const keys = value.buckets.map(bucket => `${bucket.chargeSource}\u0000${bucket.chargeRecurrence}\u0000${bucket.chargeClassification}`);
    if (!keys.every((key, index) => index === 0 || keys[index - 1] < key))
        return false;
    try {
        const bucketTotal = (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(value.buckets.map(bucket => bucket.amount)));
        return bucketTotal === value.reconciliation.bucketTotal && bucketTotal === value.reconciliation.sourceTotal;
    }
    catch {
        return false;
    }
};
const canonicalizeFinancialChargeCompositionIdentityV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowValueWithinLimitsV1)(value) || !isIdentity(value)) {
        throw new TypeError('Invalid FinancialChargeCompositionIdentityPreimageV1.');
    }
    return (0, financialDataflowValidation_1.canonicalizeFinancialDataflowJsonV1)(value);
};
exports.canonicalizeFinancialChargeCompositionIdentityV1 = canonicalizeFinancialChargeCompositionIdentityV1;
const createFinancialChargeCompositionIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialChargeCompositionIdentityV1)(value))}`;
exports.createFinancialChargeCompositionIdV1 = createFinancialChargeCompositionIdV1;
const isFinancialChargeCompositionV1 = (value) => {
    if (!(0, financialDataflowValidation_1.isFinancialDataflowValueWithinLimitsV1)(value) ||
        !(0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) ||
        !(0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, [
            'chargeCompositionId',
            'schemaVersion',
            'contractVersion',
            'baselineId',
            'ownerScopeId',
            'period',
            'costBasis',
            'estimateLens',
            'accountingCurrencyCode',
            'buckets',
            'reconciliation',
            'algorithmVersion',
        ]))
        return false;
    const { chargeCompositionId, ...identity } = value;
    return (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(chargeCompositionId) && isIdentity(identity) &&
        chargeCompositionId === (0, exports.createFinancialChargeCompositionIdV1)(identity);
};
exports.isFinancialChargeCompositionV1 = isFinancialChargeCompositionV1;
const isFinancialChargeInclusionPolicyRefV1 = (value) => (0, financialDataflowValidation_1.isFinancialDataflowRecordV1)(value) &&
    (0, financialDataflowValidation_1.hasFinancialDataflowExactFieldsV1)(value, ['policyId', 'policyDigest']) &&
    (0, financialDataflowValidation_1.isFinancialDataflowIdentityV1)(value.policyId) &&
    (0, financialDataflowValidation_1.isFinancialDataflowHashV1)(value.policyDigest) &&
    (0, financialChargeComposition_1.resolveFinancialChargeInclusionPolicyV1)(value) !== undefined;
exports.isFinancialChargeInclusionPolicyRefV1 = isFinancialChargeInclusionPolicyRefV1;
const sumBuckets = (buckets) => (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(buckets.map(bucket => bucket.amount)));
const sourcesFor = (policy, role) => role === 'include' ? policy.includeSources : role === 'exclude' ? policy.excludeSources : policy.withholdSources;
const selectFinancialChargesV1 = (composition, policyRef) => {
    if (!(0, exports.isFinancialChargeCompositionV1)(composition))
        throw new TypeError('Invalid financial charge composition.');
    const policy = (0, financialChargeComposition_1.resolveFinancialChargeInclusionPolicyV1)(policyRef);
    if (!policy)
        throw new TypeError('Unregistered financial charge-inclusion policy.');
    const partition = (role) => composition.buckets.filter(bucket => sourcesFor(policy, role).includes(bucket.chargeSource));
    const included = partition('include');
    const excluded = partition('exclude');
    const withheld = partition('withhold');
    if (included.length + excluded.length + withheld.length !== composition.buckets.length) {
        throw new TypeError('Financial charge-inclusion policy does not partition every charge source.');
    }
    const includedAmount = sumBuckets(included);
    const excludedAmount = sumBuckets(excluded);
    const withheldAmount = sumBuckets(withheld);
    const forecastEligibleAmount = sumBuckets(included.filter(bucket => bucket.chargeRecurrence === 'recurring' || bucket.chargeRecurrence === 'usage-based'));
    const oneTimeAmount = sumBuckets(included.filter(bucket => bucket.chargeRecurrence === 'one-time'));
    const unknownRecurrenceAmount = sumBuckets(included.filter(bucket => bucket.chargeRecurrence === 'unknown'));
    const reasonCodes = [];
    if (withheldAmount !== '0')
        reasonCodes.push('charge-source-unknown');
    const forecastReasonCodes = [...reasonCodes];
    if (unknownRecurrenceAmount !== '0')
        forecastReasonCodes.push('charge-recurrence-unknown');
    const result = {
        status: withheldAmount === '0' ? 'available' : 'partial',
        includedAmount,
        excludedAmount,
        withheldAmount,
        forecastEligibleAmount,
        oneTimeAmount,
        unknownRecurrenceAmount,
        forecastStatus: withheldAmount === '0' && unknownRecurrenceAmount === '0' ? 'available' : 'partial',
        currencyCode: composition.accountingCurrencyCode,
        ...(reasonCodes.length === 0 ? {} : { reasonCodes: reasonCodes }),
        ...(forecastReasonCodes.length === 0
            ? {}
            : { forecastReasonCodes: forecastReasonCodes }),
    };
    return result;
};
exports.selectFinancialChargesV1 = selectFinancialChargesV1;
//# sourceMappingURL=financialChargeCompositionValidation.js.map