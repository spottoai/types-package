import type { ArtifactProvider } from '../common/artifactGeneration';
import type { SecurityControlCounts, SecurityPostureCoverage, SecurityScoreSource } from '../common/securityPosture';

export type SecureScoreEvidenceStatus = 'available' | 'unavailable' | 'stale' | 'partial';

/**
 * Provider evidence for one security posture score observation.
 *
 * The legacy scalar score remains on subscription contracts for compatibility.
 * Consumers should use this evidence to distinguish a genuine zero from missing
 * provider data. The dashboard uses the arithmetic mean of available percentages;
 * provider-weighted aggregation requires native weights and equivalent methods.
 */
export interface SecureScoreEvidence {
  status: SecureScoreEvidenceStatus;
  /** Native or rule-derived 0-100 percentage when available; never substitute zero for absence. */
  percentage?: number;
  /** Optional for legacy Azure observations. */
  providerName?: ArtifactProvider;
  source?: SecurityScoreSource;
  method?: 'provider-reported' | 'control-pass-rate';
  /** Machine-readable reason for unavailable, stale, or partial evidence. */
  reason?: string;
  /** AWS control evidence, never synthetic Azure score points. */
  controlCounts?: SecurityControlCounts;
  /** Coverage of score inputs only; optional threat/vulnerability sources do not invalidate CSPM scoring. */
  coverage?: SecurityPostureCoverage;
  /** Provider score points earned. */
  currentScore?: number;
  /** Provider score points available. */
  maxScore?: number;
  /** Provider aggregation weight for this subscription/scope, when supplied. */
  weight?: number;
  /** Healthy + unhealthy assessed resources, excluding not-applicable resources. */
  assessedResourceCount?: number;
  observedAt?: string;
}
