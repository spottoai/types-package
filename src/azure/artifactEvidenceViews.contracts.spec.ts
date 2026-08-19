import {
  encodeArtifactRunReferenceV1,
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  isPublishedAzureViewSetV3,
  isPublishedViewManifestV4,
  type ArtifactPublicationDecision,
  type CompletedAzureViewSetV2,
  type CompletedViewManifestV3,
  type PublishedAzureViewSetV3,
  type PublishedViewManifestV4,
} from '../index';

// @ts-expect-error V3 artifact descriptor helpers are intentionally module-private.
import type { CompletedViewArtifactDescriptor } from '../index';
// @ts-expect-error V2 surface reference helpers are intentionally module-private.
import type { AzureViewSetV2SurfaceReference } from '../index';

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
} as const;

const revision = {
  ownershipEpochRevision: 3,
  sourceRevision: 42,
  policyRevision: 7,
} as const;

const latestOwnership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
} as const;

const latestRevision = {
  sourceRevision: 42,
  policyRevision: 7,
} as const;

const completedDependency = (name: string, generationId: string, digest: string) =>
  ({
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
  }) as const;

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
} satisfies ArtifactPublicationDecision;

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
} satisfies CompletedViewManifestV3;

const completedViewSetPublicationDecision = {
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
} satisfies ArtifactPublicationDecision;

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
  publicationDecision: completedViewSetPublicationDecision,
  completedAt,
} satisfies CompletedAzureViewSetV2;

const portalRunReference = encodeArtifactRunReferenceV1('portal:run-42');
const pluginRunReference = encodeArtifactRunReferenceV1('plugin:run-42');
const projectedPortalArtifactPath = `runs/${portalRunReference}/projected/resources.json`;
const projectedInventorySection = `${projectedPortalArtifactPath}#/resources`;
const projectedSavingsSection = `${projectedPortalArtifactPath}#/savings`;

const suppressedBillingDependency = {
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
} as const;

const completedInventoryClaim = {
  claimId: 'azure.portal.inventory',
  sectionPaths: [projectedInventorySection],
  requiredDependencies: ['inventory'],
  evidence: 'complete',
  publication: 'completed',
  issues: [],
} satisfies ArtifactPublicationDecision['claims'][number];

const suppressedSavingsClaim = {
  claimId: 'azure.portal.savings',
  sectionPaths: [projectedSavingsSection],
  requiredDependencies: ['billing', 'economics'],
  evidence: 'insufficient',
  publication: 'suppressed',
  issues: [{ code: 'billing-unavailable', blocking: true, dependency: 'billing' }],
} satisfies ArtifactPublicationDecision['claims'][number];

const partialViewPublicationDecision = {
  processing: 'succeeded',
  evidence: 'partial',
  publication: 'partial',
  dependencies: [
    completedDependency('inventory', 'inventory-42', digestC),
    suppressedBillingDependency,
    completedDependency('economics', 'economics-42', digestB),
  ],
  claims: [completedInventoryClaim, suppressedSavingsClaim],
  issues: [{ code: 'billing-unavailable', blocking: true, dependency: 'billing' }],
} satisfies ArtifactPublicationDecision;

const publishedPartialViewManifest = {
  schemaVersion: 4,
  status: 'published',
  coverage: 'partial',
  runId: 'portal:run-42',
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
  artifactGeneration: {
    runId: 'portal:run-42',
    generatedAt: '2026-08-13T00:04:00.000Z',
  },
  requestedArtifactCount: 1,
  requestedResourceCount: 25,
  failedArtifactCount: 0,
  failedResourceCount: 0,
  ownership: latestOwnership,
  revision: latestRevision,
  compositeDependencyDigest: digestC,
  publicationDecision: partialViewPublicationDecision,
  completedAt,
} satisfies PublishedViewManifestV4;

const completedViewPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    completedDependency('inventory', 'inventory-42', digestC),
    completedDependency('billing', 'billing-42', digestA),
    completedDependency('economics', 'economics-42', digestB),
  ],
  claims: [
    completedInventoryClaim,
    {
      ...suppressedSavingsClaim,
      evidence: 'complete',
      publication: 'completed',
      issues: [],
    },
  ],
  issues: [],
} satisfies ArtifactPublicationDecision;

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
} satisfies PublishedViewManifestV4;

const publishedViewSetPublicationDecision = {
  ...completedViewSetPublicationDecision,
  evidence: 'partial',
  dependencies: [completedDependency('portal', 'portal:run-42', digestA), completedDependency('plugin', 'plugin:run-42', digestB)],
} satisfies ArtifactPublicationDecision;

const publishedPartialViewSet = {
  schemaVersion: 3,
  status: 'published',
  coverage: 'partial',
  subscriptionId,
  publicationId: 'publication:43',
  ownership: latestOwnership,
  revision: latestRevision,
  portal: {
    runId: 'portal:run-42',
    manifestPath: `runs/${portalRunReference}/published-view-manifest.json`,
    manifestDigest: digestA,
    coverage: 'partial',
    ownership: latestOwnership,
    revision: latestRevision,
    compositeDependencyDigest: digestC,
    completedAt: '2026-08-13T00:04:00.000Z',
  },
  plugin: {
    runId: 'plugin:run-42',
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
} satisfies PublishedAzureViewSetV3;

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

const observeViewManifest = {
  ...completedViewManifest,
  ownership: { ...ownership, ownershipEpochRevision: undefined },
  revision: { ...revision, ownershipEpochRevision: undefined },
};

const completedClaimWithUnverifiedEconomics = {
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
};

const requiredUnverifiedEconomicsPublishedCompleted = {
  ...completedViewManifest,
  publicationDecision: {
    ...viewPublicationDecision,
    dependencies: [
      completedDependency('billing', 'billing-42', digestA),
      {
        name: 'economics',
        required: true,
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
  },
};

const missingArtifactHash = {
  ...completedViewManifest,
  artifacts: [{ ...completedViewManifest.artifacts[0], sha256: undefined }],
};

const mismatchedViewOwnership = {
  ...completedViewManifest,
  ownership: { ...ownership, accountId: 'sub-other' },
};

const missingBillingDependency = {
  ...completedViewManifest,
  publicationDecision: {
    ...viewPublicationDecision,
    dependencies: [completedDependency('economics', 'economics-42', digestB)],
  },
};

const completedEconomicsWithoutIdentity = {
  ...completedViewManifest,
  publicationDecision: {
    ...viewPublicationDecision,
    dependencies: [
      completedDependency('billing', 'billing-42', digestA),
      { ...completedDependency('economics', 'economics-42', digestB), digest: undefined },
    ],
  },
};

const mismatchedViewEpoch = {
  ...completedViewManifest,
  revision: { ...revision, ownershipEpochRevision: 4 },
};

const invalidViewRevision = {
  ...completedViewManifest,
  revision: { ...revision, sourceRevision: 0 },
};

const unsafeArtifactReference = {
  ...completedViewManifest,
  artifacts: [{ ...completedViewManifest.artifacts[0], path: '//storage.example/container/summary.json' }],
};

const additiveViewManifest = {
  ...completedViewManifest,
  futureTopLevelField: { producer: 'next-version' },
  resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
};

const harmlessCredentialLikeViewManifest = {
  ...completedViewManifest,
  futureTopLevelField: { tokenCount: 2, authorizationStatus: 'granted' },
};

const physicalViewManifestReferences = [
  { ...completedViewManifest, futureTopLevelField: { filePath: '/tmp/manifest.json' } },
  { ...completedViewManifest, futureTopLevelField: { filePath: '../manifest.json' } },
  { ...completedViewManifest, futureTopLevelField: { filePath: './manifest.json' } },
];

const additiveViewSet = {
  ...completedViewSet,
  futureTopLevelField: { producer: 'next-version' },
};

const harmlessCredentialLikeViewSet = {
  ...completedViewSet,
  futureTopLevelField: { tokenCount: 2, authorizationStatus: 'granted' },
};

const physicalViewSetReferences = [
  { ...completedViewSet, futureTopLevelField: { filePath: '/tmp/manifest.json' } },
  { ...completedViewSet, futureTopLevelField: { filePath: '../manifest.json' } },
  { ...completedViewSet, futureTopLevelField: { filePath: './manifest.json' } },
];

const mismatchedSurfaceOwnership = {
  ...completedViewSet,
  plugin: { ...completedViewSet.plugin, ownership: { ...ownership, companyId: 'company-other' } },
};

const mismatchedSurfaceRevision = {
  ...completedViewSet,
  portal: { ...completedViewSet.portal, revision: { ...revision, policyRevision: 8 } },
};

const mismatchedCompositeDigest = {
  ...completedViewSet,
  plugin: { ...completedViewSet.plugin, compositeDependencyDigest: digestA },
};

const mismatchedSurfaceDependency = {
  ...completedViewSet,
  publicationDecision: {
    ...completedViewSetPublicationDecision,
    dependencies: [completedDependency('portal', 'portal-run-other', digestA), completedDependency('plugin', 'plugin-run-42', digestB)],
  },
};

const optionalSurfaceDependency = {
  ...completedViewSet,
  publicationDecision: {
    ...completedViewSetPublicationDecision,
    dependencies: [
      { ...completedDependency('portal', 'portal-run-42', digestA), required: false },
      completedDependency('plugin', 'plugin-run-42', digestB),
    ],
  },
};

const missingPromotedEpoch = {
  ...completedViewSet,
  ownership: { ...ownership, ownershipEpochRevision: undefined },
  revision: { ...revision, ownershipEpochRevision: undefined },
  portal: {
    ...completedViewSet.portal,
    ownership: { ...ownership, ownershipEpochRevision: undefined },
    revision: { ...revision, ownershipEpochRevision: undefined },
  },
  plugin: {
    ...completedViewSet.plugin,
    ownership: { ...ownership, ownershipEpochRevision: undefined },
    revision: { ...revision, ownershipEpochRevision: undefined },
  },
};

const wrongCoordinatedCompletedAt = {
  ...completedViewSet,
  completedAt: '2026-08-13T00:04:59.000Z',
};

const unsafeManifestReference = {
  ...completedViewSet,
  portal: { ...completedViewSet.portal, manifestPath: '//storage.example/container/completed-view-manifest.json' },
};

const credentialSmuggling = {
  ...completedViewSet,
  futureTopLevelField: { clientSecret: 'secret-example' },
};

const physicalReferenceSmuggling = {
  ...completedViewSet,
  futureTopLevelField: { location: '\\\\storage.example\\container\\manifest.json' },
};

const viewValidationResults: boolean[] = [
  isCompletedViewManifestV3(completedViewManifest),
  isCompletedViewManifestV3(optionalUnverifiedEconomics),
  isCompletedViewManifestV3(observeViewManifest),
  isCompletedViewManifestV3(additiveViewManifest),
  isCompletedViewManifestV3(harmlessCredentialLikeViewManifest),
  !isCompletedViewManifestV3({ ...completedViewManifest, schemaVersion: 4 }),
  !isCompletedViewManifestV3({ ...completedViewManifest, artifacts: [] }),
  !isCompletedViewManifestV3({ ...completedViewManifest, requestedArtifactCount: 2 }),
  !isCompletedViewManifestV3(requiredUnverifiedEconomicsPublishedCompleted),
  !isCompletedViewManifestV3(completedClaimWithUnverifiedEconomics),
  !isCompletedViewManifestV3(missingArtifactHash),
  !isCompletedViewManifestV3(missingBillingDependency),
  !isCompletedViewManifestV3(completedEconomicsWithoutIdentity),
  !isCompletedViewManifestV3(mismatchedViewOwnership),
  !isCompletedViewManifestV3(mismatchedViewEpoch),
  !isCompletedViewManifestV3(invalidViewRevision),
  !isCompletedViewManifestV3(unsafeArtifactReference),
  !isCompletedViewManifestV3({ ...completedViewManifest, futureTopLevelField: { apiKey: 'key-example' } }),
  ...physicalViewManifestReferences.map(value => !isCompletedViewManifestV3(value)),
];

const viewSetValidationResults: boolean[] = [
  isCompletedAzureViewSetV2(completedViewSet),
  isCompletedAzureViewSetV2(additiveViewSet),
  isCompletedAzureViewSetV2(harmlessCredentialLikeViewSet),
  !isCompletedAzureViewSetV2({ ...completedViewSet, schemaVersion: 3 }),
  !isCompletedAzureViewSetV2(mismatchedSurfaceOwnership),
  !isCompletedAzureViewSetV2(mismatchedSurfaceRevision),
  !isCompletedAzureViewSetV2(mismatchedCompositeDigest),
  !isCompletedAzureViewSetV2(mismatchedSurfaceDependency),
  !isCompletedAzureViewSetV2(optionalSurfaceDependency),
  !isCompletedAzureViewSetV2(missingPromotedEpoch),
  !isCompletedAzureViewSetV2(wrongCoordinatedCompletedAt),
  !isCompletedAzureViewSetV2(unsafeManifestReference),
  !isCompletedAzureViewSetV2(credentialSmuggling),
  !isCompletedAzureViewSetV2(physicalReferenceSmuggling),
  ...physicalViewSetReferences.map(value => !isCompletedAzureViewSetV2(value)),
];

const publishedViewValidationResults: boolean[] = [
  isPublishedViewManifestV4(publishedCompleteViewManifest),
  isPublishedViewManifestV4(publishedPartialViewManifest),
  isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    costSavings: {
      stableWholeResourceDeletionBackfill: {
        recommendationCount: 1,
        resourceCount: 1,
        stableBillingRowCount: 0,
        stableSpendIndexResourceCount: 0,
        registeredResourceCount: 0,
        missingStableSpendResourceCount: 1,
        missingStableSpendReasonCounts: { 'no-stable-spend': 1 },
        relatedResourceCount: 0,
        registeredMaxMonthlySavings: 0,
        registeredRecommendations: {},
        missingStableSpendResourceSamples: [
          'no-stable-spend: /subscriptions/sub-1/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-1',
        ],
      },
    },
  }),
  isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    ownership: { ...ownership, ownershipEpochRevision: undefined },
    revision: { ...revision, ownershipEpochRevision: undefined },
  }),
  !isPublishedViewManifestV4({ ...publishedPartialViewManifest, schemaVersion: 3 }),
  !isPublishedViewManifestV4({ ...publishedPartialViewManifest, coverage: 'complete' }),
  !isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    publicationDecision: completedViewPublicationDecision,
  }),
  !isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    artifacts: [{ ...publishedPartialViewManifest.artifacts[0], claimBindings: [] }],
  }),
  !isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    artifacts: [
      {
        ...publishedPartialViewManifest.artifacts[0],
        claimBindings: [{ claimId: suppressedSavingsClaim.claimId, sectionPaths: [projectedSavingsSection] }],
      },
    ],
  }),
  !isPublishedViewManifestV4({
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
  }),
  !isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    artifacts: [
      {
        ...publishedPartialViewManifest.artifacts[0],
        claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: [projectedSavingsSection] }],
      },
    ],
  }),
  !isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    artifacts: [
      {
        ...publishedPartialViewManifest.artifacts[0],
        claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: ['../resources.json#/resources'] }],
      },
    ],
  }),
  !isPublishedViewManifestV4({
    ...publishedCompleteViewManifest,
    artifacts: [
      {
        ...publishedCompleteViewManifest.artifacts[0],
        claimBindings: [{ claimId: completedInventoryClaim.claimId, sectionPaths: [projectedInventorySection] }],
      },
    ],
  }),
  !isPublishedViewManifestV4({
    ...publishedPartialViewManifest,
    publicationDecision: {
      ...partialViewPublicationDecision,
      claims: [completedInventoryClaim, { ...suppressedSavingsClaim, sectionPaths: [`${projectedInventorySection}/*/optimizationProfile`] }],
    },
  }),
];

const publishedViewSetValidationResults: boolean[] = [
  isPublishedAzureViewSetV3(publishedPartialViewSet),
  isPublishedAzureViewSetV3({
    ...publishedPartialViewSet,
    coverage: 'complete',
    portal: { ...publishedPartialViewSet.portal, coverage: 'complete' },
    publicationDecision: { ...publishedViewSetPublicationDecision, evidence: 'complete' },
  }),
  !isPublishedAzureViewSetV3({ ...publishedPartialViewSet, schemaVersion: 2 }),
  !isPublishedAzureViewSetV3({ ...publishedPartialViewSet, coverage: 'complete' }),
  !isPublishedAzureViewSetV3({
    ...publishedPartialViewSet,
    plugin: { ...publishedPartialViewSet.plugin, compositeDependencyDigest: digestA },
  }),
  !isPublishedAzureViewSetV3({
    ...publishedPartialViewSet,
    portal: { ...publishedPartialViewSet.portal, manifestPath: 'runs/portal-run-42/completed-view-manifest.json' },
  }),
  !isPublishedAzureViewSetV3({
    ...publishedPartialViewSet,
    ownership: { ...latestOwnership, ownershipEpochRevision: 3 },
  }),
  !isPublishedAzureViewSetV3({
    ...publishedPartialViewSet,
    publicationDecision: {
      ...publishedViewSetPublicationDecision,
      dependencies: [completedDependency('portal', 'portal-run-other', digestA), completedDependency('plugin', 'plugin-run-42', digestB)],
    },
  }),
  !isCompletedViewManifestV3(publishedPartialViewManifest),
  !isCompletedAzureViewSetV2(publishedPartialViewSet),
];

if (
  !viewValidationResults.every(result => result) ||
  !viewSetValidationResults.every(result => result) ||
  !publishedViewValidationResults.every(result => result) ||
  !publishedViewSetValidationResults.every(result => result)
) {
  throw new Error('Task 4 artifact evidence view runtime assertion failed.');
}

// @ts-expect-error V3 manifests reject unknown schema versions.
const unknownViewManifestVersion: CompletedViewManifestV3 = { ...completedViewManifest, schemaVersion: 4 };

// @ts-expect-error V2 view sets reject unknown schema versions.
const unknownViewSetVersion: CompletedAzureViewSetV2 = { ...completedViewSet, schemaVersion: 3 };

// @ts-expect-error V3 manifests require at least one hashed artifact descriptor.
const missingViewArtifacts: CompletedViewManifestV3 = { ...completedViewManifest, artifacts: [] };

const incompleteViewSet: CompletedAzureViewSetV2 = {
  ...completedViewSet,
  // @ts-expect-error Promoted V2 view sets require a completed publication decision.
  publicationDecision: { ...completedViewSetPublicationDecision, evidence: 'insufficient', publication: 'quarantined' },
};

// @ts-expect-error V4 published manifests reject unknown schema versions.
const unknownPublishedViewManifestVersion: PublishedViewManifestV4 = { ...publishedPartialViewManifest, schemaVersion: 5 };

// @ts-expect-error V3 published view sets reject unknown schema versions.
const unknownPublishedViewSetVersion: PublishedAzureViewSetV3 = { ...publishedPartialViewSet, schemaVersion: 4 };

const invalidPublishedViewCoverage: PublishedViewManifestV4 = {
  ...publishedPartialViewManifest,
  // @ts-expect-error Published view coverage has a closed complete/partial vocabulary.
  coverage: 'suppressed',
};

void [
  completedViewManifest,
  completedViewSet,
  viewValidationResults,
  viewSetValidationResults,
  unknownViewManifestVersion,
  unknownViewSetVersion,
  missingViewArtifacts,
  incompleteViewSet,
  publishedPartialViewManifest,
  publishedCompleteViewManifest,
  publishedPartialViewSet,
  publishedViewValidationResults,
  publishedViewSetValidationResults,
  unknownPublishedViewManifestVersion,
  unknownPublishedViewSetVersion,
  invalidPublishedViewCoverage,
  // Prevent private-helper import assertions from being optimized away by editor tooling.
  undefined as unknown as CompletedViewArtifactDescriptor,
  undefined as unknown as AzureViewSetV2SurfaceReference,
];
