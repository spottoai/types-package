"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReportSagaV1 = exports.isReportJobProgressV1 = exports.REPORT_PROGRESS_STATUSES = exports.REPORT_SAGA_PHASES = exports.REPORT_ARTIFACT_RETENTION_MS = exports.REPORT_ARTIFACT_RETENTION_DAYS = void 0;
const reportingIds_1 = require("../shared/reportingIds");
const reportingDigest_1 = require("../shared/reportingDigest");
const reportJobIdentity_1 = require("./reportJobIdentity");
const reportJobStatus_1 = require("./reportJobStatus");
exports.REPORT_ARTIFACT_RETENTION_DAYS = 30;
exports.REPORT_ARTIFACT_RETENTION_MS = exports.REPORT_ARTIFACT_RETENTION_DAYS * 86400000;
exports.REPORT_SAGA_PHASES = ['queued', 'source-load', 'render', 'artifact-persist', 'notification', 'complete', 'retention'];
exports.REPORT_PROGRESS_STATUSES = [
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
    value.length <= exports.REPORT_SAGA_PHASES.length &&
    new Set(value.map(step => ((0, reportingIds_1.isPlainRecord)(step) ? step.phase : undefined))).size === value.length &&
    value.every(step => (0, reportingIds_1.isPlainRecord)(step) &&
        (0, reportingIds_1.hasExactlyKeys)(step, ['phase', 'status', 'startedAtUtc', 'updatedAtUtc']) &&
        exports.REPORT_SAGA_PHASES.includes(step.phase) &&
        ['running', 'completed', 'failed'].includes(String(step.status)) &&
        (0, reportingIds_1.isIsoUtcTimestamp)(step.startedAtUtc) &&
        (0, reportingIds_1.isIsoUtcTimestamp)(step.updatedAtUtc) &&
        step.updatedAtUtc >= step.startedAtUtc);
const isReportJobProgressV1 = (value) => (0, reportingIds_1.isPlainRecord)(value) &&
    (0, reportingIds_1.hasExactlyKeys)(value, ['status', 'phase', 'updatedAtUtc', 'steps'], ['artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'nextAttemptAtUtc', 'deliveryFailureCode']) &&
    (value.deliveryFailureCode === undefined || (0, reportJobStatus_1.isReportJobFailureCode)(value.deliveryFailureCode)) &&
    exports.REPORT_PROGRESS_STATUSES.includes(value.status) &&
    exports.REPORT_SAGA_PHASES.includes(value.phase) &&
    (0, reportingIds_1.isIsoUtcTimestamp)(value.updatedAtUtc) &&
    stepsValid(value.steps) &&
    ['artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'nextAttemptAtUtc'].every(key => value[key] === undefined || (0, reportingIds_1.isIsoUtcTimestamp)(value[key]));
exports.isReportJobProgressV1 = isReportJobProgressV1;
const isReportSagaV1 = (value) => {
    if (!(0, reportingIds_1.isPlainRecord)(value) ||
        !(0, reportingIds_1.hasExactlyKeys)(value, [
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
        (0, reportingIds_1.isReportJobCompanyId)(value.companyId) &&
        (0, reportJobIdentity_1.isReportJobId)(value.jobId) &&
        typeof value.requestSha256 === 'string' &&
        reportingDigest_1.SHA256_HEX_PATTERN.test(value.requestSha256) &&
        typeof value.rowEtag === 'string' &&
        value.rowEtag.length > 0 &&
        value.rowEtag.length <= 2000 &&
        value.rowEtag !== '*' &&
        typeof value.rowVersion === 'string' &&
        value.rowVersion.length > 0 &&
        value.rowVersion.length <= 4096 &&
        (value.artifactContentSha256 === undefined ||
            (typeof value.artifactContentSha256 === 'string' && reportingDigest_1.SHA256_HEX_PATTERN.test(value.artifactContentSha256))) &&
        (0, reportJobStatus_1.isReportJobStatus)(value.status) &&
        (0, reportJobStatus_1.isReportJobNotificationStatus)(value.notificationStatus) &&
        [value.generationAttemptCount, value.notificationAttemptCount].every(count => Number.isSafeInteger(count) && Number(count) >= 0) &&
        (0, reportingIds_1.isIsoUtcTimestamp)(value.updatedAtUtc) &&
        stepsValid(value.steps) &&
        ['leaseExpiresAtUtc', 'nextAttemptAtUtc', 'artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'artifactAvailableAtUtc'].every(key => value[key] === undefined || (0, reportingIds_1.isIsoUtcTimestamp)(value[key])) &&
        (value.retentionState === undefined || value.retentionState === 'deleting' || value.retentionState === 'expired') &&
        (value.retentionState !== 'expired' || (0, reportingIds_1.isIsoUtcTimestamp)(value.artifactExpiredAtUtc)));
};
exports.isReportSagaV1 = isReportSagaV1;
//# sourceMappingURL=reportJobSaga.js.map