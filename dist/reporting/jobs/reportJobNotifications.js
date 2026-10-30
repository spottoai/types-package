"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportJobNotificationBrokerProperties = exports.buildReportJobNotificationMessageId = exports.createReportJobNotificationRequestedV1 = exports.isReportJobNotificationRequestedV1 = exports.parseReportJobNotificationDestinationCountsV1 = exports.isReportJobNotificationDestinationCountsV1 = exports.REPORT_JOB_NOTIFICATION_CHANNELS = exports.REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS = exports.REPORT_JOB_NOTIFICATION_MAX_BYTES = exports.REPORT_JOB_NOTIFICATION_MESSAGE_TYPE = void 0;
const reportingDigest_1 = require("../shared/reportingDigest");
const reportingIds_1 = require("../shared/reportingIds");
const reportJobIdentity_1 = require("./reportJobIdentity");
exports.REPORT_JOB_NOTIFICATION_MESSAGE_TYPE = 'report-job.notification-requested';
exports.REPORT_JOB_NOTIFICATION_MAX_BYTES = 4 * 1024;
exports.REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS = 32;
exports.REPORT_JOB_NOTIFICATION_CHANNELS = ['email', 'slack', 'teams', 'webhook'];
const isReportJobNotificationDestinationCountsV1 = (value) => {
    try {
        if (!(0, reportingIds_1.isPlainRecord)(value) || !(0, reportingIds_1.hasExactlyKeys)(value, [], exports.REPORT_JOB_NOTIFICATION_CHANNELS))
            return false;
        let total = 0;
        for (const counts of Object.values(value)) {
            if (!(0, reportingIds_1.isPlainRecord)(counts) || !(0, reportingIds_1.hasExactlyKeys)(counts, ['total', 'delivered', 'failed']))
                return false;
            if (![counts.total, counts.delivered, counts.failed].every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= exports.REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS))
                return false;
            const c = counts;
            if (c.total === 0 || c.delivered + c.failed > c.total)
                return false;
            total += c.total;
        }
        return total > 0 && total <= exports.REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS;
    }
    catch {
        return false;
    }
};
exports.isReportJobNotificationDestinationCountsV1 = isReportJobNotificationDestinationCountsV1;
const parseReportJobNotificationDestinationCountsV1 = (json) => {
    try {
        if (typeof json !== 'string' || (0, reportingIds_1.utf8ByteLength)(json) > exports.REPORT_JOB_NOTIFICATION_MAX_BYTES)
            return null;
        const value = JSON.parse(json);
        return (0, exports.isReportJobNotificationDestinationCountsV1)(value) ? value : null;
    }
    catch {
        return null;
    }
};
exports.parseReportJobNotificationDestinationCountsV1 = parseReportJobNotificationDestinationCountsV1;
const isReportJobNotificationRequestedV1 = (value) => {
    try {
        return ((0, reportingIds_1.isPlainRecord)(value) &&
            (0, reportingIds_1.hasExactlyKeys)(value, ['schemaVersion', 'messageType', 'companyId', 'jobId', 'artifactContentSha256', 'correlationId']) &&
            value.schemaVersion === 1 &&
            value.messageType === exports.REPORT_JOB_NOTIFICATION_MESSAGE_TYPE &&
            (0, reportingIds_1.isReportJobCompanyId)(value.companyId) &&
            (0, reportJobIdentity_1.isReportJobId)(value.jobId) &&
            typeof value.artifactContentSha256 === 'string' &&
            reportingDigest_1.SHA256_HEX_PATTERN.test(value.artifactContentSha256) &&
            (0, reportingIds_1.isBoundedPlainText)(value.correlationId, 128) &&
            (0, reportingIds_1.utf8ByteLength)(JSON.stringify(value)) <= exports.REPORT_JOB_NOTIFICATION_MAX_BYTES);
    }
    catch {
        return false;
    }
};
exports.isReportJobNotificationRequestedV1 = isReportJobNotificationRequestedV1;
const createReportJobNotificationRequestedV1 = (input) => {
    const message = {
        schemaVersion: 1,
        messageType: exports.REPORT_JOB_NOTIFICATION_MESSAGE_TYPE,
        companyId: input.companyId,
        jobId: input.jobId,
        artifactContentSha256: input.artifactContentSha256,
        correlationId: input.correlationId ?? input.jobId,
    };
    if (!(0, exports.isReportJobNotificationRequestedV1)(message))
        throw new Error('Invalid report notification request.');
    return message;
};
exports.createReportJobNotificationRequestedV1 = createReportJobNotificationRequestedV1;
/** Bounded for every valid company/job ID; JSON tuple separates identifiers without ambiguous concatenation. */
const buildReportJobNotificationMessageId = async (companyId, jobId) => {
    if (!(0, reportingIds_1.isReportJobCompanyId)(companyId) || !(0, reportJobIdentity_1.isReportJobId)(jobId))
        throw new Error('Invalid report notification identity.');
    return `report-notify:${await (0, reportingDigest_1.sha256Hex)(JSON.stringify([companyId, jobId]))}`;
};
exports.buildReportJobNotificationMessageId = buildReportJobNotificationMessageId;
const buildReportJobNotificationBrokerProperties = async (message) => {
    if (!(0, exports.isReportJobNotificationRequestedV1)(message))
        throw new Error('Invalid report notification request.');
    return {
        messageId: await (0, exports.buildReportJobNotificationMessageId)(message.companyId, message.jobId),
        correlationId: message.jobId,
        contentType: 'application/json',
        subject: exports.REPORT_JOB_NOTIFICATION_MESSAGE_TYPE,
    };
};
exports.buildReportJobNotificationBrokerProperties = buildReportJobNotificationBrokerProperties;
//# sourceMappingURL=reportJobNotifications.js.map