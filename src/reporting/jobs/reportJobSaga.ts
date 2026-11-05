import { hasExactlyKeys, isIsoUtcTimestamp, isPlainRecord, isReportJobCompanyId } from '../shared/reportingIds';
import { SHA256_HEX_PATTERN } from '../shared/reportingDigest';
import { isReportJobId } from './reportJobIdentity';
import {
  isReportJobFailureCode,
  isReportJobNotificationStatus,
  isReportJobStatus,
  type ReportJobFailureCode,
  type ReportJobNotificationStatus,
  type ReportJobStatus,
} from './reportJobStatus';

export const REPORT_ARTIFACT_RETENTION_DAYS = 30;
export const REPORT_ARTIFACT_RETENTION_MS = REPORT_ARTIFACT_RETENTION_DAYS * 86_400_000;
export const REPORT_SAGA_PHASES = ['queued', 'source-load', 'render', 'artifact-persist', 'notification', 'complete', 'retention'] as const;
export type ReportSagaPhase = (typeof REPORT_SAGA_PHASES)[number];
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
] as const;
export type ReportProgressStatus = (typeof REPORT_PROGRESS_STATUSES)[number];
export interface ReportSagaStepV1 {
  phase: ReportSagaPhase;
  status: 'running' | 'completed' | 'failed';
  startedAtUtc: string;
  updatedAtUtc: string;
}
/** Public lifecycle summary. No storage addresses, lease owners, recipients or request JSON. */
export interface ReportJobProgressV1 {
  status: ReportProgressStatus;
  phase: ReportSagaPhase;
  updatedAtUtc: string;
  artifactExpiresAtUtc?: string;
  artifactExpiredAtUtc?: string;
  nextAttemptAtUtc?: string;
  deliveryFailureCode?: ReportJobFailureCode;
  steps: ReportSagaStepV1[];
}
/** Private per-run workflow file. Admission and execution leases remain fenced by the job Table ETag. */
export interface ReportSagaV1 {
  version: 1;
  companyId: string;
  jobId: string;
  requestSha256: string;
  rowEtag: string;
  rowVersion: string;
  status: ReportJobStatus;
  notificationStatus: ReportJobNotificationStatus;
  generationAttemptCount: number;
  notificationAttemptCount: number;
  updatedAtUtc: string;
  leaseExpiresAtUtc?: string;
  nextAttemptAtUtc?: string;
  artifactExpiresAtUtc?: string;
  artifactExpiredAtUtc?: string;
  retentionState?: 'deleting' | 'expired';
  artifactAvailableAtUtc?: string;
  artifactContentSha256?: string;
  steps: ReportSagaStepV1[];
}
const stepsValid = (value: unknown): value is ReportSagaStepV1[] =>
  Array.isArray(value) &&
  value.length <= REPORT_SAGA_PHASES.length &&
  new Set(value.map(step => (isPlainRecord(step) ? step.phase : undefined))).size === value.length &&
  value.every(
    step =>
      isPlainRecord(step) &&
      hasExactlyKeys(step, ['phase', 'status', 'startedAtUtc', 'updatedAtUtc']) &&
      REPORT_SAGA_PHASES.includes(step.phase as ReportSagaPhase) &&
      ['running', 'completed', 'failed'].includes(String(step.status)) &&
      isIsoUtcTimestamp(step.startedAtUtc) &&
      isIsoUtcTimestamp(step.updatedAtUtc) &&
      step.updatedAtUtc >= step.startedAtUtc
  );
export const isReportJobProgressV1 = (value: unknown): value is ReportJobProgressV1 =>
  isPlainRecord(value) &&
  hasExactlyKeys(
    value,
    ['status', 'phase', 'updatedAtUtc', 'steps'],
    ['artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'nextAttemptAtUtc', 'deliveryFailureCode']
  ) &&
  (value.deliveryFailureCode === undefined || isReportJobFailureCode(value.deliveryFailureCode)) &&
  REPORT_PROGRESS_STATUSES.includes(value.status as ReportProgressStatus) &&
  REPORT_SAGA_PHASES.includes(value.phase as ReportSagaPhase) &&
  isIsoUtcTimestamp(value.updatedAtUtc) &&
  stepsValid(value.steps) &&
  ['artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'nextAttemptAtUtc'].every(key => value[key] === undefined || isIsoUtcTimestamp(value[key]));
export const isReportSagaV1 = (value: unknown): value is ReportSagaV1 => {
  if (
    !isPlainRecord(value) ||
    !hasExactlyKeys(
      value,
      [
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
      ],
      [
        'leaseExpiresAtUtc',
        'nextAttemptAtUtc',
        'artifactExpiresAtUtc',
        'artifactExpiredAtUtc',
        'retentionState',
        'artifactAvailableAtUtc',
        'artifactContentSha256',
      ]
    )
  )
    return false;
  return (
    value.version === 1 &&
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
    ['leaseExpiresAtUtc', 'nextAttemptAtUtc', 'artifactExpiresAtUtc', 'artifactExpiredAtUtc', 'artifactAvailableAtUtc'].every(
      key => value[key] === undefined || isIsoUtcTimestamp(value[key])
    ) &&
    (value.retentionState === undefined || value.retentionState === 'deleting' || value.retentionState === 'expired') &&
    (value.retentionState !== 'expired' || isIsoUtcTimestamp(value.artifactExpiredAtUtc))
  );
};
