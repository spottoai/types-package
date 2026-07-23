export const ARTIFACT_GENERATION_SCHEMA_VERSION = 1 as const;

export type ArtifactGenerationSchemaVersion = typeof ARTIFACT_GENERATION_SCHEMA_VERSION;

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type ArtifactProvider = 'azure' | 'aws';

/** Provider-neutral identity shared by immutable Portal and plugin runs. */
export interface ArtifactGeneration<RunId extends string = string> {
  runId: RunId;
  generatedAt: string;
}

export interface ArtifactAccountBinding<Provider extends ArtifactProvider = ArtifactProvider, AccountId extends string = string> {
  provider: Provider;
  accountId: AccountId;
}

export type ArtifactSourceGenerationStatus = 'available' | 'partial' | 'missing' | 'stale' | 'unavailable';

type ArtifactSourceGenerationBase<Provider extends ArtifactProvider, AccountId extends string> = ArtifactAccountBinding<Provider, AccountId> & {
  source: string;
};

export type ArtifactSourceGeneration<Provider extends ArtifactProvider = ArtifactProvider, AccountId extends string = string> =
  | (ArtifactSourceGenerationBase<Provider, AccountId> & {
      status: 'available';
      generationId: string;
      generatedAt: string;
      reason?: never;
    })
  | (ArtifactSourceGenerationBase<Provider, AccountId> & {
      status: 'partial' | 'stale';
      generationId: string;
      generatedAt: string;
      reason: string;
    })
  | (ArtifactSourceGenerationBase<Provider, AccountId> & {
      status: 'missing' | 'unavailable';
      generationId?: never;
      generatedAt?: never;
      reason: string;
    });

export type ArtifactContentEncoding = 'identity' | 'gzip';

/** Logical artifact metadata; storage paths remain application-owned. */
export interface ArtifactDescriptor {
  name: string;
  mediaType: 'application/json';
  contentEncoding: ArtifactContentEncoding;
  byteLength: number;
  sha256: string;
}

export type ArtifactEvidenceIssueStatus = 'partial' | 'missing' | 'stale' | 'unavailable';

export interface ArtifactEvidenceIssue {
  source: string;
  status: ArtifactEvidenceIssueStatus;
  reason: string;
}

export type ArtifactManifestEvidence =
  | {
      status: 'complete';
      issues: [];
    }
  | {
      status: 'partial';
      issues: [ArtifactEvidenceIssue, ...ArtifactEvidenceIssue[]];
    };

type ArtifactGenerationManifestBase<Provider extends ArtifactProvider, AccountId extends string, RunId extends string> = ArtifactAccountBinding<
  Provider,
  AccountId
> & {
  schemaVersion: ArtifactGenerationSchemaVersion;
  artifactGeneration: ArtifactGeneration<RunId>;
  artifacts: [ArtifactDescriptor, ...ArtifactDescriptor[]];
  sourceGenerations: ArtifactSourceGeneration<Provider, AccountId>[];
};

export type ArtifactGenerationManifest<
  Provider extends ArtifactProvider = ArtifactProvider,
  AccountId extends string = string,
  RunId extends string = string,
> = ArtifactGenerationManifestBase<Provider, AccountId, RunId> &
  (
    | {
        status: 'completed';
        evidence: Extract<ArtifactManifestEvidence, { status: 'complete' }>;
      }
    | {
        status: 'partial';
        evidence: Extract<ArtifactManifestEvidence, { status: 'partial' }>;
      }
  );

/** The sole visibility commit for one fully written immutable generation. */
export interface CompletedArtifactGenerationPointer<
  Provider extends ArtifactProvider = ArtifactProvider,
  AccountId extends string = string,
  RunId extends string = string,
> extends ArtifactAccountBinding<Provider, AccountId> {
  schemaVersion: ArtifactGenerationSchemaVersion;
  status: 'completed';
  artifactGeneration: ArtifactGeneration<RunId>;
  manifest: ArtifactDescriptor;
  completedAt: string;
}
