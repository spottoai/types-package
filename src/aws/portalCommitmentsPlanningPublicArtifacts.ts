import type { AwsCommitmentsPlanningView } from '../azure/commitmentsPlanning.js';
import type { AwsPublicArtifactEnvelope } from './publicArtifacts.js';
import type { AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION } from './portalPublicArtifacts.js';

export const AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME = 'commitments-planning.json.gz' as const;

/** Immutable, exact-account AWS Commitments Planning Portal artifact. */
export type AwsPortalCommitmentsPlanningArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<
  'commitments-planning',
  AccountId,
  RunId
> & {
  portalSchemaVersion: typeof AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION;
  logicalName: typeof AWS_PORTAL_COMMITMENTS_PLANNING_LOGICAL_NAME;
  providerScope: AwsCommitmentsPlanningView['providerScope'] & {
    providerScopeId: AccountId;
  };
} & Omit<AwsCommitmentsPlanningView, 'providerScope'>;
