export type SecureScoreEvidenceStatus = 'available' | 'unavailable' | 'stale';

/**
 * Provider evidence for one Defender for Cloud Secure Score observation.
 *
 * The legacy scalar score remains on subscription contracts for compatibility.
 * Consumers should use this evidence to distinguish a genuine zero from missing
 * provider data and must not aggregate percentages when weight is unavailable.
 */
export interface SecureScoreEvidence {
  status: SecureScoreEvidenceStatus;
  /** Provider-reported 0-100 percentage when available. */
  percentage?: number;
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
