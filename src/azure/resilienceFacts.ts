/**
 * Resilience facts: the small per-resource property reads the resilience story needs that no other collection
 * carries — storage blob-service data-protection settings and lifecycle management, Azure SQL database backup
 * retention and failover groups. Collected in the reliability component beside the data-protection posture and
 * published as `azure-portal/subscriptions/{id}/resilience-facts.json`. Consumed by the cloud-engine
 * `ProtectionProfileBuilder` (`data-protection:<selector>` capability sources) and available to the resilience story page.
 *
 * Spec: `Specs/reporting/utilization-stories-types-package.md` (parent: core `specs/reporting/utilization-stories.md`).
 * Additive: consumers tolerate unknown fields. Field semantics: `undefined` = not read (the request failed, was not
 * applicable or was skipped) and resolves to an `unknown` capability; `null` = read and absent/disabled. A failed
 * read must never be presented as "disabled".
 */
export const RESILIENCE_FACTS_SCHEMA_VERSION = 1 as const;
export const RESILIENCE_FACTS_SOURCE = 'AzureResilienceFacts' as const;
export const RESILIENCE_FACTS_PORTAL_FILE = 'resilience-facts.json' as const;
export const RESILIENCE_FACTS_RAW_FILE = 'data-protection/resilience-facts.json.gz' as const;

export type ResilienceFactsStatus = 'collected' | 'partial' | 'failed' | 'not-applicable';

export interface RetentionPolicyFacts {
  enabled: boolean;
  days?: number | null;
}

export interface StorageAccountResilienceFacts {
  blobSoftDelete?: RetentionPolicyFacts | null;
  containerSoftDelete?: RetentionPolicyFacts | null;
  versioning?: boolean | null;
  changeFeed?: RetentionPolicyFacts | null;
  pointInTimeRestore?: RetentionPolicyFacts | null;
  /** Lifecycle management policy (`managementPolicies/default`); `present: false` when the account has none. Not read in v1. */
  managementPolicy?: { present: boolean; ruleCount?: number } | null;
  /** Account kind; `FileStorage` accounts have no blob service and are reported not applicable. */
  kind?: string | null;
}

export interface SqlDatabaseResilienceFacts {
  /** Point-in-time restore retention (`backupShortTermRetentionPolicies/default`); undefined when the read failed. */
  shortTermRetentionDays?: number | null;
  diffBackupIntervalHours?: number | null;
  /** Long-term retention (`backupLongTermRetentionPolicies/default`); `enabled` when any of the ISO 8601 periods is set. */
  longTermRetention?: {
    enabled: boolean;
    weekly?: string | null;
    monthly?: string | null;
    yearly?: string | null;
    weekOfYear?: number | null;
  } | null;
  /**
   * Failover group membership resolved from the server's failover groups: `null` = the server's groups were read and
   * the database is not a member; undefined = the listing failed or was skipped.
   */
  failoverGroup?: { id: string; name: string; partnerServers: string[]; readWriteFailoverPolicy?: string | null; role?: string | null } | null;
  backupStorageRedundancy?: string | null;
}

export interface ResilienceFactsItem {
  resourceId: string;
  /** Lowercase ARM type, e.g. "microsoft.storage/storageaccounts". */
  resourceType: string;
  status: ResilienceFactsStatus;
  observedAt: string;
  /** Management requests spent on this resource. */
  requestCount: number;
  errors?: string[];
  storage?: StorageAccountResilienceFacts;
  sql?: SqlDatabaseResilienceFacts;
}

export interface ResilienceFactsSummary {
  storageAccounts: number;
  sqlDatabases: number;
  sqlServers: number;
  collected: number;
  partial: number;
  failed: number;
  /** Items skipped as not applicable (FileStorage accounts, DataWarehouse pools). */
  notApplicable?: number;
  requestCount: number;
}

export interface ResilienceFactsIssue {
  severity: 'warning' | 'error';
  resourceId?: string;
  code: string;
  message: string;
}

export interface ResilienceFactsProjection {
  schemaVersion: typeof RESILIENCE_FACTS_SCHEMA_VERSION;
  source: typeof RESILIENCE_FACTS_SOURCE;
  subscriptionId: string;
  tenantId?: string;
  generatedAt: string;
  summary: ResilienceFactsSummary;
  items: ResilienceFactsItem[];
  issues: ResilienceFactsIssue[];
}
