import assert from 'node:assert/strict';
import {
  ACTIVITY_LOG_ANALYSIS_VERSION,
  ACTIVITY_LOG_TAXONOMY_VERSION,
  CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1,
  CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION,
  PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1,
  PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION,
  assertPortalActivityAnalysisResponse,
  isPortalActivityAnalysisGroupId,
  isPortalActivityAnalysisResponse,
  isPortalActivityEvidenceId,
  isPortalActivityLogClassification,
  isConformedActivityAnalysisArtifact,
} from '../dist/index.js';

const EVIDENCE_ID = `aev1_${'1'.repeat(64)}`;
const SERIES_ID = `aag1_${'2'.repeat(64)}`;
const OPERATION_GROUP_ID = `aag1_${'3'.repeat(64)}`;
const SECURITY_GROUP_ID = `aag1_${'4'.repeat(64)}`;
const POWER_GROUP_ID = `aag1_${'5'.repeat(64)}`;
const RESOURCE_ID = '/subscriptions/sub-a/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-a';
const TIMESTAMP = '2026-09-01T08:00:00.000Z';

const scope = () => ({ subscriptionId: 'sub-a', level: 'resource', resourceId: RESOURCE_ID });
const validClassification = () => ({
  taxonomyVersion: ACTIVITY_LOG_TAXONOMY_VERSION,
  executionOrigin: 'manual',
  operationEffect: 'action',
  scope: scope(),
  tags: [
    { tagId: 'actor.manual', dimension: 'actor', confidence: 'high' },
    { tagId: 'scheduler.power-operation', dimension: 'scheduler', confidence: 'medium' },
  ],
});
const validResponse = () => ({
  schemaVersion: PORTAL_ACTIVITY_ANALYSIS_RESPONSE_SCHEMA_VERSION,
  generatedAt: '2026-09-02T05:00:00.000Z',
  subscriptionId: 'sub-a',
  fromMonth: '2026-08',
  toMonth: '2026-09',
  requestedMonths: ['2026-08', '2026-09'],
  availableMonths: ['2026-08', '2026-09'],
  missingMonths: [],
  partialMonths: [],
  staleMonths: [],
  freshnessUnknownMonths: [],
  analysisVersions: [ACTIVITY_LOG_ANALYSIS_VERSION],
  taxonomyVersions: [ACTIVITY_LOG_TAXONOMY_VERSION],
  facets: {
    tags: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'actor.manual', count: 2 }] },
    operations: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'start/action', count: 2 }] },
    providers: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'microsoft.compute', count: 2 }] },
    resourceTypes: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'virtualmachines', count: 2 }] },
    results: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'succeeded', count: 2 }] },
    operationEffects: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'action', count: 2 }] },
    executionOrigins: { totalCount: 1, returnedCount: 1, truncated: false, items: [{ value: 'manual', count: 2 }] },
  },
  activitySeries: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        seriesId: SERIES_ID,
        scope: scope(),
        operation: 'start/action',
        result: 'succeeded',
        executionOrigin: 'manual',
        operationEffect: 'action',
        tagIds: ['actor.manual', 'scheduler.power-operation'],
        eventCount: 2,
        firstTimestamp: TIMESTAMP,
        lastTimestamp: '2026-09-01T17:00:00.000Z',
        monthCounts: [{ value: '2026-09', count: 2 }],
        dailyCounts: [{ date: '2026-09-01', count: 2 }],
        utcWeekdayHourDistribution: [
          { weekday: 2, hour: 8, count: 1 },
          { weekday: 2, hour: 17, count: 1 },
        ],
        confidence: 'high',
        evidenceIds: [EVIDENCE_ID],
        evidenceTruncated: false,
      },
    ],
  },
  resources: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        scope: scope(),
        eventCount: 2,
        firstTimestamp: TIMESTAMP,
        lastTimestamp: '2026-09-01T17:00:00.000Z',
        operationCounts: [{ value: 'start/action', count: 2 }],
        resultCounts: [{ value: 'succeeded', count: 2 }],
        tagCounts: [{ value: 'actor.manual', count: 2 }],
        executionOriginCounts: [{ value: 'manual', count: 2 }],
        relatedGroupIds: [OPERATION_GROUP_ID],
        confidence: 'high',
      },
    ],
  },
  operationSummaries: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        groupId: OPERATION_GROUP_ID,
        derivedType: 'operationSummary',
        scope: scope(),
        eventCount: 2,
        firstTimestamp: TIMESTAMP,
        lastTimestamp: '2026-09-01T17:00:00.000Z',
        confidence: 'high',
        tagIds: ['actor.manual'],
        reasons: ['derived.operation-summary'],
        evidenceIds: [EVIDENCE_ID],
        evidenceTruncated: false,
        operation: 'start/action',
        provider: 'microsoft.compute',
        resourceType: 'virtualmachines',
        operationEffect: 'action',
        executionOrigin: 'manual',
        distinctResourceCount: 1,
        resultCounts: [{ value: 'succeeded', count: 2 }],
      },
    ],
  },
  securitySensitive: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        groupId: SECURITY_GROUP_ID,
        derivedType: 'securitySensitiveActivity',
        scope: scope(),
        eventCount: 1,
        firstTimestamp: TIMESTAMP,
        lastTimestamp: TIMESTAMP,
        confidence: 'high',
        tagIds: ['security.remote-execution'],
        reasons: ['derived.security-sensitive-activity'],
        evidenceIds: [EVIDENCE_ID],
        evidenceTruncated: false,
        capabilityTag: 'security.remote-execution',
        operation: 'runcommand/action',
        executionOrigin: 'manual',
        resultCounts: [{ value: 'succeeded', count: 1 }],
      },
    ],
  },
  powerPatterns: {
    totalCount: 1,
    returnedCount: 1,
    truncated: false,
    items: [
      {
        patternId: POWER_GROUP_ID,
        derivedType: 'powerPatternEvidence',
        scope: scope(),
        eventCount: 2,
        firstTimestamp: TIMESTAMP,
        lastTimestamp: '2026-09-01T17:00:00.000Z',
        confidence: 'high',
        tagIds: ['scheduler.power-operation'],
        reasons: ['derived.power-pattern-evidence'],
        evidenceIds: [EVIDENCE_ID],
        evidenceTruncated: false,
        startCount: 1,
        stopCount: 1,
        opposingPairCount: 1,
        utcActiveDayCount: 1,
        utcHourDistribution: [
          { hour: 8, count: 1 },
          { hour: 17, count: 1 },
        ],
        executionOriginCounts: [{ value: 'manual', count: 2 }],
        resultCounts: [{ value: 'succeeded', count: 2 }],
        dataSufficiency: 'oneOff',
      },
    ],
  },
  limitations: [],
});

const validConformedPowerArtifact = () => ({
  schemaVersion: CONFORMED_ACTIVITY_ANALYSIS_SCHEMA_VERSION,
  analysisVersion: ACTIVITY_LOG_ANALYSIS_VERSION,
  taxonomyVersion: ACTIVITY_LOG_TAXONOMY_VERSION,
  projection: 'activity-analysis',
  subscriptionId: 'sub-a',
  month: '2026-09',
  generatedAt: '2026-10-01T00:00:00.000Z',
  source: {
    portalProjectionSchemaVersion: 1,
    retainedEventCount: 2,
    classifiedRetainedEventCount: 2,
    unclassifiedRetainedEventCount: 0,
    classificationState: 'complete',
  },
  facets: {
    tags: [{ value: 'scheduler.power-operation', count: 2 }],
    operations: [{ value: 'power/action', count: 2 }],
    providers: [{ value: 'microsoft.compute', count: 2 }],
    resourceTypes: [{ value: 'virtualmachines', count: 2 }],
    results: [{ value: 'succeeded', count: 2 }],
    operationEffects: [{ value: 'action', count: 2 }],
    executionOrigins: [{ value: 'manual', count: 2 }],
  },
  activitySeries: [
    {
      id: 'internal-series-id',
      analysisVersion: ACTIVITY_LOG_ANALYSIS_VERSION,
      taxonomyVersion: ACTIVITY_LOG_TAXONOMY_VERSION,
      subscriptionId: 'sub-a',
      month: '2026-09',
      scope: scope(),
      operation: 'power/action',
      result: 'succeeded',
      executionOrigin: 'manual',
      operationEffect: 'action',
      tagIds: ['scheduler.power-operation'],
      eventCount: 2,
      firstTimestamp: TIMESTAMP,
      lastTimestamp: '2026-09-01T17:00:00.000Z',
      dailyCounts: [{ date: '2026-09-01', count: 2 }],
      utcWeekdayHourDistribution: [
        { weekday: 2, hour: 8, count: 1 },
        { weekday: 2, hour: 17, count: 1 },
      ],
      distinctActorCount: 1,
      confidence: 'high',
      evidenceEventKeys: ['event-a', 'event-b'],
      evidenceTruncated: false,
    },
  ],
  resources: [],
  groups: [
    {
      id: 'internal-power-group-id',
      type: 'power-pattern-evidence',
      analysisVersion: ACTIVITY_LOG_ANALYSIS_VERSION,
      taxonomyVersion: ACTIVITY_LOG_TAXONOMY_VERSION,
      subscriptionId: 'sub-a',
      month: '2026-09',
      scope: scope(),
      eventCount: 2,
      firstTimestamp: TIMESTAMP,
      lastTimestamp: '2026-09-01T17:00:00.000Z',
      confidence: 'high',
      reasons: ['derived.power-pattern-evidence'],
      tagIds: ['scheduler.power-operation'],
      evidenceEventKeys: ['event-a', 'event-b'],
      evidenceTruncated: false,
      patternId: 'internal-power-pattern-id',
      resourceId: RESOURCE_ID,
      startCount: 1,
      stopCount: 1,
      opposingPairCount: 1,
      utcActiveDayCount: 1,
      utcHourDistribution: { 8: 1, 17: 1 },
      executionOriginCounts: { manual: 2 },
      resultCounts: { succeeded: 2 },
      dataSufficiency: 'oneOff',
    },
  ],
});

const clone = value => structuredClone(value);
const rejectMutation = (label, mutate) => {
  const candidate = validResponse();
  mutate(candidate);
  assert.equal(isPortalActivityAnalysisResponse(candidate), false, label);
};
const rejectConformedMutation = (label, mutate) => {
  const candidate = validConformedPowerArtifact();
  mutate(candidate);
  assert.equal(isConformedActivityAnalysisArtifact(candidate), false, label);
};

assert.equal(Object.isFrozen(PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1), true);
assert.equal(Object.isFrozen(CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1), true);
assert.equal(PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.activitySeries, 10_000);
assert.equal(PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.responseUtf8Bytes, 32 * 1024 * 1024);
assert.equal(isPortalActivityEvidenceId(EVIDENCE_ID), true);
assert.equal(isPortalActivityAnalysisGroupId(SERIES_ID), true);
const classification = validClassification();
const classificationBefore = JSON.stringify(classification);
assert.equal(isPortalActivityLogClassification(classification), true, 'accepts an exact additive Activity Log classification');
assert.equal(JSON.stringify(classification), classificationBefore, 'classification validation does not mutate input');
const caseInsensitiveScope = validClassification();
caseInsensitiveScope.scope.resourceId = RESOURCE_ID.replace('/sub-a/', '/SUB-A/');
assert.equal(isPortalActivityLogClassification(caseInsensitiveScope), true, 'matches the ARM subscription segment case-insensitively');
for (const [label, mutate] of [
  ['tag overflow', value => (value.tags = Array(33).fill(value.tags[0]))],
  ['unsorted tags', value => value.tags.reverse()],
  ['duplicate tags', value => value.tags.push(value.tags[0])],
  ['wrong tag dimension', value => (value.tags[0].dimension = 'security')],
  ['unknown field', value => (value.ruleId = 'internal-rule')],
  ['mixed ARM scope', value => (value.scope.resourceId = RESOURCE_ID.replace('/sub-a/', '/sub-b/'))],
]) {
  const candidate = validClassification();
  mutate(candidate);
  assert.equal(isPortalActivityLogClassification(candidate), false, `rejects classification ${label}`);
}
for (const unsafeId of [`aev1_${'A'.repeat(64)}`, `aev1_${'1'.repeat(63)}`, `aev2_${'1'.repeat(64)}`, `aev1_${'g'.repeat(64)}`]) {
  assert.equal(isPortalActivityEvidenceId(unsafeId), false, `rejects unsafe evidence ID ${unsafeId.slice(0, 8)}`);
}
assert.equal(isPortalActivityAnalysisGroupId(`aag1_${'2'.repeat(65)}`), false);

const response = validResponse();
const before = JSON.stringify(response);
assert.equal(isPortalActivityAnalysisResponse(response), true, 'accepts the complete safe public response');
assert.doesNotThrow(() => assertPortalActivityAnalysisResponse(response));
assert.equal(JSON.stringify(response), before, 'validation does not mutate the response');
assert.equal(isConformedActivityAnalysisArtifact(validConformedPowerArtifact()), true, 'accepts a truthful conformed power pattern');
const completeMonthFingerprint = validConformedPowerArtifact();
completeMonthFingerprint.source.sourceShardFingerprint = 'x'.repeat(8_309);
assert.equal(isConformedActivityAnalysisArtifact(completeMonthFingerprint), true, 'accepts a bounded complete-month source shard fingerprint');
completeMonthFingerprint.source.sourceShardFingerprint = 'x'.repeat(CONFORMED_ACTIVITY_ANALYSIS_LIMITS_V1.sourceShardFingerprintCodeUnits + 1);
assert.equal(isConformedActivityAnalysisArtifact(completeMonthFingerprint), false, 'rejects a source shard fingerprint beyond the conformed limit');

rejectConformedMutation('requires conformed power-pattern resource scope', value => {
  value.groups[0].scope = { subscriptionId: 'sub-a', level: 'subscription' };
});
rejectConformedMutation('binds conformed power-pattern resourceId to scope.resourceId', value => {
  value.groups[0].resourceId = `${RESOURCE_ID}-other`;
});
rejectConformedMutation('binds conformed power operation totals to eventCount', value => {
  value.groups[0].startCount = 2;
});
rejectConformedMutation('binds conformed power hour totals to eventCount', value => {
  value.groups[0].utcHourDistribution = { 8: 1 };
});
rejectConformedMutation('binds conformed power origin totals to eventCount', value => {
  value.groups[0].executionOriginCounts = { manual: 1 };
});
rejectConformedMutation('binds conformed power result totals to eventCount', value => {
  value.groups[0].resultCounts = { succeeded: 1 };
});
const invalidOperationDistinctCount = validConformedPowerArtifact();
invalidOperationDistinctCount.groups = [
  {
    id: 'internal-operation-group-id',
    type: 'operation-summary',
    analysisVersion: ACTIVITY_LOG_ANALYSIS_VERSION,
    taxonomyVersion: ACTIVITY_LOG_TAXONOMY_VERSION,
    subscriptionId: 'sub-a',
    month: '2026-09',
    scope: { subscriptionId: 'sub-a', level: 'subscription' },
    eventCount: 2,
    firstTimestamp: TIMESTAMP,
    lastTimestamp: '2026-09-01T17:00:00.000Z',
    confidence: 'high',
    reasons: ['derived.operation-summary'],
    tagIds: ['scheduler.power-operation'],
    evidenceEventKeys: ['event-a', 'event-b'],
    evidenceTruncated: false,
    operation: 'power/action',
    provider: 'microsoft.compute',
    resourceType: 'virtualmachines',
    operationEffect: 'action',
    executionOrigin: 'manual',
    distinctResourceCount: 3,
    resultCounts: { succeeded: 2 },
  },
];
assert.equal(
  isConformedActivityAnalysisArtifact(invalidOperationDistinctCount),
  false,
  'binds conformed operation distinct-resource count to eventCount'
);
rejectConformedMutation('binds conformed ARM resource scope to its declared subscription', value => {
  const otherResourceId = RESOURCE_ID.replace('/sub-a/', '/sub-b/');
  value.groups[0].scope.resourceId = otherResourceId;
  value.groups[0].resourceId = otherResourceId;
});

const independentlyTruncated = validResponse();
independentlyTruncated.activitySeries = { totalCount: 2, returnedCount: 1, truncated: true, items: independentlyTruncated.activitySeries.items };
independentlyTruncated.limitations = ['response-truncated'];
assert.equal(isPortalActivityAnalysisResponse(independentlyTruncated), true, 'one public collection can truncate independently');
assert.equal(independentlyTruncated.resources.truncated, false);

const nestedValuesTruncated = validResponse();
nestedValuesTruncated.limitations = ['nested-values-truncated', 'response-truncated'];
assert.equal(isPortalActivityAnalysisResponse(nestedValuesTruncated), true, 'accepts disclosed nested-value truncation without outer truncation');

const conformedEvidenceTruncated = validResponse();
conformedEvidenceTruncated.activitySeries.items[0].evidenceTruncated = true;
assert.equal(
  isPortalActivityAnalysisResponse(conformedEvidenceTruncated),
  true,
  'does not reinterpret conformed evidence truncation as API response truncation'
);

rejectMutation('requires response-truncated with nested-values-truncated', value => {
  value.limitations = ['nested-values-truncated'];
});
rejectMutation('rejects response-truncated without any truncation source', value => {
  value.limitations = ['response-truncated'];
});

rejectMutation('rejects wrong returned count', value => {
  value.activitySeries.returnedCount = 2;
});
rejectMutation('rejects wrong nested event total', value => {
  value.resources.items[0].operationCounts[0].count = 1;
});
rejectMutation('rejects dishonest truncation', value => {
  value.resources.truncated = true;
});
rejectMutation('rejects collection overflow', value => {
  value.activitySeries.items = Array(PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.activitySeries + 1).fill(value.activitySeries.items[0]);
  value.activitySeries.returnedCount = value.activitySeries.items.length;
  value.activitySeries.totalCount = value.activitySeries.items.length;
});
rejectMutation('rejects unknown public fields', value => {
  value.activitySeries.items[0].unknown = true;
});
rejectMutation('rejects conformed-only distinct actor counts', value => {
  value.activitySeries.items[0].distinctActorCount = 1;
});
rejectMutation('rejects multi-subscription endpoint scope', value => {
  value.subscriptionIds = ['sub-a'];
});
rejectMutation('rejects sensitive evidence keys', value => {
  value.operationSummaries.items[0].evidenceEventKeys = ['internal-event-key'];
});
for (const sensitiveField of [
  'sourceShardFingerprint',
  'actor',
  'actorRaw',
  'actorId',
  'caller',
  'blobPath',
  'description',
  'claims',
  'requestPayload',
  'responsePayload',
  'ruleId',
  'internalGroupId',
]) {
  rejectMutation(`rejects sensitive field ${sensitiveField}`, value => {
    value.securitySensitive.items[0][sensitiveField] = 'forbidden';
  });
}
rejectMutation('rejects prototype fields', value => {
  Object.defineProperty(value.resources.items[0], 'constructor', { value: 'forbidden', enumerable: true });
});
assert.equal(isPortalActivityAnalysisResponse(Object.assign(Object.create({ polluted: true }), validResponse())), false);
rejectMutation('rejects an unsafe public group ID', value => {
  value.powerPatterns.items[0].patternId = 'internal-group-id';
});
rejectMutation('rejects a non-canonical month', value => {
  value.requestedMonths[0] = '2026-8';
});
rejectMutation('rejects a non-canonical timestamp', value => {
  value.generatedAt = '2026-09-02T05:00:00Z';
});
rejectMutation('rejects mixed subscription scope', value => {
  value.securitySensitive.items[0].scope.subscriptionId = 'sub-b';
});
rejectMutation('rejects resource-filter scope mismatch', value => {
  value.resourceId = '/subscriptions/sub-a/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-b';
});
rejectMutation('rejects resource scope without an ARM subscription segment', value => {
  value.resources.items[0].scope.resourceId = 'vm-a';
});
rejectMutation('rejects resource scope for a different ARM subscription', value => {
  value.resources.items[0].scope.resourceId = RESOURCE_ID.replace('/sub-a/', '/sub-b/');
});
rejectMutation('does not coerce count strings', value => {
  value.resources.items[0].eventCount = '2';
});
rejectMutation('rejects unsorted ranked items', value => {
  const lowerRanked = clone(value.operationSummaries.items[0]);
  lowerRanked.groupId = `aag1_${'3'.repeat(64)}`;
  lowerRanked.eventCount = 1;
  lowerRanked.resultCounts = [{ value: 'succeeded', count: 1 }];
  value.operationSummaries.items.unshift(lowerRanked);
  value.operationSummaries.returnedCount = 2;
  value.operationSummaries.totalCount = 2;
});
rejectMutation('requires response-truncated limitation when a collection is truncated', value => {
  value.resources.totalCount = 2;
  value.resources.truncated = true;
});
rejectMutation('rejects duplicate months', value => {
  value.requestedMonths = ['2026-08', '2026-08'];
});
rejectMutation('rejects incomplete requested-month coverage', value => {
  value.availableMonths = ['2026-08'];
});
rejectMutation('rejects series month counts from a missing month', value => {
  value.availableMonths = ['2026-08'];
  value.missingMonths = ['2026-09'];
  value.limitations = ['month-missing'];
  value.activitySeries.items[0].firstTimestamp = '2026-08-01T08:00:00.000Z';
  value.activitySeries.items[0].lastTimestamp = '2026-08-01T17:00:00.000Z';
  value.activitySeries.items[0].dailyCounts = [{ date: '2026-08-01', count: 2 }];
});
rejectMutation('rejects series daily counts from a missing month', value => {
  value.availableMonths = ['2026-08'];
  value.missingMonths = ['2026-09'];
  value.limitations = ['month-missing'];
  value.activitySeries.items[0].monthCounts = [{ value: '2026-08', count: 2 }];
  value.activitySeries.items[0].firstTimestamp = '2026-08-01T08:00:00.000Z';
  value.activitySeries.items[0].lastTimestamp = '2026-08-01T17:00:00.000Z';
});
rejectMutation('rejects duplicate values within one facet', value => {
  value.facets.tags.items = [
    { value: 'actor.manual', count: 2 },
    { value: 'actor.manual', count: 1 },
  ];
  value.facets.tags.totalCount = 2;
  value.facets.tags.returnedCount = 2;
});
rejectMutation('rejects a public ID reused across collections', value => {
  value.securitySensitive.items[0].groupId = value.operationSummaries.items[0].groupId;
});

const freshnessUnknown = validResponse();
freshnessUnknown.freshnessUnknownMonths = ['2026-09'];
freshnessUnknown.limitations = ['month-freshness-unknown'];
assert.equal(isPortalActivityAnalysisResponse(freshnessUnknown), true, 'accepts honest unknown freshness');
rejectMutation('rejects freshness-unknown and stale overlap', value => {
  value.staleMonths = ['2026-09'];
  value.freshnessUnknownMonths = ['2026-09'];
  value.limitations = ['month-freshness-unknown', 'month-stale'];
});

const oversized = validResponse();
const largeOperation = '🧠'.repeat(PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.operationCodeUnits / 2);
const largeResourceName = '🧠'.repeat(PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceNameCodeUnits / 2);
const makeGroupId = index => `aag1_${index.toString(16).padStart(64, '0')}`;
const makeEvidenceId = index => `aev1_${index.toString(16).padStart(64, '0')}`;
oversized.activitySeries.items = Array.from({ length: PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.activitySeries }, (_, index) => ({
  ...clone(oversized.activitySeries.items[0]),
  seriesId: makeGroupId(index + 10_000),
  operation: largeOperation,
  evidenceIds: [makeEvidenceId(index + 1)],
}));
oversized.activitySeries.totalCount = oversized.activitySeries.items.length;
oversized.activitySeries.returnedCount = oversized.activitySeries.items.length;
oversized.resources.items = Array.from({ length: PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.resourceSummaries }, (_, index) => ({
  ...clone(oversized.resources.items[0]),
  scope: {
    ...scope(),
    resourceId: `${RESOURCE_ID}/${index.toString().padStart(8, '0')}`,
    resourceName: `${index.toString().padStart(8, '0')}${largeResourceName.slice(8)}`,
  },
  relatedGroupIds: [makeGroupId(index + 1)],
}));
oversized.resources.totalCount = oversized.resources.items.length;
oversized.resources.returnedCount = oversized.resources.items.length;
assert.ok(Buffer.byteLength(JSON.stringify(oversized), 'utf8') > PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1.responseUtf8Bytes);
assert.equal(isPortalActivityAnalysisResponse(oversized), false, 'rejects more than 32 MiB measured as UTF-8 bytes');

const esm = await import('../dist/esm/entries/root.js');
assert.equal(esm.isPortalActivityEvidenceId(EVIDENCE_ID), true);
assert.equal(esm.isPortalActivityLogClassification(validClassification()), true);
assert.equal(esm.isPortalActivityAnalysisResponse(validResponse()), true);
assert.deepEqual(esm.PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1, PORTAL_ACTIVITY_ANALYSIS_LIMITS_V1);
