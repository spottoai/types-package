"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportJobRequestedBrokerProperties = exports.createReportJobRequestedV1 = exports.isReportJobRequestedV1 = exports.REPORT_JOB_REQUESTED_MAX_BYTES = exports.REPORT_JOB_REQUESTED_MESSAGE_TYPE = void 0;
/**
 * The `reports` queue message (core/specs/reporting/reporting-scheduler.md, "Queue message").
 *
 * The message is a pointer only: the worker reads everything else from the `reportjobs` row. Each region has its
 * own queue, table and worker, so the message carries no region.
 */
const reportingIds_1 = require("../shared/reportingIds");
const reportJobIdentity_1 = require("./reportJobIdentity");
exports.REPORT_JOB_REQUESTED_MESSAGE_TYPE = 'report-job.requested';
/** Upper bound for the serialised message body. */
exports.REPORT_JOB_REQUESTED_MAX_BYTES = 4 * 1024;
const MESSAGE_KEYS = ['schemaVersion', 'messageType', 'companyId', 'jobId', 'correlationId'];
/** Strict guard: exact keys, valid identifiers, bounded size. Never throws. */
const isReportJobRequestedV1 = (value) => {
    try {
        if (!(0, reportingIds_1.isPlainRecord)(value) || !(0, reportingIds_1.hasExactlyKeys)(value, MESSAGE_KEYS))
            return false;
        return (value.schemaVersion === 1 &&
            value.messageType === exports.REPORT_JOB_REQUESTED_MESSAGE_TYPE &&
            (0, reportingIds_1.isReportJobCompanyId)(value.companyId) &&
            (0, reportJobIdentity_1.isReportJobId)(value.jobId) &&
            (0, reportingIds_1.isBoundedPlainText)(value.correlationId, 128) &&
            JSON.stringify(value).length <= exports.REPORT_JOB_REQUESTED_MAX_BYTES);
    }
    catch {
        return false;
    }
};
exports.isReportJobRequestedV1 = isReportJobRequestedV1;
const createReportJobRequestedV1 = ({ companyId, jobId, correlationId }) => {
    const message = {
        schemaVersion: 1,
        messageType: exports.REPORT_JOB_REQUESTED_MESSAGE_TYPE,
        companyId,
        jobId,
        correlationId: correlationId ?? jobId,
    };
    if (!(0, exports.isReportJobRequestedV1)(message))
        throw new Error('Invalid report job requested message.');
    return message;
};
exports.createReportJobRequestedV1 = createReportJobRequestedV1;
/** Service Bus properties for a `ReportJobRequestedV1` send: the shared MessageId drives duplicate detection. */
const buildReportJobRequestedBrokerProperties = (message) => ({
    messageId: (0, reportJobIdentity_1.buildReportJobMessageId)(message.companyId, message.jobId),
    correlationId: message.jobId,
    contentType: 'application/json',
    subject: exports.REPORT_JOB_REQUESTED_MESSAGE_TYPE,
});
exports.buildReportJobRequestedBrokerProperties = buildReportJobRequestedBrokerProperties;
//# sourceMappingURL=reportJobMessages.js.map