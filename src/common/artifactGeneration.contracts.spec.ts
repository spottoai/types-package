import {
  ARTIFACT_GENERATION_SCHEMA_VERSION,
  type ArtifactGenerationManifest,
  type ArtifactSourceGeneration,
  type CompletedArtifactGenerationPointer,
  type JsonObject,
} from '../index';

const sourceGeneration = {
  provider: 'aws',
  accountId: '123456789012',
  source: 'ec2-instances',
  status: 'available',
  generationId: 'ec2-generation-1',
  generatedAt: '2026-07-23T00:00:00.000Z',
} satisfies ArtifactSourceGeneration<'aws', '123456789012'>;

const completedManifest = {
  schemaVersion: ARTIFACT_GENERATION_SCHEMA_VERSION,
  provider: 'aws',
  accountId: '123456789012',
  artifactGeneration: {
    runId: 'portal-run-1',
    generatedAt: '2026-07-23T00:05:00.000Z',
  },
  status: 'completed',
  artifacts: [
    {
      name: 'resource-collection',
      mediaType: 'application/json',
      contentEncoding: 'gzip',
      byteLength: 1024,
      sha256: 'a'.repeat(64),
    },
  ],
  sourceGenerations: [sourceGeneration],
  evidence: {
    status: 'complete',
    issues: [],
  },
} satisfies ArtifactGenerationManifest<'aws', '123456789012', 'portal-run-1'>;

const partialManifest = {
  ...completedManifest,
  artifactGeneration: {
    runId: 'portal-run-2',
    generatedAt: '2026-07-23T00:10:00.000Z',
  },
  status: 'partial',
  sourceGenerations: [
    {
      provider: 'aws',
      accountId: '123456789012',
      source: 'billing',
      status: 'missing',
      reason: 'No accepted billing generation exists.',
    },
  ],
  evidence: {
    status: 'partial',
    issues: [
      {
        source: 'billing',
        status: 'missing',
        reason: 'No accepted billing generation exists.',
      },
    ],
  },
} satisfies ArtifactGenerationManifest<'aws', '123456789012', 'portal-run-2'>;

const completedPointer = {
  schemaVersion: ARTIFACT_GENERATION_SCHEMA_VERSION,
  provider: 'aws',
  accountId: '123456789012',
  status: 'completed',
  artifactGeneration: completedManifest.artifactGeneration,
  manifest: {
    name: 'manifest',
    mediaType: 'application/json',
    contentEncoding: 'identity',
    byteLength: 512,
    sha256: 'b'.repeat(64),
  },
  completedAt: '2026-07-23T00:06:00.000Z',
} satisfies CompletedArtifactGenerationPointer<'aws', '123456789012', 'portal-run-1'>;

const jsonMetadata = {
  source: 'portal',
  counts: [1, 2],
  complete: true,
  optional: null,
} satisfies JsonObject;

const invalidJsonMetadata: JsonObject = {
  // @ts-expect-error Public generation metadata must be JSON-only.
  generatedAt: new Date(),
};

const invalidProviderManifest: ArtifactGenerationManifest<'aws', '123456789012', 'portal-run-1'> = {
  ...completedManifest,
  // @ts-expect-error The manifest provider must match its declared provider binding.
  provider: 'azure',
};

const invalidAccountManifest: ArtifactGenerationManifest<'aws', '123456789012', 'portal-run-1'> = {
  ...completedManifest,
  sourceGenerations: [
    {
      ...sourceGeneration,
      // @ts-expect-error Every source generation must belong to the manifest account.
      accountId: '999999999999',
    },
  ],
};

const invalidGenerationPointer: CompletedArtifactGenerationPointer<'aws', '123456789012', 'portal-run-1'> = {
  ...completedPointer,
  artifactGeneration: {
    ...completedPointer.artifactGeneration,
    // @ts-expect-error The pointer must bind the exact declared run generation.
    runId: 'portal-run-2',
  },
};

// @ts-expect-error A completed manifest cannot declare partial evidence.
const invalidCompletedEvidence: ArtifactGenerationManifest<'aws', '123456789012', 'portal-run-1'> = {
  ...completedManifest,
  evidence: {
    status: 'partial',
    issues: [
      {
        source: 'billing',
        status: 'missing',
        reason: 'Missing billing evidence.',
      },
    ],
  },
};

const invalidSourceStatus: ArtifactSourceGeneration<'aws', '123456789012'> = {
  ...sourceGeneration,
  // @ts-expect-error Source-generation status uses the closed public vocabulary.
  status: 'unknown',
};

void [
  completedManifest,
  partialManifest,
  completedPointer,
  jsonMetadata,
  invalidJsonMetadata,
  invalidProviderManifest,
  invalidAccountManifest,
  invalidGenerationPointer,
  invalidCompletedEvidence,
  invalidSourceStatus,
];
