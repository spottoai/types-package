import {
  buildEnvironmentAwsLogicalArtifactReferenceV1,
  buildEnvironmentAwsLogicalResourceReferenceV1,
  isEnvironmentAwsAccountProjectionV1,
  type EnvironmentAwsAccountCompiledGenerationPointerV1,
  type EnvironmentAwsAccountProjectionV1,
  type EnvironmentAwsAccountScopeV1,
  type EnvironmentAwsAccountSourceBindingV1,
  type EnvironmentScopeV1,
  type EnvironmentAwsMoneyProvenanceV1,
  type EnvironmentAwsLogicalEvidenceReferenceV1,
} from './index.js';

const scope: EnvironmentAwsAccountScopeV1 = { kind: 'aws-account', companyId: 'company-1', accountId: '000123456789' };
const sourceBinding: EnvironmentAwsAccountSourceBindingV1 = {
  kind: 'aws-account-portal-publication',
  scope,
  portalRunId: 'portal:run/1',
  portalGeneratedAt: '2026-10-18T23:59:59.000Z',
  artifacts: [
    { name: 'recommendations.json', etag: '"rec-1"' },
    { name: 'resources.json', etag: '"res-1"' },
    { name: 'summary.json', etag: '"sum-1"' },
  ],
  completedAt: '2026-10-19T00:00:00.000Z',
};
const pointer: EnvironmentAwsAccountCompiledGenerationPointerV1 = {
  schemaVersion: 1,
  status: 'completed',
  scope,
  sourceBinding,
  environmentRunId: 'environment-run-1',
  treeDigestSha256: 'b'.repeat(64),
  fileCount: 8,
  generatedAt: '2026-10-19T00:00:01.000Z',
};
const artifact = buildEnvironmentAwsLogicalArtifactReferenceV1('aws-account-summary', scope);
const resource = buildEnvironmentAwsLogicalResourceReferenceV1(
  scope,
  'AWS::Lambda::Function',
  'arn:aws:lambda:ap-southeast-2:000123456789:function:MixedCaseFunction'
);
const validate: (value: unknown) => value is EnvironmentAwsAccountProjectionV1 = isEnvironmentAwsAccountProjectionV1;
declare const projection: EnvironmentAwsAccountProjectionV1;
const accountLabel: string = projection.account.safeLabel;
const completedPortalCoverage = projection.sourceCoverage.completedPortalPublication;
const provenance: EnvironmentAwsMoneyProvenanceV1 | undefined = projection.costSummary.observedCost?.provenance;
const references: EnvironmentAwsLogicalEvidenceReferenceV1[] = projection.recommendations.items[0]!.sourceReferences;
const cost: EnvironmentAwsAccountProjectionV1['costSummary'] = {
  observedCost: { amount: '0', currencyCode: 'NZD', basis: 'billed', period: '2026-10', provenance: 'account-summary' },
};
// @ts-expect-error AWS nested money cannot carry Azure provenance.
cost.observedCost!.provenance = 'subscription-summary';
// @ts-expect-error AWS nested evidence cannot carry Azure artifact kinds.
references.push('spotto://artifact/v1/subscription-summary/subject');

// @ts-expect-error AWS account identity must retain twelve digits including leading zeros.
const invalidNumericScope: EnvironmentAwsAccountScopeV1 = { ...scope, accountId: 123456789 };
// @ts-expect-error Existing Azure scope contracts remain Azure-only.
const invalidAzureScope: EnvironmentScopeV1 = scope;
// @ts-expect-error AWS pointers retain exactly eight documents.
const invalidPointer: EnvironmentAwsAccountCompiledGenerationPointerV1 = { ...pointer, fileCount: 7 };
// @ts-expect-error AWS projection has an account summary, not an Azure subscription summary.
const subscription = projection.subscription;
// @ts-expect-error Key Vault-specific coverage is not part of the AWS projection.
const secretStoreCoverage = projection.secretStoreCoverage;
// @ts-expect-error Azure artifact kinds cannot enter AWS logical references.
buildEnvironmentAwsLogicalArtifactReferenceV1('subscription-summary', scope);

void [
  pointer,
  artifact,
  resource,
  validate,
  accountLabel,
  completedPortalCoverage,
  provenance,
  references,
  cost,
  invalidNumericScope,
  invalidAzureScope,
  invalidPointer,
  subscription,
  secretStoreCoverage,
];

// @ts-expect-error Content-validator construction is not a public package contract.
import type { EnvironmentProjectionValidationPolicyV1 } from './index.js';
void (undefined as unknown as EnvironmentProjectionValidationPolicyV1);
