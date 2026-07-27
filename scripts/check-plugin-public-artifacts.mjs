import assert from 'node:assert/strict';

import {
  AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  buildAwsPluginResourceLogicalName,
  buildAwsPluginSubscriptionLogicalName,
  sha256AwsPluginIdentity,
  validateAwsPluginGenerationManifest,
  validateAwsPluginResourceDetailArtifact,
  validateAwsPluginSubscriptionDetailArtifact,
} from '../dist/aws/index.js';

const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);
const generatedAt = '2026-07-24T05:00:00.000Z';
const accountId = '123456789012';
const targetKey = 'plugin-subscription-detail|aws|123456789012';
const stableKey = 'aws:ec2:instance:i-123';
const targetKeySha256 = sha256AwsPluginIdentity(targetKey);
const stableKeySha256 = sha256AwsPluginIdentity(stableKey);
const subscriptionTarget = {
  kind: 'subscription-detail',
  provider: 'aws',
  accountId,
  targetKey,
  targetKeySha256,
  accountSummaryTargetKey: 'account-summary-target',
  resourceCollectionTargetKey: 'resources-target',
  recommendationsTargetKey: 'recommendations-target',
  aiCostSummaryTargetKey: 'ai-target',
  serviceRetirementTargetKey: 'lifecycle-target',
  commitmentAnalysisTargetKey: 'commitment-target',
  reliabilityTargetKey: 'reliability-target',
  accountGovernanceTargetKey: 'governance-target',
  billing: {
    source: 'cur',
    reportName: 'customer-cur',
    billingPeriod: { start: '2026-07-01', end: '2026-07-31' },
  },
  resourceRegions: ['ap-southeast-2', 'global'],
  metricTimeWindow: {
    start: '2026-07-01T00:00:00.000Z',
    end: '2026-07-24T00:00:00.000Z',
  },
  serviceRetirementRegions: ['ap-southeast-2', 'global'],
  recommendationScopes: [
    {
      source: 'custom',
      scope: 'account',
      accountId,
      resourceRegions: ['ap-southeast-2', 'global'],
      targetKey: 'recommendation-target',
      actionabilityTargetKey: 'recommendation-actionability-target',
    },
  ],
  aiCostSummaryAudience: 'plugin',
  commitmentAnalysis: {
    resourceRegions: ['ap-southeast-2', 'global'],
    maxBenefitEntries: 20,
  },
  reliability: {
    includeScoring: true,
    maxResultsPerSection: 20,
    sectionScopeKeys: ['account:reliability'],
  },
  accountGovernance: { apiRegion: 'ap-southeast-2' },
};
const resourceTarget = {
  kind: 'resource-detail',
  provider: 'aws',
  accountId,
  targetKey: subscriptionTarget.targetKey,
  targetKeySha256: subscriptionTarget.targetKeySha256,
  resourceCollectionTargetKey: subscriptionTarget.resourceCollectionTargetKey,
  recommendationsTargetKey: subscriptionTarget.recommendationsTargetKey,
  billing: subscriptionTarget.billing,
  resourceRegions: subscriptionTarget.resourceRegions,
  metricTimeWindow: subscriptionTarget.metricTimeWindow,
  recommendationScopes: subscriptionTarget.recommendationScopes,
  selector: { kind: 'stable-key', stableKey },
  stableKey,
  stableKeySha256,
  relationshipTargetKey: 'relationships-target',
  serviceRetirementTargetKey: 'lifecycle-target',
};
const source = (section, sourceArtifactType, targetKey, extra = {}) => ({
  provider: 'aws',
  accountId,
  section,
  sourceArtifactType,
  generationId: 'portal-run-1',
  generatedAt,
  targetKey,
  artifactSha256: digestA,
  billing: subscriptionTarget.billing,
  resourceRegions: subscriptionTarget.resourceRegions,
  metricTimeWindow: subscriptionTarget.metricTimeWindow,
  ...extra,
});
const missing = (section, targetKey) => ({
  status: 'not-found',
  section,
  targetKey,
});
const available = (section, sourceArtifactType, targetKey, evidence) => ({
  status: 'available',
  section,
  targetKey,
  generatedAt,
  sourceGeneration: source(section, sourceArtifactType, targetKey),
  evidence,
});

const subscription = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  pluginSchemaVersion: AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId,
  artifactType: 'plugin-subscription',
  artifactGeneration: { runId: 'plugin-run-1', generatedAt },
  generatedAt,
  logicalName: buildAwsPluginSubscriptionLogicalName(targetKeySha256),
  target: subscriptionTarget,
  sections: {
    accountSummary: {
      status: 'available',
      section: 'account-summary',
      targetKey: 'account-summary-target',
      generatedAt,
      sourceGeneration: source('account-summary', 'account-summary', 'account-summary-target'),
      evidence: {
        artifact: {
          artifactType: 'account-summary',
          artifactVersion: 1,
          generatedAt,
          scope: {
            provider: 'aws',
            accountId,
            billing: subscriptionTarget.billing,
            resourceRegions: subscriptionTarget.resourceRegions,
            metricTimeWindow: subscriptionTarget.metricTimeWindow,
          },
          account: {},
          billing: {},
          discovery: { families: [] },
          metrics: { families: [] },
          recommendations: { sources: [] },
        },
      },
    },
    resources: available('resources', 'resource-collection', 'resources-target', {
      summary: {
        totalDiscoveredResourceCount: 1,
        returnedResourceCount: 1,
        emptyCollection: false,
        truncated: false,
        unmatchedRecommendationResourceCount: 0,
        unmatchedBillingExpenseCount: 0,
      },
      coverage: {},
      highlights: [],
    }),
    aiCostSummary: available('ai-cost-summary', 'ai-cost-summary', 'ai-target', {
      audience: 'plugin',
      sourceAccountSummaryGeneratedAt: generatedAt,
      artifact: { status: 'fresh' },
    }),
    serviceRetirement: available('service-retirement', 'lifecycle', 'lifecycle-target', {
      stats: { entryCount: 0, matchedResourceCount: 0, unmatchedSourceEntryCount: 0, truncated: false },
      refreshMetadataBySource: {},
      refreshMetadataByFamily: {},
      highlights: [],
    }),
    recommendations: {
      ...available('recommendations', 'recommendations', 'recommendations-target', {
        summary: {
          requestedScopeCount: 1,
          availableScopeCount: 1,
          notFoundScopeCount: 0,
        },
        sections: [
          {
            status: 'available',
            source: 'custom',
            targetKey: 'recommendation-target',
            generatedAt,
            scope: {
              source: 'custom',
              scope: 'account',
              accountId,
              resourceRegions: ['ap-southeast-2', 'global'],
            },
            filters: {},
            summary: {},
            counts: {},
            savings: {},
            actionability: {
              latestActionStableMaterializationKey: 'recommendation-1',
              latestActionExecution: { requestId: 'action-request-1' },
            },
            highlights: [],
          },
        ],
      }),
      sourceGeneration: source('recommendations', 'recommendations', 'recommendation-target'),
      additionalSourceGenerations: [source('recommendations', 'recommendation-actionability', 'recommendation-actionability-target')],
    },
    commitmentAnalysis: available('commitment-analysis', 'commitment-analysis', 'commitment-target', { billing: {}, benefitExpiry: {} }),
    reliability: available('reliability', 'reliability', 'reliability-target', { request: {}, summary: {}, sections: [] }),
    accountGovernance: available('account-governance', 'account-governance', 'governance-target', {
      workflow: {},
      checklist: { present: false, targetKey: 'governance-checklist-target' },
    }),
  },
};

const resource = {
  ...subscription,
  artifactType: 'plugin-resource',
  logicalName: buildAwsPluginResourceLogicalName(stableKeySha256, targetKeySha256),
  target: resourceTarget,
  selector: resourceTarget.selector,
  stableKey: resourceTarget.stableKey,
  sections: {
    resource: {
      status: 'available',
      section: 'resource',
      targetKey: 'resources-target',
      generatedAt,
      sourceGeneration: source('resource', 'resource-collection', 'resources-target', {
        selector: resourceTarget.selector,
        stableKey: resourceTarget.stableKey,
      }),
      evidence: {
        item: {
          stableKey: resourceTarget.stableKey,
          family: 'ec2-instance',
          resourceRegion: 'ap-southeast-2',
          resourceType: 'AWS::EC2::Instance',
          discovery: { freshness: { hasSuccessfulRefresh: true }, summary: {} },
        },
      },
    },
    relationships: missing('relationships', 'relationships-target'),
    serviceRetirement: missing('service-retirement', 'lifecycle-target'),
    recommendations: missing('recommendations', 'recommendations-target'),
  },
};

assert.deepEqual(validateAwsPluginSubscriptionDetailArtifact(JSON.parse(JSON.stringify(subscription))), subscription);
assert.deepEqual(validateAwsPluginResourceDetailArtifact(JSON.parse(JSON.stringify(resource))), resource);

const descriptor = (name, sha256 = digestA) => ({
  name,
  mediaType: 'application/json',
  contentEncoding: 'gzip',
  byteLength: 100,
  sha256,
});
const sourceForTarget = (target, section, sourceArtifactType, targetKey) =>
  source(section, sourceArtifactType, targetKey, {
    resourceRegions:
      target.kind === 'subscription-detail' && section === 'service-retirement'
        ? target.serviceRetirementRegions
        : target.kind === 'subscription-detail' && section === 'commitment-analysis'
          ? target.commitmentAnalysis.resourceRegions
          : target.resourceRegions,
    ...(target.kind === 'resource-detail'
      ? {
          selector: target.selector,
          stableKey: target.stableKey,
          ...(target.tagRuleScope ? { tagRuleScope: target.tagRuleScope } : {}),
        }
      : {}),
  });
const sourcesForTarget = target => {
  if (target.kind === 'resource-detail') {
    const sources = [
      sourceForTarget(target, 'resource', 'resource-collection', 'resources-target'),
      sourceForTarget(target, 'relationships', 'relationships', target.relationshipTargetKey),
      sourceForTarget(target, 'service-retirement', 'lifecycle', target.serviceRetirementTargetKey),
    ];
    target.recommendationScopes.forEach(scope => {
      sources.push(sourceForTarget(target, 'recommendations', 'recommendations', scope.targetKey));
      sources.push(sourceForTarget(target, 'recommendations', 'recommendation-actionability', scope.actionabilityTargetKey));
    });
    return sources;
  }
  const sources = [
    sourceForTarget(target, 'account-summary', 'account-summary', target.accountSummaryTargetKey),
    sourceForTarget(target, 'resources', 'resource-collection', target.resourceCollectionTargetKey),
    sourceForTarget(target, 'service-retirement', 'lifecycle', target.serviceRetirementTargetKey),
    sourceForTarget(target, 'ai-cost-summary', 'ai-cost-summary', target.aiCostSummaryTargetKey),
    sourceForTarget(target, 'commitment-analysis', 'commitment-analysis', target.commitmentAnalysisTargetKey),
    sourceForTarget(target, 'reliability', 'reliability', target.reliabilityTargetKey),
    sourceForTarget(target, 'account-governance', 'account-governance', target.accountGovernanceTargetKey),
  ];
  target.recommendationScopes.forEach(scope => {
    sources.push(sourceForTarget(target, 'recommendations', 'recommendations', scope.targetKey));
    sources.push(sourceForTarget(target, 'recommendations', 'recommendation-actionability', scope.actionabilityTargetKey));
  });
  return sources;
};
const active = (target, logicalName, artifactType, publication, sha256) => ({
  state: 'active',
  publication,
  provider: 'aws',
  accountId,
  logicalName,
  artifactType,
  target,
  artifact: descriptor(logicalName, sha256),
  sourceGenerations: sourcesForTarget(target),
});
const priorSubscription = {
  logicalName: subscription.logicalName,
  artifactType: 'plugin-subscription',
  provider: 'aws',
  accountId,
  targetKeySha256,
  artifactSha256: digestA,
};
const priorResource = {
  logicalName: resource.logicalName,
  artifactType: 'plugin-resource',
  provider: 'aws',
  accountId,
  targetKeySha256,
  stableKeySha256,
  artifactSha256: digestB,
};
const targetedManifest = {
  schemaVersion: AWS_PLUGIN_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  status: 'completed',
  provider: 'aws',
  accountId,
  artifactGeneration: { runId: 'plugin-run-2', generatedAt },
  requestBinding: { requestId: 'request-2', requestedAt: generatedAt },
  operation: { kind: 'targeted-replacement', target: resourceTarget },
  previousGeneration: {
    provider: 'aws',
    accountId,
    runId: 'plugin-run-1',
    manifestSha256: digestA,
    members: [priorSubscription, priorResource],
  },
  members: [
    active(subscriptionTarget, subscription.logicalName, 'plugin-subscription', 'carried-forward', digestA),
    active(resourceTarget, resource.logicalName, 'plugin-resource', 'replaced', digestA),
  ],
  counts: { active: 2, replaced: 1, carriedForward: 1, retired: 0 },
  completedAt: generatedAt,
};
assert.equal(validateAwsPluginGenerationManifest(targetedManifest), targetedManifest);

const rejects = (mutate, pattern) => {
  const candidate = JSON.parse(JSON.stringify(targetedManifest));
  mutate(candidate);
  assert.throws(() => validateAwsPluginGenerationManifest(candidate), pattern);
};
rejects(value => {
  value.members.pop();
  value.counts = {
    active: 1,
    replaced: 0,
    carriedForward: 1,
    retired: 0,
  };
}, /omitted prior member/);
rejects(value => {
  value.members[0].accountId = '999999999999';
}, /exact binding/);
rejects(value => {
  value.members[0].artifact.name = '../subscription';
}, /exact binding/);
rejects(value => {
  value.previousGeneration.accountId = '999999999999';
}, /exact binding/);
rejects(value => {
  value.members[0].target.targetKeySha256 = value.members[1].target.stableKeySha256;
}, /targetKeySha256/);
rejects(value => {
  value.members[1].sourceGenerations.pop();
}, /complete source set/);
rejects(value => {
  value.members[1].sourceGenerations[0].resourceRegions = ['global'];
}, /resourceRegions/);
rejects(value => {
  value.members[1].target.recommendationScopes.push({
    ...value.members[1].target.recommendationScopes[0],
    targetKey: 'second-recommendation-target',
    actionabilityTargetKey: 'second-actionability-target',
  });
  value.members[1].sourceGenerations.push(
    { ...value.members[1].sourceGenerations[3], generationId: 'duplicate-base-run' },
    { ...value.members[1].sourceGenerations[4], generationId: 'duplicate-action-run' }
  );
}, /complete source set/);
const retirementWithWrongPriorDigest = JSON.parse(JSON.stringify(targetedManifest));
retirementWithWrongPriorDigest.operation.kind = 'targeted-retirement';
retirementWithWrongPriorDigest.members[1] = {
  state: 'retired',
  publication: 'retired',
  provider: 'aws',
  accountId,
  logicalName: resource.logicalName,
  artifactType: 'plugin-resource',
  target: resourceTarget,
  priorArtifactSha256: digestA,
  retiredAt: generatedAt,
};
retirementWithWrongPriorDigest.counts = { active: 1, replaced: 0, carriedForward: 1, retired: 1 };
assert.throws(() => validateAwsPluginGenerationManifest(retirementWithWrongPriorDigest), /priorArtifactSha256/);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      storagePath: 'aws-plugin/account/body.json',
    }),
  /undeclared fields/
);
assert.throws(
  () =>
    validateAwsPluginResourceDetailArtifact({
      ...resource,
      sections: {
        ...resource.sections,
        resource: {
          ...resource.sections.resource,
          evidence: {
            item: {
              ...resource.sections.resource.evidence.item,
              stableKey: 'different-stable-key',
            },
          },
        },
      },
    }),
  /evidence.item.stableKey/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        recommendations: {
          ...subscription.sections.recommendations,
          additionalSourceGenerations: undefined,
        },
      },
    }),
  /complete recommendation source set/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        aiCostSummary: undefined,
      },
    }),
  /required by its declared target/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      target: {
        ...subscription.target,
        aiCostSummaryAudience: undefined,
        aiCostSummaryTargetKey: undefined,
      },
    }),
  /undeclared by its target/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        serviceRetirement: missing('service-retirement', 'wrong-target'),
      },
    }),
  /exact binding/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        recommendations: {
          ...subscription.sections.recommendations,
          evidence: {
            ...subscription.sections.recommendations.evidence,
            sections: [
              {
                ...subscription.sections.recommendations.evidence.sections[0],
                undeclaredVariant: true,
              },
            ],
          },
        },
      },
    }),
  /undeclared fields/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        accountSummary: {
          ...subscription.sections.accountSummary,
          evidence: {
            artifact: {
              ...subscription.sections.accountSummary.evidence.artifact,
              scope: {
                ...subscription.sections.accountSummary.evidence.artifact.scope,
                accountId: '999999999999',
              },
            },
          },
        },
      },
    }),
  /exact binding/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        aiCostSummary: {
          ...subscription.sections.aiCostSummary,
          evidence: {
            ...subscription.sections.aiCostSummary.evidence,
            audience: 'portal',
          },
        },
      },
    }),
  /exact binding/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      target: { ...subscription.target, targetKeySha256: digestA },
    }),
  /target.targetKeySha256/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        accountSummary: {
          ...subscription.sections.accountSummary,
          evidence: { artifact: { resolvedCredentials: { accessKeyId: 'nope' } } },
        },
      },
    }),
  /not allowed/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        accountSummary: {
          ...subscription.sections.accountSummary,
          evidence: { artifact: { spend: Number.POSITIVE_INFINITY } },
        },
      },
    }),
  /finite JSON numbers/
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        resources: {
          ...subscription.sections.resources,
          evidence: { summary: {}, coverage: {}, highlights: [], undeclared: true },
        },
      },
    }),
  /undeclared fields/
);
assert.doesNotThrow(() =>
  validateAwsPluginSubscriptionDetailArtifact({
    ...subscription,
    target: {
      ...subscription.target,
      resourceRegions: ['ap-southeast-2', 'global'],
    },
  })
);
assert.throws(
  () =>
    validateAwsPluginSubscriptionDetailArtifact({
      ...subscription,
      sections: {
        ...subscription.sections,
        accountSummary: {
          ...subscription.sections.accountSummary,
          sourceGeneration: {
            ...subscription.sections.accountSummary.sourceGeneration,
            accountId: '999999999999',
          },
        },
      },
    }),
  /exact binding/
);

process.stdout.write('AWS plugin bodies, bindings, logical names, and active-set transitions verified.\n');
