/** Single pre-release multi-pillar environment contract shared by producers and consumers. */
export const ENVIRONMENT_CONTRACT_LIMITS_V1 = Object.freeze({
  completedPointerBytes: 16 * 1024,
  projectionBytes: 256 * 1024,
  environmentIndexBytes: 8 * 1024,
  pillarDocumentBytes: 8 * 1024,
  boundedListItems: 50,
  customerStringScalars: 4096,
  safeLabelScalars: 512,
  scopeIdentifierScalars: 2048,
  environmentRunIdAsciiCharacters: 128,
  sourceIdentityScalars: 256,
  logicalReferencePayloadBytes: 4 * 1024,
  validatedContainerDepth: 10,
} as const);

export const ENVIRONMENT_PILLARS_V1 = ['cost', 'security', 'governance', 'reliability', 'performance', 'operations'] as const;

export const ENVIRONMENT_DOCUMENT_NAMES_V1 = [
  'projection.json',
  'environment-index.md',
  'pillars/cost.md',
  'pillars/security.md',
  'pillars/governance.md',
  'pillars/reliability.md',
  'pillars/performance.md',
  'pillars/operations.md',
] as const;

export const ENVIRONMENT_ARTIFACT_KINDS_V1 = [
  'subscription-summary',
  'subscription-resources',
  'subscription-recommendations',
  'subscription-service-retirements',
  'subscription-monitor-alerts',
  'subscription-system-tracks',
  'subscription-metrics',
  'tenant-governance',
  'tenant-governance-access',
  'tenant-reservations',
  'tenant-savings-plans',
  'tenant-applications',
  'tenant-service-principals',
] as const;

export const ENVIRONMENT_FINDING_KINDS_V1 = [
  'recommendation',
  'security-posture',
  'public-exposure',
  'governance',
  'compliance',
  'service-retirement',
  'data-protection',
  'health',
  'performance',
  'scaling',
  'operations',
  'monitoring',
  'topology',
] as const;

export const ENVIRONMENT_SEVERITIES_V1 = ['critical', 'high', 'medium', 'low', 'informational', 'unknown'] as const;
export const ENVIRONMENT_IMPACTS_V1 = ['high', 'medium', 'low', 'unknown'] as const;
export const ENVIRONMENT_EFFORTS_V1 = ['high', 'medium', 'low', 'unknown'] as const;

export type EnvironmentPillarV1 = (typeof ENVIRONMENT_PILLARS_V1)[number];
export type EnvironmentDocumentNameV1 = (typeof ENVIRONMENT_DOCUMENT_NAMES_V1)[number];
export type EnvironmentMarkdownDocumentNameV1 = Exclude<EnvironmentDocumentNameV1, 'projection.json'>;
export type EnvironmentArtifactKindV1 = (typeof ENVIRONMENT_ARTIFACT_KINDS_V1)[number];
export type EnvironmentFindingKindV1 = (typeof ENVIRONMENT_FINDING_KINDS_V1)[number];
export type EnvironmentSeverityV1 = (typeof ENVIRONMENT_SEVERITIES_V1)[number];
export type EnvironmentImpactV1 = (typeof ENVIRONMENT_IMPACTS_V1)[number];
export type EnvironmentEffortV1 = (typeof ENVIRONMENT_EFFORTS_V1)[number];
export type EnvironmentMoneyBasisV1 = 'billed' | 'amortized' | 'unknown';
export type EnvironmentSavingsAdditivityV1 = 'additive' | 'scenario-non-additive';
export type EnvironmentMoneyProvenanceV1 =
  | 'subscription-summary'
  | 'subscription-resources'
  | 'cost-savings-summary'
  | 'savings-aggregate'
  | 'recommendation';

export interface EnvironmentScopeV1 {
  kind: 'azure-subscription';
  tenantId: string;
  companyId: string;
  subscriptionId: string;
}

export interface EnvironmentSourceGenerationV1 {
  viewSetSchemaVersion: 1;
  publicationId: string;
  portalRunId: string;
  pluginRunId: string;
  economicsGenerationId: string;
  economicsFingerprint: string;
  completedAt: string;
}

export interface EnvironmentSourceBindingV1 extends EnvironmentSourceGenerationV1 {
  kind: 'azure-subscription-view-set';
  scope: EnvironmentScopeV1;
}

export type EnvironmentLogicalArtifactReferenceV1 = `spotto://artifact/v1/${EnvironmentArtifactKindV1}/${string}`;
export type EnvironmentLogicalResourceReferenceV1 = `spotto://resource/v1/${string}`;
export type EnvironmentLogicalEvidenceReferenceV1 = EnvironmentLogicalArtifactReferenceV1 | EnvironmentLogicalResourceReferenceV1;

export interface ParsedEnvironmentLogicalArtifactReferenceV1 {
  kind: 'artifact';
  artifactKind: EnvironmentArtifactKindV1;
  subject: string;
}

export interface ParsedEnvironmentLogicalResourceReferenceV1 {
  kind: 'resource';
  resourceId: string;
}

export type ParsedEnvironmentLogicalEvidenceReferenceV1 = ParsedEnvironmentLogicalArtifactReferenceV1 | ParsedEnvironmentLogicalResourceReferenceV1;

export interface EnvironmentMoneyValueV1 {
  amount: string;
  currencyCode: string;
  basis: EnvironmentMoneyBasisV1;
  period: string;
  provenance: EnvironmentMoneyProvenanceV1;
  savingsAdditivity?: EnvironmentSavingsAdditivityV1;
}

interface EnvironmentCoverageBaseV1 {
  observedAt?: string;
  completeThrough?: string;
}

export interface EnvironmentCompleteCoverageStateV1 extends EnvironmentCoverageBaseV1 {
  status: 'complete';
  reason?: never;
}

export interface EnvironmentPartialCoverageStateV1 extends EnvironmentCoverageBaseV1 {
  status: 'partial';
  reason: string;
}

export interface EnvironmentUnavailableCoverageStateV1 {
  status: 'unavailable';
  reason: string;
  observedAt?: never;
  completeThrough?: never;
}

export interface EnvironmentStaleCoverageStateV1 extends EnvironmentCoverageBaseV1 {
  status: 'stale';
  reason: string;
  observedAt: string;
}

export interface EnvironmentNotCollectedCoverageStateV1 {
  status: 'not-collected';
  reason: string;
  observedAt?: never;
  completeThrough?: never;
}

export type EnvironmentCoverageStateV1 =
  | EnvironmentCompleteCoverageStateV1
  | EnvironmentPartialCoverageStateV1
  | EnvironmentUnavailableCoverageStateV1
  | EnvironmentStaleCoverageStateV1
  | EnvironmentNotCollectedCoverageStateV1;

export interface EnvironmentBoundedListV1<T> {
  items: T[];
  totalCount: number;
  includedCount: number;
  truncated: boolean;
  continuationReference?: EnvironmentLogicalEvidenceReferenceV1;
}

export interface EnvironmentExactCardinalityV1 {
  basis: 'exact';
  value: number;
  reason?: never;
}

export interface EnvironmentLowerBoundCardinalityV1 {
  basis: 'lower-bound';
  value: number;
  reason: string;
}

export interface EnvironmentUnavailableCardinalityV1 {
  basis: 'unavailable';
  value?: never;
  reason: string;
}

/** Evidence-aware count that cannot present a lower bound as an exact distinct total. */
export type EnvironmentCardinalityV1 = EnvironmentExactCardinalityV1 | EnvironmentLowerBoundCardinalityV1 | EnvironmentUnavailableCardinalityV1;

export interface EnvironmentSubscriptionSummaryV1 {
  safeLabel: string;
  portalRoute: string;
}

export interface EnvironmentSourceCoverageV1 {
  completedViewSet: EnvironmentCoverageStateV1;
  subscriptionSummary: EnvironmentCoverageStateV1;
  resources: EnvironmentCoverageStateV1;
  recommendations: EnvironmentCoverageStateV1;
  serviceRetirements: EnvironmentCoverageStateV1;
  monitorAlerts: EnvironmentCoverageStateV1;
  pluginMetrics: EnvironmentCoverageStateV1;
}

export interface EnvironmentEstateSummaryV1 {
  resourceCount: number;
  serviceFamilyCount: number;
  locationCount: number;
}

export interface EnvironmentCostSummaryV1 {
  observedCost?: EnvironmentMoneyValueV1;
  potentialSavings?: EnvironmentMoneyValueV1;
  costRecommendationCount?: number;
}

export interface EnvironmentCostRollupV1 {
  key: string;
  safeLabel: string;
  resourceCount: number;
  observedCost?: EnvironmentMoneyValueV1;
  potentialSavings?: EnvironmentMoneyValueV1;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentCostDriverV1 {
  key: string;
  safeLabel: string;
  description?: string;
  observedCost?: EnvironmentMoneyValueV1;
  portalRoute?: string;
  resourceReference?: EnvironmentLogicalResourceReferenceV1;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentPillarScoreV1 {
  value: string;
  maximum: '100';
  safeLabel: string;
}

export interface EnvironmentPillarSummaryV1 {
  pillar: EnvironmentPillarV1;
  coverage: EnvironmentCoverageStateV1;
  findingCount: number;
  recommendationCount: number;
  affectedResources: EnvironmentCardinalityV1;
  portalRoute: string;
  score?: EnvironmentPillarScoreV1;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export type EnvironmentPillarSummariesV1 = {
  [Pillar in EnvironmentPillarV1]: EnvironmentPillarSummaryV1 & { pillar: Pillar };
};

export interface EnvironmentFindingV1 {
  findingId: string;
  pillar: EnvironmentPillarV1;
  kind: EnvironmentFindingKindV1;
  safeLabel: string;
  severity: EnvironmentSeverityV1;
  description?: string;
  impact?: EnvironmentImpactV1;
  effort?: EnvironmentEffortV1;
  affectedResources?: EnvironmentCardinalityV1;
  portalRoute?: string;
  resourceReferences: EnvironmentLogicalResourceReferenceV1[];
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentRecommendationV1 {
  recommendationId: string;
  pillar: EnvironmentPillarV1;
  safeLabel: string;
  portalRoute: string;
  description?: string;
  impact?: EnvironmentImpactV1;
  effort?: EnvironmentEffortV1;
  affectedResources?: EnvironmentCardinalityV1;
  potentialSavings?: EnvironmentMoneyValueV1;
  resourceReferences: EnvironmentLogicalResourceReferenceV1[];
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentChangeV1 {
  key: string;
  pillars: EnvironmentPillarV1[];
  safeLabel: string;
  description: string;
  direction: 'increase' | 'decrease' | 'unchanged' | 'unknown';
  amount?: EnvironmentMoneyValueV1;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentProjectionWarningV1 {
  code: string;
  safeLabel: string;
  pillar?: EnvironmentPillarV1;
  detail?: string;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export interface EnvironmentSubscriptionProjectionV1 {
  schemaVersion: 1;
  scope: EnvironmentScopeV1;
  sourceBinding: EnvironmentSourceBindingV1;
  generatedAt: string;
  subscription: EnvironmentSubscriptionSummaryV1;
  sourceCoverage: EnvironmentSourceCoverageV1;
  estateSummary: EnvironmentEstateSummaryV1;
  costSummary: EnvironmentCostSummaryV1;
  serviceFamilyRollups: EnvironmentBoundedListV1<EnvironmentCostRollupV1>;
  estateCostRollups: EnvironmentBoundedListV1<EnvironmentCostRollupV1>;
  costDrivers: EnvironmentBoundedListV1<EnvironmentCostDriverV1>;
  pillars: EnvironmentPillarSummariesV1;
  findings: EnvironmentBoundedListV1<EnvironmentFindingV1>;
  recommendations: EnvironmentBoundedListV1<EnvironmentRecommendationV1>;
  changes: EnvironmentBoundedListV1<EnvironmentChangeV1>;
  warnings: EnvironmentBoundedListV1<EnvironmentProjectionWarningV1>;
  sourceReferences: EnvironmentLogicalEvidenceReferenceV1[];
}

export type EnvironmentDocumentDescriptorV1 =
  | {
      name: 'projection.json';
      mediaType: 'application/json';
      byteCount: number;
      contentSha256: string;
      approximateTokenCount: number;
    }
  | {
      name: EnvironmentMarkdownDocumentNameV1;
      mediaType: 'text/markdown; charset=utf-8';
      byteCount: number;
      contentSha256: string;
      approximateTokenCount: number;
    };

export interface EnvironmentCompiledGenerationPointerV1 {
  schemaVersion: 1;
  status: 'completed';
  environmentRunId: string;
  scope: EnvironmentScopeV1;
  sourceBinding: EnvironmentSourceBindingV1;
  treeDigestSha256: string;
  fileCount: (typeof ENVIRONMENT_DOCUMENT_NAMES_V1)['length'];
  generatedAt: string;
}
