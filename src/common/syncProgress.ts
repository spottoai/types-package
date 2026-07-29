/** Public lifecycle states shared by provider sync progress responses. */
export type SyncProgressStatus = 'idle' | 'processing' | 'completed' | 'error';

/** Public lifecycle states shared by provider sync progress stages. */
export type SyncProgressStepStatus = 'idle' | 'pending' | 'queued' | 'inProgress' | 'completed' | 'error';

/** Public lifecycle states shared by nested provider sync progress stages. */
export type SyncProgressSubStepStatus = SyncProgressStepStatus | 'skipped';

export type SyncProgressIssueType = 'capabilityMissing' | 'billingExport' | 'partialData';
export type SyncProgressIssueScope = 'cloudAccount' | 'subscription' | 'component';
export type SyncProgressIssueMetadataValue = string | number | boolean | undefined;

/** Structured non-fatal issue shared by Azure and AWS sync progress. */
export interface SyncProgressIssue {
  type: SyncProgressIssueType;
  scope: SyncProgressIssueScope;
  capabilityKey?: string;
  capabilityDisplayName?: string;
  capabilityDescription?: string;
  requiredRoles?: string[];
  message: string;
  code?: string;
  title?: string;
  remediation?: string;
  sourceSelected?: 'export' | 'query';
  fallbackUsed?: boolean;
  degraded?: boolean;
  metadata?: Record<string, SyncProgressIssueMetadataValue>;
}
