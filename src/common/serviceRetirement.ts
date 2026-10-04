import type { ArtifactAttemptOutcome, ArtifactCoverageVerdict, ArtifactFreshnessVerdict, ArtifactSupportVerdict } from './artifactEvidence';
import type { ProviderScope } from './provider';
import type { CapabilitySourceId } from './resourceIdentity';

/** Meaning of the existing RetirementDate field; rotation due does not prove that a credential expires then. */
export type ServiceRetirementDeadlineKind = 'retirement' | 'deprecation' | 'end-of-support' | 'expiry' | 'rotation-due';

/** Public metadata only. Credential values, private keys and provider request payloads must never be included. */
export interface CredentialLifecycleRetirementRenderData {
  kind: 'credential-lifecycle';
  credentialType: 'api-key' | 'password' | 'secret' | 'key' | 'key-material' | 'certificate';
  /** Public source identifier, never the credential value. */
  credentialId: string;
  credentialName?: string;
  /** Exact known resource identity; omit when no resource association is proven. */
  resourceId?: string;
  rotationEnabled?: boolean;
  /** UTC ISO 8601 timestamp from source metadata. */
  lastRotatedAt?: string;
}

/** Resource matching is separate from source collection. An empty resources array alone conveys no coverage verdict. */
export type ServiceRetirementResourceCoverage =
  { status: 'complete' | 'not-applicable'; reasonCode?: never } | { status: 'partial' | 'unresolved'; reasonCode: string };

/**
 * Collection evidence for one provider source and Region (omitted Region means account/subscription-global).
 * Support, latest attempt, accepted collection coverage and freshness are independent facts. A failed attempt
 * may retain complete but stale evidence from a prior successful collection. Missing source rows are unknown.
 */
export interface ServiceRetirementSourceCoverage {
  sourceId: CapabilitySourceId;
  region?: string;
  support: ArtifactSupportVerdict;
  attempt: ArtifactAttemptOutcome;
  coverage: ArtifactCoverageVerdict;
  /** Freshness of collected evidence, not whether a tracked credential or service has passed its deadline. */
  freshness: ArtifactFreshnessVerdict;
  /** UTC ISO 8601 timestamp; omit when no successful collection has occurred. */
  lastSuccessfulRefreshAt?: string;
  /**
   * Nonnegative integer count of accepted source records before tracker filtering; omit when unknown.
   * Zero proves an empty source only with succeeded attempt, complete coverage and current freshness.
   */
  itemCount?: number;
  /** Safe machine-readable reason, never a raw provider error or credential value. */
  reasonCode?: string;
  /** Nonnegative projection horizon in days, if applied; omitted means unknown, not unlimited. */
  lookaheadDays?: number;
}

/**
 * Separate coverage document for the existing ServiceRetirementPortalEntry[] array. Every source/Region selected
 * for the scan must be represented, including failed or unattempted sources. Absence of this document means
 * unknown collection coverage. Publication paths, source catalogues and collection policy belong to the engine.
 */
export interface ServiceRetirementCoverageArtifact {
  schemaVersion: 1;
  /** UTC ISO 8601 timestamp when coverage was projected; does not establish source freshness. */
  generatedAt: string;
  providerScope: ProviderScope;
  sources: ServiceRetirementSourceCoverage[];
}
