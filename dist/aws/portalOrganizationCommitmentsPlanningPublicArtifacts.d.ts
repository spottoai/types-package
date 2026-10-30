import type { ArtifactGeneration } from '../common/artifactGeneration.js';
import type { AwsOrganizationCommitmentsPlanningView } from './organizationCommitments.js';
import type { AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION, AwsPublicArtifactForbiddenCredentialFields } from './publicArtifacts.js';
export declare const AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION: 1;
export declare const AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME: "organization-commitments-planning.json.gz";
/** Immutable AWS organization Commitments Planning Portal artifact. */
export type AwsPortalOrganizationCommitmentsPlanningArtifact<CompanyId extends string = string, EstateId extends string = string, OrganizationId extends string = string, AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactForbiddenCredentialFields & {
    schemaVersion: typeof AWS_ORGANIZATION_COMMITMENTS_PUBLIC_ARTIFACT_SCHEMA_VERSION;
    portalSchemaVersion: typeof AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION;
    provider: 'aws';
    artifactType: 'organization-commitments-planning';
    artifactGeneration: ArtifactGeneration<RunId>;
    logicalName: typeof AWS_ORGANIZATION_COMMITMENTS_PLANNING_LOGICAL_NAME;
    accountId?: never;
} & AwsOrganizationCommitmentsPlanningView<CompanyId, EstateId, OrganizationId, AccountId>;
//# sourceMappingURL=portalOrganizationCommitmentsPlanningPublicArtifacts.d.ts.map