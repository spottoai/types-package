"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCurrentSpendCompositionCompatibleV1 = exports.isCurrentSpendCompositionV1 = exports.createCurrentSpendCompositionIdV1 = exports.canonicalizeCurrentSpendCompositionIdentityV1 = exports.createCurrentSpendMembershipDigestV1 = exports.canonicalizeCurrentSpendMembershipV1 = exports.createFinancialDataflowCoordinateIdV1 = exports.canonicalizeFinancialDataflowCoordinateV1 = exports.isFinancialDataflowCoordinateV1 = exports.isFinancialDataflowScopeSelectorV1 = exports.isFinancialDataflowPeriodV1 = exports.isFinancialDataflowScopeV1 = exports.parseFinancialDataflowJsonV1 = exports.canonicalizeFinancialDataflowJsonV1 = exports.isFinancialDataflowSortedUniqueStringsV1 = exports.isFinancialDataflowCalendarDateV1 = exports.isFinancialDataflowJsonGzipArtifactDescriptorV1 = exports.isFinancialDataflowIsoInstantV1 = exports.isFinancialDataflowCurrencyV1 = exports.isFinancialDataflowHashV1 = exports.isFinancialDataflowIdentityV1 = exports.isFinancialDataflowValueWithinLimitsV1 = exports.hasFinancialDataflowExactFieldsV1 = exports.isFinancialDataflowRecordV1 = exports.FINANCIAL_DATAFLOW_LIMITS_V1 = void 0;
const sha256_1 = require("../common/sha256");
const exactDecimal_1 = require("../common/exactDecimal");
const costComposition_1 = require("./costComposition");
const financialValidationPrimitives_1 = require("./financialValidationPrimitives");
const financialChargeComposition_1 = require("./financialChargeComposition");
const financialChargeCompositionValidation_1 = require("./financialChargeCompositionValidation");
const financialScopeBaseline_1 = require("./financialScopeBaseline");
const financialScopeBaselineValidation_1 = require("./financialScopeBaselineValidation");
const financialDataflow_1 = require("./financialDataflow");
const financialScopeBaselineValidation_2 = require("./financialScopeBaselineValidation");
exports.FINANCIAL_DATAFLOW_LIMITS_V1 = {
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
const isFinancialDataflowRecordV1 = (value) => {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === Object.prototype || prototype === null) && !Object.keys(value).some(key => FORBIDDEN_KEYS.has(key));
};
exports.isFinancialDataflowRecordV1 = isFinancialDataflowRecordV1;
const hasFinancialDataflowExactFieldsV1 = (value, required, optional = []) => {
    const allowed = new Set([...required, ...optional]);
    const keys = Object.keys(value);
    return required.every(field => Object.prototype.hasOwnProperty.call(value, field)) && keys.every(field => allowed.has(field));
};
exports.hasFinancialDataflowExactFieldsV1 = hasFinancialDataflowExactFieldsV1;
/** Applies the same aggregate byte/node/depth envelope to already-parsed public validator inputs. */
const isFinancialDataflowValueWithinLimitsV1 = (value) => {
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
        if (current.depth > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonDepth)
            return false;
        nodes += 1;
        if (nodes > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonNodes)
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
        else if ((0, exports.isFinancialDataflowRecordV1)(current.value)) {
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
        if (bytes > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonBytes)
            return false;
    }
    return true;
};
exports.isFinancialDataflowValueWithinLimitsV1 = isFinancialDataflowValueWithinLimitsV1;
const isFinancialDataflowIdentityV1 = (value) => typeof value === 'string' && value.length > 0 && value.length <= exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumIdentifierLength && value.trim() === value;
exports.isFinancialDataflowIdentityV1 = isFinancialDataflowIdentityV1;
const isFinancialDataflowHashV1 = (value) => typeof value === 'string' && SHA256_ID.test(value);
exports.isFinancialDataflowHashV1 = isFinancialDataflowHashV1;
const isFinancialDataflowCurrencyV1 = (value) => typeof value === 'string' && CURRENCY.test(value);
exports.isFinancialDataflowCurrencyV1 = isFinancialDataflowCurrencyV1;
const isFinancialDataflowIsoInstantV1 = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
exports.isFinancialDataflowIsoInstantV1 = isFinancialDataflowIsoInstantV1;
const isFinancialDataflowJsonGzipArtifactDescriptorV1 = (value) => (0, exports.isFinancialDataflowRecordV1)(value) &&
    (0, exports.hasFinancialDataflowExactFieldsV1)(value, ['path', 'sha256', 'byteCount', 'mediaType', 'contentEncoding']) &&
    (0, exports.isFinancialDataflowIdentityV1)(value.path) &&
    (0, exports.isFinancialDataflowHashV1)(value.sha256) &&
    Number.isSafeInteger(value.byteCount) &&
    Number(value.byteCount) > 0 &&
    value.mediaType === 'application/json' &&
    value.contentEncoding === 'gzip';
exports.isFinancialDataflowJsonGzipArtifactDescriptorV1 = isFinancialDataflowJsonGzipArtifactDescriptorV1;
const isFinancialDataflowCalendarDateV1 = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
exports.isFinancialDataflowCalendarDateV1 = isFinancialDataflowCalendarDateV1;
const isFinancialDataflowSortedUniqueStringsV1 = (value, maximum, validate = exports.isFinancialDataflowIdentityV1) => Array.isArray(value) &&
    value.length <= maximum &&
    value.every(validate) &&
    value.every((entry, index) => index === 0 || String(value[index - 1]) < entry);
exports.isFinancialDataflowSortedUniqueStringsV1 = isFinancialDataflowSortedUniqueStringsV1;
const canonicalizeFinancialDataflowJsonV1 = (value) => {
    if (!(0, exports.isFinancialDataflowValueWithinLimitsV1)(value)) {
        throw new RangeError('Financial dataflow value exceeds the aggregate JSON limits.');
    }
    const visit = (entry) => {
        if (Array.isArray(entry))
            return entry.map(visit);
        if (!(0, exports.isFinancialDataflowRecordV1)(entry))
            return entry;
        return Object.fromEntries(Object.keys(entry)
            .sort()
            .map(key => [key, visit(entry[key])]));
    };
    return JSON.stringify(visit(value));
};
exports.canonicalizeFinancialDataflowJsonV1 = canonicalizeFinancialDataflowJsonV1;
/** Parses bounded JSON while rejecting duplicate and prototype-sensitive object keys. */
const parseFinancialDataflowJsonV1 = (text) => {
    if (typeof text !== 'string' || utf8ByteLength(text) > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonBytes) {
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
        if (depth > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonDepth)
            throw new RangeError('Financial dataflow JSON exceeds the depth limit.');
        nodes += 1;
        if (nodes > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumJsonNodes)
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
exports.parseFinancialDataflowJsonV1 = parseFinancialDataflowJsonV1;
const isFinancialDataflowScopeV1 = (value) => (0, exports.isFinancialDataflowRecordV1)(value) &&
    (0, exports.hasFinancialDataflowExactFieldsV1)(value, ['kind', 'scopeId', 'scopeFingerprint']) &&
    typeof value.kind === 'string' &&
    SCOPE_KINDS.has(value.kind) &&
    (0, exports.isFinancialDataflowIdentityV1)(value.scopeId) &&
    (0, exports.isFinancialDataflowHashV1)(value.scopeFingerprint);
exports.isFinancialDataflowScopeV1 = isFinancialDataflowScopeV1;
const isFinancialDataflowPeriodV1 = (value) => (0, exports.isFinancialDataflowRecordV1)(value) &&
    (0, exports.hasFinancialDataflowExactFieldsV1)(value, ['windowKind', 'requested'], ['providerBillingPeriodId']) &&
    (0, financialScopeBaselineValidation_2.isFinancialBaselinePeriodV2)({ ...value, coverage: [], gaps: [] });
exports.isFinancialDataflowPeriodV1 = isFinancialDataflowPeriodV1;
const isFinancialDataflowScopeSelectorV1 = (value) => {
    if (!(0, exports.isFinancialDataflowRecordV1)(value) || typeof value.kind !== 'string' || !SCOPE_KINDS.has(value.kind))
        return false;
    if (value.kind === 'resource') {
        return ((0, exports.hasFinancialDataflowExactFieldsV1)(value, ['kind', 'resourceIds']) &&
            (0, exports.isFinancialDataflowSortedUniqueStringsV1)(value.resourceIds, exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers) &&
            value.resourceIds.length === 1);
    }
    if (value.kind === 'resource-group') {
        return ((0, exports.hasFinancialDataflowExactFieldsV1)(value, ['kind', 'resourceGroupIds']) &&
            (0, exports.isFinancialDataflowSortedUniqueStringsV1)(value.resourceGroupIds, exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers) &&
            value.resourceGroupIds.length === 1);
    }
    if (value.kind === 'subscription' || value.kind === 'multi-subscription') {
        return ((0, exports.hasFinancialDataflowExactFieldsV1)(value, ['kind', 'subscriptionIds']) &&
            (0, exports.isFinancialDataflowSortedUniqueStringsV1)(value.subscriptionIds, exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumProviderAccounts) &&
            value.subscriptionIds.length > 0 &&
            (value.kind !== 'subscription' || value.subscriptionIds.length === 1));
    }
    if (!(0, exports.hasFinancialDataflowExactFieldsV1)(value, ['kind', 'tags', 'tagMatch']) ||
        (value.tagMatch !== 'any' && value.tagMatch !== 'all') ||
        !Array.isArray(value.tags) ||
        value.tags.length === 0 ||
        value.tags.length > 256) {
        return false;
    }
    const keys = value.tags.map(tag => {
        if (!(0, exports.isFinancialDataflowRecordV1)(tag) ||
            !(0, exports.hasFinancialDataflowExactFieldsV1)(tag, ['key', 'value']) ||
            !(0, exports.isFinancialDataflowIdentityV1)(tag.key) ||
            !(0, exports.isFinancialDataflowIdentityV1)(tag.value)) {
            return undefined;
        }
        return `${tag.key}\u0000${tag.value}`;
    });
    return keys.every((key) => key !== undefined) && keys.every((key, index) => index === 0 || keys[index - 1] < key);
};
exports.isFinancialDataflowScopeSelectorV1 = isFinancialDataflowScopeSelectorV1;
const isFinancialDataflowCoordinateV1 = (value) => {
    if (!(0, exports.isFinancialDataflowRecordV1)(value) ||
        !(0, exports.hasFinancialDataflowExactFieldsV1)(value, [
            'companyId',
            'provider',
            'providerAccountRefs',
            'scope',
            'periodRole',
            'period',
            'costBasis',
            'estimateLens',
            'accountingCurrency',
            'chargeInclusionPolicyRef',
        ], ['requestedCurrencyCode']) ||
        !(0, exports.isFinancialDataflowIdentityV1)(value.companyId) ||
        value.provider !== 'azure' ||
        !(0, exports.isFinancialDataflowSortedUniqueStringsV1)(value.providerAccountRefs, exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumProviderAccounts) ||
        value.providerAccountRefs.length === 0 ||
        !(0, exports.isFinancialDataflowScopeV1)(value.scope) ||
        typeof value.periodRole !== 'string' ||
        !PERIOD_ROLES.has(value.periodRole) ||
        !(0, exports.isFinancialDataflowPeriodV1)(value.period) ||
        typeof value.costBasis !== 'string' ||
        !COST_BASES.has(value.costBasis) ||
        typeof value.estimateLens !== 'string' ||
        !ESTIMATE_LENSES.has(value.estimateLens) ||
        (value.requestedCurrencyCode !== undefined && !(0, exports.isFinancialDataflowCurrencyV1)(value.requestedCurrencyCode)) ||
        !(0, exports.isFinancialDataflowRecordV1)(value.accountingCurrency) ||
        !(0, exports.isFinancialDataflowRecordV1)(value.chargeInclusionPolicyRef) ||
        !(0, exports.hasFinancialDataflowExactFieldsV1)(value.chargeInclusionPolicyRef, ['policyId', 'policyDigest']) ||
        !(0, exports.isFinancialDataflowIdentityV1)(value.chargeInclusionPolicyRef.policyId) ||
        !(0, exports.isFinancialDataflowHashV1)(value.chargeInclusionPolicyRef.policyDigest) ||
        (0, financialChargeComposition_1.resolveFinancialChargeInclusionPolicyV1)(value.chargeInclusionPolicyRef) === undefined) {
        return false;
    }
    if (value.accountingCurrency.status === 'resolved') {
        return ((0, exports.hasFinancialDataflowExactFieldsV1)(value.accountingCurrency, ['status', 'currencyCode']) &&
            (0, exports.isFinancialDataflowCurrencyV1)(value.accountingCurrency.currencyCode) &&
            (value.requestedCurrencyCode === undefined || value.requestedCurrencyCode === value.accountingCurrency.currencyCode));
    }
    return (value.accountingCurrency.status === 'unresolved' &&
        (0, exports.hasFinancialDataflowExactFieldsV1)(value.accountingCurrency, ['status', 'reasonCode']) &&
        typeof value.accountingCurrency.reasonCode === 'string' &&
        CURRENCY_REASONS.has(value.accountingCurrency.reasonCode));
};
exports.isFinancialDataflowCoordinateV1 = isFinancialDataflowCoordinateV1;
const canonicalizeFinancialDataflowCoordinateV1 = (value) => {
    if (!(0, exports.isFinancialDataflowCoordinateV1)(value))
        throw new TypeError('Invalid FinancialDataflowCoordinateV1.');
    return (0, exports.canonicalizeFinancialDataflowJsonV1)({ ...value, providerAccountRefs: [...value.providerAccountRefs].sort() });
};
exports.canonicalizeFinancialDataflowCoordinateV1 = canonicalizeFinancialDataflowCoordinateV1;
const createFinancialDataflowCoordinateIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeFinancialDataflowCoordinateV1)(value))}`;
exports.createFinancialDataflowCoordinateIdV1 = createFinancialDataflowCoordinateIdV1;
const isReasonCodes = (value) => Array.isArray(value) &&
    value.length > 0 &&
    value.length <= exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumReasonCodes &&
    value.every(exports.isFinancialDataflowIdentityV1) &&
    new Set(value).size === value.length;
const isMember = (value) => {
    if (!(0, exports.isFinancialDataflowRecordV1)(value) || !(0, exports.isFinancialDataflowIdentityV1)(value.memberScopeId))
        return false;
    if (value.status === 'included') {
        return ((0, exports.hasFinancialDataflowExactFieldsV1)(value, ['memberScopeId', 'baselineId', 'chargeCompositionId', 'status']) &&
            (0, exports.isFinancialDataflowHashV1)(value.baselineId) &&
            (0, exports.isFinancialDataflowHashV1)(value.chargeCompositionId));
    }
    return (value.status === 'unavailable' &&
        (0, exports.hasFinancialDataflowExactFieldsV1)(value, ['memberScopeId', 'status', 'reasonCode']) &&
        (0, exports.isFinancialDataflowIdentityV1)(value.reasonCode));
};
const canonicalizeCurrentSpendMembershipV1 = (members) => {
    if (!Array.isArray(members) ||
        members.length > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers ||
        !members.every(isMember) ||
        new Set(members.map(member => member.memberScopeId)).size !== members.length) {
        throw new TypeError('Invalid CurrentSpendCompositionMemberV1 collection.');
    }
    return (0, exports.canonicalizeFinancialDataflowJsonV1)([...members].sort((left, right) => left.memberScopeId.localeCompare(right.memberScopeId)));
};
exports.canonicalizeCurrentSpendMembershipV1 = canonicalizeCurrentSpendMembershipV1;
const createCurrentSpendMembershipDigestV1 = (members) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeCurrentSpendMembershipV1)(members))}`;
exports.createCurrentSpendMembershipDigestV1 = createCurrentSpendMembershipDigestV1;
const isCompositionIdentity = (value) => {
    if (!(0, exports.isFinancialDataflowRecordV1)(value) ||
        !(0, exports.hasFinancialDataflowExactFieldsV1)(value, ['schemaVersion', 'contractVersion', 'coordinate', 'members', 'amount', 'membershipDigest', 'algorithmVersion'], ['chargeSelection']) ||
        value.schemaVersion !== financialDataflow_1.FINANCIAL_DATAFLOW_SCHEMA_VERSION_V1 ||
        value.contractVersion !== financialDataflow_1.FINANCIAL_CURRENT_SPEND_COMPOSITION_CONTRACT_VERSION_V1 ||
        !(0, exports.isFinancialDataflowCoordinateV1)(value.coordinate) ||
        (value.coordinate.periodRole !== 'current-spend' && value.coordinate.periodRole !== 'comparison') ||
        !Array.isArray(value.members) ||
        value.members.length > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers ||
        !value.members.every(isMember) ||
        new Set(value.members.map(member => member.memberScopeId)).size !== value.members.length ||
        !(0, exports.isFinancialDataflowHashV1)(value.membershipDigest) ||
        value.membershipDigest !== (0, exports.createCurrentSpendMembershipDigestV1)(value.members) ||
        !(0, exports.isFinancialDataflowIdentityV1)(value.algorithmVersion) ||
        !(0, exports.isFinancialDataflowRecordV1)(value.amount)) {
        return false;
    }
    const currency = value.coordinate.accountingCurrency.status === 'resolved' ? value.coordinate.accountingCurrency.currencyCode : undefined;
    const isChargeSelection = (selection) => {
        if (!(0, exports.isFinancialDataflowRecordV1)(selection) ||
            !(0, exports.hasFinancialDataflowExactFieldsV1)(selection, [
                'status',
                'includedAmount',
                'excludedAmount',
                'withheldAmount',
                'forecastEligibleAmount',
                'oneTimeAmount',
                'unknownRecurrenceAmount',
                'forecastStatus',
                'currencyCode',
            ], ['reasonCodes', 'forecastReasonCodes']) ||
            (selection.status !== 'available' && selection.status !== 'partial') ||
            (selection.forecastStatus !== 'available' && selection.forecastStatus !== 'partial') ||
            !(0, exports.isFinancialDataflowCurrencyV1)(selection.currencyCode) ||
            ![
                selection.includedAmount,
                selection.excludedAmount,
                selection.withheldAmount,
                selection.forecastEligibleAmount,
                selection.oneTimeAmount,
                selection.unknownRecurrenceAmount,
            ].every(amount => (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount, currencyCode: selection.currencyCode })))
            return false;
        return ((selection.status === 'available' ? selection.reasonCodes === undefined : isReasonCodes(selection.reasonCodes)) &&
            (selection.forecastStatus === 'available'
                ? selection.forecastReasonCodes === undefined
                : isReasonCodes(selection.forecastReasonCodes)));
    };
    if (value.amount.status === 'available') {
        return (currency !== undefined &&
            (0, exports.hasFinancialDataflowExactFieldsV1)(value.amount, ['status', 'amount', 'currencyCode']) &&
            (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.amount.amount, currencyCode: value.amount.currencyCode }) &&
            value.amount.currencyCode === currency &&
            isChargeSelection(value.chargeSelection) &&
            value.chargeSelection.status === 'available' &&
            value.chargeSelection.currencyCode === currency &&
            value.chargeSelection.includedAmount === value.amount.amount &&
            value.members.length > 0 &&
            value.members.every(member => member.status === 'included'));
    }
    if (value.amount.status === 'partial') {
        return (currency !== undefined &&
            (0, exports.hasFinancialDataflowExactFieldsV1)(value.amount, ['status', 'knownAmount', 'currencyCode', 'reasonCodes']) &&
            (0, financialValidationPrimitives_1.isCanonicalExactMoney)({ amount: value.amount.knownAmount, currencyCode: value.amount.currencyCode }) &&
            value.amount.currencyCode === currency &&
            isReasonCodes(value.amount.reasonCodes) &&
            isChargeSelection(value.chargeSelection) &&
            value.chargeSelection.currencyCode === currency &&
            value.chargeSelection.includedAmount === value.amount.knownAmount &&
            value.members.some(member => member.status === 'included') &&
            (value.members.some(member => member.status === 'unavailable') ||
                value.amount.reasonCodes.includes('coverage-incomplete') ||
                value.chargeSelection.status === 'partial'));
    }
    const unresolvedCurrency = value.coordinate.accountingCurrency;
    return (value.amount.status === 'unavailable' &&
        value.chargeSelection === undefined &&
        (0, exports.hasFinancialDataflowExactFieldsV1)(value.amount, ['status', 'reasonCodes']) &&
        isReasonCodes(value.amount.reasonCodes) &&
        (currency !== undefined || (unresolvedCurrency.status === 'unresolved' && value.amount.reasonCodes.includes(unresolvedCurrency.reasonCode))));
};
const canonicalizeCurrentSpendCompositionIdentityV1 = (value) => {
    if (!(0, exports.isFinancialDataflowValueWithinLimitsV1)(value) || !isCompositionIdentity(value)) {
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
        ...(value.chargeSelection === undefined
            ? {}
            : {
                chargeSelection: {
                    ...value.chargeSelection,
                    ...(value.chargeSelection.reasonCodes === undefined
                        ? {}
                        : { reasonCodes: [...value.chargeSelection.reasonCodes].sort() }),
                    ...(value.chargeSelection.forecastReasonCodes === undefined
                        ? {}
                        : { forecastReasonCodes: [...value.chargeSelection.forecastReasonCodes].sort() }),
                },
            }),
    };
    return (0, exports.canonicalizeFinancialDataflowJsonV1)(canonical);
};
exports.canonicalizeCurrentSpendCompositionIdentityV1 = canonicalizeCurrentSpendCompositionIdentityV1;
const createCurrentSpendCompositionIdV1 = (value) => `sha256:${(0, sha256_1.sha256Utf8)((0, exports.canonicalizeCurrentSpendCompositionIdentityV1)(value))}`;
exports.createCurrentSpendCompositionIdV1 = createCurrentSpendCompositionIdV1;
const isCurrentSpendCompositionV1 = (value) => {
    if (!(0, exports.isFinancialDataflowValueWithinLimitsV1)(value) ||
        !(0, exports.isFinancialDataflowRecordV1)(value) ||
        !(0, exports.hasFinancialDataflowExactFieldsV1)(value, [
            'compositionId',
            'schemaVersion',
            'contractVersion',
            'coordinate',
            'members',
            'amount',
            'membershipDigest',
            'algorithmVersion',
        ], ['chargeSelection'])) {
        return false;
    }
    const { compositionId, ...identity } = value;
    return (0, exports.isFinancialDataflowHashV1)(compositionId) && isCompositionIdentity(identity) && compositionId === (0, exports.createCurrentSpendCompositionIdV1)(identity);
};
exports.isCurrentSpendCompositionV1 = isCurrentSpendCompositionV1;
const hasCompatibleBaselineCoordinate = (coordinate, baseline) => baseline.provider === coordinate.provider &&
    baseline.providerAccountRefs.every(providerAccountRef => coordinate.providerAccountRefs.includes(providerAccountRef)) &&
    baseline.period.windowKind === coordinate.period.windowKind &&
    (0, exports.canonicalizeFinancialDataflowJsonV1)(baseline.period.requested) === (0, exports.canonicalizeFinancialDataflowJsonV1)(coordinate.period.requested) &&
    baseline.period.providerBillingPeriodId === coordinate.period.providerBillingPeriodId &&
    baseline.costBasis === coordinate.costBasis &&
    (0, costComposition_1.toCanonicalEstimateLensV1)(baseline.estimateLens) === coordinate.estimateLens &&
    baseline.requestedCurrencyCode === coordinate.requestedCurrencyCode;
/** Proves that composition membership and money reconcile to exact V2 baseline envelopes. */
const isCurrentSpendCompositionCompatibleV1 = (composition, baselines, chargeCompositions) => {
    if (!(0, exports.isCurrentSpendCompositionV1)(composition) ||
        !Array.isArray(baselines) ||
        baselines.length !== composition.members.length ||
        baselines.length > exports.FINANCIAL_DATAFLOW_LIMITS_V1.maximumMembers ||
        !baselines.every(financialScopeBaselineValidation_1.isFinancialScopeBaselineEnvelopeV2) ||
        !Array.isArray(chargeCompositions) ||
        !chargeCompositions.every(financialChargeCompositionValidation_1.isFinancialChargeCompositionV1)) {
        return false;
    }
    const typedBaselines = baselines;
    const typedChargeCompositions = chargeCompositions;
    const chargeCompositionById = new Map(typedChargeCompositions.map(value => [value.chargeCompositionId, value]));
    if (chargeCompositionById.size !== typedChargeCompositions.length)
        return false;
    const baselineByScopeId = new Map(typedBaselines.map(baseline => [baseline.scopeId, baseline]));
    if (baselineByScopeId.size !== typedBaselines.length ||
        new Set(typedBaselines.filter(baseline => baseline.status === 'available').map(baseline => baseline.baselineId)).size !==
            typedBaselines.filter(baseline => baseline.status === 'available').length) {
        return false;
    }
    const includedSelections = [];
    const expectedReasonCodes = new Set();
    for (const member of composition.members) {
        const baseline = baselineByScopeId.get(member.memberScopeId);
        if (baseline === undefined || !hasCompatibleBaselineCoordinate(composition.coordinate, baseline))
            return false;
        if (member.status === 'included') {
            if (baseline.status !== 'available' ||
                baseline.baselineKind !== 'owner' ||
                member.baselineId !== baseline.baselineId ||
                (0, exports.canonicalizeFinancialDataflowJsonV1)(baseline.chargeInclusionPolicyRef) !==
                    (0, exports.canonicalizeFinancialDataflowJsonV1)(financialChargeComposition_1.AZURE_BILLED_ALL_CHARGES_POLICY_V1.policyRef))
                return false;
            const chargeComposition = chargeCompositionById.get(member.chargeCompositionId);
            if (chargeComposition === undefined ||
                chargeComposition.baselineId !== baseline.baselineId ||
                chargeComposition.ownerScopeId !== baseline.scopeId ||
                chargeComposition.period.windowKind !== baseline.period.windowKind ||
                (0, exports.canonicalizeFinancialDataflowJsonV1)(chargeComposition.period.requested) !== (0, exports.canonicalizeFinancialDataflowJsonV1)(baseline.period.requested) ||
                chargeComposition.costBasis !== baseline.costBasis ||
                chargeComposition.estimateLens !== baseline.estimateLens ||
                chargeComposition.accountingCurrencyCode !== baseline.total.currencyCode ||
                chargeComposition.reconciliation.sourceTotal !== baseline.total.amount)
                return false;
            if (composition.coordinate.accountingCurrency.status === 'resolved' &&
                baseline.total.currencyCode !== composition.coordinate.accountingCurrency.currencyCode) {
                return false;
            }
            includedSelections.push((0, financialChargeCompositionValidation_1.selectFinancialChargesV1)(chargeComposition, composition.coordinate.chargeInclusionPolicyRef));
            includedSelections[includedSelections.length - 1].reasonCodes?.forEach(reason => expectedReasonCodes.add(reason));
            if (baseline.status === 'available' && !(0, financialScopeBaseline_1.isCompleteFinancialBaselinePeriodV2)(baseline.period)) {
                expectedReasonCodes.add('coverage-incomplete');
            }
            continue;
        }
        if (baseline.status === 'unavailable') {
            if (member.reasonCode !== baseline.unavailableReason)
                return false;
            expectedReasonCodes.add(baseline.unavailableReason);
        }
        else {
            const expectedDerivedReason = baseline.baselineKind === 'aggregate'
                ? 'charge-composition-requires-owner-baseline'
                : 'charge-composition-unavailable';
            if (member.reasonCode !== expectedDerivedReason)
                return false;
            expectedReasonCodes.add(expectedDerivedReason);
        }
    }
    if (composition.coordinate.accountingCurrency.status === 'unresolved') {
        expectedReasonCodes.add(composition.coordinate.accountingCurrency.reasonCode);
    }
    if (typedChargeCompositions.length !== includedSelections.length)
        return false;
    const hasExpectedReasonCodes = (reasonCodes) => reasonCodes.length === expectedReasonCodes.size && reasonCodes.every(reasonCode => expectedReasonCodes.has(reasonCode));
    if (composition.coordinate.accountingCurrency.status === 'unresolved') {
        return composition.amount.status === 'unavailable' && hasExpectedReasonCodes(composition.amount.reasonCodes);
    }
    if (includedSelections.length === 0) {
        return composition.amount.status === 'unavailable' && hasExpectedReasonCodes(composition.amount.reasonCodes);
    }
    let aggregateSelection;
    try {
        const reasonCodes = new Set(includedSelections.flatMap(selection => selection.reasonCodes ?? []));
        const forecastReasonCodes = new Set(includedSelections.flatMap(selection => selection.forecastReasonCodes ?? []));
        aggregateSelection = {
            status: includedSelections.some(selection => selection.status === 'partial') ? 'partial' : 'available',
            includedAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.includedAmount))),
            excludedAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.excludedAmount))),
            withheldAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.withheldAmount))),
            forecastEligibleAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.forecastEligibleAmount))),
            oneTimeAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.oneTimeAmount))),
            unknownRecurrenceAmount: (0, exactDecimal_1.formatExactDecimalValue)((0, exactDecimal_1.sumCanonicalDecimals)(includedSelections.map(selection => selection.unknownRecurrenceAmount))),
            forecastStatus: includedSelections.some(selection => selection.forecastStatus === 'partial') ? 'partial' : 'available',
            currencyCode: composition.coordinate.accountingCurrency.currencyCode,
            ...(reasonCodes.size === 0 ? {} : { reasonCodes: [...reasonCodes].sort() }),
            ...(forecastReasonCodes.size === 0
                ? {}
                : { forecastReasonCodes: [...forecastReasonCodes].sort() }),
        };
    }
    catch {
        return false;
    }
    const sameSelection = (0, exports.canonicalizeFinancialDataflowJsonV1)(composition.chargeSelection) === (0, exports.canonicalizeFinancialDataflowJsonV1)(aggregateSelection);
    if (!sameSelection)
        return false;
    if (includedSelections.length === composition.members.length && expectedReasonCodes.size === 0) {
        return composition.amount.status === 'available' && composition.amount.amount === aggregateSelection.includedAmount;
    }
    return (composition.amount.status === 'partial' &&
        composition.amount.knownAmount === aggregateSelection.includedAmount &&
        hasExpectedReasonCodes(composition.amount.reasonCodes));
};
exports.isCurrentSpendCompositionCompatibleV1 = isCurrentSpendCompositionCompatibleV1;
//# sourceMappingURL=financialDataflowValidation.js.map