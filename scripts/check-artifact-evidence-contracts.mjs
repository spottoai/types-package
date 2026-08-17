import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

import {
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  BILLING_ARTIFACT_OBJECT_LIMITS_V1,
  buildBillingAnalyzerInputObservationPointerPath,
  canonicalizeBillingAnalyzerInputManifestV2ForDigest,
  canonicalizeBillingAnalysisPromotionObservationV1ForDigest,
  canonicalizeBillingAnalyzerOutputManifestV2ForDigest,
  canonicalizeBillingArtifactJson,
  canonicalizeBillingOutputBindingV1,
  compareArtifactRevisionVector,
  isArtifactOwnershipBinding,
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalysisPromotionObservationV1,
  isBillingAnalyzerInputObservationPointerV1,
  isBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
  isEnforceableArtifactOwnershipBinding,
  projectBillingOutputBindingV1FromManifest,
  projectBillingOutputBindingV1FromMetadata,
} from '../dist/index.js';

const corpusBytes = await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url));
const contractCorpus = JSON.parse(corpusBytes.toString('utf8'));
const corpusDigest = createHash('sha256').update(corpusBytes).digest('hex');
const EXPECTED_CORPUS_SHA256 = '508cb1bfb27ec89e1b99fbada05e91bffe8d4c84174492760b647fd7311d5f5a';
const EXPECTED_CORPUS_CASE_COUNT = 351;
const EXPECTED_CORPUS_MUTATION_COUNT = 436;
const EXPECTED_OBSERVATION_DIGEST_VECTOR_COUNT = 3;
const REQUIRED_OBSERVATION_DIGEST_VECTOR_NAMES = [
  'observe promotion binding',
  'equal revision and same output digest',
  'equal revision and different output digest',
];
const REQUIRED_DIGEST_RELATION_CASE_NAMES = [
  'promotion observation without an ownership epoch rejects a digest relation',
  'promotion observation keeps legacy equal idempotency without a digest relation',
  'promotion observation accepts equal output digests as idempotent',
  'promotion observation quarantines equal revisions with different output digests',
  'promotion observation rejects same output digests projected to quarantine',
  'promotion observation rejects different output digests projected as idempotent',
  'promotion observation rejects digest relation on a newer revision',
  'promotion observation rejects digest relation on an incomparable revision',
  'promotion observation rejects quarantine without a different digest relation',
  'promotion observation rejects an unknown output digest relation',
];
const REQUIRED_V7_CASE_NAMES = [
  'diagnostic discovery path accepts exact latest-enqueued location',
  'diagnostic discovery path rejects traversal subscription segment',
  'input manifest accepts exact stored object byte limit',
  'input manifest rejects stored object byte limit plus one',
  'output manifest accepts exact metadata stored byte limit',
  'output manifest rejects metadata stored byte limit plus one',
  'output manifest accepts exact plot stored byte limit',
  'output manifest rejects plot stored byte limit plus one',
  'legacy fallback response accepts explicit legacy transition',
  'legacy fallback response rejects V2 spread leakage',
  'verified read response accepts current evidence',
  'verified read response rejects partial metadata',
  'legacy business payload rejects V2 response state leakage',
  'V2 metadata rejects legacy response source leakage',
  'observe input pointer rejects nested __proto__ key',
  'input manifest rejects nested prototype key',
  'output manifest rejects nested constructor key',
];

assert.equal(contractCorpus.corpusVersion, 7, 'portable corpus version must match the downstream parity contract');
assert.equal(corpusDigest, EXPECTED_CORPUS_SHA256, 'portable corpus exact bytes must remain pinned');
assert.equal(contractCorpus.cases.length, EXPECTED_CORPUS_CASE_COUNT, 'portable corpus case count must remain pinned');
assert.equal(
  contractCorpus.observationDigestVectors.length,
  EXPECTED_OBSERVATION_DIGEST_VECTOR_COUNT,
  'portable observation digest vector count must remain pinned'
);
const corpusCaseNames = new Set(contractCorpus.cases.map(corpusCase => corpusCase.name));
assert.equal(corpusCaseNames.size, contractCorpus.cases.length, 'portable corpus case names must be unique');
for (const requiredCaseName of REQUIRED_DIGEST_RELATION_CASE_NAMES) {
  assert.ok(corpusCaseNames.has(requiredCaseName), `required digest-relation corpus case is missing: ${requiredCaseName}`);
}
for (const requiredCaseName of REQUIRED_V7_CASE_NAMES) {
  assert.ok(corpusCaseNames.has(requiredCaseName), `required v7 corpus case is missing: ${requiredCaseName}`);
}
assert.deepEqual(contractCorpus.objectLimitsV1, BILLING_ARTIFACT_OBJECT_LIMITS_V1, 'portable object limits must exactly match the root V1 export');
assert.equal(
  contractCorpus.diagnosticDiscoveryV1.relativeSuffix,
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  'portable diagnostic discovery suffix must exactly match the root export'
);
assert.equal(
  buildBillingAnalyzerInputObservationPointerPath(contractCorpus.diagnosticDiscoveryV1.subscriptionId),
  contractCorpus.diagnosticDiscoveryV1.absolutePath,
  'portable diagnostic discovery path must match the safe root builder'
);
assert.equal(
  isBillingAnalyzerInputObservationPointerPath(contractCorpus.diagnosticDiscoveryV1.absolutePath),
  true,
  'portable diagnostic discovery path must pass the root validator'
);
for (const authorityNegativeCaseName of contractCorpus.diagnosticDiscoveryV1.authorityNegativeCaseNames) {
  assert.ok(corpusCaseNames.has(authorityNegativeCaseName), `diagnostic authority-negative case is missing: ${authorityNegativeCaseName}`);
}
const observationDigestVectorNames = new Set(contractCorpus.observationDigestVectors.map(vector => vector.name));
assert.equal(
  observationDigestVectorNames.size,
  contractCorpus.observationDigestVectors.length,
  'portable observation digest vector names must be unique'
);
for (const requiredVectorName of REQUIRED_OBSERVATION_DIGEST_VECTOR_NAMES) {
  assert.ok(observationDigestVectorNames.has(requiredVectorName), `required observation digest vector is missing: ${requiredVectorName}`);
}

const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNonEmptyString = value => typeof value === 'string' && value.length > 0;
const isArrayIndex = segment => /^(0|[1-9]\d*)$/.test(segment);
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const resolveMutationParent = (document, path) => {
  const segments = path.split('.');
  assert.ok(segments.length > 0 && segments.every(segment => segment.length > 0), `invalid mutation path: ${path}`);

  let target = document;
  for (const [index, segment] of segments.slice(0, -1).entries()) {
    if (Array.isArray(target)) {
      assert.ok(isArrayIndex(segment), `mutation path requires an array index: ${path}`);
      assert.ok(Number(segment) < target.length && hasOwn(target, segment), `mutation array index does not exist: ${path}`);
    } else {
      assert.ok(isRecord(target), `mutation path requires an object parent: ${path}`);
      assert.ok(!isArrayIndex(segment), `mutation path requires an object property: ${path}`);
      assert.ok(hasOwn(target, segment), `mutation parent does not exist: ${path}`);
    }

    target = target[segment];
    const nextSegment = segments[index + 1];
    assert.ok(isArrayIndex(nextSegment) ? Array.isArray(target) : isRecord(target), `mutation parent has the wrong container shape: ${path}`);
  }

  const key = segments.at(-1);
  if (Array.isArray(target)) {
    assert.ok(isArrayIndex(key), `mutation target requires an array index: ${path}`);
    assert.ok(Number(key) <= target.length, `mutation array target is out of range: ${path}`);
  } else {
    assert.ok(isRecord(target), `mutation target requires an object parent: ${path}`);
    assert.ok(!isArrayIndex(key), `mutation target requires an object property: ${path}`);
  }
  return { parent: target, key };
};

const applyMutation = (document, mutation) => {
  assert.ok(isRecord(mutation) && isNonEmptyString(mutation.path), 'every corpus mutation requires a path');
  const hasValue = Object.prototype.hasOwnProperty.call(mutation, 'value');
  const deletesValue = mutation.delete === true;
  assert.notEqual(hasValue, deletesValue, `mutation must set or delete exactly one value: ${mutation.path}`);

  const { parent, key } = resolveMutationParent(document, mutation.path);
  if (deletesValue) {
    assert.ok(hasOwn(parent, key), `mutation delete target does not exist: ${mutation.path}`);
    if (Array.isArray(parent)) parent.splice(Number(key), 1);
    else delete parent[key];
    return;
  }
  parent[key] = structuredClone(mutation.value);
};

const materializeCorpusCase = corpusCase => {
  const sourceFixture = contractCorpus.fixtures[corpusCase.fixture];
  assert.notEqual(sourceFixture, undefined, `unknown corpus fixture: ${corpusCase.fixture}`);
  const fixtureBefore = structuredClone(sourceFixture);
  const document = structuredClone(sourceFixture);
  for (const mutation of corpusCase.mutations) applyMutation(document, mutation);
  assert.deepEqual(sourceFixture, fixtureBefore, `corpus fixture was mutated: ${corpusCase.fixture}`);
  return { base: fixtureBefore, document };
};

const mutationFailureCases = [
  ['typoed intermediate parent', { path: 'dependenciez.0.name', value: 'billing-history' }],
  ['missing delete target', { path: 'dependencies.0.missingField', delete: true }],
  ['out-of-range array index', { path: 'dependencies.99.name', value: 'billing-history' }],
];
const mutationFailureResults = mutationFailureCases.map(([, mutation]) => {
  try {
    applyMutation(structuredClone(contractCorpus.fixtures.currentPopulatedDecision), mutation);
    return false;
  } catch {
    return true;
  }
});
assert.deepEqual(
  mutationFailureResults,
  mutationFailureCases.map(() => true),
  'mutation materialization must fail fast for malformed paths'
);
assert.equal(
  compareArtifactRevisionVector(
    { ownershipEpochRevision: 3, sourceRevision: 0, policyRevision: 7 },
    { ownershipEpochRevision: 3, sourceRevision: 1, policyRevision: 7 }
  ),
  'older',
  'the comparator compares supplied vectors; callers must validate positive revisions before comparison'
);

const satisfiesPromotionPrecondition = (current, candidate) => {
  const comparison = compareArtifactRevisionVector(candidate.revision, current.revision);
  if (comparison === 'newer' || comparison === 'newer-ownership') return true;
  return (
    comparison === 'equal' &&
    typeof current.manifestDigest === 'string' &&
    typeof candidate.manifestDigest === 'string' &&
    candidate.manifestDigest === current.manifestDigest
  );
};

const corpusValidators = {
  isArtifactPublicationDecision,
  isBillingAnalysisCurrentPointerV1,
  isBillingAnalysisPromotionObservationV1,
  isBillingAnalyzerInputCurrentPointerV1,
  isBillingAnalyzerInputObservationPointerV1,
  isBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerOutputManifestV2,
  isBillingAnalyzerRequestV2,
  isBillingCostAnalysisBusinessPayloadV1,
  isBillingCostAnalysisLegacyFallbackResponse,
  isBillingCostAnalysisMetadataV2,
  isBillingCostAnalysisReadResponse,
  isBillingCostAnalysisVerifiedReadResponse,
};

const expectedCorpusValidatorNames = new Set([
  'artifactPromotionPrecondition',
  'billingCostAnalysisMetadataCompatibility',
  'isArtifactPublicationDecision',
  'isBillingAnalysisCurrentPointerV1',
  'isBillingAnalysisPromotionObservationV1',
  'isBillingAnalyzerInputCurrentPointerV1',
  'isBillingAnalyzerInputObservationPointerV1',
  'isBillingAnalyzerInputObservationPointerPath',
  'isBillingAnalyzerInputManifestV2',
  'isBillingAnalyzerOutputManifestV2',
  'isBillingAnalyzerRequestV2',
  'isBillingCostAnalysisBusinessPayloadV1',
  'isBillingCostAnalysisLegacyFallbackResponse',
  'isBillingCostAnalysisMetadataV2',
  'isBillingCostAnalysisReadResponse',
  'isBillingCostAnalysisVerifiedReadResponse',
]);
const requiredPortableBillingValidatorNames = [
  'isBillingAnalysisCurrentPointerV1',
  'isBillingAnalysisPromotionObservationV1',
  'isBillingAnalyzerInputCurrentPointerV1',
  'isBillingAnalyzerInputObservationPointerV1',
  'isBillingAnalyzerInputObservationPointerPath',
  'isBillingAnalyzerInputManifestV2',
  'isBillingAnalyzerOutputManifestV2',
  'isBillingAnalyzerRequestV2',
  'isBillingCostAnalysisBusinessPayloadV1',
  'isBillingCostAnalysisLegacyFallbackResponse',
  'isBillingCostAnalysisMetadataV2',
  'isBillingCostAnalysisReadResponse',
  'isBillingCostAnalysisVerifiedReadResponse',
];
const corpusValidatorNames = new Set(contractCorpus.cases.map(corpusCase => corpusCase.validator));
assert.deepEqual(corpusValidatorNames, expectedCorpusValidatorNames, 'portable corpus validator-name set must remain exact');
for (const validatorName of requiredPortableBillingValidatorNames) {
  const portableCases = contractCorpus.cases.filter(corpusCase => corpusCase.validator === validatorName);
  assert.ok(
    portableCases.some(corpusCase => corpusCase.valid === true),
    `${validatorName} requires a portable positive case`
  );
  assert.ok(
    portableCases.some(corpusCase => corpusCase.valid === false),
    `${validatorName} requires a portable negative case`
  );
}

for (const hybridCase of contractCorpus.hybridAuthorityCases) {
  const observation = contractCorpus.fixtures[hybridCase.observationFixture];
  const authority = contractCorpus.fixtures[hybridCase.authorityFixture];
  assert.notEqual(observation, undefined, `${hybridCase.name}: observation fixture exists`);
  assert.notEqual(authority, undefined, `${hybridCase.name}: authority fixture exists`);
  const hybrid = { ...structuredClone(observation), ...structuredClone(authority) };
  const validator = corpusValidators[hybridCase.validator];
  assert.equal(typeof validator, 'function', `${hybridCase.name}: validator exists`);
  assert.equal(validator(hybrid), false, hybridCase.name);
}

for (const discriminantCase of contractCorpus.diagnosticDiscriminantCases) {
  const authority = contractCorpus.fixtures[discriminantCase.authorityFixture];
  assert.notEqual(authority, undefined, `${discriminantCase.name}: authority fixture exists`);
  const candidate = { ...structuredClone(authority), ...structuredClone(discriminantCase.fields) };
  const validator = corpusValidators[discriminantCase.validator];
  assert.equal(typeof validator, 'function', `${discriminantCase.name}: validator exists`);
  assert.equal(validator(candidate), false, discriminantCase.name);
}

let mutationCount = 0;
for (const corpusCase of contractCorpus.cases) {
  assert.ok(Array.isArray(corpusCase.mutations), `corpus case has no mutation list: ${corpusCase.name}`);
  mutationCount += corpusCase.mutations.length;
  const { base, document } = materializeCorpusCase(corpusCase);

  if (corpusCase.validator === 'billingCostAnalysisMetadataCompatibility') {
    assert.equal(isBillingCostAnalysisMetadataV2(document), false, `${corpusCase.name}: legacy V1 must not be treated as V2`);
    assert.equal(isBillingCostAnalysisBusinessPayloadV1(document), corpusCase.valid, `${corpusCase.name}: strict V1 business compatibility`);
    continue;
  }

  if (corpusCase.validator === 'artifactPromotionPrecondition') {
    const comparison = compareArtifactRevisionVector(document.revision, base.revision);
    assert.equal(comparison, corpusCase.expectedRevisionComparison, `${corpusCase.name}: revision comparison`);
    assert.equal(satisfiesPromotionPrecondition(base, structuredClone(base)), true, `${corpusCase.name}: equal digest is idempotent`);
    assert.equal(satisfiesPromotionPrecondition(base, document), corpusCase.valid, corpusCase.name);
    continue;
  }

  const validator = corpusValidators[corpusCase.validator];
  assert.equal(typeof validator, 'function', `unknown corpus validator: ${corpusCase.validator}`);
  assert.equal(validator(document), corpusCase.valid, corpusCase.name);
}
assert.equal(mutationCount, EXPECTED_CORPUS_MUTATION_COUNT, 'portable corpus mutation count must remain pinned');

const buildDeepControlData = depth => {
  let value = { label: 'safe-leaf' };
  for (let level = 0; level < depth; level += 1) value = { next: value };
  return value;
};
const deepLegacyBusinessPayload = {
  ...structuredClone(contractCorpus.fixtures.legacyBillingCostAnalysisMetadataV1),
  future: buildDeepControlData(contractCorpus.controlDataTraversalV1.deepNestingDepth),
};
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1(deepLegacyBusinessPayload),
  true,
  'control-data scan accepts harmless deep nesting without overflowing the call stack'
);
const cyclicControlData = { label: 'safe-cycle' };
cyclicControlData.self = cyclicControlData;
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1({
    ...structuredClone(contractCorpus.fixtures.legacyBillingCostAnalysisMetadataV1),
    future: cyclicControlData,
  }),
  false,
  'control-data scan rejects repeated references without overflowing the call stack'
);
assert.equal(
  isBillingCostAnalysisBusinessPayloadV1({
    ...structuredClone(contractCorpus.fixtures.legacyBillingCostAnalysisMetadataV1),
    future: Array.from({ length: contractCorpus.controlDataTraversalV1.maxVisitedNodes + 1 }, () => ({})),
  }),
  false,
  'control-data scan rejects documents above the deterministic node limit'
);

const deepAnalyzerRequest = structuredClone(contractCorpus.fixtures.billingAnalyzerRequestV2);
deepAnalyzerRequest.displayMetadata = buildDeepControlData(contractCorpus.controlDataTraversalV1.deepNestingDepth);
assert.equal(isBillingAnalyzerRequestV2(deepAnalyzerRequest), true, 'display metadata accepts harmless deep JSON without overflowing the call stack');
const prototypeControlDocuments = [
  ['input observation', isBillingAnalyzerInputObservationPointerV1, contractCorpus.fixtures.billingAnalyzerInputObservationPointerV1],
  ['input manifest', isBillingAnalyzerInputManifestV2, contractCorpus.fixtures.billingAnalyzerInputManifestV2],
  ['analyzer request', isBillingAnalyzerRequestV2, contractCorpus.fixtures.billingAnalyzerRequestV2],
  ['output manifest', isBillingAnalyzerOutputManifestV2, contractCorpus.fixtures.billingAnalyzerOutputManifestV2],
  ['V1 business payload', isBillingCostAnalysisBusinessPayloadV1, contractCorpus.fixtures.legacyBillingCostAnalysisMetadataV1],
  ['V2 metadata', isBillingCostAnalysisMetadataV2, contractCorpus.fixtures.billingCostAnalysisMetadataV2],
];
for (const [documentName, validator, document] of prototypeControlDocuments) {
  for (const forbiddenKey of contractCorpus.controlDataTraversalV1.forbiddenPrototypeKeys) {
    const future = JSON.parse(`{"${forbiddenKey}":{"polluted":true}}`);
    assert.equal(validator({ ...structuredClone(document), future }), false, `${documentName} rejects ${forbiddenKey} control data`);
  }
}
const sharedSectionPaths = ['https://sections.example.invalid/cost-analysis'];
const metadataWithSharedArray = structuredClone(contractCorpus.fixtures.billingCostAnalysisMetadataV2);
metadataWithSharedArray.artifactEvidence.claims[0].sectionPaths = sharedSectionPaths;
assert.equal(
  isBillingCostAnalysisMetadataV2({ future: sharedSectionPaths, ...metadataWithSharedArray }),
  false,
  'a shared array scanned in a schema-owned text field is rescanned under a stricter unknown-field policy'
);

const comparisonOutcomes = new Set();
for (const comparisonCase of contractCorpus.revisionComparisons) {
  const actual = compareArtifactRevisionVector(comparisonCase.left, comparisonCase.right);
  comparisonOutcomes.add(actual);
  assert.equal(actual, comparisonCase.expected, comparisonCase.name);
}
assert.deepEqual(
  comparisonOutcomes,
  new Set(['unenforceable', 'newer-ownership', 'older-ownership', 'newer', 'older', 'incomparable', 'equal']),
  'canonical corpus must execute every revision-comparison branch'
);

const sha256 = value => createHash('sha256').update(value).digest('hex');
const utf8Hex = value => Buffer.from(value, 'utf8').toString('hex');
const digestVectorResults = new Map();
assert.ok(
  contractCorpus.digestVectors.some(vector => vector.coverageClass === 'partial'),
  'portable digest vectors must include a machine-readable partial evidence chain'
);
for (const vector of contractCorpus.digestVectors) {
  const manifest = structuredClone(vector.outputManifest);
  const metadata = structuredClone(vector.metadata);
  const pointer = structuredClone(vector.pointer);
  const manifestProjection = projectBillingOutputBindingV1FromManifest(manifest);
  const metadataProjection = projectBillingOutputBindingV1FromMetadata(metadata);
  const bindingCanonical = canonicalizeBillingOutputBindingV1(manifestProjection);
  const inputCanonical = canonicalizeBillingAnalyzerInputManifestV2ForDigest(vector.inputManifest);
  const metadataCanonical = canonicalizeBillingArtifactJson(metadata);
  const outputCanonical = canonicalizeBillingAnalyzerOutputManifestV2ForDigest(manifest);
  const result = {
    bindingProjection: manifestProjection,
    bindingCanonical,
    bindingCanonicalUtf8Hex: utf8Hex(bindingCanonical),
    outputBindingDigest: sha256(bindingCanonical),
    inputManifestCanonical: inputCanonical,
    inputManifestDigest: sha256(inputCanonical),
    metadataCanonical,
    metadataStoredByteDigest: sha256(metadataCanonical),
    outputManifestCanonical: outputCanonical,
    outputManifestDigest: sha256(outputCanonical),
    pointerBindingValid: pointer.outputManifestDigest === sha256(outputCanonical),
  };
  assert.deepEqual(metadataProjection, manifestProjection, `${vector.name}: manifest and metadata projection`);
  assert.deepEqual(result, vector.expected, `${vector.name}: exact portable digest vector`);
  assert.equal(manifest.outputBindingDigest, result.outputBindingDigest, `${vector.name}: manifest B`);
  assert.equal(metadata.outputBindingDigest, result.outputBindingDigest, `${vector.name}: metadata B`);
  assert.equal(vector.inputManifest.manifestDigest, result.inputManifestDigest, `${vector.name}: input manifest digest`);
  assert.equal(manifest.artifacts[0].sha256, result.metadataStoredByteDigest, `${vector.name}: exact metadata descriptor digest`);
  assert.equal(manifest.manifestDigest, result.outputManifestDigest, `${vector.name}: output manifest digest`);
  assert.equal(pointer.outputManifestDigest, result.outputManifestDigest, `${vector.name}: pointer D`);
  const expectedStructure = vector.structure ?? {
    inputManifestValid: true,
    outputManifestValid: true,
    metadataValid: true,
    pointerValid: true,
  };
  assert.equal(
    isBillingAnalyzerInputManifestV2(vector.inputManifest),
    expectedStructure.inputManifestValid,
    `${vector.name}: input manifest structure`
  );
  assert.equal(isBillingAnalyzerOutputManifestV2(manifest), expectedStructure.outputManifestValid, `${vector.name}: output manifest structure`);
  assert.equal(isBillingCostAnalysisMetadataV2(metadata), expectedStructure.metadataValid, `${vector.name}: metadata structure`);
  assert.equal(isBillingAnalysisCurrentPointerV1(pointer), expectedStructure.pointerValid, `${vector.name}: pointer structure`);
  digestVectorResults.set(vector.name, result);
}
const baselineDigestVector = digestVectorResults.get('current populated output');
assert.ok(baselineDigestVector, 'canonical current populated digest vector is required');

for (const vector of contractCorpus.observationDigestVectors) {
  const observation = structuredClone(vector.observation);
  const canonical = canonicalizeBillingAnalysisPromotionObservationV1ForDigest(observation);
  assert.equal(canonical, vector.expectedCanonical, `${vector.name}: canonical preimage`);
  assert.equal(sha256(canonical), vector.expectedDigest, `${vector.name}: canonical digest`);
  assert.equal(observation.observationDigest, vector.expectedDigest, `${vector.name}: stored digest binds the canonical preimage`);
  assert.equal(canonical.includes('"observationDigest"'), false, `${vector.name}: digest field excluded`);
  assert.equal(isBillingAnalysisPromotionObservationV1(observation), true, `${vector.name}: structurally valid`);

  const reordered = Object.fromEntries(Object.entries(observation).reverse());
  assert.equal(canonicalizeBillingAnalysisPromotionObservationV1ForDigest(reordered), canonical, `${vector.name}: top-level key order ignored`);

  const additive = structuredClone(observation);
  additive.future = { ignored: true };
  additive.ownership.future = { ignored: true };
  additive.evaluation.future = { ignored: true };
  assert.equal(canonicalizeBillingAnalysisPromotionObservationV1ForDigest(additive), canonical, `${vector.name}: additive fields ignored`);

  const additiveAccessor = structuredClone(observation);
  let additiveAccessorInvoked = false;
  Object.defineProperty(additiveAccessor, 'future', {
    enumerable: true,
    get: () => {
      additiveAccessorInvoked = true;
      return 'ignored';
    },
  });
  assert.equal(
    canonicalizeBillingAnalysisPromotionObservationV1ForDigest(additiveAccessor),
    canonical,
    `${vector.name}: additive accessors do not affect the exact-field projection`
  );
  assert.equal(additiveAccessorInvoked, false, `${vector.name}: additive accessor never invoked`);

  const changedDigest = structuredClone(observation);
  changedDigest.observationDigest = 'c'.repeat(64);
  assert.equal(canonicalizeBillingAnalysisPromotionObservationV1ForDigest(changedDigest), canonical, `${vector.name}: observation digest excluded`);

  if (observation.evaluation.outputDigestRelation !== undefined) {
    const changedRelation = structuredClone(observation);
    changedRelation.evaluation.outputDigestRelation = observation.evaluation.outputDigestRelation === 'same' ? 'different' : 'same';
    const changedRelationCanonical = canonicalizeBillingAnalysisPromotionObservationV1ForDigest(changedRelation);
    assert.notEqual(changedRelationCanonical, canonical, `${vector.name}: changed output digest relation changes the preimage`);
    assert.notEqual(
      sha256(changedRelationCanonical),
      changedRelation.observationDigest,
      `${vector.name}: changed output digest relation invalidates the stored digest`
    );
  }

  for (const mutation of contractCorpus.observationBindingMutationVectors) {
    const changed = structuredClone(observation);
    applyMutation(changed, mutation);
    if (JSON.stringify(changed) === JSON.stringify(observation)) continue;
    assert.notEqual(
      canonicalizeBillingAnalysisPromotionObservationV1ForDigest(changed),
      canonical,
      `${vector.name}: ${mutation.name} changes the preimage`
    );
  }

  const controlData = structuredClone(observation);
  controlData.correlationId = 'correlation\u0000unsafe';
  assert.throws(() => canonicalizeBillingAnalysisPromotionObservationV1ForDigest(controlData), `${vector.name}: declared control data rejected`);

  const accessor = structuredClone(observation);
  let accessorInvoked = false;
  Object.defineProperty(accessor, 'subscriptionId', {
    enumerable: true,
    get: () => {
      accessorInvoked = true;
      return 'unsafe';
    },
  });
  assert.throws(() => canonicalizeBillingAnalysisPromotionObservationV1ForDigest(accessor), `${vector.name}: accessor rejected`);
  assert.equal(accessorInvoked, false, `${vector.name}: accessor never invoked`);

  const nestedAccessor = structuredClone(observation);
  let nestedAccessorInvoked = false;
  Object.defineProperty(nestedAccessor.evaluation, 'comparison', {
    enumerable: true,
    get: () => {
      nestedAccessorInvoked = true;
      return 'unsafe';
    },
  });
  assert.throws(() => canonicalizeBillingAnalysisPromotionObservationV1ForDigest(nestedAccessor), `${vector.name}: nested accessor rejected`);
  assert.equal(nestedAccessorInvoked, false, `${vector.name}: nested accessor never invoked`);

  const customPrototype = Object.assign(Object.create({ future: true }), observation);
  assert.throws(() => canonicalizeBillingAnalysisPromotionObservationV1ForDigest(customPrototype), `${vector.name}: custom prototype rejected`);
}
const validatesIntegratedDigestChain = vector => {
  try {
    const manifestProjection = projectBillingOutputBindingV1FromManifest(vector.outputManifest);
    const metadataProjection = projectBillingOutputBindingV1FromMetadata(vector.metadata);
    const bindingDigest = sha256(canonicalizeBillingOutputBindingV1(manifestProjection));
    const metadataDigest = sha256(canonicalizeBillingArtifactJson(vector.metadata));
    const manifestDigest = sha256(canonicalizeBillingAnalyzerOutputManifestV2ForDigest(vector.outputManifest));
    const metadataDescriptor = vector.outputManifest.artifacts.find(artifact => artifact.name === 'metadata.json');
    return (
      isBillingAnalyzerOutputManifestV2(vector.outputManifest) &&
      isBillingCostAnalysisMetadataV2(vector.metadata) &&
      isBillingAnalysisCurrentPointerV1(vector.pointer) &&
      JSON.stringify(manifestProjection) === JSON.stringify(metadataProjection) &&
      vector.outputManifest.subscriptionId === vector.metadata.subscriptionId &&
      vector.outputManifest.generationId === vector.metadata.billingGenerationId &&
      vector.outputManifest.inputManifestDigest === vector.metadata.inputManifestDigest &&
      vector.outputManifest.outputBindingDigest === bindingDigest &&
      vector.metadata.outputBindingDigest === bindingDigest &&
      metadataDescriptor?.sha256 === metadataDigest &&
      vector.outputManifest.manifestDigest === manifestDigest &&
      vector.pointer.outputManifestDigest === manifestDigest
    );
  } catch {
    return false;
  }
};
const baselineIntegratedVector = structuredClone(contractCorpus.digestVectors[0]);
assert.equal(validatesIntegratedDigestChain(baselineIntegratedVector), true, 'baseline integrated digest chain is constructible');
for (const vector of contractCorpus.digestMismatchVectors) {
  const invalidIntegratedVector = structuredClone(baselineIntegratedVector);
  assert.ok(['metadata', 'outputManifest', 'pointer'].includes(vector.document), `${vector.name}: known integrated document`);
  applyMutation(invalidIntegratedVector[vector.document], vector.mutation);
  assert.equal(validatesIntegratedDigestChain(invalidIntegratedVector), false, vector.name);
}
for (const vector of contractCorpus.digestVectors) {
  if (vector.bindingExpectation === 'same-as-current') {
    assert.equal(vector.expected.outputBindingDigest, baselineDigestVector.outputBindingDigest, `${vector.name}: non-binding mutation preserves B`);
  } else if (vector.bindingExpectation === 'different-from-current') {
    assert.notEqual(vector.expected.outputBindingDigest, baselineDigestVector.outputBindingDigest, `${vector.name}: binding mutation changes B`);
  }
}
assert.notEqual(
  digestVectorResults.get('stale reader state preserves binding').metadataStoredByteDigest,
  baselineDigestVector.metadataStoredByteDigest,
  'reader-derived artifactState preserves B but changes exact metadata bytes'
);
assert.notEqual(
  digestVectorResults.get('chart payload preserves binding').metadataStoredByteDigest,
  baselineDigestVector.metadataStoredByteDigest,
  'chart payload preserves B but changes exact metadata bytes'
);
assert.notEqual(
  digestVectorResults.get('anomaly payload preserves binding').metadataStoredByteDigest,
  baselineDigestVector.metadataStoredByteDigest,
  'anomaly payload preserves B but changes exact metadata bytes'
);
assert.notEqual(
  digestVectorResults.get('descriptor mutation preserves binding and changes manifest digest').outputManifestDigest,
  baselineDigestVector.outputManifestDigest,
  'artifact descriptor mutation preserves B but changes manifest D'
);
assert.equal(
  digestVectorResults.get('object key order preserves canonical digests').metadataStoredByteDigest,
  baselineDigestVector.metadataStoredByteDigest,
  'canonical metadata digest is object-key-order invariant'
);
assert.equal(
  digestVectorResults.get('object key order preserves canonical digests').outputManifestDigest,
  baselineDigestVector.outputManifestDigest,
  'canonical manifest digest is object-key-order invariant'
);
for (const mutation of contractCorpus.bindingMutationVectors) {
  const binding = structuredClone(contractCorpus.bindingBase);
  applyMutation(binding, { path: mutation.path, value: mutation.value });
  assert.notEqual(
    sha256(canonicalizeBillingOutputBindingV1(binding)),
    baselineDigestVector.outputBindingDigest,
    `${mutation.name}: every projected field mutation changes B`
  );
}
const additiveBindingSource = structuredClone(contractCorpus.bindingBase);
additiveBindingSource.future = { ignored: true };
additiveBindingSource.ownership.future = { ignored: true };
additiveBindingSource.publicationDecision.future = { ignored: true };
additiveBindingSource.publicationDecision.dependencies[0].future = { ignored: true };
additiveBindingSource.publicationDecision.claims[0].future = { ignored: true };
const additiveProjectionManifest = {
  ...contractCorpus.digestVectors[0].outputManifest,
  ownership: additiveBindingSource.ownership,
  publicationDecision: additiveBindingSource.publicationDecision,
  future: additiveBindingSource.future,
};
assert.equal(
  sha256(canonicalizeBillingOutputBindingV1(projectBillingOutputBindingV1FromManifest(additiveProjectionManifest))),
  baselineDigestVector.outputBindingDigest,
  'binding v1 excludes additive unknown fields recursively'
);
const reversedClaimsManifest = structuredClone(contractCorpus.digestVectors[0].outputManifest);
reversedClaimsManifest.publicationDecision.claims[0].sectionPaths.reverse();
assert.notEqual(
  sha256(canonicalizeBillingOutputBindingV1(projectBillingOutputBindingV1FromManifest(reversedClaimsManifest))),
  baselineDigestVector.outputBindingDigest,
  'binding v1 preserves declared array order'
);
const numericBinding = structuredClone(contractCorpus.bindingBase);
numericBinding.revision.sourceRevision = Number.MAX_SAFE_INTEGER;
assert.doesNotThrow(() => canonicalizeBillingOutputBindingV1(numericBinding), 'canonical binding accepts maximum safe integer');
for (const rejected of [Number.MAX_SAFE_INTEGER + 1, Number.NaN, Number.POSITIVE_INFINITY, -0]) {
  const invalid = structuredClone(contractCorpus.bindingBase);
  invalid.revision.sourceRevision = rejected;
  assert.throws(() => canonicalizeBillingOutputBindingV1(invalid), 'canonical binding rejects unsafe or non-JSON numbers');
}
const sparseBinding = structuredClone(contractCorpus.bindingBase);
sparseBinding.publicationDecision.claims[0].sectionPaths = new Array(1);
assert.throws(() => canonicalizeBillingOutputBindingV1(sparseBinding), 'canonical binding rejects sparse arrays');
const arrayAccessorBinding = structuredClone(contractCorpus.bindingBase);
let arrayAccessorInvoked = false;
Object.defineProperty(arrayAccessorBinding.publicationDecision.claims[0].sectionPaths, '0', {
  enumerable: true,
  get: () => {
    arrayAccessorInvoked = true;
    return 'unsafe';
  },
});
assert.throws(() => canonicalizeBillingOutputBindingV1(arrayAccessorBinding), 'canonical binding rejects array accessors');
assert.equal(arrayAccessorInvoked, false, 'canonical binding never executes array accessors');
const cyclicArtifact = {};
cyclicArtifact.loop = cyclicArtifact;
assert.throws(() => canonicalizeBillingArtifactJson(cyclicArtifact), 'canonical JSON rejects cycles');
const accessorBinding = structuredClone(contractCorpus.bindingBase);
Object.defineProperty(accessorBinding, 'subscriptionId', { enumerable: true, get: () => 'unsafe' });
assert.throws(() => canonicalizeBillingOutputBindingV1(accessorBinding), 'canonical binding rejects accessors');
const toJsonBinding = Object.assign(Object.create({ toJSON: () => ({ replaced: true }) }), contractCorpus.bindingBase);
assert.throws(() => canonicalizeBillingOutputBindingV1(toJsonBinding), 'canonical binding rejects toJSON and custom prototypes');
assert.equal(contractCorpus.gzipDeterminism.mtime, 0, 'portable gzip output fixes mtime to zero');
assert.equal(contractCorpus.gzipDeterminism.hashesExactStoredBytes, true, 'gzip descriptors hash exact compressed bytes');

const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);
const digestC = 'c'.repeat(64);
const digestD = 'd'.repeat(64);
const subscriptionId = 'sub-123';
const generationId = 'billing-input-generation-42';

const ownership = {
  provider: 'azure',
  tenantId: 'tenant-1',
  companyId: 'company-1',
  cloudAccountId: 'cloud-account-1',
  accountId: subscriptionId,
  ownershipEpochRevision: 3,
};
const revision = { ownershipEpochRevision: 3, sourceRevision: 42, policyRevision: 7 };
const publicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    {
      name: 'billing-history',
      required: true,
      support: 'supported',
      applicability: 'applicable',
      attempt: 'succeeded',
      coverage: 'complete',
      emptyEvidence: 'populated',
      freshness: 'current',
      evidence: 'complete',
      publication: 'completed',
      generationId,
      digest: digestC,
      sourceRevision: 42,
      policyRevision: 7,
    },
  ],
  claims: [
    {
      claimId: 'cost-analysis',
      sectionPaths: ['chartData', 'anomalies'],
      requiredDependencies: ['billing-history'],
      evidence: 'complete',
      publication: 'completed',
      issues: [],
    },
  ],
  issues: [],
};
const portalPluginPublicationDecision = {
  processing: 'succeeded',
  evidence: 'complete',
  publication: 'completed',
  dependencies: [
    { ...publicationDecision.dependencies[0], name: 'portal', generationId: 'portal-run-42', digest: digestA },
    { ...publicationDecision.dependencies[0], name: 'plugin', generationId: 'plugin-run-42', digest: digestB },
  ],
  claims: [
    {
      ...publicationDecision.claims[0],
      claimId: 'coordinated-view-set',
      sectionPaths: ['portal', 'plugin'],
      requiredDependencies: ['portal', 'plugin'],
    },
  ],
  issues: [],
};
const partialBillingPublicationDecision = {
  processing: 'succeeded',
  evidence: 'partial',
  publication: 'partial',
  dependencies: [
    publicationDecision.dependencies[0],
    {
      name: 'exchange-rates',
      required: false,
      support: 'supported',
      applicability: 'applicable',
      attempt: 'failed',
      coverage: 'none',
      emptyEvidence: 'not-observed',
      freshness: 'unknown',
      evidence: 'insufficient',
      publication: 'suppressed',
      reasonCode: 'exchange-rates-unavailable',
    },
  ],
  claims: [
    {
      claimId: 'cost-analysis',
      sectionPaths: ['chartData', 'anomalies'],
      requiredDependencies: ['billing-history'],
      evidence: 'partial',
      publication: 'partial',
      issues: [{ code: 'exchange-rates-unavailable', blocking: false, dependency: 'exchange-rates' }],
    },
  ],
  issues: [{ code: 'exchange-rates-unavailable', blocking: false, dependency: 'exchange-rates' }],
};
const costAnalysisMetadata = {
  schemaVersion: 2,
  subscriptionId,
  billingGenerationId: generationId,
  ownership,
  revision,
  artifactState: 'current',
  artifactEvidence: publicationDecision,
  inputManifestDigest: digestC,
  outputBindingDigest: digestD,
  chartData: {
    schemaVersion: 1,
    source: 'aggregated',
    dataWindow: { startDate: 1754006400, endDate: 1756684800, pointCount: 0 },
    views: {},
    detectors: { threshold: 2, methods: [] },
  },
  anomalies: [],
  currencyCode: 'NZD',
  currencySymbol: '$',
};
const partialCostAnalysisMetadata = {
  ...costAnalysisMetadata,
  artifactState: 'partial',
  artifactEvidence: partialBillingPublicationDecision,
};

const completeEmptyPublicationDecision = {
  ...publicationDecision,
  dependencies: [
    {
      ...publicationDecision.dependencies[0],
      emptyEvidence: 'complete-empty',
      acceptedRowCount: 0,
      emptyProofRef: 'subscriptions/sub-123/history/billing/proofs/billing-input-generation-42-empty.json',
    },
  ],
};
const completeEmptyMetadata = {
  ...costAnalysisMetadata,
  artifactState: 'complete-empty',
  artifactEvidence: completeEmptyPublicationDecision,
};
const populatedDailyView = {
  aggregation: 'daily',
  startDate: 1754006400,
  endDate: 1756684800,
  averageDailyCost: 10,
  totalCost: 310,
  points: [],
};
const validAnomaly = {
  date: 1754006400,
  summary: 'A valid populated anomaly',
  confidence: 'high',
  notes: [],
  impact: {
    cost: 10,
    delta: 5,
    monthToDateCost: 20,
    baseline7Day: null,
    baseline30Day: null,
    percentChange: null,
    previousDayCost: null,
    previousDayDelta: null,
    monthToDateBaseline: null,
    monthToDateDelta: null,
    monthToDatePercentChange: null,
  },
  drivers: [],
};
const percentageBearingMetadata = {
  ...costAnalysisMetadata,
  chartData: {
    ...costAnalysisMetadata.chartData,
    detectors: {
      ...costAnalysisMetadata.chartData.detectors,
      methods: [{ name: 'seasonal-detector', error: 'Variance remained below the 20% threshold', triggeredDates: [] }],
    },
  },
  anomalies: [{ ...validAnomaly, summary: 'Daily cost increased by 20%', notes: ['The 20% change needs review'] }],
};

const withoutOwnershipEpoch = value => {
  const candidate = structuredClone(value);
  delete candidate.ownership.ownershipEpochRevision;
  delete candidate.revision.ownershipEpochRevision;
  return candidate;
};

// Cost-analysis metadata is not an analyzer transport/current-pointer contract. Its chart/anomaly
// compatibility matrix remains runtime-local while the five analyzer boundary validators above
// are executed exclusively from the portable corpus.
const billingValidatorCases = [
  ['metadata accepts its V2 fixture', isBillingCostAnalysisMetadataV2, costAnalysisMetadata, true],
  ['partial metadata accepts billing-bound partial evidence', isBillingCostAnalysisMetadataV2, partialCostAnalysisMetadata, true],
  ['metadata accepts human-readable percentage text', isBillingCostAnalysisMetadataV2, percentageBearingMetadata, true],
  ['metadata rejects an unknown schema version', isBillingCostAnalysisMetadataV2, { ...costAnalysisMetadata, schemaVersion: 3 }, false],
  ['complete-empty metadata accepts exact billing-history proof', isBillingCostAnalysisMetadataV2, completeEmptyMetadata, true],
  [
    'current metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'stale metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, artifactState: 'stale', artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'fallback metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, artifactState: 'fallback', artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'partial metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: { ...portalPluginPublicationDecision, evidence: 'partial', publication: 'partial' },
    },
    false,
  ],
  [
    'complete-empty metadata rejects portal/plugin evidence',
    isBillingCostAnalysisMetadataV2,
    { ...completeEmptyMetadata, artifactEvidence: portalPluginPublicationDecision },
    false,
  ],
  [
    'current metadata rejects a billing-history generation mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...costAnalysisMetadata,
      artifactEvidence: {
        ...publicationDecision,
        dependencies: [{ ...publicationDecision.dependencies[0], generationId: 'billing-generation-other' }],
      },
    },
    false,
  ],
  [
    'current metadata rejects a billing-history digest mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...costAnalysisMetadata,
      artifactEvidence: {
        ...publicationDecision,
        dependencies: [{ ...publicationDecision.dependencies[0], digest: digestB }],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a billing-history generation mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        dependencies: [
          { ...partialBillingPublicationDecision.dependencies[0], generationId: 'billing-generation-other' },
          partialBillingPublicationDecision.dependencies[1],
        ],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a billing-history digest mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        dependencies: [{ ...partialBillingPublicationDecision.dependencies[0], digest: digestB }, partialBillingPublicationDecision.dependencies[1]],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a wrong first dependency identity',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        dependencies: [
          { ...partialBillingPublicationDecision.dependencies[0], name: 'portal' },
          partialBillingPublicationDecision.dependencies[0],
          partialBillingPublicationDecision.dependencies[1],
        ],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a wrong first claim identity',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        claims: [{ ...partialBillingPublicationDecision.claims[0], claimId: 'coordinated-view-set' }, partialBillingPublicationDecision.claims[0]],
      },
    },
    false,
  ],
  [
    'partial metadata rejects a wrong first required dependency identity',
    isBillingCostAnalysisMetadataV2,
    {
      ...partialCostAnalysisMetadata,
      artifactEvidence: {
        ...partialBillingPublicationDecision,
        claims: [{ ...partialBillingPublicationDecision.claims[0], requiredDependencies: ['portal', 'billing-history'] }],
      },
    },
    false,
  ],
  [
    'complete-empty metadata rejects an unrelated optional empty dependency',
    isBillingCostAnalysisMetadataV2,
    {
      ...costAnalysisMetadata,
      artifactState: 'complete-empty',
      artifactEvidence: {
        ...publicationDecision,
        dependencies: [
          publicationDecision.dependencies[0],
          {
            ...publicationDecision.dependencies[0],
            name: 'unrelated-history',
            required: false,
            generationId: 'unrelated-generation',
            digest: digestB,
            emptyEvidence: 'complete-empty',
            acceptedRowCount: 0,
            emptyProofRef: 'subscriptions/sub-123/history/billing/proofs/unrelated-empty.json',
          },
        ],
      },
    },
    false,
  ],
  [
    'complete-empty metadata rejects a billing-history generation mismatch',
    isBillingCostAnalysisMetadataV2,
    {
      ...completeEmptyMetadata,
      artifactEvidence: {
        ...completeEmptyPublicationDecision,
        dependencies: [{ ...completeEmptyPublicationDecision.dependencies[0], generationId: 'billing-generation-other' }],
      },
    },
    false,
  ],
  [
    'complete-empty metadata rejects a non-zero chart point count',
    isBillingCostAnalysisMetadataV2,
    {
      ...completeEmptyMetadata,
      chartData: { ...completeEmptyMetadata.chartData, dataWindow: { ...completeEmptyMetadata.chartData.dataWindow, pointCount: 1 } },
    },
    false,
  ],
  [
    'complete-empty metadata rejects a populated chart view',
    isBillingCostAnalysisMetadataV2,
    { ...completeEmptyMetadata, chartData: { ...completeEmptyMetadata.chartData, views: { daily: populatedDailyView } } },
    false,
  ],
  [
    'complete-empty metadata rejects populated anomalies',
    isBillingCostAnalysisMetadataV2,
    { ...completeEmptyMetadata, anomalies: [validAnomaly] },
    false,
  ],
];

for (const [name, validator, value, expected] of billingValidatorCases) assert.equal(validator(value), expected, name);

const harmlessAdditiveControlData = {
  future: {
    itemCount: 2,
    reviewStatus: 'accepted',
    tokenCount: 3,
    authorizationStatus: 'granted',
    secretary: 'named-role',
    message: 'Cost review: accepted',
    timestamp: '2026-08-13T00:05:00.000Z',
    resourceId: '/subscriptions/sub-123/resourceGroups/rg-1/providers/Microsoft.Compute/virtualMachines/vm-1',
  },
};
const billingControlDataCases = [
  ['metadata accepts harmless additive fields', isBillingCostAnalysisMetadataV2, { ...costAnalysisMetadata, ...harmlessAdditiveControlData }, true],
  [
    'metadata rejects a nested exact credential key',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, future: { settings: { authorization: 'Bearer secret-example' } } },
    false,
  ],
  [
    'metadata rejects an additive physical reference field',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, future: { sourcePath: 'private/container/metadata.json' } },
    false,
  ],
  [
    'metadata rejects an additive physical reference value',
    isBillingCostAnalysisMetadataV2,
    { ...costAnalysisMetadata, future: { location: 'C:\\private\\metadata.json' } },
    false,
  ],
];
for (const [name, validator, value, expected] of billingControlDataCases) assert.equal(validator(value), expected, name);

const billingControlDocuments = [['cost metadata', isBillingCostAnalysisMetadataV2, costAnalysisMetadata]];
const forbiddenBillingControlData = [
  ['filePath field', { filePath: 'safe/relative.json' }],
  ['filesystemPath field', { filesystemPath: 'safe/relative.json' }],
  ['path field', { path: 'safe/relative.json' }],
  ['url field', { url: 'safe/relative.json' }],
  ['uri field', { uri: 'safe/relative.json' }],
  ['artifactPath field', { artifactPath: 'safe/relative.json' }],
  ['URI value', { location: 'https://storage.example.invalid/container/blob.json' }],
  ['single-slash file URI value', { location: 'file:/tmp/blob.json' }],
  ['opaque S3 URI value', { location: 's3:bucket/key' }],
  ['protocol-relative value', { location: '//storage.example/container/blob.json' }],
  ['UNC value', { location: '\\\\storage.example\\container\\blob.json' }],
  ['Windows-drive value', { location: 'C:\\private\\blob.json' }],
  ['POSIX absolute value', { location: '/tmp/blob.json' }],
  ['parent-traversal value', { location: 'safe/../blob.json' }],
  ['current-directory traversal value', { location: './blob.json' }],
  ['percent-encoded value', { location: 'safe/%2e%2e/blob.json' }],
  ['percent-encoded slash value', { location: 'safe%2Fprivate.json' }],
  ['percent-encoded backslash value', { location: 'safe%5cprivate.json' }],
  ['NUL value', { location: 'safe/blob\u0000.json' }],
  ['newline value', { location: 'safe/blob\n.json' }],
];
for (const [documentName, validator, document] of billingControlDocuments) {
  assert.equal(validator({ ...document, ...harmlessAdditiveControlData }), true, `${documentName} accepts exact harmless sensitive-name prefixes`);
  for (const [caseName, controlData] of forbiddenBillingControlData) {
    assert.equal(validator({ ...document, future: controlData }), false, `${documentName} rejects ${caseName}`);
  }
}

const invalidRevisionBoundaries = [
  ['zero source revision', { sourceRevision: 0 }],
  ['negative source revision', { sourceRevision: -1 }],
  ['zero policy revision', { policyRevision: 0 }],
  ['negative policy revision', { policyRevision: -1 }],
];
for (const [documentName, validator, document] of billingControlDocuments) {
  for (const [caseName, revisionMutation] of invalidRevisionBoundaries) {
    assert.equal(validator({ ...document, revision: { ...document.revision, ...revisionMutation } }), false, `${documentName} rejects ${caseName}`);
  }
}

const ownershipValidatorCases = [
  ['ownership accepts observe-only absent epoch', isArtifactOwnershipBinding, withoutOwnershipEpoch({ ownership, revision }).ownership, true],
  ['ownership rejects zero epoch', isArtifactOwnershipBinding, { ...ownership, ownershipEpochRevision: 0 }, false],
  ['enforceable ownership accepts positive epoch', isEnforceableArtifactOwnershipBinding, ownership, true],
  [
    'enforceable ownership rejects absent epoch',
    isEnforceableArtifactOwnershipBinding,
    withoutOwnershipEpoch({ ownership, revision }).ownership,
    false,
  ],
];
for (const [name, validator, value, expected] of ownershipValidatorCases) assert.equal(validator(value), expected, name);

process.stdout.write(
  `Artifact evidence contract checks passed: corpus v${contractCorpus.corpusVersion}, ${contractCorpus.cases.length} corpus cases, ` +
    `${mutationCount} mutations, ` +
    `${contractCorpus.revisionComparisons.length} revision comparisons, ${billingValidatorCases.length} billing checks, ` +
    `${billingControlDataCases.length} control-data checks, ${ownershipValidatorCases.length} ownership checks, ` +
    `${mutationFailureCases.length} mutation fail-fast checks, ${contractCorpus.digestVectors.length} digest vectors, ` +
    `${contractCorpus.digestMismatchVectors.length} digest mismatch vectors, ` +
    `${contractCorpus.observationDigestVectors.length} observation digest vectors.\n` +
    `Portable validator set: ${[...corpusValidatorNames].sort().join(', ')}\n` +
    `Artifact evidence corpus SHA-256: ${corpusDigest}\n`
);
