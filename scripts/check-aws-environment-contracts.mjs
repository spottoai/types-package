import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const builds = [
  ['root CJS', require('@spottoai/types-package')],
  ['environment CJS', require('@spottoai/types-package/environment')],
  ['root ESM', await import('@spottoai/types-package')],
  ['environment ESM', await import('@spottoai/types-package/environment')],
];
const scope = { kind: 'aws-account', companyId: 'company-1', accountId: '000123456789' };
const foreignScope = { ...scope, accountId: '123456789012' };
const completedAt = '2026-10-19T00:00:00.000Z';
const sourceBinding = {
  kind: 'aws-account-portal-publication',
  scope,
  portalRunId: 'portal:run/1',
  portalGeneratedAt: '2026-10-18T23:59:59.000Z',
  artifacts: [
    'commitments-planning.json',
    'data-protection.json.gz',
    'governance-access.json.gz',
    'governance.json.gz',
    'health-availability-statuses.json',
    'health-events.json',
    'public-ip-addresses.json',
    'recommendation-filter-resources.json',
    'recommendations.json',
    'relationships.json.gz',
    'resources.json',
    'savings-ledgers.json',
    'security-posture.json',
    'serviceretirement-coverage.json',
    'serviceretirement.json',
    'summary.json',
  ].map((name, index) => ({ name, etag: `"etag-${index}"` })),
  completedAt,
};
const arn = 'arn:aws:lambda:ap-southeast-2:000123456789:function:MixedCaseFunction';
const resourceType = 'AWS::Lambda::Function';
const route = '/company/company-1/dashboard';
const complete = { status: 'complete' };
const partial = { status: 'partial', reason: 'Some provider evidence was unavailable.' };
const list = (items = []) => ({ items, totalCount: items.length, includedCount: items.length, truncated: false });
const encoded = value => Buffer.from(value).toString('base64url');
const rawResource = tuple => `spotto://resource/v1/aws/${encoded(JSON.stringify(tuple))}`;
const clone = value => structuredClone(value);

for (const [build, api] of builds) {
  const {
    ENVIRONMENT_AWS_ARTIFACT_KINDS_V1: kinds,
    buildEnvironmentAwsAccountScopeQualifiedSubjectV1: subject,
    buildEnvironmentAwsLogicalArtifactReferenceV1: artifact,
    buildEnvironmentAwsLogicalResourceReferenceV1: resource,
    parseEnvironmentAwsLogicalArtifactReferenceV1: parseArtifact,
    parseEnvironmentAwsLogicalResourceReferenceV1: parseResource,
    isEnvironmentAwsLogicalEvidenceReferenceV1: isEvidence,
    isEnvironmentAwsAccountScopeV1: isScope,
    isEnvironmentAwsAccountSourceBindingV1: isBinding,
    isEnvironmentAwsAccountCompiledGenerationPointerV1: isPointer,
    isEnvironmentAwsAccountProjectionV1: isProjection,
  } = api;
  assert.equal(typeof isProjection, 'function', `${build}: exports AWS validators`);
  assert.deepEqual(kinds, [
    'aws-account-summary',
    'aws-account-resources',
    'aws-account-recommendations',
    'aws-account-commitments',
    'aws-account-reliability',
    'aws-account-projection',
    'aws-account-security-posture',
    'aws-account-health',
    'aws-account-governance',
    'aws-account-service-retirements',
    'aws-account-data-protection',
    'aws-account-savings-ledger',
    'aws-account-public-ip-exposure',
  ]);
  assert.equal(isScope(scope), true);
  for (const invalid of [
    { ...scope, accountId: 123456789 },
    { ...scope, accountId: '123456789' },
    { ...scope, accountId: '000123456789 ' },
    { ...scope, accountId: '000123456789\n' },
    { ...scope, tenantId: 'tenant-1' },
    { ...scope, kind: 'azure-subscription' },
    { ...scope, companyId: '' },
    Object.assign(Object.create({ inherited: true }), scope),
    JSON.parse(JSON.stringify(scope).replace('"companyId":', '"__proto__":{},"companyId":')),
  ])
    assert.equal(isScope(invalid), false, `${build}: rejects invalid scope`);
  assert.equal(subject(scope), '["aws-account","company-1","000123456789"]');
  assert.equal(isBinding(sourceBinding), true, 'opaque source identity may contain colons and slashes');
  for (const patch of [
    { manifestPath: 'runs/source/manifest.json' },
    { kind: 'aws-account-portal-generation' },
    { artifacts: Array(3) },
    { artifacts: sourceBinding.artifacts.map(artifact => ({ ...artifact, etag: 'e'.repeat(513) })) },

    { portalRunId: 'x'.repeat(257) },
    { portalRunId: ' bad' },
    { portalRunId: 'bad\u0000run' },
    { portalManifestSha256: 'a'.repeat(64) },
    { portalGeneratedAt: '2026-10-20T00:00:00.000Z' },
    { artifacts: sourceBinding.artifacts.filter(artifact => artifact.name !== 'summary.json') },
    { artifacts: [...sourceBinding.artifacts].reverse() },
    { artifacts: [...sourceBinding.artifacts, sourceBinding.artifacts[0]] },
    { artifacts: [{ name: '../summary.json', etag: '"etag"' }] },
    { artifacts: sourceBinding.artifacts.map(artifact => ({ ...artifact, etag: '*' })) },
    { artifacts: sourceBinding.artifacts.map(artifact => ({ ...artifact, etag: 'W/"weak"' })) },
    { artifacts: sourceBinding.artifacts.map(artifact => ({ ...artifact, etag: 'bad\nvalue' })) },
    { completedAt: '2026-10-19T00:00:00Z' },
    { completedAt: '2026-02-30T00:00:00.000Z' },
  ])
    assert.equal(isBinding({ ...sourceBinding, ...patch }), false, `${build}: rejects invalid binding`);

  const coreReceipt = sourceBinding.artifacts.filter(artifact => ['summary.json', 'resources.json', 'recommendations.json'].includes(artifact.name));
  assert.equal(isBinding({ ...sourceBinding, artifacts: coreReceipt }), true, `${build}: bounded core publication receipt`);
  const summary = artifact('aws-account-summary', scope);
  for (const kind of kinds) {
    const reference = artifact(kind, scope);
    assert.deepEqual(parseArtifact(reference), { kind: 'artifact', artifactKind: kind, scope });
    assert.equal(isEvidence(reference), true);
    assert.equal(parseArtifact(`${reference}=`), null);
    assert.equal(parseArtifact(`${reference}/extra`), null);
  }
  const reference = resource(scope, resourceType, arn);
  const tuple = ['aws-account', 'company-1', '000123456789', resourceType, arn];
  assert.equal(reference, rawResource(tuple), `${build}: byte-stable AWS resource identity`);
  assert.deepEqual(parseResource(reference), { kind: 'resource', scope, resourceType, resourceId: arn });
  assert.equal(isEvidence(reference), true);
  assert.equal(api.isEnvironmentLogicalEvidenceReferenceV1(reference), false, 'Azure reference guard stays narrow');
  const bucket = 'arn:aws:s3:::MyCaseSensitiveBucket';
  assert.equal(parseResource(resource(scope, 'AWS::S3::Bucket', bucket)).resourceId, bucket);
  assert.equal(parseResource(resource(scope, 'AWS::EC2::SecurityGroup', 'sg-0123456789')).resourceId, 'sg-0123456789');
  assert.equal(parseResource(resource(scope, 'AWS::FutureService::NewResource', arn)).resourceType, 'AWS::FutureService::NewResource');
  for (const badArn of [
    arn.replace('000123456789', '123456789012'),
    `${arn}?token=secret`,
    `${arn}\u0000`,
    '../resource',
    'https://storage/account',
    `${arn}/../other`,
  ])
    assert.throws(() => resource(scope, resourceType, badArn), undefined, `${build}: unsafe/cross-account resource`);
  for (const malformed of [
    `${reference}=`,
    `${reference}/extra`,
    `${reference}?query=1`,
    reference.replace('/aws/', '/azure/'),
    rawResource([...tuple, 'extra']),
    rawResource(tuple.map((item, index) => (index === 2 ? 123456789 : item))),
    `spotto://resource/v1/aws/${encoded(JSON.stringify(tuple, null, 1))}`,
    `spotto://artifact/v1/aws-account-summary/${encoded('["aws-account", "company-1", "000123456789"]')}`,
  ])
    assert.equal(isEvidence(malformed), false, `${build}: rejects noncanonical reference`);
  assert.throws(() => artifact('subscription-summary', scope));
  assert.throws(() => resource(scope, 'microsoft.compute/virtualmachines', arn));
  assert.throws(() => artifact('aws-account-summary', { ...scope, companyId: '😀'.repeat(1200) }));

  const projection = {
    schemaVersion: 1,
    scope,
    sourceBinding,
    generatedAt: '2026-10-19T00:00:01.000Z',
    account: { safeLabel: 'Production AWS', portalRoute: route },
    sourceCoverage: {
      completedPortalPublication: complete,
      accountSummary: complete,
      resources: complete,
      recommendations: partial,
      commitments: { status: 'not-collected', reason: 'Not yet collected.' },
      reliability: partial,
      securityPosture: complete,
      health: complete,
      governance: partial,
      serviceRetirement: partial,
      dataProtection: complete,
      savingsLedger: complete,
      publicIpExposure: complete,
    },
    estateSummary: { resourceCount: 1, serviceFamilyCount: 1, locationCount: 1 },
    costSummary: {
      observedCost: { amount: '125.40', currencyCode: 'NZD', basis: 'billed', period: '2026-10', provenance: 'account-summary' },
      potentialSavings: {
        amount: '25.00',
        currencyCode: 'NZD',
        basis: 'amortized',
        period: 'monthly',
        provenance: 'recommendation',
        savingsAdditivity: 'scenario-non-additive',
      },
    },
    serviceFamilyRollups: list([
      {
        key: 'lambda',
        safeLabel: 'Lambda',
        resourceCount: 1,
        observedCost: { amount: '125.40', currencyCode: 'NZD', basis: 'billed', period: '2026-10', provenance: 'account-resources' },
        sourceReferences: [reference],
      },
    ]),
    estateCostRollups: list(),
    costDrivers: list(),
    pillars: Object.fromEntries(
      api.ENVIRONMENT_PILLARS_V1.map(pillar => [
        pillar,
        {
          pillar,
          coverage: partial,
          findingCount: 0,
          recommendationCount: 1,
          affectedResources: { basis: 'lower-bound', value: 1, reason: 'Incomplete provider evidence.' },
          portalRoute: route,
          sourceReferences: [summary],
        },
      ])
    ),
    findings: list(),
    recommendations: list([
      {
        recommendationId: 'rec-1',
        pillar: 'cost',
        safeLabel: 'Review function capacity',
        technicalName: 'Review Lambda capacity',
        affectedResourceTypes: [resourceType],
        portalRoute: route,
        resourceReferences: [reference],
        sourceReferences: [summary],
      },
    ]),
    changes: list(),
    warnings: list(),
    sourceReferences: [summary],
  };
  assert.equal(isProjection(projection), true, `${build}: complete AWS projection with honest partial coverage`);
  assert.equal(isProjection(JSON.parse(JSON.stringify(projection))), true, `${build}: publication receipt survives JSON round-trip`);
  const beforeCommit = clone(projection);
  beforeCommit.generatedAt = '2026-10-18T23:59:59.500Z';
  assert.equal(isProjection(beforeCommit), false, `${build}: memory cannot precede source completion`);
  const unboundSecurity = clone(projection);
  unboundSecurity.sourceBinding.artifacts = unboundSecurity.sourceBinding.artifacts.filter(artifact => artifact.name !== 'security-posture.json');
  assert.equal(isProjection(unboundSecurity), false, `${build}: available security requires a committed source receipt`);
  const apiOnly = clone(projection);
  apiOnly.sourceReferences = [artifact('aws-account-projection', scope)];
  assert.equal(isProjection(apiOnly), false, `${build}: API projection references are not compiler source evidence`);
  apiOnly.sourceReferences = projection.sourceReferences;
  apiOnly.pillars.cost.sourceReferences = [artifact('aws-account-projection', scope)];
  assert.equal(isProjection(apiOnly), false, `${build}: nested compiler references reject API-only evidence`);

  for (const provenance of ['account-summary', 'account-resources']) {
    const money = { ...projection.costSummary.observedCost, provenance };
    assert.equal(api.isEnvironmentAwsMoneyValueV1(money), true, `${build}: AWS money provenance`);
    assert.equal(api.isEnvironmentMoneyValueV1(money), false, `${build}: old Azure money guard stays narrow`);
  }
  for (const provenance of ['subscription-summary', 'subscription-resources']) {
    assert.equal(api.isEnvironmentAwsMoneyValueV1({ ...projection.costSummary.observedCost, provenance }), false);
  }
  assert.equal(api.isEnvironmentAwsMoneyValueV1(projection.costSummary.potentialSavings), true);
  assert.equal(api.isEnvironmentAwsMoneyValueV1({ ...projection.costSummary.potentialSavings, savingsAdditivity: 'assumed-additive' }), false);
  const reject = (label, change) => {
    const invalid = clone(projection);
    change(invalid);
    assert.equal(isProjection(invalid), false, `${build}: ${label}`);
  };
  const resourceRoute = `/company/company-1/resources/${encodeURIComponent(arn)}`;
  for (const portalRoute of [resourceRoute, `${resourceRoute}?subscriptions=${scope.accountId}`, `${route}?subscriptions=${scope.accountId}`]) {
    assert.equal(isProjection({ ...projection, account: { ...projection.account, portalRoute } }), true, `${build}: AWS scoped route`);
  }
  for (const portalRoute of [
    resourceRoute.replace('/company-1/', '/company-2/'),
    `${resourceRoute}?subscriptions=${foreignScope.accountId}`,
    `${route}?token=secret`,
    `//evil.example${resourceRoute}`,
    resourceRoute.replace('arn%3A', 'arn%253A'),
  ])
    reject('unsafe or foreign route', value => {
      value.account.portalRoute = portalRoute;
    });
  reject('unknown top-level field', value => {
    value.storagePath = 'aws-portal/path';
  });
  reject('Azure-only subscription', value => {
    value.subscription = value.account;
  });
  reject('Azure coverage authority', value => {
    value.sourceCoverage.completedViewSet = complete;
  });
  reject('unqualified partial coverage', value => {
    delete value.sourceCoverage.recommendations.reason;
  });
  reject('foreign binding scope', value => {
    value.sourceBinding.scope = foreignScope;
  });
  reject('foreign company scope', value => {
    value.sourceBinding.scope = { ...scope, companyId: 'company-2' };
  });
  reject('Azure money provenance', value => {
    value.costSummary.observedCost.provenance = 'subscription-summary';
  });
  reject('money loses currency', value => {
    delete value.costSummary.observedCost.currencyCode;
  });
  reject('money loses basis', value => {
    delete value.costSummary.observedCost.basis;
  });
  reject('money uses a JS amount', value => {
    value.costSummary.observedCost.amount = 125.4;
  });
  reject('recommendation type case mismatch', value => {
    value.recommendations.items[0].affectedResourceTypes = ['aws::lambda::function'];
  });
  reject('recommendation extra type', value => {
    value.recommendations.items[0].affectedResourceTypes.push('AWS::S3::Bucket');
  });
  reject('recommendation duplicate type', value => {
    value.recommendations.items[0].affectedResourceTypes.push(resourceType);
  });
  const twoTypeProjection = clone(projection);
  twoTypeProjection.recommendations.items[0].resourceReferences.push(resource(scope, 'AWS::S3::Bucket', bucket));
  twoTypeProjection.recommendations.items[0].affectedResourceTypes.push('AWS::S3::Bucket');
  assert.equal(isProjection(twoTypeProjection), true, `${build}: recommendation type catalogue matches admitted resources`);
  twoTypeProjection.recommendations.items[0].affectedResourceTypes.reverse();
  assert.equal(isProjection(twoTypeProjection), false, `${build}: recommendation type catalogue is sorted`);
  const foreign = artifact('aws-account-summary', foreignScope);
  const azure = api.buildEnvironmentLogicalArtifactReferenceV1(
    'subscription-summary',
    '["azure-subscription","tenant-1","company-1","subscription-1"]'
  );
  for (const evidence of [foreign, azure]) {
    reject('foreign root evidence', value => {
      value.sourceReferences = [evidence];
    });
    reject('foreign pillar evidence', value => {
      value.pillars.cost.sourceReferences = [evidence];
    });
    reject('foreign recommendation evidence', value => {
      value.recommendations.items[0].sourceReferences = [evidence];
    });
    reject('foreign continuation', value => {
      value.findings = { ...list(), totalCount: 1, truncated: true, continuationReference: evidence };
    });
  }
  const optionalSections = {
    commitments: { coverage: partial, purchaseOptions: list(), benefitCoverage: list(), sourceReferences: [summary] },
    budgets: { coverage: partial, budgets: list(), sourceReferences: [summary] },
    idleResources: { coverage: partial, recommendationCount: 0, resourceCount: 0, subjects: list(), sourceReferences: [summary] },
    publicIpExposure: { coverage: partial, totalCount: 0, exposedSubjects: list(), remediationOptions: list(), sourceReferences: [summary] },
    tagCoverage: {
      coverage: partial,
      resourceCount: 0,
      taggedResourceCount: 0,
      untaggedResourceCount: 0,
      distinctTagKeyCount: 0,
      topTagKeys: list(),
      sourceReferences: [summary],
    },
    changeSignals: { coverage: partial, windowDays: 7, changeCount: 0, topOperations: list(), sourceReferences: [summary] },
    healthEvents: { coverage: partial, totalCount: 0, activeCount: 0, resolvedCount: 0, activeEvents: list(), sourceReferences: [summary] },
    dataProtection: {
      coverage: partial,
      totalResourcesEvaluated: 0,
      protectedCount: 0,
      notProtectedCount: 0,
      unknownCount: 0,
      failedCount: 0,
      staleCount: 0,
      workloadCoverage: list(),
      findingCounts: list(),
      atRiskSubjects: list(),
      sourceReferences: [summary],
    },
    secureScore: { coverage: partial, value: '72.5', maximum: '100', sourceReferences: [summary] },
  };
  for (const [name, section] of Object.entries(optionalSections)) {
    assert.equal(isProjection({ ...projection, [name]: section }), true, `${build}: optional ${name}`);
    reject(`cross-scope optional ${name}`, value => {
      value[name] = { ...section, sourceReferences: [foreign] };
    });
  }
  reject('cross-scope nested resource', value => {
    value.commitments = {
      ...optionalSections.commitments,
      benefitCoverage: list([
        {
          key: 'benefit-1',
          safeLabel: 'Benefit',
          benefitLabels: [],
          resourceReference: resource(foreignScope, resourceType, arn.replace(scope.accountId, foreignScope.accountId)),
        },
      ]),
    };
  });
  reject('Azure secret-store section', value => {
    value.secretStoreCoverage = { coverage: partial, vaultCount: 0, inspectedVaultCount: 0, reasons: list(), sourceReferences: [] };
  });
  reject('projection byte cap', value => {
    value.warnings = list(
      Array.from({ length: 50 }, (_, i) => ({ code: `w-${i}`, safeLabel: '😀'.repeat(500), detail: '😀'.repeat(4000), sourceReferences: [] }))
    );
  });
  const dotCompany = clone(projection);
  dotCompany.scope.companyId = '..';
  dotCompany.sourceBinding.scope.companyId = '..';
  dotCompany.account.portalRoute = '/company/../dashboard';
  dotCompany.serviceFamilyRollups = list();
  dotCompany.recommendations = list();
  dotCompany.sourceReferences = [];
  for (const pillar of Object.values(dotCompany.pillars)) {
    pillar.portalRoute = '/company/../dashboard';
    pillar.sourceReferences = [];
  }
  assert.equal(isProjection(dotCompany), false, `${build}: company dot segments cannot escape scoped navigation`);
  reject('sparse findings cannot survive JSON round-trip', value => {
    value.findings = list(Array(1));
  });
  assert.equal(isProjection(Object.assign(Object.create({ inherited: true }), projection)), false);

  const pointer = {
    schemaVersion: 1,
    status: 'completed',
    environmentRunId: 'environment-run-1',
    scope,
    sourceBinding,
    treeDigestSha256: 'b'.repeat(64),
    fileCount: 8,
    generatedAt: projection.generatedAt,
  };
  assert.equal(isPointer(pointer), true, `${build}: same eight-document tree`);
  for (const patch of [
    { fileCount: 7 },
    { schemaVersion: 2 },
    { environmentRunId: sourceBinding.portalRunId },
    { scope: foreignScope },
    { treeDigestSha256: 'B'.repeat(64) },
    { treeDigestSha256: 'b'.repeat(64) + '\n' },
    { manifestPath: 'path' },
  ])
    assert.equal(isPointer({ ...pointer, ...patch }), false, `${build}: invalid pointer`);
  const descriptors = api.ENVIRONMENT_DOCUMENT_NAMES_V1.map(name => ({
    name,
    mediaType: name === 'projection.json' ? 'application/json' : 'text/markdown; charset=utf-8',
    byteCount: 100,
    contentSha256: 'a'.repeat(64),
    approximateTokenCount: 25,
  }));
  assert.equal(api.isEnvironmentDocumentDescriptorSetV1(descriptors), true);
  assert.equal(api.isEnvironmentDocumentDescriptorSetV1(descriptors.slice(1)), false);
  assert.equal(api.isEnvironmentDocumentDescriptorSetV1([...descriptors.slice(1), descriptors[1]]), false);
}
console.log('AWS environment contract checks passed for root/environment CJS and ESM exports.');
