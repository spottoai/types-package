import type { ArtifactGeneration } from '../common/artifactGeneration';

export const AZURE_PORTAL_ARTIFACT_SCHEMA_VERSION = 1 as const;

export type AzurePortalArtifactSchemaVersion = typeof AZURE_PORTAL_ARTIFACT_SCHEMA_VERSION;

/** Identifies the exact producer run that wrote a portal artifact. */
export type AzurePortalArtifactGeneration = ArtifactGeneration;

export interface AzurePortalVersionedArtifact {
  schemaVersion?: AzurePortalArtifactSchemaVersion;
  /**
   * Present on generation-aware artifacts. Readers should compare this value
   * with the completed-view manifest before combining independently stored files.
   */
  artifactGeneration?: AzurePortalArtifactGeneration;
}
