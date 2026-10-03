import type { SecureScoreEvidence } from '../azure/secureScore';
import type { ArtifactProvider, ArtifactSourceGenerationStatus } from './artifactGeneration';

export type { SecureScoreEvidence, SecureScoreEvidenceStatus } from '../azure/secureScore';

/** Native security finding producer; threat/vulnerability findings never affect the posture score. */
export type SecurityFindingSource = 'defender-for-cloud' | 'security-hub' | 'guardduty' | 'inspector';
export type SecurityScoreSource = 'defender-for-cloud' | 'security-hub-cspm';
export type SecurityPostureStatus = ArtifactSourceGenerationStatus;
export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational' | 'unknown';
export type SecurityControlStatus = 'passed' | 'failed' | 'unknown' | 'no-data' | 'disabled';

/** Counts of unique enabled controls across the exact covered account/Region set. */
export interface SecurityControlCounts {
  passed: number;
  failed: number;
  unknown: number;
  /** Enabled controls with no evaluated evidence; excluded from the denominator. */
  noData: number;
  /** Controls disabled in every covered scope; excluded from the denominator. */
  disabled: number;
}

/** One planned collection unit. Unavailable/partial/stale units retain explicit reasons. */
export interface SecurityPostureCoverageScope {
  accountId: string;
  region?: string;
  source: SecurityFindingSource | SecurityScoreSource;
  status: SecurityPostureStatus;
  reason?: string;
  observedAt?: string;
  lastSuccessfulAt?: string;
}

export interface SecurityPostureCoverage {
  /** Coverage applies to the configured account/Region set, not all provider accounts/Regions. */
  status: SecurityPostureStatus;
  scopes: SecurityPostureCoverageScope[];
  reason?: string;
}

export interface SecurityPostureResource {
  id: string;
  providerName: ArtifactProvider;
  accountId: string;
  region?: string;
  name?: string;
  resourceType?: string;
  arn?: string;
}

export interface SecurityPostureStandard {
  id: string;
  name: string;
  version?: string;
  accountId: string;
  region?: string;
  status: 'enabled' | 'disabled' | 'pending' | 'unknown';
  reason?: string;
}

/** A deduplicated native control. AWS controls shared between standards count once. */
export interface SecurityPostureControl {
  id: string;
  source: SecurityFindingSource;
  title: string;
  description?: string;
  status: SecurityControlStatus;
  severity: SecuritySeverity;
  standardIds: string[];
  scopeStatuses: { accountId: string; region?: string; status: SecurityControlStatus }[];
  resourceCounts?: { passed: number; failed: number; unknown: number; notApplicable: number };
  remediation?: { text?: string; url?: string };
}

/** Normalized provider finding with source identity preserved for deduplication and workflows. */
export interface SecurityPostureFinding {
  id: string;
  sourceId: string;
  source: SecurityFindingSource;
  kind: 'control' | 'threat' | 'vulnerability';
  accountId: string;
  region?: string;
  controlId?: string;
  title: string;
  description?: string;
  severity: SecuritySeverity;
  status: 'active' | 'resolved' | 'suppressed' | 'unknown';
  workflowStatus?: string;
  complianceStatus?: SecurityControlStatus;
  resources: SecurityPostureResource[];
  remediation?: { text?: string; url?: string };
  firstObservedAt?: string;
  lastObservedAt?: string;
}

/** Provider-neutral content; provider-specific publication envelopes bind this to an immutable run. */
export interface SecurityPostureArtifact {
  schemaVersion: 1;
  providerName: ArtifactProvider;
  providerScopeId: string;
  /** Optional publisher-owned company binding; consumers still verify authorization separately. */
  companyId?: string;
  generatedAt: string;
  status: SecurityPostureStatus;
  /** Set only for a complete, current observation; genuine zero is valid. */
  secureScore?: number;
  secureScoreEvidence: SecureScoreEvidence;
  /** All finding sources; optional source gaps do not invalidate otherwise complete score evidence. */
  coverage: SecurityPostureCoverage;
  standards: SecurityPostureStandard[];
  controls: SecurityPostureControl[];
  findings: SecurityPostureFinding[];
  /** Full source totals, including entries omitted by a publication bound. */
  totals?: { controls: number; findings: number };
  /** A bound never implies healthy posture or complete source coverage. */
  truncated?: { controls: boolean; findings: boolean };
}
