import type { CurrentStateReportJobSpecV1, ReportPeriodRuleV1, SdmReportJobSpecV1 } from '../reporting/jobs/reportJobSpec';

/** Explicit periods belong to API requests; schedules resolve a rule in their persisted timezone. */
export type ScheduledReportJobSpecV1 = CurrentStateReportJobSpecV1 | (Omit<SdmReportJobSpecV1, 'period'> & { period: ReportPeriodRuleV1 });
export type ReportGenerationScheduleTiming =
  | { triggerType: 'once'; localDateTime: string }
  | { triggerType: 'recurring'; cadence: 'daily'; localTime: string }
  | { triggerType: 'recurring'; cadence: 'weekly'; localTime: string; dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  | { triggerType: 'recurring'; cadence: 'monthly' | 'quarterly'; localTime: string; dayOfMonth: number | 'last' };

export interface ReportGenerationScheduleWriteRequest {
  definitionType: 'report-generation';
  name: string;
  timezone: string;
  timing: ReportGenerationScheduleTiming;
  report: ScheduledReportJobSpecV1;
  notificationPolicyId?: string;
  initialMode: 'active' | 'paused';
}

export type ReportGenerationScheduleCommand = { command: 'pause' | 'resume'; idempotencyKey: string };

export interface ReportGenerationScheduleProjection {
  scheduleId: string;
  definitionRevision: number;
  controlGeneration: number;
  etag: string;
  status: 'active' | 'paused' | 'completed';
  definition: ReportGenerationScheduleWriteRequest;
  nextOccurrenceAtUtc?: string;
  lastOccurrenceAtUtc?: string;
  /** Accepted means dispatch accepted, not generation or delivery succeeded. */
  lastOccurrenceOutcome?: 'accepted' | 'failed' | 'skipped';
  lastJobId?: string;
  createdAtUtc: string;
  createdBy: string;
  updatedAtUtc: string;
  updatedBy: string;
}

/** Kernel-to-adapter occurrence; provider/resource targets are deliberately absent for this family. */
export interface ScheduledReportGenerationV1 {
  schemaVersion: 1;
  definitionType: 'report-generation';
  companyId: string;
  scheduleId: string;
  definitionRevision: number;
  controlGeneration: number;
  occurrenceKey: string;
  scheduleRunId: string;
  dueAtUtc: string;
  report: ScheduledReportJobSpecV1;
  notificationPolicyId?: string;
  coalescedOccurrenceCount?: number;
  correlationId: string;
}
