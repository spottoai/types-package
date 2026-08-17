import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  BILLING_ARTIFACT_OBJECT_LIMITS_V1,
  buildBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerInputManifestV2,
  isBillingAnalyzerInputObservationPointerPath,
  isBillingAnalyzerOutputManifestV2,
} from '../dist/index.js';

const expectedObjectLimitsV1 = {
  pointerStoredBytes: 65_536,
  observationStoredBytes: 65_536,
  manifestStoredBytes: 1_048_576,
  metadataStoredBytes: 4_194_304,
  metadataDecodedBytes: 16_777_216,
  plotStoredBytes: 33_554_432,
  plotDecodedBytes: 134_217_728,
  inputObjectStoredBytes: 33_554_432,
  inputObjectDecodedBytes: 134_217_728,
  maxInputObjects: 12,
};

assert.deepEqual(BILLING_ARTIFACT_OBJECT_LIMITS_V1, expectedObjectLimitsV1, 'billing object limits preserve exact V1 byte semantics');
assert.equal(Object.isFrozen(BILLING_ARTIFACT_OBJECT_LIMITS_V1), true, 'billing object limits are frozen');
assert.equal(
  BILLING_ANALYZER_INPUT_OBSERVATION_POINTER_RELATIVE_PATH,
  'history/billing/analyzer-inputs/latest-enqueued.json',
  'diagnostic observation discovery suffix remains exact'
);
assert.equal(
  buildBillingAnalyzerInputObservationPointerPath('sub-123'),
  'subscriptions/sub-123/history/billing/analyzer-inputs/latest-enqueued.json',
  'diagnostic observation discovery path binds the safe subscription segment'
);
assert.equal(
  isBillingAnalyzerInputObservationPointerPath('subscriptions/sub-123/history/billing/analyzer-inputs/latest-enqueued.json'),
  true,
  'diagnostic observation discovery path validator accepts the exact safe logical path'
);
for (const invalidObservationPath of [
  'subscriptions/../history/billing/analyzer-inputs/latest-enqueued.json',
  'subscriptions/sub%2Fother/history/billing/analyzer-inputs/latest-enqueued.json',
  'subscriptions/sub-123/history/billing/analyzer-inputs/current.json',
  '/subscriptions/sub-123/history/billing/analyzer-inputs/latest-enqueued.json',
]) {
  assert.equal(
    isBillingAnalyzerInputObservationPointerPath(invalidObservationPath),
    false,
    `reject unsafe diagnostic discovery path: ${invalidObservationPath}`
  );
}
assert.throws(
  () => buildBillingAnalyzerInputObservationPointerPath('../'),
  /safe path segment/,
  'diagnostic observation discovery builder rejects unsafe subscription segments'
);

const corpus = JSON.parse(await readFile(new URL('../fixtures/artifact-evidence-contract-corpus.json', import.meta.url), 'utf8'));
const boundedInputManifest = structuredClone(corpus.fixtures.billingAnalyzerInputManifestV2);
boundedInputManifest.inputs = Array.from({ length: 12 }, (_, index) => ({
  ...boundedInputManifest.inputs[0],
  path: `subscriptions/sub-123/history/billing/analyzer-inputs/generations/billing-input-generation-42/months/month-${index}.json.gz`,
  sha256: index.toString(16).padStart(64, '0'),
  byteCount: expectedObjectLimitsV1.inputObjectStoredBytes,
}));
assert.equal(isBillingAnalyzerInputManifestV2(boundedInputManifest), true, 'input manifest accepts exactly twelve bounded stored objects');
assert.equal(
  isBillingAnalyzerInputManifestV2({
    ...boundedInputManifest,
    inputs: [
      ...boundedInputManifest.inputs,
      { ...boundedInputManifest.inputs[0], path: boundedInputManifest.inputs[0].path.replace('month-0', 'month-12') },
    ],
  }),
  false,
  'input manifest rejects a thirteenth object before consumers perform I/O'
);
assert.equal(
  isBillingAnalyzerInputManifestV2({
    ...boundedInputManifest,
    inputs: [{ ...boundedInputManifest.inputs[0], byteCount: expectedObjectLimitsV1.inputObjectStoredBytes + 1 }],
  }),
  false,
  'input manifest rejects a stored input descriptor one byte above the V1 limit'
);

const boundedOutputManifest = structuredClone(corpus.fixtures.billingAnalyzerOutputManifestV2);
boundedOutputManifest.artifacts[0].byteLength = expectedObjectLimitsV1.metadataStoredBytes;
boundedOutputManifest.artifacts.push({
  path: 'subscriptions/sub-123/billing/generations/billing-input-generation-42/plots/daily.json.gz',
  name: 'daily.json.gz',
  mediaType: 'application/json',
  contentEncoding: 'gzip',
  byteLength: expectedObjectLimitsV1.plotStoredBytes,
  sha256: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
});
assert.equal(
  isBillingAnalyzerOutputManifestV2(boundedOutputManifest),
  true,
  'output manifest accepts one metadata root and a bounded plot descriptor'
);
assert.equal(
  isBillingAnalyzerOutputManifestV2({
    ...boundedOutputManifest,
    artifacts: [{ ...boundedOutputManifest.artifacts[0], byteLength: expectedObjectLimitsV1.metadataStoredBytes + 1 }],
  }),
  false,
  'output manifest rejects metadata one stored byte above the V1 limit'
);
assert.equal(
  isBillingAnalyzerOutputManifestV2({
    ...boundedOutputManifest,
    artifacts: [
      boundedOutputManifest.artifacts[0],
      { ...boundedOutputManifest.artifacts[1], byteLength: expectedObjectLimitsV1.plotStoredBytes + 1 },
    ],
  }),
  false,
  'output manifest rejects a plot one stored byte above the V1 limit'
);
assert.equal(
  isBillingAnalyzerOutputManifestV2({ ...boundedOutputManifest, artifacts: [boundedOutputManifest.artifacts[1]] }),
  false,
  'output manifest requires exactly one root metadata descriptor'
);
assert.equal(
  isBillingAnalyzerOutputManifestV2({
    ...boundedOutputManifest,
    artifacts: [
      boundedOutputManifest.artifacts[0],
      { ...boundedOutputManifest.artifacts[0], sha256: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' },
    ],
  }),
  false,
  'output manifest rejects duplicate metadata descriptors'
);
assert.equal(
  isBillingAnalyzerOutputManifestV2({
    ...boundedOutputManifest,
    artifacts: [
      boundedOutputManifest.artifacts[0],
      { ...boundedOutputManifest.artifacts[1], path: 'subscriptions/sub-123/billing/generations/billing-input-generation-42/daily.json.gz' },
    ],
  }),
  false,
  'output manifest confines non-metadata descriptors to plots/name'
);
