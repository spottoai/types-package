import assert from 'node:assert/strict';

import {
  PUBLISHED_VIEW_OBJECT_LIMITS_V1,
  encodeArtifactRunReferenceV1,
  isCompletedAzureViewSetV1,
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  isPublishedAzureViewSetV3,
  isPublishedViewManifestV4,
} from '../dist/index.js';

const valid = {
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
  economics: { generationId: 'economics-1', fingerprint: 'sha256:abc123' },
  completedAt: '2026-08-07T00:01:00.000Z',
};

assert.equal(isCompletedAzureViewSetV1(valid), true);
assert.equal(isCompletedAzureViewSetV1({ ...valid, status: 'in_progress' }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, schemaVersion: 2 }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, subscriptionId: '' }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, portal: { ...valid.portal, runId: '' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, completedAt: 'not-a-timestamp' }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, portal: { ...valid.portal, completedAt: '2026-08-07' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, portal: { ...valid.portal, manifestPath: 'https://storage/run.json' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, plugin: { ...valid.plugin, manifestPath: '../run.json' } }), false);
assert.equal(isCompletedAzureViewSetV1({ ...valid, economics: { generationId: '', fingerprint: 'sha256:abc123' } }), false);

const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);
const digestC = 'c'.repeat(64);
const subscriptionId = 'sub-123';
const completedAt = '2026-08-13T00:05:00.000Z';

const ownership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
  ownershipEpochRevision: 3,
};

const revision = {
  ownershipEpochRevision: 3,
  sourceRevision: 42,
  policyRevision: 7,
};

const latestOwnership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
};

const latestRevision = {
  sourceRevision: 42,
  policyRevision: 7,
};

const completedDependency = (name, generationId, digest) => ({
  name,
  required: true,
  support: 'supported',
  applicability: 'applicable',
  attempt: 'succeeded',
  coverage: 'complete',
  emptyEvidence: 'populated',
  freshness: 'current',
  evidence: 'complete',
  publication: 'completed',
  generationId,
  digest,
  sourceRevision: revision.sourceRevision,
  policyRevision: revision.policyRevision,
});

const viewPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [completedDependency('billing', 'billing-42', digestA), completedDependency('economics', 'economics-42', digestB)],
  claims: [
    {
      claimId: 'cost-savings-summary',
      sectionPaths: ['costSavings'],
      requiredDependencies: ['billing', 'economics'],
      evidence: 'complete',
      publication: 'completed',
      issues: [],
    },
  ],
  issues: [],
};

const completedViewManifest = {
  schemaVersion: 3,
  status: 'completed',
  runId: 'portal-run-42',
  subscriptionId,
  artifacts: [
    {
      path: 'runs/portal-run-42/summary.json',
      name: 'summary.json',
      mediaType: 'application/json',
      contentEncoding: 'identity',
      byteLength: 1024,
      sha256: digestA,
    },
  ],
  artifactGeneration: {
    runId: 'portal-run-42',
    generatedAt: '2026-08-13T00:04:00.000Z',
  },
  requestedArtifactCount: 1,
  requestedResourceCount: 25,
  failedArtifactCount: 0,
  failedResourceCount: 0,
  ownership,
  revision,
  compositeDependencyDigest: digestC,
  publicationDecision: viewPublicationDecision,
  completedAt,
};

const completedViewManifestWithSharedArtifactAlias = structuredClone(completedViewManifest);
completedViewManifestWithSharedArtifactAlias.future = completedViewManifestWithSharedArtifactAlias.artifacts[0];

const viewSetPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [completedDependency('portal', 'portal-run-42', digestA), completedDependency('plugin', 'plugin-run-42', digestB)],
  claims: [
    {
      claimId: 'coordinated-view-set',
      sectionPaths: ['portal', 'plugin'],
      requiredDependencies: ['portal', 'plugin'],
      evidence: 'complete',
      publication: 'completed',
      issues: [],
    },
  ],
  issues: [],
};

const completedViewSet = {
  schemaVersion: 2,
  status: 'completed',
  subscriptionId,
  publicationId: 'publication-42',
  ownership,
  revision,
  portal: {
    runId: 'portal-run-42',
    manifestPath: 'runs/portal-run-42/completed-view-manifest.json',
    manifestDigest: digestA,
    ownership,
    revision,
    compositeDependencyDigest: digestC,
    completedAt: '2026-08-13T00:04:00.000Z',
  },
  plugin: {
    runId: 'plugin-run-42',
    manifestPath: 'runs/plugin-run-42/completed-plugin-generation.json',
    manifestDigest: digestB,
    ownership,
    revision,
    compositeDependencyDigest: digestC,
    completedAt,
  },
  compositeDependencyDigest: digestC,
  publicationDecision: viewSetPublicationDecision,
  completedAt,
};

const portalRunReference = encodeArtifactRunReferenceV1('portal-run-42');
const pluginRunReference = encodeArtifactRunReferenceV1('plugin-run-42');
const projectedPortalArtifactPath = `runs/${portalRunReference}/projected/resources.json`;
const projectedInventorySection = `${projectedPortalArtifactPath}#/resources`;
const projectedSavingsSection = `${projectedPortalArtifactPath}#/savings`;

const completedInventoryClaim = {
  claimId: 'azure.portal.inventory',
  sectionPaths: [projectedInventorySection],
  requiredDependencies: ['inventory'],
  evidence: 'complete',
  publication: 'completed',
  issues: [],
};

const suppressedSavingsClaim = {
  claimId: 'azure.portal.savings',
  sectionPaths: [projectedSavingsSection],
  requiredDependencies: ['billing', 'economics'],
  evidence: 'insufficient',
  publication: 'suppressed',
  issues: [{ code: 'billing-unavailable', blocking: true, dependency: 'billing' }],
};

const partialViewPublicationDecision = {
  processing: 'succeeded',
  evidence: 'partial',
  publication: 'partial',
  dependencies: [
    completedDependency('inventory', 'inventory-42', digestC),
    {
      name: 'billing',
      required: true,
      support: 'supported',
      applicability: 'applicable',
      attempt: 'failed',
      coverage: 'none',
      emptyEvidence: 'not-observed',
      freshness: 'unknown',
      evidence: 'insufficient',
      publication: 'suppressed',
      reasonCode: 'billing-unavailable',
    },
    completedDependency('economics', 'economics-42', digestB),
  ],
  claims: [completedInventoryClaim, suppressedSavingsClaim],
  issues: [{ code: 'billing-unavailable', blocking: true, dependency: 'billing' }],
};

const publishedPartialViewManifest = {
  schemaVersion: 4,
  status: 'published',
  coverage: 'partial',
  runId: 'portal-run-42',
  subscriptionId,
  artifacts: [
    {
      path: projectedPortalArtifactPath,
      name: 'projected/resources.json',
      mediaType: 'application/json',
      contentEncoding: 'identity',
      byteLength: 768,
      sha256: digestA,
      claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: [projectedInventorySection] }],
    },
  ],
  artifactGeneration: { runId: 'portal-run-42', generatedAt: '2026-08-13T00:04:00.000Z' },
  requestedArtifactCount: 1,
  requestedResourceCount: 25,
  failedArtifactCount: 0,
  failedResourceCount: 0,
  ownership: latestOwnership,
  revision: latestRevision,
  compositeDependencyDigest: digestC,
  publicationDecision: partialViewPublicationDecision,
  completedAt,
};

const completedViewPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    completedDependency('inventory', 'inventory-42', digestC),
    completedDependency('billing', 'billing-42', digestA),
    completedDependency('economics', 'economics-42', digestB),
  ],
  claims: [completedInventoryClaim, { ...suppressedSavingsClaim, evidence: 'complete', publication: 'completed', issues: [] }],
  issues: [],
};

const publishedCompleteViewManifest = {
  ...publishedPartialViewManifest,
  coverage: 'complete',
  artifacts: [
    {
      ...publishedPartialViewManifest.artifacts[0],
      claimBindings: [
        { claimId: completedInventoryClaim.claimId, sectionPaths: [projectedInventorySection] },
        { claimId: suppressedSavingsClaim.claimId, sectionPaths: [projectedSavingsSection] },
      ],
    },
  ],
  publicationDecision: completedViewPublicationDecision,
};

const publishedViewSetPublicationDecision = { ...viewSetPublicationDecision, evidence: 'partial' };

const publishedPartialViewSet = {
  schemaVersion: 3,
  status: 'published',
  coverage: 'partial',
  subscriptionId,
  publicationId: 'publication-43',
  ownership: latestOwnership,
  revision: latestRevision,
  portal: {
    runId: 'portal-run-42',
    manifestPath: `runs/${portalRunReference}/published-view-manifest.json`,
    manifestDigest: digestA,
    coverage: 'partial',
    ownership: latestOwnership,
    revision: latestRevision,
    compositeDependencyDigest: digestC,
    completedAt: '2026-08-13T00:04:00.000Z',
  },
  plugin: {
    runId: 'plugin-run-42',
    manifestPath: `runs/${pluginRunReference}/published-plugin-generation.json`,
    manifestDigest: digestB,
    coverage: 'complete',
    ownership: latestOwnership,
    revision: latestRevision,
    compositeDependencyDigest: digestC,
    completedAt,
  },
  compositeDependencyDigest: digestC,
  publicationDecision: publishedViewSetPublicationDecision,
  completedAt,
};

const publishedViewManifestWithSharedArtifactAlias = structuredClone(publishedPartialViewManifest);
publishedViewManifestWithSharedArtifactAlias.future = publishedViewManifestWithSharedArtifactAlias.artifacts[0];

const publishedViewSetWithSharedSurfaceAlias = structuredClone(publishedPartialViewSet);
publishedViewSetWithSharedSurfaceAlias.future = publishedViewSetWithSharedSurfaceAlias.portal;

const completedViewSetWithSharedSurfaceAlias = structuredClone(completedViewSet);
completedViewSetWithSharedSurfaceAlias.future = completedViewSetWithSharedSurfaceAlias.portal;

const optionalUnverifiedEconomics = {
  ...completedViewManifest,
  publicationDecision: {
    processing: 'succeeded',
    evidence: 'partial',
    publication: 'partial',
    dependencies: [
      completedDependency('billing', 'billing-42', digestA),
      {
        name: 'economics',
        required: false,
        support: 'supported',
        applicability: 'applicable',
        attempt: 'failed',
        coverage: 'none',
        emptyEvidence: 'not-observed',
        freshness: 'unknown',
        evidence: 'insufficient',
        publication: 'suppressed',
        reasonCode: 'economics-unverified',
      },
    ],
    claims: [
      {
        claimId: 'cost-savings-summary',
        sectionPaths: ['costSavings'],
        requiredDependencies: ['billing', 'economics'],
        evidence: 'insufficient',
        publication: 'suppressed',
        issues: [{ code: 'economics-unverified', blocking: true, dependency: 'economics' }],
      },
    ],
    issues: [{ code: 'economics-unverified', blocking: true, dependency: 'economics' }],
  },
};

const viewManifestCases = [
  ['valid V3 completed manifest', completedViewManifest, true],
  ['V3 rejects an artifact descriptor alias under an unknown field', completedViewManifestWithSharedArtifactAlias, false],
  ['V3 artifact alias rejection matches its decoded JSON shape', JSON.parse(JSON.stringify(completedViewManifestWithSharedArtifactAlias)), false],
  ['known-version additive V3 fields', { ...completedViewManifest, future: { producer: 'next-version' } }, true],
  ['harmless credential-like V3 fields', { ...completedViewManifest, future: { tokenCount: 2, authorizationStatus: 'granted' } }, true],
  [
    'explicit Azure resource ID field',
    {
      ...completedViewManifest,
      future: { resourceId: '/subscriptions/sub-123/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1' },
    },
    true,
  ],
  [
    'Azure resource ID field with query is unsafe',
    { ...completedViewManifest, future: { resourceId: '/subscriptions/sub-123/resources/example?sig=unsafe' } },
    false,
  ],
  [
    'observe V3 without ownership epoch',
    {
      ...completedViewManifest,
      ownership: { ...ownership, ownershipEpochRevision: undefined },
      revision: { ...revision, ownershipEpochRevision: undefined },
    },
    true,
  ],
  ['suppressed claim with optional unverified economics', optionalUnverifiedEconomics, true],
  [
    'completed claim cannot use unverified economics',
    {
      ...optionalUnverifiedEconomics,
      publicationDecision: {
        ...optionalUnverifiedEconomics.publicationDecision,
        claims: [
          {
            claimId: 'cost-savings-summary',
            sectionPaths: ['costSavings'],
            requiredDependencies: ['billing', 'economics'],
            evidence: 'complete',
            publication: 'completed',
            issues: [],
          },
        ],
      },
    },
    false,
  ],
  [
    'completed publication cannot carry required unverified economics',
    {
      ...completedViewManifest,
      publicationDecision: {
        ...viewPublicationDecision,
        dependencies: [
          completedDependency('billing', 'billing-42', digestA),
          { ...optionalUnverifiedEconomics.publicationDecision.dependencies[1], required: true },
        ],
      },
    },
    false,
  ],
  [
    'V3 requires billing dependency',
    {
      ...completedViewManifest,
      publicationDecision: {
        ...viewPublicationDecision,
        dependencies: [completedDependency('economics', 'economics-42', digestB)],
      },
    },
    false,
  ],
  [
    'completed economics requires digest identity',
    {
      ...completedViewManifest,
      publicationDecision: {
        ...viewPublicationDecision,
        dependencies: [
          completedDependency('billing', 'billing-42', digestA),
          { ...completedDependency('economics', 'economics-42', digestB), digest: undefined },
        ],
      },
    },
    false,
  ],
  ['unknown V3 version', { ...completedViewManifest, schemaVersion: 4 }, false],
  ['missing V3 artifact descriptors', { ...completedViewManifest, artifacts: [] }, false],
  ['V3 artifact count mismatch', { ...completedViewManifest, requestedArtifactCount: 2 }, false],
  ['V3 artifact missing hash', { ...completedViewManifest, artifacts: [{ ...completedViewManifest.artifacts[0], sha256: undefined }] }, false],
  ['V3 ownership mismatch', { ...completedViewManifest, ownership: { ...ownership, accountId: 'sub-other' } }, false],
  ['V3 epoch mismatch', { ...completedViewManifest, revision: { ...revision, ownershipEpochRevision: 4 } }, false],
  ['V3 invalid revision', { ...completedViewManifest, revision: { ...revision, sourceRevision: 0 } }, false],
  ['V3 negative source revision', { ...completedViewManifest, revision: { ...revision, sourceRevision: -1 } }, false],
  ['V3 zero policy revision', { ...completedViewManifest, revision: { ...revision, policyRevision: 0 } }, false],
  ['V3 negative policy revision', { ...completedViewManifest, revision: { ...revision, policyRevision: -1 } }, false],
  ['V3 protocol-relative reference', { ...completedViewManifest, future: { location: '//storage/container/manifest.json' } }, false],
  ['V3 UNC reference', { ...completedViewManifest, future: { location: '\\\\storage\\container\\manifest.json' } }, false],
  ['V3 Windows reference', { ...completedViewManifest, future: { filePath: 'C:\\tmp\\manifest.json' } }, false],
  ['V3 POSIX absolute reference', { ...completedViewManifest, future: { filePath: '/tmp/manifest.json' } }, false],
  ['V3 parent traversal reference', { ...completedViewManifest, future: { filePath: '../manifest.json' } }, false],
  ['V3 current-directory traversal reference', { ...completedViewManifest, future: { filePath: './manifest.json' } }, false],
  ['V3 control-character reference', { ...completedViewManifest, future: { filePath: 'safe/manifest\u0000.json' } }, false],
  ['V3 exact password field', { ...completedViewManifest, future: { password: 'secret-example' } }, false],
  ['V3 exact accessToken field', { ...completedViewManifest, future: { accessToken: 'token-example' } }, false],
  ['V3 nested opaque S3 URI', { ...completedViewManifest, future: { nested: { location: 's3:bucket/key' } } }, false],
  ['V3 nested single-slash file URI', { ...completedViewManifest, future: { nested: { location: 'file:/tmp/blob.json' } } }, false],
  ['V3 nested percent-encoded slash', { ...completedViewManifest, future: { nested: { label: 'safe%2Fprivate' } } }, false],
];

const viewSetCases = [
  ['valid V2 coordinated pointer', completedViewSet, true],
  ['V2 rejects a surface reference alias under an unknown field', completedViewSetWithSharedSurfaceAlias, false],
  ['V2 surface alias rejection matches its decoded JSON shape', JSON.parse(JSON.stringify(completedViewSetWithSharedSurfaceAlias)), false],
  ['known-version additive V2 fields', { ...completedViewSet, future: { producer: 'next-version' } }, true],
  ['harmless credential-like V2 fields', { ...completedViewSet, future: { tokenCount: 2, authorizationStatus: 'granted' } }, true],
  ['unknown V2 version', { ...completedViewSet, schemaVersion: 3 }, false],
  [
    'V2 surface ownership mismatch',
    { ...completedViewSet, plugin: { ...completedViewSet.plugin, ownership: { ...ownership, companyId: 'company-other' } } },
    false,
  ],
  [
    'V2 surface revision mismatch',
    { ...completedViewSet, portal: { ...completedViewSet.portal, revision: { ...revision, policyRevision: 8 } } },
    false,
  ],
  ['V2 composite digest mismatch', { ...completedViewSet, plugin: { ...completedViewSet.plugin, compositeDependencyDigest: digestA } }, false],
  [
    'V2 surface dependency mismatch',
    {
      ...completedViewSet,
      publicationDecision: {
        ...viewSetPublicationDecision,
        dependencies: [completedDependency('portal', 'portal-run-other', digestA), completedDependency('plugin', 'plugin-run-42', digestB)],
      },
    },
    false,
  ],
  [
    'V2 surface dependencies must be required',
    {
      ...completedViewSet,
      publicationDecision: {
        ...viewSetPublicationDecision,
        dependencies: [
          { ...completedDependency('portal', 'portal-run-42', digestA), required: false },
          completedDependency('plugin', 'plugin-run-42', digestB),
        ],
      },
    },
    false,
  ],
  ['V2 missing promoted epoch', { ...completedViewSet, ownership: { ...ownership, ownershipEpochRevision: undefined } }, false],
  ['V2 zero source revision', { ...completedViewSet, revision: { ...revision, sourceRevision: 0 } }, false],
  ['V2 negative source revision', { ...completedViewSet, revision: { ...revision, sourceRevision: -1 } }, false],
  ['V2 zero policy revision', { ...completedViewSet, revision: { ...revision, policyRevision: 0 } }, false],
  ['V2 negative policy revision', { ...completedViewSet, revision: { ...revision, policyRevision: -1 } }, false],
  ['V2 wrong coordinated timestamp', { ...completedViewSet, completedAt: '2026-08-13T00:04:59.000Z' }, false],
  [
    'V2 unsafe surface manifest reference',
    { ...completedViewSet, portal: { ...completedViewSet.portal, manifestPath: '../completed-view-manifest.json' } },
    false,
  ],
  ['V2 protocol-relative additive reference', { ...completedViewSet, future: { location: '//storage/container/manifest.json' } }, false],
  ['V2 UNC additive reference', { ...completedViewSet, future: { location: '\\\\storage\\container\\manifest.json' } }, false],
  ['V2 Windows additive reference', { ...completedViewSet, future: { filePath: 'C:\\tmp\\manifest.json' } }, false],
  ['V2 POSIX absolute additive reference', { ...completedViewSet, future: { filePath: '/tmp/manifest.json' } }, false],
  ['V2 parent traversal additive reference', { ...completedViewSet, future: { filePath: '../manifest.json' } }, false],
  ['V2 current-directory additive reference', { ...completedViewSet, future: { filePath: './manifest.json' } }, false],
  ['V2 exact clientSecret field', { ...completedViewSet, future: { clientSecret: 'secret-example' } }, false],
  ['V2 exact authorization field', { ...completedViewSet, future: { authorization: 'Bearer example' } }, false],
  ['V2 nested opaque S3 URI', { ...completedViewSet, future: { nested: { location: 's3:bucket/key' } } }, false],
  ['V2 nested single-slash file URI', { ...completedViewSet, future: { nested: { location: 'file:/tmp/blob.json' } } }, false],
  ['V2 nested percent-encoded slash', { ...completedViewSet, future: { nested: { label: 'safe%2Fprivate' } } }, false],
];

const publishedViewManifestCases = [
  ['valid complete V4 published manifest', publishedCompleteViewManifest, true],
  ['valid partial V4 published manifest', publishedPartialViewManifest, true],
  ['known-version additive V4 fields', { ...publishedPartialViewManifest, future: { producer: 'next-version' } }, true],
  ['V4 rejects an artifact alias under an unknown field', publishedViewManifestWithSharedArtifactAlias, false],
  ['V4 rejects an exact clientSecret field', { ...publishedPartialViewManifest, future: { clientSecret: 'secret-example' } }, false],
  ['V4 rejects an absolute additive path', { ...publishedPartialViewManifest, future: { filePath: '/tmp/view.json' } }, false],
  ['V4 rejects prototype control data', { ...publishedPartialViewManifest, future: JSON.parse('{"__proto__":{"polluted":true}}') }, false],
  [
    'V4 rejects an ownership epoch',
    { ...publishedPartialViewManifest, ownership },
    false,
  ],
  ['V4 rejects old schema discriminator', { ...publishedPartialViewManifest, schemaVersion: 3 }, false],
  ['V4 complete coverage rejects a partial decision', { ...publishedPartialViewManifest, coverage: 'complete' }, false],
  [
    'V4 partial coverage rejects a completed decision',
    { ...publishedPartialViewManifest, publicationDecision: completedViewPublicationDecision },
    false,
  ],
  [
    'V4 rejects an unclaimed projected descriptor',
    { ...publishedPartialViewManifest, artifacts: [{ ...publishedPartialViewManifest.artifacts[0], claimBindings: [] }] },
    false,
  ],
  [
    'V4 rejects a projected descriptor bound to a suppressed claim',
    {
      ...publishedPartialViewManifest,
      artifacts: [
        {
          ...publishedPartialViewManifest.artifacts[0],
          claimBindings: [{ claimId: suppressedSavingsClaim.claimId, sectionPaths: [projectedSavingsSection] }],
        },
      ],
    },
    false,
  ],
  [
    'V4 rejects duplicate claim bindings',
    {
      ...publishedPartialViewManifest,
      artifacts: [
        {
          ...publishedPartialViewManifest.artifacts[0],
          claimBindings: [
            { claimId: completedInventoryClaim.claimId, sectionPaths: [projectedInventorySection] },
            { claimId: completedInventoryClaim.claimId, sectionPaths: [projectedInventorySection] },
          ],
        },
      ],
    },
    false,
  ],
  [
    'V4 rejects a claim binding to the wrong section',
    {
      ...publishedPartialViewManifest,
      artifacts: [
        {
          ...publishedPartialViewManifest.artifacts[0],
          claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: [projectedSavingsSection] }],
        },
      ],
    },
    false,
  ],
  [
    'V4 rejects an unsafe projected section path',
    {
      ...publishedPartialViewManifest,
      artifacts: [
        {
          ...publishedPartialViewManifest.artifacts[0],
          claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: ['../resources.json#/resources'] }],
        },
      ],
    },
    false,
  ],
  [
    'V4 rejects a completed claim whose section has no descriptor binding',
    {
      ...publishedCompleteViewManifest,
      artifacts: [
        {
          ...publishedCompleteViewManifest.artifacts[0],
          claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: [projectedInventorySection] }],
        },
      ],
    },
    false,
  ],
  [
    'V4 rejects overlapping completed and suppressed claim sections',
    {
      ...publishedPartialViewManifest,
      publicationDecision: {
        ...partialViewPublicationDecision,
        claims: [completedInventoryClaim, { ...suppressedSavingsClaim, sectionPaths: [`${projectedInventorySection}/*/optimizationProfile`] }],
      },
    },
    false,
  ],
  [
    'V4 rejects an excessive section-path collection',
    {
      ...publishedPartialViewManifest,
      publicationDecision: {
        ...partialViewPublicationDecision,
        claims: [
          completedInventoryClaim,
          {
            ...suppressedSavingsClaim,
            sectionPaths: Array.from(
              { length: PUBLISHED_VIEW_OBJECT_LIMITS_V1.maxSectionPaths + 1 },
              (_, index) => `${projectedPortalArtifactPath}#/suppressed-${index}`
            ),
          },
        ],
      },
    },
    false,
  ],
];

const publishedViewSetCases = [
  ['valid partial V3 published pointer', publishedPartialViewSet, true],
  ['known-version additive published V3 fields', { ...publishedPartialViewSet, future: { producer: 'next-version' } }, true],
  ['published V3 rejects a surface alias under an unknown field', publishedViewSetWithSharedSurfaceAlias, false],
  ['published V3 rejects an exact accessToken field', { ...publishedPartialViewSet, future: { accessToken: 'token-example' } }, false],
  ['published V3 rejects a parent traversal path', { ...publishedPartialViewSet, future: { filePath: '../view.json' } }, false],
  [
    'valid complete V3 published pointer',
    {
      ...publishedPartialViewSet,
      coverage: 'complete',
      portal: { ...publishedPartialViewSet.portal, coverage: 'complete' },
      publicationDecision: { ...publishedViewSetPublicationDecision, evidence: 'complete' },
    },
    true,
  ],
  ['published V3 rejects old schema discriminator', { ...publishedPartialViewSet, schemaVersion: 2 }, false],
  ['published V3 rejects top-level coverage mismatch', { ...publishedPartialViewSet, coverage: 'complete' }, false],
  [
    'published V3 rejects cross-surface composite mismatch',
    { ...publishedPartialViewSet, plugin: { ...publishedPartialViewSet.plugin, compositeDependencyDigest: digestA } },
    false,
  ],
  [
    'published V3 rejects a legacy manifest logical name',
    {
      ...publishedPartialViewSet,
      portal: { ...publishedPartialViewSet.portal, manifestPath: 'runs/portal-run-42/completed-view-manifest.json' },
    },
    false,
  ],
  ['published V3 rejects an ownership epoch', { ...publishedPartialViewSet, ownership }, false],
  [
    'published V3 rejects a surface dependency mismatch',
    {
      ...publishedPartialViewSet,
      publicationDecision: {
        ...publishedViewSetPublicationDecision,
        dependencies: [completedDependency('portal', 'portal-run-other', digestA), completedDependency('plugin', 'plugin-run-42', digestB)],
      },
    },
    false,
  ],
];

for (const [name, value, expected] of viewManifestCases) {
  assert.equal(isCompletedViewManifestV3(value), expected, name);
}

for (const [name, value, expected] of viewSetCases) {
  assert.equal(isCompletedAzureViewSetV2(value), expected, name);
}

for (const [name, value, expected] of publishedViewManifestCases) {
  assert.equal(isPublishedViewManifestV4(value), expected, name);
}

for (const [name, value, expected] of publishedViewSetCases) {
  assert.equal(isPublishedAzureViewSetV3(value), expected, name);
}

assert.equal(isCompletedViewManifestV3(publishedPartialViewManifest), false, 'legacy V3 rejects a V4 manifest');
assert.equal(isCompletedAzureViewSetV2(publishedPartialViewSet), false, 'legacy V2 rejects a published V3 pointer');

console.log(
  `Azure view-set contract checks passed: 10 legacy V1 checks, ${viewManifestCases.length} completed V3 checks, ${viewSetCases.length} completed V2 checks, ${publishedViewManifestCases.length} published V4 checks, ${publishedViewSetCases.length} published V3 checks.`
);
