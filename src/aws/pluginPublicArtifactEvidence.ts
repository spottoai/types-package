import type { JsonObject, JsonValue } from '../common/artifactGeneration';
import type { AwsPluginBillingScope, AwsPluginMetricTimeWindow, AwsPluginRecommendationScope } from './pluginPublicArtifacts';

export interface AwsPluginPortalScopeEvidence {
  provider: 'aws';
  accountId: string;
  billing: AwsPluginBillingScope;
  resourceRegions: string[];
  metricTimeWindow: AwsPluginMetricTimeWindow;
}

export interface AwsPluginAccountSummaryEvidence {
  artifact: {
    artifactType: 'account-summary';
    artifactVersion: 1;
    generatedAt: string;
    scope: AwsPluginPortalScopeEvidence;
    account: JsonObject;
    billing: JsonObject;
    discovery: JsonObject;
    metrics: JsonObject;
    recommendations: JsonObject;
  };
}

export interface AwsPluginResourceSummaryEvidence {
  summary: {
    totalDiscoveredResourceCount: number;
    returnedResourceCount: number;
    emptyCollection: boolean;
    truncated: boolean;
    unmatchedRecommendationResourceCount: number;
    unmatchedBillingExpenseCount: number;
  };
  coverage: JsonObject;
  highlights: AwsPluginResourceItemEvidence[];
}

export interface AwsPluginResourceItemEvidence {
  stableKey: string;
  family: string;
  resourceRegion: string;
  resourceType: string;
  resourceArn?: string;
  resourceId?: string;
  resourceName?: string;
  tags?: Record<string, string>;
  spottoTags?: JsonObject;
  discovery: JsonObject;
  billing?: JsonObject;
  metrics?: JsonObject;
  recommendations?: JsonObject;
}

export interface AwsPluginAiCostSummaryEvidence {
  audience: 'portal' | 'plugin';
  sourceAccountSummaryGeneratedAt: string;
  artifact: JsonObject;
}

export interface AwsPluginSubscriptionLifecycleEvidence {
  stats: {
    entryCount: number;
    matchedResourceCount: number;
    unmatchedSourceEntryCount: number;
    truncated: false;
  };
  refreshMetadataBySource: JsonObject;
  refreshMetadataByFamily: JsonObject;
  highlights: JsonValue[];
}

export interface AwsPluginResourceLifecycleEvidence {
  summary: {
    matchedEntryCount: number;
    totalArtifactEntryCount: number;
  };
  entries: JsonValue[];
}

export type AwsPluginSubscriptionRecommendationSectionEvidence =
  | {
      status: 'available';
      source: AwsPluginRecommendationScope['source'];
      targetKey: string;
      generatedAt: string;
      scope: Omit<AwsPluginRecommendationScope, 'targetKey' | 'actionabilityTargetKey'>;
      filters: JsonObject;
      summary: JsonObject;
      counts: JsonObject;
      savings: JsonObject;
      evidenceFreshness?: JsonObject;
      templateProvenance?: JsonObject;
      actionability?: JsonObject;
      highlights: JsonValue[];
    }
  | {
      status: 'not-found';
      source: AwsPluginRecommendationScope['source'];
      targetKey: string;
    }
  | {
      status: 'unsupported-resource-identity';
      source: AwsPluginRecommendationScope['source'];
    };

export type AwsPluginResourceRecommendationSectionEvidence =
  | {
      status: 'available';
      source: AwsPluginRecommendationScope['source'];
      targetKey: string;
      generatedAt: string;
      evidenceFreshness?: JsonObject;
      templateProvenance?: JsonObject;
      actionability?: JsonObject;
      artifact: JsonObject;
    }
  | {
      status: 'not-found';
      source: AwsPluginRecommendationScope['source'];
      targetKey: string;
    }
  | {
      status: 'unsupported-resource-identity';
      source: AwsPluginRecommendationScope['source'];
    };

interface AwsPluginRecommendationsEvidenceBase {
  summary: {
    requestedScopeCount: number;
    availableScopeCount: number;
    notFoundScopeCount: number;
    unsupportedScopeCount?: number;
  };
}

export interface AwsPluginSubscriptionRecommendationsEvidence extends AwsPluginRecommendationsEvidenceBase {
  sections: AwsPluginSubscriptionRecommendationSectionEvidence[];
}

export interface AwsPluginResourceRecommendationsEvidence extends AwsPluginRecommendationsEvidenceBase {
  sections: AwsPluginResourceRecommendationSectionEvidence[];
}

export interface AwsPluginCommitmentEvidence {
  request?: JsonObject;
  billing: JsonObject;
  benefitExpiry: JsonObject;
  evidenceSource?: JsonObject;
}

export interface AwsPluginReliabilityEvidence {
  request: JsonObject;
  summary: JsonObject;
  sections: JsonValue[];
}

export interface AwsPluginGovernanceEvidence {
  workflow: JsonObject;
  checklist: {
    present: boolean;
    targetKey: string;
    summary?: JsonObject;
  };
  complianceResults?: JsonValue[];
}

export interface AwsPluginRelationshipEvidence {
  anchorNodeId: string;
  stats: {
    directNodeCount: number;
    directEdgeCount: number;
    unresolvedCount: number;
  };
  nodes: JsonValue[];
  edges: JsonValue[];
  unresolved: JsonValue[];
}

export type AwsPluginDeclaredSectionEvidence =
  | AwsPluginAccountSummaryEvidence
  | AwsPluginResourceSummaryEvidence
  | AwsPluginAiCostSummaryEvidence
  | AwsPluginSubscriptionLifecycleEvidence
  | AwsPluginResourceLifecycleEvidence
  | AwsPluginSubscriptionRecommendationsEvidence
  | AwsPluginResourceRecommendationsEvidence
  | AwsPluginCommitmentEvidence
  | AwsPluginReliabilityEvidence
  | AwsPluginGovernanceEvidence
  | { item: AwsPluginResourceItemEvidence }
  | AwsPluginRelationshipEvidence;
