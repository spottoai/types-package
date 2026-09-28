import type { ArtifactAccountBinding, ArtifactGeneration } from '../common/artifactGeneration';
import type { ServiceRetirementPortalResource } from '../azure/serviceRetirement';
import type { AwsForbiddenCredentialFields } from './requests';

export const AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1 as const;

/** Portal envelope version shared by the AWS Portal artifacts. */
export const AWS_PORTAL_PUBLIC_ARTIFACT_SCHEMA_VERSION = 1 as const;

export const AWS_PUBLIC_ARTIFACT_TYPES = [
  'resource-collection',
  'resource-collection-history',
  'account-summary',
  'account-summary-history',
  'account-summary-ai-cost-summary',
  'commitments-planning',
  'relationships',
  'lifecycle',
  'plugin-subscription',
  'plugin-resource',
] as const;

export type AwsPublicArtifactSchemaVersion = typeof AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION;

export type AwsPublicArtifactType = (typeof AWS_PUBLIC_ARTIFACT_TYPES)[number];

/** Public artifacts must not expose setup values or credential-store locators. */
export type AwsPublicArtifactForbiddenCredentialFields = AwsForbiddenCredentialFields & {
  externalId?: never;
  roleArn?: never;
  secretArn?: never;
  secretReference?: never;
};

export type AwsPublicArtifactEnvelope<
  ArtifactType extends AwsPublicArtifactType = AwsPublicArtifactType,
  AccountId extends string = string,
  RunId extends string = string,
> = ArtifactAccountBinding<'aws', AccountId> &
  AwsPublicArtifactForbiddenCredentialFields & {
    schemaVersion: AwsPublicArtifactSchemaVersion;
    artifactType: ArtifactType;
    artifactGeneration: ArtifactGeneration<RunId>;
  };

export type AwsPortalLifecycleResource<AccountId extends string = string> = ServiceRetirementPortalResource &
  ArtifactAccountBinding<'aws', AccountId> &
  AwsPublicArtifactForbiddenCredentialFields & {
    arn?: string;
    region?: string;
  };

export type AwsPortalLifecycleClass = 'service-retirement' | 'credential-expiry' | 'commitment-expiry';

export type AwsPortalLifecycleSeverity = 'information' | 'warning' | 'critical';

export type AwsPortalLifecycleEntry<AccountId extends string = string> = AwsPublicArtifactForbiddenCredentialFields & {
  id: string;
  lifecycleClass: AwsPortalLifecycleClass;
  title: string;
  summary?: string;
  effectiveAt: string;
  severity: AwsPortalLifecycleSeverity;
  resources: AwsPortalLifecycleResource<AccountId>[];
};

export type AwsPortalLifecycleArtifact<AccountId extends string = string, RunId extends string = string> = AwsPublicArtifactEnvelope<
  'lifecycle',
  AccountId,
  RunId
> & {
  generatedAt: string;
  entries: AwsPortalLifecycleEntry<AccountId>[];
};
