import { ProviderName } from '../common/provider';
import { RecommendationCategory, type Recommendation } from './recommendations';
import type {
  RecommendationSystemTrackClassification,
  SystemTrackCatalog,
  SystemTrackCandidate,
  SystemTrackCandidateReference,
  SystemTrackMetric,
  SystemTracksView,
} from './recommendationTracks';

const recommendationCandidateReference: SystemTrackCandidateReference = {
  systemTrackId: 'security-posture',
  recommendationId: 'security-enable-defender',
  sourceFingerprint: 'sha256:recommendation-candidate',
  granularity: 'recommendation',
};

const resourceCandidateReference: SystemTrackCandidateReference = {
  systemTrackId: 'resource-hygiene',
  recommendationId: 'compute-disks_orphaned',
  sourceFingerprint: 'sha256:resource-candidate',
  granularity: 'resource',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
};

const catalog: SystemTrackCatalog = {
  catalogVersion: '2026-07-29.pilot-v1',
  defaultVisibleCandidateCount: 3,
  maximumVisibleCandidateCount: 5,
  candidateBufferLimit: 25,
  tracks: [
    {
      trackId: 'resource-hygiene',
      displayName: 'Resource Hygiene',
      focusModes: ['all', 'finops', 'optimizationDelivery'],
      defaultOrder: 10,
      focusOrder: {
        finops: 10,
        optimizationDelivery: 10,
      },
    },
  ],
};

const eligibleClassification: RecommendationSystemTrackClassification = {
  systemTrackEligible: true,
  primaryTrackId: 'resource-hygiene',
  trackFacets: ['orphaned'],
  cardGranularity: 'resource',
  rankingStrategyVersion: 'resource-hygiene-v1',
  trackEvidence: ['registered-recommendation-id'],
};

const ineligibleClassification: RecommendationSystemTrackClassification = {
  systemTrackEligible: false,
  reason: 'not-in-pilot',
};

const trackedRecommendation: Recommendation = {
  id: 'compute-disks_orphaned',
  name: 'Remove orphaned disks',
  category: RecommendationCategory.Cost,
  impact: 'High',
  systemTrackClassification: eligibleClassification,
};

const availableSavingsMetric: SystemTrackMetric = {
  availability: 'available',
  metricType: 'monthly-savings',
  value: 240,
  unit: 'currency-per-month',
  currency: 'NZD',
  observedAt: '2026-07-29T00:00:00.000Z',
  provenance: 'recommendation.savings',
};

const resourceCandidate: SystemTrackCandidate = {
  cardType: 'resource',
  recommendationId: 'compute-disks_orphaned',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
  rank: 1,
  rankReasonCodes: ['must-do', 'monthly-savings'],
  rankingStrategyVersion: 'resource-hygiene-v1',
  trackMetric: availableSavingsMetric,
  sourceFingerprint: 'sha256:resource-candidate',
  card: {
    title: 'Remove unattached disk',
    businessTitle: 'Reduce waste from unattached disks',
    technicalTitle: 'Remove unattached disk',
    category: 'Cost',
    impact: 'High',
    effort: 'Low',
    spottoScore: 84,
    resourceName: 'disk-1',
    resourceType: 'Microsoft.Compute/disks',
    displayValue: {
      label: 'Monthly saving',
      value: 240,
      unit: 'currency-per-month',
      currency: 'NZD',
    },
    deepLink: '/resources/azure/sub-123/disk-1?recommendation=compute-disks_orphaned',
  },
};

const recommendationCandidate: SystemTrackCandidate = {
  cardType: 'recommendation',
  recommendationId: 'security-enable-defender',
  rank: 1,
  rankReasonCodes: ['secure-score-uplift'],
  rankingStrategyVersion: 'security-posture-v1',
  trackMetric: {
    availability: 'available',
    metricType: 'secure-score-uplift',
    value: 4.5,
    unit: 'percentage-points',
    observedAt: '2026-07-29T00:00:00.000Z',
    provenance: 'defender-secure-score',
  },
  sourceFingerprint: 'sha256:recommendation-candidate',
  card: {
    title: 'Enable Defender protection',
    businessTitle: 'Reduce security exposure with Defender',
    technicalTitle: 'Enable Defender protection',
    category: 'Security',
    impact: 'High',
    effort: 'Medium',
    affectedResourceCount: 18,
    deepLink: '/recommendations/security-enable-defender?subscriptionId=sub-123',
  },
};

const systemTracksView: SystemTracksView = {
  schemaVersion: 1,
  artifactGeneration: {
    runId: 'run-123',
    generatedAt: '2026-07-29T00:00:00.000Z',
  },
  generationId: 'run-123',
  generatedAt: '2026-07-29T00:00:00.000Z',
  providerName: ProviderName.Azure,
  providerScopeId: 'sub-123',
  subscriptionId: 'sub-123',
  status: 'complete',
  catalog,
  tracks: [
    {
      trackId: 'resource-hygiene',
      status: 'complete',
      focusModes: ['all', 'finops', 'optimizationDelivery'],
      sourceEligibleOccurrenceCount: 1,
      materializedOccurrenceCount: 1,
      bufferExhausted: false,
      candidates: [resourceCandidate],
    },
  ],
};

void catalog;
void eligibleClassification;
void ineligibleClassification;
void trackedRecommendation;
void recommendationCandidate;
void recommendationCandidateReference;
void resourceCandidateReference;
void systemTracksView;

// @ts-expect-error eligible classifications require one primary track.
const invalidEligibleClassification: RecommendationSystemTrackClassification = {
  systemTrackEligible: true,
  trackFacets: ['orphaned'],
  cardGranularity: 'resource',
  rankingStrategyVersion: 'resource-hygiene-v1',
  trackEvidence: [],
};

const invalidIneligibleClassification: RecommendationSystemTrackClassification = {
  systemTrackEligible: false,
  reason: 'not-in-pilot',
  // @ts-expect-error ineligible recommendations cannot declare a primary track.
  primaryTrackId: 'resource-hygiene',
};

// @ts-expect-error recommendation cards cannot carry resource identity.
const invalidRecommendationCandidate: SystemTrackCandidate = {
  ...recommendationCandidate,
  cardType: 'recommendation',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
};

// @ts-expect-error resource cards require a resource id.
const invalidResourceCandidate: SystemTrackCandidate = {
  ...resourceCandidate,
  cardType: 'resource',
  resourceId: undefined,
};

// @ts-expect-error resource candidate references require one canonical resource identity.
const invalidResourceCandidateReference: SystemTrackCandidateReference = {
  systemTrackId: 'resource-hygiene',
  recommendationId: 'compute-disks_orphaned',
  sourceFingerprint: 'sha256:resource-candidate',
  granularity: 'resource',
};

// @ts-expect-error recommendation candidate references cannot carry resource identity.
const invalidRecommendationCandidateReference: SystemTrackCandidateReference = {
  systemTrackId: 'security-posture',
  recommendationId: 'security-enable-defender',
  sourceFingerprint: 'sha256:recommendation-candidate',
  granularity: 'recommendation',
  resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/disks/disk-1',
};

// @ts-expect-error available metrics require a numeric value.
const invalidAvailableMetric: SystemTrackMetric = {
  availability: 'available',
  metricType: 'monthly-savings',
  unit: 'currency-per-month',
  observedAt: '2026-07-29T00:00:00.000Z',
  provenance: 'recommendation.savings',
};

const invalidTrackId: SystemTrackCatalog = {
  ...catalog,
  tracks: [
    {
      // @ts-expect-error track ids use the shared stable taxonomy.
      trackId: 'random-track',
      displayName: 'Random',
      focusModes: ['all'],
      defaultOrder: 999,
    },
  ],
};

const invalidCandidateMetadata: SystemTrackCandidate = {
  ...resourceCandidate,
  card: {
    ...resourceCandidate.card,
    // @ts-expect-error workflow metadata uses the shared display taxonomy.
    impact: 'Critical',
  },
};

const invalidMissingBusinessTitleCandidate: SystemTrackCandidate = {
  ...resourceCandidate,
  // @ts-expect-error generated cards require an explicit Business title.
  card: {
    title: 'Remove unattached disk',
    technicalTitle: 'Remove unattached disk',
    resourceName: 'disk-1',
    resourceType: 'microsoft.compute/disks',
    deepLink: '/recommendations/storage-disks_unattached?resourceId=disk-1',
  },
};

const invalidMissingTechnicalTitleCandidate: SystemTrackCandidate = {
  ...resourceCandidate,
  // @ts-expect-error generated cards require an explicit Technical title.
  card: {
    title: 'Remove unattached disk',
    businessTitle: 'Stop paying for unused disk storage',
    resourceName: 'disk-1',
    resourceType: 'microsoft.compute/disks',
    deepLink: '/recommendations/storage-disks_unattached?resourceId=disk-1',
  },
};

// @ts-expect-error degraded track evaluations require a status reason.
const invalidFailedTrackView: SystemTracksView = {
  ...systemTracksView,
  status: 'failed',
};

void invalidEligibleClassification;
void invalidIneligibleClassification;
void invalidRecommendationCandidate;
void invalidResourceCandidate;
void invalidResourceCandidateReference;
void invalidRecommendationCandidateReference;
void invalidAvailableMetric;
void invalidTrackId;
void invalidCandidateMetadata;
void invalidMissingBusinessTitleCandidate;
void invalidMissingTechnicalTitleCandidate;
void invalidFailedTrackView;
