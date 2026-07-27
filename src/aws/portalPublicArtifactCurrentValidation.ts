import {
  AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME,
  AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME,
  type AwsPortalAccountSummaryDetailArtifact,
  type AwsPortalResourceCollectionDetailArtifact,
} from './portalPublicArtifacts';
import {
  asRecord,
  assertExactKeys,
  assertPublicJson,
  assertRegionsBelong,
  assertUnique,
  assertValue,
  isoTimestamp,
  nonNegativeInteger,
  requiredBoolean,
  requiredEnum,
  requiredString,
  stringArray,
  validateAccountScope,
  validateFreshness,
  validateJsonArray,
  validateJsonObject,
  validatePortalEnvelope,
  validateResourceScope,
} from './portalPublicArtifactValidationCommon';
import { validateAwsPortalBillingBlock, validateAwsPortalRecommendationCoverage } from './portalPublicArtifactEvidenceValidation';
import {
  validateRecommendationActionability,
  validateResourceBillingEvidence,
  validateTemplateProvenanceSources,
} from './portalPublicArtifactNestedEvidenceValidation';

const DISCOVERY_FAMILIES = [
  'ec2-instance',
  'ebs-volume',
  'efs-file-system',
  'lambda-function',
  'elasticache-cache-cluster',
  'elasticache-serverless-cache',
  'vpc',
  'subnet',
  'route-table',
  'internet-gateway',
  'nat-gateway',
  'network-interface',
  'virtual-private-gateway',
  'load-balancer-v2',
  'classic-load-balancer',
  'security-group',
  'rds-db-cluster',
  'rds-db-instance',
] as const;
const METRIC_FAMILIES = [
  'ec2-core-utilization',
  'ebs-volume-performance',
  'lambda-function-performance',
  'load-balancer-v2-network-traffic',
  'load-balancer-v2-application-traffic',
  'rds-db-instance-utilization',
] as const;
const RECOMMENDATION_SOURCES = [
  'custom',
  'compute-optimizer',
  'cost-optimization-hub',
  'resilience-hub',
  'security-hub',
  'trusted-advisor',
  'well-architected',
] as const;

const CURRENT_KEYS = [
  'schemaVersion',
  'portalSchemaVersion',
  'provider',
  'accountId',
  'artifactType',
  'artifactGeneration',
  'generatedAt',
  'logicalName',
  'scope',
] as const;

export function validateAwsPortalResourceCollectionDetailArtifact(value: unknown): AwsPortalResourceCollectionDetailArtifact {
  const artifact = asRecord(value, 'artifact');
  const { accountId } = validatePortalEnvelope(artifact, 'resource-collection', [...CURRENT_KEYS, 'summary', 'coverage', 'resources']);
  assertValue(artifact.logicalName, AWS_PORTAL_RESOURCE_COLLECTION_LOGICAL_NAME, 'artifact.logicalName');
  const scope = validateResourceScope(artifact.scope, accountId, 'artifact.scope');
  validateResourceSummary(artifact.summary, 'artifact.summary');
  validateResourceCoverage(artifact.coverage, accountId, scope);
  if (!Array.isArray(artifact.resources)) throw new Error('artifact.resources must be an array.');
  validateResources(artifact.resources, scope.resourceRegions);
  const summary = asRecord(artifact.summary, 'artifact.summary');
  if (summary.returnedResourceCount !== artifact.resources.length)
    throw new Error('artifact.summary.returnedResourceCount must equal artifact.resources length.');
  if (Number(summary.totalDiscoveredResourceCount) < Number(summary.returnedResourceCount))
    throw new Error('artifact.summary.totalDiscoveredResourceCount must not be less than returnedResourceCount.');
  assertPublicJson(artifact, 'artifact');
  return value as AwsPortalResourceCollectionDetailArtifact;
}

export function validateAwsPortalAccountSummaryDetailArtifact(value: unknown): AwsPortalAccountSummaryDetailArtifact {
  const artifact = asRecord(value, 'artifact');
  const { accountId } = validatePortalEnvelope(artifact, 'account-summary', [
    ...CURRENT_KEYS,
    'account',
    'billing',
    'discovery',
    'metrics',
    'recommendations',
  ]);
  assertValue(artifact.logicalName, AWS_PORTAL_ACCOUNT_SUMMARY_LOGICAL_NAME, 'artifact.logicalName');
  const scope = validateAccountScope(artifact.scope, accountId, 'artifact.scope');
  validateAccount(artifact.account, accountId);
  validateAwsPortalBillingBlock(artifact.billing, 'artifact.billing', scope.billing, accountId, true);
  validateDiscovery(artifact.discovery, scope.resourceRegions, 'artifact.discovery');
  validateMetrics(artifact.metrics, scope.resourceRegions, 'artifact.metrics', 'account');
  validateAwsPortalRecommendationCoverage(
    artifact.recommendations,
    accountId,
    scope.resourceRegions,
    'artifact.recommendations',
    RECOMMENDATION_SOURCES,
    true
  );
  assertPublicJson(artifact, 'artifact');
  return value as AwsPortalAccountSummaryDetailArtifact;
}

function validateResourceSummary(value: unknown, field: string): void {
  const summary = asRecord(value, field);
  const keys = [
    'totalDiscoveredResourceCount',
    'returnedResourceCount',
    'emptyCollection',
    'truncated',
    'unmatchedRecommendationResourceCount',
    'unmatchedBillingExpenseCount',
  ];
  assertExactKeys(summary, keys, field);
  keys.filter(key => !['emptyCollection', 'truncated'].includes(key)).forEach(key => nonNegativeInteger(summary[key], `${field}.${key}`));
  requiredBoolean(summary.emptyCollection, `${field}.emptyCollection`);
  requiredBoolean(summary.truncated, `${field}.truncated`);
  if (summary.emptyCollection === true && Number(summary.returnedResourceCount) !== 0)
    throw new Error(`${field}.emptyCollection requires zero returned resources.`);
}

function validateResourceCoverage(value: unknown, accountId: string, scope: ReturnType<typeof validateResourceScope>): void {
  const coverage = asRecord(value, 'artifact.coverage');
  assertExactKeys(coverage, ['billing', 'discovery', 'metrics', 'recommendations', 'virtualTags'], 'artifact.coverage');
  validateAwsPortalBillingBlock(coverage.billing, 'artifact.coverage.billing', scope.billing, accountId, false);
  validateDiscovery(coverage.discovery, scope.resourceRegions, 'artifact.coverage.discovery');
  validateMetrics(coverage.metrics, scope.resourceRegions, 'artifact.coverage.metrics', 'resource');
  validateAwsPortalRecommendationCoverage(
    coverage.recommendations,
    accountId,
    scope.resourceRegions,
    'artifact.coverage.recommendations',
    RECOMMENDATION_SOURCES,
    false
  );
  if (coverage.virtualTags !== undefined) validateVirtualTags(coverage.virtualTags);
}

function validateDiscovery(value: unknown, regions: string[], field: string): void {
  const discovery = asRecord(value, field);
  assertExactKeys(discovery, ['families'], field);
  if (!Array.isArray(discovery.families)) throw new Error(`${field}.families must be an array.`);
  const identities: string[] = [];
  discovery.families.forEach((entry, index) => {
    const itemField = `${field}.families[${index}]`;
    const family = asRecord(entry, itemField);
    assertExactKeys(family, ['family', 'resourceRegion', 'freshness', 'summary', 'groupedTotals'], itemField);
    const familyName = requiredEnum(family.family, DISCOVERY_FAMILIES, `${itemField}.family`);
    const region = requiredString(family.resourceRegion, `${itemField}.resourceRegion`);
    if (!regions.includes(region)) throw new Error(`${itemField}.resourceRegion is outside artifact scope.`);
    identities.push(`${familyName}|${region}`);
    validateFreshness(family.freshness, `${itemField}.freshness`, 'lastSuccessfulRefreshAt');
    validateJsonObject(family.summary, `${itemField}.summary`);
    validateJsonObject(family.groupedTotals, `${itemField}.groupedTotals`);
  });
  assertUnique(identities, `${field}.families`);
}

function validateMetrics(value: unknown, regions: string[], field: string, kind: 'resource' | 'account'): void {
  const metrics = asRecord(value, field);
  assertExactKeys(metrics, ['families'], field);
  if (!Array.isArray(metrics.families)) throw new Error(`${field}.families must be an array.`);
  const identities: string[] = [];
  metrics.families.forEach((entry, index) => {
    const itemField = `${field}.families[${index}]`;
    const family = asRecord(entry, itemField);
    const keys =
      kind === 'resource'
        ? ['metricFamily', 'resourceRegion', 'requestedMonths', 'availableMonths', 'missingMonths', 'coverage', 'summary']
        : ['metricFamily', 'resourceRegion', 'status', 'requestedMonths', 'availableMonths', 'missingMonths', 'freshness', 'readiness', 'summary'];
    assertExactKeys(family, keys, itemField);
    const metricFamily = requiredEnum(family.metricFamily, METRIC_FAMILIES, `${itemField}.metricFamily`);
    const region = requiredString(family.resourceRegion, `${itemField}.resourceRegion`);
    if (!regions.includes(region)) throw new Error(`${itemField}.resourceRegion is outside artifact scope.`);
    identities.push(`${metricFamily}|${region}`);
    if (family.status !== undefined) requiredEnum(family.status, ['available', 'not-found'], `${itemField}.status`);
    const requestedMonths = stringArray(family.requestedMonths, `${itemField}.requestedMonths`);
    const availableMonths = stringArray(family.availableMonths, `${itemField}.availableMonths`);
    const missingMonths = stringArray(family.missingMonths, `${itemField}.missingMonths`);
    [...requestedMonths, ...availableMonths, ...missingMonths].forEach(month => {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error(`${itemField} contains a non-canonical billing month: ${month}.`);
    });
    const classifiedMonths = [...availableMonths, ...missingMonths].sort();
    assertUnique(classifiedMonths, `${itemField} classified months`);
    if (JSON.stringify(requestedMonths) !== JSON.stringify(classifiedMonths))
      throw new Error(`${itemField} requestedMonths must equal availableMonths plus missingMonths.`);
    if (family.freshness !== undefined) validateFreshness(family.freshness, `${itemField}.freshness`, 'lastSuccessfulRefreshAt');
    if (family.readiness !== undefined) validateJsonObject(family.readiness, `${itemField}.readiness`);
    if (family.coverage !== undefined) validateJsonObject(family.coverage, `${itemField}.coverage`);
    if (family.summary !== undefined) validateJsonObject(family.summary, `${itemField}.summary`);
  });
  assertUnique(identities, `${field}.families`);
}

function validateVirtualTags(value: unknown): void {
  const tags = asRecord(value, 'artifact.coverage.virtualTags');
  assertExactKeys(
    tags,
    ['status', 'source', 'generatedAt', 'rulesHash', 'enabledRuleCount', 'appliedRuleCount', 'taggedResourceCount', 'unsupportedRuleCount', 'reason'],
    'artifact.coverage.virtualTags'
  );
  requiredEnum(tags.status, ['available', 'missing', 'malformed', 'unsupported'], 'artifact.coverage.virtualTags.status');
  assertValue(tags.source, 'spotto-tags', 'artifact.coverage.virtualTags.source');
  isoTimestamp(tags.generatedAt, 'artifact.coverage.virtualTags.generatedAt');
  if (tags.rulesHash !== undefined && !/^[a-f0-9]{64}$/.test(String(tags.rulesHash)))
    throw new Error('artifact.coverage.virtualTags.rulesHash must be a SHA-256.');
  ['enabledRuleCount', 'appliedRuleCount', 'taggedResourceCount', 'unsupportedRuleCount'].forEach(key =>
    nonNegativeInteger(tags[key], `artifact.coverage.virtualTags.${key}`)
  );
  if (tags.reason !== undefined) requiredString(tags.reason, 'artifact.coverage.virtualTags.reason');
}

function validateResources(value: unknown, regions: string[]): void {
  if (!Array.isArray(value)) throw new Error('artifact.resources must be an array.');
  const stableKeys: string[] = [];
  value.forEach((entry, index) => {
    const field = `artifact.resources[${index}]`;
    const resource = asRecord(entry, field);
    assertExactKeys(
      resource,
      [
        'stableKey',
        'family',
        'resourceRegion',
        'resourceType',
        'resourceArn',
        'resourceId',
        'resourceName',
        'tags',
        'spottoTags',
        'discovery',
        'billing',
        'metrics',
        'recommendations',
      ],
      field
    );
    stableKeys.push(requiredString(resource.stableKey, `${field}.stableKey`));
    requiredEnum(resource.family, DISCOVERY_FAMILIES, `${field}.family`);
    const region = requiredString(resource.resourceRegion, `${field}.resourceRegion`);
    if (!regions.includes(region)) throw new Error(`${field}.resourceRegion is outside artifact scope.`);
    requiredString(resource.resourceType, `${field}.resourceType`);
    ['resourceArn', 'resourceId', 'resourceName'].forEach(key => {
      if (resource[key] !== undefined) requiredString(resource[key], `${field}.${key}`);
    });
    if (resource.tags !== undefined) validateStringMap(resource.tags, `${field}.tags`);
    if (resource.spottoTags !== undefined) validateJsonObject(resource.spottoTags, `${field}.spottoTags`);
    const discovery = asRecord(resource.discovery, `${field}.discovery`);
    assertExactKeys(discovery, ['freshness', 'summary'], `${field}.discovery`);
    validateFreshness(discovery.freshness, `${field}.discovery.freshness`, 'lastSuccessfulRefreshAt');
    validateJsonObject(discovery.summary, `${field}.discovery.summary`);
    if (resource.billing !== undefined) validateResourceBillingEvidence(resource.billing, `${field}.billing`);
    if (resource.metrics !== undefined) validateResourceMetrics(resource.metrics, `${field}.metrics`);
    if (resource.recommendations !== undefined) validateResourceRecommendations(resource.recommendations, `${field}.recommendations`);
  });
  assertUnique(stableKeys, 'artifact.resources');
}

function validateResourceMetrics(value: unknown, field: string): void {
  const metrics = asRecord(value, field);
  assertExactKeys(metrics, ['supported', 'families'], field);
  requiredBoolean(metrics.supported, `${field}.supported`);
  if (!Array.isArray(metrics.families)) throw new Error(`${field}.families must be an array.`);
  metrics.families.forEach((entry, index) => {
    const family = asRecord(entry, `${field}.families[${index}]`);
    assertExactKeys(family, ['metricFamily', 'summary', 'coverage'], `${field}.families[${index}]`);
    requiredEnum(family.metricFamily, METRIC_FAMILIES, `${field}.families[${index}].metricFamily`);
    validateJsonObject(family.summary, `${field}.families[${index}].summary`);
    validateJsonObject(family.coverage, `${field}.families[${index}].coverage`);
  });
}

function validateResourceRecommendations(value: unknown, field: string): void {
  const recommendations = asRecord(value, field);
  assertExactKeys(recommendations, ['matchedRecommendationCount', 'sources', 'actionability', 'templateProvenance', 'counts', 'savings'], field);
  nonNegativeInteger(recommendations.matchedRecommendationCount, `${field}.matchedRecommendationCount`);
  stringArray(recommendations.sources, `${field}.sources`).forEach(source => requiredEnum(source, RECOMMENDATION_SOURCES, `${field}.sources`));
  if (recommendations.actionability !== undefined) {
    validateRecommendationActionability(recommendations.actionability, `${field}.actionability`);
  }
  if (recommendations.templateProvenance !== undefined) validateTemplateProvenance(recommendations.templateProvenance, `${field}.templateProvenance`);
  validateJsonObject(recommendations.counts, `${field}.counts`);
  validateJsonObject(recommendations.savings, `${field}.savings`);
}

function validateTemplateProvenance(value: unknown, field: string): void {
  const provenance = asRecord(value, field);
  assertExactKeys(
    provenance,
    [
      'status',
      'templateBackedRecommendationCount',
      'missingTemplateRecommendationCount',
      'internalTemplateCount',
      'externalTemplateCount',
      'confidenceBackedRecommendationCount',
      'templateRecommendationWithoutConfidenceCount',
      'lowestConfidenceSources',
      'minimumConfidencePercentage',
      'maximumConfidencePercentage',
      'averageConfidencePercentage',
    ],
    field
  );
  requiredEnum(
    provenance.status,
    ['available-no-template-items', 'missing-template-evidence', 'missing-confidence-evidence', 'available-with-confidence'],
    `${field}.status`
  );
  [
    'templateBackedRecommendationCount',
    'missingTemplateRecommendationCount',
    'internalTemplateCount',
    'externalTemplateCount',
    'confidenceBackedRecommendationCount',
    'templateRecommendationWithoutConfidenceCount',
  ].forEach(key => nonNegativeInteger(provenance[key], `${field}.${key}`));
  validateTemplateProvenanceSources(provenance.lowestConfidenceSources, `${field}.lowestConfidenceSources`);
  ['minimumConfidencePercentage', 'maximumConfidencePercentage', 'averageConfidencePercentage'].forEach(key => {
    if (provenance[key] !== undefined && (typeof provenance[key] !== 'number' || !Number.isFinite(provenance[key])))
      throw new Error(`${field}.${key} must be finite.`);
  });
}

function validateAccount(value: unknown, accountId: string): void {
  const account = asRecord(value, 'artifact.account');
  assertExactKeys(
    account,
    [
      'metadataFound',
      'providerAccountId',
      'cloudAccountId',
      'accountName',
      'validatedAt',
      'providerPartition',
      'summary',
      'firstUsefulRecommendationReadiness',
    ],
    'artifact.account'
  );
  requiredBoolean(account.metadataFound, 'artifact.account.metadataFound');
  assertValue(account.providerAccountId, accountId, 'artifact.account.providerAccountId');
  ['cloudAccountId', 'accountName', 'providerPartition'].forEach(key => {
    if (account[key] !== undefined) requiredString(account[key], `artifact.account.${key}`);
  });
  isoTimestamp(account.validatedAt, 'artifact.account.validatedAt');
  validateJsonObject(account.summary, 'artifact.account.summary');
  if (account.firstUsefulRecommendationReadiness !== undefined)
    validateJsonObject(account.firstUsefulRecommendationReadiness, 'artifact.account.firstUsefulRecommendationReadiness');
}

function validateStringMap(value: unknown, field: string): void {
  const map = asRecord(value, field);
  Object.entries(map).forEach(([key, item]) => {
    requiredString(key, `${field} key`);
    requiredString(item, `${field}.${key}`);
  });
}
