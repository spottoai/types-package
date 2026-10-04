import { sha256Hex } from '../shared/reportingDigest';
import {
  hasExactlyKeys,
  isBoundedPlainText,
  isIsoUtcTimestamp,
  isPlainRecord,
  isReportEntityId,
  isReportJobCompanyId,
  utf8ByteLength,
} from '../shared/reportingIds';
import { isReportFileName } from '../shared/reportingPaths';
import { isReportJobId, parseReportJobId } from './reportJobIdentity';
import {
  isReportJobNotificationDestinationCountsV1,
  parseReportJobNotificationDestinationCountsV1,
  type ReportJobNotificationDestinationCountsV1,
} from './reportJobNotifications';
import { parseReportJobRowV1, type ReportJobRowV1, type ReportJobTrigger } from './reportJobRow';
import {
  isReportJobReportType,
  isReportJobScopeV1,
  isReportJobPeriodV1,
  parseReportJobSpecV1,
  serializeReportJobSpecV1,
  type ReportJobPeriodV1,
  type ReportJobReportType,
  type ReportJobScopeV1,
  type ReportJobSpecV1,
} from './reportJobSpec';
import {
  isReportJobFailureCode,
  isReportJobFailureStage,
  isReportJobNotificationStatus,
  isReportJobStatus,
  REPORT_JOB_FAILURE_STAGE_BY_CODE,
  type ReportJobFailureCode,
  type ReportJobFailureStage,
  type ReportJobNotificationStatus,
  type ReportJobStatus,
} from './reportJobStatus';

export const REPORT_JOB_API_GENERATION_LIMIT = 5;
export const REPORT_JOB_API_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
export const REPORT_JOB_LIST_MAX_RESULTS = 100;

export interface ReportJobCreateRequestV1 {
  schemaVersion: 1;
  report: ReportJobSpecV1;
  notificationPolicyId?: string;
}

export const parseReportJobCreateRequestV1 = (value: unknown): { ok: true; value: ReportJobCreateRequestV1 } | { ok: false; errors: string[] } => {
  try {
    if (
      !isPlainRecord(value) ||
      !hasExactlyKeys(value, ['schemaVersion', 'report'], ['notificationPolicyId']) ||
      value.schemaVersion !== 1 ||
      (value.notificationPolicyId !== undefined && !isReportEntityId(value.notificationPolicyId))
    )
      return { ok: false, errors: ['request: invalid fields'] };
    const report = parseReportJobSpecV1(value.report);
    if (!report.ok) return report;
    return {
      ok: true,
      value: {
        schemaVersion: 1,
        report: report.value,
        ...(value.notificationPolicyId === undefined ? {} : { notificationPolicyId: value.notificationPolicyId }),
      },
    };
  } catch {
    return { ok: false, errors: ['request: unreadable'] };
  }
};

export const isReportJobCreateRequestV1 = (value: unknown): value is ReportJobCreateRequestV1 => parseReportJobCreateRequestV1(value).ok;

/** Caller/company binding and atomic reservation are repository responsibilities, not part of this hash. */
export const buildReportJobAdmissionFingerprintV1 = async (request: ReportJobCreateRequestV1): Promise<string> => {
  const parsed = parseReportJobCreateRequestV1(request);
  if (!parsed.ok) throw new Error('Invalid report job create request.');
  return sha256Hex(JSON.stringify([serializeReportJobSpecV1(parsed.value.report), parsed.value.notificationPolicyId ?? null]));
};

export const isReportJobIdempotencyKey = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,199}$/.test(value);

/** A generated job awaiting notification has released its generation slot. Never substitutes for atomic admission. */
export const consumesReportJobApiGenerationSlot = (
  row: Pick<ReportJobRowV1, 'trigger' | 'status' | 'notificationStatus' | 'notificationPolicyId'>
): boolean =>
  row.trigger === 'api' &&
  (['accepted', 'running', 'source-ready'].includes(row.status) ||
    (row.status === 'generated' && row.notificationPolicyId === undefined && row.notificationStatus === 'none'));

const statusPath = (companyId: string, jobId: string): string => `/companies/${companyId}/reporting/jobs/${jobId}`;
const downloadPath = (companyId: string, jobId: string): string => `/companies/${companyId}/reporting/reports/${jobId}`;

export interface ReportJobCreateResponseV1 {
  jobId: string;
  reportId: string;
  fileName: string;
  status: ReportJobStatus;
  statusUrl: string;
}

export const isReportJobCreateResponseV1 = (value: unknown): value is ReportJobCreateResponseV1 => {
  if (
    !isPlainRecord(value) ||
    !hasExactlyKeys(value, ['jobId', 'reportId', 'fileName', 'status', 'statusUrl']) ||
    !isReportJobId(value.jobId) ||
    value.reportId !== value.jobId ||
    !isReportFileName(value.fileName) ||
    !isReportJobStatus(value.status) ||
    typeof value.statusUrl !== 'string'
  )
    return false;
  const parts = value.statusUrl.split('/');
  return parts.length === 6 && isReportJobCompanyId(parts[2]) && value.statusUrl === statusPath(parts[2], value.jobId);
};

export interface ReportJobListQueryV1 {
  pageSize?: number;
  cursor?: string;
  status?: ReportJobStatus;
  trigger?: ReportJobTrigger;
  scheduleId?: string;
  reportType?: ReportJobReportType;
}

export const isReportJobListQueryV1 = (value: unknown): value is ReportJobListQueryV1 =>
  isPlainRecord(value) &&
  hasExactlyKeys(value, [], ['pageSize', 'cursor', 'status', 'trigger', 'scheduleId', 'reportType']) &&
  (value.pageSize === undefined ||
    (typeof value.pageSize === 'number' &&
      Number.isInteger(value.pageSize) &&
      value.pageSize >= 1 &&
      value.pageSize <= REPORT_JOB_LIST_MAX_RESULTS)) &&
  (value.cursor === undefined || isBoundedPlainText(value.cursor, 2000)) &&
  (value.status === undefined || isReportJobStatus(value.status)) &&
  (value.trigger === undefined || value.trigger === 'api' || value.trigger === 'schedule') &&
  (value.scheduleId === undefined || isReportEntityId(value.scheduleId)) &&
  (value.reportType === undefined || isReportJobReportType(value.reportType));

/** Deliberate whitelist: no request JSON, configuration, worker lease, paths or recipient details. */
export interface ReportJobProjectionV1 {
  schemaVersion: 1;
  companyId: string;
  jobId: string;
  reportId: string;
  reportType: ReportJobReportType;
  trigger: ReportJobTrigger;
  scheduleId?: string;
  definitionRevision?: number;
  scheduledForUtc?: string;
  coalescedOccurrenceCount?: number;
  requestedAtUtc: string;
  scope: ReportJobScopeV1;
  period?: ReportJobPeriodV1;
  status: ReportJobStatus;
  attemptCount: number;
  startedAtUtc?: string;
  sourceObservedAtUtc?: string;
  generatedAtUtc?: string;
  completedAtUtc?: string;
  failureStage?: ReportJobFailureStage;
  failureCode?: ReportJobFailureCode;
  fileName: string;
  artifactBytes?: number;
  notificationStatus: ReportJobNotificationStatus;
  notificationAttemptCount?: number;
  notificationDestinationCounts?: ReportJobNotificationDestinationCountsV1;
  notificationCompletedAtUtc?: string;
  downloadUrl?: string;
}

const projectionRequired = [
  'schemaVersion',
  'companyId',
  'jobId',
  'reportId',
  'reportType',
  'trigger',
  'requestedAtUtc',
  'scope',
  'status',
  'attemptCount',
  'fileName',
  'notificationStatus',
];
const projectionOptional = [
  'scheduleId',
  'definitionRevision',
  'scheduledForUtc',
  'coalescedOccurrenceCount',
  'period',
  'startedAtUtc',
  'sourceObservedAtUtc',
  'generatedAtUtc',
  'completedAtUtc',
  'failureStage',
  'failureCode',
  'artifactBytes',
  'notificationAttemptCount',
  'notificationDestinationCounts',
  'notificationCompletedAtUtc',
  'downloadUrl',
] as const;
const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 2_147_483_647;

export const isReportJobProjectionV1 = (value: unknown): value is ReportJobProjectionV1 => {
  try {
    if (
      !isPlainRecord(value) ||
      !hasExactlyKeys(value, projectionRequired, projectionOptional) ||
      value.schemaVersion !== 1 ||
      !isReportJobCompanyId(value.companyId) ||
      !isReportJobId(value.jobId) ||
      value.reportId !== value.jobId ||
      !isReportJobReportType(value.reportType) ||
      !isReportJobStatus(value.status) ||
      !isCount(value.attemptCount) ||
      !isReportFileName(value.fileName) ||
      !isReportJobNotificationStatus(value.notificationStatus) ||
      !isIsoUtcTimestamp(value.requestedAtUtc)
    )
      return false;
    if (!isReportJobScopeV1(value.scope)) return false;
    if (value.reportType === 'sdm' ? !isReportJobPeriodV1(value.period) : value.period !== undefined) return false;
    const identity = parseReportJobId(value.jobId);
    if (
      !identity ||
      identity.reportType !== value.reportType ||
      identity.instant.toISOString() !== (value.trigger === 'schedule' ? value.scheduledForUtc : value.requestedAtUtc)
    )
      return false;
    if (value.status === 'accepted' && value.attemptCount !== 0) return false;
    if (
      ['source-ready', 'generated', 'completed', 'completed-with-notification-errors'].includes(value.status) &&
      !isIsoUtcTimestamp(value.sourceObservedAtUtc)
    )
      return false;
    if (
      ['generated', 'completed', 'completed-with-notification-errors'].includes(value.status) &&
      (!isIsoUtcTimestamp(value.generatedAtUtc) || !isCount(value.artifactBytes) || value.artifactBytes < 1)
    )
      return false;
    if (value.trigger === 'schedule') {
      if (value.reportType === 'sdm' && isReportJobPeriodV1(value.period) && value.period.kind === 'explicit') return false;
      if (
        !isReportEntityId(value.scheduleId) ||
        !isCount(value.definitionRevision) ||
        value.definitionRevision < 1 ||
        !isIsoUtcTimestamp(value.scheduledForUtc) ||
        (value.coalescedOccurrenceCount !== undefined && (!isCount(value.coalescedOccurrenceCount) || value.coalescedOccurrenceCount < 1))
      )
        return false;
    } else if (
      value.trigger !== 'api' ||
      ['scheduleId', 'definitionRevision', 'scheduledForUtc', 'coalescedOccurrenceCount'].some(key => value[key] !== undefined)
    )
      return false;
    for (const key of ['startedAtUtc', 'sourceObservedAtUtc', 'generatedAtUtc', 'completedAtUtc', 'notificationCompletedAtUtc'])
      if (value[key] !== undefined && !isIsoUtcTimestamp(value[key])) return false;
    if (value.status === 'failed') {
      if (!isReportJobFailureCode(value.failureCode) || !isReportJobFailureStage(value.failureStage)) return false;
      const stage = REPORT_JOB_FAILURE_STAGE_BY_CODE[value.failureCode];
      if (stage !== null && stage !== value.failureStage) return false;
    } else if (value.failureCode !== undefined || value.failureStage !== undefined) return false;
    if (value.artifactBytes !== undefined && (!isCount(value.artifactBytes) || value.artifactBytes < 1)) return false;
    if (value.notificationAttemptCount !== undefined && !isCount(value.notificationAttemptCount)) return false;
    if (value.notificationDestinationCounts !== undefined && !isReportJobNotificationDestinationCountsV1(value.notificationDestinationCounts))
      return false;
    const completed = value.status === 'completed' || value.status === 'completed-with-notification-errors';
    if (
      completed &&
      (!isIsoUtcTimestamp(value.completedAtUtc) ||
        !isCount(value.artifactBytes) ||
        value.artifactBytes < 1 ||
        !isIsoUtcTimestamp(value.generatedAtUtc))
    )
      return false;
    return value.downloadUrl === undefined || (completed && value.downloadUrl === downloadPath(value.companyId, value.jobId));
  } catch {
    return false;
  }
};

export const buildReportJobProjectionV1 = async (entity: unknown): Promise<ReportJobProjectionV1> => {
  const parsed = await parseReportJobRowV1(entity);
  if (!parsed.ok) throw new Error('Invalid report job row.');
  const row = parsed.row;
  const projection: ReportJobProjectionV1 = {
    schemaVersion: 1,
    companyId: row.companyId,
    jobId: row.jobId,
    reportId: row.jobId,
    reportType: row.reportType,
    trigger: row.trigger,
    requestedAtUtc: row.requestedAtUtc,
    scope: parsed.spec.scope,
    ...(parsed.spec.reportType === 'sdm' ? { period: parsed.spec.period } : {}),
    status: row.status,
    attemptCount: row.attemptCount,
    fileName: row.fileName,
    notificationStatus: row.notificationStatus,
  };
  for (const key of projectionOptional) {
    if (key === 'period' || key === 'downloadUrl' || key === 'notificationDestinationCounts') continue;
    const value = row[key];
    if (value !== undefined) Object.assign(projection, { [key]: value });
  }
  if (row.notificationDestinationCounts !== undefined)
    projection.notificationDestinationCounts = parseReportJobNotificationDestinationCountsV1(row.notificationDestinationCounts) ?? undefined;
  if (row.status === 'completed' || row.status === 'completed-with-notification-errors')
    projection.downloadUrl = downloadPath(row.companyId, row.jobId);
  if (!isReportJobProjectionV1(projection)) throw new Error('Invalid report job projection.');
  return projection;
};

export const buildReportJobCreateResponseV1 = async (entity: unknown): Promise<ReportJobCreateResponseV1> => {
  const parsed = await parseReportJobRowV1(entity);
  if (!parsed.ok) throw new Error('Invalid report job row.');
  const row = parsed.row;
  return { jobId: row.jobId, reportId: row.jobId, fileName: row.fileName, status: row.status, statusUrl: statusPath(row.companyId, row.jobId) };
};

export interface ReportJobListResponseV1 {
  results: ReportJobProjectionV1[];
  continuation?: { cursor: string };
}

export const isReportJobListResponseV1 = (value: unknown): value is ReportJobListResponseV1 => {
  try {
    return (
      isPlainRecord(value) &&
      hasExactlyKeys(value, ['results'], ['continuation']) &&
      Array.isArray(value.results) &&
      value.results.length <= REPORT_JOB_LIST_MAX_RESULTS &&
      value.results.every(isReportJobProjectionV1) &&
      utf8ByteLength(JSON.stringify(value)) <= 1024 * 1024 &&
      (value.continuation === undefined ||
        (isPlainRecord(value.continuation) && hasExactlyKeys(value.continuation, ['cursor']) && isBoundedPlainText(value.continuation.cursor, 2000)))
    );
  } catch {
    return false;
  }
};
