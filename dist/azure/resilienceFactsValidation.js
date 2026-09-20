"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResilienceFactsProjection = exports.isResilienceFactsItem = void 0;
const validationHelpers_1 = require("../common/validationHelpers");
const resilienceFacts_1 = require("./resilienceFacts");
const STATUSES = new Set(['collected', 'partial', 'failed', 'not-applicable']);
const isNullableBoolean = (value) => value === null || typeof value === 'boolean';
const isNullableNumber = (value) => value === null || (0, validationHelpers_1.isFiniteNumber)(value);
const isOptionalNullableNumber = (value) => value === undefined || isNullableNumber(value);
const isOptionalNullableString = (value) => value === undefined || value === null || (0, validationHelpers_1.isString)(value);
const isRetention = (value) => value === undefined || value === null || ((0, validationHelpers_1.isRecord)(value) && typeof value.enabled === 'boolean' && isOptionalNullableNumber(value.days));
const isOptionalNullableBoolean = (value) => value === undefined || isNullableBoolean(value);
const isStorageFacts = (value) => (0, validationHelpers_1.isRecord)(value) &&
    isRetention(value.blobSoftDelete) &&
    isRetention(value.containerSoftDelete) &&
    isOptionalNullableBoolean(value.versioning) &&
    isRetention(value.changeFeed) &&
    isRetention(value.pointInTimeRestore) &&
    isOptionalNullableString(value.kind) &&
    (value.managementPolicy === undefined ||
        value.managementPolicy === null ||
        ((0, validationHelpers_1.isRecord)(value.managementPolicy) &&
            typeof value.managementPolicy.present === 'boolean' &&
            (value.managementPolicy.ruleCount === undefined || (0, validationHelpers_1.isCount)(value.managementPolicy.ruleCount))));
const isSqlFacts = (value) => (0, validationHelpers_1.isRecord)(value) &&
    isOptionalNullableNumber(value.shortTermRetentionDays) &&
    isOptionalNullableNumber(value.diffBackupIntervalHours) &&
    (value.longTermRetention === undefined ||
        value.longTermRetention === null ||
        ((0, validationHelpers_1.isRecord)(value.longTermRetention) &&
            typeof value.longTermRetention.enabled === 'boolean' &&
            isOptionalNullableString(value.longTermRetention.weekly) &&
            isOptionalNullableString(value.longTermRetention.monthly) &&
            isOptionalNullableString(value.longTermRetention.yearly) &&
            isOptionalNullableNumber(value.longTermRetention.weekOfYear))) &&
    (value.failoverGroup === undefined ||
        value.failoverGroup === null ||
        ((0, validationHelpers_1.isRecord)(value.failoverGroup) &&
            (0, validationHelpers_1.isString)(value.failoverGroup.id) &&
            (0, validationHelpers_1.isString)(value.failoverGroup.name) &&
            (0, validationHelpers_1.isStringArray)(value.failoverGroup.partnerServers) &&
            isOptionalNullableString(value.failoverGroup.readWriteFailoverPolicy) &&
            isOptionalNullableString(value.failoverGroup.role))) &&
    isOptionalNullableString(value.backupStorageRedundancy);
const isResilienceFactsItem = (value) => (0, validationHelpers_1.isRecord)(value) &&
    (0, validationHelpers_1.isString)(value.resourceId) &&
    (0, validationHelpers_1.isString)(value.resourceType) &&
    (0, validationHelpers_1.isString)(value.status) &&
    STATUSES.has(value.status) &&
    (0, validationHelpers_1.isDateTime)(value.observedAt) &&
    (0, validationHelpers_1.isCount)(value.requestCount) &&
    (value.errors === undefined || (0, validationHelpers_1.isStringArray)(value.errors)) &&
    (value.storage === undefined || isStorageFacts(value.storage)) &&
    (value.sql === undefined || isSqlFacts(value.sql));
exports.isResilienceFactsItem = isResilienceFactsItem;
const isResilienceFactsProjection = (value) => (0, validationHelpers_1.isRecord)(value) &&
    value.schemaVersion === resilienceFacts_1.RESILIENCE_FACTS_SCHEMA_VERSION &&
    value.source === resilienceFacts_1.RESILIENCE_FACTS_SOURCE &&
    (0, validationHelpers_1.isString)(value.subscriptionId) &&
    (value.tenantId === undefined || (0, validationHelpers_1.isString)(value.tenantId)) &&
    (0, validationHelpers_1.isDateTime)(value.generatedAt) &&
    (0, validationHelpers_1.isRecord)(value.summary) &&
    (value.summary.notApplicable === undefined || (0, validationHelpers_1.isCount)(value.summary.notApplicable)) &&
    ['storageAccounts', 'sqlDatabases', 'sqlServers', 'collected', 'partial', 'failed', 'requestCount'].every(key => (0, validationHelpers_1.isCount)(value.summary[key])) &&
    Array.isArray(value.items) &&
    value.items.every(exports.isResilienceFactsItem) &&
    Array.isArray(value.issues) &&
    value.issues.every(issue => (0, validationHelpers_1.isRecord)(issue) && (issue.severity === 'warning' || issue.severity === 'error') && (0, validationHelpers_1.isString)(issue.code) && (0, validationHelpers_1.isString)(issue.message));
exports.isResilienceFactsProjection = isResilienceFactsProjection;
//# sourceMappingURL=resilienceFactsValidation.js.map