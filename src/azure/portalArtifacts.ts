export const AZURE_PORTAL_ARTIFACT_SCHEMA_VERSION = 1 as const;

export type AzurePortalArtifactSchemaVersion = typeof AZURE_PORTAL_ARTIFACT_SCHEMA_VERSION;

export interface AzurePortalVersionedArtifact {
  schemaVersion?: AzurePortalArtifactSchemaVersion;
}
