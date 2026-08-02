import type { ProviderName } from '../common/provider';
import type { AzurePortalArtifactGeneration, AzurePortalArtifactSchemaVersion, AzurePortalVersionedArtifact } from './portalArtifacts';

export const SystemTrackIds = {
  resourceHygiene: 'resource-hygiene',
  capacityRightsizing: 'capacity-rightsizing',
  securityPosture: 'security-posture',
  patchingLifecycle: 'patching-lifecycle',
  commitmentsLicensing: 'commitments-licensing',
  backupRecovery: 'backup-recovery',
  perimeterExposure: 'perimeter-exposure',
  identityPrivilege: 'identity-privilege',
  governanceOwnership: 'governance-ownership',
  spendExceptions: 'spend-exceptions',
} as const;

export type SystemTrackId = (typeof SystemTrackIds)[keyof typeof SystemTrackIds];

export const RecommendationFocusModes = {
  all: 'all',
  finops: 'finops',
  securityGovernance: 'securityGovernance',
  operationalHealth: 'operationalHealth',
  optimizationDelivery: 'optimizationDelivery',
  serviceDelivery: 'serviceDelivery',
} as const;

export type RecommendationFocusMode = (typeof RecommendationFocusModes)[keyof typeof RecommendationFocusModes];

export const RecommendationTrackFacets = {
  orphaned: 'orphaned',
  unattached: 'unattached',
  idle: 'idle',
  underutilized: 'underutilized',
  unprotected: 'unprotected',
  staleBackup: 'stale-backup',
  expiring: 'expiring',
  unpatched: 'unpatched',
  unsupported: 'unsupported',
  publicIngress: 'public-ingress',
  overprivileged: 'overprivileged',
  missingOwnership: 'missing-ownership',
  missingTags: 'missing-tags',
  costAnomaly: 'cost-anomaly',
} as const;

export type RecommendationTrackFacet = (typeof RecommendationTrackFacets)[keyof typeof RecommendationTrackFacets];

export const SystemTrackCardGranularities = {
  recommendation: 'recommendation',
  resource: 'resource',
} as const;

export type SystemTrackCardGranularity = (typeof SystemTrackCardGranularities)[keyof typeof SystemTrackCardGranularities];

interface SystemTrackCandidateReferenceBase {
  systemTrackId: SystemTrackId;
  recommendationId: string;
  sourceFingerprint: string;
}

/**
 * Server-verifiable identity for a recommendation-granular sidecar candidate.
 * Display, ranking, and provenance fields are deliberately excluded.
 */
export interface SystemTrackRecommendationCandidateReference extends SystemTrackCandidateReferenceBase {
  granularity: 'recommendation';
  resourceId?: never;
}

/**
 * Server-verifiable identity for one resource-granular sidecar candidate.
 * The API validates the canonical resource identity before merging it into a
 * durable selected-subset workflow item.
 */
export interface SystemTrackResourceCandidateReference extends SystemTrackCandidateReferenceBase {
  granularity: 'resource';
  resourceId: string;
}

export type SystemTrackCandidateReference = SystemTrackRecommendationCandidateReference | SystemTrackResourceCandidateReference;

interface RecommendationSystemTrackEligibleClassification {
  systemTrackEligible: true;
  primaryTrackId: SystemTrackId;
  trackFacets: RecommendationTrackFacet[];
  cardGranularity: SystemTrackCardGranularity;
  rankingStrategyVersion: string;
  trackEvidence: string[];
  reason?: never;
}

interface RecommendationSystemTrackIneligibleClassification {
  systemTrackEligible: false;
  reason?: string;
  primaryTrackId?: never;
  trackFacets?: never;
  cardGranularity?: never;
  rankingStrategyVersion?: never;
  trackEvidence?: never;
}

export type RecommendationSystemTrackClassification =
  | RecommendationSystemTrackEligibleClassification
  | RecommendationSystemTrackIneligibleClassification;

export interface SystemTrackCatalogEntry {
  trackId: SystemTrackId;
  displayName: string;
  focusModes: [RecommendationFocusMode, ...RecommendationFocusMode[]];
  defaultOrder: number;
  focusOrder?: Partial<Record<Exclude<RecommendationFocusMode, 'all'>, number>>;
}

export interface SystemTrackCatalog {
  catalogVersion: string;
  defaultVisibleCandidateCount: 3;
  maximumVisibleCandidateCount: 5;
  candidateBufferLimit: number;
  tracks: [SystemTrackCatalogEntry, ...SystemTrackCatalogEntry[]];
}

export type SystemTrackMetricType =
  | 'monthly-savings'
  | 'secure-score-uplift'
  | 'urgency-days'
  | 'affected-resource-count'
  | 'criticality'
  | 'final-score';

export type SystemTrackMetricUnit = 'currency-per-month' | 'percentage-points' | 'days' | 'count' | 'score';

interface SystemTrackMetricBase {
  metricType: SystemTrackMetricType;
  unit: SystemTrackMetricUnit;
  currency?: string;
  observedAt?: string;
  provenance: string;
}

export interface AvailableSystemTrackMetric extends SystemTrackMetricBase {
  availability: 'available';
  value: number;
  reason?: never;
}

export interface StaleSystemTrackMetric extends SystemTrackMetricBase {
  availability: 'stale';
  value: number;
  observedAt: string;
  reason: string;
}

export interface UnavailableSystemTrackMetric extends SystemTrackMetricBase {
  availability: 'unavailable';
  value?: never;
  currency?: never;
  reason: string;
}

export type SystemTrackMetric = AvailableSystemTrackMetric | StaleSystemTrackMetric | UnavailableSystemTrackMetric;

export interface SystemTrackDisplayValue {
  label: string;
  value: string | number;
  unit?: SystemTrackMetricUnit;
  currency?: string;
}

export type SystemTrackCardCategory = 'Cost' | 'Performance' | 'Security' | 'Compliance' | 'Reliability' | 'Operational Excellence';

export type SystemTrackCardImpact = 'High' | 'Medium' | 'Low';

export type SystemTrackCardEffort = 'High' | 'Medium' | 'Low';

interface SystemTrackCardSnapshotBase {
  /** Backward-compatible default title for consumers that do not support view modes. */
  title: string;
  /** Customer-facing outcome label used in Business view. */
  businessTitle: string;
  /** Implementation-oriented label used in Technical view. */
  technicalTitle: string;
  /** Source recommendation metadata used when materializing a durable workflow item. */
  category?: SystemTrackCardCategory;
  impact?: SystemTrackCardImpact;
  effort?: SystemTrackCardEffort;
  /** Display Spotto Score projected from the canonical recommendation (0-100). */
  spottoScore?: number;
  displayValue?: SystemTrackDisplayValue;
  deepLink: string;
}

export interface SystemTrackRecommendationCardSnapshot extends SystemTrackCardSnapshotBase {
  affectedResourceCount: number;
  resourceName?: never;
  resourceType?: never;
}

export interface SystemTrackResourceCardSnapshot extends SystemTrackCardSnapshotBase {
  resourceName: string;
  resourceType: string;
  affectedResourceCount?: never;
}

interface SystemTrackCandidateBase {
  recommendationId: string;
  rank: number;
  rankReasonCodes: [string, ...string[]];
  rankingStrategyVersion: string;
  trackMetric: SystemTrackMetric;
  sourceFingerprint: string;
}

export interface SystemTrackRecommendationCandidate extends SystemTrackCandidateBase {
  cardType: 'recommendation';
  resourceId?: never;
  card: SystemTrackRecommendationCardSnapshot;
}

export interface SystemTrackResourceCandidate extends SystemTrackCandidateBase {
  cardType: 'resource';
  resourceId: string;
  card: SystemTrackResourceCardSnapshot;
}

export type SystemTrackCandidate = SystemTrackRecommendationCandidate | SystemTrackResourceCandidate;

export type SystemTrackEvaluationStatus = 'complete' | 'partial' | 'failed' | 'stale' | 'unevaluated';

export type SystemTrackEvaluation =
  | {
      status: 'complete';
      statusReason?: never;
    }
  | {
      status: Exclude<SystemTrackEvaluationStatus, 'complete'>;
      statusReason: string;
    };

interface SystemTrackViewBase {
  trackId: SystemTrackId;
  focusModes: [RecommendationFocusMode, ...RecommendationFocusMode[]];
  sourceEligibleOccurrenceCount: number;
  materializedOccurrenceCount: number;
  bufferExhausted: boolean;
  candidates: SystemTrackCandidate[];
}

export type SystemTrackView = SystemTrackViewBase & SystemTrackEvaluation;

interface SystemTracksViewBase extends AzurePortalVersionedArtifact {
  schemaVersion: AzurePortalArtifactSchemaVersion;
  artifactGeneration: AzurePortalArtifactGeneration;
  generationId: string;
  generatedAt: string;
  providerName: ProviderName.Azure;
  providerScopeId: string;
  subscriptionId: string;
  catalog: SystemTrackCatalog;
  tracks: SystemTrackView[];
}

export type SystemTracksView = SystemTracksViewBase & SystemTrackEvaluation;
