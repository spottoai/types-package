import {
  PORTAL_VIEW_HISTORY_ARTIFACTS,
  PORTAL_VIEW_HISTORY_CADENCES,
  PORTAL_VIEW_HISTORY_MAX_ARTIFACT_JSON_BYTES,
  PORTAL_VIEW_HISTORY_MAX_MANIFEST_JSON_BYTES,
  type AzureDashboardView,
  type PortalViewHistoryArtifact,
  type PortalViewHistoryArtifactDocument,
  type PortalViewHistoryArtifactMap,
  type PortalViewHistoryCadence,
  type PortalViewHistoryManifest,
  type PortalViewHistoryManifestPeriod,
} from '../src';

const azurePeriod = {
  period: '2026-10-05',
  sourceRunId: 'azure-run-1',
  sourceGeneratedAt: '2026-10-05T00:00:00.000Z',
  artifacts: {
    summary: 'portal-views/subscriptions/sub-1/daily/2026-10-05/summary.json',
    resources: 'portal-views/subscriptions/sub-1/daily/2026-10-05/resources.json',
    recommendations: 'portal-views/subscriptions/sub-1/daily/2026-10-05/recommendations.json',
  },
} satisfies PortalViewHistoryManifestPeriod;

const azureManifest = {
  schemaVersion: 1,
  subscriptionId: 'sub-1',
  cadence: 'daily',
  generatedAt: azurePeriod.sourceGeneratedAt,
  retention: { maxPeriods: 7, newestRetainedPeriod: azurePeriod.period, oldestRetainedPeriod: azurePeriod.period },
  periods: [azurePeriod],
} satisfies PortalViewHistoryManifest;

const awsManifest = {
  ...azureManifest,
  subscriptionId: '123456789012',
  periods: [
    {
      ...azurePeriod,
      sourceRunId: 'aws-run-1',
      artifacts: {
        summary: 'portal-views/subscriptions/123456789012/daily/2026-10-05/runs/aws-run-1/summary.json',
        resources: 'portal-views/subscriptions/123456789012/daily/2026-10-05/runs/aws-run-1/resources.json',
        recommendations: 'portal-views/subscriptions/123456789012/daily/2026-10-05/runs/aws-run-1/recommendations.json',
      },
    },
  ],
} satisfies PortalViewHistoryManifest;

const cadences: readonly PortalViewHistoryCadence[] = PORTAL_VIEW_HISTORY_CADENCES;
const artifacts: readonly PortalViewHistoryArtifact[] = PORTAL_VIEW_HISTORY_ARTIFACTS;
const jsonLimits: number[] = [PORTAL_VIEW_HISTORY_MAX_ARTIFACT_JSON_BYTES, PORTAL_VIEW_HISTORY_MAX_MANIFEST_JSON_BYTES];
declare const summary: AzureDashboardView;
const retainedSummary: PortalViewHistoryArtifactMap['summary'] = summary;
const retainedDocument: PortalViewHistoryArtifactDocument = retainedSummary;

// @ts-expect-error Snapshot cadence stays a closed vocabulary.
const invalidCadence: PortalViewHistoryCadence = 'hourly';

const invalidManifest: PortalViewHistoryManifest = {
  ...azureManifest,
  // @ts-expect-error The existing wire schema version remains 1.
  schemaVersion: 2,
};

const incompletePeriod: PortalViewHistoryManifestPeriod = {
  ...azurePeriod,
  // @ts-expect-error Every published period points to all three view documents.
  artifacts: { summary: azurePeriod.artifacts.summary, resources: azurePeriod.artifacts.resources },
};

void [azureManifest, awsManifest, cadences, artifacts, jsonLimits, retainedDocument, invalidCadence, invalidManifest, incompletePeriod];
