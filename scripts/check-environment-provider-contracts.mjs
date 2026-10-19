import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const builds = [
  ['root CJS', require('@spottoai/types-package')],
  ['environment CJS', require('@spottoai/types-package/environment')],
  ['root ESM', await import('@spottoai/types-package')],
  ['environment ESM', await import('@spottoai/types-package/environment')],
];
const aws = { kind: 'aws-account', companyId: 'company-1', accountId: '000123456789' };
const azure = { kind: 'azure-subscription', tenantId: 'tenant-1', companyId: 'company-1', subscriptionId: 'sub-1' };
const tenant = { kind: 'azure-tenant', tenantId: 'tenant-1' };
for (const [build, api] of builds) {
  for (const name of [
    'ENVIRONMENT_PROJECTION_CONTENT_REQUIRED_KEYS_V1',
    'ENVIRONMENT_PROJECTION_CONTENT_OPTIONAL_KEYS_V1',
    'createEnvironmentProjectionContentValidatorV1',
    'isEnvironmentMoneyValueWithProvenanceV1',
  ])
    assert.equal(api[name], undefined, `${build}: implementation helper ${name} is private`);
  for (const scope of [aws, azure, tenant]) {
    assert.equal(api.isEnvironmentAnyScopeV1(scope), true);
    const subject = api.buildEnvironmentAnyScopeQualifiedSubjectV1(scope);
    assert.deepEqual(api.parseEnvironmentAnyScopeQualifiedSubjectV1(subject), scope);
    assert.equal(api.environmentScopesEqualV1(scope, structuredClone(scope)), true);
  }
  assert.equal(api.isEnvironmentAnyScopeV1({ ...aws, accountId: 123456789 }), false);
  assert.equal(api.environmentScopesEqualV1(azure, aws), false);
  assert.equal(api.environmentAwsScopesEqual(aws, { ...aws, companyId: 'other' }), false);
  assert.equal(api.environmentAwsScopesEqual(null, aws), false);
  assert.equal(api.parseEnvironmentAnyScopeQualifiedSubjectV1('["aws-account", "company-1", "000123456789"]'), null);
  const managed = 'arn:aws:iam::aws:policy/AdministratorAccess';
  for (const [type, identity] of [
    ['AWS::IAM::ManagedPolicy', managed],
    ['AWS::Route53::HostedZone', '/hostedzone/Z0000123'],
    ['AWS::Cognito::UserPool', 'ap-southeast-2:01234567-89ab-cdef-0123-456789abcdef'],
    ['AWS::Logs::LogGroup', 'arn:aws:logs:ap-southeast-2:000123456789:log-group:/aws/lambda/My#Group'],
  ]) {
    assert.equal(api.isEnvironmentAwsResourceIdV1(aws, identity), true, identity);
    assert.equal(api.isEnvironmentAwsResourceTypeV1(type), true);
    const ref = api.buildEnvironmentAwsLogicalResourceReferenceV1(aws, type, identity);
    assert.deepEqual(api.parseEnvironmentAnyLogicalEvidenceReferenceV1(ref), {
      provider: 'aws',
      kind: 'resource',
      scope: aws,
      resourceType: type,
      resourceId: identity,
    });
  }
  for (const identity of [
    '../resource',
    '/hostedzone/../escape',
    'https://evil.invalid',
    'C:/escape',
    'value\u0000',
    'arn:aws:iam::123456789012:policy/Foreign',
  ]) {
    assert.equal(api.isEnvironmentAwsResourceIdV1(aws, identity), false, identity);
  }
  assert.equal(api.isEnvironmentAwsResourceIdV1(null, managed), false);
  assert.equal(api.isEnvironmentAwsResourceTypeV1('Ec2Instance'), false);
  for (const kind of [
    'aws-account-security-posture',
    'aws-account-health',
    'aws-account-governance',
    'aws-account-service-retirements',
    'aws-account-data-protection',
    'aws-account-savings-ledger',
    'aws-account-public-ip-exposure',
  ]) {
    assert.equal(api.isEnvironmentAwsArtifactKindV1(kind), true);
    const ref = api.buildEnvironmentAwsLogicalArtifactReferenceV1(kind, aws);
    assert.deepEqual(api.parseEnvironmentAnyLogicalEvidenceReferenceV1(ref), { provider: 'aws', kind: 'artifact', artifactKind: kind, scope: aws });
  }
  assert.equal(api.isEnvironmentAwsArtifactKindV1('tenant-governance'), false);
  const azureRef = api.buildEnvironmentLogicalArtifactReferenceV1('subscription-summary', api.buildEnvironmentScopeQualifiedSubjectV1(azure));
  assert.deepEqual(api.parseEnvironmentAnyLogicalEvidenceReferenceV1(azureRef), {
    provider: 'azure',
    kind: 'artifact',
    artifactKind: 'subscription-summary',
    subject: '["azure-subscription","tenant-1","company-1","sub-1"]',
  });
  const tenantRef = api.buildEnvironmentLogicalArtifactReferenceV1('tenant-governance', api.buildEnvironmentTenantScopeQualifiedSubjectV1(tenant));
  assert.equal(api.parseEnvironmentAnyLogicalEvidenceReferenceV1(tenantRef).provider, 'azure');
  for (const invalid of [null, {}, '../path', 'spotto://artifact/v1/unknown/AAAA', 'https://evil.invalid'])
    assert.equal(api.parseEnvironmentAnyLogicalEvidenceReferenceV1(invalid), null);
}
const root = require('@spottoai/types-package');
assert.deepEqual(root.parseAwsArn('arn:aws:iam::aws:policy/AdministratorAccess'), {
  partition: 'aws',
  service: 'iam',
  region: '',
  accountId: 'aws',
  resource: 'policy/AdministratorAccess',
});
assert.equal(root.parseAwsArn('not-an-arn'), null);
assert.equal(root.parseAwsArn(null), null);
const narrowAws = require('@spottoai/types-package/aws');
assert.deepEqual(narrowAws.parseAwsArn('arn:aws:s3:::bucket'), { partition: 'aws', service: 's3', region: '', accountId: '', resource: 'bucket' });
console.log('Environment provider dispatch, identifier and private-export contracts passed in CJS and ESM.');
