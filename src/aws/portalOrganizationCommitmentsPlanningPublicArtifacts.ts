import type { ArtifactGeneration } from '../common/artifactGeneration.js';
import type { AwsOrganizationCommitmentsPlanningView } from './organizationCommitments.js';
import type { AwsPublicArtifactForbiddenCredentialFields } from './publicArtifacts.js';
import type { AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION } from './portalPublicArtifacts.js';

export const AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1 as const;
export const AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME = 'organization-commitments-planning.json.gz' as const;

/** Immutable AWS organization Commitments Planning Portal artifact. */
export type AwsPortalOrganizationCommitmentsPlanningArtifact<
  CompanyId extends string = string,
  EstateId extends string = string,
  OrganizationId extends string = string,
  AccountId extends string = string,
  RunId extends string = string,
> = AwsPublicArtifactForbiddenCredentialFields & {
  schemaVersion: typeof AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION;
  portalSchemaVersion: typeof AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION;
  provider: 'aws';
  artifactType: 'organization-commitments-planning';
  artifactGeneration: ArtifactGeneration<RunId>;
  logicalName: typeof AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME;
  accountId?: never;
} & AwsOrganizationCommitmentsPlanningView<CompanyId, EstateId, OrganizationId, AccountId>;
