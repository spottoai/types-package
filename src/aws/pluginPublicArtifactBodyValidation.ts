import {
  AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsPluginResourceLogicalName,
  buildAwsPluginSubscriptionLogicalName,
  sha256AwsPluginIdentity,
  type AwsPluginArtifactTarget,
  type AwsPluginResourceDetailArtifact,
  type AwsPluginSubscriptionDetailArtifact,
} from './pluginPublicArtifacts';
import { AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION } from './publicArtifacts';
import {
  asRecord,
  assertAccount,
  assertExactKeys,
  assertJsonEqual,
  assertPublicJson,
  assertValue,
  isoTimestamp,
  optionalEnum,
  requiredEnum,
  requiredString,
  sha256,
  stringArray,
  validateBilling,
  validateMetricWindow,
  validateSelector,
  validateTagRuleScope,
} from './pluginPublicArtifactValidationHelpers';
import { validateResourceSections, validateSubscriptionSections } from './pluginPublicArtifactSectionValidation';

export { validateSourceBinding } from './pluginPublicArtifactSectionValidation';

/** Validates and returns one lossless AWS plugin subscription-detail body. */
export function validateAwsPluginSubscriptionDetailArtifact(value: unknown): AwsPluginSubscriptionDetailArtifact {
  const artifact = asRecord(value, 'artifact');
  assertExactKeys(
    artifact,
    [
      'schemaVersion',
      'pluginSchemaVersion',
      'provider',
      'accountId',
      'artifactType',
      'artifactGeneration',
      'generatedAt',
      'logicalName',
      'target',
      'sections',
    ],
    'artifact'
  );
  validateArtifactEnvelope(artifact, 'plugin-subscription');
  const target = validateTarget(artifact.target, 'subscription-detail');
  const accountId = requiredString(artifact.accountId, 'artifact.accountId');
  assertAccount(target.accountId, accountId, 'artifact.target.accountId');
  assertValue(artifact.logicalName, buildAwsPluginSubscriptionLogicalName(target.targetKeySha256), 'artifact.logicalName');
  validateSubscriptionSections(artifact.sections, target, requiredString(artifact.generatedAt, 'artifact.generatedAt'));
  assertPublicJson(artifact, 'artifact');
  return value as AwsPluginSubscriptionDetailArtifact;
}

/** Validates and returns one lossless AWS plugin resource-detail body. */
export function validateAwsPluginResourceDetailArtifact(value: unknown): AwsPluginResourceDetailArtifact {
  const artifact = asRecord(value, 'artifact');
  assertExactKeys(
    artifact,
    [
      'schemaVersion',
      'pluginSchemaVersion',
      'provider',
      'accountId',
      'artifactType',
      'artifactGeneration',
      'generatedAt',
      'logicalName',
      'target',
      'selector',
      'stableKey',
      'sections',
    ],
    'artifact'
  );
  validateArtifactEnvelope(artifact, 'plugin-resource');
  const target = validateTarget(artifact.target, 'resource-detail');
  const accountId = requiredString(artifact.accountId, 'artifact.accountId');
  assertAccount(target.accountId, accountId, 'artifact.target.accountId');
  assertValue(artifact.logicalName, buildAwsPluginResourceLogicalName(target.stableKeySha256, target.targetKeySha256), 'artifact.logicalName');
  assertJsonEqual(artifact.selector, target.selector, 'artifact.selector');
  assertValue(artifact.stableKey, target.stableKey, 'artifact.stableKey');
  validateResourceSections(artifact.sections, target, requiredString(artifact.generatedAt, 'artifact.generatedAt'));
  assertPublicJson(artifact, 'artifact');
  return value as AwsPluginResourceDetailArtifact;
}

function validateArtifactEnvelope(artifact: Record<string, unknown>, artifactType: 'plugin-subscription' | 'plugin-resource'): void {
  assertValue(artifact.schemaVersion, AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.schemaVersion');
  assertValue(artifact.pluginSchemaVersion, AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION, 'artifact.pluginSchemaVersion');
  assertValue(artifact.provider, 'aws', 'artifact.provider');
  requiredString(artifact.accountId, 'artifact.accountId');
  assertValue(artifact.artifactType, artifactType, 'artifact.artifactType');
  const generation = validateGeneration(artifact.artifactGeneration, 'artifact.artifactGeneration');
  assertValue(isoTimestamp(artifact.generatedAt, 'artifact.generatedAt'), generation.generatedAt, 'artifact.generatedAt');
}

function validateGeneration(value: unknown, field: string): { runId: string; generatedAt: string } {
  const generation = asRecord(value, field);
  assertExactKeys(generation, ['runId', 'generatedAt'], field);
  return {
    runId: requiredString(generation.runId, `${field}.runId`),
    generatedAt: isoTimestamp(generation.generatedAt, `${field}.generatedAt`),
  };
}

export function validateTarget<Kind extends 'subscription-detail' | 'resource-detail'>(
  value: unknown,
  kind: Kind
): Extract<AwsPluginArtifactTarget, { kind: Kind }> {
  const target = asRecord(value, 'target');
  assertValue(target.kind, kind, 'target.kind');
  assertValue(target.provider, 'aws', 'target.provider');
  requiredString(target.accountId, 'target.accountId');
  requiredString(target.targetKey, 'target.targetKey');
  sha256(target.targetKeySha256, 'target.targetKeySha256');
  assertValue(target.targetKeySha256, sha256AwsPluginIdentity(requiredString(target.targetKey, 'target.targetKey')), 'target.targetKeySha256');
  validateBilling(target.billing);
  stringArray(target.resourceRegions, 'target.resourceRegions');
  validateMetricWindow(target.metricTimeWindow, 'target.metricTimeWindow');
  validateRecommendationScopes(target.recommendationScopes, requiredString(target.accountId, 'target.accountId'));

  if (kind === 'subscription-detail') {
    assertExactKeys(
      target,
      [
        'kind',
        'provider',
        'accountId',
        'targetKey',
        'targetKeySha256',
        'accountSummaryTargetKey',
        'resourceCollectionTargetKey',
        'recommendationsTargetKey',
        'aiCostSummaryTargetKey',
        'serviceRetirementTargetKey',
        'commitmentAnalysisTargetKey',
        'reliabilityTargetKey',
        'accountGovernanceTargetKey',
        'billing',
        'resourceRegions',
        'metricTimeWindow',
        'aiCostSummaryAudience',
        'serviceRetirementRegions',
        'recommendationScopes',
        'commitmentAnalysis',
        'reliability',
        'accountGovernance',
      ],
      'target'
    );
    optionalEnum(target.aiCostSummaryAudience, ['portal', 'plugin'], 'target.aiCostSummaryAudience');
    requiredString(target.accountSummaryTargetKey, 'target.accountSummaryTargetKey');
    requiredString(target.resourceCollectionTargetKey, 'target.resourceCollectionTargetKey');
    requiredString(target.recommendationsTargetKey, 'target.recommendationsTargetKey');
    requiredString(target.serviceRetirementTargetKey, 'target.serviceRetirementTargetKey');
    validateOptionalTargetKey(target.aiCostSummaryTargetKey, target.aiCostSummaryAudience !== undefined, 'target.aiCostSummaryTargetKey');
    validateOptionalTargetKey(target.commitmentAnalysisTargetKey, target.commitmentAnalysis !== undefined, 'target.commitmentAnalysisTargetKey');
    validateOptionalTargetKey(target.reliabilityTargetKey, target.reliability !== undefined, 'target.reliabilityTargetKey');
    validateOptionalTargetKey(target.accountGovernanceTargetKey, target.accountGovernance !== undefined, 'target.accountGovernanceTargetKey');
    stringArray(target.serviceRetirementRegions, 'target.serviceRetirementRegions');
    validateCommitmentAnalysisTarget(target.commitmentAnalysis);
    validateReliabilityTarget(target.reliability);
    validateAccountGovernanceTarget(target.accountGovernance);
  } else {
    assertExactKeys(
      target,
      [
        'kind',
        'provider',
        'accountId',
        'targetKey',
        'targetKeySha256',
        'resourceCollectionTargetKey',
        'recommendationsTargetKey',
        'billing',
        'resourceRegions',
        'metricTimeWindow',
        'tagRuleScope',
        'selector',
        'stableKey',
        'stableKeySha256',
        'relationshipTargetKey',
        'serviceRetirementTargetKey',
        'recommendationScopes',
      ],
      'target'
    );
    validateTagRuleScope(target.tagRuleScope);
    requiredString(target.resourceCollectionTargetKey, 'target.resourceCollectionTargetKey');
    requiredString(target.recommendationsTargetKey, 'target.recommendationsTargetKey');
    validateSelector(target.selector, 'target.selector');
    const stableKey = requiredString(target.stableKey, 'target.stableKey');
    if (asRecord(target.selector, 'target.selector').kind === 'stable-key') {
      assertValue(asRecord(target.selector, 'target.selector').stableKey, stableKey, 'target.selector.stableKey');
    }
    sha256(target.stableKeySha256, 'target.stableKeySha256');
    assertValue(target.stableKeySha256, sha256AwsPluginIdentity(stableKey), 'target.stableKeySha256');
    requiredString(target.relationshipTargetKey, 'target.relationshipTargetKey');
    requiredString(target.serviceRetirementTargetKey, 'target.serviceRetirementTargetKey');
  }
  return value as Extract<AwsPluginArtifactTarget, { kind: Kind }>;
}

function validateOptionalTargetKey(value: unknown, required: boolean, field: string): void {
  if (required) requiredString(value, field);
  else if (value !== undefined) throw new Error(`${field} requires its corresponding optional target.`);
}

function validateCommitmentAnalysisTarget(value: unknown): void {
  if (value === undefined) return;
  const target = asRecord(value, 'target.commitmentAnalysis');
  assertExactKeys(target, ['resourceRegions', 'maxBenefitEntries'], 'target.commitmentAnalysis');
  stringArray(target.resourceRegions, 'target.commitmentAnalysis.resourceRegions');
  if (!Number.isSafeInteger(target.maxBenefitEntries) || Number(target.maxBenefitEntries) <= 0) {
    throw new Error('target.commitmentAnalysis.maxBenefitEntries must be a positive safe integer.');
  }
}

function validateReliabilityTarget(value: unknown): void {
  if (value === undefined) return;
  const target = asRecord(value, 'target.reliability');
  assertExactKeys(target, ['includeTemplateContent', 'includeScoring', 'maxResultsPerSection', 'sectionScopeKeys'], 'target.reliability');
  if (target.includeTemplateContent !== undefined) assertValue(target.includeTemplateContent, true, 'target.reliability.includeTemplateContent');
  if (target.includeScoring !== undefined) assertValue(target.includeScoring, true, 'target.reliability.includeScoring');
  if (!Number.isSafeInteger(target.maxResultsPerSection) || Number(target.maxResultsPerSection) <= 0) {
    throw new Error('target.reliability.maxResultsPerSection must be a positive safe integer.');
  }
  stringArray(target.sectionScopeKeys, 'target.reliability.sectionScopeKeys');
}

function validateAccountGovernanceTarget(value: unknown): void {
  if (value === undefined) return;
  const target = asRecord(value, 'target.accountGovernance');
  assertExactKeys(target, ['apiRegion'], 'target.accountGovernance');
  requiredString(target.apiRegion, 'target.accountGovernance.apiRegion');
}

function validateRecommendationScopes(value: unknown, accountId: string): void {
  if (!Array.isArray(value)) throw new Error('target.recommendationScopes must be an array.');
  const scopes = value;
  scopes.forEach((value, index) => {
    const field = `target.recommendationScopes[${index}]`;
    const scope = asRecord(value, field);
    assertExactKeys(
      scope,
      ['source', 'scope', 'accountId', 'scopeDiscriminator', 'computeOptimizerFamily', 'resourceRegions', 'targetKey', 'actionabilityTargetKey'],
      field
    );
    requiredEnum(
      scope.source,
      ['custom', 'compute-optimizer', 'cost-optimization-hub', 'resilience-hub', 'security-hub', 'trusted-advisor', 'well-architected'],
      `${field}.source`
    );
    assertValue(scope.scope, 'account', `${field}.scope`);
    assertAccount(scope.accountId, accountId, `${field}.accountId`);
    if (scope.scopeDiscriminator !== undefined) requiredString(scope.scopeDiscriminator, `${field}.scopeDiscriminator`);
    if (scope.computeOptimizerFamily !== undefined) requiredString(scope.computeOptimizerFamily, `${field}.computeOptimizerFamily`);
    stringArray(scope.resourceRegions, `${field}.resourceRegions`);
    requiredString(scope.targetKey, `${field}.targetKey`);
    requiredString(scope.actionabilityTargetKey, `${field}.actionabilityTargetKey`);
  });
}
