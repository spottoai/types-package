import { hasExactlyKeys, isIsoUtcTimestamp, isPlainRecord, isReportJobCompanyId } from '../shared/reportingIds.js';
import { SHA256_HEX_PATTERN } from '../shared/reportingDigest.js';
import { isReportJobId } from './reportJobIdentity.js';
import { isReportJobFailureCode, isReportJobNotificationStatus, isReportJobStatus, } from './reportJobStatus.js';
export const REPORT_ARTIFACT_RETENTION_DAYS = 30;
export const REPORT_ARTIFACT_RETENTION_MS = REPORT_ARTIFACT_RETENTION_DAYS * 86400000;
export const REPORT_SAGA_PHASES = ['queued', 'source-load', 'render', 'artifact-persist', 'notification', 'complete', 'retention'];
export const REPORT_PROGRESS_STATUSES = [
    'queued',
    'generating',
    'retrying',
    'sending',
    'sent',
    'partially-sent',
    'ready',
    'not-delivered',
    'failed',
    'expired',
];
const stepsValid = (value) => Array.isArray(value) &&
    value.length <= REPORT_SAGA_PHASES.length &&
    new Set(value.map(step => (isPlainRecord(step) ? step.phase : undefined))).size === value.length &&
    value.every(step => isPlainRecord(step) &&
        hasExactlyKeys(step, ['phase', 'status', 'startedAtUtc', 'updatedAtUtc']) &&
        REPORT_SAGA_PHASES.includes(step.phase) &&
        ['running', 'completed', 'failed'].includes(String(step.status)) &&
        isIsoUtcTimestamp(step.startedAtUtc) &&
        isIsoUtcTimestamp(step.updatedAtUtc) &&
        step.updatedAtUtc >= step.startedAtUtc);
export const isReportJobProgressV1 = (value) => isPlainRecord(value) &&
    hasExactlyKeys(value, ['status', 'phase', 'updatedAtUtc', 'steps'], ['artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'nextAttemptAtUtc', 'deliveryFailureCode']) &&
    (value.deliveryFailureCode === undefined || isReportJobFailureCode(value.deliveryFailureCode)) &&
    REPORT_PROGRESS_STATUSES.includes(value.status) &&
    REPORT_SAGA_PHASES.includes(value.phase) &&
    isIsoUtcTimestamp(value.updatedAtUtc) &&
    stepsValid(value.steps) &&
    ['artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'nextAttemptAtUtc'].every(key => value[key] === undefined || isIsoUtcTimestamp(value[key]));
export const isReportSagaV1 = (value) => {
    if (!isPlainRecord(value) ||
        !hasExactlyKeys(value, [
            'version',
            'companyId',
            'jobId',
            'requestSha256',
            'rowEtag',
            'rowVersion',
            'status',
            'notificationStatus',
            'generationAttemptCount',
            'notificationAttemptCount',
            'updatedAtUtc',
            'steps',
        ], [
            'leaseExpiresAtUtc',
            'nextAttemptAtUtc',
            'artifactExpiresAtUtc',
            'artifactExpiredAtUtc',
            'retentionState',
            'artifactAvailableAtUtc',
            'artifactContentSha256',
        ]))
        return false;
    return (value.version === 1 &&
        isReportJobCompanyId(value.companyId) &&
        isReportJobId(value.jobId) &&
        typeof value.requestSha256 === 'string' &&
        SHA256_HEX_PATTERN.test(value.requestSha256) &&
        typeof value.rowEtag === 'string' &&
        value.rowEtag.length > 0 &&
        value.rowEtag.length <= 2000 &&
        value.rowEtag !== '*' &&
        typeof value.rowVersion === 'string' &&
        value.rowVersion.length > 0 &&
        value.rowVersion.length <= 4096 &&
        (value.artifactContentSha256 === undefined ||
            (typeof value.artifactContentSha256 === 'string' && SHA256_HEX_PATTERN.test(value.artifactContentSha256))) &&
        isReportJobStatus(value.status) &&
        isReportJobNotificationStatus(value.notificationStatus) &&
        [value.generationAttemptCount, value.notificationAttemptCount].every(count => Number.isSafeInteger(count) && Number(count) >= 0) &&
        isIsoUtcTimestamp(value.updatedAtUtc) &&
        stepsValid(value.steps) &&
        ['leaseExpiresAtUtc', 'nextAttemptAtUtc', 'artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'artifactAvailableAtUtc'].every(key => value[key] === undefined || isIsoUtcTimestamp(value[key])) &&
        (value.retentionState === undefined || value.retentionState === 'deleting' || value.retentionState === 'expired') &&
        (value.retentionState !== 'expired' || isIsoUtcTimestamp(value.artifactExpiredAtUtc)));
};
