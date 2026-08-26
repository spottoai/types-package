import { addExactDecimalValues, formatExactDecimalValue, multiplyExactDecimalValues, parseCanonicalDecimal, subtractExactDecimalValues, sumCanonicalDecimals, } from '../common/exactDecimal.js';
import { sha256Utf8 } from '../common/sha256.js';
import { isCanonicalExactMoney } from './financialValidationPrimitives.js';
import { FINANCIAL_PROJECTION_CONTRACT_VERSION_V1, FINANCIAL_PROJECTION_SCHEMA_VERSION_V1, FINANCIAL_PROJECTION_UNAVAILABLE_REASONS_V1, } from './financialProjection.js';
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const CURRENCY = /^[A-Z]{3}$/;
const OPERATIONS = new Set(['replace-rate', 'replace-quantity', 'remove-component', 'schedule-quantity', 'commitment-coverage']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['actual-only', 'actual-plus-estimated', 'estimates-only']);
const TARGET_PROVENANCE = new Set(['retail-derived', 'provider-quote-derived', 'billing-backed', 'estimated', 'configuration-derived']);
const TARGET_PERIOD_CONVENTIONS = new Set(['same-observed-quantity', 'same-period-quantity', 'normalized-average-month']);
const UNAVAILABLE = new Set(FINANCIAL_PROJECTION_UNAVAILABLE_REASONS_V1);
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasExactFields = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
const isIdentity = (value) => typeof value === 'string' && value.length > 0 && value.length <= 2048 && value.trim() === value;
const isHash = (value) => typeof value === 'string' && SHA256_ID.test(value);
const isHashArray = (value) => Array.isArray(value) && value.length > 0 && value.length <= 20000 && value.every(isHash) && new Set(value).size === value.length;
const isPossiblyEmptyHashArray = (value) => Array.isArray(value) && value.length <= 20000 && value.every(isHash) && new Set(value).size === value.length;
const isDecimal = (value, currency = 'AUD') => typeof value === 'string' && isCanonicalExactMoney({ amount: value, currencyCode: currency });
const isNonNegativeDecimal = (value, currency = 'AUD') => {
    if (!isDecimal(value, currency))
        return false;
    try {
        return parseCanonicalDecimal(value).coefficient >= 0n;
    }
    catch {
        return false;
    }
};
const isUnit = (value) => isIdentity(value) && value.length <= 512;
const isCanonicalDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00.000Z`));
const isNormalizedAverageMonthProfile = (value) => isRecord(value) &&
    hasExactFields(value, ['kind', 'annualDayCount', 'monthDivisor', 'hoursPerDay', 'normalizedHours']) &&
    value.kind === 'normalized-average-month' &&
    value.annualDayCount === 365 &&
    value.monthDivisor === 12 &&
    value.hoursPerDay === 24 &&
    value.normalizedHours === '730';
const isObservedPeriodProfile = (value) => isRecord(value) &&
    hasExactFields(value, ['kind', 'dayCount', 'hoursPerDay', 'hourCount', 'currencyMinorUnitScale', 'roundingMode']) &&
    value.kind === 'observed-period' &&
    Number.isSafeInteger(value.dayCount) &&
    Number(value.dayCount) > 0 &&
    Number(value.dayCount) <= 3660 &&
    value.hoursPerDay === 24 &&
    value.hourCount === String(Number(value.dayCount) * 24) &&
    Number.isSafeInteger(value.currencyMinorUnitScale) &&
    Number(value.currencyMinorUnitScale) >= 0 &&
    Number(value.currencyMinorUnitScale) <= 6 &&
    value.roundingMode === 'half-even';
const isTargetPeriodProfileCompatible = (convention, profile, available) => convention === 'normalized-average-month'
    ? (!available && profile === undefined) || isNormalizedAverageMonthProfile(profile)
    : convention === 'same-period-quantity'
        ? profile === undefined || isObservedPeriodProfile(profile)
        : profile === undefined;
const equalsDecimal = (left, right) => formatExactDecimalValue(left) === formatExactDecimalValue(right);
const roundRationalHalfEven = (numerator, denominator, targetScale) => {
    if (numerator.coefficient < 0n || denominator <= 0n || !Number.isSafeInteger(targetScale) || targetScale < 0 || targetScale > 6) {
        throw new RangeError('Invalid rational money rounding input.');
    }
    const scaledNumerator = numerator.coefficient * 10n ** BigInt(targetScale);
    const scaledDenominator = denominator * 10n ** BigInt(numerator.scale);
    const quotient = scaledNumerator / scaledDenominator;
    const remainder = scaledNumerator % scaledDenominator;
    const twiceRemainder = remainder * 2n;
    const rounded = twiceRemainder > scaledDenominator || (twiceRemainder === scaledDenominator && quotient % 2n !== 0n) ? quotient + 1n : quotient;
    return formatExactDecimalValue({ coefficient: rounded, scale: targetScale });
};
const isCommitmentCoverage = (value, targetAmount, currency, profile) => {
    if (!isRecord(value) ||
        !hasExactFields(value, [
            'instrumentKind',
            'productId',
            'quote',
            'purchaseQuantity',
            'eligibleQuantity',
            'existingCoveredQuantity',
            'coveredQuantity',
            'commitmentCharge',
            'uncoveredQuantity',
            'uncoveredRate',
            'uncoveredRemainderRule',
            'effectivePeriod',
        ]) ||
        value.instrumentKind !== 'reservation' ||
        !isIdentity(value.productId) ||
        !isNonNegativeDecimal(value.purchaseQuantity) ||
        parseCanonicalDecimal(String(value.purchaseQuantity)).coefficient <= 0n ||
        !isRecord(value.quote) ||
        !isRecord(value.eligibleQuantity) ||
        !isRecord(value.existingCoveredQuantity) ||
        !isRecord(value.coveredQuantity) ||
        !isRecord(value.commitmentCharge) ||
        !isRecord(value.uncoveredQuantity) ||
        !isRecord(value.uncoveredRate) ||
        value.uncoveredRemainderRule !== 'billing-derived-effective-rate' ||
        !isRecord(value.effectivePeriod))
        return false;
    const quantities = [value.eligibleQuantity, value.existingCoveredQuantity, value.coveredQuantity, value.uncoveredQuantity];
    if (quantities.some(quantity => !hasExactFields(quantity, ['amount', 'unit']) || !isNonNegativeDecimal(quantity.amount) || !isUnit(quantity.unit)) ||
        new Set(quantities.map(quantity => quantity.unit)).size !== 1 ||
        !hasExactFields(value.commitmentCharge, ['amount', 'currencyCode']) ||
        !isNonNegativeDecimal(value.commitmentCharge.amount, currency) ||
        value.commitmentCharge.currencyCode !== currency ||
        !hasExactFields(value.uncoveredRate, ['amount', 'currencyCode', 'quantityUnit']) ||
        !isNonNegativeDecimal(value.uncoveredRate.amount, currency) ||
        value.uncoveredRate.currencyCode !== currency ||
        value.uncoveredRate.quantityUnit !== value.uncoveredQuantity.unit ||
        !hasExactFields(value.effectivePeriod, ['startDate', 'endDateExclusive', 'dateBasis']) ||
        !isCanonicalDate(value.effectivePeriod.startDate) ||
        !isCanonicalDate(value.effectivePeriod.endDateExclusive) ||
        value.effectivePeriod.endDateExclusive <= value.effectivePeriod.startDate ||
        (value.effectivePeriod.dateBasis !== 'utc' && value.effectivePeriod.dateBasis !== 'billing-calendar'))
        return false;
    const eligible = parseCanonicalDecimal(String(value.eligibleQuantity.amount));
    const allocated = sumCanonicalDecimals([
        String(value.existingCoveredQuantity.amount),
        String(value.coveredQuantity.amount),
        String(value.uncoveredQuantity.amount),
    ]);
    if (!equalsDecimal(eligible, allocated))
        return false;
    const uncoveredCharge = multiplyExactDecimalValues(parseCanonicalDecimal(String(value.uncoveredQuantity.amount)), parseCanonicalDecimal(String(value.uncoveredRate.amount)));
    const replayedTarget = addExactDecimalValues(parseCanonicalDecimal(String(value.commitmentCharge.amount)), uncoveredCharge);
    if (!equalsDecimal(replayedTarget, parseCanonicalDecimal(targetAmount)))
        return false;
    if (!hasExactFields(value.quote, ['kind', 'amount', 'currencyCode', 'termMonths', 'termDayCount']) ||
        value.quote.kind !== 'whole-term' ||
        !isNonNegativeDecimal(value.quote.amount, currency) ||
        value.quote.currencyCode !== currency ||
        !Number.isSafeInteger(value.quote.termMonths) ||
        Number(value.quote.termMonths) < 1 ||
        Number(value.quote.termMonths) > 120)
        return false;
    const purchaseQuantity = parseCanonicalDecimal(String(value.purchaseQuantity));
    if (purchaseQuantity.scale !== 0)
        return false;
    const quoteAmount = parseCanonicalDecimal(String(value.quote.amount));
    const commitmentCharge = parseCanonicalDecimal(String(value.commitmentCharge.amount));
    if (!Number.isSafeInteger(value.quote.termDayCount) ||
        Number(value.quote.termDayCount) < 1 ||
        Number(value.quote.termDayCount) > 3660 ||
        Number(value.quote.termDayCount) * 12 !== 365 * Number(value.quote.termMonths))
        return false;
    const capacityHours = isNormalizedAverageMonthProfile(profile) ? '730' : isObservedPeriodProfile(profile) ? profile.hourCount : undefined;
    if (!capacityHours ||
        subtractExactDecimalValues(parseCanonicalDecimal(String(value.coveredQuantity.amount)), multiplyExactDecimalValues(purchaseQuantity, parseCanonicalDecimal(capacityHours))).coefficient > 0n)
        return false;
    if (isNormalizedAverageMonthProfile(profile)) {
        return equalsDecimal(multiplyExactDecimalValues(quoteAmount, purchaseQuantity), multiplyExactDecimalValues(commitmentCharge, parseCanonicalDecimal(String(value.quote.termMonths))));
    }
    if (!isObservedPeriodProfile(profile))
        return false;
    const allocatedQuote = multiplyExactDecimalValues(multiplyExactDecimalValues(quoteAmount, purchaseQuantity), parseCanonicalDecimal(String(profile.dayCount)));
    return (roundRationalHalfEven(allocatedQuote, BigInt(Number(value.quote.termDayCount)), Number(profile.currencyMinorUnitScale)) ===
        formatExactDecimalValue(commitmentCharge));
};
const isAppliedComponentTargets = (value, operationKind, targetProvenance, targetPeriodProfile, accountingCurrencyCode, affectedComponentIds) => {
    if (typeof operationKind !== 'string' ||
        typeof accountingCurrencyCode !== 'string' ||
        !isHashArray(affectedComponentIds) ||
        !Array.isArray(value) ||
        value.length === 0 ||
        value.length > 20000)
        return false;
    const componentIds = [];
    for (const target of value) {
        if (!isRecord(target) ||
            !isHash(target.componentId) ||
            !isDecimal(target.targetAmount, accountingCurrencyCode) ||
            !isIdentity(target.targetConfigurationId) ||
            !isHashArray(target.targetEvidenceRefIds))
            return false;
        componentIds.push(target.componentId);
        if (operationKind === 'remove-component') {
            if (targetProvenance !== 'configuration-derived' ||
                !hasExactFields(target, ['componentId', 'targetAmount', 'targetConfigurationId', 'targetEvidenceRefIds', 'configurationTransformation']) ||
                target.targetAmount !== '0' ||
                !isRecord(target.configurationTransformation) ||
                !hasExactFields(target.configurationTransformation, ['kind', 'targetQuantity', 'ruleEvidenceRefId']) ||
                target.configurationTransformation.kind !== 'remove-component' ||
                !isRecord(target.configurationTransformation.targetQuantity) ||
                !hasExactFields(target.configurationTransformation.targetQuantity, ['amount', 'unit']) ||
                target.configurationTransformation.targetQuantity.amount !== '0' ||
                !isUnit(target.configurationTransformation.targetQuantity.unit) ||
                !isHash(target.configurationTransformation.ruleEvidenceRefId) ||
                !target.targetEvidenceRefIds.includes(target.configurationTransformation.ruleEvidenceRefId))
                return false;
            continue;
        }
        if (operationKind === 'replace-rate') {
            if (!hasExactFields(target, ['componentId', 'targetAmount', 'targetConfigurationId', 'targetEvidenceRefIds', 'sourceQuantity', 'targetRate']) ||
                !isRecord(target.sourceQuantity) ||
                !hasExactFields(target.sourceQuantity, ['amount', 'unit']) ||
                !isNonNegativeDecimal(target.sourceQuantity.amount) ||
                !isUnit(target.sourceQuantity.unit) ||
                !isRecord(target.targetRate) ||
                !hasExactFields(target.targetRate, ['amount', 'currencyCode', 'quantityUnit']) ||
                !isNonNegativeDecimal(target.targetRate.amount) ||
                target.targetRate.currencyCode !== accountingCurrencyCode ||
                !isUnit(target.targetRate.quantityUnit) ||
                target.targetRate.quantityUnit !== target.sourceQuantity.unit)
                return false;
            continue;
        }
        if (operationKind === 'replace-quantity' || operationKind === 'schedule-quantity') {
            if (!hasExactFields(target, ['componentId', 'targetAmount', 'targetConfigurationId', 'targetEvidenceRefIds', 'sourceRate', 'targetQuantity']) ||
                !isRecord(target.sourceRate) ||
                !hasExactFields(target.sourceRate, ['amount', 'unit', 'currencyCode']) ||
                !isNonNegativeDecimal(target.sourceRate.amount) ||
                !isUnit(target.sourceRate.unit) ||
                target.sourceRate.currencyCode !== accountingCurrencyCode ||
                !isRecord(target.targetQuantity) ||
                !hasExactFields(target.targetQuantity, ['amount', 'unit']) ||
                !isNonNegativeDecimal(target.targetQuantity.amount) ||
                !isUnit(target.targetQuantity.unit) ||
                target.targetQuantity.unit !== target.sourceRate.unit)
                return false;
            continue;
        }
        if (operationKind === 'commitment-coverage') {
            if (targetProvenance !== 'provider-quote-derived' ||
                !hasExactFields(target, ['componentId', 'targetAmount', 'targetConfigurationId', 'targetEvidenceRefIds', 'commitmentCoverage']) ||
                !isCommitmentCoverage(target.commitmentCoverage, target.targetAmount, accountingCurrencyCode, targetPeriodProfile))
                return false;
            continue;
        }
        return false;
    }
    return isSameHashSet(componentIds, affectedComponentIds);
};
const isSameHashSet = (left, right) => left.length === right.length &&
    new Set(left).size === left.length &&
    (() => {
        const sortedLeft = [...left].sort();
        const sortedRight = [...right].sort();
        return sortedLeft.every((value, index) => value === sortedRight[index]);
    })();
const isProjectionIdentity = (value) => isRecord(value) &&
    hasExactFields(value, [
        'schemaVersion',
        'contractVersion',
        'provider',
        'providerAccountRefs',
        'scopeId',
        'scenarioId',
        'operationKind',
        'baselineCostBasis',
        'baselineEstimateLens',
        'targetCostBasis',
        'targetProvenance',
        'targetPeriodConvention',
        'affectedComponentIds',
        'appliedComponentTargets',
        'accountingCurrencyCode',
        'targetEvidenceBundleId',
        'targetAssessmentId',
        'baselineId',
    ], ['targetPeriodProfile']) &&
    value.schemaVersion === FINANCIAL_PROJECTION_SCHEMA_VERSION_V1 &&
    value.contractVersion === FINANCIAL_PROJECTION_CONTRACT_VERSION_V1 &&
    value.provider === 'azure' &&
    Array.isArray(value.providerAccountRefs) &&
    value.providerAccountRefs.length > 0 &&
    value.providerAccountRefs.length <= 64 &&
    value.providerAccountRefs.every(isIdentity) &&
    new Set(value.providerAccountRefs).size === value.providerAccountRefs.length &&
    isIdentity(value.scopeId) &&
    isIdentity(value.scenarioId) &&
    typeof value.operationKind === 'string' &&
    OPERATIONS.has(value.operationKind) &&
    typeof value.baselineCostBasis === 'string' &&
    COST_BASES.has(value.baselineCostBasis) &&
    typeof value.baselineEstimateLens === 'string' &&
    ESTIMATE_LENSES.has(value.baselineEstimateLens) &&
    typeof value.targetCostBasis === 'string' &&
    COST_BASES.has(value.targetCostBasis) &&
    typeof value.targetProvenance === 'string' &&
    TARGET_PROVENANCE.has(value.targetProvenance) &&
    typeof value.targetPeriodConvention === 'string' &&
    TARGET_PERIOD_CONVENTIONS.has(value.targetPeriodConvention) &&
    isTargetPeriodProfileCompatible(value.targetPeriodConvention, value.targetPeriodProfile, true) &&
    (value.operationKind !== 'commitment-coverage' || value.targetPeriodProfile !== undefined) &&
    (!isObservedPeriodProfile(value.targetPeriodProfile) || value.operationKind === 'commitment-coverage') &&
    (value.targetProvenance !== 'configuration-derived' || value.operationKind === 'remove-component') &&
    (value.operationKind !== 'commitment-coverage' || value.targetProvenance === 'provider-quote-derived') &&
    isHashArray(value.affectedComponentIds) &&
    isAppliedComponentTargets(value.appliedComponentTargets, value.operationKind, value.targetProvenance, value.targetPeriodProfile, value.accountingCurrencyCode, value.affectedComponentIds) &&
    typeof value.accountingCurrencyCode === 'string' &&
    CURRENCY.test(value.accountingCurrencyCode) &&
    isHash(value.targetEvidenceBundleId) &&
    isHash(value.targetAssessmentId) &&
    isHash(value.baselineId);
export const canonicalizeFinancialProjectionIdentityV1 = (value) => {
    if (!isProjectionIdentity(value))
        throw new TypeError('Invalid FinancialProjectionIdentityPreimageV1.');
    return JSON.stringify({
        schemaVersion: value.schemaVersion,
        contractVersion: value.contractVersion,
        provider: value.provider,
        providerAccountRefs: [...value.providerAccountRefs].sort(),
        scopeId: value.scopeId,
        scenarioId: value.scenarioId,
        operationKind: value.operationKind,
        baselineCostBasis: value.baselineCostBasis,
        baselineEstimateLens: value.baselineEstimateLens,
        targetCostBasis: value.targetCostBasis,
        targetProvenance: value.targetProvenance,
        targetPeriodConvention: value.targetPeriodConvention,
        ...(value.targetPeriodProfile === undefined ? {} : { targetPeriodProfile: value.targetPeriodProfile }),
        affectedComponentIds: [...value.affectedComponentIds].sort(),
        appliedComponentTargets: [...value.appliedComponentTargets]
            .sort((left, right) => left.componentId.localeCompare(right.componentId))
            .map(target => ({ ...target, targetEvidenceRefIds: [...target.targetEvidenceRefIds].sort() })),
        accountingCurrencyCode: value.accountingCurrencyCode,
        targetEvidenceBundleId: value.targetEvidenceBundleId,
        targetAssessmentId: value.targetAssessmentId,
        baselineId: value.baselineId,
    });
};
const isAmounts = (value, currency) => isRecord(value) &&
    hasExactFields(value, ['total', 'affected', 'unchanged']) &&
    [value.total, value.affected, value.unchanged].every(amount => isDecimal(amount, currency)) &&
    formatExactDecimalValue(sumCanonicalDecimals([String(value.affected), String(value.unchanged)])) === value.total;
const isAvailable = (value) => {
    const currency = typeof value.accountingCurrencyCode === 'string' ? value.accountingCurrencyCode : undefined;
    if (!hasExactFields(value, [
        'schemaVersion',
        'contractVersion',
        'provider',
        'providerAccountRefs',
        'scopeId',
        'scenarioId',
        'operationKind',
        'baselineCostBasis',
        'baselineEstimateLens',
        'targetCostBasis',
        'targetProvenance',
        'targetPeriodConvention',
        'affectedComponentIds',
        'appliedComponentTargets',
        'accountingCurrencyCode',
        'targetEvidenceBundleId',
        'targetAssessmentId',
        'status',
        'baselineId',
        'projectionId',
        'current',
        'target',
        'change',
        'reconciliation',
    ], ['targetPeriodProfile']) ||
        value.status !== 'available' ||
        !isHash(value.projectionId) ||
        currency === undefined ||
        !isAmounts(value.current, currency) ||
        !isAmounts(value.target, currency) ||
        !isRecord(value.change) ||
        !hasExactFields(value.change, ['delta', 'savings', 'increase']) ||
        ![value.change.delta, value.change.savings, value.change.increase].every(amount => isDecimal(amount, currency)) ||
        !isRecord(value.reconciliation) ||
        !hasExactFields(value.reconciliation, ['status', 'difference']) ||
        value.reconciliation.status !== 'reconciled' ||
        value.reconciliation.difference !== '0')
        return false;
    const appliedTargets = value.appliedComponentTargets;
    if (formatExactDecimalValue(sumCanonicalDecimals(appliedTargets.map(target => target.targetAmount))) !==
        value.target.affected)
        return false;
    const current = value.current;
    const target = value.target;
    const change = value.change;
    const delta = subtractExactDecimalValues(parseCanonicalDecimal(target.total), parseCanonicalDecimal(current.total));
    const expectedDelta = formatExactDecimalValue(delta);
    const expectedSavings = delta.coefficient < 0n ? formatExactDecimalValue({ coefficient: -delta.coefficient, scale: delta.scale }) : '0';
    const expectedIncrease = delta.coefficient > 0n ? expectedDelta : '0';
    if (change.delta !== expectedDelta || change.savings !== expectedSavings || change.increase !== expectedIncrease)
        return false;
    const { status: _status, projectionId: _projectionId, current: _current, target: _target, change: _change, reconciliation: _reconciliation, ...identity } = value;
    return isProjectionIdentity(identity) && value.projectionId === `sha256:${sha256Utf8(canonicalizeFinancialProjectionIdentityV1(identity))}`;
};
const isUnavailable = (value) => {
    if (!hasExactFields(value, [
        'schemaVersion',
        'contractVersion',
        'provider',
        'providerAccountRefs',
        'scopeId',
        'scenarioId',
        'operationKind',
        'baselineCostBasis',
        'baselineEstimateLens',
        'targetCostBasis',
        'targetProvenance',
        'targetPeriodConvention',
        'affectedComponentIds',
        'status',
        'unavailableReason',
    ], ['accountingCurrencyCode', 'targetEvidenceBundleId', 'targetAssessmentId', 'baselineId', 'targetPeriodProfile']) ||
        value.status !== 'unavailable' ||
        typeof value.unavailableReason !== 'string' ||
        !UNAVAILABLE.has(value.unavailableReason) ||
        value.schemaVersion !== FINANCIAL_PROJECTION_SCHEMA_VERSION_V1 ||
        value.contractVersion !== FINANCIAL_PROJECTION_CONTRACT_VERSION_V1 ||
        value.provider !== 'azure' ||
        !Array.isArray(value.providerAccountRefs) ||
        value.providerAccountRefs.length === 0 ||
        value.providerAccountRefs.length > 64 ||
        !value.providerAccountRefs.every(isIdentity) ||
        new Set(value.providerAccountRefs).size !== value.providerAccountRefs.length ||
        !isIdentity(value.scopeId) ||
        !isIdentity(value.scenarioId) ||
        typeof value.operationKind !== 'string' ||
        !OPERATIONS.has(value.operationKind) ||
        typeof value.baselineCostBasis !== 'string' ||
        !COST_BASES.has(value.baselineCostBasis) ||
        typeof value.baselineEstimateLens !== 'string' ||
        !ESTIMATE_LENSES.has(value.baselineEstimateLens) ||
        typeof value.targetCostBasis !== 'string' ||
        !COST_BASES.has(value.targetCostBasis) ||
        typeof value.targetProvenance !== 'string' ||
        !TARGET_PROVENANCE.has(value.targetProvenance) ||
        typeof value.targetPeriodConvention !== 'string' ||
        !TARGET_PERIOD_CONVENTIONS.has(value.targetPeriodConvention) ||
        !isTargetPeriodProfileCompatible(value.targetPeriodConvention, value.targetPeriodProfile, false) ||
        (isObservedPeriodProfile(value.targetPeriodProfile) && value.operationKind !== 'commitment-coverage') ||
        (value.targetProvenance === 'configuration-derived' && value.operationKind !== 'remove-component') ||
        (value.operationKind === 'commitment-coverage' && value.targetProvenance !== 'provider-quote-derived') ||
        !isPossiblyEmptyHashArray(value.affectedComponentIds) ||
        (value.accountingCurrencyCode !== undefined &&
            (typeof value.accountingCurrencyCode !== 'string' || !CURRENCY.test(value.accountingCurrencyCode))) ||
        (value.targetEvidenceBundleId !== undefined && !isHash(value.targetEvidenceBundleId)) ||
        (value.targetAssessmentId !== undefined && !isHash(value.targetAssessmentId)) ||
        (value.targetEvidenceBundleId === undefined) !== (value.targetAssessmentId === undefined) ||
        (value.baselineId !== undefined && !isHash(value.baselineId)) ||
        (value.targetEvidenceBundleId === undefined &&
            value.unavailableReason !== 'target-evidence-unavailable' &&
            value.unavailableReason !== 'baseline-unavailable'))
        return false;
    return true;
};
export const isFinancialProjectionEnvelopeV1 = (value) => isRecord(value) && (isAvailable(value) || isUnavailable(value));
