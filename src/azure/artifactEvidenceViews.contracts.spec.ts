import {
  isCompletedAzureViewSetV2,
  isCompletedViewManifestV3,
  type ArtifactPublicationDecision,
  type CompletedAzureViewSetV2,
  type CompletedViewManifestV3,
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

const additiveViewSet = {
  ...completedViewSet,
  futureTopLevelField: { producer: 'next-version' },
};

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
];

const viewSetValidationResults: boolean[] = [
  isCompletedAzureViewSetV2(completedViewSet),
  isCompletedAzureViewSetV2(additiveViewSet),
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
];

if (!viewValidationResults.every(result => result) || !viewSetValidationResults.every(result => result)) {
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

void [
  completedViewManifest,
  completedViewSet,
  viewValidationResults,
  viewSetValidationResults,
  unknownViewManifestVersion,
  unknownViewSetVersion,
  missingViewArtifacts,
  incompleteViewSet,
  // Prevent private-helper import assertions from being optimized away by editor tooling.
  undefined as unknown as CompletedViewArtifactDescriptor,
  undefined as unknown as AzureViewSetV2SurfaceReference,
];
