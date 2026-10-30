"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNativeDiscountProjectionHeader = exports.formatNativeDiscountProjectionHeader = exports.isNativeDiscountProjectionV1 = exports.NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS = exports.NATIVE_DISCOUNT_PROJECTION_HEADER = exports.NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1 = exports.applyNativeDiscountToNativeAmount = exports.toNativeDiscountMinorUnits = exports.projectFinancialChargeSpendBasisMinorUnits = exports.projectDecompositionTreeSourceBasisMinorUnits = exports.projectNativeDiscountSourceMinorUnits = exports.isAzureNativeSpendFullyDiscountEligible = exports.isAzureNativeDiscountEligible = exports.applyNativeDiscountMinorUnits = exports.toNativeDiscountBasisPoints = exports.isValidNativeDiscountPercent = exports.NATIVE_DISCOUNT_BASIS_POINTS_SCALE = exports.NATIVE_DISCOUNT_MAX_PERCENT = void 0;
const financialChargePolicy_js_1 = require("./financialChargePolicy.js");
/**
 * Configured native discount (subscription `nativeDiscountPercent`), applied on read.
 *
 * "Native" means the cloud provider's own charges (for Azure, the `azure-native`
 * financial charge source). Marketplace and unknown-source amounts are never
 * discounted. These functions are the single implementation of the arithmetic, so
 * the API read projection and any evaluation path (cost alerts, budgets,
 * notifications) produce identical numbers. They never mutate stored artifacts.
 */
exports.NATIVE_DISCOUNT_MAX_PERCENT = 100;
exports.NATIVE_DISCOUNT_BASIS_POINTS_SCALE = 10000;
const MAX_MINOR_UNIT_SCALE = 6;
/** True for a finite percentage from 0 to 100 inclusive with at most two decimals. */
const isValidNativeDiscountPercent = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value))
        return false;
    if (value < 0 || value > exports.NATIVE_DISCOUNT_MAX_PERCENT)
        return false;
    const hundredths = value * 100;
    return Math.abs(hundredths - Math.round(hundredths)) < 1e-9;
};
exports.isValidNativeDiscountPercent = isValidNativeDiscountPercent;
/**
 * Converts a configured percentage to integer basis points (5.25 -> 525).
 * Returns undefined when the value is absent or invalid; callers then apply no discount.
 */
const toNativeDiscountBasisPoints = (percent) => (0, exports.isValidNativeDiscountPercent)(percent) ? Math.round(percent * 100) : undefined;
exports.toNativeDiscountBasisPoints = toNativeDiscountBasisPoints;
const isValidBasisPoints = (basisPoints) => Number.isSafeInteger(basisPoints) && basisPoints >= 0 && basisPoints <= exports.NATIVE_DISCOUNT_BASIS_POINTS_SCALE;
/**
 * Applies the discount to a signed native amount in integer minor units, rounding half away
 * from zero once. Credits and refunds receive the same factor. Returns undefined for invalid input.
 */
const applyNativeDiscountMinorUnits = (nativeMinorUnits, basisPoints) => {
    if (!Number.isSafeInteger(nativeMinorUnits) || !isValidBasisPoints(basisPoints))
        return undefined;
    const scale = BigInt(exports.NATIVE_DISCOUNT_BASIS_POINTS_SCALE);
    const product = BigInt(nativeMinorUnits) * (scale - BigInt(basisPoints));
    const negative = product < 0n;
    const magnitude = negative ? -product : product;
    const rounded = (magnitude + scale / 2n) / scale;
    const result = Number(negative ? -rounded : rounded);
    return Object.is(result, -0) ? 0 : result;
};
exports.applyNativeDiscountMinorUnits = applyNativeDiscountMinorUnits;
/** Provider-native rows without pricing-model evidence retain legacy eligibility. Source proof is supplied by the caller. */
const isAzureNativeDiscountEligible = (source, pricingModel) => {
    if (source !== 'azure-native')
        return false;
    const model = typeof pricingModel === 'string' ? pricingModel.trim().toLowerCase() : '';
    return model !== 'reservation' && model !== 'savingsplan';
};
exports.isAzureNativeDiscountEligible = isAzureNativeDiscountEligible;
/** Uniform-rate borrowing needs gross membership proof; legacy records retain their original rule. */
const isAzureNativeSpendFullyDiscountEligible = (breakdown) => {
    if (!breakdown || (breakdown.azureNativeDiscountEligible === undefined && breakdown.azureNativeDiscountEligibility === undefined))
        return true;
    if (!(0, financialChargePolicy_js_1.isAzureFinancialChargeSpendBreakdownV1)(breakdown) || breakdown.azureNativeDiscountEligibility !== 'all-eligible')
        return false;
    return ['billed', 'amortized'].every(basis => {
        const native = breakdown.azureNative[basis];
        const eligible = breakdown.azureNativeDiscountEligible?.[basis];
        return eligible?.status !== 'available' || (native.status === 'available' && eligible.totalMinorUnits === native.totalMinorUnits);
    });
};
exports.isAzureNativeSpendFullyDiscountEligible = isAzureNativeSpendFullyDiscountEligible;
/** Display amount: unchanged excluded native, Marketplace and unknown amounts plus discounted eligible native. */
const projectNativeDiscountSourceMinorUnits = (source, basisPoints) => {
    const eligible = source.nativeDiscountEligibleMinorUnits === undefined ? source.nativeMinorUnits : source.nativeDiscountEligibleMinorUnits;
    const adjustedEligible = (0, exports.applyNativeDiscountMinorUnits)(eligible, basisPoints);
    if (adjustedEligible === undefined ||
        !Number.isSafeInteger(source.nativeMinorUnits) ||
        !Number.isSafeInteger(source.marketplaceMinorUnits) ||
        !Number.isSafeInteger(source.unknownMinorUnits)) {
        return undefined;
    }
    // Eligible can be negative or exceed signed native net when excluded charges include refunds.
    const total = Number(BigInt(source.nativeMinorUnits) -
        BigInt(eligible) +
        BigInt(adjustedEligible) +
        BigInt(source.marketplaceMinorUnits) +
        BigInt(source.unknownMinorUnits));
    return Number.isSafeInteger(total) ? total : undefined;
};
exports.projectNativeDiscountSourceMinorUnits = projectNativeDiscountSourceMinorUnits;
/**
 * Projects one Cost Tree source basis (tree total or node). Returns undefined when material
 * unknown-source charges exist (`status: partial`): an exact discounted value is then unavailable.
 */
const projectDecompositionTreeSourceBasisMinorUnits = (basis, basisPoints) => {
    if (!basis || basis.status !== 'complete')
        return undefined;
    if ((basis.azureNativeDiscountEligibleMinorUnits !== undefined || basis.azureNativeDiscountEligibility !== undefined) &&
        !(0, financialChargePolicy_js_1.isDecompositionTreeNodeFinancialChargeSourceCostsV1)({ current: { billed: basis } }))
        return undefined;
    return (0, exports.projectNativeDiscountSourceMinorUnits)({
        nativeMinorUnits: basis.azureNativeMinorUnits,
        nativeDiscountEligibleMinorUnits: basis.azureNativeDiscountEligibleMinorUnits,
        marketplaceMinorUnits: basis.marketplaceMinorUnits,
        unknownMinorUnits: basis.unknownMinorUnits,
    }, basisPoints);
};
exports.projectDecompositionTreeSourceBasisMinorUnits = projectDecompositionTreeSourceBasisMinorUnits;
/**
 * Projects the billed or amortized total of a rolling spend breakdown (subscription or resource).
 * Returns undefined when the basis is unavailable or material unknown-source charges exist.
 */
const projectFinancialChargeSpendBasisMinorUnits = (breakdown, basis, basisPoints) => {
    if (!breakdown || breakdown.status !== 'complete')
        return undefined;
    if ((breakdown.azureNativeDiscountEligible !== undefined || breakdown.azureNativeDiscountEligibility !== undefined) &&
        !(0, financialChargePolicy_js_1.isAzureFinancialChargeSpendBreakdownV1)(breakdown))
        return undefined;
    const native = breakdown.azureNative[basis];
    const marketplace = breakdown.marketplace[basis];
    const unknown = breakdown.unknown[basis];
    if (native.status !== 'available' || marketplace.status !== 'available' || unknown.status !== 'available')
        return undefined;
    const eligible = breakdown.azureNativeDiscountEligible?.[basis];
    return (0, exports.projectNativeDiscountSourceMinorUnits)({
        nativeMinorUnits: native.totalMinorUnits,
        ...(eligible?.status === 'available' ? { nativeDiscountEligibleMinorUnits: eligible.totalMinorUnits } : {}),
        marketplaceMinorUnits: marketplace.totalMinorUnits,
        unknownMinorUnits: unknown.totalMinorUnits,
    }, basisPoints);
};
exports.projectFinancialChargeSpendBasisMinorUnits = projectFinancialChargeSpendBasisMinorUnits;
/** Converts a decimal amount to integer minor units using its exact decimal text, half away from zero. */
const toNativeDiscountMinorUnits = (amount, minorUnitScale = 2) => {
    if (!Number.isFinite(amount) || !Number.isSafeInteger(minorUnitScale) || minorUnitScale < 0 || minorUnitScale > MAX_MINOR_UNIT_SCALE) {
        return undefined;
    }
    const negative = amount < 0;
    const [coefficientText = '0', exponentText] = Math.abs(amount).toString().toLowerCase().split('e');
    const exponent = Number(exponentText ?? '0');
    const [integerPart = '0', fractionPart = ''] = coefficientText.split('.');
    const digits = BigInt(`${integerPart}${fractionPart}` || '0');
    // value = digits * 10^(exponent - fractionPart.length); scaled = value * 10^minorUnitScale
    const shift = exponent - fractionPart.length + minorUnitScale;
    let scaled;
    if (shift >= 0) {
        scaled = digits * 10n ** BigInt(shift);
    }
    else {
        const divisor = 10n ** BigInt(-shift);
        scaled = (digits + divisor / 2n) / divisor;
    }
    const result = Number(negative ? -scaled : scaled);
    if (!Number.isSafeInteger(result))
        return undefined;
    return Object.is(result, -0) ? 0 : result;
};
exports.toNativeDiscountMinorUnits = toNativeDiscountMinorUnits;
/**
 * Applies the discount to a decimal amount known to be entirely native (for example Azure-native
 * eligible recommendation savings or licensing figures). Eligibility is proved by callers; a native
 * financial source alone does not prove Reservation/SavingsPlan amounts eligible.
 */
const applyNativeDiscountToNativeAmount = (amount, basisPoints, minorUnitScale = 2) => {
    const minorUnits = (0, exports.toNativeDiscountMinorUnits)(amount, minorUnitScale);
    if (minorUnits === undefined)
        return undefined;
    const adjusted = (0, exports.applyNativeDiscountMinorUnits)(minorUnits, basisPoints);
    return adjusted === undefined ? undefined : adjusted / 10 ** minorUnitScale;
};
exports.applyNativeDiscountToNativeAmount = applyNativeDiscountToNativeAmount;
/** Response metadata contract identity for API read projections of the configured native discount. */
exports.NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1 = 'native-discount-projection/v1';
/** Response header carrying the projection metadata for streamed and batched reads. */
exports.NATIVE_DISCOUNT_PROJECTION_HEADER = 'X-Spotto-Native-Discount';
/** Maximum number of nulled JSON paths listed in one metadata object. */
exports.NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS = 200;
const PROJECTION_STATUSES = new Set(['none', 'applied', 'partial', 'unavailable']);
const PROJECTION_REASONS = new Set(['owner-unresolved', 'invalid-setting', 'source-split-missing', 'unknown-source']);
const PROJECTION_FIELDS = new Set(['contractVersion', 'status', 'basisPoints', 'reason', 'unavailablePaths', 'unavailablePathsTruncated']);
const isJsonPointer = (value) => typeof value === 'string' && (value === '' || (value.startsWith('/') && !/~[^01]/u.test(value) && !value.endsWith('~')));
/** Exact validator for `NativeDiscountProjectionV1`, including status-specific field rules. */
const isNativeDiscountProjectionV1 = (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const record = value;
    if (!Object.keys(record).every(key => PROJECTION_FIELDS.has(key)))
        return false;
    if (record.contractVersion !== exports.NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1)
        return false;
    if (typeof record.status !== 'string' || !PROJECTION_STATUSES.has(record.status))
        return false;
    if (record.reason !== undefined && (typeof record.reason !== 'string' || !PROJECTION_REASONS.has(record.reason)))
        return false;
    const hasBasisPoints = record.basisPoints !== undefined;
    if (hasBasisPoints && !(typeof record.basisPoints === 'number' && isValidBasisPoints(record.basisPoints)))
        return false;
    const paths = record.unavailablePaths;
    if (paths !== undefined) {
        if (!Array.isArray(paths) || paths.length === 0 || paths.length > exports.NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS)
            return false;
        if (!paths.every(isJsonPointer) || new Set(paths).size !== paths.length)
            return false;
    }
    if (record.unavailablePathsTruncated !== undefined) {
        if (record.unavailablePathsTruncated !== true)
            return false;
        if (paths === undefined || paths.length !== exports.NATIVE_DISCOUNT_PROJECTION_MAX_UNAVAILABLE_PATHS)
            return false;
    }
    switch (record.status) {
        case 'none':
            return !hasBasisPoints && record.reason === undefined && paths === undefined;
        case 'applied':
            return hasBasisPoints && record.reason === undefined && paths === undefined;
        case 'partial':
            return hasBasisPoints && (record.reason === undefined || record.reason === 'source-split-missing' || record.reason === 'unknown-source');
        case 'unavailable':
            return !hasBasisPoints && paths === undefined && (record.reason === 'owner-unresolved' || record.reason === 'invalid-setting');
        default:
            return false;
    }
};
exports.isNativeDiscountProjectionV1 = isNativeDiscountProjectionV1;
/**
 * Serializes projection metadata for the `X-Spotto-Native-Discount` header, for example
 * `v1; status=applied; bps=525`. JSON paths are never sent in the header.
 */
const formatNativeDiscountProjectionHeader = (projection) => {
    const parts = ['v1', `status=${projection.status}`];
    if (projection.basisPoints !== undefined)
        parts.push(`bps=${projection.basisPoints}`);
    if (projection.reason !== undefined)
        parts.push(`reason=${projection.reason}`);
    return parts.join('; ');
};
exports.formatNativeDiscountProjectionHeader = formatNativeDiscountProjectionHeader;
/** Parses the `X-Spotto-Native-Discount` header; returns undefined for an absent or invalid value. */
const parseNativeDiscountProjectionHeader = (header) => {
    if (typeof header !== 'string')
        return undefined;
    const [version, ...pairs] = header.split(';').map(part => part.trim());
    if (version !== 'v1')
        return undefined;
    const fields = new Map();
    for (const pair of pairs) {
        const match = /^([a-z]+)=([a-z0-9-]+)$/u.exec(pair);
        if (!match || fields.has(match[1]))
            return undefined;
        fields.set(match[1], match[2]);
    }
    if (![...fields.keys()].every(key => key === 'status' || key === 'bps' || key === 'reason'))
        return undefined;
    const bps = fields.get('bps');
    if (bps !== undefined && !/^\d{1,5}$/u.test(bps))
        return undefined;
    const candidate = {
        contractVersion: exports.NATIVE_DISCOUNT_PROJECTION_CONTRACT_V1,
        status: fields.get('status'),
        ...(bps !== undefined ? { basisPoints: Number(bps) } : {}),
        ...(fields.has('reason') ? { reason: fields.get('reason') } : {}),
    };
    return (0, exports.isNativeDiscountProjectionV1)(candidate) ? candidate : undefined;
};
exports.parseNativeDiscountProjectionHeader = parseNativeDiscountProjectionHeader;
//# sourceMappingURL=nativeDiscount.js.map