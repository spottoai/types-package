"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringArray = exports.requiredString = exports.requiredEnum = exports.isoTimestamp = exports.assertValue = exports.assertPublicJson = exports.assertExactKeys = exports.asRecord = void 0;
exports.validatePortalEnvelope = validatePortalEnvelope;
exports.validateGeneration = validateGeneration;
exports.validateResourceScope = validateResourceScope;
exports.validateAccountScope = validateAccountScope;
exports.validateHistoryAccountScope = validateHistoryAccountScope;
exports.validatePeriod = validatePeriod;
exports.validateFreshness = validateFreshness;
exports.requiredBoolean = requiredBoolean;
exports.nonNegativeInteger = nonNegativeInteger;
exports.finiteNumber = finiteNumber;
exports.validateJsonObject = validateJsonObject;
exports.validateJsonArray = validateJsonArray;
exports.assertRegionsBelong = assertRegionsBelong;
exports.assertUnique = assertUnique;
exports.regionArray = regionArray;
exports.requiredPublicIdentifier = requiredPublicIdentifier;
exports.dateValue = dateValue;
const portalPublicArtifacts_1 = require("./portalPublicArtifacts");
const publicArtifacts_1 = require("./publicArtifacts");
const pluginPublicArtifactValidationHelpers_1 = require("./pluginPublicArtifactValidationHelpers");
Object.defineProperty(exports, "asRecord", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.asRecord; } });
Object.defineProperty(exports, "assertExactKeys", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.assertExactKeys; } });
Object.defineProperty(exports, "assertPublicJson", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.assertPublicJson; } });
Object.defineProperty(exports, "assertValue", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.assertValue; } });
Object.defineProperty(exports, "isoTimestamp", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.isoTimestamp; } });
Object.defineProperty(exports, "requiredEnum", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.requiredEnum; } });
Object.defineProperty(exports, "requiredString", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.requiredString; } });
Object.defineProperty(exports, "stringArray", { enumerable: true, get: function () { return pluginPublicArtifactValidationHelpers_1.stringArray; } });
function validatePortalEnvelope(artifact, artifactType, allowed) {
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(artifact, allowed, 'artifact');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.schemaVersion, publicArtifacts_1.AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.schemaVersion');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.portalSchemaVersion, portalPublicArtifacts_1.AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.portalSchemaVersion');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.provider, 'aws', 'artifact.provider');
    const accountId = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(artifact.accountId, 'artifact.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(accountId, accountId, 'artifact.accountId');
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(artifact.artifactType, artifactType, 'artifact.artifactType');
    const generation = validateGeneration(artifact.artifactGeneration, 'artifact.artifactGeneration');
    const bodyGeneratedAt = (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(artifact.generatedAt, 'artifact.generatedAt');
    if (Date.parse(bodyGeneratedAt) > Date.parse(generation.generatedAt))
        throw new Error('artifact.generatedAt must not be newer than the Portal generation.');
    return { accountId, runId: generation.runId, portalGeneratedAt: generation.generatedAt, bodyGeneratedAt };
}
function validateGeneration(value, field) {
    const generation = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(generation, ['runId', 'generatedAt'], field);
    return {
        runId: requiredPublicIdentifier(generation.runId, `${field}.runId`),
        generatedAt: (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(generation.generatedAt, `${field}.generatedAt`),
    };
}
function validateResourceScope(value, accountId, field) {
    const scope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(scope, ['provider', 'accountId', 'billing', 'resourceRegions', 'metricTimeWindow', 'tagRuleScope'], field);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(scope.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(scope.accountId, accountId, `${field}.accountId`);
    (0, pluginPublicArtifactValidationHelpers_1.validateBilling)(scope.billing, `${field}.billing`);
    regionArray(scope.resourceRegions, `${field}.resourceRegions`);
    (0, pluginPublicArtifactValidationHelpers_1.validateMetricWindow)(scope.metricTimeWindow, `${field}.metricTimeWindow`);
    if (scope.tagRuleScope !== undefined) {
        const tagRuleScope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(scope.tagRuleScope, `${field}.tagRuleScope`);
        (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(tagRuleScope, ['companyId'], `${field}.tagRuleScope`);
        (0, pluginPublicArtifactValidationHelpers_1.requiredString)(tagRuleScope.companyId, `${field}.tagRuleScope.companyId`);
    }
    return value;
}
function validateAccountScope(value, accountId, field) {
    const scope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(scope, ['provider', 'accountId', 'billing', 'comparisonBillingPeriod', 'resourceRegions', 'metricTimeWindow'], field);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(scope.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(scope.accountId, accountId, `${field}.accountId`);
    (0, pluginPublicArtifactValidationHelpers_1.validateBilling)(scope.billing, `${field}.billing`);
    if (scope.comparisonBillingPeriod !== undefined)
        validatePeriod(scope.comparisonBillingPeriod, `${field}.comparisonBillingPeriod`);
    regionArray(scope.resourceRegions, `${field}.resourceRegions`);
    (0, pluginPublicArtifactValidationHelpers_1.validateMetricWindow)(scope.metricTimeWindow, `${field}.metricTimeWindow`);
    return value;
}
function validateHistoryAccountScope(value, accountId, field) {
    const scope = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(scope, ['provider', 'accountId', 'billing', 'resourceRegions'], field);
    (0, pluginPublicArtifactValidationHelpers_1.assertValue)(scope.provider, 'aws', `${field}.provider`);
    (0, pluginPublicArtifactValidationHelpers_1.assertAccount)(scope.accountId, accountId, `${field}.accountId`);
    (0, pluginPublicArtifactValidationHelpers_1.validateBilling)(scope.billing, `${field}.billing`);
    regionArray(scope.resourceRegions, `${field}.resourceRegions`);
}
function validatePeriod(value, field) {
    const period = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(period, ['start', 'end'], field);
    dateValue(period.start, `${field}.start`);
    dateValue(period.end, `${field}.end`);
    if (String(period.start) > String(period.end))
        throw new Error(`${field}.start must not exceed end.`);
}
function validateFreshness(value, field, timestampField) {
    const freshness = (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertExactKeys)(freshness, [timestampField, timestampField === 'lastSuccessfulImportAt' ? 'hasSuccessfulImport' : 'hasSuccessfulRefresh'], field);
    if (freshness[timestampField] !== undefined)
        (0, pluginPublicArtifactValidationHelpers_1.isoTimestamp)(freshness[timestampField], `${field}.${timestampField}`);
    const booleanField = timestampField === 'lastSuccessfulImportAt' ? 'hasSuccessfulImport' : 'hasSuccessfulRefresh';
    requiredBoolean(freshness[booleanField], `${field}.${booleanField}`);
}
function requiredBoolean(value, field) {
    if (typeof value !== 'boolean')
        throw new Error(`${field} must be a boolean.`);
    return value;
}
function nonNegativeInteger(value, field) {
    if (!Number.isSafeInteger(value) || Number(value) < 0)
        throw new Error(`${field} must be a non-negative safe integer.`);
    return Number(value);
}
function finiteNumber(value, field) {
    if (typeof value !== 'number' || !Number.isFinite(value))
        throw new Error(`${field} must be a finite number.`);
    return value;
}
function validateJsonObject(value, field) {
    (0, pluginPublicArtifactValidationHelpers_1.asRecord)(value, field);
    (0, pluginPublicArtifactValidationHelpers_1.assertPublicJson)(value, field);
}
function validateJsonArray(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array.`);
    (0, pluginPublicArtifactValidationHelpers_1.assertPublicJson)(value, field);
    return value;
}
function assertRegionsBelong(regions, allowedRegions, field) {
    const nested = (0, pluginPublicArtifactValidationHelpers_1.stringArray)(regions, field);
    nested.forEach(region => {
        if (!allowedRegions.includes(region))
            throw new Error(`${field} contains Region outside artifact scope: ${region}.`);
    });
}
function assertUnique(values, field) {
    if (new Set(values).size !== values.length)
        throw new Error(`${field} must not contain duplicates.`);
}
function regionArray(value, field) {
    const regions = (0, pluginPublicArtifactValidationHelpers_1.stringArray)(value, field);
    if (regions.length === 0)
        throw new Error(`${field} must not be empty.`);
    assertUnique(regions, field);
    regions.forEach(region => {
        if (region !== 'global' && !/^[a-z]{2}(?:-gov)?-[a-z0-9-]+-\d+$/.test(region))
            throw new Error(`${field} contains a non-canonical AWS Region: ${region}.`);
    });
    return regions;
}
function requiredPublicIdentifier(value, field) {
    const identifier = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(value, field);
    if (identifier.includes('/') || identifier.includes('\\') || identifier.includes('://') || identifier.includes('..'))
        throw new Error(`${field} must not contain a physical path or URI.`);
    return identifier;
}
function dateValue(value, field) {
    const date = (0, pluginPublicArtifactValidationHelpers_1.requiredString)(value, field);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00.000Z`)))
        throw new Error(`${field} must be a calendar date.`);
    const normalized = new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10);
    if (normalized !== date)
        throw new Error(`${field} must be a valid calendar date.`);
    return date;
}
//# sourceMappingURL=portalPublicArtifactValidationCommon.js.map