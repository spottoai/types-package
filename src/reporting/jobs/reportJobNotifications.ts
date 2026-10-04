import { sha256Hex, SHA256_HEX_PATTERN } from '../shared/reportingDigest';
import { hasExactlyKeys, isBoundedPlainText, isPlainRecord, isReportJobCompanyId, utf8ByteLength } from '../shared/reportingIds';
import { isReportJobId } from './reportJobIdentity';

export const REPORT_JOB_NOTIFICATION_MESSAGE_TYPE = 'report-job.notification-requested';
export const REPORT_JOB_NOTIFICATION_MAX_BYTES = 4 * 1024;
export const REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS = 32;
export const REPORT_JOB_NOTIFICATION_CHANNELS = ['email', 'slack', 'teams', 'webhook'] as const;
export type ReportJobNotificationChannel = (typeof REPORT_JOB_NOTIFICATION_CHANNELS)[number];

/** Safe public aggregates only. A grouped email counts its configured destinations, not provider calls. */
export interface ReportJobNotificationDestinationCountV1 {
  total: number;
  delivered: number;
  failed: number;
}
export type ReportJobNotificationDestinationCountsV1 = Partial<Record<ReportJobNotificationChannel, ReportJobNotificationDestinationCountV1>>;

export const isReportJobNotificationDestinationCountsV1 = (value: unknown): value is ReportJobNotificationDestinationCountsV1 => {
  try {
    if (!isPlainRecord(value) || !hasExactlyKeys(value, [], REPORT_JOB_NOTIFICATION_CHANNELS)) return false;
    let total = 0;
    for (const counts of Object.values(value)) {
      if (!isPlainRecord(counts) || !hasExactlyKeys(counts, ['total', 'delivered', 'failed'])) return false;
      if (
        ![counts.total, counts.delivered, counts.failed].every(
          n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS
        )
      )
        return false;
      const c = counts as unknown as ReportJobNotificationDestinationCountV1;
      if (c.total === 0 || c.delivered + c.failed > c.total) return false;
      total += c.total;
    }
    return total > 0 && total <= REPORT_JOB_NOTIFICATION_MAX_DESTINATIONS;
  } catch {
    return false;
  }
};

export const parseReportJobNotificationDestinationCountsV1 = (json: unknown): ReportJobNotificationDestinationCountsV1 | null => {
  try {
    if (typeof json !== 'string' || utf8ByteLength(json) > REPORT_JOB_NOTIFICATION_MAX_BYTES) return null;
    const value: unknown = JSON.parse(json);
    return isReportJobNotificationDestinationCountsV1(value) ? value : null;
  } catch {
    return null;
  }
};

export interface ReportJobNotificationRequestedV1 {
  schemaVersion: 1;
  messageType: 'report-job.notification-requested';
  companyId: string;
  jobId: string;
  artifactContentSha256: string;
  correlationId: string;
}

export const isReportJobNotificationRequestedV1 = (value: unknown): value is ReportJobNotificationRequestedV1 => {
  try {
    return (
      isPlainRecord(value) &&
      hasExactlyKeys(value, ['schemaVersion', 'messageType', 'companyId', 'jobId', 'artifactContentSha256', 'correlationId']) &&
      value.schemaVersion === 1 &&
      value.messageType === REPORT_JOB_NOTIFICATION_MESSAGE_TYPE &&
      isReportJobCompanyId(value.companyId) &&
      isReportJobId(value.jobId) &&
      typeof value.artifactContentSha256 === 'string' &&
      SHA256_HEX_PATTERN.test(value.artifactContentSha256) &&
      isBoundedPlainText(value.correlationId, 128) &&
      utf8ByteLength(JSON.stringify(value)) <= REPORT_JOB_NOTIFICATION_MAX_BYTES
    );
  } catch {
    return false;
  }
};

export const createReportJobNotificationRequestedV1 = (input: {
  companyId: string;
  jobId: string;
  artifactContentSha256: string;
  correlationId?: string;
}): ReportJobNotificationRequestedV1 => {
  const message: ReportJobNotificationRequestedV1 = {
    schemaVersion: 1,
    messageType: REPORT_JOB_NOTIFICATION_MESSAGE_TYPE,
    companyId: input.companyId,
    jobId: input.jobId,
    artifactContentSha256: input.artifactContentSha256,
    correlationId: input.correlationId ?? input.jobId,
  };
  if (!isReportJobNotificationRequestedV1(message)) throw new Error('Invalid report notification request.');
  return message;
};

/** Bounded for every valid company/job ID; JSON tuple separates identifiers without ambiguous concatenation. */
export const buildReportJobNotificationMessageId = async (companyId: string, jobId: string): Promise<string> => {
  if (!isReportJobCompanyId(companyId) || !isReportJobId(jobId)) throw new Error('Invalid report notification identity.');
  return `report-notify:${await sha256Hex(JSON.stringify([companyId, jobId]))}`;
};

export const buildReportJobNotificationBrokerProperties = async (
  message: ReportJobNotificationRequestedV1
): Promise<{
  messageId: string;
  correlationId: string;
  contentType: 'application/json';
  subject: 'report-job.notification-requested';
}> => {
  if (!isReportJobNotificationRequestedV1(message)) throw new Error('Invalid report notification request.');
  return {
    messageId: await buildReportJobNotificationMessageId(message.companyId, message.jobId),
    correlationId: message.jobId,
    contentType: 'application/json',
    subject: REPORT_JOB_NOTIFICATION_MESSAGE_TYPE,
  };
};
