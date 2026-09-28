/**
 * The `reports` queue message (core/specs/reporting/reporting-scheduler.md, "Queue message").
 *
 * The message is a pointer only: the worker reads everything else from the `reportjobs` row. Each region has its
 * own queue, table and worker, so the message carries no region.
 */
import { hasExactlyKeys, isBoundedPlainText, isPlainRecord, isReportJobCompanyId } from '../shared/reportingIds';
import { buildReportJobMessageId, isReportJobId } from './reportJobIdentity';

export const REPORT_JOB_REQUESTED_MESSAGE_TYPE = 'report-job.requested';
/** Upper bound for the serialised message body. */
export const REPORT_JOB_REQUESTED_MAX_BYTES = 4 * 1024;

export interface ReportJobRequestedV1 {
  schemaVersion: 1;
  messageType: 'report-job.requested';
  /** The single company the report is for; the row's PartitionKey. */
  companyId: string;
  /** The row's RowKey. */
  jobId: string;
  correlationId: string;
}

const MESSAGE_KEYS = ['schemaVersion', 'messageType', 'companyId', 'jobId', 'correlationId'] as const;

/** Strict guard: exact keys, valid identifiers, bounded size. Never throws. */
export const isReportJobRequestedV1 = (value: unknown): value is ReportJobRequestedV1 => {
  try {
    if (!isPlainRecord(value) || !hasExactlyKeys(value, MESSAGE_KEYS)) return false;
    return (
      value.schemaVersion === 1 &&
      value.messageType === REPORT_JOB_REQUESTED_MESSAGE_TYPE &&
      isReportJobCompanyId(value.companyId) &&
      isReportJobId(value.jobId) &&
      isBoundedPlainText(value.correlationId, 128) &&
      JSON.stringify(value).length <= REPORT_JOB_REQUESTED_MAX_BYTES
    );
  } catch {
    return false;
  }
};

export interface CreateReportJobRequestedInput {
  companyId: string;
  jobId: string;
  /** Default: the job ID. */
  correlationId?: string;
}

export const createReportJobRequestedV1 = ({ companyId, jobId, correlationId }: CreateReportJobRequestedInput): ReportJobRequestedV1 => {
  const message: ReportJobRequestedV1 = {
    schemaVersion: 1,
    messageType: REPORT_JOB_REQUESTED_MESSAGE_TYPE,
    companyId,
    jobId,
    correlationId: correlationId ?? jobId,
  };
  if (!isReportJobRequestedV1(message)) throw new Error('Invalid report job requested message.');
  return message;
};

export interface ReportJobBrokerProperties {
  messageId: string;
  correlationId: string;
  contentType: 'application/json';
  subject: 'report-job.requested';
}

/** Service Bus properties for a `ReportJobRequestedV1` send: the shared MessageId drives duplicate detection. */
export const buildReportJobRequestedBrokerProperties = (message: ReportJobRequestedV1): ReportJobBrokerProperties => ({
  messageId: buildReportJobMessageId(message.companyId, message.jobId),
  correlationId: message.jobId,
  contentType: 'application/json',
  subject: REPORT_JOB_REQUESTED_MESSAGE_TYPE,
});
