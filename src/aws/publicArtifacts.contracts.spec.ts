import { AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION, type AwsPortalLifecycleArtifact } from '../index';

// @ts-expect-error Reduced Azure-derived account-summary shapes are not exported.
import type { AwsPortalAccountSummaryArtifact } from '../index';
// @ts-expect-error Reduced Azure-derived resource-collection shapes are not exported.
import type { AwsPortalResourceCollectionArtifact } from '../index';
// @ts-expect-error Deprecated plugin shapes are not exported.
import type { AwsPluginResourceArtifact } from '../index';
// @ts-expect-error The service-specific relationship artifact is replaced by the generic resource graph.
import type { AwsPortalRelationshipArtifact } from '../index';

const artifactGeneration = {
  runId: 'portal-run-1',
  generatedAt: '2026-07-23T00:05:00.000Z',
} as const;

const lifecycle = {
  schemaVersion: AWS_PUBLIC_ARTIFACT_SCHEMA_VERSION,
  provider: 'aws',
  accountId: '123456789012',
  artifactType: 'lifecycle',
  artifactGeneration,
  generatedAt: artifactGeneration.generatedAt,
  entries: [
    {
      id: 'service-retirement:example',
      lifecycleClass: 'service-retirement',
      title: 'Example retirement',
      effectiveAt: '2026-12-01T00:00:00.000Z',
      severity: 'warning',
      resources: [
        {
          provider: 'aws',
          id: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
          arn: 'arn:aws:ec2:ap-southeast-2:123456789012:instance/i-123',
          accountId: '123456789012',
          region: 'ap-southeast-2',
          name: 'web-1',
          resourceType: 'AWS::EC2::Instance',
        },
      ],
    },
  ],
} satisfies AwsPortalLifecycleArtifact<'123456789012', 'portal-run-1'>;

const invalidCredentialReference: AwsPortalLifecycleArtifact = {
  ...lifecycle,
  // @ts-expect-error Public lifecycle artifacts cannot expose credential references.
  credentialReference: 'arn:aws:secretsmanager:example',
};

const invalidExternalId: AwsPortalLifecycleArtifact = {
  ...lifecycle,
  // @ts-expect-error Public artifacts cannot expose setup External IDs.
  externalId: 'setup-secret',
};

void [lifecycle, invalidCredentialReference, invalidExternalId];
void (undefined as unknown as AwsPortalAccountSummaryArtifact);
void (undefined as unknown as AwsPortalResourceCollectionArtifact);
void (undefined as unknown as AwsPluginResourceArtifact);
void (undefined as unknown as AwsPortalRelationshipArtifact);
