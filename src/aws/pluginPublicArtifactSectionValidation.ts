import {
  AWS_PLUGIN_SOURCE_ARTIFACT_TYPES,
  type AwsPluginArtifactTarget,
  type AwsPluginResourceTarget,
  type AwsPluginSectionSourceBinding,
  type AwsPluginSubscriptionTarget,
} from './pluginPublicArtifacts';
import {
  asRecord,
  assertAccount,
  assertExactKeys,
  assertJsonEqual,
  assertPublicJson,
  assertRequiredKeys,
  assertValue,
  isoTimestamp,
  requiredEnum,
  requiredString,
  sha256,
  stringArray,
  validateBilling,
  validateMetricWindow,
  validateSelector,
  validateTagRuleScope,
} from './pluginPublicArtifactValidationHelpers';

export function validateSubscriptionSections(value: unknown, target: AwsPluginSubscriptionTarget, outputGeneratedAt: string): void {
  const sections = asRecord(value, 'artifact.sections');
  assertExactKeys(
    sections,
    [
      'accountSummary',
      'resources',
      'aiCostSummary',
      'serviceRetirement',
      'recommendations',
      'commitmentAnalysis',
      'reliability',
      'accountGovernance',
    ],
    'artifact.sections'
  );
  validateSection(sections.accountSummary, 'account-summary', target, outputGeneratedAt);
  validateSection(sections.resources, 'resources', target, outputGeneratedAt);
  validateDeclaredOptionalSection(sections.aiCostSummary, 'ai-cost-summary', target.aiCostSummaryTargetKey, target, outputGeneratedAt);
  validateSection(sections.serviceRetirement, 'service-retirement', target, outputGeneratedAt);
  validateSection(sections.recommendations, 'recommendations', target, outputGeneratedAt);
  validateDeclaredOptionalSection(sections.commitmentAnalysis, 'commitment-analysis', target.commitmentAnalysisTargetKey, target, outputGeneratedAt);
  validateDeclaredOptionalSection(sections.reliability, 'reliability', target.reliabilityTargetKey, target, outputGeneratedAt);
  validateDeclaredOptionalSection(sections.accountGovernance, 'account-governance', target.accountGovernanceTargetKey, target, outputGeneratedAt);
}

export function validateResourceSections(value: unknown, target: AwsPluginResourceTarget, outputGeneratedAt: string): void {
  const sections = asRecord(value, 'artifact.sections');
  assertExactKeys(sections, ['resource', 'relationships', 'serviceRetirement', 'recommendations'], 'artifact.sections');
  const resource = validateSection(sections.resource, 'resource', target, outputGeneratedAt);
  if (resource.status !== 'available') throw new Error('artifact.sections.resource must be available.');
  assertValue(resource.sourceGeneration.stableKey, target.stableKey, 'artifact.sections.resource.sourceGeneration.stableKey');
  const item = asRecord(asRecord(resource.evidence, 'section.resource.evidence').item, 'section.resource.evidence.item');
  assertValue(item.stableKey, target.stableKey, 'section.resource.evidence.item.stableKey');
  validateSection(sections.relationships, 'relationships', target, outputGeneratedAt);
  validateSection(sections.serviceRetirement, 'service-retirement', target, outputGeneratedAt);
  validateSection(sections.recommendations, 'recommendations', target, outputGeneratedAt);
}

function validateDeclaredOptionalSection(
  value: unknown,
  section: string,
  targetKey: string | undefined,
  target: AwsPluginArtifactTarget,
  outputGeneratedAt: string
): void {
  if (targetKey === undefined) {
    if (value !== undefined) throw new Error(`section.${section} is undeclared by its target.`);
    return;
  }
  if (value === undefined) throw new Error(`section.${section} is required by its declared target.`);
  validateSection(value, section, target, outputGeneratedAt);
}

function validateSection(
  value: unknown,
  section: string,
  target: AwsPluginArtifactTarget,
  outputGeneratedAt: string
): Record<string, unknown> & { status: string; sourceGeneration: AwsPluginSectionSourceBinding } {
  const field = `section.${section}`;
  const bodySection = asRecord(value, field);
  if (bodySection.status === 'available') {
    assertExactKeys(
      bodySection,
      ['status', 'section', 'targetKey', 'generatedAt', 'sourceGeneration', 'additionalSourceGenerations', 'evidence'],
      field
    );
    assertValue(bodySection.section, section, `${field}.section`);
    const targetKey = requiredString(bodySection.targetKey, `${field}.targetKey`);
    assertValue(targetKey, bodySectionTargetKey(section, target), `${field}.targetKey`);
    const generatedAt = isoTimestamp(bodySection.generatedAt, `${field}.generatedAt`);
    const source = validateSourceBinding(bodySection.sourceGeneration, target.accountId, section, `${field}.sourceGeneration`);
    validateSourceBindingForTarget(source, target, `${field}.sourceGeneration`);
    if (section !== 'recommendations') {
      assertValue(source.targetKey, targetKey, `${field}.sourceGeneration.targetKey`);
      assertValue(source.generatedAt, generatedAt, `${field}.sourceGeneration.generatedAt`);
    }
    if (generatedAt > outputGeneratedAt) throw new Error(`${field}.generatedAt cannot exceed output generation time.`);
    validateAdditionalSources(bodySection.additionalSourceGenerations, target, section, source);
    const sources = [source, ...((bodySection.additionalSourceGenerations as AwsPluginSectionSourceBinding[] | undefined) ?? [])];
    if (section === 'recommendations') validateCompleteRecommendationSources(sources, target, field);
    validateEvidence(bodySection.evidence, section, target, source, generatedAt);
  } else if (bodySection.status === 'not-found') {
    assertExactKeys(bodySection, ['status', 'section', 'targetKey'], field);
    assertValue(bodySection.section, section, `${field}.section`);
    assertValue(requiredString(bodySection.targetKey, `${field}.targetKey`), bodySectionTargetKey(section, target), `${field}.targetKey`);
  } else {
    throw new Error(`${field}.status is not declared.`);
  }
  return bodySection as Record<string, unknown> & { status: string; sourceGeneration: AwsPluginSectionSourceBinding };
}

function bodySectionTargetKey(section: string, target: AwsPluginArtifactTarget): string {
  if (section === 'recommendations') return target.recommendationsTargetKey;
  if (target.kind === 'resource-detail') {
    if (section === 'resource') return target.resourceCollectionTargetKey;
    if (section === 'relationships') return target.relationshipTargetKey;
    if (section === 'service-retirement') return target.serviceRetirementTargetKey;
  } else {
    const keys: Record<string, string | undefined> = {
      'account-summary': target.accountSummaryTargetKey,
      resources: target.resourceCollectionTargetKey,
      'ai-cost-summary': target.aiCostSummaryTargetKey,
      'service-retirement': target.serviceRetirementTargetKey,
      'commitment-analysis': target.commitmentAnalysisTargetKey,
      reliability: target.reliabilityTargetKey,
      'account-governance': target.accountGovernanceTargetKey,
    };
    const key = keys[section];
    if (key) return key;
  }
  throw new Error(`section.${section} has no declared target key.`);
}

export function validateSourceBinding(value: unknown, accountId: string, section: string, field: string): AwsPluginSectionSourceBinding {
  const source = asRecord(value, field);
  assertExactKeys(
    source,
    [
      'provider',
      'accountId',
      'section',
      'sourceArtifactType',
      'generationId',
      'generatedAt',
      'targetKey',
      'artifactSha256',
      'billing',
      'resourceRegions',
      'selector',
      'stableKey',
      'metricTimeWindow',
      'tagRuleScope',
    ],
    field
  );
  assertValue(source.provider, 'aws', `${field}.provider`);
  assertAccount(source.accountId, accountId, `${field}.accountId`);
  assertValue(source.section, section, `${field}.section`);
  requiredEnum(source.sourceArtifactType, AWS_PLUGIN_SOURCE_ARTIFACT_TYPES, `${field}.sourceArtifactType`);
  if (!sourceTypesForSection(section).includes(String(source.sourceArtifactType))) {
    throw new Error(`${field}.sourceArtifactType does not match section ${section}.`);
  }
  requiredString(source.generationId, `${field}.generationId`);
  isoTimestamp(source.generatedAt, `${field}.generatedAt`);
  requiredString(source.targetKey, `${field}.targetKey`);
  sha256(source.artifactSha256, `${field}.artifactSha256`);
  validateBilling(source.billing, `${field}.billing`);
  stringArray(source.resourceRegions, `${field}.resourceRegions`);
  validateMetricWindow(source.metricTimeWindow, `${field}.metricTimeWindow`);
  if (source.selector !== undefined) validateSelector(source.selector, `${field}.selector`);
  if (source.stableKey !== undefined) requiredString(source.stableKey, `${field}.stableKey`);
  validateTagRuleScope(source.tagRuleScope);
  return value as AwsPluginSectionSourceBinding;
}

export function validateSourceBindingForTarget(source: AwsPluginSectionSourceBinding, target: AwsPluginArtifactTarget, field: string): void {
  assertJsonEqual(source.billing, target.billing, `${field}.billing`);
  const expectedRegions =
    target.kind === 'subscription-detail' && source.section === 'service-retirement'
      ? target.serviceRetirementRegions
      : target.kind === 'subscription-detail' && source.section === 'commitment-analysis'
        ? target.commitmentAnalysis?.resourceRegions
        : target.resourceRegions;
  assertJsonEqual(source.resourceRegions, expectedRegions, `${field}.resourceRegions`);
  assertJsonEqual(source.metricTimeWindow, target.metricTimeWindow, `${field}.metricTimeWindow`);
  const expectedTargetKeys = expectedSourceTargetKeys(source, target);
  if (!expectedTargetKeys.includes(source.targetKey)) {
    throw new Error(`${field}.targetKey does not match the exact declared section target.`);
  }
  if (target.kind === 'resource-detail') {
    assertJsonEqual(source.selector, target.selector, `${field}.selector`);
    assertValue(source.stableKey, target.stableKey, `${field}.stableKey`);
    assertJsonEqual(source.tagRuleScope, target.tagRuleScope, `${field}.tagRuleScope`);
  } else if (source.selector !== undefined || source.stableKey !== undefined || source.tagRuleScope !== undefined) {
    throw new Error(`${field} contains resource-only selector, stable-key, or tag-rule scope.`);
  }
}

function expectedSourceTargetKeys(source: AwsPluginSectionSourceBinding, target: AwsPluginArtifactTarget): string[] {
  if (source.section === 'recommendations') {
    return target.recommendationScopes.map(scope =>
      source.sourceArtifactType === 'recommendation-actionability' ? scope.actionabilityTargetKey : scope.targetKey
    );
  }
  if (target.kind === 'resource-detail') {
    if (source.section === 'resource') return [target.resourceCollectionTargetKey];
    if (source.section === 'relationships') return [target.relationshipTargetKey];
    if (source.section === 'service-retirement') return [target.serviceRetirementTargetKey];
  } else {
    const targetBySection: Record<string, string | undefined> = {
      'account-summary': target.accountSummaryTargetKey,
      resources: target.resourceCollectionTargetKey,
      'ai-cost-summary': target.aiCostSummaryTargetKey,
      'service-retirement': target.serviceRetirementTargetKey,
      'commitment-analysis': target.commitmentAnalysisTargetKey,
      reliability: target.reliabilityTargetKey,
      'account-governance': target.accountGovernanceTargetKey,
    };
    const targetKey = targetBySection[source.section];
    if (targetKey) return [targetKey];
  }
  throw new Error(`No exact target is declared for ${source.section}/${source.sourceArtifactType}.`);
}

function validateAdditionalSources(value: unknown, target: AwsPluginArtifactTarget, section: string, primary: AwsPluginSectionSourceBinding): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`section.${section}.additionalSourceGenerations must be a non-empty array when declared.`);
  }
  const identities = new Set([sourceIdentity(primary)]);
  value.forEach((source, index) => {
    const field = `section.${section}.additionalSourceGenerations[${index}]`;
    const binding = validateSourceBinding(source, target.accountId, section, field);
    validateSourceBindingForTarget(binding, target, field);
    const identity = sourceIdentity(binding);
    if (identities.has(identity)) throw new Error(`section.${section} contains a duplicate source-generation binding.`);
    identities.add(identity);
  });
}

function sourceIdentity(source: AwsPluginSectionSourceBinding): string {
  return [source.section, source.sourceArtifactType, source.generationId, source.targetKey, source.artifactSha256].join('|');
}

function validateCompleteRecommendationSources(sources: AwsPluginSectionSourceBinding[], target: AwsPluginArtifactTarget, field: string): void {
  const expected = target.recommendationScopes.flatMap(scope => [
    `recommendations|${scope.targetKey}`,
    `recommendation-actionability|${scope.actionabilityTargetKey}`,
  ]);
  const actual = sources.map(source => `${source.sourceArtifactType}|${source.targetKey}`);
  assertJsonEqual([...actual].sort(), [...expected].sort(), `${field}.sourceGenerations complete recommendation source set`);
}

function sourceTypesForSection(section: string): string[] {
  const sourceBySection: Record<string, string[]> = {
    'account-summary': ['account-summary'],
    resources: ['resource-collection'],
    resource: ['resource-collection'],
    'ai-cost-summary': ['ai-cost-summary'],
    relationships: ['relationships'],
    'service-retirement': ['lifecycle'],
    recommendations: ['recommendations', 'recommendation-actionability'],
    'commitment-analysis': ['commitment-analysis'],
    reliability: ['reliability'],
    'account-governance': ['account-governance'],
  };
  const source = sourceBySection[section];
  if (!source) throw new Error(`section ${section} is not declared.`);
  return source;
}

function validateEvidence(
  value: unknown,
  section: string,
  target: AwsPluginArtifactTarget,
  source: AwsPluginSectionSourceBinding,
  generatedAt: string
): void {
  const field = `section.${section}.evidence`;
  const evidence = asRecord(value, field);
  const shape = EVIDENCE_SHAPES[section];
  if (!shape) throw new Error(`section ${section} has no declared evidence contract.`);
  assertExactKeys(evidence, shape.allowed, field);
  const required =
    section === 'service-retirement'
      ? 'summary' in evidence || 'entries' in evidence
        ? ['summary', 'entries']
        : ['stats', 'refreshMetadataBySource', 'refreshMetadataByFamily', 'highlights']
      : shape.required;
  assertRequiredKeys(evidence, required, field);
  assertPublicJson(evidence, field);
  validateEvidenceStructure(evidence, section, target, source, generatedAt, field);
}

function validateEvidenceStructure(
  evidence: Record<string, unknown>,
  section: string,
  target: AwsPluginArtifactTarget,
  source: AwsPluginSectionSourceBinding,
  generatedAt: string,
  field: string
): void {
  if (section === 'account-summary') {
    const artifact = asRecord(evidence.artifact, `${field}.artifact`);
    assertExactKeys(
      artifact,
      ['artifactType', 'artifactVersion', 'generatedAt', 'scope', 'account', 'billing', 'discovery', 'metrics', 'recommendations'],
      `${field}.artifact`
    );
    assertValue(artifact.artifactType, 'account-summary', `${field}.artifact.artifactType`);
    assertValue(artifact.artifactVersion, 1, `${field}.artifact.artifactVersion`);
    assertValue(isoTimestamp(artifact.generatedAt, `${field}.artifact.generatedAt`), generatedAt, `${field}.artifact.generatedAt`);
    assertValue(source.generatedAt, generatedAt, `${field}.sourceGeneration.generatedAt`);
    validatePortalScope(artifact.scope, target, `${field}.artifact.scope`);
  } else if (section === 'resources') {
    validateResourceSummary(evidence.summary, `${field}.summary`);
    asRecord(evidence.coverage, `${field}.coverage`);
    validateResourceItems(evidence.highlights, `${field}.highlights`);
  } else if (section === 'resource') {
    validateResourceItems([evidence.item], `${field}.item`);
  } else if (section === 'ai-cost-summary') {
    requiredEnum(evidence.audience, ['portal', 'plugin'], `${field}.audience`);
    assertValue(evidence.audience, target.kind === 'subscription-detail' ? target.aiCostSummaryAudience : undefined, `${field}.audience`);
    isoTimestamp(evidence.sourceAccountSummaryGeneratedAt, `${field}.sourceAccountSummaryGeneratedAt`);
    asRecord(evidence.artifact, `${field}.artifact`);
  } else if (section === 'recommendations') {
    validateRecommendationEvidence(evidence, target, field);
  } else if (section === 'relationships') {
    requiredString(evidence.anchorNodeId, `${field}.anchorNodeId`);
    const stats = asRecord(evidence.stats, `${field}.stats`);
    assertExactKeys(stats, ['directNodeCount', 'directEdgeCount', 'unresolvedCount'], `${field}.stats`);
    ['directNodeCount', 'directEdgeCount', 'unresolvedCount'].forEach(key => nonNegativeInteger(stats[key], `${field}.stats.${key}`));
    ['nodes', 'edges', 'unresolved'].forEach(key => jsonArray(evidence[key], `${field}.${key}`));
  } else if (section === 'service-retirement') {
    if ('summary' in evidence) {
      const summary = asRecord(evidence.summary, `${field}.summary`);
      assertExactKeys(summary, ['matchedEntryCount', 'totalArtifactEntryCount'], `${field}.summary`);
      nonNegativeInteger(summary.matchedEntryCount, `${field}.summary.matchedEntryCount`);
      nonNegativeInteger(summary.totalArtifactEntryCount, `${field}.summary.totalArtifactEntryCount`);
      jsonArray(evidence.entries, `${field}.entries`);
    } else {
      const stats = asRecord(evidence.stats, `${field}.stats`);
      assertExactKeys(stats, ['entryCount', 'matchedResourceCount', 'unmatchedSourceEntryCount', 'truncated'], `${field}.stats`);
      ['entryCount', 'matchedResourceCount', 'unmatchedSourceEntryCount'].forEach(key => nonNegativeInteger(stats[key], `${field}.stats.${key}`));
      assertValue(stats.truncated, false, `${field}.stats.truncated`);
      jsonArray(evidence.highlights, `${field}.highlights`);
    }
  } else if (section === 'reliability') {
    asRecord(evidence.request, `${field}.request`);
    asRecord(evidence.summary, `${field}.summary`);
    jsonArray(evidence.sections, `${field}.sections`);
  } else if (section === 'account-governance') {
    asRecord(evidence.workflow, `${field}.workflow`);
    const checklist = asRecord(evidence.checklist, `${field}.checklist`);
    assertRequiredKeys(checklist, ['present', 'targetKey'], `${field}.checklist`);
    if (typeof checklist.present !== 'boolean') throw new Error(`${field}.checklist.present must be boolean.`);
    requiredString(checklist.targetKey, `${field}.checklist.targetKey`);
  } else {
    for (const [key, child] of Object.entries(evidence)) {
      if (key !== 'evidenceSource' && !Array.isArray(child)) asRecord(child, `${field}.${key}`);
    }
  }
}

function validatePortalScope(value: unknown, target: AwsPluginArtifactTarget, field: string): void {
  const scope = asRecord(value, field);
  assertExactKeys(scope, ['provider', 'accountId', 'billing', 'resourceRegions', 'metricTimeWindow'], field);
  assertValue(scope.provider, 'aws', `${field}.provider`);
  assertAccount(scope.accountId, target.accountId, `${field}.accountId`);
  assertJsonEqual(scope.billing, target.billing, `${field}.billing`);
  assertJsonEqual(scope.resourceRegions, target.resourceRegions, `${field}.resourceRegions`);
  assertJsonEqual(scope.metricTimeWindow, target.metricTimeWindow, `${field}.metricTimeWindow`);
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
  if (typeof summary.emptyCollection !== 'boolean' || typeof summary.truncated !== 'boolean') throw new Error(`${field} flags must be boolean.`);
}

function validateResourceItems(value: unknown, field: string): void {
  jsonArray(value, field).forEach((item, index) => {
    const itemField = `${field}[${index}]`;
    const resource = asRecord(item, itemField);
    assertRequiredKeys(resource, ['stableKey', 'family', 'resourceRegion', 'resourceType', 'discovery'], itemField);
    ['stableKey', 'family', 'resourceRegion', 'resourceType'].forEach(key => requiredString(resource[key], `${itemField}.${key}`));
    asRecord(resource.discovery, `${itemField}.discovery`);
  });
}

function validateRecommendationEvidence(evidence: Record<string, unknown>, target: AwsPluginArtifactTarget, field: string): void {
  const summary = asRecord(evidence.summary, `${field}.summary`);
  ['requestedScopeCount', 'availableScopeCount', 'notFoundScopeCount'].forEach(key => nonNegativeInteger(summary[key], `${field}.summary.${key}`));
  const allowedSummary = ['requestedScopeCount', 'availableScopeCount', 'notFoundScopeCount', 'unsupportedScopeCount'];
  assertExactKeys(summary, allowedSummary, `${field}.summary`);
  assertValue(summary.requestedScopeCount, target.recommendationScopes.length, `${field}.summary.requestedScopeCount`);
  const sections = jsonArray(evidence.sections, `${field}.sections`);
  assertValue(sections.length, target.recommendationScopes.length, `${field}.sections.length`);
  const matchedTargets = new Set<string>();
  const statusCounts = { available: 0, 'not-found': 0, 'unsupported-resource-identity': 0 };
  sections.forEach((value, index) => {
    const section = asRecord(value, `${field}.sections[${index}]`);
    const status = requiredEnum(section.status, ['available', 'not-found', 'unsupported-resource-identity'], `${field}.sections[${index}].status`);
    const source = requiredEnum(
      section.source,
      ['custom', 'compute-optimizer', 'cost-optimization-hub', 'resilience-hub', 'security-hub', 'trusted-advisor', 'well-architected'],
      `${field}.sections[${index}].source`
    );
    statusCounts[status] += 1;
    const targetKey =
      status === 'unsupported-resource-identity'
        ? target.recommendationScopes.find(scope => scope.source === source && !matchedTargets.has(scope.targetKey))?.targetKey
        : requiredString(section.targetKey, `${field}.sections[${index}].targetKey`);
    const scope = target.recommendationScopes.find(candidate => candidate.targetKey === targetKey && candidate.source === source);
    if (!scope || matchedTargets.has(scope.targetKey))
      throw new Error(`${field}.sections[${index}] does not match one exact declared recommendation scope.`);
    matchedTargets.add(scope.targetKey);
    if (status === 'available') {
      assertExactKeys(
        section,
        target.kind === 'subscription-detail'
          ? [
              'status',
              'source',
              'targetKey',
              'generatedAt',
              'scope',
              'filters',
              'summary',
              'counts',
              'savings',
              'evidenceFreshness',
              'templateProvenance',
              'actionability',
              'highlights',
            ]
          : ['status', 'source', 'targetKey', 'generatedAt', 'evidenceFreshness', 'templateProvenance', 'actionability', 'artifact'],
        `${field}.sections[${index}]`
      );
      isoTimestamp(section.generatedAt, `${field}.sections[${index}].generatedAt`);
      if (target.kind === 'subscription-detail') {
        assertRequiredKeys(section, ['scope', 'filters', 'summary', 'counts', 'savings', 'highlights'], `${field}.sections[${index}]`);
        validateRecommendationScope(section.scope, scope, `${field}.sections[${index}].scope`);
        jsonArray(section.highlights, `${field}.sections[${index}].highlights`);
      } else {
        assertRequiredKeys(section, ['artifact'], `${field}.sections[${index}]`);
        asRecord(section.artifact, `${field}.sections[${index}].artifact`);
      }
    } else if (status === 'not-found') {
      assertExactKeys(section, ['status', 'source', 'targetKey'], `${field}.sections[${index}]`);
    } else {
      assertExactKeys(section, ['status', 'source'], `${field}.sections[${index}]`);
    }
  });
  assertValue(summary.availableScopeCount, statusCounts.available, `${field}.summary.availableScopeCount`);
  assertValue(summary.notFoundScopeCount, statusCounts['not-found'], `${field}.summary.notFoundScopeCount`);
  if (summary.unsupportedScopeCount !== undefined) {
    assertValue(summary.unsupportedScopeCount, statusCounts['unsupported-resource-identity'], `${field}.summary.unsupportedScopeCount`);
  } else if (statusCounts['unsupported-resource-identity'] > 0) {
    throw new Error(`${field}.summary.unsupportedScopeCount is required.`);
  }
}

function validateRecommendationScope(value: unknown, expected: AwsPluginArtifactTarget['recommendationScopes'][number], field: string): void {
  const scope = asRecord(value, field);
  assertExactKeys(scope, ['source', 'scope', 'accountId', 'scopeDiscriminator', 'computeOptimizerFamily', 'resourceRegions'], field);
  for (const key of ['source', 'scope', 'accountId', 'scopeDiscriminator', 'computeOptimizerFamily', 'resourceRegions']) {
    assertJsonEqual(scope[key], expected[key as keyof typeof expected], `${field}.${key}`);
  }
}

function jsonArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`);
  return value;
}

function nonNegativeInteger(value: unknown, field: string): void {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error(`${field} must be a non-negative safe integer.`);
}

const EVIDENCE_SHAPES: Record<string, { allowed: readonly string[]; required: readonly string[] }> = {
  'account-summary': { allowed: ['artifact'], required: ['artifact'] },
  resources: { allowed: ['summary', 'coverage', 'highlights'], required: ['summary', 'coverage', 'highlights'] },
  'ai-cost-summary': {
    allowed: ['audience', 'sourceAccountSummaryGeneratedAt', 'artifact'],
    required: ['audience', 'sourceAccountSummaryGeneratedAt', 'artifact'],
  },
  'service-retirement': {
    allowed: ['stats', 'refreshMetadataBySource', 'refreshMetadataByFamily', 'highlights', 'summary', 'entries'],
    required: [],
  },
  recommendations: { allowed: ['summary', 'sections'], required: ['summary', 'sections'] },
  'commitment-analysis': { allowed: ['request', 'billing', 'benefitExpiry', 'evidenceSource'], required: ['billing', 'benefitExpiry'] },
  reliability: { allowed: ['request', 'summary', 'sections'], required: ['request', 'summary', 'sections'] },
  'account-governance': { allowed: ['workflow', 'checklist', 'complianceResults'], required: ['workflow', 'checklist'] },
  resource: { allowed: ['item'], required: ['item'] },
  relationships: {
    allowed: ['anchorNodeId', 'stats', 'nodes', 'edges', 'unresolved'],
    required: ['anchorNodeId', 'stats', 'nodes', 'edges', 'unresolved'],
  },
};
