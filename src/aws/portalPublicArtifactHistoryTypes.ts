import type { ArtifactDescriptor, ArtifactGeneration, JsonObject } from '../common/artifactGeneration';
import type { AwsPublicArtifactEnvelope, AwsPublicArtifactForbiddenCredentialFields } from './publicArtifacts';
import {
  AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
  type AwsPortalAccountSummaryScope,
  type AwsPortalDiscoveryFamily,
  type AwsPortalMetricFamily,
  type AwsPortalRecommendationSource,
  type AwsPortalResourceCollectionBody,
  type AwsPortalResourceCollectionHistoryLogicalName,
  type AwsPortalAccountSummaryHistoryLogicalName,
  type AwsPortalResourceCollectionScope,
} from './portalPublicArtifacts';
import type { AwsPortalAccountSummaryAiRecommendationPosture } from './portalPublicArtifactNestedEvidence';

export const AWS_PORTAL_PUBLIC_ARTIFACT_RELATIONSHIPS = {
  'resource-collection': {
    logicalName: AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
    required: [],
    optional: ['resource-collection-history'],
  },
  'account-summary': {
    logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
    required: [],
    optional: ['account-summary-history', 'account-summary-ai-cost-summary'],
  },
  'resource-collection-history': {
    logicalNamePattern: 'resources-history--{scope-generation-sha256}.json.gz',
    required: [],
    optional: [],
  },
  'account-summary-history': {
    logicalNamePattern: 'account-summary-history--{scope-sha256}.json.gz',
    required: [],
    optional: [],
  },
  'account-summary-ai-cost-summary': {
    logicalName: AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME,
    required: ['account-summary'],
    optional: [],
  },
} as const;

export interface AwsPortalHistoryBillingTotals {
  currency: string;
  expenseCount: number;
  baseCostAmount: number;
  amortizedCostAmount?: number;
  amortizedExpenseCount?: number;
}

interface AwsPortalCompactHistoryBilling {
  totalPersistedExpenseCount: number;
  emptyScope: boolean;
  metadataFound: boolean;
  metadataMatchesRequestedBillingPeriod: boolean;
  totalsByCurrency: AwsPortalHistoryBillingTotals[];
  pricingReferenceEstimation?: JsonObject;
  estimatedBillingAuthority?: JsonObject;
}

interface AwsPortalHistoryEnvelope<
  ArtifactType extends 'resource-collection-history' | 'account-summary-history',
  AccountId extends string,
  RunId extends string,
> extends AwsPublicArtifactForbiddenCredentialFields {
  schemaVersion: 1;
  portalSchemaVersion: 1;
  provider: 'aws';
  accountId: AccountId;
  artifactType: ArtifactType;
  artifactGeneration: ArtifactGeneration<RunId>;
  generatedAt: string;
  logicalName: ArtifactType extends 'resource-collection-history'
    ? AwsPortalResourceCollectionHistoryLogicalName
    : AwsPortalAccountSummaryHistoryLogicalName;
}

export type AwsPortalResourceCollectionHistoryArtifact<AccountId extends string = string, RunId extends string = string> = AwsPortalHistoryEnvelope<
  'resource-collection-history',
  AccountId,
  RunId
> & {
  scope: AwsPortalResourceCollectionScope<AccountId>;
  summary: AwsPortalResourceCollectionBody<AccountId>['summary'];
  billing: AwsPortalCompactHistoryBilling;
  discovery: {
    families: Array<{
      family: AwsPortalDiscoveryFamily;
      resourceRegionCount: number;
      totalResources?: number;
      regionsWithSuccessfulRefresh: number;
      regionsWithoutSuccessfulRefresh: number;
    }>;
  };
  metrics: {
    families: Array<{
      metricFamily: AwsPortalMetricFamily;
      resourceRegionCount: number;
      requestedMonthCount: number;
      availableMonthCount: number;
      missingMonthCount: number;
      regionsWithCompleteCoverage: number;
      regionsWithMissingCoverage: number;
    }>;
  };
  recommendations: {
    sources: Array<{
      source: AwsPortalRecommendationSource;
      totalStateCount: number;
      currentStateCount: number;
      matchedStateCount: number;
      filteredOutStateCount: number;
      positiveEstimatedSavingsRecommendationCount: number;
      savingsByCurrency: import('./portalPublicArtifacts').AwsPortalRecommendationSavings['byCurrency'];
    }>;
  };
};

export type AwsPortalAccountSummaryHistoryArtifact<AccountId extends string = string, RunId extends string = string> = AwsPortalHistoryEnvelope<
  'account-summary-history',
  AccountId,
  RunId
> & {
  scope: Omit<AwsPortalAccountSummaryScope<AccountId>, 'comparisonBillingPeriod' | 'metricTimeWindow'>;
  billing: AwsPortalCompactHistoryBilling;
  discovery: AwsPortalResourceCollectionHistoryArtifact<AccountId, RunId>['discovery'];
  recommendations: {
    sources: Array<{
      source: AwsPortalRecommendationSource;
      totalStateCount: number;
      matchedStateCount: number;
      positiveEstimatedSavingsRecommendationCount: number;
      sourceEvidence?: import('./portalPublicArtifacts').AwsPortalRecommendationSourceEvidence;
      actionHealth?: import('./portalPublicArtifacts').AwsPortalRecommendationActionHealth;
      savingsByCurrency: import('./portalPublicArtifacts').AwsPortalRecommendationSavings['byCurrency'];
    }>;
  };
};

interface AwsPortalRetainedHistoryBodyReferenceBase {
  artifactGeneration: ArtifactGeneration;
  body: ArtifactDescriptor;
}

export type AwsPortalRetainedHistoryBodyReference =
  | (AwsPortalRetainedHistoryBodyReferenceBase & {
      artifactType: 'resource-collection-history';
      logicalName: AwsPortalResourceCollectionHistoryLogicalName;
    })
  | (AwsPortalRetainedHistoryBodyReferenceBase & {
      artifactType: 'account-summary-history';
      logicalName: AwsPortalAccountSummaryHistoryLogicalName;
    });

export type AwsPortalAiAudience = 'executive' | 'finops' | 'engineering';

export interface AwsPortalAccountSummaryAiCostSummaryEntry {
  targetKey: string;
  audience: AwsPortalAiAudience;
  artifactVersion: 1;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  sourceRecommendationPosture?: AwsPortalAccountSummaryAiRecommendationPosture;
  status: 'available';
  summary: { headline: string; narrative: string };
  provider: {
    type: 'amazon-bedrock';
    inferenceProfileId: string;
    promptVersionArn: string;
    stopReason?: string;
    latencyMs?: number;
    usage?: { inputTokens: number; outputTokens: number; totalTokens: number };
    trace?: { guardrailActionReason?: string; invokedModelId?: string };
  };
}

export type AwsPortalAccountSummaryAiCostSummaryArtifact<
  AccountId extends string = string,
  RunId extends string = string,
> = AwsPublicArtifactEnvelope<'account-summary-ai-cost-summary', AccountId, RunId> & {
  portalSchemaVersion: 1;
  generatedAt: string;
  logicalName: typeof AWS_PORTAL_ACCOUNT_SUMMARY_AI_COST_SUMMARY_LOGICAL_NAME;
  source: {
    scope: AwsPortalAccountSummaryScope<AccountId>;
    targetKey: string;
    logicalName: typeof AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME;
    artifactType: 'account-summary';
    artifactGeneration: ArtifactGeneration<RunId>;
    sha256: string;
  };
  entries: AwsPortalAccountSummaryAiCostSummaryEntry[];
};

export type AwsPortalLosslessPublicArtifact =
  | import('./portalPublicArtifacts').AwsPortalResourceCollectionDetailArtifact
  | import('./portalPublicArtifacts').AwsPortalAccountSummaryDetailArtifact
  | AwsPortalResourceCollectionHistoryArtifact
  | AwsPortalAccountSummaryHistoryArtifact
  | AwsPortalAccountSummaryAiCostSummaryArtifact;
