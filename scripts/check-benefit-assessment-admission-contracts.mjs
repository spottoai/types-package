import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const packageRoot = process.argv[2];
const entries = packageRoot
  ? [
      require(resolve(packageRoot, 'dist/index.js')),
      await import(pathToFileURL(resolve(packageRoot, 'dist/esm/entries/root.js'))),
      require(resolve(packageRoot, 'dist/azure/recommendations.js')),
      await import(pathToFileURL(resolve(packageRoot, 'dist/esm/entries/recommendations.js'))),
    ]
  : [require('../dist/index.js'), await import(pathToFileURL(resolve('dist/esm/index.js')))];
for (const contract of entries) {
  assert.equal(typeof contract.evaluateAzureBenefitAssessmentDependencyV1, 'function', 'complete admission contract is exported');
  assert.equal(contract.isAzureBenefitAssessmentCoverageV1({ status: 'verified' }), true);
  for (const reason of ['authority-unavailable', 'admission-unverified', 'dependency-limit-exceeded'])
    assert.equal(contract.isAzureBenefitAssessmentCoverageV1({ status: 'pending', reason }), true);
  for (const coverage of [
    undefined,
    { status: 'pending' },
    { status: 'verified', reason: 'admission-unverified' },
    { status: 'pending', reason: 'foreign-owner' },
    { status: 'pending', reason: 'admission-unverified', owner: { companyId: 'foreign' } },
    { status: 'pending', reason: 'admission-unverified', decisionPath: '_engine/private.json' },
  ])
    assert.equal(contract.isAzureBenefitAssessmentCoverageV1(coverage), false);
  const reservation = '/providers/microsoft.capacity/reservationorders/order-1/reservations/item-1';
  const savings = '/providers/microsoft.billingbenefits/savingsplanorders/order-2/savingsplans/item-2';
  const owner = { companyId: 'Company-A', tenantId: 'tenant-1', subscriptionId: 'sub-1' };
  const authorityId = contract.deriveAzureBenefitAssessmentAuthorityIdV1('https://authorityau.blob.core.windows.net', 'azure-portal');
  const foreign = contract.deriveAzureBenefitAssessmentAuthorityIdV1('https://authorityeu.blob.core.windows.net', 'azure-portal');
  const registration = contract.deriveAzureBenefitAssessmentRegistrationAuthorityIdV1('https://accountsau.table.core.windows.net');
  const context = { owner, authorityId, ownerRegistrationAuthorityId: registration };
  const admission = { benefitId: reservation, authorityId, revision: 1 };
  const dependency = { kind: 'admitted', ...admission };
  const claim = { schemaVersion: 2, state: 'active', ...admission, owner, ownerRegistrationAuthorityId: registration };
  const read = { status: 'present', authorityId, benefitId: reservation, claim };
  const unclaimed = { kind: 'unclaimed-single', benefitId: reservation, authorityId };
  for (const benefitId of [reservation, savings]) {
    assert.equal(contract.canonicalAzureBenefitAssessmentBenefitIdV1(` ${benefitId.toUpperCase()}/// `), benefitId);
    assert.equal(contract.isCanonicalAzureBenefitAssessmentBenefitIdV1(benefitId.toUpperCase()), false);
    assert.equal(contract.isCanonicalAzureBenefitAssessmentBenefitIdV1(benefitId + '/'), false);
    assert.equal(
      contract.buildAzureBenefitAssessmentOwnerKeyV1(benefitId),
      `_engine/benefit-assessment-owners/v1/${createHash('sha256').update(benefitId).digest('hex')}.json`
    );
  }
  for (const benefitId of [
    reservation + '?x',
    reservation + '#x',
    reservation + '%2f',
    reservation.replace('item-1', '../item'),
    reservation.replace('reservations', 'savingsplans'),
  ])
    assert.equal(contract.canonicalAzureBenefitAssessmentBenefitIdV1(benefitId), undefined);
  assert.notEqual(authorityId, foreign);
  assert.notEqual(authorityId, contract.deriveAzureBenefitAssessmentAuthorityIdV1('https://authorityau.blob.core.windows.net', 'other-container'));
  assert.equal(authorityId, contract.deriveAzureBenefitAssessmentAuthorityIdV1(' HTTPS://AUTHORITYAU.BLOB.CORE.WINDOWS.NET:443/ ', 'azure-portal'));
  for (const origin of ['same-label', 'https://host/private', 'https://user:secret@host', 'https://host?sig=secret', 'http://host', 'https://host#x'])
    assert.throws(() => contract.deriveAzureBenefitAssessmentAuthorityIdV1(origin, 'azure-portal'));
  assert.equal(contract.isAzureBenefitAssessmentAdmissionV1(admission), true);
  for (const revision of [0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(contract.isAzureBenefitAssessmentAdmissionV1({ ...admission, revision }), false);
  assert.equal(contract.isAzureBenefitAssessmentAdmissionV1({ ...admission, revision: Number.MAX_SAFE_INTEGER }), true);
  assert.equal(contract.nextAzureBenefitAssessmentRevisionV1(1), 2);
  assert.equal(contract.nextAzureBenefitAssessmentRevisionV1(Number.MAX_SAFE_INTEGER - 1), Number.MAX_SAFE_INTEGER);
  assert.throws(() => contract.nextAzureBenefitAssessmentRevisionV1(Number.MAX_SAFE_INTEGER));
  assert.deepEqual(
    contract.canonicalAzureBenefitAssessmentOwnerV1({ companyId: ' Company-A ', tenantId: ' TENANT-1 ', subscriptionId: ' SUB-1 ' }),
    owner
  );
  for (const badOwner of [
    { ...owner, companyId: 'Company-A ' },
    { ...owner, tenantId: 'TENANT-1' },
    { ...owner, subscriptionId: '../sub' },
    { ...owner, companyId: '' },
  ])
    assert.equal(contract.isAzureBenefitAssessmentOwnerV1(badOwner), false);
  assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, read), 'admitted');
  assert.equal(
    contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, { ...context, owner: { ...owner, companyId: 'company-a' } }, read),
    'pending'
  );
  assert.equal(
    contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, { ...context, owner: { ...owner, subscriptionId: 'sub-2' } }, read),
    'pending'
  );
  assert.equal(
    contract.evaluateAzureBenefitAssessmentDependencyV1(
      dependency,
      {
        ...context,
        ownerRegistrationAuthorityId: contract.deriveAzureBenefitAssessmentRegistrationAuthorityIdV1('https://accountseu.table.core.windows.net'),
      },
      read
    ),
    'pending'
  );
  assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, { ...read, claim: { ...claim, revision: 3 } }), 'pending');
  assert.equal(
    contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, {
      ...read,
      authorityId: foreign,
      claim: { ...claim, authorityId: foreign },
    }),
    'pending'
  );
  assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, { ...read, benefitId: savings }), 'pending');
  for (const status of ['absent', 'unavailable'])
    assert.equal(
      contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, { status, authorityId, benefitId: reservation }),
      'pending'
    );
  assert.equal(
    contract.evaluateAzureBenefitAssessmentDependencyV1(unclaimed, context, { status: 'absent', authorityId, benefitId: reservation }),
    'unclaimed-single'
  );
  // Later enrollment and Shared -> Single retain one native identity: no scope label bypass.
  assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(unclaimed, context, read), 'pending');
  assert.equal(
    contract.evaluateAzureBenefitAssessmentDependencyV1(unclaimed, context, { status: 'unavailable', authorityId, benefitId: reservation }),
    'pending'
  );
  assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(unclaimed, context, undefined), 'pending');
  const retirement = { operationId: 'operation-1', decisionPath: '_engine/benefit-assessment-retirements/v1/operation-1.json', precedingRevision: 1 };
  const retired = {
    schemaVersion: 2,
    state: 'retired',
    authorityId,
    benefitId: reservation,
    revision: 2,
    lastOwner: owner,
    ownerRegistrationAuthorityId: registration,
    retirement,
  };
  assert.equal(contract.isAzureBenefitAssessmentAuthorityV2(retired), true);
  assert.equal(contract.isAzureBenefitAssessmentAuthorityV2({ ...claim, revision: 3, retirement }), true);
  for (const corrupt of [
    { ...claim, schemaVersion: 1 },
    { ...claim, state: 'unknown' },
    { ...claim, lastOwner: owner },
    { ...claim, ownerRegistrationAuthorityId: undefined },
    { ...retired, owner },
    { ...retired, retirement: { ...retirement, precedingRevision: 2 } },
  ]) {
    assert.equal(contract.isAzureBenefitAssessmentAuthorityV2(corrupt), false);
    assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, { ...read, claim: corrupt }), 'pending');
  }
  assert.equal(contract.evaluateAzureBenefitAssessmentDependencyV1(dependency, context, { ...read, claim: retired }), 'pending');
  const empty = { schemaVersion: 1, subjects: [] };
  assert.equal(contract.isAzureBenefitAssessmentDependenciesV1(empty), true);
  assert.equal(contract.isAzureBenefitAssessmentDependenciesV1(undefined), false);
  const second = { kind: 'unclaimed-single', benefitId: savings, authorityId };
  const complete = contract.createAzureBenefitAssessmentDependenciesV1([dependency, second, dependency]);
  assert.equal(complete.subjects.length, 2);
  assert.equal(contract.isAzureBenefitAssessmentDependenciesV1(complete), true);
  assert.equal(contract.isAzureBenefitAssessmentDependenciesV1({ ...complete, subjects: [...complete.subjects].reverse() }), false);
  for (const subjects of [
    [dependency, dependency],
    [dependency, unclaimed],
    [dependency, { ...dependency, revision: 2 }],
    Array(4097).fill(dependency),
  ]) {
    assert.equal(contract.isAzureBenefitAssessmentDependenciesV1({ schemaVersion: 1, subjects }), false);
    if (subjects.length !== 2 || JSON.stringify(subjects[0]) !== JSON.stringify(subjects[1]))
      assert.throws(() => contract.createAzureBenefitAssessmentDependenciesV1(subjects));
  }
  assert.equal(contract.isAzureBenefitAssessmentDependenciesV1({ ...empty, admissions: [] }), false);
  assert.equal(contract.isAzureBenefitAssessmentDependencyV1({ ...unclaimed, revision: 1 }), false);
  const scoped = contract.createScopedAzureBenefitAssessmentDependenciesV1([{ ...dependency, owner }]);
  assert.equal(contract.isScopedAzureBenefitAssessmentDependenciesV1(scoped), true);
  assert.equal(contract.isScopedAzureBenefitAssessmentDependenciesV1({ schemaVersion: 1, subjects: [dependency] }), false);
  const multipleOwners = contract.createScopedAzureBenefitAssessmentDependenciesV1([
    { ...unclaimed, owner },
    { ...unclaimed, owner: { ...owner, companyId: 'Company-B' } },
  ]);
  assert.equal(multipleOwners.subjects.length, 2);
  assert.equal(contract.isScopedAzureBenefitAssessmentDependenciesV1(multipleOwners), true);
  assert.throws(() =>
    contract.createScopedAzureBenefitAssessmentDependenciesV1([
      { ...dependency, owner },
      { ...unclaimed, owner },
    ])
  );
  assert.equal(contract.evaluateScopedAzureBenefitAssessmentDependencyV1({ ...dependency, owner }, context, read), 'admitted');
  assert.equal(
    contract.evaluateScopedAzureBenefitAssessmentDependencyV1({ ...dependency, owner: { ...owner, companyId: 'Company-B' } }, context, read),
    'pending'
  );
  const large = Array.from({ length: 4096 }, (_, i) => ({ ...dependency, benefitId: reservation.replace('item-1', `item-${i}-${'x'.repeat(700)}`) }));
  assert.throws(() => contract.createAzureBenefitAssessmentDependenciesV1(large));
}
console.log('Benefit assessment admission contract vectors passed for CJS and ESM.');
