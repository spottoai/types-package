import { isCount, isDateTime, isFiniteNumber, isRecord, isString, isStringArray } from '../common/validationHelpers.js';
import { RESILIENCE_FACTS_SCHEMA_VERSION, RESILIENCE_FACTS_SOURCE, } from './resilienceFacts.js';
const STATUSES = new Set(['collected', 'partial', 'failed', 'not-applicable']);
const isNullableBoolean = (value) => value === null || typeof value === 'boolean';
const isNullableNumber = (value) => value === null || isFiniteNumber(value);
const isOptionalNullableNumber = (value) => value === undefined || isNullableNumber(value);
const isOptionalNullableString = (value) => value === undefined || value === null || isString(value);
const isRetention = (value) => value === undefined || value === null || (isRecord(value) && typeof value.enabled === 'boolean' && isOptionalNullableNumber(value.days));
const isOptionalNullableBoolean = (value) => value === undefined || isNullableBoolean(value);
const isStorageFacts = (value) => isRecord(value) &&
    isRetention(value.blobSoftDelete) &&
    isRetention(value.containerSoftDelete) &&
    isOptionalNullableBoolean(value.versioning) &&
    isRetention(value.changeFeed) &&
    isRetention(value.pointInTimeRestore) &&
    isOptionalNullableString(value.kind) &&
    (value.managementPolicy === undefined ||
        value.managementPolicy === null ||
        (isRecord(value.managementPolicy) &&
            typeof value.managementPolicy.present === 'boolean' &&
            (value.managementPolicy.ruleCount === undefined || isCount(value.managementPolicy.ruleCount))));
const isSqlFacts = (value) => isRecord(value) &&
    isOptionalNullableNumber(value.shortTermRetentionDays) &&
    isOptionalNullableNumber(value.diffBackupIntervalHours) &&
    (value.longTermRetention === undefined ||
        value.longTermRetention === null ||
        (isRecord(value.longTermRetention) &&
            typeof value.longTermRetention.enabled === 'boolean' &&
            isOptionalNullableString(value.longTermRetention.weekly) &&
            isOptionalNullableString(value.longTermRetention.monthly) &&
            isOptionalNullableString(value.longTermRetention.yearly) &&
            isOptionalNullableNumber(value.longTermRetention.weekOfYear))) &&
    (value.failoverGroup === undefined ||
        value.failoverGroup === null ||
        (isRecord(value.failoverGroup) &&
            isString(value.failoverGroup.id) &&
            isString(value.failoverGroup.name) &&
            isStringArray(value.failoverGroup.partnerServers) &&
            isOptionalNullableString(value.failoverGroup.readWriteFailoverPolicy) &&
            isOptionalNullableString(value.failoverGroup.role))) &&
    isOptionalNullableString(value.backupStorageRedundancy);
export const isResilienceFactsItem = (value) => isRecord(value) &&
    isString(value.resourceId) &&
    isString(value.resourceType) &&
    isString(value.status) &&
    STATUSES.has(value.status) &&
    isDateTime(value.observedAt) &&
    isCount(value.requestCount) &&
    (value.errors === undefined || isStringArray(value.errors)) &&
    (value.storage === undefined || isStorageFacts(value.storage)) &&
    (value.sql === undefined || isSqlFacts(value.sql));
export const isResilienceFactsProjection = (value) => isRecord(value) &&
    value.schemaVersion === RESILIENCE_FACTS_SCHEMA_VERSION &&
    value.source === RESILIENCE_FACTS_SOURCE &&
    isString(value.subscriptionId) &&
    (value.tenantId === undefined || isString(value.tenantId)) &&
    isDateTime(value.generatedAt) &&
    isRecord(value.summary) &&
    (value.summary.notApplicable === undefined || isCount(value.summary.notApplicable)) &&
    ['storageAccounts', 'sqlDatabases', 'sqlServers', 'collected', 'partial', 'failed', 'requestCount'].every(key => isCount(value.summary[key])) &&
    Array.isArray(value.items) &&
    value.items.every(isResilienceFactsItem) &&
    Array.isArray(value.issues) &&
    value.issues.every(issue => isRecord(issue) && (issue.severity === 'warning' || issue.severity === 'error') && isString(issue.code) && isString(issue.message));
