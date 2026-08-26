import { sha256Utf8 } from '../common/sha256.js';
import { formatExactDecimalValue, sumCanonicalDecimals } from '../common/exactDecimal.js';
import { toCanonicalEstimateLensV1 } from './costComposition.js';
import { isCanonicalExactMoney } from './financialValidationPrimitives.js';
import { isFinancialScopeBaselineEnvelopeV2 } from './financialScopeBaselineValidation.js';
import { FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1, FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1, } from './financialDataflow.js';
import { isFinancialBaselinePeriodV2 } from './financialScopeBaselineValidation.js';
export const FINANCIAL_DATAFLOW_LIMITS_V1 = {
    maximumIdentifierLength: 2048,
    maximumProviderAccounts: 256,
    maximumMembers: 20000,
    maximumReasonCodes: 64,
    maximumJsonBytes: 5242880,
    maximumJsonDepth: 64,
    maximumJsonNodes: 200000,
};
const SHA256_ID = /^sha256:[0-9a-f]{64}$/;
const CURRENCY = /^[A-Z]{3}$/;
const SCOPE_KINDS = new Set(['resource', 'resource-group', 'subscription', 'tag-scope', 'multi-subscription']);
const PERIOD_ROLES = new Set(['current-spend', 'comparison', 'analytics-input', 'projection-target']);
const COST_BASES = new Set(['billed', 'amortized']);
const ESTIMATE_LENSES = new Set(['billing-only', 'include-estimates', 'estimates-only']);
const CURRENCY_REASONS = new Set(['currency-unresolved', 'currency-conflicting']);
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const utf8ByteLength = (value) => {
    let length = 0;
    for (const character of value) {
        const codePoint = character.codePointAt(0) ?? 0;
        length += codePoint <= 0x7f ? 1 : codePoint <= 0x7ff ? 2 : codePoint <= 0xffff ? 3 : 4;
    }
    return length;
};
/** Returns the exact UTF-8 size after JSON string escaping, including quotes. */
const jsonStringByteLength = (value) => {
    let length = 2;
    for (let index = 0; index < value.length; index += 1) {
        const codeUnit = value.charCodeAt(index);
        if (codeUnit === 0x22 ||
            codeUnit === 0x5c ||
            codeUnit === 0x08 ||
            codeUnit === 0x09 ||
            codeUnit === 0x0a ||
            codeUnit === 0x0c ||
            codeUnit === 0x0d) {
            length += 2;
        }
        else if (codeUnit <= 0x1f ||
            (codeUnit >= 0xd800 &&
                codeUnit <= 0xdfff &&
                !(codeUnit <= 0xdbff && index + 1 < value.length && value.charCodeAt(index + 1) >= 0xdc00 && value.charCodeAt(index + 1) <= 0xdfff))) {
            length += 6;
        }
        else if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            length += 4;
            index += 1;
        }
        else {
            length += codeUnit <= 0x7f ? 1 : codeUnit <= 0x7ff ? 2 : 3;
        }
    }
    return length;
};
export const isFinancialDataflowRecordV1 = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === Object.prototype || prototype === null) && !Object.keys(value).some(key => FORBIDDEN_KEYS.has(key));
};
export const hasFinancialDataflowExactFieldsV1 = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
/** Applies the same aggregate byte/node/depth envelope to already-parsed public validator inputs. */
export const isFinancialDataflowValueWithinLimitsV1 = (value) => {
    const stack = [{ value, depth: 0 }];
    const activeObjects = new WeakSet();
    let nodes = 0;
    let bytes = 0;
    while (stack.length > 0) {
        const current = stack.pop();
        if (current.exit) {
            activeObjects.delete(current.value);
            continue;
        }
        if (current.depth > FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonDepth)
            return false;
        nodes += 1;
        if (nodes > FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonNodes)
            return false;
        if (current.value === undefined)
            return false;
        if (typeof current.value === 'string') {
            bytes += jsonStringByteLength(current.value);
        }
        else if (current.value === null) {
            bytes += 4;
        }
        else if (typeof current.value === 'number') {
            if (!Number.isFinite(current.value))
                return false;
            bytes += String(current.value).length;
        }
        else if (typeof current.value === 'boolean') {
            bytes += String(current.value).length;
        }
        else if (Array.isArray(current.value)) {
            if (activeObjects.has(current.value))
                return false;
            const arrayKeys = Object.keys(current.value);
            if (arrayKeys.length !== current.value.length || arrayKeys.some((key, index) => key !== String(index)))
                return false;
            activeObjects.add(current.value);
            stack.push({ value: current.value, depth: current.depth, exit: true });
            bytes += 2 + Math.max(0, current.value.length - 1);
            for (let index = 0; index < current.value.length; index += 1) {
                stack.push({ value: current.value[index], depth: current.depth + 1 });
            }
        }
        else if (isFinancialDataflowRecordV1(current.value)) {
            if (activeObjects.has(current.value))
                return false;
            activeObjects.add(current.value);
            stack.push({ value: current.value, depth: current.depth, exit: true });
            const entries = Object.entries(current.value);
            bytes += 2 + Math.max(0, entries.length - 1);
            for (const [key, entry] of entries) {
                bytes += jsonStringByteLength(key) + 1;
                stack.push({ value: entry, depth: current.depth + 1 });
            }
        }
        else {
            return false;
        }
        if (bytes > FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonBytes)
            return false;
    }
    return true;
};
export const isFinancialDataflowIdentityV1 = (value) => typeof value === 'string' && value.length > 0 && value.length <= FINANCIAL_DATAFLOW_LIMITS_V1.maximumIdentifierLength && value.trim() === value;
export const isFinancialDataflowHashV1 = (value) => typeof value === 'string' && SHA256_ID.test(value);
export const isFinancialDataflowCurrencyV1 = (value) => typeof value === 'string' && CURRENCY.test(value);
export const isFinancialDataflowIsoInstantV1 = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
export const isFinancialDataflowCalendarDateV1 = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
export const isFinancialDataflowSortedUniqueStringsV1 = (value, maximum, validate = isFinancialDataflowIdentityV1) => Array.isArray(value) &&
    value.length <= maximum &&
    value.every(validate) &&
    value.every((entry, index) => index === 0 || String(value[index - 1]) < entry);
export const canonicalizeFinancialDataflowJsonV1 = (value) => {
    if (!isFinancialDataflowValueWithinLimitsV1(value)) {
        throw new RangeError('Financial dataflow value exceeds the aggregate JSON limits.');
    }
    const visit = (entry) => {
        if (Array.isArray(entry))
            return entry.map(visit);
        if (!isFinancialDataflowRecordV1(entry))
            return entry;
        return Object.fromEntries(Object.keys(entry)
            .sort()
            .map(key => [key, visit(entry[key])]));
    };
    return JSON.stringify(visit(value));
};
/** Parses bounded JSON while rejecting duplicate and prototype-sensitive object keys. */
export const parseFinancialDataflowJsonV1 = (text) => {
    if (typeof text !== 'string' || utf8ByteLength(text) > FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonBytes) {
        throw new RangeError('Financial dataflow JSON exceeds the byte limit.');
    }
    let index = 0;
    let nodes = 0;
    const fail = (message) => {
        throw new SyntaxError(`Invalid financial dataflow JSON at offset ${index}: ${message}`);
    };
    const skipWhitespace = () => {
        while (text[index] === ' ' || text[index] === '\t' || text[index] === '\r' || text[index] === '\n')
            index += 1;
    };
    const parseString = () => {
        if (text[index] !== '"')
            fail('expected string');
        const start = index;
        index += 1;
        while (index < text.length) {
            const character = text[index];
            if (character === '"') {
                index += 1;
                try {
                    return JSON.parse(text.slice(start, index));
                }
                catch {
                    fail('invalid string escape');
                }
            }
            if (character === '\\') {
                index += 1;
                if (text[index] === 'u') {
                    if (!/^[0-9a-fA-F]{4}$/.test(text.slice(index + 1, index + 5)))
                        fail('invalid unicode escape');
                    index += 5;
                    continue;
                }
                if (!/["\\/bfnrt]/.test(text[index] ?? ''))
                    fail('invalid string escape');
            }
            else if (character.charCodeAt(0) < 0x20) {
                fail('unescaped control character');
            }
            index += 1;
        }
        return fail('unterminated string');
    };
    const parseValue = (depth) => {
        if (depth > FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonDepth)
            throw new RangeError('Financial dataflow JSON exceeds the depth limit.');
        nodes += 1;
        if (nodes > FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonNodes)
            throw new RangeError('Financial dataflow JSON exceeds the node limit.');
        skipWhitespace();
        const character = text[index];
        if (character === '"')
            return parseString();
        if (character === '{') {
            index += 1;
            skipWhitespace();
            const result = Object.create(null);
            const keys = new Set();
            if (text[index] === '}') {
                index += 1;
                return result;
            }
            while (index < text.length) {
                skipWhitespace();
                const key = parseString();
                if (keys.has(key))
                    fail(`duplicate object key ${JSON.stringify(key)}`);
                if (FORBIDDEN_KEYS.has(key))
                    fail(`prototype-sensitive object key ${JSON.stringify(key)}`);
                keys.add(key);
                skipWhitespace();
                if (text[index] !== ':')
                    fail('expected colon');
                index += 1;
                result[key] = parseValue(depth + 1);
                skipWhitespace();
                if (text[index] === '}') {
                    index += 1;
                    return result;
                }
                if (text[index] !== ',')
                    fail('expected comma or object end');
                index += 1;
            }
            fail('unterminated object');
        }
        if (character === '[') {
            index += 1;
            skipWhitespace();
            const result = [];
            if (text[index] === ']') {
                index += 1;
                return result;
            }
            while (index < text.length) {
                result.push(parseValue(depth + 1));
                skipWhitespace();
                if (text[index] === ']') {
                    index += 1;
                    return result;
                }
                if (text[index] !== ',')
                    fail('expected comma or array end');
                index += 1;
            }
            fail('unterminated array');
        }
        for (const [token, value] of [
            ['true', true],
            ['false', false],
            ['null', null],
        ]) {
            if (text.startsWith(token, index)) {
                index += token.length;
                return value;
            }
        }
        const numberMatch = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        if (numberMatch) {
            index += numberMatch[0].length;
            const parsedNumber = JSON.parse(numberMatch[0]);
            if (!Number.isFinite(parsedNumber))
                fail('non-finite number');
            return parsedNumber;
        }
        fail('unexpected token');
    };
    const parsed = parseValue(0);
    skipWhitespace();
    if (index !== text.length)
        fail('trailing content');
    return parsed;
};
export const isFinancialDataflowScopeV1 = (value) => isFinancialDataflowRecordV1(value) &&
    hasFinancialDataflowExactFieldsV1(value, ['kind', 'scopeId', 'scopeFingerprint']) &&
    typeof value.kind === 'string' &&
    SCOPE_KINDS.has(value.kind) &&
    isFinancialDataflowIdentityV1(value.scopeId) &&
    isFinancialDataflowHashV1(value.scopeFingerprint);
export const isFinancialDataflowCoordinateV1 = (value) => {
    if (!isFinancialDataflowRecordV1(value) ||
        !hasFinancialDataflowExactFieldsV1(value, ['companyId', 'provider', 'providerAccountRefs', 'scope', 'periodRole', 'period', 'costBasis', 'estimateLens', 'accountingCurrency'], ['requestedCurrencyCode']) ||
        !isFinancialDataflowIdentityV1(value.companyId) ||
        value.provider !== 'azure' ||
        !isFinancialDataflowSortedUniqueStringsV1(value.providerAccountRefs, FINANCIAL_DATAFLOW_LIMITS_V1.maximumProviderAccounts) ||
        value.providerAccountRefs.length === 0 ||
        !isFinancialDataflowScopeV1(value.scope) ||
        typeof value.periodRole !== 'string' ||
        !PERIOD_ROLES.has(value.periodRole) ||
        !isFinancialBaselinePeriodV2(value.period) ||
        typeof value.costBasis !== 'string' ||
        !COST_BASES.has(value.costBasis) ||
        typeof value.estimateLens !== 'string' ||
        !ESTIMATE_LENSES.has(value.estimateLens) ||
        (value.requestedCurrencyCode !== undefined && !isFinancialDataflowCurrencyV1(value.requestedCurrencyCode)) ||
        !isFinancialDataflowRecordV1(value.accountingCurrency)) {
        return false;
    }
    if (value.accountingCurrency.status === 'resolved') {
        return (hasFinancialDataflowExactFieldsV1(value.accountingCurrency, ['status', 'currencyCode']) &&
            isFinancialDataflowCurrencyV1(value.accountingCurrency.currencyCode) &&
            (value.requestedCurrencyCode === undefined || value.requestedCurrencyCode === value.accountingCurrency.currencyCode));
    }
    return (value.accountingCurrency.status === 'unresolved' &&
        hasFinancialDataflowExactFieldsV1(value.accountingCurrency, ['status', 'reasonCode']) &&
        typeof value.accountingCurrency.reasonCode === 'string' &&
        CURRENCY_REASONS.has(value.accountingCurrency.reasonCode));
};
export const canonicalizeFinancialDataflowCoordinateV1 = (value) => {
    if (!isFinancialDataflowCoordinateV1(value))
        throw new TypeError('Invalid FinancialDataflowCoordinateV1.');
    return canonicalizeFinancialDataflowJsonV1({ ...value, providerAccountRefs: [...value.providerAccountRefs].sort() });
};
export const createFinancialDataflowCoordinateIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeFinancialDataflowCoordinateV1(value))}`;
const isReasonCodes = (value) => Array.isArray(value) &&
    value.length > 0 &&
    value.length <= FINANCIAL_DATAFLOW_LIMITS_V1.maximumReasonCodes &&
    value.every(isFinancialDataflowIdentityV1) &&
    new Set(value).size === value.length;
const isMember = (value) => {
    if (!isFinancialDataflowRecordV1(value) || !isFinancialDataflowIdentityV1(value.memberScopeId))
        return false;
    if (value.status === 'included') {
        return hasFinancialDataflowExactFieldsV1(value, ['memberScopeId', 'baselineId', 'status']) && isFinancialDataflowHashV1(value.baselineId);
    }
    return (value.status === 'unavailable' &&
        hasFinancialDataflowExactFieldsV1(value, ['memberScopeId', 'status', 'reasonCode']) &&
        isFinancialDataflowIdentityV1(value.reasonCode));
};
export const canonicalizeCurrentSpendMembershipV1 = (members) => {
    if (!Array.isArray(members) ||
        members.length > FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers ||
        !members.every(isMember) ||
        new Set(members.map(member => member.memberScopeId)).size !== members.length) {
        throw new TypeError('Invalid CurrentSpendCompositionMemberV1 collection.');
    }
    return canonicalizeFinancialDataflowJsonV1([...members].sort((left, right) => left.memberScopeId.localeCompare(right.memberScopeId)));
};
export const createCurrentSpendMembershipDigestV1 = (members) => `sha256:${sha256Utf8(canonicalizeCurrentSpendMembershipV1(members))}`;
const isCompositionIdentity = (value) => {
    if (!isFinancialDataflowRecordV1(value) ||
        !hasFinancialDataflowExactFieldsV1(value, [
            'schemaVersion',
            'contractVersion',
            'coordinate',
            'members',
            'amount',
            'membershipDigest',
            'algorithmVersion',
        ]) ||
        value.schemaVersion !== FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1 ||
        value.contractVersion !== FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1 ||
        !isFinancialDataflowCoordinateV1(value.coordinate) ||
        (value.coordinate.periodRole !== 'current-spend' && value.coordinate.periodRole !== 'comparison') ||
        !Array.isArray(value.members) ||
        value.members.length > FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers ||
        !value.members.every(isMember) ||
        new Set(value.members.map(member => member.memberScopeId)).size !== value.members.length ||
        !isFinancialDataflowHashV1(value.membershipDigest) ||
        value.membershipDigest !== createCurrentSpendMembershipDigestV1(value.members) ||
        !isFinancialDataflowIdentityV1(value.algorithmVersion) ||
        !isFinancialDataflowRecordV1(value.amount)) {
        return false;
    }
    const currency = value.coordinate.accountingCurrency.status === 'resolved' ? value.coordinate.accountingCurrency.currencyCode : undefined;
    if (value.amount.status === 'available') {
        return (currency !== undefined &&
            hasFinancialDataflowExactFieldsV1(value.amount, ['status', 'amount', 'currencyCode']) &&
            isCanonicalExactMoney({ amount: value.amount.amount, currencyCode: value.amount.currencyCode }) &&
            value.amount.currencyCode === currency &&
            value.members.length > 0 &&
            value.members.every(member => member.status === 'included'));
    }
    if (value.amount.status === 'partial') {
        return (currency !== undefined &&
            hasFinancialDataflowExactFieldsV1(value.amount, ['status', 'knownAmount', 'currencyCode', 'reasonCodes']) &&
            isCanonicalExactMoney({ amount: value.amount.knownAmount, currencyCode: value.amount.currencyCode }) &&
            value.amount.currencyCode === currency &&
            isReasonCodes(value.amount.reasonCodes) &&
            value.members.some(member => member.status === 'included') &&
            value.members.some(member => member.status === 'unavailable'));
    }
    const unresolvedCurrency = value.coordinate.accountingCurrency;
    return (value.amount.status === 'unavailable' &&
        hasFinancialDataflowExactFieldsV1(value.amount, ['status', 'reasonCodes']) &&
        isReasonCodes(value.amount.reasonCodes) &&
        (currency !== undefined || (unresolvedCurrency.status === 'unresolved' && value.amount.reasonCodes.includes(unresolvedCurrency.reasonCode))));
};
export const canonicalizeCurrentSpendCompositionIdentityV1 = (value) => {
    if (!isFinancialDataflowValueWithinLimitsV1(value) || !isCompositionIdentity(value)) {
        throw new TypeError('Invalid CurrentSpendCompositionIdentityPreimageV1.');
    }
    const canonical = {
        ...value,
        coordinate: {
            ...value.coordinate,
            providerAccountRefs: [...value.coordinate.providerAccountRefs].sort(),
        },
        members: [...value.members].sort((left, right) => left.memberScopeId.localeCompare(right.memberScopeId)),
        amount: value.amount.status === 'available' ? value.amount : { ...value.amount, reasonCodes: [...value.amount.reasonCodes].sort() },
    };
    return canonicalizeFinancialDataflowJsonV1(canonical);
};
export const createCurrentSpendCompositionIdV1 = (value) => `sha256:${sha256Utf8(canonicalizeCurrentSpendCompositionIdentityV1(value))}`;
export const isCurrentSpendCompositionV1 = (value) => {
    if (!isFinancialDataflowValueWithinLimitsV1(value) ||
        !isFinancialDataflowRecordV1(value) ||
        !hasFinancialDataflowExactFieldsV1(value, [
            'compositionId',
            'schemaVersion',
            'contractVersion',
            'coordinate',
            'members',
            'amount',
            'membershipDigest',
            'algorithmVersion',
        ])) {
        return false;
    }
    const { compositionId, ...identity } = value;
    return isFinancialDataflowHashV1(compositionId) && isCompositionIdentity(identity) && compositionId === createCurrentSpendCompositionIdV1(identity);
};
const hasCompatibleBaselineCoordinate = (coordinate, baseline) => baseline.provider === coordinate.provider &&
    baseline.providerAccountRefs.every(providerAccountRef => coordinate.providerAccountRefs.includes(providerAccountRef)) &&
    baseline.period.windowKind === coordinate.period.windowKind &&
    canonicalizeFinancialDataflowJsonV1(baseline.period.requested) === canonicalizeFinancialDataflowJsonV1(coordinate.period.requested) &&
    baseline.period.providerBillingPeriodId === coordinate.period.providerBillingPeriodId &&
    baseline.costBasis === coordinate.costBasis &&
    toCanonicalEstimateLensV1(baseline.estimateLens) === coordinate.estimateLens &&
    baseline.requestedCurrencyCode === coordinate.requestedCurrencyCode;
/** Proves that composition membership and money reconcile to exact V2 baseline envelopes. */
export const isCurrentSpendCompositionCompatibleV1 = (composition, baselines) => {
    if (!isCurrentSpendCompositionV1(composition) ||
        !Array.isArray(baselines) ||
        baselines.length !== composition.members.length ||
        baselines.length > FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers ||
        !baselines.every(isFinancialScopeBaselineEnvelopeV2)) {
        return false;
    }
    const typedBaselines = baselines;
    const baselineByScopeId = new Map(typedBaselines.map(baseline => [baseline.scopeId, baseline]));
    if (baselineByScopeId.size !== typedBaselines.length ||
        new Set(typedBaselines.filter(baseline => baseline.status === 'available').map(baseline => baseline.baselineId)).size !==
            typedBaselines.filter(baseline => baseline.status === 'available').length) {
        return false;
    }
    const includedAmounts = [];
    const expectedReasonCodes = new Set();
    for (const member of composition.members) {
        const baseline = baselineByScopeId.get(member.memberScopeId);
        if (baseline === undefined || !hasCompatibleBaselineCoordinate(composition.coordinate, baseline))
            return false;
        if (member.status === 'included') {
            if (baseline.status !== 'available' || member.baselineId !== baseline.baselineId)
                return false;
            if (composition.coordinate.accountingCurrency.status === 'resolved' &&
                baseline.total.currencyCode !== composition.coordinate.accountingCurrency.currencyCode) {
                return false;
            }
            includedAmounts.push(baseline.total.amount);
            continue;
        }
        if (baseline.status !== 'unavailable' || member.reasonCode !== baseline.unavailableReason)
            return false;
        expectedReasonCodes.add(baseline.unavailableReason);
    }
    if (composition.coordinate.accountingCurrency.status === 'unresolved') {
        expectedReasonCodes.add(composition.coordinate.accountingCurrency.reasonCode);
    }
    const hasExpectedReasonCodes = (reasonCodes) => reasonCodes.length === expectedReasonCodes.size && reasonCodes.every(reasonCode => expectedReasonCodes.has(reasonCode));
    if (composition.coordinate.accountingCurrency.status === 'unresolved') {
        return composition.amount.status === 'unavailable' && hasExpectedReasonCodes(composition.amount.reasonCodes);
    }
    if (includedAmounts.length === 0) {
        return composition.amount.status === 'unavailable' && hasExpectedReasonCodes(composition.amount.reasonCodes);
    }
    let includedTotal;
    try {
        includedTotal = formatExactDecimalValue(sumCanonicalDecimals(includedAmounts));
    }
    catch {
        return false;
    }
    if (includedAmounts.length === composition.members.length) {
        return composition.amount.status === 'available' && composition.amount.amount === includedTotal;
    }
    return (composition.amount.status === 'partial' &&
        composition.amount.knownAmount === includedTotal &&
        hasExpectedReasonCodes(composition.amount.reasonCodes));
};
