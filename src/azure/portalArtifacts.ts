export const AZURE_PORTAL_ARTIFACT_SCHEMA_VERSION = 1 as const;

export type AzurePortalArtifactSchemaVersion = typeof AZURE_PORTAL_ARTIFACT_SCHEMA_VERSION;

/** Identifies the exact producer run that wrote a portal artifact. */
export interface AzurePortalArtifactGeneration {
  runId: string;
  generatedAt: string;
}

export interface AzurePortalVersionedArtifact {
  schemaVersion?: AzurePortalArtifactSchemaVersion;
  /**
   * Present on generation-aware artifacts. Readers should compare this value
   * with the completed-view manifest before combining independently stored files.
   */
  artifactGeneration?: AzurePortalArtifactGeneration;
}
