"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asRecord = asRecord;
exports.requiredArray = requiredArray;
exports.stringArray = stringArray;
exports.requiredString = requiredString;
exports.isoTimestamp = isoTimestamp;
exports.sha256 = sha256;
exports.requiredEnum = requiredEnum;
exports.optionalEnum = optionalEnum;
exports.optionalRecord = optionalRecord;
exports.assertAccount = assertAccount;
exports.assertExactKeys = assertExactKeys;
exports.assertNoForbiddenKeys = assertNoForbiddenKeys;
exports.assertPublicJson = assertPublicJson;
exports.assertRequiredKeys = assertRequiredKeys;
exports.assertValue = assertValue;
exports.assertJsonEqual = assertJsonEqual;
exports.validateDescriptor = validateDescriptor;
exports.validateBilling = validateBilling;
exports.validateSelector = validateSelector;
exports.validateMetricWindow = validateMetricWindow;
exports.validateTagRuleScope = validateTagRuleScope;
const requests_1 = require("./requests");
const FORBIDDEN_PUBLIC_KEYS = new Set([
    ...requests_1.AWS_REQUEST_FORBIDDEN_CREDENTIAL_FIELDS,
    'externalId',
    'roleArn',
    'secretArn',
    'secretReference',
    'storagePath',
    'path',
    'blobPath',
    'containerPath',
    'chunk',
    'chunks',
    'lease',
    'retries',
    'retry',
    'refreshState',
    'retiredAt',
]);
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
function asRecord(value, field) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`${field} must be a JSON object.`);
    return value;
}
function requiredArray(value, field) {
    if (!Array.isArray(value) || value.length === 0)
        throw new Error(`${field} must be a non-empty array.`);
    return value;
}
function stringArray(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    const strings = value.map((item, index) => requiredString(item, `${field}[${index}]`));
    if (new Set(strings).size !== strings.length)
        throw new Error(`${field} must not contain duplicates.`);
    const sorted = [...strings].sort((left, right) => left.localeCompare(right));
    if (JSON.stringify(strings) !== JSON.stringify(sorted))
        throw new Error(`${field} must be sorted.`);
    return strings;
}
function requiredString(value, field) {
    if (typeof value !== 'string' || value.trim() !== value || value.length === 0)
        throw new Error(`${field} must be a non-empty trimmed string.`);
    return value;
}
function isoTimestamp(value, field) {
    const timestamp = requiredString(value, field);
    if (!ISO_TIMESTAMP_PATTERN.test(timestamp) || Number.isNaN(Date.parse(timestamp)))
        throw new Error(`${field} must be an ISO UTC timestamp.`);
    return timestamp;
}
function sha256(value, field) {
    const digest = requiredString(value, field);
    if (!SHA256_PATTERN.test(digest))
        throw new Error(`${field} must be a lowercase hexadecimal SHA-256.`);
    return digest;
}
function requiredEnum(value, values, field) {
    if (typeof value !== 'string' || !values.includes(value))
        throw new Error(`${field} is not declared.`);
    return value;
}
function optionalEnum(value, values, field) {
    if (value !== undefined)
        requiredEnum(value, values, field);
}
function optionalRecord(value, field) {
    if (value !== undefined)
        asRecord(value, field);
}
function assertAccount(value, accountId, field) {
    assertValue(value, accountId, field);
    if (!/^\d{12}$/.test(accountId))
        throw new Error(`${field} must be a 12-digit AWS account id.`);
}
function assertExactKeys(value, allowed, field) {
    const allowedKeys = new Set(allowed);
    const unknown = Object.keys(value).filter(key => !allowedKeys.has(key));
    if (unknown.length > 0)
        throw new Error(`${field} contains undeclared fields: ${unknown.sort().join(', ')}.`);
}
function assertNoForbiddenKeys(value, field) {
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertNoForbiddenKeys(item, `${field}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object')
        return;
    for (const [key, child] of Object.entries(value)) {
        if (FORBIDDEN_PUBLIC_KEYS.has(key))
            throw new Error(`${field}.${key} is not allowed in a public artifact.`);
        assertNoForbiddenKeys(child, `${field}.${key}`);
    }
}
/** Rejects non-JSON values, non-plain objects, and forbidden public keys recursively. */
function assertPublicJson(value, field) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean')
        return;
    if (typeof value === 'number') {
        if (!Number.isFinite(value))
            throw new Error(`${field} must contain only finite JSON numbers.`);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item, index) => assertPublicJson(item, `${field}[${index}]`));
        return;
    }
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
        throw new Error(`${field} must contain only plain JSON values.`);
    }
    for (const [key, child] of Object.entries(value)) {
        if (FORBIDDEN_PUBLIC_KEYS.has(key))
            throw new Error(`${field}.${key} is not allowed in a public artifact.`);
        assertPublicJson(child, `${field}.${key}`);
    }
}
function assertRequiredKeys(value, required, field) {
    const missing = required.filter(key => !(key in value));
    if (missing.length > 0)
        throw new Error(`${field} is missing required fields: ${missing.join(', ')}.`);
}
function assertValue(actual, expected, field) {
    if (actual !== expected)
        throw new Error(`${field} must match its exact binding.`);
}
function assertJsonEqual(actual, expected, field) {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`${field} must match its exact binding.`);
}
function validateDescriptor(value, field) {
    const descriptor = asRecord(value, field);
    assertExactKeys(descriptor, ['name', 'mediaType', 'contentEncoding', 'byteLength', 'sha256'], field);
    requiredString(descriptor.name, `${field}.name`);
    assertValue(descriptor.mediaType, 'application/json', `${field}.mediaType`);
    requiredEnum(descriptor.contentEncoding, ['identity', 'gzip'], `${field}.contentEncoding`);
    if (!Number.isSafeInteger(descriptor.byteLength) || Number(descriptor.byteLength) < 0)
        throw new Error(`${field}.byteLength must be a non-negative safe integer.`);
    sha256(descriptor.sha256, `${field}.sha256`);
}
function validateBilling(value, field = 'target.billing') {
    const billing = asRecord(value, field);
    if (billing.source === 'cur') {
        assertExactKeys(billing, ['source', 'reportName', 'billingPeriod'], field);
        requiredString(billing.reportName, `${field}.reportName`);
    }
    else if (billing.source === 'cur-2.0-data-exports') {
        assertExactKeys(billing, ['source', 'exportName', 'billingPeriod'], field);
        requiredString(billing.exportName, `${field}.exportName`);
    }
    else {
        throw new Error(`${field}.source is not declared.`);
    }
    const period = asRecord(billing.billingPeriod, `${field}.billingPeriod`);
    assertExactKeys(period, ['start', 'end'], `${field}.billingPeriod`);
    requiredString(period.start, `${field}.billingPeriod.start`);
    requiredString(period.end, `${field}.billingPeriod.end`);
    if (String(period.start) > String(period.end))
        throw new Error(`${field}.billingPeriod start must not exceed end.`);
}
function validateSelector(value, field) {
    const selector = asRecord(value, field);
    if (selector.kind === 'stable-key') {
        assertExactKeys(selector, ['kind', 'stableKey'], field);
        requiredString(selector.stableKey, `${field}.stableKey`);
    }
    else if (selector.kind === 'resource-arn') {
        assertExactKeys(selector, ['kind', 'resourceArn'], field);
        requiredString(selector.resourceArn, `${field}.resourceArn`);
    }
    else {
        throw new Error(`${field}.kind is not declared.`);
    }
}
function validateMetricWindow(value, field) {
    const window = asRecord(value, field);
    assertExactKeys(window, ['start', 'end'], field);
    isoTimestamp(window.start, `${field}.start`);
    isoTimestamp(window.end, `${field}.end`);
    if (String(window.start) > String(window.end))
        throw new Error(`${field}.start must not exceed end.`);
}
function validateTagRuleScope(value) {
    if (value === undefined)
        return;
    const scope = asRecord(value, 'tagRuleScope');
    assertExactKeys(scope, ['companyId'], 'tagRuleScope');
    requiredString(scope.companyId, 'tagRuleScope.companyId');
}
//# sourceMappingURL=pluginPublicArtifactValidationHelpers.js.map