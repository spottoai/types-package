import type { AzureRecommendationResourceEvidenceDocument, CompletedAzureViewSetV1 } from './views.js';
import { RecommendationCategory } from './recommendations.js';

const completedViewSet = {
  schemaVersion: 1,
  status: 'completed',
  subscriptionId: 'sub-1',
  publicationId: 'refresh-1',
  portal: {
    runId: 'portal-run-1',
    manifestPath: 'runs/portal-run-1/completed-view-manifest.json',
    completedAt: '2026-08-07T00:00:00.000Z',
  },
  plugin: {
    runId: 'plugin-run-1',
    manifestPath: 'runs/plugin-run-1/completed-plugin-generation.json',
    completedAt: '2026-08-07T00:01:00.000Z',
  },
  economics: {
    generationId: 'economics-1',
    fingerprint: 'sha256:abc123',
  },
  completedAt: '2026-08-07T00:01:00.000Z',
} satisfies CompletedAzureViewSetV1;

const evidence = {
  schemaVersion: 1,
  artifactGeneration: { runId: 'portal-run-1', generatedAt: '2026-08-07T00:00:00.000Z' },
  recommendations: [
    {
      recommendationId: 'benefits-resource-ri-1',
      recommendation: {
        id: 'benefits-resource-ri-1',
        name: 'Reserved Instance Opportunity',
        category: RecommendationCategory.Cost,
        type: 'Reserved Instance Opportunity',
        title: 'Reserve compute',
        description: 'Purchase a reservation.',
        impact: 'High',
      },
      resources: [
        {
          id: '/subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Web/serverfarms/plan-1',
          name: 'plan-1',
          type: 'microsoft.web/serverfarms',
          location: 'australiaeast',
          spend: 2691,
          spendAmortized: 2691,
          savings: { minAmount: 2148.33, maxAmount: 2148.33, minPercentage: 79.83, maxPercentage: 79.83 },
        },
      ],
    },
  ],
} satisfies AzureRecommendationResourceEvidenceDocument;

void completedViewSet;
void evidence;
